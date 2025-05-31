import { useEffect, useState } from "react";

import { useLoaderData, Link } from "@remix-run/react";
import { json, type LoaderFunctionArgs } from "@remix-run/node";

interface FormSummary {
  formId: string;
  fieldCount: number;
  responseCount: number;
  fields: Array<any>;
}

interface LoaderData {
  initialForms: FormSummary[];
}

export async function loader({}: LoaderFunctionArgs) {
  // Avoid localStorage in loader to prevent SSR issues
  return json<LoaderData>({ initialForms: [] });
}

export default function FormList() {
  const { initialForms } = useLoaderData<LoaderData>();
  const [forms, setForms] = useState<FormSummary[]>(initialForms);

  useEffect(() => {
    try {
      const formsData = JSON.parse(localStorage.getItem("forms") || "{}");
      const formSummaries: FormSummary[] = Object.keys(formsData).map((formId) => {
        const responses = JSON.parse(localStorage.getItem(`responses_${formId}`) || "[]");
        const formData = formsData[formId];
        return {
          formId,
          fieldCount: formData?.fields?.length || 0,
          responseCount: Array.isArray(responses) ? responses.length : 0,
          fields: formData?.fields || [],
        };
      });
      console.log("FormList: Loaded forms from localStorage", {
        formSummaries,
        totalForms: formSummaries.length,
        fullForms: formsData,
      });
      setForms(formSummaries);
    } catch (error) {
      console.error("FormList: Error loading forms", { error: error.message, stack: error.stack });
      setForms([]);
    }
  }, []);

  const handleOpenForm = (formId: string) => {
    const shareableLink = `/form/${formId}`;
    console.log("FormList: Opening form in new tab", shareableLink);
    window.open(shareableLink, "_blank");
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 p-4">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">
          All Created Forms and Responses
        </h1>
        <Link
          to="/builder"
          className="inline-block px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 mb-4"
          aria-label="Back to form builder"
        >
          Back to Builder
        </Link>
        {forms.length === 0 ? (
          <p className="text-gray-600 dark:text-gray-400">No forms created yet. Create a form in the builder to see it here.</p>
        ) : (
          <div className="space-y-4">
            {[...forms].reverse().map((form) => (
              <div
                key={form.formId}
                className="p-4 bg-white dark:bg-gray-800 rounded shadow flex justify-between items-center"
              >
                <div>
                  <h2 className="text-lg font-semibold text-gray-800 dark:text-white">
                    Form ID: {form.formId}
                  </h2>
                  <p className="text-gray-600 dark:text-gray-400">
                    Fields: {form.fieldCount} | Responses: {form.responseCount}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Fields: {form.fields.map((f) => f.label).join(", ")}
                  </p>
                </div>
                <div className="space-x-2">
                  <button
                    onClick={() => handleOpenForm(form.formId)}
                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                    aria-label={`Open form ${form.formId} in new tab`}
                  >
                    Open Form
                  </button>
                  <Link
                    to={`/responses/${form.formId}`}
                    className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
                    aria-label={`View responses for form ${form.formId}`}
                  >
                    View Responses
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}