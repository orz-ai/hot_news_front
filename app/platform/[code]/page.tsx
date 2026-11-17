import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PLATFORMS } from "../../../constants/platforms";
import messages from "../../../messages/zh-CN.json";
import type { PlatformType } from "../../../types";
import { getPlatformData } from "../../../lib/server-api";
import PlatformClient from "./PlatformClient";

export const revalidate = 900;

interface PlatformPageProps {
  params: { code: string };
}

const platformMessages = messages.platforms as Record<
  string,
  { name?: string; description?: string }
>;

function getPlatform(code: string) {
  return PLATFORMS.find((platform) => platform.code === code);
}

export function generateStaticParams() {
  return PLATFORMS.map((platform) => ({ code: platform.code }));
}

export function generateMetadata({ params }: PlatformPageProps): Metadata {
  const platform = getPlatform(params.code);
  if (!platform) {
    return { title: "平台不存在", robots: { index: false, follow: false } };
  }

  const info = platformMessages[platform.code];
  const name = info?.name || platform.code;
  const description = `${name}实时热榜、热门话题与排名变化，每30分钟更新一次。`;
  const url = `https://news.orz.ai/platform/${platform.code}`;

  return {
    title: `${name}实时热榜`,
    description,
    alternates: { canonical: `/platform/${platform.code}` },
    openGraph: { title: `${name}实时热榜｜热点速览 Orz News`, description, url, type: "website" },
    twitter: {
      card: "summary_large_image",
      title: `${name}实时热榜｜热点速览 Orz News`,
      description,
    },
  };
}

export default async function PlatformPage({ params }: PlatformPageProps) {
  const platform = getPlatform(params.code);
  if (!platform) notFound();

  const initialTrendingData = await getPlatformData(platform.code as PlatformType);
  const info = platformMessages[platform.code];
  const url = `https://news.orz.ai/platform/${platform.code}`;
  const itemList = initialTrendingData.slice(0, 20).map((item, index) => ({
    "@type": "ListItem",
    position: index + 1,
    name: item.title,
    url: item.url,
  }));

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: `${info?.name || platform.code}实时热榜`,
    description: info?.description,
    url,
    isPartOf: { "@id": "https://news.orz.ai/#website" },
    mainEntity: { "@type": "ItemList", itemListElement: itemList },
    inLanguage: "zh-CN",
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }}
      />
      <PlatformClient
        platformCode={platform.code as PlatformType}
        initialTrendingData={initialTrendingData}
      />
    </>
  );
}
