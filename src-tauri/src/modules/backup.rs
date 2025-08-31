use std::fs;
use std::io::{Write, Read, Cursor};
use serde::{Serialize, Deserialize};
use crate::modules::settings::{load_app_settings, save_app_settings, AppSettings};
use crate::modules::utils::get_app_data_dir;
use zip::{ZipWriter, ZipArchive, write::FileOptions};
use serde_json::Value;

#[derive(Serialize, Deserialize)]
struct BackupMetadata {
    settings: AppSettings,
    scheduler_config: Option<Value>, // Scheduler configuration as raw JSON
    collections_data: Option<Value>, // Collections data from frontend storage
    wallpaper_files: Vec<String>, // List of wallpaper filenames in the ZIP
    version: String,
    created_at: String,
}

#[tauri::command]
pub async fn export_backup(collections_data: Option<String>) -> Result<Vec<u8>, String> {
    let app_settings = load_app_settings();
    let app_dir = get_app_data_dir()?;
    let wallpapers_dir = app_dir.join("wallpapers");
    
    // Create ZIP in memory
    let mut zip_buffer = Vec::new();
    {
        let cursor = Cursor::new(&mut zip_buffer);
        let mut zip = ZipWriter::new(cursor);
        let options = FileOptions::default()
            .compression_method(zip::CompressionMethod::Stored)
            .unix_permissions(0o755);
        
        // Collect wallpaper filenames
        let mut wallpaper_files = Vec::new();
        
        if wallpapers_dir.exists() {
            let entries = fs::read_dir(&wallpapers_dir)
                .map_err(|e| format!("Failed to read wallpapers directory: {}", e))?;
                
            for entry in entries {
                let entry = entry.map_err(|e| format!("Failed to read directory entry: {}", e))?;
                let path = entry.path();
                
                if path.is_file() {
                    if let Some(filename) = path.file_name().and_then(|n| n.to_str()) {
                        // Add image to ZIP
                        let zip_path = format!("wallpapers/{}", filename);
                        zip.start_file(&zip_path, options)
                            .map_err(|e| format!("Failed to start ZIP file: {}", e))?;
                        
                        let file_data = fs::read(&path)
                            .map_err(|e| format!("Failed to read wallpaper {}: {}", filename, e))?;
                        
                        zip.write_all(&file_data)
                            .map_err(|e| format!("Failed to write to ZIP: {}", e))?;
                        
                        wallpaper_files.push(filename.to_string());
                    }
                }
            }
        }
        
        // Load scheduler config if it exists
        let scheduler_config = {
            let scheduler_config_path = app_dir.join("scheduler_config.json");
            if scheduler_config_path.exists() {
                fs::read_to_string(scheduler_config_path)
                    .ok()
                    .and_then(|content| serde_json::from_str::<Value>(&content).ok())
            } else {
                None
            }
        };

        // Parse collections data if provided
        let parsed_collections_data = collections_data
            .and_then(|data| serde_json::from_str::<Value>(&data).ok());

        // Create metadata
        let metadata = BackupMetadata {
            settings: app_settings,
            scheduler_config,
            collections_data: parsed_collections_data,
            wallpaper_files,
            version: "2.1".to_string(), // Updated version for complete backup
            created_at: chrono::Utc::now().to_rfc3339(),
        };
        
        // Add metadata JSON to ZIP
        let metadata_json = serde_json::to_string_pretty(&metadata)
            .map_err(|e| format!("Failed to serialize metadata: {}", e))?;
        
        zip.start_file("backup.json", options)
            .map_err(|e| format!("Failed to start metadata file: {}", e))?;
        
        zip.write_all(metadata_json.as_bytes())
            .map_err(|e| format!("Failed to write metadata: {}", e))?;
        
        zip.finish()
            .map_err(|e| format!("Failed to finish ZIP: {}", e))?;
    }
    
    Ok(zip_buffer)
}

