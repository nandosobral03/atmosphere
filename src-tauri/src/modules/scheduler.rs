use std::sync::Mutex;
use std::time::Duration;
use tokio::time::interval;
use crate::modules::weather::get_current_conditions;
use crate::modules::wallpaper::set_wallpaper;
use crate::modules::utils::get_app_data_dir;
use std::fs;
use serde::{Serialize, Deserialize};

#[derive(Serialize, Deserialize, Clone, Debug)]
struct SchedulerConfig {
    enabled: bool,
    interval_minutes: u64,
    last_applied_path: Option<String>,
}

impl Default for SchedulerConfig {
    fn default() -> Self {
        Self {
            enabled: false,
            interval_minutes: 3,
            last_applied_path: None,
        }
    }
}

static SCHEDULER_CONFIG: Mutex<Option<SchedulerConfig>> = Mutex::new(None);
static SCHEDULER_HANDLE: Mutex<Option<tokio::task::JoinHandle<()>>> = Mutex::new(None);

fn get_scheduler_config_path() -> Result<std::path::PathBuf, String> {
    let app_dir = get_app_data_dir()?;
    Ok(app_dir.join("scheduler_config.json"))
}

fn load_scheduler_config() -> SchedulerConfig {
    let config_path = match get_scheduler_config_path() {
        Ok(path) => path,
        Err(_) => return SchedulerConfig::default(),
    };

    if let Ok(content) = fs::read_to_string(config_path) {
        serde_json::from_str(&content).unwrap_or_default()
    } else {
        SchedulerConfig::default()
    }
}

fn save_scheduler_config(config: &SchedulerConfig) -> Result<(), String> {
    let config_path = get_scheduler_config_path()?;
    let content = serde_json::to_string_pretty(config)
        .map_err(|e| format!("Failed to serialize config: {}", e))?;
    
    fs::write(config_path, content)
        .map_err(|e| format!("Failed to write config: {}", e))?;
    
    Ok(())
}

async fn scheduler_loop(config: SchedulerConfig) {
    let mut interval_timer = interval(Duration::from_secs(config.interval_minutes * 60));
    let mut current_config = config.clone();
    
    println!("Wallpaper scheduler started with {} minute intervals", config.interval_minutes);
    
    loop {
        interval_timer.tick().await;
        
        // Check if scheduler is still enabled
        {
            let global_config = SCHEDULER_CONFIG.lock().unwrap();
            if let Some(ref global) = *global_config {
                if !global.enabled {
                    println!("Scheduler disabled, stopping loop");
                    break;
                }
                current_config = global.clone();
            } else {
                println!("Scheduler config not found, stopping loop");
                break;
            }
        }
        
        println!("Scheduler tick: checking wallpaper conditions...");
        
        match check_and_apply_wallpaper(&mut current_config).await {
            Ok(applied) => {
                if applied {
                    // Update the global config with new last_applied_path
                    {
                        let mut global_config = SCHEDULER_CONFIG.lock().unwrap();
                        if let Some(ref mut global) = *global_config {
                            global.last_applied_path = current_config.last_applied_path.clone();
                            let _ = save_scheduler_config(global);
                        }
                    }
                }
            }
            Err(e) => {
                eprintln!("Scheduler error: {}", e);
            }
        }
    }
    
    println!("Wallpaper scheduler loop ended");
}

