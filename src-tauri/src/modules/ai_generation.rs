use crate::modules::utils::get_app_data_dir;
use base64::{engine::general_purpose, Engine as _};
use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use std::fs;
use std::path::Path;
use std::time::Duration;
use tokio::time::sleep;

#[derive(Debug, Serialize, Deserialize)]
pub struct PromptConfig {
    pub weather: HashMap<String, PromptData>,
    pub time: HashMap<String, PromptData>,
    pub fallback: HashMap<String, PromptData>,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct PromptData {
    pub prompt: String,
    pub description: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct GenerationRequest {
    pub image_path: String,
    pub prompts: HashMap<String, String>, // category -> custom prompt
    pub selected_categories: Vec<String>, // list of categories to generate
    pub collection_id: String, // ID for the collection folder
    pub api_key: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct GenerationResult {
    pub category: String,
    pub success: bool,
    pub image_path: Option<String>,
    pub error_message: Option<String>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct BatchGenerationResult {
    pub results: Vec<GenerationResult>,
    pub total_generated: usize,
    pub total_failed: usize,
}

// Gemini API request structures
#[derive(Debug, Serialize)]
struct GeminiRequest {
    contents: Vec<Content>,
    #[serde(rename = "generationConfig")]
    generation_config: GenerationConfig,
}

#[derive(Debug, Serialize)]
struct Content {
    parts: Vec<Part>,
}

#[derive(Debug, Serialize)]
#[serde(untagged)]
enum Part {
    Text { text: String },
    InlineData { inline_data: InlineData },
}

#[derive(Debug, Serialize)]
struct InlineData {
    mime_type: String,
    data: String, // base64 encoded image
}

#[derive(Debug, Serialize)]
struct GenerationConfig {
    #[serde(rename = "responseModalities")]
    response_modalities: Vec<String>,
}

// Gemini API response structures
#[derive(Debug, Deserialize)]
struct GeminiResponse {
    candidates: Vec<Candidate>,
}

#[derive(Debug, Deserialize)]
struct Candidate {
    content: ResponseContent,
}

#[derive(Debug, Deserialize)]
struct ResponseContent {
    parts: Vec<ResponsePart>,
}

#[derive(Debug, Deserialize)]
#[serde(untagged)]
enum ResponsePart {
    Text {
        text: String,
    },
    InlineData {
        #[serde(alias = "inlineData")]
        inline_data: ResponseInlineData,
    },
}

#[derive(Debug, Deserialize)]
struct ResponseInlineData {
    #[serde(alias = "mimeType")]
    mime_type: String,
    data: String, // base64 encoded image
}

#[derive(Debug, Deserialize)]
struct GeminiError {
    error: ErrorDetails,
}

#[derive(Debug, Deserialize)]
struct ErrorDetails {
    code: u16,
    message: String,
    status: String,
}

const GEMINI_ENDPOINT: &str = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-preview-image-generation:generateContent";
const MAX_RETRIES: u32 = 1;
const BASE_DELAY_MS: u64 = 1000;

pub fn load_default_prompts() -> Result<PromptConfig, String> {
    let app_data_dir = get_app_data_dir()?;
    let prompts_path = app_data_dir.join("ai-prompts.json");

    // If the file doesn't exist, create it with default prompts
    if !prompts_path.exists() {
        let default_config = create_default_prompts_config();
        save_prompts_config(&default_config, &prompts_path)?;
        return Ok(default_config);
    }

    let prompts_content = fs::read_to_string(&prompts_path)
        .map_err(|e| format!("Failed to read prompts file: {}", e))?;

    let config: PromptConfig = serde_json::from_str(&prompts_content)
        .map_err(|e| format!("Failed to parse prompts JSON: {}", e))?;

    Ok(config)
}

fn create_default_prompts_config() -> PromptConfig {
    let mut weather = HashMap::new();
    weather.insert("thunderstorm".to_string(), PromptData {
        prompt: "Transform this image to show a dramatic thunderstorm with dark storm clouds, lightning bolts, heavy rainfall, and moody atmospheric lighting. Keep the same composition and main elements but add intense weather effects.".to_string(),
        description: "Dramatic thunderstorm with lightning and heavy rain".to_string(),
    });
    weather.insert("rain".to_string(), PromptData {
        prompt: "Add gentle to moderate rainfall to this scene with wet surfaces, raindrops, overcast gray skies, and soft diffused lighting. Show puddles, wet reflections, and rain effects while maintaining the original scene composition.".to_string(),
        description: "Gentle rainfall with wet surfaces and overcast skies".to_string(),
    });
    weather.insert("snow".to_string(), PromptData {
        prompt: "Cover this landscape with fresh snow, snowfall, winter atmosphere, and cold lighting. Add snow on surfaces, bare winter trees if applicable, and a crisp winter sky while preserving the main scene elements.".to_string(),
        description: "Winter scene with snow and cold atmosphere".to_string(),
    });
    weather.insert("fog".to_string(), PromptData {
        prompt: "Add thick fog or mist to create a mysterious, low-visibility version with atmospheric haze, reduced contrast, and ethereal lighting. Maintain the scene structure but obscure distant elements with fog.".to_string(),
        description: "Foggy conditions with mysterious atmosphere".to_string(),
    });
    weather.insert("cloudy".to_string(), PromptData {
        prompt: "Change to overcast conditions with heavy cloud cover, diffused lighting, and gray atmospheric tones. Create a completely overcast sky with soft, even lighting throughout the scene.".to_string(),
        description: "Overcast day with heavy cloud cover".to_string(),
    });
    weather.insert("sunny".to_string(), PromptData {
        prompt: "Enhance with bright sunshine, clear blue skies, strong shadows, and vibrant colors. Add brilliant sunlight, sharp contrasts, and warm atmospheric tones while keeping the original composition.".to_string(),
        description: "Bright sunny day with clear skies".to_string(),
    });

    let mut time = HashMap::new();
    time.insert("dawn".to_string(), PromptData {
        prompt: "Transform to early morning dawn with soft golden light, sunrise colors in the sky, gentle warm lighting, and peaceful morning atmosphere. Show the first light of day with soft pink and orange tones.".to_string(),
        description: "Early morning dawn with soft golden light".to_string(),
    });
    time.insert("morning".to_string(), PromptData {
        prompt: "Show in bright morning light with fresh, clear atmosphere, blue skies, and crisp lighting. Create a sense of new beginning with clean, energetic morning illumination.".to_string(),
        description: "Fresh morning light with clear atmosphere".to_string(),
    });
    time.insert("midday".to_string(), PromptData {
        prompt: "Display with harsh noon sunlight, strong overhead lighting, sharp shadows, and bright atmospheric conditions. Show the intensity of peak daylight with high contrast and clear visibility.".to_string(),
        description: "Harsh midday sun with strong shadows".to_string(),
    });
    time.insert("afternoon".to_string(), PromptData {
        prompt: "Render in warm afternoon lighting with slightly golden tones, comfortable brightness, and relaxed atmospheric mood. Show the pleasant warmth of late afternoon sun.".to_string(),
        description: "Warm afternoon lighting with golden tones".to_string(),
    });
    time.insert("dusk".to_string(), PromptData {
        prompt: "Change to twilight dusk with sunset colors, fading light, purple and orange sky tones, and transitional lighting between day and night. Create a peaceful end-of-day atmosphere.".to_string(),
        description: "Twilight dusk with sunset colors".to_string(),
    });
    time.insert("evening".to_string(), PromptData {
        prompt: "Show in early evening with warm golden hour lighting, soft shadows, and romantic atmospheric glow. Capture the beautiful light just before sunset with warm, inviting tones.".to_string(),
        description: "Golden hour evening with warm glow".to_string(),
    });
    time.insert("night".to_string(), PromptData {
        prompt: "Transform to nighttime with artificial lighting, dark sky, city lights or moonlight, and nocturnal atmosphere. Add appropriate light sources and create a peaceful night scene.".to_string(),
        description: "Nighttime with artificial lighting".to_string(),
    });
    time.insert("late_night".to_string(), PromptData {
        prompt: "Create a deep night version with minimal lighting, dark atmosphere, subtle moonlight or starlight, and quiet nocturnal mood. Show the stillness and mystery of late night hours.".to_string(),
        description: "Deep night with minimal lighting".to_string(),
    });

    let fallback = HashMap::new();

    PromptConfig {
        weather,
        time,
        fallback,
    }
}

fn save_prompts_config(config: &PromptConfig, path: &Path) -> Result<(), String> {
    let content = serde_json::to_string_pretty(config)
        .map_err(|e| format!("Failed to serialize prompts config: {}", e))?;

    fs::write(path, content).map_err(|e| format!("Failed to write prompts config: {}", e))?;

    Ok(())
}

fn encode_image_to_base64(image_path: &str) -> Result<(String, String), String> {
    let path = Path::new(image_path);

    if !path.exists() {
        return Err(format!("Image file not found: {}", image_path));
    }

    let image_data = fs::read(path).map_err(|e| format!("Failed to read image file: {}", e))?;

    let mime_type = match path.extension().and_then(|ext| ext.to_str()) {
        Some("jpg") | Some("jpeg") => "image/jpeg",
        Some("png") => "image/png",
        Some("webp") => "image/webp",
        _ => return Err("Unsupported image format. Use JPEG, PNG, or WebP.".to_string()),
    };

    let base64_data = general_purpose::STANDARD.encode(&image_data);

    Ok((base64_data, mime_type.to_string()))
}

async fn call_gemini_api(
    api_key: &str,
    prompt: &str,
    image_base64: &str,
    mime_type: &str,
) -> Result<String, String> {
    let client = reqwest::Client::new();

    let enhanced_prompt = format!(
        "{}. IMPORTANT: Only return the modified image, do not include any text description or explanation in your response.",
        prompt
    );

    let request = GeminiRequest {
        contents: vec![Content {
            parts: vec![
                Part::Text {
                    text: enhanced_prompt,
                },
                Part::InlineData {
                    inline_data: InlineData {
                        mime_type: mime_type.to_string(),
                        data: image_base64.to_string(),
                    },
                },
            ],
        }],
        generation_config: GenerationConfig {
            response_modalities: vec!["TEXT".to_string(), "IMAGE".to_string()],
        },
    };

    println!("🔄 Starting Gemini API call");
    println!("📝 Prompt: {}", prompt);
    println!(
        "🖼️  Image type: {}, size: {} bytes",
        mime_type,
        image_base64.len()
    );
    println!("🔗 Endpoint: {}", GEMINI_ENDPOINT);
    println!("🔑 API Key: {}", api_key);

    let mut last_error = String::new();

    for attempt in 0..MAX_RETRIES {
        println!("🚀 Attempt {} of {}", attempt + 1, MAX_RETRIES);
        let start_time = std::time::Instant::now();

        let response = client
            .post(GEMINI_ENDPOINT)
            .header("x-goog-api-key", api_key)
            .header("Content-Type", "application/json")
            .json(&request)
            .send()
            .await;

        let elapsed = start_time.elapsed();
        println!("⏱️  Request took: {:?}", elapsed);

        match response {
            Ok(resp) => {
                let status_code = resp.status().as_u16();
                println!("📡 Response status: {}", status_code);

                if resp.status().is_success() {
                    println!("✅ API call successful!");

                    // Try to get response headers for debugging
                    if let Some(content_length) = resp.headers().get("content-length") {
                        println!("📦 Response size: {:?}", content_length);
                    }

                    let raw_response = resp.text().await.map_err(|e| {
                        println!("❌ Failed to read response text: {}", e);
                        format!("Failed to read response: {}", e)
                    })?;

                    println!("📄 Raw response length: {} chars", raw_response.len());
                    println!(
                        "📄 Raw response preview: {}",
                        &raw_response[..std::cmp::min(1000, raw_response.len())]
                    );

                    let gemini_response: GeminiResponse = serde_json::from_str(&raw_response)
                        .map_err(|e| {
                            println!("❌ Failed to parse JSON response: {}", e);
                            println!("🔍 JSON error details: {:?}", e);
                            format!("Failed to parse Gemini response: {}", e)
                        })?;

                    println!(
                        "🔍 Response has {} candidates",
                        gemini_response.candidates.len()
                    );

                    // Extract the generated image from response
                    if let Some(candidate) = gemini_response.candidates.first() {
                        println!(
                            "🎯 Processing first candidate with {} parts",
                            candidate.content.parts.len()
                        );
                        for (i, part) in candidate.content.parts.iter().enumerate() {
                            match part {
                                ResponsePart::InlineData { inline_data } => {
                                    println!(
                                        "🖼️  Found image data in part {}, size: {} bytes",
                                        i,
                                        inline_data.data.len()
                                    );
                                    return Ok(inline_data.data.clone());
                                }
                                ResponsePart::Text { text } => {
                                    println!("💬 Found text in part {}: {}", i, text);
                                }
                            }
                        }
                    }

                    println!("❌ No image found in any response parts");
                    return Err("No image found in Gemini response".to_string());
                } else if resp.status().as_u16() == 429 {
                    // Rate limit exceeded - check if it's quota exhaustion
                    let error_text = resp.text().await.unwrap_or_default();
                    println!("🔄 Rate limit error details: {}", error_text);

                    // Check if this is quota exhaustion (daily/monthly limits)
                    if error_text.contains("quota") && error_text.contains("limit: 0") {
                        last_error = "❌ Gemini API daily quota exhausted. Please wait until tomorrow or upgrade to a paid plan at https://aistudio.google.com/pricing".to_string();
                        println!("{}", last_error);
                        break; // Don't retry for quota exhaustion
                    }

                    // Regular rate limiting - retry with backoff
                    let delay = BASE_DELAY_MS * 2_u64.pow(attempt);
                    last_error = format!("Rate limit exceeded (429). Retrying in {}ms...", delay);
                    println!("{}", last_error);

                    if attempt < MAX_RETRIES - 1 {
                        sleep(Duration::from_millis(delay)).await;
                        continue;
                    } else {
                        break;
                    }
                } else {
                    // Store status before moving resp
                    let status = resp.status();
                    println!("❌ HTTP Error: {}", status);

                    // Get the raw error response for debugging
                    let error_text = resp.text().await.unwrap_or_default();
                    println!("💥 Error response: {}", error_text);

                    // Try to parse error response
                    if let Ok(error_resp) = serde_json::from_str::<GeminiError>(&error_text) {
                        last_error = format!(
                            "Gemini API error {}: {}",
                            error_resp.error.code, error_resp.error.message
                        );
                        println!("💥 Parsed error: {}", last_error);
                    } else {
                        last_error = format!("Gemini API error: HTTP {} - {}", status, error_text);
                        println!("💥 Unparsed error: {}", last_error);
                    }
                    break;
                }
            }
            Err(e) => {
                last_error = format!("Network error: {}", e);
                if attempt < MAX_RETRIES - 1 {
                    let delay = BASE_DELAY_MS * 2_u64.pow(attempt);
                    sleep(Duration::from_millis(delay)).await;
                    continue;
                }
            }
        }
    }

    Err(last_error)
}

fn save_generated_image(image_base64: &str, category: &str, collection_id: &str) -> Result<String, String> {
    // Create organized directory structure for collection-specific generated images
    let app_data_dir = get_app_data_dir()?;
    let collection_dir = app_data_dir.join("wallpapers").join(collection_id);

    // Create directory if it doesn't exist
    fs::create_dir_all(&collection_dir)
        .map_err(|e| format!("Failed to create collection wallpapers directory: {}", e))?;

    // Use simple category naming for collections
    let filename = format!("{}.png", category);
    let file_path = collection_dir.join(&filename);

    // Decode base64 and save
    let image_data = general_purpose::STANDARD
        .decode(image_base64)
        .map_err(|e| format!("Failed to decode base64 image: {}", e))?;

    fs::write(&file_path, image_data)
        .map_err(|e| format!("Failed to save generated image: {}", e))?;

    Ok(file_path.to_string_lossy().to_string())
}

pub async fn generate_single_variation(
    api_key: &str,
    source_image_path: &str,
    category: &str,
    prompt: &str,
    collection_id: &str,
) -> GenerationResult {
    // Encode source image
    let (image_base64, mime_type) = match encode_image_to_base64(source_image_path) {
        Ok(data) => data,
        Err(e) => {
            return GenerationResult {
                category: category.to_string(),
                success: false,
                image_path: None,
                error_message: Some(e),
            }
        }
    };

    // Call Gemini API
    let generated_image_base64 =
        match call_gemini_api(api_key, prompt, &image_base64, &mime_type).await {
            Ok(data) => data,
            Err(e) => {
                return GenerationResult {
                    category: category.to_string(),
                    success: false,
                    image_path: None,
                    error_message: Some(e),
                }
            }
        };

    // Save generated image
    match save_generated_image(&generated_image_base64, category, collection_id) {
        Ok(saved_path) => GenerationResult {
            category: category.to_string(),
            success: true,
            image_path: Some(saved_path),
            error_message: None,
        },
        Err(e) => GenerationResult {
            category: category.to_string(),
            success: false,
            image_path: None,
            error_message: Some(e),
        },
    }
}

pub async fn generate_wallpaper_collection(
    request: GenerationRequest,
) -> Result<BatchGenerationResult, String> {
    println!("Received generation request for categories: {:?}", request.selected_categories);
    let mut results = Vec::new();
    let mut total_generated = 0;
    let mut total_failed = 0;

    // Load default prompts
    let default_prompts = load_default_prompts()?;

    // Collect only selected categories and their prompts
    let mut all_prompts = HashMap::new();

    // Process only selected categories
    for category in &request.selected_categories {
        let final_prompt = if let Some(custom_prompt) = request.prompts.get(category) {
            // Use custom prompt if provided
            custom_prompt.clone()
        } else if let Some(weather_prompt) = default_prompts.weather.get(category) {
            // Use default weather prompt
            weather_prompt.prompt.clone()
        } else if let Some(time_prompt) = default_prompts.time.get(category) {
            // Use default time prompt
            time_prompt.prompt.clone()
        } else {
            // Skip unknown categories
            println!(
                "Warning: Unknown category '{}' requested, skipping",
                category
            );
            continue;
        };

        all_prompts.insert(category.clone(), final_prompt);
    }

    // Generate variations for each category
    for (category, prompt) in all_prompts {
        println!("Generating variation for category: {}", category);

        let result =
            generate_single_variation(&request.api_key, &request.image_path, &category, &prompt, &request.collection_id)
                .await;

        if result.success {
            total_generated += 1;
        } else {
            total_failed += 1;
        }

        results.push(result);

        // Add delay between requests to avoid rate limiting
        sleep(Duration::from_millis(500)).await;
    }

    Ok(BatchGenerationResult {
        results,
        total_generated,
        total_failed,
    })
}

// Tauri commands
#[tauri::command]
pub async fn get_default_prompts() -> Result<PromptConfig, String> {
    load_default_prompts()
}

#[tauri::command]
pub async fn reset_ai_prompts() -> Result<String, String> {
    let app_data_dir = get_app_data_dir()?;
    let prompts_path = app_data_dir.join("ai-prompts.json");

    let default_config = create_default_prompts_config();
    save_prompts_config(&default_config, &prompts_path)?;

    Ok("AI prompts reset to defaults successfully".to_string())
}

#[tauri::command]
pub async fn save_ai_prompts(config: PromptConfig) -> Result<String, String> {
    let app_data_dir = get_app_data_dir()?;
    let prompts_path = app_data_dir.join("ai-prompts.json");

    save_prompts_config(&config, &prompts_path)?;

    Ok("AI prompts saved successfully".to_string())
}

#[tauri::command]
pub async fn generate_wallpaper_variations(
    request: GenerationRequest,
) -> Result<BatchGenerationResult, String> {
    generate_wallpaper_collection(request).await
}

#[tauri::command]
pub async fn open_wallpapers_folder() -> Result<String, String> {
    open_wallpapers_folder_impl(None).await
}

#[tauri::command]
pub async fn open_collection_folder(collection_id: String) -> Result<String, String> {
    open_wallpapers_folder_impl(Some(collection_id)).await
}

async fn open_wallpapers_folder_impl(collection_id: Option<String>) -> Result<String, String> {
    let app_data_dir = get_app_data_dir()?;
    let target_dir = match &collection_id {
        Some(id) => app_data_dir.join("wallpapers").join(id),
        None => app_data_dir.join("wallpapers").join("generated"),
    };

    // Create directory if it doesn't exist
    std::fs::create_dir_all(&target_dir)
        .map_err(|e| format!("Failed to create wallpapers directory: {}", e))?;

    // Open the folder using the system's default file manager
    #[cfg(target_os = "windows")]
    {
        std::process::Command::new("explorer")
            .arg(&target_dir)
            .spawn()
            .map_err(|e| format!("Failed to open folder: {}", e))?;
    }

    #[cfg(target_os = "macos")]
    {
        std::process::Command::new("open")
            .arg(&target_dir)
            .spawn()
            .map_err(|e| format!("Failed to open folder: {}", e))?;
    }

    #[cfg(target_os = "linux")]
    {
        std::process::Command::new("xdg-open")
            .arg(&target_dir)
            .spawn()
            .map_err(|e| format!("Failed to open folder: {}", e))?;
    }

    let folder_type = match &collection_id {
        Some(id) => format!("collection '{}' folder", id),
        None => "generated wallpapers folder".to_string(),
    };

    Ok(format!("Opened {}: {}", folder_type, target_dir.display()))
}

#[tauri::command]
pub async fn test_gemini_api(api_key: String) -> Result<String, String> {
    if api_key.trim().is_empty() {
        return Err("API key cannot be empty".to_string());
    }

    // Simple test request with minimal data
    let client = reqwest::Client::new();

    let test_request = serde_json::json!({
        "contents": [{
            "parts": [{
                "text": "Hello, this is a test request to verify API connectivity."
            }]
        }]
    });

    let response = client
        .post("https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent")
        .header("x-goog-api-key", &api_key)
        .header("Content-Type", "application/json")
        .json(&test_request)
        .send()
        .await
        .map_err(|e| format!("Network error: {}", e))?;

    if response.status().is_success() {
        Ok("API key is valid and working".to_string())
    } else if response.status().as_u16() == 401 {
        Err("Invalid API key".to_string())
    } else if response.status().as_u16() == 403 {
        Err("API key does not have permission to access Gemini API".to_string())
    } else {
        Err(format!(
            "API test failed with status: {}",
            response.status()
        ))
    }
}

#[tauri::command]
pub fn move_generated_image_to_collection(
    source_path: String,
    collection_id: String,
    category: String,
) -> Result<String, String> {
    let app_data_dir = get_app_data_dir()?;
    let collection_dir = app_data_dir.join("wallpapers").join(&collection_id);

    // Create collection directory if it doesn't exist
    fs::create_dir_all(&collection_dir)
        .map_err(|e| format!("Failed to create collection directory: {}", e))?;

    // Define destination path
    let filename = format!("{}.png", category);
    let dest_path = collection_dir.join(&filename);

    // Move the file from source to destination
    fs::copy(&source_path, &dest_path)
        .map_err(|e| format!("Failed to copy image: {}", e))?;

    // Remove the original file
    fs::remove_file(&source_path)
        .map_err(|e| format!("Failed to remove original image: {}", e))?;

    // Return the new absolute path
    Ok(dest_path.to_string_lossy().to_string())
}
