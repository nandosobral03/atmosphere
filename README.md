# Wallpaper Thing

An intelligent desktop wallpaper manager that automatically changes your wallpaper based on time of day and weather conditions.

![Wallpaper Thing Interface](public/images/app-preview.png)

## Features

- **Time-Based Wallpapers**: Automatically switch wallpapers for dawn, morning, midday, afternoon, dusk, evening, night, and late night
- **Weather-Aware**: Dynamic wallpaper changes based on current weather conditions (rain, thunderstorm, snow, cloudy, sunny, fog)
- **Collections System**: Organize multiple wallpaper sets for different moods or themes
- **Smart Priority**: Weather conditions override time periods for more contextual wallpapers
- **System Tray Integration**: Background operation with convenient access from your system tray
- **Auto-Start**: Option to automatically launch on system startup
- **Backup & Export**: Save and share your wallpaper collections
- **Modern Interface**: Clean, intuitive glass-morphism UI built with Tauri and React

## Installation

### Download Release

The easiest way to install Wallpaper Thing is to download the latest release for your operating system:

1. Go to the **[Releases Page](https://github.com/nandosobral03/atmosphere/releases)** on GitHub.
2. Download the installer for your platform:
   - **Windows**: `wallpaperthing_x.x.x_x64-setup.exe` or `.msi`
   - **macOS**: `.dmg` or `.app.tar.gz` (if available)
   - **Linux**: `.deb` or `.AppImage` (if available)
3. Run the installer and follow the prompts.
4. Launch Wallpaper Thing from your applications menu.

> **Note**: Since this app is not signed with an expensive certificate, you might see a "Windows protected your PC" warning. Click "More info" -> "Run anyway" to proceed.

## Quick Start Guide

### 1. Get a Weather API Key

Wallpaper Thing uses WeatherAPI.com for accurate weather data. It's free for personal use!

**[Read our guide on how to get your free API key](WEATHER_API_SETUP.md)**

### 2. Initial Configuration

1. Launch the app. It will sit in your system tray (look for the icon).
2. Click the tray icon or right-click and select "Open" to view the interface.
3. Go to **Settings**.
4. Paste your **WeatherAPI.com API Key**.
5. Configure your **Location** (or enable "Auto-detect via IP").
6. (Optional) Enable "Run on Startup" to keep your wallpapers syncing after reboot.

### 3. Create Your First Collection

1. Go to the **Collections** tab.
2. Click **"New Collection"** and give it a name (e.g., "Nature", "Pixel Art").
3. You'll see tabs for **Weather** and **Time**.
4. Click "Select Image" for various conditions:
   - Set a cozy rainy image for **Rain**.
   - Set a bright landscape for **Sunny**.
   - Set a dark night scene for **Night**.
   - **Default**: This is your fallback image when no specific conditions match.

### 4. Activate & Enjoy

1. Go to the **Home** tab.
2. The scheduler is active by default (checking every 30 minutes).
3. You can see the **Active Wallpaper**, current weather, and next scheduled check.
4. Close the window to minimize it to the tray. It will run quietly in the background.

## How Priority Works

The app uses a smart priority system to decide which wallpaper to show:

1.  **Severe Weather** (Thunderstorm, Snow) has the **highest priority**.
2.  **Common Weather** (Rain, Fog) has **high priority**.
3.  **Time of Day** (Dawn, Dusk) has **medium priority**.
4.  **General Weather** (Cloudy, Sunny) has **lower priority**.
5.  **Default** is the fallback.

You can adjust these priorities manually in the Collections tab if you prefer your "Sunset" wallpaper to override "Rainy" weather, for example!

## Development

If you want to build it from source:

```bash
# Install dependencies
npm install

# Run in development mode
npm run tauri dev

# Build for production
npm run tauri build
```

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

If you encounter any bugs or have feature requests, please open an issue on the [GitHub Issues page](https://github.com/nandosobral03/atmosphere/issues).

---

_Made with love for people who appreciate the perfect wallpaper for every moment._
