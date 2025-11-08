"use client";

import { useEffect, useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination, Navigation } from "swiper/modules";
import { motion } from "framer-motion";
import Link from "next/link";
import { fetchMultiPlatformData } from "../utils/api";
import { PlatformType, TrendingItem } from "../types";

// Import Swiper styles
import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/navigation";

interface FeaturedNews {
  id: string;
  title: string;
  platform: string;
  category: string;
  excerpt: string;
  link: string;
  hot_score: number;
  trending_trend: "up" | "down" | "stable";
  publish_time?: string;
}

const HeroSwiper = () => {
  const [featuredNews, setFeaturedNews] = useState<FeaturedNews[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // 精选平台列表 - 选择活跃度较高且内容丰富的平台
  const FEATURED_PLATFORMS: PlatformType[] = ['weibo', 'zhihu', 'baidu', 'bilibili', '36kr'];

  // 平台到分类的映射
  const PLATFORM_CATEGORIES: Record<string, string> = {
    'weibo': '社会',
    'zhihu': '知识',
    'baidu': '热点',
    'bilibili': '娱乐',
    '36kr': '科技',
    'shaoshupai': '科技',
    '52pojie': '技术',
    'douban': '文化',
    'hupu': '体育',
    'tieba': '社区'
  };

  // 获取精选新闻数据的核心逻辑
  const fetchFeaturedNews = async () => {
    setIsLoading(true);
    try {
      console.log('正在获取精选新闻数据...');

      // 从多个平台获取数据
      const platformData = await fetchMultiPlatformData(FEATURED_PLATFORMS);

      const allFeaturedNews: FeaturedNews[] = [];

      // 处理每个平台的数据
      Object.entries(platformData).forEach(([platform, response]) => {
        if (response.status === 'success' || response.status === '200') {
          // 过滤有效数据并选择前3个热度最高的内容
          const validItems = response.data.filter(item =>
            item.title &&
            item.title.trim().length > 0 &&
            item.title.length < 200 // 避免标题过长
          );

          const topItems = validItems.slice(0, 3);

          topItems.forEach((item, index) => {
            const rawScore = parseFloat(item.score || '0');
            // 使用更智能的分数计算
            const score = rawScore > 0 ? rawScore : (95 - index * 3 - Math.random() * 5);

            const featuredItem: FeaturedNews = {
              id: `${platform}-${Date.now()}-${index}`, // 使用时间戳确保唯一性
              title: item.title.trim(),
              platform: getPlatformDisplayName(platform as PlatformType),
              category: PLATFORM_CATEGORIES[platform] || '综合',
              excerpt: generateExcerpt(item),
              link: item.url || '#',
              hot_score: Math.round(Math.min(score, 99.9) * 10) / 10, // 保留一位小数
              trending_trend: determineTrend(score),
              publish_time: item.pubDate || item.publish_time
            };

            allFeaturedNews.push(featuredItem);
          });
        } else {
          console.warn(`Platform ${platform} returned status: ${response.status}, msg: ${response.msg}`);
        }
      });

      // 按热度排序，选择前5个，确保有数据
      let sortedNews = allFeaturedNews
        .filter(news => news.title && news.title !== 'undefined')
        .sort((a, b) => b.hot_score - a.hot_score)
        .slice(0, 5);

      // 如果获取的数据少于3条，补充备用数据
      if (sortedNews.length < 3) {
        console.warn('获取的热点新闻数量不足，添加备用数据');
        const fallbackData = getFallbackNews().slice(0, 5 - sortedNews.length);
        sortedNews = [...sortedNews, ...fallbackData];
      }

      console.log(`成功获取 ${sortedNews.length} 条精选新闻`);
      setFeaturedNews(sortedNews);
    } catch (error) {
      console.error("Error fetching featured news:", error);
      // 如果API调用失败，使用备用的模拟数据
      setFeaturedNews(getFallbackNews());
    } finally {
      setIsLoading(false);
    }
  };

  // 初始化数据获取
  useEffect(() => {
    fetchFeaturedNews();
  }, []);

  // 获取平台显示名称
  const getPlatformDisplayName = (platform: PlatformType): string => {
    const platformNames: Record<PlatformType, string> = {
      'weibo': '微博',
      'zhihu': '知乎',
      'baidu': '百度',
      'bilibili': 'B站',
      '36kr': '36氪',
      'shaoshupai': '少数派',
      '52pojie': '吾爱破解',
      'douban': '豆瓣',
      'hupu': '虎扑',
      'tieba': '贴吧',
      juejin: "掘金",
      douyin: "抖音",
      v2ex: "V2EX",
      jinritoutiao: "今日头条",
      stackoverflow: "Stack Overflow",
      github: "Github",
      hackernews: "Hack news",
      tenxunwang: "腾讯网",
      sina_finance: "新浪财经",
      eastmoney: "东方财经网",
      xueqiu: "雪球",
      cls: "财联社"
    };
    return platformNames[platform] || platform;
  };

  // 生成内容摘要
  const generateExcerpt = (item: TrendingItem): string => {
    if (item.desc && item.desc.trim()) {
      return item.desc.length > 100 ? item.desc.substring(0, 100) + '...' : item.desc;
    }

    // 如果没有描述，根据标题生成简单摘要
    const title = item.title;
    if (title.length > 50) {
      return title.substring(0, 50) + '...引发广泛关注和讨论。';
    }
    return `${title}成为当前热门话题，引发广泛关注和讨论。`;
  };

  // 根据分数判断趋势
  const determineTrend = (score: number): "up" | "down" | "stable" => {
    if (score >= 90) return "up";
    if (score >= 70) return "stable";
    return "down";
  };

  // 备用数据（当API调用失败或数据不足时使用）
  const getFallbackNews = (): FeaturedNews[] => {
    return [
      {
        id: "fallback-1",
        title: "热点资讯正在更新中",
        platform: "系统",
        category: "提示",
        excerpt: "正在从各大平台获取最新热点资讯，请稍后刷新页面查看最新内容。",
        link: "#",
        hot_score: 85.0,
        trending_trend: "stable"
      },
      {
        id: "fallback-2",
        title: "多平台热点内容汇总",
        platform: "聚合",
        category: "综合",
        excerpt: "汇聚微博、知乎、百度等多平台热点内容，为您提供全面的资讯视角。",
        link: "#",
        hot_score: 80.0,
        trending_trend: "up"
      },
      {
        id: "fallback-3",
        title: "实时热点追踪系统",
        platform: "平台",
        category: "科技",
        excerpt: "基于大数据分析的热点追踪系统，实时监控网络热点趋势变化。",
        link: "#",
        hot_score: 75.0,
        trending_trend: "stable"
      }
    ];
  };

  const getCategoryColor = (category: string) => {
    const colors: { [key: string]: string } = {
      '科技': 'bg-blue-500',
      '娱乐': 'bg-purple-500',
      '财经': 'bg-orange-500',
      '体育': 'bg-red-500',
      '社会': 'bg-green-500',
    };
    return colors[category] || 'bg-gray-500';
  };

  const getTrendIcon = (trend: "up" | "down" | "stable") => {
    switch (trend) {
      case "up":
        return "📈";
      case "down":
        return "📉";
      case "stable":
        return "➡️";
      default:
        return "➡️";
    }
  };

  if (isLoading) {
    return (
      <div className="relative h-96 bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-800 dark:to-gray-900 rounded-3xl overflow-hidden">
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative">
      {/* 轮播区域 */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, delay: 0.2 }}
        className="relative"
      >
        <Swiper
          modules={[Autoplay, Pagination, Navigation]}
          spaceBetween={30}
          centeredSlides={true}
          autoplay={{
            delay: 4000,
            disableOnInteraction: false,
          }}
          pagination={{
            clickable: false,
            dynamicBullets: false,
          }}
          navigation={true}
          loop={true}
          className="hero-swiper h-96 rounded-3xl overflow-hidden"
        >
          {featuredNews.map((news) => (
            <SwiperSlide key={news.id}>
              <div className="relative h-full bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-gray-800 dark:via-gray-850 dark:to-gray-900">
                {/* 背景装饰 */}
                <div className="absolute inset-0">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-blue-300/20 to-purple-300/20 rounded-full blur-3xl"></div>
                  <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-tr from-pink-300/20 to-orange-300/20 rounded-full blur-3xl"></div>
                </div>

                <div className="relative h-full flex items-center justify-center px-8 md:px-16">
                  <div className="max-w-4xl mx-auto text-center">
                    {/* 平台和分类标签 */}
                    <div className="flex items-center justify-center gap-3 mb-4">
                      <span className="px-3 py-1 bg-white/80 dark:bg-gray-700/80 backdrop-blur-sm rounded-full text-sm font-medium text-gray-700 dark:text-gray-300">
                        {news.platform}
                      </span>
                      <span className={`px-3 py-1 ${getCategoryColor(news.category)} text-white rounded-full text-sm font-medium`}>
                        {news.category}
                      </span>
                      <span className="flex items-center gap-1 px-3 py-1 bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 rounded-full text-sm font-medium">
                        {getTrendIcon(news.trending_trend)}
                        {news.hot_score}
                      </span>
                    </div>

                    {/* 标题 */}
                    <h2 className="text-2xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4 leading-tight">
                      {news.title}
                    </h2>

                    {/* 摘要 */}
                    <p className="text-lg text-gray-600 dark:text-gray-300 mb-8 max-w-2xl mx-auto leading-relaxed">
                      {news.excerpt}
                    </p>

                    {/* 操作按钮 */}
                    <div className="flex items-center justify-center gap-4">
                      <Link
                        href={news.link}
                        className="px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-full font-medium hover:from-blue-700 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl"
                      >
                        查看详情
                      </Link>
                      <button className="px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-full font-medium hover:bg-gray-50 dark:hover:bg-gray-800 transition-all duration-300">
                        分享
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
};

export default HeroSwiper;
