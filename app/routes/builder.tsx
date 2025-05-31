import { useEffect, useState } from "react";
import { v4 as uuidv4 } from "uuid";

import { useLoaderData, useSubmit } from "@remix-run/react";
import { json, type LoaderFunctionArgs } from "@remix-run/node";

import FormBuilder from "~/components/FormBuilder";
import ThemeToggle from "~/components/ThemeToggle";
import { useFormStore } from "~/store/formStore";

interface LoaderData {
  templates: Array<{ name: string; fields: Array<any> }>;
}

export async function loader() {
  return json<LoaderData>({ templates: [] });
}

export async function action({ request }: LoaderFunctionArgs) {
  const formData = await request.formData();
  const formString = formData.get("form");
  const formId = formData.get("formId") || uuidv4();

  if (!formString || typeof formString !== "string") {
    return json({ error: "Invalid form data" }, { status: 400 });
  }

  try {
    const form = JSON.parse(formString);
    return json({ formId, form });
  } catch (error) {
    return json({ error: "Failed to parse form data" }, { status: 400 });
  }
}

export default function Builder() {
  const { templates: initialTemplates } = useLoaderData<LoaderData>();
  const submit = useSubmit();
  const { fields, saveForm, loadTemplate } = useFormStore();
  const [templates, setTemplates] = useState(initialTemplates);
  const [formId, setFormId] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedTemplates = JSON.parse(localStorage.getItem("formTemplates") || "[]");
      setTemplates(storedTemplates);

      // Check for existing formId in URL (e.g., /builder?formId=xyz)
      const urlParams = new URLSearchParams(window.location.search);
      const existingFormId = urlParams.get("formId");
      if (existingFormId) {
        const forms = JSON.parse(localStorage.getItem("forms") || "{}");
        const existingForm = forms[existingFormId];
        if (existingForm) {
          loadTemplate(existingForm);
          setFormId(existingFormId);
        }
      }
    }
  }, [loadTemplate]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const saveInterval = setInterval(() => {
        saveForm();
      }, 5000);
      return () => clearInterval(saveInterval);
    }
  }, [fields, saveForm]);

  const handleSave = () => {
    if (typeof window !== "undefined") {
      if (fields.length === 0) {
        alert("Cannot save an empty form!");
        return;
      }

      const forms = JSON.parse(localStorage.getItem("forms") || "{}");
      const newFormId = formId || uuidv4();
      forms[newFormId] = { fields };
      localStorage.setItem("forms", JSON.stringify(forms));
      console.log("Saved form:", newFormId, forms[newFormId]); // Debug log

      submit(
        { form: JSON.stringify({ fields }), formId: newFormId },
        { method: "post" }
      );
      setFormId(newFormId);
      alert(`Form saved! Shareable link: /form/${newFormId}`);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 p-4">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Form Builder</h1>
          <div className="space-x-2">
            <ThemeToggle />
            <button
              onClick={handleSave}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              aria-label="Save and share form"
            >
              Save & Share
            </button>
          </div>
        </div>
        <FormBuilder templates={templates} />
      </div>
    </div>
  );
}