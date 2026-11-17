import type { Metadata } from "next";
import HomeClient from "./HomeClient";
import { PLATFORMS } from "../constants/platforms";
import { getHotSummary, getMultiPlatformData } from "../lib/server-api";

export const revalidate = 900;

export const metadata: Metadata = {
  title: "全网热点趋势聚合平台",
  description: "实时聚合百度、微博、知乎、B站、36氪等平台热榜，并提供跨平台热点趋势、关键词和每日总结。",
  alternates: { canonical: "/" },
  openGraph: {
    title: "热点速览 Orz News｜全网热点趋势聚合平台",
    description: "实时查看中文互联网热榜、跨平台热点趋势和每日热点总结。",
    url: "https://news.orz.ai/",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "热点速览 Orz News｜全网热点趋势聚合平台",
    description: "实时查看中文互联网热榜、跨平台热点趋势和每日热点总结。",
  },
};

export default async function HomePage() {
  const platformCodes = PLATFORMS.slice(0, 6).map((platform) => platform.code);
  const [initialTrendingData, initialSummary] = await Promise.all([
    getMultiPlatformData(platformCodes),
    getHotSummary(),
  ]);

  const collectionJsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "@id": "https://news.orz.ai/#collection",
    name: "热点速览 Orz News",
    description: "全网热门内容、跨平台热点趋势与每日热点总结。",
    url: "https://news.orz.ai/",
    isPartOf: { "@id": "https://news.orz.ai/#website" },
    inLanguage: "zh-CN",
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(collectionJsonLd).replace(/</g, "\\u003c"),
        }}
      />
      <HomeClient
        initialTrendingData={initialTrendingData}
        initialSummary={initialSummary}
      />
    </>
  );
}
