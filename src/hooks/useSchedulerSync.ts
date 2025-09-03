import { useEffect } from 'react';
import { invoke } from '@tauri-apps/api/core';
import { useCollectionStore } from '../store/collectionStore';

export function useSchedulerSync() {
  const { collections, activeCollectionId } = useCollectionStore();

  useEffect(() => {
    // Send collection data to the backend scheduler whenever it changes
    const syncCollectionData = async () => {
      try {
        const collectionData = {
          collections,
          activeCollectionId
        };

        await invoke('update_scheduler_collection_data', {
          collectionData
        });
      } catch (error) {
        console.error('Failed to sync collection data to scheduler:', error);
      }
    };

    // Only sync if we have collections
    if (Object.keys(collections).length > 0) {
      syncCollectionData();
    }
  }, [collections, activeCollectionId]);
}