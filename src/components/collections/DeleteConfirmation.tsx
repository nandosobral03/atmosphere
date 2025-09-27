import { createPortal } from 'react-dom';
import { Button } from '../ui/Button';
import { Icon } from '../ui/Icon';

interface DeleteConfirmationProps {
  collectionName: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export const DeleteConfirmation = ({
  collectionName,
  onConfirm,
  onCancel,
}: DeleteConfirmationProps) =>
  createPortal(
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-card border border-border rounded-xl p-6 max-w-sm w-full">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
            <Icon name="tools" size={20} className="text-red-600" />
          </div>
          <div>
            <h3 className="font-semibold">Delete Collection</h3>
            <p className="text-sm text-text-secondary">This action cannot be undone</p>
          </div>
        </div>
        
        <p className="text-sm mb-6">
          Are you sure you want to delete <strong>{collectionName}</strong>?
          This will permanently remove the collection and all its settings.
        </p>
        
        <div className="flex gap-3">
          <Button variant="danger" onClick={onConfirm} className="flex-1">
            Delete
          </Button>
          <Button variant="secondary" onClick={onCancel} className="flex-1">
            Cancel
          </Button>
        </div>
      </div>
    </div>,
    document.body
  );