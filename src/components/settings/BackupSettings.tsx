import { Button } from '../ui/Button';
import { Icon } from '../ui/Icon';

interface BackupSettingsProps {
  onExport: () => Promise<void>;
  onImport: () => Promise<void>;
  isExporting: boolean;
  isImporting: boolean;
}

export const BackupSettings = ({
  onExport,
  onImport,
  isExporting,
  isImporting,
}: BackupSettingsProps) => (
  <div className="space-y-6">
    <h3 className="text-lg font-semibold">Backup & Restore</h3>
    
    <div className="space-y-4">
      <div className="p-4 bg-surface rounded-lg border">
        <div className="flex items-start gap-3">
          <Icon name="download" className="w-5 h-5 text-primary mt-0.5" />
          <div className="flex-1">
            <h4 className="font-medium mb-1">Export Backup</h4>
            <p className="text-sm text-text-secondary mb-3">
              Save all your collections, settings, and wallpapers to a backup file.
            </p>
            <Button
              variant="primary"
              onClick={onExport}
              disabled={isExporting || isImporting}
            >
              {isExporting ? 'Exporting...' : 'Export Backup'}
            </Button>
          </div>
        </div>
      </div>

      <div className="p-4 bg-surface rounded-lg border">
        <div className="flex items-start gap-3">
          <Icon name="upload" className="w-5 h-5 text-primary mt-0.5" />
          <div className="flex-1">
            <h4 className="font-medium mb-1">Import Backup</h4>
            <p className="text-sm text-text-secondary mb-3">
              Restore collections, settings, and wallpapers from a backup file.
            </p>
            <Button
              variant="secondary"
              onClick={onImport}
              disabled={isExporting || isImporting}
            >
              {isImporting ? 'Importing...' : 'Import Backup'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  </div>
);