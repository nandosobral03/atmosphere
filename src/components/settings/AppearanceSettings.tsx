import { Button } from '../ui/Button';
import { Icon } from '../ui/Icon';

interface AppearanceSettingsProps {
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
}

export const AppearanceSettings = ({ theme, onToggleTheme }: AppearanceSettingsProps) => (
  <div className="space-y-6">
    <h3 className="text-lg font-semibold">Appearance</h3>
    
    <div className="space-y-4">
      <div className="flex items-center justify-between p-4 bg-surface rounded-lg border">
        <div className="flex items-center gap-3">
          <Icon name={theme === 'dark' ? 'night' : 'sunny'} className="w-5 h-5" />
          <div>
            <h4 className="font-medium">Theme</h4>
            <p className="text-sm text-text-secondary">
              Currently using {theme} mode
            </p>
          </div>
        </div>
        <Button variant="secondary" onClick={onToggleTheme}>
          Switch to {theme === 'dark' ? 'Light' : 'Dark'}
        </Button>
      </div>
    </div>
  </div>
);