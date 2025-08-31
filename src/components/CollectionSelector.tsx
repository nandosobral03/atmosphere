import { useState } from "react";
import { useCollectionStore } from "../store/collectionStore";

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

  const collectionList = Object.values(collections);
  const activeCollection = activeCollectionId ? collections[activeCollectionId] : null;

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

    if (confirm("Are you sure you want to delete this collection? This action cannot be undone.")) {
      deleteCollection(collectionId);
      onCollectionChange?.(activeCollectionId);
    }
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
    <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
      <div className="flex items-center justify-between mb-3">
        <button onClick={() => setShowCreateForm(true)} className="bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium px-3 py-1.5 rounded-lg transition-colors">
          + New Collection
        </button>
      </div>

      {error && <div className="mb-3 p-2 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 text-sm rounded-lg border border-red-200 dark:border-red-800">{error}</div>}

      {showCreateForm && (
        <div className="mb-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600">
          <div className="flex gap-2">
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
              placeholder="Collection name..."
              className="flex-1 px-2 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              autoFocus
            />
            <button onClick={handleCreateCollection} className="bg-green-500 hover:bg-green-600 text-white text-sm font-medium px-3 py-1.5 rounded transition-colors">
              Create
            </button>
            <button
              onClick={() => {
                setShowCreateForm(false);
                setNewCollectionName("");
                setError(null);
              }}
              className="bg-gray-500 hover:bg-gray-600 text-white text-sm font-medium px-3 py-1.5 rounded transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      <div className="space-y-2">
        {collectionList.length === 0 ? (
          <div className="text-gray-500 dark:text-gray-400 text-sm text-center py-4">No collections yet. Create your first collection to get started.</div>
        ) : (
          collectionList.map((collection) => {
            const isActive = collection.id === activeCollectionId;
            const validation = validateCollection(collection);

            const isEditing = editingCollectionId === collection.id;

            return (
              <div
                key={collection.id}
                onClick={isEditing ? undefined : () => handleCollectionChange(collection.id)}
                className={`flex items-center justify-between p-3 rounded-lg border transition-colors ${
                  isEditing
                    ? "bg-yellow-50 dark:bg-yellow-900/10 border-yellow-300 dark:border-yellow-600"
                    : isActive
                    ? "bg-blue-50 dark:bg-blue-900/20 border-blue-300 dark:border-blue-600 cursor-pointer"
                    : "bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-600 cursor-pointer"
                }`}
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center space-x-2">
                    <div className={`w-3 h-3 rounded-full flex-shrink-0 ${isActive ? "bg-blue-500" : "bg-gray-400"}`} />
                    {isEditing ? (
                      <input
                        type="text"
                        value={editingName}
                        onChange={(e) => setEditingName(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") handleSaveEdit();
                          if (e.key === "Escape") handleCancelEdit();
                        }}
                        className="flex-1 px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        autoFocus
                      />
                    ) : (
                      <div className={`font-medium truncate ${isActive ? "text-blue-900 dark:text-blue-100" : "text-gray-900 dark:text-white"}`}>{collection.name}</div>
                    )}
                    {isActive && <span className="text-xs bg-blue-100 dark:bg-blue-800 text-blue-700 dark:text-blue-300 px-2 py-0.5 rounded-full flex-shrink-0">ACTIVE</span>}
                    {!validation.isValid && <span className="text-xs bg-red-100 dark:bg-red-800 text-red-700 dark:text-red-300 px-2 py-0.5 rounded-full flex-shrink-0">INVALID</span>}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    {!validation.isValid && validation.error ? <span className="text-red-500 dark:text-red-400">{validation.error}</span> : `Created ${new Date(collection.createdAt).toLocaleDateString()}`}
                  </div>
                </div>

                <div className="flex items-center space-x-1 flex-shrink-0">
                  {isEditing ? (
                    <>
                      <button onClick={handleSaveEdit} className="p-1 text-green-500 hover:text-green-700 hover:bg-green-50 dark:hover:bg-green-900/20 rounded transition-colors" title="Save name">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </button>
                      <button onClick={handleCancelEdit} className="p-1 text-gray-500 hover:text-gray-700 hover:bg-gray-50 dark:hover:bg-gray-900/20 rounded transition-colors" title="Cancel edit">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={(e) => handleStartEdit(collection.id, collection.name, e)}
                        className="p-1 text-blue-500 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded transition-colors"
                        title="Rename collection"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                        </svg>
                      </button>
                      {collectionList.length > 1 && (
                        <button onClick={(e) => handleDeleteCollection(collection.id, e)} className="p-1 text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors" title="Delete collection">
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

      {activeCollection && (
        <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-600">
          <div className="text-xs text-gray-500 dark:text-gray-400 space-y-1">
            <div>
              <strong>Active:</strong> {activeCollection.name}
            </div>
            <div>
              <strong>Last Modified:</strong> {new Date(activeCollection.lastModified).toLocaleString()}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
