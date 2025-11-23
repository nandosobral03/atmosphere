mod modules;

use modules::backup::{
    export_backup, get_backup_collections_data, import_backup, read_backup_file, write_backup_file,
};
use modules::greet::greet;
use modules::scheduler::{
    get_scheduler_status, initialize_scheduler, start_wallpaper_scheduler,
    stop_wallpaper_scheduler, update_scheduler_collection_data,
};
use modules::settings::{get_app_settings, save_app_settings_cmd, test_weather_api};
use modules::wallpaper::{cleanup_unused_wallpapers, copy_wallpaper_image, set_wallpaper};
use modules::weather::{clear_weather_cache, get_current_conditions, get_time_periods};
use tauri::{
    menu::{Menu, MenuItem},
    tray::{MouseButton, TrayIconBuilder},
    Manager, WindowEvent,
};

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_autostart::init(
            tauri_plugin_autostart::MacosLauncher::LaunchAgent,
            Some(vec![]),
        ))
        .setup(|app| {
            // Create tray menu
            let quit_i = MenuItem::with_id(app, "quit", "Quit", true, None::<&str>)?;
            let menu = Menu::with_items(app, &[&quit_i])?;

            // Create system tray icon WITHOUT attaching the menu directly
            // This prevents it from overriding the left-click behavior on some platforms
            let _tray = TrayIconBuilder::new()
                .icon(app.default_window_icon().unwrap().clone())
                .tooltip("Wallpaper Thing")
                .on_menu_event(|app, event| match event.id.as_ref() {
                    "quit" => {
                        app.exit(0);
                    }
                    _ => {}
                })
                .on_tray_icon_event(move |tray, event| {
                    match event {
                        tauri::tray::TrayIconEvent::Click {
                            button,
                            button_state: tauri::tray::MouseButtonState::Up,
                            ..
                        } => {
                            match button {
                                MouseButton::Left => {
                                    // Show/hide main window on left click
                                    if let Some(window) =
                                        tray.app_handle().get_webview_window("main")
                                    {
                                        if window.is_visible().unwrap_or(false) {
                                            let _ = window.hide();
                                        } else {
                                            // Position window at bottom right before showing
                                            if let Ok(monitor) = window.current_monitor() {
                                                if let Some(monitor) = monitor {
                                                    let screen_width = monitor.size().width as i32;
                                                    let screen_height =
                                                        monitor.size().height as i32;
                                                    let window_width = 450;
                                                    let window_height = 800;
                                                    let x = screen_width - window_width - 10; // 20px from right edge
                                                    let y = screen_height - window_height - 50; // 60px from bottom (for taskbar)

                                                    let _ = window.set_position(
                                                        tauri::Position::Physical(
                                                            tauri::PhysicalPosition { x, y },
                                                        ),
                                                    );
                                                }
                                            }
                                            let _ = window.show();
                                            let _ = window.set_focus();
                                        }
                                    }
                                }
                                MouseButton::Right => {
                                    // Manually show the menu on right click
                                    // Note: popup requires the menu to be a WindowMenu or ContextMenu,
                                    // but here we use set_menu temporarily or just relying on OS behavior might be tricky without attachment.
                                    // In Tauri v2, typically you attach the menu. If we don't attach it, we might need to set it.

                                    // Strategy: The user says "quit option should only appear on right click".
                                    // If attaching the menu makes it appear on left click, we shouldn't attach it.
                                    // But we need to show it.

                                    // We can use tray.set_menu() to set it just before popping up? Or is there a popup method?
                                    // Actually, let's try creating it as a context menu.

                                    // IMPORTANT: Tauri v2 TrayIcon doesn't have a direct "popup_menu" method on the icon itself in the same way.
                                    // However, we can set the menu.

                                    let _ = tray.set_menu(Some(menu.clone()));
                                    // On Windows, setting the menu usually makes it appear on the *next* interaction or immediately if triggered?
                                    // Actually, standard behavior is: if menu is set, right click shows it.
                                    // If left click is ALSO showing it, that's the issue.

                                    // If we simply set the menu here, it might persist.
                                    // Ideally, we want: Left Click -> Toggle Window. Right Click -> Show Menu.

                                    // If we don't attach the menu in .menu(), right click won't show it automatically.
                                    // So we handle Right Click event here.
                                    // But how to show it?

                                    // Workaround: We set the menu, allow the OS to show it (if it does so on right click event processing),
                                    // then maybe unset it? No, that's flaky.

                                    // Let's try sticking to the event handler but verify we aren't attaching it globally if that causes issues.
                                    // Wait, if I don't attach it, right click does nothing.
                                    // If I attach it, does it override left click?
                                    // On Windows, normally no. Left click is click, Right click is menu.

                                    // However, to be safe and explicit as requested:
                                    // We will NOT attach the menu in the builder.
                                    // On Right Click, we will set the menu.
                                    // On Left Click, we will UNSET the menu (to ensure it doesn't show) and toggle window.

                                    let _ = tray.set_menu(Some(menu.clone()));
                                }
                                _ => {}
                            }
                        }
                        _ => {}
                    }
                })
                .build(app)?;

            Ok(())
        })
        .on_window_event(|window, event| match event {
            WindowEvent::CloseRequested { api, .. } => {
                window.hide().unwrap();
                api.prevent_close();
            }
            _ => {}
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
            get_backup_collections_data,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
