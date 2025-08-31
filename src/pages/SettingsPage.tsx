import { useState, useEffect } from "react";
import { invoke } from "@tauri-apps/api/core";
import { save, open } from "@tauri-apps/plugin-dialog";
import { SchedulerControl } from "../components/SchedulerControl";
import { useNavigationStore } from "../store/navigationStore";
import { useCollectionStore } from "../store/collectionStore";
import { Icon } from "../components/ui/Icon";

interface AppSettings {
  weather_api_key: string;
  location: string;
  use_auto_location: boolean;
  cache_duration_minutes: number;
}

export function SettingsPage() {
  const { setCurrentPage } = useNavigationStore();
  const collectionStore = useCollectionStore();
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
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

  const exportBackup = async () => {
    try {
      const timestamp = new Date().toISOString().split("T")[0];
      const defaultFilename = `wallpaperthing-backup-${timestamp}.zip`;

      const savePath = await save({
        filters: [
          {
            name: "Wallpaper Backup",
            extensions: ["zip"],
          },
        ],
        defaultPath: defaultFilename,
      });

      if (!savePath) {
        return; // User cancelled
      }

      // Get collections data from the store
      const collectionsData = JSON.stringify({
        collections: collectionStore.collections,
        activeCollectionId: collectionStore.activeCollectionId,
      });

      const zipData = (await invoke("export_backup", {
        collectionsData,
      })) as number[];
      const uint8Array = new Uint8Array(zipData);

      // Write the ZIP file using Tauri's file system
      await invoke("write_backup_file", {
        path: savePath,
        data: Array.from(uint8Array),
      });

      setMessageWithAutoDismiss("Backup exported successfully!");
    } catch (error) {
      setMessageWithAutoDismiss(`Export failed: ${error}`, true);
    }
  };

  const importBackup = async () => {
    try {
      const filePath = await open({
        filters: [
          {
            name: "Wallpaper Backup",
            extensions: ["zip"],
          },
        ],
        multiple: false,
      });

      if (!filePath) {
        return; // User cancelled
      }

      setIsImporting(true);
      setMessageWithAutoDismiss("Reading backup file...");

      // Read the ZIP file as binary data
      const fileData = (await invoke("read_backup_file", { path: filePath })) as number[];
      const zipData = new Uint8Array(fileData);

      setMessageWithAutoDismiss("Restoring settings and wallpapers...");

      // First restore the backend data (settings, scheduler, wallpapers)
      const result = (await invoke("import_backup", { zipData: Array.from(zipData) })) as string;

      // Then restore collections data if present
      const collectionsDataStr = (await invoke("get_backup_collections_data", {
        zipData: Array.from(zipData),
      })) as string | null;

      if (collectionsDataStr) {
        try {
          const collectionsData = JSON.parse(collectionsDataStr);

          // Restore the entire collections state
          useCollectionStore.setState({
            collections: collectionsData.collections || {},
            activeCollectionId: collectionsData.activeCollectionId || null,
          });

          setMessageWithAutoDismiss(result + "\nCollections restored successfully!");
        } catch (error) {
          setMessageWithAutoDismiss(result + "\nWarning: Failed to restore collections data.", true);
        }
      } else {
        setMessageWithAutoDismiss(result);
      }

      // Comprehensive refresh of all app data
      await refreshAllAppData();
    } catch (error) {
      setMessageWithAutoDismiss(`Import failed: ${error}`, true);
    } finally {
      setIsImporting(false);
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
      setMessageWithAutoDismiss("API key test successful! ✓");
    } catch (error) {
      setMessageWithAutoDismiss(`API test failed: ${error}`, true);
    } finally {
      setIsLoading(false);
    }
  };

  const refreshAllAppData = async () => {
    try {
      // Refresh settings
      await fetchSettings();

      // Clear weather cache to force refresh of current conditions
      await invoke("clear_weather_cache");

      // The app will automatically refresh current conditions and scheduler status
      // when the user navigates back or when useCurrentConditions hook re-runs

      // Trigger a small delay to allow backend to process changes
      await new Promise((resolve) => setTimeout(resolve, 500));
    } catch (error) {
      console.error("Error refreshing app data:", error);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  return (
    <div className="p-4 space-y-6 relative">
      {/* Full-Screen Import Overlay */}
      {isImporting && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-8 max-w-md w-full mx-4 shadow-2xl border border-gray-200 dark:border-gray-600">
            <div className="text-center">
              <div className="w-16 h-16 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Restoring Backup</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">Please wait while we restore your settings, collections, and wallpapers...</p>
              <div className="text-xs text-gray-500 dark:text-gray-500">This may take a few moments depending on the number of wallpapers.</div>
            </div>
          </div>
        </div>
      )}

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
      <button
        onClick={saveSettings}
        disabled={isLoading || isImporting}
        className="bg-cyan-500 hover:bg-cyan-600 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-semibold px-8 py-3 rounded-lg text-sm transition-colors w-full"
      >
        {isLoading ? "Saving..." : isImporting ? "Import in Progress..." : "Save Settings"}
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
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Cache Duration</label>
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
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Weather data is cached to reduce API calls. Shorter duration = more up-to-date data but more API usage.</p>
          </div>
          <div>
            <button onClick={clearWeatherCache} className="bg-orange-500 hover:bg-orange-600 text-white font-medium py-2 px-4 rounded-lg text-sm transition-colors">
              Clear Weather Cache
            </button>
          </div>
        </div>
      </div>

      {/* Backup & Restore */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Backup & Restore</h3>
        <div className="space-y-4">
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">Export your settings and wallpapers to a backup file, or restore from a previous backup.</p>
            <div className="flex space-x-3">
              <button onClick={exportBackup} disabled={isImporting} className="bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-medium py-2 px-4 rounded-lg text-sm transition-colors flex items-center space-x-2">
                <Icon name="upload" size={16} className="text-white" />
                <span>Export Backup</span>
              </button>
              <button
                onClick={importBackup}
                disabled={isImporting}
                className="bg-green-500 hover:bg-green-600 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-medium py-2 px-4 rounded-lg text-sm transition-colors flex items-center space-x-2"
              >
                {isImporting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Importing...</span>
                  </>
                ) : (
                  <>
                    <Icon name="download" size={16} className="text-white" />
                    <span>Import Backup</span>
                  </>
                )}
              </button>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
              <strong>Note:</strong> Importing will replace your current settings and collections. Make sure to export a backup first!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