async fn check_and_apply_wallpaper(config: &mut SchedulerConfig) -> Result<bool, String> {
    // Get current conditions
    let conditions = get_current_conditions().await?;
    
    // Find the highest priority wallpaper for current conditions
    let mut best_category: Option<String> = None;
    let mut best_priority = -1i32;
    
    // Simple priority mapping (should match frontend logic)
    for category in &conditions.active_categories {
        let priority = get_category_priority(category);
        if priority > best_priority {
            best_priority = priority;
            best_category = Some(category.clone());
        }
    }
    
    if let Some(category) = best_category {
        // Check if we have a wallpaper configured for this category
        if let Some(wallpaper_path) = get_wallpaper_path_for_category(&category) {
            // Only apply if it's different from the last applied
            if config.last_applied_path.as_ref() != Some(&wallpaper_path) {
                println!("Auto-applying wallpaper: {} -> {}", category, wallpaper_path);
                
                match set_wallpaper(wallpaper_path.clone()).await {
                    Ok(_) => {
                        config.last_applied_path = Some(wallpaper_path);
                        println!("Successfully applied {} wallpaper", category);
                        return Ok(true);
                    }
                    Err(e) => {
                        eprintln!("Failed to apply wallpaper: {}", e);
                        return Err(e);
                    }
                }
            } else {
                println!("Current wallpaper ({}) is already active", category);
            }
        } else {
            println!("No wallpaper configured for category: {}", category);
        }
    }
    
    Ok(false)
}

fn get_category_priority(category: &str) -> i32 {
    match category {
        "thunderstorm" => 100,
        "rain" => 90,
        "snow" => 85,
        "fog" => 80,
        "dawn" => 75,
        "dusk" => 70,
        "late_night" => 65,
        "night" => 60,
        "evening" => 55,
        "cloudy" => 45,
        "sunny" => 40,
        "afternoon" => 35,
        "midday" => 30,
        "morning" => 25,
        "default" => 0,
        _ => 0,
    }
}

fn get_wallpaper_path_for_category(category: &str) -> Option<String> {
    // This is a simplified version - in a real implementation, 
    // we'd load the wallpaper settings from the frontend store
    let app_dir = get_app_data_dir().ok()?;
    let wallpapers_dir = app_dir.join("wallpapers");
    
    // Try common image extensions
    for ext in &["jpg", "jpeg", "png", "gif", "bmp", "webp"] {
        let path = wallpapers_dir.join(format!("{}.{}", category, ext));
        if path.exists() {
            return path.to_string_lossy().to_string().into();
        }
    }
    
    None
}

#[tauri::command]
pub async fn start_wallpaper_scheduler(interval_minutes: Option<u64>) -> Result<String, String> {
    let interval = interval_minutes.unwrap_or(3);
    
    // Stop existing scheduler if running
    stop_wallpaper_scheduler().await?;
    
    let mut config = load_scheduler_config();
    config.enabled = true;
    config.interval_minutes = interval;
    
    // Save config
    save_scheduler_config(&config)?;
    
    // Update global config
    {
        let mut global_config = SCHEDULER_CONFIG.lock().unwrap();
        *global_config = Some(config.clone());
    }
    
    // Start the scheduler task
    let handle = tokio::spawn(scheduler_loop(config));
    
    {
        let mut scheduler_handle = SCHEDULER_HANDLE.lock().unwrap();
        *scheduler_handle = Some(handle);
    }
    
    Ok(format!("Wallpaper scheduler started with {} minute intervals", interval))
}

#[tauri::command]
pub async fn stop_wallpaper_scheduler() -> Result<String, String> {
    // Update config to disabled
    let mut config = load_scheduler_config();
    config.enabled = false;
    save_scheduler_config(&config)?;
    
    {
        let mut global_config = SCHEDULER_CONFIG.lock().unwrap();
        *global_config = Some(config);
    }
    
    // Stop the scheduler task
    {
        let mut scheduler_handle = SCHEDULER_HANDLE.lock().unwrap();
        if let Some(handle) = scheduler_handle.take() {
            handle.abort();
        }
    }
    
    Ok("Wallpaper scheduler stopped".to_string())
}

#[tauri::command]
pub async fn get_scheduler_status() -> Result<serde_json::Value, String> {
    let config = load_scheduler_config();
    
    let is_running = {
        let scheduler_handle = SCHEDULER_HANDLE.lock().unwrap();
        scheduler_handle.is_some()
    };
    
    Ok(serde_json::json!({
        "enabled": config.enabled,
        "interval_minutes": config.interval_minutes,
        "is_running": is_running,
        "last_applied_path": config.last_applied_path
    }))
}