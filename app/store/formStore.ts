import { create } from "zustand";

import type { FieldType } from "~/utils/types";

interface Field {
  id: string;
  type: FieldType;
  label: string;
  required?: boolean;
  placeholder?: string;
  helpText?: string;
  options?: string[];
  step?: number;
  minLength?: number;
  maxLength?: number;
  pattern?: string;
}

interface Template {
  name: string;
  fields: Field[];
}

interface FormState {
  fields: Field[];
  currentStep: number;
  currentField: Field | null;
  history: Field[][];
  addField: (field: Field) => void;
  reorderFields: (startIndex: number, endIndex: number) => void;
  updateField: (fieldId: string, updates: Partial<Field>) => void;
  setCurrentField: (field: Field | null) => void;
  setCurrentStep: (step: number) => void;
  loadTemplate: (template: Template) => void;
  saveForm: () => void;
  undo: () => void;
  redo: () => void;
}

export const useFormStore = create<FormState>((set, get) => ({
  fields: [],
  currentStep: 1,
  currentField: null,
  history: [],
  addField: (field) =>
    set((state) => ({
      fields: [...state.fields, field],
      history: [...state.history, state.fields],
    })),
  reorderFields: (startIndex, endIndex) =>
    set((state) => {
      const fields = [...state.fields];
      const [reorderedItem] = fields.splice(startIndex, 1);
      fields.splice(endIndex, 0, reorderedItem);
      return { fields, history: [...state.history, state.fields] };
    }),
  updateField: (fieldId, updates) =>
    set((state) => {
      const updatedFields = state.fields.map((field) =>
        field.id === fieldId ? { ...field, ...updates } : field
      );
      const updatedCurrentField =
        state.currentField && state.currentField.id === fieldId
          ? { ...state.currentField, ...updates }
          : state.currentField;
      return {
        fields: updatedFields,
        currentField: updatedCurrentField,
        history: [...state.history, state.fields],
      };
    }),
  setCurrentField: (field) => set({ currentField: field }),
  setCurrentStep: (step) => set({ currentStep: step }),
  loadTemplate: (template) =>
    set({ fields: template.fields, history: [template.fields] }),
  saveForm: () => {
    const { fields } = get();
    if (typeof window !== "undefined") {
      localStorage.setItem("draftForm", JSON.stringify(fields));
    }
  },
  undo: () =>
    set((state) => {
      const history = [...state.history];
      const previous = history.pop();
      return { fields: previous || state.fields, history };
    }),
  redo: () => {
    // Redo logic can be implemented if needed
  },
}));