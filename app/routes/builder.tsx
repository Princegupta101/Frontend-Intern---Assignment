import { useEffect, useState } from "react";
import { v4 as uuidv4 } from "uuid";

import { useLoaderData, useSubmit } from "@remix-run/react";
import { json, type LoaderFunctionArgs } from "@remix-run/node";

import FormBuilder from "~/components/FormBuilder";
import ThemeToggle from "~/components/ThemeToggle";
import { useFormStore } from "~/store/formStore";

interface LoaderData {
  templates: Array<{ id: string; name: string; fields: Array<any> }>;
}

const predefinedTemplates = [
  {
    id: "contact-us",
    name: "Contact Us",
    fields: [
      { id: uuidv4(), type: "text", label: "Name", required: true },
      { id: uuidv4(), type: "text", label: "Email", required: true},
      { id: uuidv4(), type: "textarea", label: "Message", required: true, minLength: 10 },
    ],
  },
  {
    id: "feedback",
    name: "Feedback Form",
    fields: [
      { id: uuidv4(), type: "dropdown", label: "Rating", options: ["1", "2", "3", "4", "5"], required: true },
      { id: uuidv4(), type: "textarea", label: "Comments", required: false },
    ],
  },
];

export async function loader() {
  return json<LoaderData>({ templates: predefinedTemplates });
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
      setTemplates([...predefinedTemplates, ...storedTemplates]);

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

      console.log("Builder: Computed styles", {
        bodyBackground: window.getComputedStyle(document.body).backgroundColor,
        containerBackground: window.getComputedStyle(document.querySelector(".min-h-screen") || document.body).backgroundColor,
      });
    }
  }, [loadTemplate]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const saveInterval = setInterval(() => {
        saveForm();
        console.log("Builder: Auto-saved form", { fields });
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
      console.log("Builder: Saved form", { formId: newFormId, form: forms[newFormId] });

      submit(
        { form: JSON.stringify({ fields }), formId: newFormId },
        { method: "post" }
      );
      setFormId(newFormId);

      const shareableLink = `/form/${newFormId}`;
      console.log("Builder: Opening shareable link in new tab", shareableLink);
      window.open(shareableLink, "_blank");
    }
  };

  const handleSaveTemplate = () => {
    if (typeof window !== "undefined" && fields.length > 0) {
      const templateName = prompt("Enter template name:");
      if (templateName) {
        const newTemplate = { id: uuidv4(), name: templateName, fields };
        const storedTemplates = JSON.parse(localStorage.getItem("formTemplates") || "[]");
        storedTemplates.push(newTemplate);
        localStorage.setItem("formTemplates", JSON.stringify(storedTemplates));
        setTemplates([...predefinedTemplates, ...storedTemplates]);
        console.log("Builder: Saved template", { templateName, fields });
      }
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
              aria-label="Save and open form in new tab"
            >
              Save & Open
            </button>
          </div>
        </div>
        <FormBuilder templates={templates} />
      </div>
    </div>
  );
}