import { json } from "@remix-run/node";
import { useLoaderData, Link } from "@remix-run/react";

import ThemeToggle from "~/components/ThemeToggle";

export async function loader({ params }) {
  const forms = JSON.parse(localStorage.getItem("forms") || "{}");
  const submissions = JSON.parse(localStorage.getItem("submissions") || "{}");
  const form = forms[params.formId] || { fields: [], name: "Unknown Form" };
  const formSubmissions = submissions[params.formId] || [];
  return json({ form, submissions: formSubmissions });
}

export default function Responses() {
  const { form, submissions } = useLoaderData();

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 p-4">
      <div className="max-w-4xl mx-auto bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
            Submissions for {form.name || "Form"}
          </h1>
          <div className="flex space-x-4">
            <ThemeToggle />
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
            <table className="w-full table-auto border-collapse">
              <thead>
                <tr className="bg-gray-200 dark:bg-gray-700">
                  <th className="px-4 py-2 text-left text-gray-800 dark:text-white">
                    Submission ID
                  </th>
                  {form.fields.map((field) => (
                    <th
                      key={field.id}
                      className="px-4 py-2 text-left text-gray-800 dark:text-white"
                    >
                      {field.label}
                    </th>
                  ))}
                  <th className="px-4 py-2 text-left text-gray-800 dark:text-white">
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
                    <td className="px-4 py-2 text-gray-800 dark:text-white">{index + 1}</td>
                    {form.fields.map((field) => (
                      <td
                        key={field.id}
                        className="px-4 py-2 text-gray-800 dark:text-white"
                      >
                        {submission[field.id] || "-"}
                      </td>
                    ))}
                    <td className="px-4 py-2 text-gray-800 dark:text-white">
                      {new Date(submission.submittedAt || Date.now()).toLocaleString()}
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