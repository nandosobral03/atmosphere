import { useState, useEffect } from 'react';
import { invoke } from '@tauri-apps/api/core';

export interface AppSettings {
  weather_api_key: string;
  location: string;
  use_auto_location: boolean;
  cache_duration_minutes: number;
}

export const useAppSettings = () => {
  const [settings, setSettings] = useState<AppSettings>({
    weather_api_key: '',
    location: '',
    use_auto_location: true,
    cache_duration_minutes: 60,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchSettings = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const result = await invoke('get_app_settings') as AppSettings;
      setSettings(result);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch settings';
      setError(errorMessage);
      console.error('Failed to fetch app settings:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const saveSettings = async (newSettings: AppSettings) => {
    if (!newSettings.weather_api_key.trim()) {
      throw new Error('Weather API key is required');
    }

    if (!newSettings.use_auto_location && !newSettings.location.trim()) {
      throw new Error('Location is required when auto-location is disabled');
    }

    try {
      setIsLoading(true);
      setError(null);
      await invoke('save_app_settings_cmd', { settings: newSettings });
      setSettings(newSettings);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to save settings';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const testWeatherApi = async () => {
    try {
      setIsLoading(true);
      setError(null);
      await invoke('test_weather_api');
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Weather API test failed';
      setError(errorMessage);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const clearWeatherCache = async () => {
    try {
      const result = await invoke('clear_weather_cache') as string;
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to clear weather cache';
      throw new Error(errorMessage);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  return {
    settings,
    setSettings,
    isLoading,
    error,
    saveSettings,
    testWeatherApi,
    clearWeatherCache,
    refetch: fetchSettings,
  };
};