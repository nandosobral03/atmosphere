import { useState, useEffect } from "react";
import { invoke } from "@tauri-apps/api/core";
import { SchedulerControl } from "../components/SchedulerControl";
import { useNavigationStore } from "../store/navigationStore";

interface AppSettings {
  weather_api_key: string;
  location: string;
  use_auto_location: boolean;
  cache_duration_minutes: number;
}

export function SettingsPage() {
  const { setCurrentPage } = useNavigationStore();
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [settings, setSettings] = useState<AppSettings>({
    weather_api_key: "",
    location: "",
    use_auto_location: true,
    cache_duration_minutes: 60,
  });

  const setMessageWithAutoDismiss = (msg: string, isError = false) => {
    setMessage(msg);
    setTimeout(() => setMessage(""), isError ? 5000 : 3000);
  };

  const fetchSettings = async () => {
    try {
      const result = (await invoke("get_app_settings")) as AppSettings;
      setSettings(result);
    } catch (error) {
      console.error("Failed to fetch app settings:", error);
      setMessageWithAutoDismiss(`Error loading settings: ${error}`, true);
    }
  };

  const saveSettings = async () => {
    if (!settings.weather_api_key.trim()) {
      setMessageWithAutoDismiss("Weather API key is required", true);
      return;
    }

    if (!settings.use_auto_location && !settings.location.trim()) {
      setMessageWithAutoDismiss("Location is required when auto-location is disabled", true);
      return;
    }

    setIsLoading(true);
    try {
      await invoke("save_app_settings_cmd", { settings });
      setMessageWithAutoDismiss("Settings saved successfully!");
    } catch (error) {
      setMessageWithAutoDismiss(`Error saving settings: ${error}`, true);
    } finally {
      setIsLoading(false);
    }
  };

  const clearWeatherCache = async () => {
    try {
      const result = (await invoke("clear_weather_cache")) as string;
      setMessageWithAutoDismiss(result);
    } catch (error) {
      setMessageWithAutoDismiss(`Error: ${error}`, true);
    }
  };

  const cleanupUnusedWallpapers = async () => {
    try {
      const result = (await invoke("cleanup_unused_wallpapers", { usedCategories: [] })) as string;
      setMessageWithAutoDismiss(result);
    } catch (error) {
      setMessageWithAutoDismiss(`Error: ${error}`, true);
    }
  };

  const testApiKey = async () => {
    if (!settings.weather_api_key.trim()) {
      setMessageWithAutoDismiss("Enter an API key first", true);
      return;
    }

    setIsLoading(true);
    try {
      await invoke("test_weather_api", {
        apiKey: settings.weather_api_key,
        location: settings.use_auto_location ? "auto:ip" : settings.location,
      });
      setMessageWithAutoDismiss("API key test successful! ✅");
    } catch (error) {
      setMessageWithAutoDismiss(`API test failed: ${error}`, true);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  return (
    <div className="p-4 space-y-6">
      {/* Header with Back Button */}
      <div className="flex items-center space-x-3 mb-4">
        <button onClick={() => setCurrentPage("home")} className="p-2 rounded-lg text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors" title="Back to Home">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Settings</span>
      </div>

      {/* Status Message */}
      {message && (
        <div
          className={`p-3 rounded-lg text-sm font-medium transition-all duration-300 ${
            message.includes("Error") || message.includes("failed")
              ? "bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-800"
              : "bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 border border-green-200 dark:border-green-800"
          }`}
        >
          <div className="break-words text-center">{message}</div>
        </div>
      )}

      {/* Weather API Settings */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Weather API Configuration</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              WeatherAPI.com API Key <span className="text-red-500">*</span>
            </label>
            <div className="flex space-x-2">
              <input
                type="password"
                value={settings.weather_api_key}
                onChange={(e) => setSettings({ ...settings, weather_api_key: e.target.value })}
                placeholder="Enter your WeatherAPI.com key"
                className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
              />
              <button onClick={testApiKey} disabled={isLoading} className="px-4 py-2 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white rounded-lg text-sm transition-colors disabled:cursor-not-allowed">
                Test
              </button>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Get a free API key at{" "}
              <a href="https://www.weatherapi.com/signup.aspx" target="_blank" rel="noopener noreferrer" className="text-cyan-500 hover:text-cyan-400">
                weatherapi.com/signup
              </a>{" "}
              (1M calls/month free)
            </p>
          </div>
        </div>
      </div>

      {/* Location Settings */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Location Settings</h3>
        <div className="space-y-4">
          <div className="flex items-center">
            <input
              id="auto-location"
              type="checkbox"
              checked={settings.use_auto_location}
              onChange={(e) => setSettings({ ...settings, use_auto_location: e.target.checked })}
              className="w-4 h-4 text-cyan-600 bg-gray-100 border-gray-300 rounded focus:ring-cyan-500 focus:ring-2"
            />
            <label htmlFor="auto-location" className="ml-2 text-sm font-medium text-gray-700 dark:text-gray-300">
              Auto-detect location via IP address
            </label>
          </div>

          {!settings.use_auto_location && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Custom Location <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={settings.location}
                onChange={(e) => setSettings({ ...settings, location: e.target.value })}
                placeholder="e.g., New York, London, 40.7128,-74.0060"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">City name, coordinates (lat,lon), or airport code</p>
            </div>
          )}
        </div>
      </div>

      {/* Save Button */}
      <button onClick={saveSettings} disabled={isLoading} className="bg-cyan-500 hover:bg-cyan-600 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-semibold px-8 py-3 rounded-lg text-sm transition-colors w-full">
        {isLoading ? "Saving..." : "Save Settings"}
      </button>
      {/* Scheduler Settings */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Auto Wallpaper Scheduler</h3>
        <SchedulerControl />
      </div>

      {/* Cache Management */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Cache Management</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Cache Duration
            </label>
            <select
              value={settings.cache_duration_minutes}
              onChange={(e) => setSettings({ ...settings, cache_duration_minutes: parseInt(e.target.value) })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
            >
              <option value={5}>5 minutes</option>
              <option value={10}>10 minutes</option>
              <option value={30}>30 minutes</option>
              <option value={45}>45 minutes</option>
              <option value={60}>60 minutes</option>
            </select>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Weather data is cached to reduce API calls. Shorter duration = more up-to-date data but more API usage.
            </p>
          </div>
          <div>
            <button onClick={clearWeatherCache} className="bg-orange-500 hover:bg-orange-600 text-white font-medium py-2 px-4 rounded-lg text-sm transition-colors">
              Clear Weather Cache
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
