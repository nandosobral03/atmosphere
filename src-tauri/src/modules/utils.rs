use std::path::PathBuf;
use std::fs;
use dirs;

pub fn get_app_data_dir() -> Result<PathBuf, String> {
    let data_dir = dirs::data_dir()
        .ok_or("Could not find data directory")?
        .join("wallpaperthing");
    
    if !data_dir.exists() {
        fs::create_dir_all(&data_dir)
            .map_err(|e| format!("Failed to create app data directory: {}", e))?;
    }
    
    Ok(data_dir)
}

pub fn get_cache_file_path() -> Result<PathBuf, String> {
    let app_dir = get_app_data_dir()?;
    Ok(app_dir.join("weather_cache.json"))
}

pub fn get_location_key(location: &str) -> String {
    // Normalize location for caching (convert to lowercase, trim spaces)
    location.to_lowercase().trim().to_string()
}

pub fn load_env_vars() {
    if let Err(_) = dotenv::dotenv() {
        // .env file not found or couldn't be loaded
        // Environment variables might still be set system-wide
    }
}