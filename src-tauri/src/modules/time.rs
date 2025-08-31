use chrono::{Local, Timelike, NaiveTime, DateTime as ChronoDateTime};
use crate::modules::types::TimePeriodDetails;

pub fn timestamp_to_time_string(timestamp: i64) -> String {
    ChronoDateTime::from_timestamp(timestamp, 0)
        .map(|dt| dt.with_timezone(&Local).format("%H:%M").to_string())
        .unwrap_or_else(|| "??:??".to_string())
}

pub fn calculate_time_periods(sunrise_str: Option<&str>, sunset_str: Option<&str>) -> Vec<TimePeriodDetails> {
    let current_period = get_time_period_with_sun(sunrise_str, sunset_str);
    
    let mut periods = Vec::new();
    
    if let (Some(sunrise_str), Some(sunset_str)) = (sunrise_str, sunset_str) {
        if let (Some(sunrise), Some(sunset)) = (parse_time_to_timestamp(sunrise_str), parse_time_to_timestamp(sunset_str)) {
            // Calculate all the boundaries
            let dawn_start = sunrise - 1800; // 30 min before sunrise
            let dawn_end = sunrise + 1800;   // 30 min after sunrise
            let dusk_start = sunset - 3600;  // 1 hour before sunset
            let dusk_end = sunset + 1800;    // 30 min after sunset
            
            // Create period details with actual times
            periods.push(TimePeriodDetails {
                period: "late_night".to_string(),
                start_time: "00:00".to_string(),
                end_time: "03:00".to_string(),
                description: "Deep night hours".to_string(),
                is_current: current_period == "late_night",
            });
            
            periods.push(TimePeriodDetails {
                period: "night".to_string(),
                start_time: "03:00".to_string(),
                end_time: timestamp_to_time_string(dawn_start),
                description: "Before dawn".to_string(),
                is_current: current_period == "night",
            });
            
            periods.push(TimePeriodDetails {
                period: "dawn".to_string(),
                start_time: timestamp_to_time_string(dawn_start),
                end_time: timestamp_to_time_string(dawn_end),
                description: "Around sunrise".to_string(),
                is_current: current_period == "dawn",
            });
            
            periods.push(TimePeriodDetails {
                period: "morning".to_string(),
                start_time: timestamp_to_time_string(dawn_end),
                end_time: "11:00".to_string(),
                description: "Morning hours".to_string(),
                is_current: current_period == "morning",
            });
            
            periods.push(TimePeriodDetails {
                period: "midday".to_string(),
                start_time: "11:00".to_string(),
                end_time: "13:00".to_string(),
                description: "Peak sun hours".to_string(),
                is_current: current_period == "midday",
            });
            
            periods.push(TimePeriodDetails {
                period: "afternoon".to_string(),
                start_time: "13:00".to_string(),
                end_time: timestamp_to_time_string(dusk_start),
                description: "Afternoon hours".to_string(),
                is_current: current_period == "afternoon",
            });
            
            periods.push(TimePeriodDetails {
                period: "evening".to_string(),
                start_time: timestamp_to_time_string(dusk_start),
                end_time: timestamp_to_time_string(sunset),
                description: "Before sunset".to_string(),
                is_current: current_period == "evening",
            });
            
            periods.push(TimePeriodDetails {
                period: "dusk".to_string(),
                start_time: timestamp_to_time_string(sunset),
                end_time: timestamp_to_time_string(dusk_end),
                description: "Around sunset".to_string(),
                is_current: current_period == "dusk",
            });
            
            return periods;
        }
    }
    
    // Fallback to fixed times if no sunrise/sunset data
    let fallback_periods = [
        ("late_night", "00:00", "03:00", "Deep night hours"),
        ("night", "03:00", "06:00", "Before dawn"),
        ("dawn", "06:00", "08:00", "Early morning"),
        ("morning", "08:00", "11:00", "Morning hours"),
        ("midday", "11:00", "13:00", "Peak sun hours"),
        ("afternoon", "13:00", "17:00", "Afternoon hours"),
        ("evening", "17:00", "19:00", "Evening hours"),
        ("dusk", "19:00", "21:00", "Twilight hours"),
    ];
    
    for (period, start, end, desc) in fallback_periods.iter() {
        periods.push(TimePeriodDetails {
            period: period.to_string(),
            start_time: start.to_string(),
            end_time: end.to_string(),
            description: desc.to_string(),
            is_current: current_period == *period,
        });
    }
    
    periods
}

fn parse_time_to_timestamp(time_str: &str) -> Option<i64> {
    // Parse "HH:MM AM/PM" format from WeatherAPI
    NaiveTime::parse_from_str(time_str, "%I:%M %p").ok()
        .and_then(|time| {
            let now = Local::now();
            let today = now.date_naive();
            today.and_time(time).and_local_timezone(Local).single().map(|dt| dt.timestamp())
        })
}

pub fn get_time_period_with_sun(sunrise_str: Option<&str>, sunset_str: Option<&str>) -> String {
    let now = Local::now();
    let current_timestamp = now.timestamp();
    
    if let (Some(sunrise_str), Some(sunset_str)) = (sunrise_str, sunset_str) {
        if let (Some(sunrise), Some(sunset)) = (parse_time_to_timestamp(sunrise_str), parse_time_to_timestamp(sunset_str)) {
            let dawn_start = sunrise - 1800; // 30 min before sunrise
            let dawn_end = sunrise + 1800;   // 30 min after sunrise (end of dawn)
            let dusk_start = sunset - 3600;  // 1 hour before sunset (start of evening)
            let dusk_end = sunset + 1800;    // 30 min after sunset
            let midnight = now.date_naive().and_hms_opt(0, 0, 0).unwrap().and_local_timezone(Local).unwrap().timestamp();
            let late_night_end = midnight + 3 * 3600; // 3 AM
            let midday_start = now.date_naive().and_hms_opt(11, 0, 0).unwrap().and_local_timezone(Local).unwrap().timestamp();
            let midday_end = now.date_naive().and_hms_opt(13, 0, 0).unwrap().and_local_timezone(Local).unwrap().timestamp();
            let afternoon_start = midday_end;
            
            return match current_timestamp {
                t if t >= midnight && t < late_night_end => "late_night".to_string(),
                t if t >= late_night_end && t < dawn_start => "night".to_string(),
                t if t >= dawn_start && t < dawn_end => "dawn".to_string(),
                t if t >= dawn_end && t < midday_start => "morning".to_string(),
                t if t >= midday_start && t < midday_end => "midday".to_string(),
                t if t >= afternoon_start && t < dusk_start => "afternoon".to_string(),
                t if t >= dusk_start && t < sunset => "evening".to_string(),
                t if t >= sunset && t < dusk_end => "dusk".to_string(),
                _ => "night".to_string(),
            };
        }
    }
    
    // Fallback to simple hour-based calculation
    let hour = now.hour();
    match hour {
        0..=2 => "late_night".to_string(),
        3..=5 => "night".to_string(),
        6..=7 => "dawn".to_string(),
        8..=10 => "morning".to_string(),
        11..=12 => "midday".to_string(),
        13..=16 => "afternoon".to_string(),
        17..=18 => "evening".to_string(),
        19..=20 => "dusk".to_string(),
        _ => "night".to_string(),
    }
}