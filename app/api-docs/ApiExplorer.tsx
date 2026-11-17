"use client";

import { useMemo, useState } from "react";
import { PUBLIC_API_ORIGIN, PUBLIC_ENDPOINTS, PublicEndpoint } from "../../lib/public-api";
import ApiIntro from "./ApiIntro";
import EndpointSidebar from "./EndpointSidebar";
import ApiRequestPanel from "./ApiRequestPanel";

function initialValues(endpoint: PublicEndpoint) {
  return Object.fromEntries(endpoint.parameters.map((item) => [item.name, item.defaultValue || ""]));
}

export default function ApiExplorer() {
  const [selectedId, setSelectedId] = useState(PUBLIC_ENDPOINTS[0].id);
  const endpoint = PUBLIC_ENDPOINTS.find((item) => item.id === selectedId) || PUBLIC_ENDPOINTS[0];
  const [values, setValues] = useState<Record<string, string>>(() => initialValues(PUBLIC_ENDPOINTS[0]));
  const [result, setResult] = useState("");
  const [status, setStatus] = useState<number | null>(null);
  const [duration, setDuration] = useState<number | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const groups = useMemo(() => PUBLIC_ENDPOINTS.reduce<Record<string, PublicEndpoint[]>>((all, item) => {
    all[item.group] = [...(all[item.group] || []), item];
    return all;
  }, {}), []);

  const requestUrl = useMemo(() => {
    const url = new URL(endpoint.path, PUBLIC_API_ORIGIN);
    endpoint.parameters.forEach((item) => {
      const value = values[item.name]?.trim();
      if (value) url.searchParams.set(item.name, value);
    });
    return url.toString();
  }, [endpoint, values]);

  const missingRequired = endpoint.parameters.some((item) => item.required && !values[item.name]?.trim());

  const selectEndpoint = (next: PublicEndpoint) => {
    setSelectedId(next.id);
    setValues(initialValues(next));
    setResult("");
    setStatus(null);
    setDuration(null);
    setError("");
  };

  const sendRequest = async () => {
    if (missingRequired || loading) return;
    setLoading(true);
    setResult("");
    setStatus(null);
    setError("");
    const startedAt = performance.now();
    const controller = new AbortController();
    const timeoutId = window.setTimeout(() => controller.abort(), 30_000);

    try {
      const response = await fetch(requestUrl, {
        headers: { Accept: "application/json" },
        credentials: "omit",
        signal: controller.signal,
      });
      const raw = await response.text();
      try {
        setResult(JSON.stringify(JSON.parse(raw), null, 2));
      } catch {
        setResult(raw);
      }
      setStatus(response.status);
    } catch (requestError) {
      setError(requestError instanceof DOMException && requestError.name === "AbortError"
        ? "请求超过 30 秒，已自动取消。"
        : requestError instanceof Error ? requestError.message : "请求失败，请稍后重试。");
    } finally {
      window.clearTimeout(timeoutId);
      setDuration(Math.round(performance.now() - startedAt));
      setLoading(false);
    }
  };

  return (
    <div className="py-8 md:py-12">
      <ApiIntro />
      <section className="grid grid-cols-1 gap-6 lg:grid-cols-[280px_minmax(0,1fr)]">
        <EndpointSidebar groups={groups} selectedId={endpoint.id} onSelect={selectEndpoint} />
        <ApiRequestPanel
          endpoint={endpoint}
          values={values}
          onValuesChange={setValues}
          requestUrl={requestUrl}
          result={result}
          status={status}
          duration={duration}
          error={error}
          loading={loading}
          missingRequired={missingRequired}
          onSend={sendRequest}
        />
      </section>
    </div>
  );
}
