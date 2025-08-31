use std::fs;
use chrono::{Utc};
use serde_json;
use crate::modules::types::{WeatherApiResponse, WeatherCache, CurrentConditions, TimePeriodsResponse};
use crate::modules::utils::{get_cache_file_path, get_location_key};
use crate::modules::time::{get_time_period_with_sun, calculate_time_periods};
use crate::modules::settings::load_app_settings;

fn load_weather_cache() -> Option<WeatherCache> {
    let cache_path = get_cache_file_path().ok()?;
    let cache_content = fs::read_to_string(cache_path).ok()?;
    serde_json::from_str(&cache_content).ok()
}

fn save_weather_cache(cache: &WeatherCache) -> Result<(), String> {
    let cache_path = get_cache_file_path()?;
    let cache_content = serde_json::to_string_pretty(cache)
        .map_err(|e| format!("Failed to serialize cache: {}", e))?;
    
    fs::write(cache_path, cache_content)
        .map_err(|e| format!("Failed to write cache: {}", e))?;
    
    Ok(())
}

fn is_cache_valid(cache: &WeatherCache, current_location: &str, cache_duration_minutes: u64) -> bool {
    let now = Utc::now().timestamp();
    let cache_age = now - cache.cached_at;
    let cache_duration_seconds = (cache_duration_minutes * 60) as i64;
    
    // Check if cache is within valid time window and location matches
    cache_age < cache_duration_seconds && cache.location_key == current_location
}

async fn fetch_fresh_weather_data(api_key: &str, location: &str) -> Result<WeatherApiResponse, String> {
    // WeatherAPI.com endpoint - includes current weather and astronomy data
    let url = format!(
        "https://api.weatherapi.com/v1/current.json?key={}&q={}&aqi=no", 
        api_key, location
    );
    
    let response = reqwest::get(&url)
        .await
        .map_err(|e| format!("HTTP error: {}", e))?;
    
    if !response.status().is_success() {
        return Err(format!("Weather API error: {}", response.status()));
    }
    
    // WeatherAPI.com doesn't include astronomy in current.json, we need a separate call
    let astronomy_url = format!(
        "https://api.weatherapi.com/v1/astronomy.json?key={}&q={}", 
        api_key, location
    );
    
    let astronomy_response = reqwest::get(&astronomy_url)
        .await
        .map_err(|e| format!("Astronomy API error: {}", e))?;
    
    let weather_data: serde_json::Value = response.json()
        .await
        .map_err(|e| format!("JSON parse error: {}", e))?;
    
    let astronomy_data: serde_json::Value = astronomy_response.json()
        .await
        .map_err(|e| format!("Astronomy JSON parse error: {}", e))?;
    
    // Combine the responses
    let mut combined_response = weather_data;
    if let Some(astronomy) = astronomy_data.get("astronomy") {
        combined_response["astronomy"] = astronomy.clone();
    }
    
    let final_response: WeatherApiResponse = serde_json::from_value(combined_response)
        .map_err(|e| format!("Failed to deserialize combined response: {}", e))?;
    
    Ok(final_response)
}

async fn get_weather_data() -> Result<WeatherApiResponse, String> {
    let settings = load_app_settings();
    
    if settings.weather_api_key.is_empty() {
        return Err("Weather API key not configured. Please set it in Settings.".to_string());
    }
    
    let api_key = settings.weather_api_key;
    let location = if settings.use_auto_location {
        "auto:ip".to_string()
    } else {
        if settings.location.is_empty() {
            return Err("Location not configured. Please set it in Settings or enable auto-location.".to_string());
        }
        settings.location
    };
    
    let location_key = get_location_key(&location);
    
    // Try to load from cache first
    if let Some(cached_data) = load_weather_cache() {
        if is_cache_valid(&cached_data, &location_key, settings.cache_duration_minutes) {
            return Ok(cached_data.data);
        }
    }
    
    // Cache miss or expired, fetch fresh data
    let fresh_data = fetch_fresh_weather_data(&api_key, &location).await?;
    
    // Save to cache
    let cache_entry = WeatherCache {
        data: fresh_data.clone(),
        cached_at: Utc::now().timestamp(),
        location_key,
    };
    
    // Don't fail the entire operation if caching fails
    if let Err(e) = save_weather_cache(&cache_entry) {
        eprintln!("Warning: Failed to save weather cache: {}", e);
    }
    
    Ok(fresh_data)
}

