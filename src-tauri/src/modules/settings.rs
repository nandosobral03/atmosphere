use std::fs;
use serde::{Serialize, Deserialize};
use crate::modules::utils::get_app_data_dir;

#[derive(Serialize, Deserialize, Clone, Debug)]
pub struct AppSettings {
    pub weather_api_key: String,
    pub location: String,
    pub use_auto_location: bool,
    pub cache_duration_minutes: u64,
}

impl Default for AppSettings {
    fn default() -> Self {
        Self {
            weather_api_key: String::new(),
            location: String::new(),
            use_auto_location: true,
            cache_duration_minutes: 60, // Default to 60 minutes
        }
    }
}

fn get_settings_file_path() -> Result<std::path::PathBuf, String> {
    let app_dir = get_app_data_dir()?;
    Ok(app_dir.join("app_settings.json"))
}

pub fn load_app_settings() -> AppSettings {
    let settings_path = match get_settings_file_path() {
        Ok(path) => path,
        Err(_) => return AppSettings::default(),
    };

    if let Ok(content) = fs::read_to_string(settings_path) {
        serde_json::from_str(&content).unwrap_or_default()
    } else {
        AppSettings::default()
    }
}

pub fn save_app_settings(settings: &AppSettings) -> Result<(), String> {
    let settings_path = get_settings_file_path()?;
    let content = serde_json::to_string_pretty(settings)
        .map_err(|e| format!("Failed to serialize settings: {}", e))?;
    
    fs::write(settings_path, content)
        .map_err(|e| format!("Failed to write settings: {}", e))?;
    
    Ok(())
}

#[tauri::command]
pub async fn get_app_settings() -> Result<AppSettings, String> {
    Ok(load_app_settings())
}

#[tauri::command]
pub async fn save_app_settings_cmd(settings: AppSettings) -> Result<String, String> {
    save_app_settings(&settings)?;
    Ok("Settings saved successfully".to_string())
}

#[tauri::command]
pub async fn test_weather_api(api_key: String, location: String) -> Result<String, String> {
    // Test the API key by making a simple request
    let url = format!(
        "https://api.weatherapi.com/v1/current.json?key={}&q={}&aqi=no", 
        api_key, location
    );
    
    let response = reqwest::get(&url)
        .await
        .map_err(|e| format!("HTTP error: {}", e))?;
    
    if !response.status().is_success() {
        return Err(format!("API test failed: {}", response.status()));
    }

    // Try to parse the response to ensure it's valid
    let _weather_data: serde_json::Value = response.json()
        .await
        .map_err(|e| format!("Invalid API response: {}", e))?;

    Ok("API key test successful".to_string())
}