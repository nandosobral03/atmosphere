import { useState } from "react";
import { createPortal } from "react-dom";
import { useCollectionStore } from "../store/collectionStore";
import { Icon } from "./ui/Icon";

interface CollectionSelectorProps {
  onCollectionChange?: (collectionId: string | null) => void;
}

export function CollectionSelector({ onCollectionChange }: CollectionSelectorProps) {
  const { collections, activeCollectionId, setActiveCollection, createCollection, deleteCollection, updateCollection, validateCollection } = useCollectionStore();

  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newCollectionName, setNewCollectionName] = useState("");
  const [editingCollectionId, setEditingCollectionId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [deleteConfirmation, setDeleteConfirmation] = useState<{
    collectionId: string;
    collectionName: string;
  } | null>(null);

  const collectionList = Object.values(collections);

  const handleCollectionChange = (collectionId: string) => {
    setActiveCollection(collectionId);
    onCollectionChange?.(collectionId);
  };

  const handleCreateCollection = () => {
    setError(null);

    if (!newCollectionName.trim()) {
      setError("Collection name is required");
      return;
    }

    // Check for duplicate names
    const exists = collectionList.some((c) => c.name.toLowerCase() === newCollectionName.trim().toLowerCase());
    if (exists) {
      setError("A collection with this name already exists");
      return;
    }

    const newId = createCollection(newCollectionName.trim());
    setActiveCollection(newId);
    setNewCollectionName("");
    setShowCreateForm(false);
    onCollectionChange?.(newId);
  };

  const handleDeleteCollection = (collectionId: string, event: React.MouseEvent) => {
    event.stopPropagation();

    if (collectionList.length <= 1) {
      setError("Cannot delete the last collection");
      return;
    }

    const collection = collections[collectionId];
    setDeleteConfirmation({
      collectionId,
      collectionName: collection.name,
    });
  };

  const confirmDelete = () => {
    if (deleteConfirmation) {
      deleteCollection(deleteConfirmation.collectionId);
      onCollectionChange?.(activeCollectionId);
      setDeleteConfirmation(null);
    }
  };

  const cancelDelete = () => {
    setDeleteConfirmation(null);
  };

  const handleStartEdit = (collectionId: string, currentName: string, event: React.MouseEvent) => {
    event.stopPropagation();
    setEditingCollectionId(collectionId);
    setEditingName(currentName);
    setError(null);
  };

  const handleSaveEdit = () => {
    if (!editingCollectionId) return;

    setError(null);

    if (!editingName.trim()) {
      setError("Collection name is required");
      return;
    }

    // Check for duplicate names (excluding the current collection)
    const exists = collectionList.some((c) => c.id !== editingCollectionId && c.name.toLowerCase() === editingName.trim().toLowerCase());
    if (exists) {
      setError("A collection with this name already exists");
      return;
    }

    updateCollection(editingCollectionId, { name: editingName.trim() });
    setEditingCollectionId(null);
    setEditingName("");
  };

  const handleCancelEdit = () => {
    setEditingCollectionId(null);
    setEditingName("");
    setError(null);
  };

  return (
    <div className="bg-card rounded-2xl p-5 border border-border shadow-card hover:shadow-card-hover transition-all duration-200">
      <div className="space-y-3">
        {collectionList.length === 0 ? (
          <div className="text-center py-8">
            <div className="p-4 rounded-2xl bg-primary/5 inline-block mb-3">
              <Icon name="gallery" size={32} className="text-primary/60" />
            </div>
            <p className="text-text-secondary text-sm leading-relaxed">
              No collections yet.
              <br />
              Create your first collection to get started.
            </p>
          </div>
        ) : (
          collectionList.map((collection) => {
            const isActive = collection.id === activeCollectionId;
            const validation = validateCollection(collection);

            const isEditing = editingCollectionId === collection.id;

            return (
              <div
                key={collection.id}
                onClick={isEditing ? undefined : () => handleCollectionChange(collection.id)}
                className={`flex items-center justify-between p-4 rounded-xl border transition-all duration-200 ${
                  isEditing ? "bg-warning-light border-warning items-start" : isActive ? "bg-primary-light border-primary cursor-pointer hover:scale-[1.02]" : "bg-surface border-border hover:bg-border cursor-pointer hover:scale-[1.01]"
                }`}
              >
                <div className="min-w-0 flex-1">
                  {isEditing ? (
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <div className={`w-3 h-3 rounded-full flex-shrink-0 ${isActive ? "bg-primary" : "bg-border"}`} />
                        <input
                          type="text"
                          value={editingName}
                          onChange={(e) => setEditingName(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") handleSaveEdit();
                            if (e.key === "Escape") handleCancelEdit();
                          }}
                          className="flex-1 px-2 py-1 text-sm border border-border rounded bg-card text-text-primary focus:ring-2 focus:ring-primary focus:border-transparent"
                          autoFocus
                        />
                      </div>
                      <div className="ml-5 space-y-1">
                        <div className="flex items-center space-x-2">
                          {isActive && <span className="text-xs bg-primary-light text-primary px-2 py-0.5 rounded-full">ACTIVE</span>}
                          {!validation.isValid && <span className="text-xs bg-danger-light text-danger px-2 py-0.5 rounded-full">INVALID</span>}
                        </div>
                        <div className="text-xs text-text-secondary">
                          {!validation.isValid && validation.error ? <span className="text-danger">{validation.error}</span> : `Created ${new Date(collection.createdAt).toLocaleDateString()}`}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="flex items-center space-x-2">
                        <div className={`w-3 h-3 rounded-full flex-shrink-0 ${isActive ? "bg-primary" : "bg-border"}`} />
                        <div className={`font-medium truncate ${isActive ? "text-primary" : "text-text-primary"}`}>{collection.name}</div>
                        {isActive && <span className="text-xs bg-primary-light text-primary px-2 py-0.5 rounded-full flex-shrink-0">ACTIVE</span>}
                        {!validation.isValid && <span className="text-xs bg-danger-light text-danger px-2 py-0.5 rounded-full flex-shrink-0">INVALID</span>}
                      </div>
                      <div className="text-xs text-text-secondary mt-1">
                        {!validation.isValid && validation.error ? <span className="text-danger">{validation.error}</span> : `Created ${new Date(collection.createdAt).toLocaleDateString()}`}
                      </div>
                    </>
                  )}
                </div>

                <div className="flex items-start space-x-2 flex-shrink-0 ml-4 mt-0.5">
                  {isEditing ? (
                    <>
                      <button onClick={handleSaveEdit} className="p-2 text-primary hover:text-primary-hover hover:bg-primary-light rounded-lg transition-colors cursor-pointer" title="Save name">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </button>
                      <button onClick={handleCancelEdit} className="p-2 text-text-secondary hover:text-text-primary hover:bg-surface rounded-lg transition-colors cursor-pointer" title="Cancel edit">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={(e) => handleStartEdit(collection.id, collection.name, e)}
                        className="p-1 text-primary hover:text-primary-hover hover:bg-primary-light rounded transition-colors cursor-pointer"
                        title="Rename collection"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                        </svg>
                      </button>
                      {collectionList.length > 1 && (
                        <button onClick={(e) => handleDeleteCollection(collection.id, e)} className="p-1 text-danger hover:text-danger-hover hover:bg-danger-light rounded transition-colors cursor-pointer" title="Delete collection">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      )}
                    </>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {showCreateForm && (
        <div className="mt-4 p-4 bg-surface rounded-xl border border-border animate-in slide-in-from-top duration-300">
          <div className="space-y-3">
            <div className="flex items-center space-x-2 mb-2">
              <div className="p-1.5 rounded-lg bg-primary/10">
                <svg className="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              </div>
              <h3 className="text-sm font-medium text-text-primary">Create New Collection</h3>
            </div>
            <div className="space-y-3">
              <input
                type="text"
                value={newCollectionName}
                onChange={(e) => setNewCollectionName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleCreateCollection();
                  if (e.key === "Escape") {
                    setShowCreateForm(false);
                    setNewCollectionName("");
                    setError(null);
                  }
                }}
                placeholder="Enter collection name..."
                className="w-full px-3 py-2 text-sm border border-border rounded-lg bg-card text-text-primary focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200"
                autoFocus
              />
              <div className="flex gap-2">
                <button
                  onClick={handleCreateCollection}
                  className="bg-primary hover:bg-primary-hover text-text-inverse text-sm font-medium px-4 py-2 rounded-lg transition-all duration-200 hover:scale-105 active:scale-95 flex items-center justify-center space-x-2 flex-1"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Create</span>
                </button>
                <button
                  onClick={() => {
                    setShowCreateForm(false);
                    setNewCollectionName("");
                    setError(null);
                  }}
                  className="bg-surface hover:bg-border text-text-secondary hover:text-text-primary text-sm font-medium px-4 py-2 rounded-lg transition-all duration-200 hover:scale-105 active:scale-95 flex-1 flex items-center justify-center"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="flex items-center justify-end mt-4">
        <button
          onClick={() => setShowCreateForm(true)}
          className="bg-primary hover:bg-primary-hover text-text-inverse text-sm font-medium px-4 py-2 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95 shadow-sm hover:shadow-md flex items-center space-x-2 cursor-pointer"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          <span>New Collection</span>
        </button>
      </div>

      {error && (
        <div className="mt-4 p-3 bg-danger-light text-danger-hover text-sm rounded-xl border border-danger animate-in slide-in-from-top duration-200 flex items-center space-x-2">
          <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>{error}</span>
        </div>
      )}
      {/* Delete Confirmation Modal */}
      {deleteConfirmation &&
        createPortal(
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-card rounded-2xl p-6 max-w-sm mx-4 border border-border shadow-card-hover">
              <h3 className="text-lg font-semibold text-text-primary mb-2">Delete Collection</h3>
              <p className="text-sm text-text-secondary mb-4">Are you sure you want to delete "{deleteConfirmation.collectionName}"? This action cannot be undone.</p>
              <div className="flex gap-2 justify-end">
                <button onClick={cancelDelete} className="px-4 py-2 text-sm text-text-secondary hover:text-text-primary hover:bg-surface rounded-lg transition-colors">
                  Cancel
                </button>
                <button onClick={confirmDelete} className="px-4 py-2 text-sm bg-danger hover:bg-danger-hover text-white rounded-lg transition-colors">
                  Delete
                </button>
              </div>
            </div>
          </div>,
          document.body
        )}
    </div>
  );
}
