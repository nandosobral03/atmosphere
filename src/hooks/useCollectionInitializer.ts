import { useEffect } from 'react';
import { useCollectionStore } from '../store/collectionStore';

export const useCollectionInitializer = () => {
  const { collections, createCollection, setActiveCollection } = useCollectionStore();

  useEffect(() => {
    const collectionIds = Object.keys(collections);
    
    // If no collections exist, create a default one
    if (collectionIds.length === 0) {
      const defaultId = createCollection('Default Collection');
      setActiveCollection(defaultId);
    }
  }, [collections, createCollection, setActiveCollection]);
};