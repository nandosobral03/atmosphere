import { useState } from 'react';
import { WallpaperCollection } from '../../types';
import { Button } from '../ui/Button';
import { Icon } from '../ui/Icon';

interface CollectionItemProps {
  collection: WallpaperCollection;
  isActive: boolean;
  onSelect: (id: string) => void;
  onDelete: (id: string, name: string) => void;
  onRename: (id: string, newName: string) => void;
  canDelete: boolean;
}

export const CollectionItem = ({
  collection,
  isActive,
  onSelect,
  onDelete,
  onRename,
  canDelete,
}: CollectionItemProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(collection.name);

  const handleRename = () => {
    if (!editName.trim()) return;
    onRename(collection.id, editName.trim());
    setIsEditing(false);
  };

  const handleCancelEdit = () => {
    setEditName(collection.name);
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleRename();
    } else if (e.key === 'Escape') {
      handleCancelEdit();
    }
  };

  return (
    <div
      className={`flex items-center gap-3 p-3 rounded-lg border transition-all cursor-pointer ${
        isActive
          ? 'bg-primary text-white border-primary'
          : 'bg-card hover:bg-surface border-border'
      }`}
      onClick={() => !isEditing && onSelect(collection.id)}
    >
      <Icon name="palette" size={16} />
      
      <div className="flex-1 min-w-0">
        {isEditing ? (
          <input
            type="text"
            value={editName}
            onChange={e => setEditName(e.target.value)}
            onBlur={handleRename}
            onKeyDown={handleKeyDown}
            className="w-full px-2 py-1 text-sm bg-surface border border-border rounded text-text-primary"
            autoFocus
            onClick={e => e.stopPropagation()}
          />
        ) : (
          <div className="flex items-center justify-between">
            <span className="font-medium truncate">{collection.name}</span>
            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <Button
                variant="ghost"
                size="sm"
                onClick={e => {
                  e.stopPropagation();
                  setIsEditing(true);
                }}
                className="p-1 h-auto"
              >
                <Icon name="settings" size={12} />
              </Button>
              {canDelete && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={e => {
                    e.stopPropagation();
                    onDelete(collection.id, collection.name);
                  }}
                  className="p-1 h-auto hover:text-red-500"
                >
                  <Icon name="tools" size={12} />
                </Button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};