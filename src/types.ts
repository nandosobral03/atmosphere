export type WallpaperCategory = 
  | 'dawn'
  | 'morning'
  | 'midday' 
  | 'afternoon'
  | 'dusk'
  | 'evening'
  | 'night'
  | 'late_night'
  | 'rain' 
  | 'thunderstorm' 
  | 'snow' 
  | 'cloudy' 
  | 'sunny'
  | 'fog'
  | 'default';

export interface WallpaperSetting {
  category: WallpaperCategory;
  imagePath: string | null;
  priority: number; // Higher number = higher priority
  enabled: boolean;
}

export interface WallpaperSettings {
  [key: string]: WallpaperSetting;
}

export interface WallpaperCollection {
  id: string;
  name: string;
  settings: WallpaperSettings;
  createdAt: string;
  lastModified: string;
}

export interface CollectionStore {
  collections: { [id: string]: WallpaperCollection };
  activeCollectionId: string | null;
}

export interface CurrentConditions {
  weather_condition: string | null;
  time_period: string;
  temperature: number | null;
  humidity: number | null;
  sunrise: string | null;
  sunset: string | null;
  location: string | null;
  active_categories: string[];
}

export interface TimePeriodsResponse {
  sunrise: string;
  sunset: string;
  periods: {
    period: string;
    start_time: string;
    end_time: string;
    description: string;
    is_current: boolean;
  }[];
  location: string | null;
}

export const WALLPAPER_CATEGORIES: { 
  key: WallpaperCategory; 
  label: string; 
  description: string; 
  defaultPriority: number;
}[] = [
  // Weather conditions (highest priority)
  { key: 'thunderstorm', label: 'Thunderstorm', description: 'During thunderstorms', defaultPriority: 100 },
  { key: 'rain', label: 'Rain', description: 'When it\'s raining', defaultPriority: 90 },
  { key: 'snow', label: 'Snow', description: 'When it\'s snowing', defaultPriority: 85 },
  { key: 'fog', label: 'Fog', description: 'Foggy/misty conditions', defaultPriority: 80 },
  
  // Time periods (medium priority)
  { key: 'dawn', label: 'Dawn', description: '30 min before sunrise', defaultPriority: 75 },
  { key: 'dusk', label: 'Dusk', description: '30 min after sunset', defaultPriority: 70 },
  { key: 'late_night', label: 'Late Night', description: 'Midnight to dawn', defaultPriority: 65 },
  { key: 'night', label: 'Night', description: 'After dusk to midnight', defaultPriority: 60 },
  { key: 'evening', label: 'Evening', description: '2 hours before sunset', defaultPriority: 55 },
  
  // Weather + time (lower priority)
  { key: 'cloudy', label: 'Cloudy', description: 'Overcast skies', defaultPriority: 45 },
  { key: 'sunny', label: 'Sunny', description: 'Clear, sunny weather', defaultPriority: 40 },
  
  // Daytime periods (lowest time priority)
  { key: 'afternoon', label: 'Afternoon', description: '1 PM to evening', defaultPriority: 35 },
  { key: 'midday', label: 'Midday', description: '11 AM to 1 PM', defaultPriority: 30 },
  { key: 'morning', label: 'Morning', description: 'Dawn to 11 AM', defaultPriority: 25 },
  
  // Fallback
  { key: 'default', label: 'Fallback', description: 'Default wallpaper', defaultPriority: 0 }
];