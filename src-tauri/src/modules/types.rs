use serde::{Deserialize, Serialize};

// WeatherAPI.com response structures
#[derive(Serialize, Deserialize, Clone)]
pub struct WeatherApiResponse {
    pub location: WeatherLocation,
    pub current: WeatherCurrent,
    pub astronomy: WeatherAstronomy,
}

#[derive(Serialize, Deserialize, Clone)]
pub struct WeatherLocation {
    pub name: String,
    pub region: String,
    pub country: String,
}

#[derive(Serialize, Deserialize, Clone)]
pub struct WeatherCurrent {
    pub temp_c: f32,
    pub humidity: i32,
    pub condition: WeatherCondition,
}

#[derive(Serialize, Deserialize, Clone)]
pub struct WeatherCondition {
    pub text: String,
    pub code: i32,
}

#[derive(Serialize, Deserialize, Clone)]
pub struct WeatherAstronomy {
    pub astro: AstroData,
}

#[derive(Serialize, Deserialize, Clone)]
pub struct AstroData {
    pub sunrise: String,
    pub sunset: String,
}

#[derive(Serialize, Deserialize)]
pub struct CurrentConditions {
    pub weather_condition: Option<String>,
    pub time_period: String,
    pub temperature: Option<f32>,
    pub humidity: Option<i32>,
    pub sunrise: Option<String>,
    pub sunset: Option<String>,
    pub location: Option<String>,
    pub active_categories: Vec<String>,
}

#[derive(Serialize, Deserialize)]
pub struct TimePeriodDetails {
    pub period: String,
    pub start_time: String,
    pub end_time: String,
    pub description: String,
    pub is_current: bool,
}

#[derive(Serialize, Deserialize)]
pub struct TimePeriodsResponse {
    pub sunrise: String,
    pub sunset: String,
    pub periods: Vec<TimePeriodDetails>,
    pub location: Option<String>,
}

#[derive(Serialize, Deserialize, Clone)]
pub struct WeatherCache {
    pub data: WeatherApiResponse,
    pub cached_at: i64, // UTC timestamp
    pub location_key: String, // To handle different locations
}

