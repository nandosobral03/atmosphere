import { useState } from 'react';
import { Button } from '../ui/Button';
import { Icon } from '../ui/Icon';

interface CreateCollectionFormProps {
  onSubmit: (name: string) => void;
  onCancel: () => void;
  existingNames: string[];
  error?: string;
}

export const CreateCollectionForm = ({
  onSubmit,
  onCancel,
  existingNames,
  error,
}: CreateCollectionFormProps) => {
  const [name, setName] = useState('');
  const [localError, setLocalError] = useState<string>('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError('');

    if (!name.trim()) {
      setLocalError('Collection name is required');
      return;
    }

    const exists = existingNames.some(
      existingName => existingName.toLowerCase() === name.trim().toLowerCase()
    );
    
    if (exists) {
      setLocalError('A collection with this name already exists');
      return;
    }

    onSubmit(name.trim());
    setName('');
  };

  const displayError = error || localError;

  return (
    <form onSubmit={handleSubmit} className="space-y-3 p-4 bg-surface rounded-lg border">
      <div className="flex items-center gap-2 mb-3">
        <Icon name="palette" size={16} />
        <h3 className="font-medium">Create New Collection</h3>
      </div>
      
      <div>
        <input
          type="text"
          value={name}
          onChange={e => setName(e.target.value)}
          placeholder="Enter collection name"
          className="w-full px-3 py-2 border border-border rounded-lg bg-card"
          autoFocus
        />
        {displayError && (
          <p className="text-sm text-red-500 mt-1">{displayError}</p>
        )}
      </div>
      
      <div className="flex gap-2">
        <Button type="submit" size="sm">
          Create
        </Button>
        <Button type="button" variant="secondary" size="sm" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </form>
  );
};