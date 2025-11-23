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
      const result = (await invoke("get_scheduler_status")) as SchedulerStatus;
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
      <div className="bg-card rounded-xl p-4 border border-border shadow-card">
        <div className="text-center text-text-secondary">Loading scheduler status...</div>
      </div>
    );
  }

  return (
    <div className="bg-card rounded-xl p-4 border border-border shadow-card">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-lg font-semibold text-text-primary">Auto Wallpaper</h3>
        <div
          className={`px-2 py-1 rounded-full text-xs font-medium ${
            status.enabled && status.is_running
              ? "bg-success-light text-success-hover"
              : "bg-danger-light text-danger-hover"
          }`}
        >
          {status.enabled && status.is_running ? "ACTIVE" : "INACTIVE"}
        </div>
      </div>

      <p className="text-sm text-text-secondary mb-4">
        Automatically changes wallpaper based on weather and time conditions
      </p>

      <div className="space-y-4">
        {/* Interval Control */}
        <div>
          <label className="block text-sm font-medium text-text-primary mb-2">
            Check Interval: {intervalMinutes} minutes
          </label>
          <input
            type="range"
            min="1"
            max="30"
            value={intervalMinutes}
            onChange={e => setIntervalMinutes(parseInt(e.target.value))}
            disabled={status.enabled && status.is_running}
            className="w-full h-2 bg-surface rounded-full appearance-none cursor-pointer slider disabled:cursor-not-allowed"
          />
          <div className="flex justify-between text-xs text-text-secondary mt-1">
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
              className="flex-1 bg-danger hover:bg-danger-hover disabled:bg-border text-text-inverse font-medium py-2 px-4 rounded-lg text-sm transition-colors disabled:cursor-not-allowed cursor-pointer"
            >
              {isLoading ? "Stopping..." : "Stop Auto Wallpaper"}
            </button>
          ) : (
            <button
              onClick={startScheduler}
              disabled={isLoading}
              className="flex-1 bg-primary hover:bg-primary-hover disabled:bg-border text-text-inverse font-medium py-2 px-4 rounded-lg text-sm transition-colors disabled:cursor-not-allowed cursor-pointer"
            >
              {isLoading ? "Starting..." : "Start Auto Wallpaper"}
            </button>
          )}

          <button
            onClick={fetchStatus}
            disabled={isLoading}
            className="px-4 py-2 bg-primary hover:bg-primary-hover disabled:bg-border text-text-inverse rounded-lg text-sm transition-colors disabled:cursor-not-allowed cursor-pointer"
            title="Refresh status"
          >
            <Icon name="loading" size={16} className="text-text-inverse" />
          </button>
        </div>

        {/* Status Info */}
        {status.last_applied_path && (
          <div className="text-xs text-text-secondary bg-surface p-2 rounded">
            <span className="font-medium">Last applied:</span>{" "}
            {status.last_applied_path.split("\\").pop()}
          </div>
        )}
      </div>
    </div>
  );
}
