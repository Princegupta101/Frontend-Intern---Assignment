import { useState, useEffect, lazy, Suspense } from "react";
import type { DropResult, DroppableProvided, DraggableProvided } from "react-beautiful-dnd";

import { useFormStore } from "~/store/formStore";
import { FieldType } from "~/utils/types";
import FieldConfig from "./FieldConfig";
import FormPreview from "./FormPreview";

interface Template {
  name: string;
  fields: Array<{ id: string; type: FieldType; label: string; [key: string]: any }>;
}

interface FormBuilderProps {
  templates: Template[];
}

const DragDropContext = lazy(() =>
  import("react-beautiful-dnd").then((mod) => ({ default: mod.DragDropContext }))
);
const Droppable = lazy(() =>
  import("react-beautiful-dnd").then((mod) => ({ default: mod.Droppable }))
);
const Draggable = lazy(() =>
  import("react-beautiful-dnd").then((mod) => ({ default: mod.Draggable }))
);

export default function FormBuilder({ templates }: FormBuilderProps) {
  const { fields, addField, reorderFields, setCurrentField } = useFormStore();
  const [activeTab, setActiveTab] = useState<"build" | "preview">("build");
  const [isClient, setIsClient] = useState(false);

  // Ensure component only renders on client-side
  useEffect(() => {
    setIsClient(true);
  }, []);

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return;
    reorderFields(result.source.index, result.destination.index);
  };

  const addNewField = (type: FieldType) => {
    addField({
      id: `field-${Date.now()}`,
      type,
      label: `New ${type} Field`,
      required: false,
      placeholder: "",
      helpText: "",
      options: type === "dropdown" || type === "checkbox" ? ["Option 1"] : [],
    });
  };

  if (!isClient) {
    // Render a fallback UI during SSR to avoid hydration issues
    return (
      <div className="grid grid-cols-3 gap-4">
        <div className="col-span-1 bg-white dark:bg-gray-800 p-4 rounded-lg">
          <h2 className="text-lg font-semibold mb-4">Add Fields</h2>
          <p>Loading drag-and-drop interface...</p>
        </div>
        <div className="col-span-2">
          <p>Loading form builder...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-3 gap-4">
      <div className="col-span-1 bg-white dark:bg-gray-800 p-4 rounded-lg">
        <h2 className="text-lg font-semibold mb-4">Add Fields</h2>
        <div className="space-y-2">
          {["text", "textarea", "dropdown", "checkbox", "date"].map((type) => (
            <button
              key={type}
              onClick={() => addNewField(type as FieldType)}
              className="w-full px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-800 dark:text-white"
              aria-label={`Add ${type} field`}
            >
              {type.charAt(0).toUpperCase() + type.slice(1)}
            </button>
          ))}
        </div>
        <h2 className="text-lg font-semibold mt-6 mb-4">Templates</h2>
        <select
          onChange={(e) => useFormStore.getState().loadTemplate(templates[Number(e.target.value)])}
          className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          aria-label="Select form template"
        >
          <option value="">Select Template</option>
          {templates.map((template: Template, index: number) => (
            <option key={index} value={index}>
              {template.name}
            </option>
          ))}
        </select>
      </div>
      <div className="col-span-2">
        <div className="flex mb-4">
          <button
            onClick={() => setActiveTab("build")}
            className={`px-4 py-2 rounded ${
              activeTab === "build"
                ? "bg-blue-600 text-white"
                : "bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white"
            }`}
            aria-label="Build form"
          >
            Build
          </button>
          <button
            onClick={() => setActiveTab("preview")}
            className={`px-4 py-2 rounded ml-2 ${
              activeTab === "preview"
                ? "bg-blue-600 text-white"
                : "bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white"
            }`}
            aria-label="Preview form"
          >
            Preview
          </button>
        </div>
        {activeTab === "build" ? (
          <Suspense fallback={<div>Loading drag-and-drop interface...</div>}>
            <DragDropContext onDragEnd={handleDragEnd}>
              <Droppable droppableId="fields">
                {(provided: DroppableProvided) => (
                  <div
                    {...provided.droppableProps}
                    ref={provided.innerRef}
                    className="space-y-4"
                    aria-label="Form fields list"
                  >
                    {fields.map((field, index) => (
                      <Draggable key={field.id} draggableId={field.id} index={index}>
                        {(provided: DraggableProvided) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow cursor-move"
                            onClick={() => setCurrentField(field)}
                            role="button"
                            tabIndex={0}
                            aria-label={`Edit ${field.label} field`}
                            onKeyDown={(e) => {
                              if (e.key === "Enter" || e.key === " ") {
                                setCurrentField(field);
                              }
                            }}
                          >
                            <h3 className="font-semibold text-gray-800 dark:text-white">{field.label}</h3>
                            <p className="text-sm text-gray-600 dark:text-gray-400">{field.type}</p>
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </DragDropContext>
          </Suspense>
        ) : (
          <FormPreview />
        )}
        <FieldConfig />
      </div>
    </div>
  );
}