import { useState, useEffect } from "react";

import { useSubmit, useParams } from "@remix-run/react";

interface Field {
  id: string;
  type: string;
  label: string;
  required?: boolean;
  placeholder?: string;
  helpText?: string;
  options?: string[];
}

interface Form {
  fields: Field[];
}

interface Props {
  form: Form | null;
}

export default function FormFiller({ form }: Props) {
  const [formData, setFormData] = useState<Record<string, string | string[]>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { formId } = useParams();

  useEffect(() => {
    if (form) {
      console.log("FormFiller: Form loaded", form);
      const initialData = form.fields.reduce((acc, field) => ({
        ...acc,
        [field.id]: field.type === "checkbox" ? [] : "",
      }), {});
      setFormData(initialData);
    }
  }, [form]);

  const handleChange = (fieldId: string, value: string, isCheckbox: boolean = false) => {
    if (isCheckbox) {
      setFormData((prev) => {
        const currentValues = Array.isArray(prev[fieldId]) ? prev[fieldId] as string[] : [];
        const newValues = currentValues.includes(value)
          ? currentValues.filter((v) => v !== value)
          : [...currentValues, value];
        return { ...prev, [fieldId]: newValues };
      });
    } else {
      setFormData((prev) => ({ ...prev, [fieldId]: value }));
    }
    if (errors[fieldId]) {
      setErrors((prev) => ({ ...prev, [fieldId]: "" }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form || !formId) return;

    setIsSubmitting(true);

    const newErrors: Record<string, string> = {};
    form.fields.forEach((field) => {
      if (field.required) {
        if (field.type === "checkbox") {
          if (!Array.isArray(formData[field.id]) || (formData[field.id] as string[]).length === 0) {
            newErrors[field.id] = `${field.label} requires at least one selection`;
          }
        } else if (!formData[field.id]?.toString().trim()) {
          newErrors[field.id] = `${field.label} is required`;
        }
      }
    });

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setIsSubmitting(false);
      return;
    }

    try {
      const submission = {
        ...formData,
        submittedAt: new Date().toISOString(),
      };

      // Save to localStorage
      const responses = JSON.parse(localStorage.getItem("responses") || "{}");
      if (!responses[formId]) {
        responses[formId] = [];
      }
      responses[formId].push(submission);
      localStorage.setItem("responses", JSON.stringify(responses));

      console.log("FormFiller: Saved submission", { formId, submission, allResponses: responses });

      alert("Form submitted successfully!");
      
      // Reset form after submission
      const resetData = form.fields.reduce((acc, field) => ({
        ...acc,
        [field.id]: field.type === "checkbox" ? [] : "",
      }), {});
      setFormData(resetData);
    } catch (error) {
      console.error("FormFiller: Submission error", error);
      alert("Failed to submit form. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!form) {
    return (
      <div className="p-4 bg-white dark:bg-gray-800 rounded shadow">
        <div className="text-red-500">Loading form...</div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {form.fields.map((field) => (
        <div key={field.id} className="space-y-1">
          <label htmlFor={field.id} className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            {field.label}
            {field.required && <span className="text-red-500">*</span>}
          </label>
          {field.type === "text" && (
            <input
              id={field.id}
              type="text"
              value={formData[field.id] as string || ""}
              onChange={(e) => handleChange(field.id, e.target.value)}
              placeholder={field.placeholder}
              className="w-full p-2 border rounded bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-100"
              aria-describedby={field.helpText ? `${field.id}-help` : undefined}
              disabled={isSubmitting}
            />
          )}
          {field.type === "textarea" && (
            <textarea
              id={field.id}
              value={formData[field.id] as string || ""}
              onChange={(e) => handleChange(field.id, e.target.value)}
              placeholder={field.placeholder}
              rows={4}
              className="w-full p-2 border rounded bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-100 border-gray-300 dark:border-gray-600"
              aria-describedby={field.helpText ? `${field.id}-help` : undefined}
              disabled={isSubmitting}
            />
          )}
          {field.type === "dropdown" && (
            <select
              id={field.id}
              value={formData[field.id] as string || ""}
              onChange={(e) => handleChange(field.id, e.target.value)}
              className="w-full p-2 border rounded bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-100"
              aria-describedby={field.helpText ? `${field.id}-help` : undefined}
              disabled={isSubmitting}
            >
              <option value="" disabled>
                Select an option
              </option>
              {field.options?.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          )}
          {field.type === "checkbox" && (
            <div className="space-y-2">
              {field.options?.map((option) => (
                <label key={option} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={Array.isArray(formData[field.id]) && (formData[field.id] as string[]).includes(option)}
                    onChange={() => handleChange(field.id, option, true)}
                    className="h-4 w-4 text-blue-600 border-gray-300 rounded"
                    disabled={isSubmitting}
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">{option}</span>
                </label>
              ))}
            </div>
          )}
          {field.helpText && (
            <p id={`${field.id}-help`} className="text-sm text-gray-500 dark:text-gray-400">
              {field.helpText}
            </p>
          )}
          {errors[field.id] && (
            <p className="text-red-500 text-sm" role="alert">
              {errors[field.id]}
            </p>
          )}
        </div>
      ))}
      <button
        type="submit"
        disabled={isSubmitting}
        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
        aria-label="Submit form"
      >
        {isSubmitting ? "Submitting..." : "Submit"}
      </button>
    </form>
  );
}