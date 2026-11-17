"use client";

import { useState } from "react";
import type { ApiRequestPanelProps } from "./ApiRequestPanel";

type ConsoleProps = Omit<ApiRequestPanelProps, "endpoint" | "values" | "onValuesChange">;

export default function RequestConsole({ requestUrl, result, status, duration, error, loading, missingRequired, onSend }: ConsoleProps) {
  const [copied, setCopied] = useState("");
  const curl = `curl --request GET '${requestUrl}' --header 'Accept: application/json'`;

  const copy = async (text: string, key: string) => {
    await navigator.clipboard.writeText(text);
    setCopied(key);
    window.setTimeout(() => setCopied(""), 1500);
  };

  return (
    <>
      <section className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-card dark:border-gray-700 dark:bg-gray-800">
        <div className="border-b border-gray-100 px-6 py-4 dark:border-gray-700"><h3 className="text-sm font-bold text-gray-900 dark:text-white">请求预览</h3></div>
        <div className="space-y-4 p-6">
          <CodePreview label="Request URL" value={requestUrl} copied={copied === "url"} onCopy={() => copy(requestUrl, "url")} />
          <CodePreview label="cURL" value={curl} copied={copied === "curl"} onCopy={() => copy(curl, "curl")} />
          <button type="button" disabled={missingRequired || loading} onClick={onSend} className="min-w-36 rounded-xl bg-primary-600 px-6 py-3 text-sm font-semibold text-white hover:bg-primary-700 disabled:cursor-not-allowed disabled:opacity-50">{loading ? "请求中…" : "发送请求"}</button>
          {missingRequired && <p className="text-sm text-red-500">请先填写所有必填参数。</p>}
        </div>
      </section>

      <section className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-card dark:border-gray-700 dark:bg-gray-800">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-100 px-6 py-4 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <h3 className="text-sm font-bold text-gray-900 dark:text-white">响应结果</h3>
            {status !== null && <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${status >= 200 && status < 300 ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300" : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300"}`}>HTTP {status}</span>}
            {duration !== null && <span className="text-xs text-gray-400">{duration} ms</span>}
          </div>
          {result && <button type="button" onClick={() => copy(result, "response")} className="text-xs font-medium text-primary-600">{copied === "response" ? "已复制" : "复制响应"}</button>}
        </div>
        <div className="p-6">
          {error ? (
            <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-900 dark:bg-red-900/20 dark:text-red-300">{error}</div>
          ) : result ? (
            <pre className="max-h-[620px] overflow-auto rounded-xl bg-gray-950 p-4 text-xs leading-6 text-gray-200"><code>{result}</code></pre>
          ) : (
            <div className="flex min-h-40 items-center justify-center rounded-xl border border-dashed border-gray-200 text-sm text-gray-400 dark:border-gray-700">发送请求后，JSON 响应会显示在这里。</div>
          )}
        </div>
      </section>
    </>
  );
}

function CodePreview({ label, value, copied, onCopy }: { label: string; value: string; copied: boolean; onCopy: () => void }) {
  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wider text-gray-400">{label}</span>
        <button type="button" onClick={onCopy} className="text-xs font-medium text-primary-600">{copied ? "已复制" : "复制"}</button>
      </div>
      <pre className="overflow-x-auto rounded-xl bg-gray-950 p-4 text-sm text-green-300"><code>{value}</code></pre>
    </div>
  );
}