#[tauri::command]
pub async fn import_backup(zip_data: Vec<u8>) -> Result<String, String> {
    let cursor = Cursor::new(zip_data);
    let mut archive = ZipArchive::new(cursor)
        .map_err(|e| format!("Invalid ZIP file: {}", e))?;
    
    // Read metadata first
    let mut metadata_file = archive.by_name("backup.json")
        .map_err(|e| format!("Backup metadata not found: {}", e))?;
    
    let mut metadata_content = String::new();
    metadata_file.read_to_string(&mut metadata_content)
        .map_err(|e| format!("Failed to read metadata: {}", e))?;
    
    let metadata: BackupMetadata = serde_json::from_str(&metadata_content)
        .map_err(|e| format!("Invalid metadata format: {}", e))?;
    
    // Version compatibility check
    if !metadata.version.starts_with("2.") {
        return Err(format!("Unsupported backup version: {}. Please use a newer backup.", metadata.version));
    }
    
    drop(metadata_file); // Release the borrow
    
    let app_dir = get_app_data_dir()?;
    let wallpapers_dir = app_dir.join("wallpapers");
    
    // Create wallpapers directory if it doesn't exist
    if !wallpapers_dir.exists() {
        fs::create_dir_all(&wallpapers_dir)
            .map_err(|e| format!("Failed to create wallpapers directory: {}", e))?;
    }
    
    // Extract wallpaper files
    for filename in &metadata.wallpaper_files {
        let zip_path = format!("wallpapers/{}", filename);
        
        match archive.by_name(&zip_path) {
            Ok(mut file) => {
                let wallpaper_path = wallpapers_dir.join(filename);
                let mut buffer = Vec::new();
                file.read_to_end(&mut buffer)
                    .map_err(|e| format!("Failed to read {} from ZIP: {}", filename, e))?;
                
                fs::write(&wallpaper_path, buffer)
                    .map_err(|e| format!("Failed to write wallpaper {}: {}", filename, e))?;
            }
            Err(e) => {
                eprintln!("Warning: Failed to extract wallpaper {}: {}", filename, e);
            }
        }
    }
    
    // Restore settings
    save_app_settings(&metadata.settings)
        .map_err(|e| format!("Failed to restore settings: {}", e))?;
    
    // Restore scheduler config if present
    if let Some(scheduler_config) = &metadata.scheduler_config {
        let scheduler_config_path = app_dir.join("scheduler_config.json");
        let config_json = serde_json::to_string_pretty(scheduler_config)
            .map_err(|e| format!("Failed to serialize scheduler config: {}", e))?;
        
        fs::write(scheduler_config_path, config_json)
            .map_err(|e| format!("Failed to write scheduler config: {}", e))?;
    }
    
    let mut result_message = format!("Successfully restored backup created on {}", metadata.created_at);
    
    // Note about collections data (frontend will handle this)
    if metadata.collections_data.is_some() {
        result_message.push_str("\nCollections data included - will be restored by frontend.");
    }
    
    Ok(result_message)
}

#[tauri::command]
pub async fn write_backup_file(path: String, data: Vec<u8>) -> Result<String, String> {
    fs::write(&path, data)
        .map_err(|e| format!("Failed to write backup file: {}", e))?;
    
    Ok(format!("Backup saved to: {}", path))
}

#[tauri::command]
pub async fn read_backup_file(path: String) -> Result<Vec<u8>, String> {
    fs::read(&path)
        .map_err(|e| format!("Failed to read backup file: {}", e))
}

#[tauri::command]
pub async fn get_backup_collections_data(zip_data: Vec<u8>) -> Result<Option<String>, String> {
    let cursor = Cursor::new(zip_data);
    let mut archive = ZipArchive::new(cursor)
        .map_err(|e| format!("Invalid ZIP file: {}", e))?;
    
    // Read metadata
    let mut metadata_file = archive.by_name("backup.json")
        .map_err(|e| format!("Backup metadata not found: {}", e))?;
    
    let mut metadata_content = String::new();
    metadata_file.read_to_string(&mut metadata_content)
        .map_err(|e| format!("Failed to read metadata: {}", e))?;
    
    let metadata: BackupMetadata = serde_json::from_str(&metadata_content)
        .map_err(|e| format!("Invalid metadata format: {}", e))?;
    
    // Return collections data as string if present
    if let Some(collections_data) = metadata.collections_data {
        Ok(Some(serde_json::to_string(&collections_data)
            .map_err(|e| format!("Failed to serialize collections data: {}", e))?))
    } else {
        Ok(None)
    }
}