import type { MetadataRoute } from 'next';
import { PLATFORMS } from '../constants/platforms';

const SITE_URL = 'https://news.orz.ai';

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();

  return [
    {
      url: SITE_URL,
      lastModified,
      changeFrequency: 'hourly',
      priority: 1,
    },
    {
      url: `${SITE_URL}/all`,
      lastModified,
      changeFrequency: 'hourly',
      priority: 0.9,
    },
    {
      url: `${SITE_URL}/about`,
      lastModified,
      changeFrequency: 'monthly',
      priority: 0.4,
    },
    ...PLATFORMS.map((platform) => ({
      url: `${SITE_URL}/platform/${platform.code}`,
      lastModified,
      changeFrequency: 'hourly' as const,
      priority: 0.8,
    })),
  ];
}
