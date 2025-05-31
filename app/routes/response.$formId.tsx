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
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 px-4 sm:px-6 lg:px-8 py-6">
      <div className="max-w-4xl mx-auto bg-white dark:bg-gray-800 p-4 sm:p-6 rounded-lg shadow-sm">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6 gap-4">
          <h1 className="text-xl sm:text-2xl font-bold text-gray-800 dark:text-white">
            Responses for {form.name || `Form ${formId}`}
          </h1>
          <div className="flex flex-wrap gap-2 sm:gap-3">
            <ThemeToggle />
            <Link
              to="/responses"
              className="px-3 py-2 sm:px-4 sm:py-2 text-sm sm:text-base bg-purple-600 text-white rounded-lg hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-colors w-full sm:w-auto text-center"
            >
              All Forms
            </Link>
            <Link
              to="/builder"
              className="px-3 py-2 sm:px-4 sm:py-2 text-sm sm:text-base bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors w-full sm:w-auto text-center"
            >
              Back to Builder
            </Link>
          </div>
        </div>

        {submissions.length === 0 ? (
          <p className="text-gray-600 dark:text-gray-400 text-center text-sm sm:text-base">
            No submissions yet for this form.
          </p>
        ) : (
          <div className="space-y-4">
            {/* Mobile-friendly card layout for small screens */}
            <div className="block sm:hidden space-y-4">
              {submissions.map((submission, index) => (
                <div
                  key={index}
                  className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg shadow-sm border border-gray-200 dark:border-gray-600"
                >
                  <h3 className="text-sm font-semibold text-gray-800 dark:text-white mb-2">
                    Submission #{index + 1}
                  </h3>
                  {form.fields.map((field) => (
                    <div key={field.id} className="mb-2">
                      <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
                        {field.label}:
                      </span>
                      <p className="text-sm text-gray-800 dark:text-white break-words">
                        {Array.isArray(submission[field.id]) 
                          ? submission[field.id].join(", ") 
                          : submission[field.id] || "-"}
                      </p>
                    </div>
                  ))}
                  <div className="mt-2">
                    <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
                      Submitted At:
                    </span>
                    <p className="text-sm text-gray-800 dark:text-white">
                      {submission.submittedAt
                        ? new Date(submission.submittedAt).toLocaleString()
                        : "-"}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Table layout for larger screens */}
            <div className="hidden sm:block overflow-x-auto">
              <table className="w-full table-auto border-collapse border border-gray-300 dark:border-gray-600">
                <thead>
                  <tr className="bg-gray-200 dark:bg-gray-700">
                    <th className="px-4 py-2 text-left text-sm text-gray-800 dark:text-white border border-gray-300 dark:border-gray-600">
                      #
                    </th>
                    {form.fields.map((field) => (
                      <th
                        key={field.id}
                        className="px-4 py-2 text-left text-sm text-gray-800 dark:text-white border border-gray-300 dark:border-gray-600"
                      >
                        {field.label}
                      </th>
                    ))}
                    <th className="px-4 py-2 text-left text-sm text-gray-800 dark:text-white border border-gray-300 dark:border-gray-600">
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
                      <td className="px-4 py-2 text-sm text-gray-800 dark:text-white border border-gray-300 dark:border-gray-600">
                        {index + 1}
                      </td>
                      {form.fields.map((field) => (
                        <td
                          key={field.id}
                          className="px-4 py-2 text-sm text-gray-800 dark:text-white border border-gray-300 dark:border-gray-600"
                        >
                          {Array.isArray(submission[field.id]) 
                            ? submission[field.id].join(", ") 
                            : submission[field.id] || "-"}
                        </td>
                      ))}
                      <td className="px-4 py-2 text-sm text-gray-800 dark:text-white border border-gray-300 dark:border-gray-600">
                        {submission.submittedAt
                          ? new Date(submission.submittedAt).toLocaleString()
                          : "-"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}