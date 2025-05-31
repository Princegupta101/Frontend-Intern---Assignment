import { useState } from "react";

import { useFormStore } from "~/store/formStore";
import { validateField } from "~/utils/validation";
import ProgressIndicator from "./ProgressIndicator";

interface Field {
  id: string;
  type: string;
  label: string;
  required?: boolean;
  placeholder?: string;
  helpText?: string;
  options?: string[];
  step?: number;
}

export default function FormPreview() {
  const { fields, currentStep, setCurrentStep } = useFormStore();
  const [formData, setFormData] = useState<Record<string, string | boolean>>({});
  const [errors, setErrors] = useState<Record<string, string | null>>({});
  const [viewMode, setViewMode] = useState<"desktop" | "tablet" | "mobile">("desktop");

  const steps = Array.from(new Set(fields.map((field: Field) => field.step || 1)));
  const currentFields = fields.filter((field: Field) => (field.step || 1) === currentStep);

  const handleInputChange = (fieldId: string, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [fieldId]: value }));
    const field = fields.find((f: Field) => f.id === fieldId);
    const error = field ? validateField(field, value) : null;
    setErrors((prev) => ({ ...prev, [fieldId]: error }));
  };

  const handleNextStep = () => {
    const hasErrors = currentFields.some((field: Field) =>
      validateField(field, formData[field.id] ?? "")
    );
    if (!hasErrors && currentStep < steps.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleSubmit = () => {
    const hasErrors = currentFields.some((field: Field) =>
      validateField(field, formData[field.id] ?? "")
    );
    if (!hasErrors) {
      console.log("Form preview submitted:", formData);
      alert("Form preview submitted successfully!");
    }
  };

  return (
    <div
      className={`bg-white dark:bg-gray-800 p-4 rounded-lg shadow ${
        viewMode === "mobile" ? "max-w-sm" : viewMode === "tablet" ? "max-w-md" : "max-w-2xl"
      } mx-auto`}
      role="form"
      aria-label="Form preview"
    >
      <div className="flex space-x-2 mb-4">
        {(["desktop", "tablet", "mobile"] as const).map((mode) => (
          <button
            key={mode}
            onClick={() => setViewMode(mode)}
            className={`px-4 py-2 rounded ${
              viewMode === mode
                ? "bg-blue-600 text-white"
                : "bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white hover:bg-gray-300 dark:hover:bg-gray-600"
            }`}
            aria-pressed={viewMode === mode}
          >
            {mode.charAt(0).toUpperCase() + mode.slice(1)}
          </button>
        ))}
      </div>
      {steps.length > 1 && <ProgressIndicator />}
      <div className="space-y-4">
        {currentFields.map((field: Field) => (
          <div key={field.id} className="space-y-1">
            <label
              htmlFor={field.id}
              className="block text-sm font-medium text-gray-800 dark:text-white"
            >
              {field.label} {field.required && <span className="text-red-500">*</span>}
            </label>
            {field.type === "text" && (
              <input
                id={field.id}
                type="text"
                placeholder={field.placeholder}
                value={(formData[field.id] as string) || ""}
                onChange={(e) => handleInputChange(field.id, e.target.value)}
                className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                required={field.required}
                aria-describedby={field.helpText ? `${field.id}-help` : undefined}
                aria-invalid={!!errors[field.id]}
                aria-errormessage={errors[field.id] ? `${field.id}-error` : undefined}
              />
            )}
            {field.type === "textarea" && (
              <textarea
                id={field.id}
                placeholder={field.placeholder}
                value={(formData[field.id] as string) || ""}
                onChange={(e) => handleInputChange(field.id, e.target.value)}
                className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                required={field.required}
                aria-describedby={field.helpText ? `${field.id}-help` : undefined}
                aria-invalid={!!errors[field.id]}
                aria-errormessage={errors[field.id] ? `${field.id}-error` : undefined}
              />
            )}
            {field.type === "dropdown" && (
              <select
                id={field.id}
                value={(formData[field.id] as string) || ""}
                onChange={(e) => handleInputChange(field.id, e.target.value)}
                className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                required={field.required}
                aria-describedby={field.helpText ? `${field.id}-help` : undefined}
                aria-invalid={!!errors[field.id]}
                aria-errormessage={errors[field.id] ? `${field.id}-error` : undefined}
              >
                <option value="">{field.placeholder || "Select an option"}</option>
                {field.options?.map((opt: string) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
            )}
            {field.type === "checkbox" && (
              <div className="space-y-2">
                {field.options?.map((opt: string) => (
                  <label key={opt} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData[field.id] === opt}
                      onChange={(e) => handleInputChange(field.id, e.target.checked ? opt : "")}
                      className="mr-2"
                      aria-describedby={field.helpText ? `${field.id}-help` : undefined}
                    />
                    <span className="text-gray-800 dark:text-white">{opt}</span>
                  </label>
                ))}
              </div>
            )}
            {field.type === "date" && (
              <input
                id={field.id}
                type="date"
                value={(formData[field.id] as string) || ""}
                onChange={(e) => handleInputChange(field.id, e.target.value)}
                className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                required={field.required}
                aria-describedby={field.helpText ? `${field.id}-help` : undefined}
                aria-invalid={!!errors[field.id]}
                aria-errormessage={errors[field.id] ? `${field.id}-error` : undefined}
              />
            )}
            {errors[field.id] && (
              <p id={`${field.id}-error`} className="text-red-500 text-sm">
                {errors[field.id]}
              </p>
            )}
            {field.helpText && (
              <p id={`${field.id}-help`} className="text-gray-500 dark:text-gray-400 text-sm">
                {field.helpText}
              </p>
            )}
          </div>
        ))}
      </div>
      <div className="flex justify-between mt-6">
        {currentStep > 1 && (
          <button
            onClick={() => setCurrentStep(currentStep - 1)}
            className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white rounded hover:bg-gray-300 dark:hover:bg-gray-600"
            aria-label="Go to previous step"
          >
            Previous
          </button>
        )}
        <div className="flex space-x-2">
          {currentStep < steps.length && (
            <button
              onClick={handleNextStep}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              aria-label="Go to next step"
            >
              Next
            </button>
          )}
          {currentStep === steps.length && (
            <button
              onClick={handleSubmit}
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
              aria-label="Submit form"
            >
              Submit
            </button>
          )}
        </div>
      </div>
    </div>
  );
}