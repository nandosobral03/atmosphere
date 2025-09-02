import { useState, useEffect } from "react";
import { invoke } from "@tauri-apps/api/core";
import { save, open } from "@tauri-apps/plugin-dialog";
import { SchedulerControl } from "../components/SchedulerControl";
import { useNavigationStore } from "../store/navigationStore";
import { useCollectionStore } from "../store/collectionStore";
import { useThemeStore } from "../store/themeStore";
import { Icon } from "../components/ui/Icon";
import { Button } from "../components/ui/Button";

interface AppSettings {
  weather_api_key: string;
  location: string;
  use_auto_location: boolean;
  cache_duration_minutes: number;
}

export function SettingsPage() {
  const { setCurrentPage } = useNavigationStore();
  const collectionStore = useCollectionStore();
  const { theme, toggleTheme } = useThemeStore();
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
    <div className="p-4 space-y-6 relative bg-bg-primary backdrop-blur-sm min-h-screen">
      {/* Full-Screen Import Overlay */}
      {isImporting && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-card rounded-2xl p-8 max-w-md w-full mx-4 shadow-card-hover border border-border">
            <div className="text-center">
              <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <h3 className="text-lg font-semibold text-text-primary mb-2">Restoring Backup</h3>
              <p className="text-sm text-text-secondary mb-4">Please wait while we restore your settings, collections, and wallpapers...</p>
              <div className="text-xs text-text-secondary">This may take a few moments depending on the number of wallpapers.</div>
            </div>
          </div>
        </div>
      )}

      {/* Header with Back Button */}
      <div className="flex items-center space-x-3 mb-6">
        <button onClick={() => setCurrentPage("home")} className="p-2 rounded-xl text-text-primary hover:text-primary hover:bg-primary/10 transition-colors cursor-pointer border border-border hover:border-primary" title="Back to Home">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <h1 className="text-xl font-bold text-text-primary">Settings</h1>
      </div>

      {/* Status Message */}
      {message && (
        <div
          className={`p-4 rounded-2xl text-sm font-medium transition-all duration-300 animate-in slide-in-from-top shadow-sm ${
            message.includes("Error") || message.includes("failed") ? "bg-danger-light text-danger-hover border border-danger" : "bg-success-light text-success-hover border border-success"
          }`}
        >
          <div className="break-words text-center flex items-center justify-center space-x-2">
            <Icon name={message.includes("Error") || message.includes("failed") ? "settings" : "check"} size={16} />
            <span>{message}</span>
          </div>
        </div>
      )}

      {/* Weather API Settings */}
      <div className="bg-card rounded-2xl p-5 border border-border shadow-card hover:shadow-card-hover transition-all duration-200">
        <h3 className="text-lg font-semibold text-text-primary mb-4">Weather API Configuration</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-text-primary mb-2">
              WeatherAPI.com API Key <span className="text-danger">*</span>
            </label>
            <div className="flex space-x-3">
              <input
                type="password"
                value={settings.weather_api_key}
                onChange={(e) => setSettings({ ...settings, weather_api_key: e.target.value })}
                placeholder="Enter your WeatherAPI.com key"
                className="flex-1 px-3 py-2 border border-border rounded-xl bg-card text-text-primary text-sm focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200"
              />
              <Button onClick={testApiKey} disabled={isLoading} size="md">
                {isLoading ? (
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 border-2 border-text-inverse border-t-transparent rounded-full animate-spin"></div>
                    <span>Testing...</span>
                  </div>
                ) : (
                  <div className="flex items-center space-x-2">
                    <Icon name="check" size={16} />
                    <span>Test</span>
                  </div>
                )}
              </Button>
            </div>
            <p className="text-xs text-text-secondary mt-2 leading-relaxed">
              Get a free API key at{" "}
              <a href="https://www.weatherapi.com/signup.aspx" target="_blank" rel="noopener noreferrer" className="text-primary hover:text-primary-hover underline">
                weatherapi.com/signup
              </a>{" "}
              (1M calls/month free)
            </p>
          </div>
        </div>

        {/* Save API Key Button */}
        <div className="mt-6 pt-4 border-t border-border">
          <Button onClick={saveSettings} disabled={isLoading || isImporting} size="lg" className="w-full shadow-sm hover:shadow-md transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]">
            {isLoading ? (
              <div className="flex items-center justify-center space-x-2">
                <div className="w-4 h-4 border-2 border-text-inverse border-t-transparent rounded-full animate-spin"></div>
                <span>Saving API Settings...</span>
              </div>
            ) : isImporting ? (
              <div className="flex items-center justify-center space-x-2">
                <div className="w-4 h-4 border-2 border-text-inverse border-t-transparent rounded-full animate-spin"></div>
                <span>Import in Progress...</span>
              </div>
            ) : (
              "Save API Settings"
            )}
          </Button>
        </div>
      </div>

      {/* Location Settings */}
      <div className="bg-card rounded-2xl p-5 border border-border shadow-card hover:shadow-card-hover transition-all duration-200">
        <h3 className="text-lg font-semibold text-text-primary mb-4">Location Settings</h3>
        <div className="space-y-4">
          <div className="flex items-center p-3 rounded-xl bg-surface/50 border border-border/50">
            <input
              id="auto-location"
              type="checkbox"
              checked={settings.use_auto_location}
              onChange={(e) => setSettings({ ...settings, use_auto_location: e.target.checked })}
              className="w-4 h-4 text-white bg-card border border-border rounded-md focus:ring-primary focus:ring-2 accent-primary"
            />
            <label htmlFor="auto-location" className="ml-3 text-sm font-medium text-text-primary cursor-pointer">
              Auto-detect location via IP address
            </label>
          </div>

          {!settings.use_auto_location && (
            <div className="animate-in slide-in-from-top duration-300">
              <label className="block text-sm font-medium text-text-primary mb-2">
                Custom Location <span className="text-danger">*</span>
              </label>
              <input
                type="text"
                value={settings.location}
                onChange={(e) => setSettings({ ...settings, location: e.target.value })}
                placeholder="e.g., New York, London, 40.7128,-74.0060"
                className="w-full px-3 py-2 border border-border rounded-xl bg-card text-text-primary text-sm focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200"
              />
              <p className="text-xs text-text-secondary mt-2 leading-relaxed">City name, coordinates (lat,lon), or airport code</p>
            </div>
          )}
        </div>

        {/* Save Location Button */}
        <div className="mt-6 pt-4 border-t border-border">
          <Button onClick={saveSettings} disabled={isLoading || isImporting} size="lg" className="w-full shadow-sm hover:shadow-md transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]">
            {isLoading ? (
              <div className="flex items-center justify-center space-x-2">
                <div className="w-4 h-4 border-2 border-text-inverse border-t-transparent rounded-full animate-spin"></div>
                <span>Saving Location Settings...</span>
              </div>
            ) : isImporting ? (
              <div className="flex items-center justify-center space-x-2">
                <div className="w-4 h-4 border-2 border-text-inverse border-t-transparent rounded-full animate-spin"></div>
                <span>Import in Progress...</span>
              </div>
            ) : (
              "Save Location Settings"
            )}
          </Button>
        </div>
      </div>

      {/* Theme Settings */}
      <div className="bg-card rounded-2xl p-5 border border-border shadow-card hover:shadow-card-hover transition-all duration-200">
        <h3 className="text-lg font-semibold text-text-primary mb-4">Appearance</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-3 rounded-xl bg-surface/50 border border-border/50">
            <div className="flex items-center space-x-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Icon name={theme === "dark" ? "night" : "sunny"} size={20} className="text-primary" />
              </div>
              <div>
                <label className="text-sm font-medium text-text-primary cursor-pointer">Dark Mode</label>
                <p className="text-xs text-text-secondary">{theme === "dark" ? "Currently using dark theme" : "Currently using light theme"}</p>
              </div>
            </div>
            <button onClick={toggleTheme} className="relative inline-flex items-center cursor-pointer">
              <div className={`w-12 h-6 rounded-full transition-colors ${theme === "dark" ? "bg-primary" : "bg-border"}`}>
                <div className={`w-4 h-4 bg-white rounded-full shadow-md transform transition-transform ${theme === "dark" ? "translate-x-7" : "translate-x-1"} mt-1`} />
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* Scheduler Settings */}

      <SchedulerControl />

      {/* Cache Management */}
      <div className="bg-card rounded-2xl p-5 border border-border shadow-card hover:shadow-card-hover transition-all duration-200">
        <h3 className="text-lg font-semibold text-text-primary mb-4">Cache Management</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-text-primary mb-2">Cache Duration</label>
            <select
              value={settings.cache_duration_minutes}
              onChange={(e) => setSettings({ ...settings, cache_duration_minutes: parseInt(e.target.value) })}
              className="w-full px-3 py-2 border border-border rounded-xl bg-card text-text-primary text-sm focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200"
            >
              <option value={5}>5 minutes</option>
              <option value={10}>10 minutes</option>
              <option value={30}>30 minutes</option>
              <option value={45}>45 minutes</option>
              <option value={60}>60 minutes</option>
            </select>
            <p className="text-xs text-text-secondary mt-2 leading-relaxed">Weather data is cached to reduce API calls. Shorter duration = more up-to-date data but more API usage.</p>
          </div>
          <div>
            <Button onClick={clearWeatherCache} variant="secondary" className="shadow-sm hover:shadow-md transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] cursor-pointer">
              Clear Weather Cache
            </Button>
          </div>
        </div>
      </div>

      {/* Backup & Restore */}
      <div className="bg-card rounded-2xl p-5 border border-border shadow-card hover:shadow-card-hover transition-all duration-200">
        <h3 className="text-lg font-semibold text-text-primary mb-4">Backup & Restore</h3>
        <div className="space-y-4">
          <div>
            <p className="text-sm text-text-secondary mb-4 leading-relaxed">Export your settings and wallpapers to a backup file, or restore from a previous backup.</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                onClick={exportBackup}
                disabled={isImporting}
                className="bg-primary hover:bg-primary-hover disabled:bg-border disabled:cursor-not-allowed text-text-inverse font-medium py-3 px-4 rounded-xl text-sm transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] shadow-sm hover:shadow-md flex items-center justify-center space-x-2 cursor-pointer"
              >
                <Icon name="upload" size={16} className="text-text-inverse" />
                <span>Export Backup</span>
              </button>
              <button
                onClick={importBackup}
                disabled={isImporting}
                className="bg-primary hover:bg-primary-hover disabled:bg-border disabled:cursor-not-allowed text-text-inverse font-medium py-3 px-4 rounded-xl text-sm transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] shadow-sm hover:shadow-md flex items-center justify-center space-x-2 cursor-pointer"
              >
                {isImporting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-text-inverse border-t-transparent rounded-full animate-spin"></div>
                    <span>Importing...</span>
                  </>
                ) : (
                  <>
                    <Icon name="download" size={16} className="text-text-inverse" />
                    <span>Import Backup</span>
                  </>
                )}
              </button>
            </div>
            <div className="mt-4 p-3 bg-warning-light/30 border border-warning/20 rounded-xl">
              <div className="flex items-start space-x-2">
                <Icon name="settings" size={16} className="text-warning mt-0.5 flex-shrink-0" />
                <p className="text-xs text-text-secondary leading-relaxed">
                  <strong className="text-warning">Important:</strong> Importing will replace your current settings and collections. Make sure to export a backup first!
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
