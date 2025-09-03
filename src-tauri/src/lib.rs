mod modules;

use modules::greet::greet;
use modules::weather::{get_current_conditions, get_time_periods, clear_weather_cache};
use modules::wallpaper::{set_wallpaper, copy_wallpaper_image, cleanup_unused_wallpapers};
use modules::scheduler::{start_wallpaper_scheduler, stop_wallpaper_scheduler, get_scheduler_status, initialize_scheduler, update_scheduler_collection_data};
use modules::settings::{get_app_settings, save_app_settings_cmd, test_weather_api};
use modules::backup::{export_backup, import_backup, write_backup_file, read_backup_file, get_backup_collections_data};
use tauri::{tray::TrayIconBuilder, Manager};

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_dialog::init())
        .setup(|app| {
            // Create system tray icon
            let _tray = TrayIconBuilder::new()
                .icon(app.default_window_icon().unwrap().clone())
                .tooltip("Wallpaper Thing")
                .on_tray_icon_event(|tray, event| {
                    match event {
                        tauri::tray::TrayIconEvent::Click {
                            button: tauri::tray::MouseButton::Left,
                            button_state: tauri::tray::MouseButtonState::Up,
                            ..
                        } => {
                            // Show/hide main window on left click
                            if let Some(window) = tray.app_handle().get_webview_window("main") {
                                if window.is_visible().unwrap_or(false) {
                                    let _ = window.hide();
                                } else {
                                    // Position window at bottom right before showing
                                    if let Ok(monitor) = window.current_monitor() {
                                        if let Some(monitor) = monitor {
                                            let screen_width = monitor.size().width as i32;
                                            let screen_height = monitor.size().height as i32;
                                            let window_width = 450;
                                            let window_height = 800;
                                            let x = screen_width - window_width - 10; // 20px from right edge
                                            let y = screen_height - window_height - 50; // 60px from bottom (for taskbar)

                                            let _ = window.set_position(tauri::Position::Physical(tauri::PhysicalPosition { x, y }));
                                        }
                                    }
                                    let _ = window.show();
                                    let _ = window.set_focus();
                                }
                            }
                        }
                        _ => {}
                    }
                })
                .build(app)?;

            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            greet,
            set_wallpaper,
            copy_wallpaper_image,
            cleanup_unused_wallpapers,
            get_current_conditions,
            clear_weather_cache,
            get_time_periods,
            start_wallpaper_scheduler,
            stop_wallpaper_scheduler,
            get_scheduler_status,
            initialize_scheduler,
            update_scheduler_collection_data,
            get_app_settings,
            save_app_settings_cmd,
            test_weather_api,
            export_backup,
            import_backup,
            write_backup_file,
            read_backup_file,
            get_backup_collections_data
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
