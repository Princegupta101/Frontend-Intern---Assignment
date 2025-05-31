import { useEffect, useState } from "react";
import { v4 as uuidv4 } from "uuid";

import { useLoaderData, useSubmit, Link, useActionData } from "@remix-run/react";
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
      { id: uuidv4(), type: "text", label: "Email", required: true },
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
    console.log("Builder: Action processed", { formId, form });
    return json({ formId, form });
  } catch (error) {
    console.error("Builder: Action error", error);
    return json({ error: "Failed to parse form data" }, { status: 400 });
  }
}

export default function Builder() {
  const { templates: initialTemplates } = useLoaderData<LoaderData>();
  const actionData = useActionData<{ error?: string }>();
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
          console.log("Builder: Loaded existing form", { formId: existingFormId });
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

  useEffect(() => {
    if (actionData?.error) {
      console.error("Builder: Action error response", actionData.error);
      alert(`Failed to save form: ${actionData.error}`);
    }
  }, [actionData]);

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
      console.log("Builder: Saved form to localStorage", { formId: newFormId, form: forms[newFormId] });

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
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 px-4 sm:px-6 lg:px-8 py-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6 gap-4">
          <h1 className="text-xl sm:text-2xl font-bold text-gray-800 dark:text-white">
            Form Builder
          </h1>
          <div className="flex flex-wrap gap-2 sm:gap-3">
            <ThemeToggle />
            <button
              onClick={handleSaveTemplate}
              className="px-3 py-2 sm:px-4 sm:py-2 text-sm sm:text-base bg-green-600 text-white rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 transition-colors w-full sm:w-auto"
              aria-label="Save as template"
            >
              Save Template
            </button>
            <button
              onClick={handleSave}
              className="px-3 py-2 sm:px-4 sm:py-2 text-sm sm:text-base bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors w-full sm:w-auto"
              aria-label="Save and open form in new tab"
            >
              Save & Open
            </button>
            <Link
              to="/responses"
              className="px-3 py-2 sm:px-4 sm:py-2 text-sm sm:text-base bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors text-center w-full sm:w-auto"
              aria-label="View all form responses"
            >
              View All Responses
            </Link>
          </div>
        </div>
        <FormBuilder templates={templates} />
      </div>
    </div>
  );
}