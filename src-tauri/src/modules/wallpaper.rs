use crate::modules::utils::get_app_data_dir;
use std::fs;
use std::path::Path;
use std::time::{SystemTime, UNIX_EPOCH};
use wallpaper;

#[tauri::command]
pub async fn set_wallpaper(path: String) -> Result<String, String> {
    match wallpaper::set_from_path(&path) {
        Ok(_) => Ok(format!("Wallpaper set successfully: {}", path)),
        Err(e) => Err(format!("Failed to set wallpaper: {}", e)),
    }
}

#[tauri::command]
pub async fn copy_wallpaper_image(
    source_path: String,
    category: String,
    collection_id: String,
) -> Result<String, String> {
    // Get the app data directory
    let app_dir = get_app_data_dir()?;

    // Create collection-specific subdirectory
    let collection_dir = app_dir.join("wallpapers").join(&collection_id);
    if !collection_dir.exists() {
        fs::create_dir_all(&collection_dir)
            .map_err(|e| format!("Failed to create collection wallpapers directory: {}", e))?;
    }

    // Remove any existing files for this category to avoid clutter
    if let Ok(entries) = fs::read_dir(&collection_dir) {
        for entry in entries {
            if let Ok(entry) = entry {
                let path = entry.path();
                if path.is_file() {
                    if let Some(stem) = path.file_stem().and_then(|s| s.to_str()) {
                        // Check if filename starts with category name
                        if stem.starts_with(&format!("{}_", category)) || stem == category {
                            let _ = fs::remove_file(path);
                        }
                    }
                }
            }
        }
    }

    // Get file extension from source
    let source_path_obj = Path::new(&source_path);
    let extension = source_path_obj
        .extension()
        .and_then(|ext| ext.to_str())
        .unwrap_or("jpg");

    // Generate unique filename with timestamp to prevent caching
    let timestamp = SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .unwrap_or_default()
        .as_millis();

    // Create destination path: category_timestamp.ext
    let dest_filename = format!("{}_{}.{}", category, timestamp, extension);
    let dest_path = collection_dir.join(&dest_filename);

    // Copy the file
    fs::copy(&source_path, &dest_path).map_err(|e| format!("Failed to copy file: {}", e))?;

    // Return the destination path as string
    dest_path
        .to_string_lossy()
        .to_string()
        .parse()
        .map_err(|e| format!("Failed to convert path: {}", e))
}

#[tauri::command]
pub async fn cleanup_unused_wallpapers(used_categories: Vec<String>) -> Result<String, String> {
    let app_dir = get_app_data_dir()?;
    let wallpapers_dir = app_dir.join("wallpapers");

    if !wallpapers_dir.exists() {
        return Ok("No wallpapers directory found".to_string());
    }

    let entries = fs::read_dir(&wallpapers_dir)
        .map_err(|e| format!("Failed to read wallpapers directory: {}", e))?;

    let mut removed_count = 0;

    for entry in entries {
        let entry = entry.map_err(|e| format!("Failed to read directory entry: {}", e))?;
        let path = entry.path();

        if path.is_file() {
            if let Some(filename) = path.file_stem().and_then(|s| s.to_str()) {
                // Check if this category is still used
                // Note: This cleanup logic might need update if we use timestamped filenames
                // For now, strictly relying on full filename match or prefix match might be tricky
                // if used_categories contains pure category names.
                // Assuming used_categories contains the FULL filenames stored in settings.
                if !used_categories.contains(&filename.to_string()) {
                    match fs::remove_file(&path) {
                        Ok(_) => {
                            removed_count += 1;
                            println!("Removed unused wallpaper: {}", path.display());
                        }
                        Err(e) => {
                            eprintln!("Failed to remove {}: {}", path.display(), e);
                        }
                    }
                }
            }
        }
    }

    Ok(format!("Cleaned up {} unused wallpaper(s)", removed_count))
}
