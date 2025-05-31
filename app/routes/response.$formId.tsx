import { useEffect, useState } from "react";

import { json } from "@remix-run/node";
import { useLoaderData, Link, useParams } from "@remix-run/react";

import ThemeToggle from "~/components/ThemeToggle";

export async function loader({ params }) {
  // Don't try to access localStorage on server - return empty data
  return json({ 
    form: { fields: [], name: "Form" }, 
    submissions: [],
    formId: params.formId 
  });
}

export default function Responses() {
  const loaderData = useLoaderData();
  const { formId } = useParams();
  const [form, setForm] = useState({ fields: [], name: "Form" });
  const [submissions, setSubmissions] = useState([]);

  useEffect(() => {
    if (typeof window !== "undefined" && formId) {
      try {
        const forms = JSON.parse(localStorage.getItem("forms") || "{}");
        const responses = JSON.parse(localStorage.getItem("responses") || "{}");
        
        const loadedForm = forms[formId] || { fields: [], name: "Unknown Form" };
        const formResponses = responses[formId] || [];
        
        console.log("Responses: Loaded data", { 
          formId, 
          form: loadedForm, 
          responses: formResponses 
        });
        
        setForm(loadedForm);
        setSubmissions(formResponses);
      } catch (error) {
        console.error("Responses: Error loading data", error);
      }
    }
  }, [formId]);

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 p-4">
      <div className="max-w-5xl mx-auto bg-white dark:bg-gray-900 p-6 rounded-lg">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
            Responses for {form.name || `Form ${formId}`}
          </h1>
          <div className="flex space-x-4">
            <ThemeToggle />
            <Link
              to="/responses"
              className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
            >
              All Forms
            </Link>
            <Link
              to="/builder"
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Back to Builder
            </Link>
          </div>
        </div>

        {submissions.length === 0 ? (
          <p className="text-gray-600 dark:text-gray-400 text-center">
            No submissions yet for this form.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full table-auto border-collapse border border-gray-300 dark:border-gray-600">
              <thead>
                <tr className="bg-gray-200 dark:bg-gray-700">
                  <th className="px-4 py-2 text-left text-gray-800 dark:text-white border border-gray-300 dark:border-gray-600">
                    #
                  </th>
                  {form.fields.map((field) => (
                    <th
                      key={field.id}
                      className="px-4 py-2 text-left text-gray-800 dark:text-white border border-gray-300 dark:border-gray-600"
                    >
                      {field.label}
                    </th>
                  ))}
                  <th className="px-4 py-2 text-left text-gray-800 dark:text-white border border-gray-300 dark:border-gray-600">
                    Submitted At
                  </th>
                </tr>
              </thead>
              <tbody>
                {submissions.map((submission, index) => (
                  <tr
                    key={index}
                    className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600"
                  >
                    <td className="px-4 py-2 text-gray-800 dark:text-white border border-gray-300 dark:border-gray-600">
                      {index + 1}
                    </td>
                    {form.fields.map((field) => (
                      <td
                        key={field.id}
                        className="px-4 py-2 text-gray-800 dark:text-white border border-gray-300 dark:border-gray-600"
                      >
                        {submission[field.id] || "-"}
                      </td>
                    ))}
                    <td className="px-4 py-2 text-gray-800 dark:text-white border border-gray-300 dark:border-gray-600">
                      {submission.submittedAt ? 
                        new Date(submission.submittedAt).toLocaleString() : 
                        "-"
                      }
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}