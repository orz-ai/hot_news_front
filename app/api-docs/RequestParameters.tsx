import { Dispatch, SetStateAction } from "react";
import { PublicEndpoint } from "../../lib/public-api";

interface RequestParametersProps {
  endpoint: PublicEndpoint;
  values: Record<string, string>;
  onValuesChange: Dispatch<SetStateAction<Record<string, string>>>;
}

export default function RequestParameters({ endpoint, values, onValuesChange }: RequestParametersProps) {
  return (
    <section className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-card dark:border-gray-700 dark:bg-gray-800">
      <div className="border-b border-gray-100 px-6 py-5 dark:border-gray-700">
        <div className="flex flex-wrap items-center gap-3">
          <span className="rounded-lg bg-green-100 px-2.5 py-1 font-mono text-xs font-bold text-green-700 dark:bg-green-900/30 dark:text-green-300">GET</span>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">{endpoint.name}</h2>
        </div>
        <p className="mt-3 text-sm leading-6 text-gray-600 dark:text-gray-300">{endpoint.description}</p>
        <code className="mt-4 block overflow-x-auto rounded-xl bg-gray-950 px-4 py-3 text-sm text-green-300">{endpoint.path}</code>
      </div>

      <div className="p-6">
        <h3 className="mb-4 text-sm font-bold text-gray-900 dark:text-white">请求参数</h3>
        {endpoint.parameters.length === 0 ? (
          <p className="rounded-xl bg-gray-50 px-4 py-3 text-sm text-gray-500 dark:bg-gray-900/40 dark:text-gray-400">此接口不需要参数。</p>
        ) : (
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            {endpoint.parameters.map((parameter) => (
              <label key={parameter.name} className="block">
                <span className="flex items-center gap-2 text-sm font-semibold text-gray-800 dark:text-gray-200">
                  {parameter.label}
                  <code className="text-xs font-normal text-gray-400">{parameter.name}</code>
                  {parameter.required && <span className="text-xs text-red-500">必填</span>}
                </span>
                <span className="mt-1 block text-xs leading-5 text-gray-500 dark:text-gray-400">{parameter.description}</span>
                {parameter.type === "select" ? (
                  <select
                    value={values[parameter.name] || ""}
                    onChange={(event) => onValuesChange((current) => ({ ...current, [parameter.name]: event.target.value }))}
                    className="mt-2 block w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-800 outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 dark:border-gray-600 dark:bg-gray-900 dark:text-gray-100"
                  >
                    {parameter.options?.map((option) => <option key={`${parameter.name}-${option.value}`} value={option.value}>{option.label}</option>)}
                  </select>
                ) : (
                  <input
                    type={parameter.type || "text"}
                    value={values[parameter.name] || ""}
                    placeholder={parameter.placeholder}
                    min={parameter.type === "number" ? 1 : undefined}
                    onChange={(event) => onValuesChange((current) => ({ ...current, [parameter.name]: event.target.value }))}
                    className="mt-2 block w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-800 outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 dark:border-gray-600 dark:bg-gray-900 dark:text-gray-100"
                  />
                )}
              </label>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
