import { useState } from 'react';
import { invoke } from '@tauri-apps/api/core';
import { save, open } from '@tauri-apps/plugin-dialog';
import { useCollectionStore } from '../store/collectionStore';

export const useBackup = () => {
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const collectionStore = useCollectionStore();

  const exportBackup = async () => {
    try {
      setIsExporting(true);
      
      const timestamp = new Date().toISOString().split('T')[0];
      const defaultFilename = `wallpaperthing-backup-${timestamp}.zip`;

      const savePath = await save({
        filters: [
          {
            name: 'Wallpaper Backup',
            extensions: ['zip'],
          },
        ],
        defaultPath: defaultFilename,
      });

      if (!savePath) return null;

      const collectionsData = JSON.stringify({
        collections: collectionStore.collections,
        activeCollectionId: collectionStore.activeCollectionId,
      });

      const zipData = await invoke('export_backup', { collectionsData }) as number[];
      const uint8Array = new Uint8Array(zipData);

      await invoke('write_backup_file', {
        path: savePath,
        data: Array.from(uint8Array),
      });

      return 'Backup exported successfully!';
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Export failed';
      throw new Error(errorMessage);
    } finally {
      setIsExporting(false);
    }
  };

  const importBackup = async () => {
    try {
      const filePath = await open({
        filters: [
          {
            name: 'Wallpaper Backup',
            extensions: ['zip'],
          },
        ],
        multiple: false,
      });

      if (!filePath) return null;

      setIsImporting(true);

      const fileData = await invoke('read_backup_file', { path: filePath }) as number[];
      const zipData = new Uint8Array(fileData);

      await invoke('import_backup', { zipData: Array.from(zipData) });

      const collectionsDataStr = await invoke('get_backup_collections_data', {
        zipData: Array.from(zipData),
      }) as string;

      if (collectionsDataStr && collectionsDataStr !== '{}') {
        try {
          const parsedData = JSON.parse(collectionsDataStr);
          const { collections, activeCollectionId } = parsedData;

          if (collections && Object.keys(collections).length > 0) {
            Object.entries(collections).forEach(([id, collection]: [string, any]) => {
              collectionStore.collections[id] = collection;
            });

            if (activeCollectionId && collections[activeCollectionId]) {
              collectionStore.setActiveCollection(activeCollectionId);
            } else {
              const firstCollectionId = Object.keys(collections)[0];
              collectionStore.setActiveCollection(firstCollectionId);
            }
          }
        } catch (parseError) {
          console.warn('Could not parse collections data from backup:', parseError);
        }
      }

      return 'Backup imported successfully!';
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Import failed';
      throw new Error(errorMessage);
    } finally {
      setIsImporting(false);
    }
  };

  return {
    exportBackup,
    importBackup,
    isExporting,
    isImporting,
  };
};