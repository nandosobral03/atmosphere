import { IconName } from '../components/ui/Icon';

export const getConditionIconName = (condition: string): IconName => {
  const iconMap: Record<string, IconName> = {
    'thunderstorm': 'thunderstorm',
    'rain': 'rain',
    'snow': 'snow',
    'fog': 'fog',
    'cloudy': 'cloudy',
    'sunny': 'sunny',
    'dawn': 'dawn',
    'morning': 'dawn', // Use sunrise for morning
    'midday': 'sunny',
    'afternoon': 'sunny',
    'evening': 'evening',
    'dusk': 'evening', // Use evening for dusk
    'night': 'night',
    'late_night': 'late-night',
    'default': 'gallery', // Use gallery for default
    'loading': 'loading'
  };

  return iconMap[condition] || 'partly-cloudy';
};

// Legacy function for backwards compatibility - now returns icon name
export const getConditionIcon = (condition: string): IconName => {
  return getConditionIconName(condition);
};