import "server-only";

import type {
  ApiResponse,
  HotSummaryResponse,
  PlatformType,
  TrendingItem,
} from "../types";

const DEFAULT_API_BASE_URL = "https://news.orz.ai/api/v1/dailynews/";
const API_BASE_URL = (
  process.env.SERVER_API_BASE_URL ||
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  DEFAULT_API_BASE_URL
).replace(/\/?$/, "/");

async function fetchJson<T>(url: string): Promise<T | null> {
  try {
    const response = await fetch(url, {
      headers: { Accept: "application/json" },
      next: { revalidate: 900 },
      signal: AbortSignal.timeout(8_000),
    });

    if (!response.ok) return null;
    return (await response.json()) as T;
  } catch (error) {
    console.error(`Server data fetch failed for ${url}:`, error);
    return null;
  }
}

export async function getMultiPlatformData(
  platforms: PlatformType[],
): Promise<Partial<Record<PlatformType, TrendingItem[]>>> {
  if (platforms.length === 0) return {};

  const url = `${API_BASE_URL}multi?platforms=${encodeURIComponent(platforms.join(","))}`;
  const response = await fetchJson<{
    status: string;
    data: Partial<Record<PlatformType, TrendingItem[]>>;
  }>(url);

  return response?.status === "200" ? response.data || {} : {};
}

export async function getPlatformData(
  platform: PlatformType,
): Promise<TrendingItem[]> {
  const response = await fetchJson<ApiResponse>(
    `${API_BASE_URL}?platform=${encodeURIComponent(platform)}`,
  );

  return response?.status === "200" ? response.data || [] : [];
}

export async function getAllPlatformData(): Promise<
  Partial<Record<PlatformType, TrendingItem[]>>
> {
  const response = await fetchJson<{
    status: string;
    data: Partial<Record<PlatformType, TrendingItem[]>>;
  }>(`${API_BASE_URL}all`);

  return response?.status === "200" ? response.data || {} : {};
}

export async function getHotSummary(): Promise<HotSummaryResponse | null> {
  const response = await fetchJson<HotSummaryResponse>(
    API_BASE_URL.replace("dailynews/", "llm/hot-summary"),
  );

  return response?.status === "success" ? response : null;
}