fn get_weather_condition_category(condition_code: i32, condition_text: &str) -> Option<String> {
    // Map WeatherAPI condition codes to our categories
    // Reference: https://www.weatherapi.com/docs/weather_conditions.json
    match condition_code {
        1087 | 1273 | 1276 | 1279 | 1282 => Some("thunderstorm".to_string()),
        1063 | 1072 | 1150 | 1153 | 1168 | 1171 | 1180..=1201 | 1240..=1246 => Some("rain".to_string()),
        1066 | 1069 | 1114 | 1117 | 1204..=1225 | 1249..=1264 => Some("snow".to_string()),
        1030 | 1135 | 1147 => Some("fog".to_string()),
        1003 | 1006 | 1009 => Some("cloudy".to_string()),
        1000 => Some("sunny".to_string()),
        _ => {
            // Fallback based on text description
            let text_lower = condition_text.to_lowercase();
            if text_lower.contains("thunder") || text_lower.contains("storm") {
                Some("thunderstorm".to_string())
            } else if text_lower.contains("rain") || text_lower.contains("drizzle") || text_lower.contains("shower") {
                Some("rain".to_string())
            } else if text_lower.contains("snow") || text_lower.contains("blizzard") || text_lower.contains("sleet") {
                Some("snow".to_string())
            } else if text_lower.contains("fog") || text_lower.contains("mist") {
                Some("fog".to_string())
            } else if text_lower.contains("cloud") || text_lower.contains("overcast") {
                Some("cloudy".to_string())
            } else if text_lower.contains("clear") || text_lower.contains("sunny") {
                Some("sunny".to_string())
            } else {
                None
            }
        }
    }
}

#[tauri::command]
pub async fn get_current_conditions() -> Result<CurrentConditions, String> {
    let weather_data = get_weather_data().await?;
    
    let weather_condition = get_weather_condition_category(
        weather_data.current.condition.code,
        &weather_data.current.condition.text
    );
    
    let time_period = get_time_period_with_sun(
        Some(&weather_data.astronomy.astro.sunrise),
        Some(&weather_data.astronomy.astro.sunset)
    );
    
    // Determine active categories based on priority
    let mut active_categories = Vec::new();
    
    // Add weather condition if present (highest priority)
    if let Some(ref condition) = weather_condition {
        active_categories.push(condition.clone());
    }
    
    // Always add time period
    active_categories.push(time_period.clone());
    
    // Add fallback as lowest priority
    active_categories.push("default".to_string());
    
    Ok(CurrentConditions {
        weather_condition,
        time_period,
        temperature: Some(weather_data.current.temp_c),
        humidity: Some(weather_data.current.humidity),
        sunrise: Some(weather_data.astronomy.astro.sunrise.clone()),
        sunset: Some(weather_data.astronomy.astro.sunset.clone()),
        location: Some(format!("{}, {}", weather_data.location.name, weather_data.location.country)),
        active_categories,
    })
}

#[tauri::command]
pub async fn get_time_periods() -> Result<TimePeriodsResponse, String> {
    let weather_data = get_weather_data().await?;
    
    let sunrise = weather_data.astronomy.astro.sunrise.clone();
    let sunset = weather_data.astronomy.astro.sunset.clone();
    let periods = calculate_time_periods(Some(&sunrise), Some(&sunset));
    
    Ok(TimePeriodsResponse {
        sunrise,
        sunset,
        periods,
        location: Some(format!("{}, {}", weather_data.location.name, weather_data.location.country)),
    })
}

#[tauri::command]
pub async fn clear_weather_cache() -> Result<String, String> {
    let cache_path = get_cache_file_path()?;
    
    if cache_path.exists() {
        fs::remove_file(cache_path)
            .map_err(|e| format!("Failed to remove cache file: {}", e))?;
        Ok("Weather cache cleared successfully".to_string())
    } else {
        Ok("No cache file found".to_string())
    }
}