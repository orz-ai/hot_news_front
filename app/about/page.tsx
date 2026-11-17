import type { Metadata } from "next";
import AboutClient from "./AboutClient";

export const metadata: Metadata = {
  title: "关于我们",
  description: "了解热点速览 Orz News 的数据来源、热点聚合方式、API 服务与联系方式。",
  alternates: { canonical: "/about" },
  openGraph: {
    title: "关于热点速览 Orz News",
    description: "热点速览是一个提供跨平台热榜与趋势分析的内容聚合平台。",
    url: "https://news.orz.ai/about",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "关于热点速览 Orz News",
    description: "热点速览是一个提供跨平台热榜与趋势分析的内容聚合平台。",
  },
};

export default function AboutPage() {
  return <AboutClient />;
}
