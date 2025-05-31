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
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const submit = useSubmit();
  const { formId } = useParams();

  useEffect(() => {
    if (form) {
      console.log("Form loaded:", form);
      const initialData = form.fields.reduce((acc, field) => ({
        ...acc,
        [field.id]: "",
      }), {});
      setFormData(initialData);
    }
  }, [form]);

  const handleChange = (fieldId: string, value: string) => {
    setFormData((prev) => ({ ...prev, [fieldId]: value }));
    if (errors[fieldId]) {
      setErrors((prev) => ({ ...prev, [fieldId]: "" }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form) return;

    const newErrors: Record<string, string> = {};
    form.fields.forEach((field) => {
      if (field.required && !formData[field.id]) {
        newErrors[field.id] = `${field.label} is required`;
      }
    });

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    const submission = {
      ...formData,
      submittedAt: new Date().toISOString(),
    };

    submit({ ...submission }, { method: "post", action: `/form/${formId}` });
    alert("Form submitted!");
  };

  if (!form) {
    return <div className="text-red-500">No form provided</div>;
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {form.fields.map((field) => (
        <div key={field.id} className="space-y-1">
          <label className="block text-sm font-medium">
            {field.label}
            {field.required && <span className="text-red-500">*</span>}
          </label>
          {field.type === "text" && (
            <input
              type="text"
              value={formData[field.id] || ""}
              onChange={(e) => handleChange(field.id, e.target.value)}
              placeholder={field.placeholder}
              className="w-full p-2 border rounded dark:bg-gray-700"
            />
          )}
          {field.type === "textarea" && (
            <textarea
              value={formData[field.id] || ""}
              onChange={(e) => handleChange(field.id, e.target.value)}
              placeholder={field.placeholder}
              className="w-full p-2 border rounded dark:bg-gray-700"
            />
          )}
          {field.helpText && <p className="text-sm text-gray-500">{field.helpText}</p>}
          {errors[field.id] && <p className="text-red-500 text-sm">{errors[field.id]}</p>}
        </div>
      ))}
      <button
        type="submit"
        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
      >
        Submit
      </button>
    </form>
  );
}