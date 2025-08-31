import { useState, useEffect } from "react";
import { invoke } from "@tauri-apps/api/core";
import { CurrentConditions } from "../types";

export function useCurrentConditions() {
  const [currentConditions, setCurrentConditions] = useState<CurrentConditions | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchCurrentConditions = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const conditions = await invoke("get_current_conditions") as CurrentConditions;
      setCurrentConditions(conditions);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to fetch current conditions";
      setError(errorMessage);
      console.error("Failed to fetch current conditions:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCurrentConditions();
    
    // Update conditions every minute
    const interval = setInterval(fetchCurrentConditions, 60000);
    
    return () => {
      clearInterval(interval);
    };
  }, []);

  return {
    currentConditions,
    isLoading,
    error,
    refetch: fetchCurrentConditions
  };
}