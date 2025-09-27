import { useState } from 'react';
import { Button } from '../ui/Button';
import { AppSettings } from '../../hooks/useAppSettings';

interface WeatherSettingsProps {
  settings: AppSettings;
  onSettingsChange: (settings: AppSettings) => void;
  onSave: () => Promise<void>;
  onTest: () => Promise<boolean>;
  onClearCache: () => Promise<void>;
  isLoading: boolean;
}

export const WeatherSettings = ({
  settings,
  onSettingsChange,
  onSave,
  onTest,
  onClearCache,
  isLoading,
}: WeatherSettingsProps) => {
  const [testResult, setTestResult] = useState<string>('');

  const handleTest = async () => {
    setTestResult('Testing...');
    const success = await onTest();
    setTestResult(success ? 'API test successful!' : 'API test failed');
    setTimeout(() => setTestResult(''), 3000);
  };

  const handleClearCache = async () => {
    try {
      await onClearCache();
      setTestResult('Weather cache cleared successfully');
      setTimeout(() => setTestResult(''), 3000);
    } catch (error) {
      setTestResult('Failed to clear cache');
      setTimeout(() => setTestResult(''), 3000);
    }
  };

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold">Weather Settings</h3>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">
            Weather API Key <span className="text-red-500">*</span>
          </label>
          <input
            type="password"
            value={settings.weather_api_key}
            onChange={e => onSettingsChange({ ...settings, weather_api_key: e.target.value })}
            className="w-full px-3 py-2 border border-border rounded-lg bg-surface"
            placeholder="Enter your WeatherAPI.com key"
          />
        </div>

        <div>
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={settings.use_auto_location}
              onChange={e => onSettingsChange({ ...settings, use_auto_location: e.target.checked })}
              className="rounded"
            />
            <span className="text-sm font-medium">Use automatic location detection</span>
          </label>
        </div>

        {!settings.use_auto_location && (
          <div>
            <label className="block text-sm font-medium mb-2">
              Manual Location <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={settings.location}
              onChange={e => onSettingsChange({ ...settings, location: e.target.value })}
              className="w-full px-3 py-2 border border-border rounded-lg bg-surface"
              placeholder="e.g., London, UK or 40.7128,-74.0060"
            />
          </div>
        )}

        <div>
          <label className="block text-sm font-medium mb-2">
            Cache Duration (minutes)
          </label>
          <input
            type="number"
            value={settings.cache_duration_minutes}
            onChange={e => onSettingsChange({ ...settings, cache_duration_minutes: parseInt(e.target.value) || 60 })}
            className="w-full px-3 py-2 border border-border rounded-lg bg-surface"
            min="1"
            max="1440"
          />
        </div>
      </div>

      <div className="flex gap-3">
        <Button onClick={onSave} disabled={isLoading}>
          {isLoading ? 'Saving...' : 'Save Settings'}
        </Button>
        <Button variant="secondary" onClick={handleTest} disabled={isLoading}>
          Test API
        </Button>
        <Button variant="secondary" onClick={handleClearCache} disabled={isLoading}>
          Clear Cache
        </Button>
      </div>

      {testResult && (
        <div className={`text-sm ${testResult.includes('failed') || testResult.includes('Failed') ? 'text-red-500' : 'text-green-500'}`}>
          {testResult}
        </div>
      )}
    </div>
  );
};