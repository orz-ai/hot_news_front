import type { Metadata } from "next";
import { PLATFORMS } from "../../constants/platforms";
import messages from "../../messages/zh-CN.json";
import { getAllPlatformData } from "../../lib/server-api";
import AllPlatformsClient from "./AllPlatformsClient";

export const revalidate = 900;

export const metadata: Metadata = {
  title: "全部热榜平台",
  description: "浏览百度、微博、知乎、B站、抖音、GitHub、36氪等平台的实时热榜与热门内容。",
  alternates: { canonical: "/all" },
  openGraph: {
    title: "全部热榜平台｜热点速览 Orz News",
    description: "一站浏览中文互联网与科技社区实时热榜。",
    url: "https://news.orz.ai/all",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "全部热榜平台｜热点速览 Orz News",
    description: "一站浏览中文互联网与科技社区实时热榜。",
  },
};

export default async function AllPlatformsPage() {
  const initialTrendingData = await getAllPlatformData();
  const platformMessages = messages.platforms as unknown as Record<
    string,
    { name?: string }
  >;
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "全部热榜平台",
    description: "热点速览 Orz News 收录的实时热榜平台列表。",
    url: "https://news.orz.ai/all",
    isPartOf: { "@id": "https://news.orz.ai/#website" },
    mainEntity: {
      "@type": "ItemList",
      itemListElement: PLATFORMS.map((platform, index) => ({
        "@type": "ListItem",
        position: index + 1,
        name: platformMessages[platform.code]?.name || platform.code,
        url: `https://news.orz.ai/platform/${platform.code}`,
      })),
    },
    inLanguage: "zh-CN",
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }}
      />
      <AllPlatformsClient initialTrendingData={initialTrendingData} />
    </>
  );
}
