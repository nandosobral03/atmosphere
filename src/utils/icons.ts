export const getConditionIcon = (condition: string): string => {
  const icons: Record<string, string> = {
    'thunderstorm': '⛈️',
    'rain': '🌧️',
    'snow': '❄️',
    'fog': '🌫️',
    'cloudy': '☁️',
    'sunny': '☀️',
    'dawn': '🌅',
    'morning': '🌄',
    'midday': '☀️',
    'afternoon': '🌞',
    'evening': '🌇',
    'dusk': '🌆',
    'night': '🌙',
    'late_night': '🌌',
    'default': '🖼️',
    'loading': '⏳'
  };
  return icons[condition] || '🌤️';
};