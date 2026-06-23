"use client";

import { useEffect, useMemo, useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Navigation, Pagination } from "swiper/modules";
import { motion } from "framer-motion";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { fetchMultiPlatformData } from "../utils/api";
import { PlatformType, TrendingItem } from "../types";
import { usePlatformI18n } from "@/lib/platform-i18n";

import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/navigation";

interface FeaturedNews {
  id: string;
  title: string;
  platform: string;
  categoryId: keyof typeof CATEGORY_COLOR_MAP;
  categoryLabel: string;
  excerpt: string;
  link: string;
  hotScore: number;
  trendingTrend: "up" | "down" | "stable";
}

const FEATURED_PLATFORMS: PlatformType[] = ['weibo', 'zhihu', 'baidu', 'bilibili', '36kr'];

const PLATFORM_CATEGORY_MAP: Record<string, keyof typeof CATEGORY_COLOR_MAP> = {
  weibo: 'social',
  zhihu: 'knowledge',
  baidu: 'hotspot',
  bilibili: 'entertainment',
  '36kr': 'technology',
  shaoshupai: 'technology',
  '52pojie': 'technology',
  douban: 'culture',
  hupu: 'sports',
  tieba: 'community',
};

const CATEGORY_COLOR_MAP = {
  technology: 'bg-blue-500',
  entertainment: 'bg-purple-500',
  finance: 'bg-orange-500',
  sports: 'bg-red-500',
  social: 'bg-green-500',
  hotspot: 'bg-pink-500',
  knowledge: 'bg-cyan-500',
  culture: 'bg-emerald-500',
  community: 'bg-slate-500',
  general: 'bg-gray-500',
} as const;

