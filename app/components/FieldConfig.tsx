import { useFormStore } from "~/store/formStore";

export default function FieldConfig() {
  const { currentField, updateField } = useFormStore();

  if (!currentField) return <div className="text-center text-gray-500">Select a field to configure</div>;

  const handleUpdate = (updates: Partial<Field>) => {
    updateField(currentField.id, updates);
  };

  return (
    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg mt-4">
      <h2 className="text-lg font-semibold mb-4">Field Configuration</h2>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium">Label</label>
          <input
            type="text"
            value={currentField.label || ""}
            onChange={(e) => handleUpdate({ label: e.target.value })}
            className="w-full p-2 border rounded dark:bg-gray-700"
          />
        </div>
        <div>
          <label className="block text-sm font-medium">Placeholder</label>
          <input
            type="text"
            value={currentField.placeholder || ""}
            onChange={(e) => handleUpdate({ placeholder: e.target.value })}
            className="w-full p-2 border rounded dark:bg-gray-700"
          />
        </div>
        <div>
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={currentField.required || false}
              onChange={(e) => handleUpdate({ required: e.target.checked })}
              className="mr-2"
            />
            Required
          </label>
        </div>
        <div>
          <label className="block text-sm font-medium">Help Text</label>
          <textarea
            value={currentField.helpText || ""}
            onChange={(e) => handleUpdate({ helpText: e.target.value })}
            className="w-full p-2 border rounded dark:bg-gray-700"
          />
        </div>
        {(currentField.type === "dropdown" || currentField.type === "checkbox") && (
          <div>
            <label className="block text-sm font-medium">Options</label>
            {currentField.options?.map((opt, index) => (
              <div key={index} className="flex space-x-2 mb-2">
                <input
                  type="text"
                  value={opt}
                  onChange={(e) => {
                    const newOptions = [...(currentField.options || [])];
                    newOptions[index] = e.target.value;
                    handleUpdate({ options: newOptions });
                  }}
                  className="w-full p-2 border rounded dark:bg-gray-700"
                />
                <button
                  onClick={() => {
                    const newOptions = (currentField.options || []).filter((_, i) => i !== index);
                    handleUpdate({ options: newOptions });
                  }}
                  className="px-2 py-1 bg-red-600 text-white rounded"
                >
                  Delete
                </button>
              </div>
            ))}
            <button
              onClick={() =>
                handleUpdate({
                  options: [...(currentField.options || []), `Option ${(currentField.options?.length || 0) + 1}`],
                })
              }
              className="px-4 py-2 bg-blue-600 text-white rounded"
            >
              Add Option
            </button>
          </div>
        )}
      </div>
    </div>
  );
}