import { useState, useEffect } from "react";
import { invoke } from "@tauri-apps/api/core";
import { TimePeriodsResponse } from "../types";

export function useTimePeriods() {
  const [timePeriods, setTimePeriods] = useState<TimePeriodsResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchTimePeriods = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const periods = await invoke("get_time_periods") as TimePeriodsResponse;
      setTimePeriods(periods);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to fetch time periods";
      setError(errorMessage);
      console.error("Failed to fetch time periods:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTimePeriods();
    
    // Update time periods every minute
    const interval = setInterval(fetchTimePeriods, 60000);
    
    return () => {
      clearInterval(interval);
    };
  }, []);

  return {
    timePeriods,
    isLoading,
    error,
    refetch: fetchTimePeriods
  };
}