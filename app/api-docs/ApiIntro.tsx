import { PUBLIC_API_ORIGIN } from "../../lib/public-api";

export default function ApiIntro() {
  return (
    <>
      <section className="mb-10 overflow-hidden rounded-3xl border border-primary-100 bg-gradient-to-br from-primary-50 via-white to-purple-50 px-6 py-9 shadow-card dark:border-primary-900/40 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800 md:px-10 md:py-12">
        <span className="inline-flex rounded-full border border-green-200 bg-green-50 px-3 py-1 text-sm font-medium text-green-700 dark:border-green-800 dark:bg-green-900/20 dark:text-green-300">公开 · 免费 · 无需 API Key</span>
        <h1 className="mt-4 text-3xl font-bold text-gray-900 dark:text-white md:text-5xl">热点速览开放 API</h1>
        <p className="mt-5 max-w-3xl text-base leading-8 text-gray-600 dark:text-gray-300 md:text-lg">所有接口均可直接调用，返回 JSON，并已开放跨域访问。修改参数后可在线发送请求，也可以复制 URL 或 cURL 命令集成到你的项目。</p>
        <div className="mt-6 flex flex-wrap gap-3">
          <a href={`${PUBLIC_API_ORIGIN}/api/v1/docs`} target="_blank" rel="noreferrer" className="rounded-xl bg-primary-600 px-5 py-3 text-sm font-medium text-white hover:bg-primary-700">Swagger 文档</a>
          <a href={`${PUBLIC_API_ORIGIN}/api/v1/openapi.json`} target="_blank" rel="noreferrer" className="rounded-xl border border-gray-200 bg-white px-5 py-3 text-sm font-medium text-gray-700 hover:border-primary-300 hover:text-primary-600 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200">OpenAPI JSON</a>
        </div>
      </section>

      <section className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
        {[["Base URL", PUBLIC_API_ORIGIN], ["认证方式", "无需认证"], ["响应格式", "application/json"]].map(([label, value]) => (
          <div key={label} className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-800">
            <p className="text-xs font-medium uppercase tracking-wider text-gray-400">{label}</p>
            <p className="mt-2 break-all font-mono text-sm font-semibold text-gray-800 dark:text-gray-100">{value}</p>
          </div>
        ))}
      </section>
    </>
  );
}
