import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useModalStore } from '../store/modalStore';
import { Button } from './ui/Button';

interface PromptEditorModalProps {
  onSave: (category: string, prompt: string) => void;
  onReset: (category: string) => void;
  hasCustomPrompt: Record<string, string>;
}

export function PromptEditorModal({ onSave, onReset, hasCustomPrompt }: PromptEditorModalProps) {
  const {
    isPromptEditorOpen,
    editingCategory,
    editingPrompt,
    editingDescription,
    closePromptEditor,
    updateEditingPrompt,
  } = useModalStore();

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isPromptEditorOpen) {
        closePromptEditor();
      }
    };

    if (isPromptEditorOpen) {
      document.addEventListener('keydown', handleEscape);
      // Prevent body scroll
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isPromptEditorOpen, closePromptEditor]);

  const handleSave = () => {
    if (editingCategory && editingPrompt.trim()) {
      onSave(editingCategory, editingPrompt.trim());
    }
    closePromptEditor();
  };

  const handleReset = () => {
    if (editingCategory) {
      onReset(editingCategory);
    }
    closePromptEditor();
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      closePromptEditor();
    }
  };

  if (!isPromptEditorOpen || !editingCategory) {
    return null;
  }

  return createPortal(
    <div
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[9999] p-4"
      onClick={handleBackdropClick}
      style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0 }}
    >
      <div
        className="bg-card rounded-2xl border border-border shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <div>
            <h3 className="text-lg font-semibold text-text-primary capitalize">
              Edit {editingCategory.replace("-", " ")} Prompt
            </h3>
            <p className="text-sm text-text-secondary mt-1">
              {editingDescription}
            </p>
          </div>
          <button
            onClick={closePromptEditor}
            className="p-2 rounded-lg text-text-secondary hover:text-text-primary hover:bg-bg-secondary transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6">
          <label className="block text-sm font-medium text-text-primary mb-3">
            AI Generation Prompt
          </label>
          <textarea
            value={editingPrompt}
            onChange={(e) => updateEditingPrompt(e.target.value)}
            className="w-full h-48 p-4 text-sm border border-border rounded-lg bg-bg-secondary text-text-primary resize-none focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            placeholder="Enter your custom prompt for this category..."
            autoFocus
          />
          <p className="text-xs text-text-secondary mt-2">
            Be specific about the visual changes you want. The AI will apply these changes while keeping the original composition.
          </p>
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between p-6 border-t border-border bg-bg-secondary rounded-b-2xl">
          <div className="flex space-x-3">
            {editingCategory && hasCustomPrompt[editingCategory] && (
              <Button
                variant="ghost"
                onClick={handleReset}
                className="text-text-secondary hover:text-text-primary"
              >
                Reset to Default
              </Button>
            )}
          </div>
          <div className="flex space-x-3">
            <Button variant="ghost" onClick={closePromptEditor}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={!editingPrompt.trim()}>
              Save Changes
            </Button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}