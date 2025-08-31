use wallpaper;
use std::path::Path;
use std::fs;
use crate::modules::utils::get_app_data_dir;

#[tauri::command]
pub async fn set_wallpaper(path: String) -> Result<String, String> {
    match wallpaper::set_from_path(&path) {
        Ok(_) => Ok(format!("Wallpaper set successfully: {}", path)),
        Err(e) => Err(format!("Failed to set wallpaper: {}", e)),
    }
}

#[tauri::command]
pub async fn copy_wallpaper_image(source_path: String, category: String) -> Result<String, String> {
    // Get the app data directory
    let app_dir = get_app_data_dir()?;

    // Create wallpapers subdirectory
    let wallpapers_dir = app_dir.join("wallpapers");
    if !wallpapers_dir.exists() {
        fs::create_dir_all(&wallpapers_dir)
            .map_err(|e| format!("Failed to create wallpapers directory: {}", e))?;
    }

    // Get file extension from source
    let source_path_obj = Path::new(&source_path);
    let extension = source_path_obj.extension()
        .and_then(|ext| ext.to_str())
        .unwrap_or("jpg");

    // Create destination path with category name
    let dest_filename = format!("{}.{}", category, extension);
    let dest_path = wallpapers_dir.join(&dest_filename);

    // Copy the file
    fs::copy(&source_path, &dest_path)
        .map_err(|e| format!("Failed to copy file: {}", e))?;

    // Return the destination path as string
    dest_path.to_string_lossy().to_string()
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
