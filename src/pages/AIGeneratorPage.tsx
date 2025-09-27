import { useState, useEffect } from "react";
import { invoke } from "@tauri-apps/api/core";
import { open } from "@tauri-apps/plugin-dialog";
import { useNavigationStore } from "../store/navigationStore";
import { useCollectionStore } from "../store/collectionStore";
import { useModalStore } from "../store/modalStore";
import { Icon } from "../components/ui/Icon";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { Alert } from "../components/ui/Alert";
import { Badge } from "../components/ui/Badge";
import { PromptEditorModal } from "../components/PromptEditorModal";

interface PromptData {
  prompt: string;
  description: string;
}

interface PromptConfig {
  weather: Record<string, PromptData>;
  time: Record<string, PromptData>;
  fallback: Record<string, PromptData>;
}

interface GenerationRequest {
  image_path: string;
  prompts: Record<string, string>;
  selected_categories: string[];
  collection_id: string;
  api_key: string;
}

interface GenerationResult {
  category: string;
  success: boolean;
  image_path?: string;
  error_message?: string;
}

interface BatchGenerationResult {
  results: GenerationResult[];
  total_generated: number;
  total_failed: number;
}

export function AIGeneratorPage() {
  const { setCurrentPage } = useNavigationStore();
  const { getActiveCollection, updateCollection } = useCollectionStore();
  const { openPromptEditor } = useModalStore();
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [defaultPrompts, setDefaultPrompts] = useState<PromptConfig | null>(null);
  const [customPrompts, setCustomPrompts] = useState<Record<string, string>>({});
  const [selectedCategories, setSelectedCategories] = useState<Set<string>>(new Set());
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationResults, setGenerationResults] = useState<BatchGenerationResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [currentGeneratingCategory, setCurrentGeneratingCategory] = useState<string>("");

  // Load default prompts on component mount
  useEffect(() => {
    loadDefaultPrompts();
  }, []);

  const loadDefaultPrompts = async () => {
    try {
      const prompts = await invoke<PromptConfig>("get_default_prompts");
      setDefaultPrompts(prompts);
    } catch (err) {
      setError(`Failed to load default prompts: ${err}`);
    }
  };

  const selectImage = async () => {
    try {
      const selected = await open({
        title: "Select a wallpaper image",
        multiple: false,
        filters: [
          {
            name: "Images",
            extensions: ["jpg", "jpeg", "png", "webp"],
          },
        ],
      });

      if (selected) {
        setSelectedImage(selected as string);
        setError(null);
      }
    } catch (err) {
      setError(`Failed to select image: ${err}`);
    }
  };

  const generateVariations = async () => {
    if (!selectedImage || !defaultPrompts) {
      setError("Please select an image first");
      return;
    }

    if (selectedCategories.size === 0) {
      setError("Please select at least one category to generate");
      return;
    }

    setIsGenerating(true);
    setError(null);
    setGenerationResults(null);

    try {
      // Get Gemini API key from settings
      const settings = (await invoke("get_app_settings")) as any;
      if (!settings.gemini_api_key) {
        setError("Gemini API key not configured. Please set it in Settings.");
        setIsGenerating(false);
        return;
      }

      // Filter custom prompts to only include selected categories
      const filteredCustomPrompts: Record<string, string> = {};
      selectedCategories.forEach(category => {
        if (customPrompts[category]) {
          filteredCustomPrompts[category] = customPrompts[category];
        }
      });

      // Create a unique collection ID for this generation batch
      const timestamp = new Date().toISOString().split("T")[0];
      const generationCollectionId = `generated_${Date.now()}`;

      const selectedCategoriesArray = Array.from(selectedCategories);
      console.log('Selected categories for generation:', selectedCategoriesArray);

      const request: GenerationRequest = {
        image_path: selectedImage,
        prompts: filteredCustomPrompts,
        selected_categories: selectedCategoriesArray,
        collection_id: generationCollectionId,
        api_key: settings.gemini_api_key,
      };

      // Track generation progress for selected categories only

      let categoryIndex = 0;
      const progressInterval = setInterval(() => {
        if (categoryIndex < selectedCategoriesArray.length) {
          setCurrentGeneratingCategory(selectedCategoriesArray[categoryIndex]);
          categoryIndex++;
        }
      }, 2000); // Update every 2 seconds (roughly matches API call time)

      const result = await invoke<BatchGenerationResult>("generate_wallpaper_variations", {
        request,
      });

      clearInterval(progressInterval);
      setCurrentGeneratingCategory("");
      setGenerationResults(result);

      console.log('Generation result:', result);
      console.log('Total generated:', result.total_generated);
      console.log('Results:', result.results);
      console.log('Checking if total_generated > 0:', result.total_generated > 0);

      if (result.total_generated > 0) {
        console.log('ENTERING collection creation block');

        // First create the collection
        const { createCollection, setActiveCollection, updateCollection } = useCollectionStore.getState();
        const timestamp = new Date().toISOString().split("T")[0];
        const newCollectionName = `AI Generated - ${timestamp}`;
        const newCollectionId = createCollection(newCollectionName);

        console.log('Created collection:', newCollectionName, 'with ID:', newCollectionId);

        // Now move images from temp folder to collection folder and update paths
        try {
          const movePromises = result.results.map(async (generationResult) => {
            if (generationResult.success && generationResult.image_path) {
              console.log('Moving image for category:', generationResult.category);
              console.log('From:', generationResult.image_path);

              // Call backend to move the image to the collection folder
              const newImagePath = await invoke<string>("move_generated_image_to_collection", {
                sourcePath: generationResult.image_path,
                collectionId: newCollectionId,
                category: generationResult.category
              });

              console.log('Moved to:', newImagePath);
              return { category: generationResult.category, imagePath: newImagePath };
            }
            return null;
          });

          const movedImages = await Promise.all(movePromises);

          // Get the collection's default settings and update with moved images
          const newCollection = useCollectionStore.getState().collections[newCollectionId];
          const updatedSettings = { ...newCollection.settings };

          movedImages.forEach(moved => {
            if (moved) {
              updatedSettings[moved.category] = {
                ...updatedSettings[moved.category],
                imagePath: moved.imagePath,
                enabled: true,
              };
            }
          });

          // Update the collection with the new image paths
          updateCollection(newCollectionId, {
            settings: updatedSettings,
            lastModified: new Date().toISOString(),
          });

          // Set as active collection
          setActiveCollection(newCollectionId);
          console.log('Collection setup completed successfully');

        } catch (moveError) {
          console.error('Failed to move images:', moveError);
          setError(`Failed to organize generated images: ${moveError}`);
        }
      }
    } catch (err) {
      setError(`Generation failed: ${err}`);
    } finally {
      setIsGenerating(false);
      setCurrentGeneratingCategory("");
    }
  };

  const updatePrompt = (category: string, newPrompt: string) => {
    setCustomPrompts(prev => ({
      ...prev,
      [category]: newPrompt,
    }));
  };

  const resetPrompt = (category: string) => {
    setCustomPrompts(prev => {
      const updated = { ...prev };
      delete updated[category];
      return updated;
    });
  };

  const toggleCategorySelection = (category: string) => {
    setSelectedCategories(prev => {
      const updated = new Set(prev);
      if (updated.has(category)) {
        updated.delete(category);
      } else {
        updated.add(category);
      }
      return updated;
    });
  };

  const selectAllCategories = () => {
    if (!defaultPrompts) return;
    const allCategories = [
      ...Object.keys(defaultPrompts.weather),
      ...Object.keys(defaultPrompts.time),
    ];
    setSelectedCategories(new Set(allCategories));
  };

  const deselectAllCategories = () => {
    setSelectedCategories(new Set());
  };

  const handlePromptSave = (category: string, prompt: string) => {
    updatePrompt(category, prompt);
  };

  const renderCategoryCard = (category: string, promptData: PromptData, section: string) => {
    const isCustom = customPrompts[category] !== undefined;
    const currentPrompt = customPrompts[category] || promptData.prompt;
    const isSelected = selectedCategories.has(category);

    return (
      <div
        key={category}
        className={`w-full p-4 bg-card rounded-xl border transition-all duration-200 ${
          isSelected ? "border-primary bg-primary/5" : "border-border"
        }`}
      >
        <div className="flex items-start space-x-3">
          <input
            type="checkbox"
            checked={isSelected}
            onChange={() => toggleCategorySelection(category)}
            className="mt-1 w-4 h-4 text-primary bg-card border border-border rounded focus:ring-primary focus:ring-2 accent-primary"
          />

          <div className="flex-1">
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-medium text-text-primary capitalize mb-2">
                {category.replace("-", " ").replace("_", " ")}
              </h4>
              <button
                onClick={() => openPromptEditor(category, currentPrompt, promptData.description)}
                className="p-1 rounded-lg text-text-secondary hover:text-primary hover:bg-primary/10 transition-colors"
                title="Edit prompt"
              >
                <Icon name="settings" size={16} />
              </button>
            </div>
            <p className="text-sm text-text-secondary leading-relaxed">{promptData.description}</p>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="p-4 space-y-6 bg-bg-primary backdrop-blur-sm h-screen overflow-y-scroll">
      {/* Header with Back Button */}
      <div className="flex items-center space-x-3 mb-6">
        <button
          onClick={() => setCurrentPage("home")}
          className="p-2 rounded-xl text-text-primary hover:text-primary hover:bg-primary/10 transition-colors cursor-pointer border border-border hover:border-primary"
          title="Back to Home"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
        </button>
        <div>
          <h1 className="text-xl font-bold text-text-primary">AI Generator</h1>
          <p className="text-sm text-text-secondary">Create wallpaper variations using AI</p>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <Alert variant="danger" className="mb-4">
          {error.includes("Settings") ? (
            <span>
              Gemini API key not configured. Please set it in{" "}
              <button
                onClick={() => setCurrentPage("settings")}
                className="underline hover:text-white font-medium"
              >
                Settings
              </button>
              .
            </span>
          ) : (
            error
          )}
        </Alert>
      )}

      {/* Image Selection */}
      <Card className="mb-6 p-6">
        <h2 className="text-lg font-semibold text-text-primary mb-4">Select Base Image</h2>

        {selectedImage ? (
          <div className="space-y-4">
            <div className="p-4 border border-border rounded-lg bg-bg-secondary">
              <p className="text-sm text-text-secondary mb-2">Selected image:</p>
              <p className="text-sm font-mono text-text-primary break-all">{selectedImage}</p>
            </div>
            <Button onClick={selectImage} variant="secondary">
              <Icon name="upload" size={16} className="mr-2" />
              Choose Different Image
            </Button>
          </div>
        ) : (
          <button
            onClick={selectImage}
            className="w-full p-8 border-2 border-dashed border-border rounded-lg hover:border-primary transition-colors group"
          >
            <div className="text-center">
              <Icon
                name="upload"
                size={48}
                className="mx-auto mb-4 text-text-secondary group-hover:text-primary transition-colors"
              />
              <p className="text-text-primary font-medium mb-2">Click to select an image</p>
              <p className="text-sm text-text-secondary">Supports JPEG, PNG, and WebP formats</p>
            </div>
          </button>
        )}
      </Card>

      {/* Prompt Categories */}
      {defaultPrompts && (
        <Card className="mb-6 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-text-primary">Categories</h2>
            <div className="flex space-x-2">
              <Button
                variant="secondary"
                size="sm"
                onClick={selectAllCategories}
                title="Select All"
              >
                <Icon name="check" size={16} className="text-text-primary" />
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={deselectAllCategories}
                title="Deselect All"
              >
                <Icon name="close" size={16} className="text-text-primary" />
              </Button>
            </div>
          </div>
          <p className="text-sm text-text-secondary mb-6">
            Select the categories you want to generate, then click the settings icon to customize
            prompts. Only selected categories will be generated.
          </p>

          {/* Weather Conditions */}
          <div className="mb-6">
            <h3 className="font-medium text-text-primary mb-3">Weather Conditions</h3>
            <div className="space-y-3">
              {Object.entries(defaultPrompts.weather).map(([category, promptData]) =>
                renderCategoryCard(category, promptData, "Weather")
              )}
            </div>
          </div>

          {/* Time Periods */}
          <div>
            <h3 className="font-medium text-text-primary mb-3">Time Periods</h3>
            <div className="space-y-3">
              {Object.entries(defaultPrompts.time).map(([category, promptData]) =>
                renderCategoryCard(category, promptData, "Time")
              )}
            </div>
          </div>
        </Card>
      )}

      {/* Generation Controls */}
      <Card className="mb-6 p-6">
        <div className="flex items-start justify-between flex-col md:flex-row gap-4">
          <div>
            <h2 className="text-lg font-semibold text-text-primary">Generate Variations</h2>
            {isGenerating && currentGeneratingCategory && (
              <p className="text-sm text-text-secondary mt-1">
                Generating: <span className="font-medium">{currentGeneratingCategory}</span>
              </p>
            )}
          </div>
          <div className="flex items-center space-x-3 w-full">
            <Button
              onClick={async () => {
                try {
                  const result = await invoke("open_wallpapers_folder");
                  console.log(result);
                } catch (err) {
                  console.error("Failed to open wallpapers folder:", err);
                  setError(`Failed to open folder: ${err}`);
                }
              }}
              variant="secondary"
              title="Open wallpapers folder"
            >
              <Icon name="folder" size={16} className="text-text-primary" />
            </Button>
            <Button
              onClick={generateVariations}
              disabled={!selectedImage || isGenerating || selectedCategories.size === 0}
              className="px-6 w-full md:w-auto"
            >
              {isGenerating ? (
                <>
                  <Icon name="loading" size={16} className="mr-2 animate-spin" />
                  Generating {selectedCategories.size} categories...
                </>
              ) : (
                <>
                  <Icon name="palette" size={16} className="mr-2" />
                  Generate{" "}
                  {selectedCategories.size > 0
                    ? `${selectedCategories.size} categories`
                    : "Categories"}
                </>
              )}
            </Button>
          </div>
        </div>
      </Card>

      {/* Results */}
      {generationResults && (
        <Card className="mb-6 p-6">
          <h2 className="text-lg font-semibold text-text-primary mb-4">Generation Results</h2>

          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="text-center p-4 bg-green-500/10 rounded-lg">
              <div className="text-2xl font-bold text-green-600">
                {generationResults.total_generated}
              </div>
              <div className="text-sm text-text-secondary">Generated</div>
            </div>
            <div className="text-center p-4 bg-red-500/10 rounded-lg">
              <div className="text-2xl font-bold text-red-600">
                {generationResults.total_failed}
              </div>
              <div className="text-sm text-text-secondary">Failed</div>
            </div>
          </div>

          {generationResults.total_generated > 0 && (
            <div className="space-y-3">
              <Button onClick={() => setCurrentPage("collections")} className="w-full">
                <Icon name="gallery" size={16} className="mr-2" />
                View New Collection
              </Button>
              <Button
                onClick={async () => {
                  try {
                    const result = await invoke("open_wallpapers_folder");
                    console.log(result);
                  } catch (err) {
                    console.error("Failed to open wallpapers folder:", err);
                    setError(`Failed to open folder: ${err}`);
                  }
                }}
                variant="secondary"
                className="w-full"
              >
                <Icon name="folder" size={16} className="mr-2" />
                Open Wallpapers Folder
              </Button>
            </div>
          )}
        </Card>
      )}

      {/* Modal Components */}
      <PromptEditorModal
        onSave={handlePromptSave}
        onReset={resetPrompt}
        hasCustomPrompt={customPrompts}
      />
    </div>
  );
}
