import { useEffect, useState } from "react";

import { json, type LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData, useSubmit } from "@remix-run/react";

import FormFiller from "~/components/FormFiller";

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

interface Form {
  fields: Field[];
}

interface LoaderData {
  form: Form | null;
  formId: string | null;
}

export async function loader({ params }: LoaderFunctionArgs) {
  const formId = params.formId;
  if (!formId) {
    return json<LoaderData>({ form: null, formId: null }, { status: 404 });
  }
  return json<LoaderData>({ form: null, formId });
}

export async function action({ request }: LoaderFunctionArgs) {
  const formData = await request.formData();
  const submission = Object.fromEntries(formData);

  try {
    return json({ success: true, submission });
  } catch (error) {
    return json({ error: "Failed to process submission" }, { status: 400 });
  }
}

export default function FormPage() {
  const { form: serverForm, formId } = useLoaderData<LoaderData>();
  const submit = useSubmit();
  const [form, setForm] = useState<Form | null>(serverForm);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined" && formId) {
      const forms = JSON.parse(localStorage.getItem("forms") || "{}");
      const loadedForm = forms[formId] || null;
      console.log("Loaded form:", formId, loadedForm); // Debug log
      if (loadedForm) {
        setForm(loadedForm);
      } else {
        setError("Form not found. It may not exist or has been deleted.");
      }
    }
  }, [formId]);

  if (error) {
    return (
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900 p-4">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">Form Not Found</h1>
          <p className="text-red-500">{error}</p>
          <a
            href="/builder"
            className="mt-4 inline-block px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Back to Form Builder
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 p-4">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">Fill Form</h1>
        <FormFiller form={form} />
      </div>
    </div>
  );
}