export default function HeroSwiper() {
  const t = useTranslations('heroSwiper');
  const { getPlatformShortName } = usePlatformI18n();
  const [featuredNews, setFeaturedNews] = useState<FeaturedNews[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const categoryLabels = useMemo(
    () => ({
      technology: t('categories.technology'),
      entertainment: t('categories.entertainment'),
      finance: t('categories.finance'),
      sports: t('categories.sports'),
      social: t('categories.social'),
      hotspot: t('categories.hotspot'),
      knowledge: t('categories.knowledge'),
      culture: t('categories.culture'),
      community: t('categories.community'),
      general: t('categories.general'),
    }),
    [t]
  );

  const generateExcerpt = (item: TrendingItem) => {
    if (item.desc && item.desc.trim()) {
      return item.desc.length > 100 ? `${item.desc.substring(0, 100)}...` : item.desc;
    }

    const title = item.title;
    if (title.length > 50) {
      return `${title.substring(0, 50)}...${t('excerptSuffix.long')}`;
    }
    return t('excerptSuffix.short', { title });
  };

  const determineTrend = (score: number): 'up' | 'down' | 'stable' => {
    if (score >= 90) return 'up';
    if (score >= 70) return 'stable';
    return 'down';
  };

  const getFallbackNews = (): FeaturedNews[] => [
    {
      id: 'fallback-1',
      title: t('fallback.one.title'),
      platform: t('fallback.one.platform'),
      categoryId: 'general',
      categoryLabel: t('fallback.one.category'),
      excerpt: t('fallback.one.excerpt'),
      link: '#',
      hotScore: 85,
      trendingTrend: 'stable',
    },
    {
      id: 'fallback-2',
      title: t('fallback.two.title'),
      platform: t('fallback.two.platform'),
      categoryId: 'general',
      categoryLabel: t('fallback.two.category'),
      excerpt: t('fallback.two.excerpt'),
      link: '#',
      hotScore: 80,
      trendingTrend: 'up',
    },
    {
      id: 'fallback-3',
      title: t('fallback.three.title'),
      platform: t('fallback.three.platform'),
      categoryId: 'technology',
      categoryLabel: t('fallback.three.category'),
      excerpt: t('fallback.three.excerpt'),
      link: '#',
      hotScore: 75,
      trendingTrend: 'stable',
    },
  ];

  useEffect(() => {
    const fetchFeaturedNews = async () => {
      setIsLoading(true);
      try {
        const platformData = await fetchMultiPlatformData(FEATURED_PLATFORMS);
        const allFeaturedNews: FeaturedNews[] = [];

        Object.entries(platformData).forEach(([platform, response]) => {
          if (response.status === 'success' || response.status === '200') {
            const validItems = response.data.filter((item) => item.title && item.title.trim().length > 0 && item.title.length < 200);
            const topItems = validItems.slice(0, 3);
            const categoryId = PLATFORM_CATEGORY_MAP[platform] || 'general';

            topItems.forEach((item, index) => {
              const rawScore = parseFloat(item.score || '0');
              const score = rawScore > 0 ? rawScore : 95 - index * 3 - Math.random() * 5;

              allFeaturedNews.push({
                id: `${platform}-${Date.now()}-${index}`,
                title: item.title.trim(),
                platform: getPlatformShortName(platform as PlatformType),
                categoryId,
                categoryLabel: categoryLabels[categoryId],
                excerpt: generateExcerpt(item),
                link: item.url || '#',
                hotScore: Math.round(Math.min(score, 99.9) * 10) / 10,
                trendingTrend: determineTrend(score),
              });
            });
          }
        });

        let sortedNews = allFeaturedNews.filter((news) => news.title && news.title !== 'undefined').sort((a, b) => b.hotScore - a.hotScore).slice(0, 5);

        if (sortedNews.length < 3) {
          sortedNews = [...sortedNews, ...getFallbackNews().slice(0, 5 - sortedNews.length)];
        }

        setFeaturedNews(sortedNews);
      } catch (error) {
        console.error('Error fetching featured news:', error);
        setFeaturedNews(getFallbackNews());
      } finally {
        setIsLoading(false);
      }
    };

    fetchFeaturedNews();
  }, [categoryLabels, t]);

  const getCategoryColor = (categoryId: keyof typeof CATEGORY_COLOR_MAP) => CATEGORY_COLOR_MAP[categoryId] || CATEGORY_COLOR_MAP.general;

  const getTrendIcon = (trend: 'up' | 'down' | 'stable') => {
    switch (trend) {
      case 'up':
        return '📈';
      case 'down':
        return '📉';
      default:
        return '➡️';
    }
  };

  if (isLoading) {
    return (
      <div className="relative h-96 bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-800 dark:to-gray-900 rounded-3xl overflow-hidden">
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent" />
        </div>
      </div>
    );
  }

  return (
    <div className="relative">
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.8, delay: 0.2 }} className="relative">
        <Swiper
          modules={[Autoplay, Pagination, Navigation]}
          spaceBetween={30}
          centeredSlides
          autoplay={{ delay: 4000, disableOnInteraction: false }}
          pagination={{ clickable: false, dynamicBullets: false }}
          navigation
          loop
          className="hero-swiper h-96 rounded-3xl overflow-hidden"
        >
          {featuredNews.map((news) => (
            <SwiperSlide key={news.id}>
              <div className="relative h-full bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-gray-800 dark:via-gray-850 dark:to-gray-900">
                <div className="absolute inset-0">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-blue-300/20 to-purple-300/20 rounded-full blur-3xl" />
                  <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-tr from-pink-300/20 to-orange-300/20 rounded-full blur-3xl" />
                </div>

                <div className="relative h-full flex items-center justify-center px-8 md:px-16">
                  <div className="max-w-4xl mx-auto text-center">
                    <div className="flex items-center justify-center gap-3 mb-4 flex-wrap">
                      <span className="px-3 py-1 bg-white/80 dark:bg-gray-700/80 backdrop-blur-sm rounded-full text-sm font-medium text-gray-700 dark:text-gray-300">
                        {news.platform}
                      </span>
                      <span className={`px-3 py-1 ${getCategoryColor(news.categoryId)} text-white rounded-full text-sm font-medium`}>
                        {news.categoryLabel}
                      </span>
                      <span className="flex items-center gap-1 px-3 py-1 bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 rounded-full text-sm font-medium">
                        {getTrendIcon(news.trendingTrend)}
                        {news.hotScore}
                      </span>
                    </div>

                    <h2 className="text-2xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4 leading-tight">{news.title}</h2>

                    <p className="text-lg text-gray-600 dark:text-gray-300 mb-8 max-w-2xl mx-auto leading-relaxed">{news.excerpt}</p>

                    <div className="flex items-center justify-center gap-4">
                      <Link href={news.link} className="px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-full font-medium hover:from-blue-700 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl">
                        {t('viewDetails')}
                      </Link>
                      <button className="px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-full font-medium hover:bg-gray-50 dark:hover:bg-gray-800 transition-all duration-300">
                        {t('share')}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>

        <style jsx global>{`
          .hero-swiper .swiper-pagination {
            bottom: 20px !important;
          }
          .hero-swiper .swiper-pagination-bullet {
            background: rgba(255, 255, 255, 0.5) !important;
            backdrop-filter: blur(8px);
            width: 12px !important;
            height: 12px !important;
          }
          .hero-swiper .swiper-pagination-bullet-active {
            background: linear-gradient(45deg, #3b82f6, #8b5cf6) !important;
            box-shadow: 0 4px 8px rgba(59, 130, 246, 0.3);
          }
          .hero-swiper .swiper-button-next,
          .hero-swiper .swiper-button-prev {
            color: rgba(255, 255, 255, 0.8) !important;
            background: rgba(255, 255, 255, 0.1) !important;
            backdrop-filter: blur(8px);
            width: 48px !important;
            height: 48px !important;
            border-radius: 50%;
            margin-top: -24px !important;
            transition: all 0.3s ease;
          }
          .hero-swiper .swiper-button-next:hover,
          .hero-swiper .swiper-button-prev:hover {
            background: rgba(255, 255, 255, 0.2) !important;
            transform: scale(1.1);
          }
          .hero-swiper .swiper-button-next::after,
          .hero-swiper .swiper-button-prev::after {
            font-size: 18px !important;
            font-weight: bold;
          }
          @media (max-width: 768px) {
            .hero-swiper .swiper-button-next,
            .hero-swiper .swiper-button-prev {
              display: none !important;
            }
          }
        `}</style>
      </motion.div>
    </div>
  );
}
