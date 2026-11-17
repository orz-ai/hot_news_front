import type { Metadata } from "next";
import ApiExplorer from "./ApiExplorer";

export const metadata: Metadata = {
  title: "开放 API 文档与在线调试",
  description: "热点速览 Orz News 开放 API 文档。无需 API Key，可在线调用热榜、搜索、趋势分析、关键词云和热点总结接口。",
  alternates: { canonical: "/api-docs" },
  openGraph: {
    title: "开放 API 文档与在线调试｜热点速览 Orz News",
    description: "无需认证，在线调用热点速览的热榜、分析与热点总结 API。",
    url: "https://news.orz.ai/api-docs",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "开放 API 文档与在线调试｜热点速览 Orz News",
    description: "无需认证，在线调用热点速览公开 API。",
  },
};

export default function ApiDocsPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "TechArticle",
    headline: "热点速览开放 API 文档",
    description: "热点速览公开 REST API 的参数说明与在线调用工具。",
    url: "https://news.orz.ai/api-docs",
    inLanguage: "zh-CN",
    author: { "@id": "https://news.orz.ai/#organization" },
    isPartOf: { "@id": "https://news.orz.ai/#website" },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }}
      />
      <ApiExplorer />
    </>
  );
}
