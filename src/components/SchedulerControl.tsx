import { useState, useEffect } from "react";
import { invoke } from "@tauri-apps/api/core";
import { Icon } from "./ui/Icon";

interface SchedulerStatus {
  enabled: boolean;
  interval_minutes: number;
  is_running: boolean;
  last_applied_path: string | null;
}

export function SchedulerControl() {
  const [status, setStatus] = useState<SchedulerStatus | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [intervalMinutes, setIntervalMinutes] = useState(3);

  const fetchStatus = async () => {
    try {
      const result = await invoke("get_scheduler_status") as SchedulerStatus;
      setStatus(result);
      setIntervalMinutes(result.interval_minutes);
    } catch (error) {
      console.error("Failed to fetch scheduler status:", error);
    }
  };

  const startScheduler = async () => {
    setIsLoading(true);
    try {
      await invoke("start_wallpaper_scheduler", { intervalMinutes });
      await fetchStatus();
    } catch (error) {
      console.error("Failed to start scheduler:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const stopScheduler = async () => {
    setIsLoading(true);
    try {
      await invoke("stop_wallpaper_scheduler");
      await fetchStatus();
    } catch (error) {
      console.error("Failed to stop scheduler:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStatus();
    
    // Refresh status every 30 seconds
    const interval = setInterval(fetchStatus, 30000);
    return () => clearInterval(interval);
  }, []);

  if (!status) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
        <div className="text-center text-gray-500 dark:text-gray-400">
          Loading scheduler status...
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Auto Wallpaper
        </h3>
        <div className={`px-2 py-1 rounded-full text-xs font-medium ${
          status.enabled && status.is_running 
            ? 'bg-green-100 dark:bg-green-800 text-green-700 dark:text-green-300'
            : 'bg-red-100 dark:bg-red-800 text-red-700 dark:text-red-300'
        }`}>
          {status.enabled && status.is_running ? 'ACTIVE' : 'INACTIVE'}
        </div>
      </div>

      <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
        Automatically changes wallpaper based on weather and time conditions
      </p>

      <div className="space-y-4">
        {/* Interval Control */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Check Interval: {intervalMinutes} minutes
          </label>
          <input
            type="range"
            min="1"
            max="30"
            value={intervalMinutes}
            onChange={(e) => setIntervalMinutes(parseInt(e.target.value))}
            disabled={status.enabled && status.is_running}
            className="w-full h-2 bg-gray-200 dark:bg-gray-600 rounded-lg appearance-none cursor-pointer slider disabled:cursor-not-allowed"
          />
          <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
            <span>1 min</span>
            <span>15 min</span>
            <span>30 min</span>
          </div>
        </div>

        {/* Control Buttons */}
        <div className="flex space-x-2">
          {status.enabled && status.is_running ? (
            <button
              onClick={stopScheduler}
              disabled={isLoading}
              className="flex-1 bg-red-500 hover:bg-red-600 disabled:bg-gray-400 text-white font-medium py-2 px-4 rounded-lg text-sm transition-colors disabled:cursor-not-allowed"
            >
              {isLoading ? "Stopping..." : "Stop Auto Wallpaper"}
            </button>
          ) : (
            <button
              onClick={startScheduler}
              disabled={isLoading}
              className="flex-1 bg-green-500 hover:bg-green-600 disabled:bg-gray-400 text-white font-medium py-2 px-4 rounded-lg text-sm transition-colors disabled:cursor-not-allowed"
            >
              {isLoading ? "Starting..." : "Start Auto Wallpaper"}
            </button>
          )}
          
          <button
            onClick={fetchStatus}
            disabled={isLoading}
            className="px-4 py-2 bg-gray-500 hover:bg-gray-600 disabled:bg-gray-400 text-white rounded-lg text-sm transition-colors disabled:cursor-not-allowed"
            title="Refresh status"
          >
            <Icon name="loading" size={16} className="text-white" />
          </button>
        </div>

        {/* Status Info */}
        {status.last_applied_path && (
          <div className="text-xs text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-700 p-2 rounded">
            <span className="font-medium">Last applied:</span> {status.last_applied_path.split('\\').pop()}
          </div>
        )}
      </div>
    </div>
  );
}