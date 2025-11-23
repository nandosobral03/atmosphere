import { create } from "zustand";

interface ModalStore {
  // Prompt Editor Modal
  isPromptEditorOpen: boolean;
  editingCategory: string | null;
  editingPrompt: string;
  editingDescription: string;

  openPromptEditor: (category: string, prompt: string, description: string) => void;
  closePromptEditor: () => void;
  updateEditingPrompt: (prompt: string) => void;
}

export const useModalStore = create<ModalStore>(set => ({
  // Prompt Editor Modal
  isPromptEditorOpen: false,
  editingCategory: null,
  editingPrompt: "",
  editingDescription: "",

  openPromptEditor: (category: string, prompt: string, description: string) =>
    set({
      isPromptEditorOpen: true,
      editingCategory: category,
      editingPrompt: prompt,
      editingDescription: description,
    }),

  closePromptEditor: () =>
    set({
      isPromptEditorOpen: false,
      editingCategory: null,
      editingPrompt: "",
      editingDescription: "",
    }),

  updateEditingPrompt: (prompt: string) =>
    set({
      editingPrompt: prompt,
    }),
}));
