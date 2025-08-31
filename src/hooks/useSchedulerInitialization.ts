import { useEffect } from "react";
import { invoke } from "@tauri-apps/api/core";

export function useSchedulerInitialization() {
  useEffect(() => {
    const initializeScheduler = async () => {
      try {
        const result = await invoke("initialize_scheduler") as string;
        console.log("Scheduler initialization:", result);
      } catch (error) {
        console.error("Failed to initialize scheduler:", error);
      }
    };

    // Initialize scheduler when the app starts
    initializeScheduler();
  }, []);
}