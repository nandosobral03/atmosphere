import { useState, useEffect } from "react";
import { invoke } from "@tauri-apps/api/core";
import { useErrorHandler } from "./useErrorHandler";

interface SchedulerStatus {
  enabled: boolean;
  interval_minutes: number;
  is_running: boolean;
  last_applied_path: string | null;
}

export const useSchedulerStatus = () => {
  const [schedulerStatus, setSchedulerStatus] = useState<SchedulerStatus | null>(null);
  const { error, isLoading, handleAsync, clearError } = useErrorHandler();

  const fetchSchedulerStatus = async () => {
    const result = await handleAsync(
      () => invoke("get_scheduler_status") as Promise<SchedulerStatus>,
      (data) => setSchedulerStatus(data),
      (error) => console.error("Failed to fetch scheduler status:", error)
    );
    return result;
  };

  useEffect(() => {
    fetchSchedulerStatus();
    const interval = setInterval(fetchSchedulerStatus, 30000);
    return () => clearInterval(interval);
  }, []);

  return { 
    schedulerStatus, 
    fetchSchedulerStatus, 
    error, 
    isLoading, 
    clearError 
  };
};