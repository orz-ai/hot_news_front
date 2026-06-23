"use client";

import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { PLATFORMS } from "../constants/platforms";
import PlatformCard from "../components/PlatformCard";
import LoadingSpinner from "../components/LoadingSpinner";
import WordCloudVisualization from "../components/WordCloudVisualization";
import TopicHeatVisualization from "../components/TopicHeatVisualization";
import TrendVisualization from "../components/TrendVisualization";
import TrendPrediction from "../components/TrendPrediction";
import { useSettings } from "../hooks/useSettings";
import { useVersionUpdate } from "../hooks/useVersionUpdate";
import VersionUpdateModal from "../components/VersionUpdateModal";
import { fetchAnalysisData, fetchCrossPlatformData, fetchMultiPlatformData, fetchPlatformComparisonData } from "../utils/api";
import { CommonTopic, HotKeyword, PlatformRanking, PlatformType, RelatedTopicGroup, TimeDistribution, TopicDistribution, TrendingItem as TrendingItemType } from "../types";
import HeroSwiper from "@/components/HeroSwiper";
import { usePlatformI18n } from "@/lib/platform-i18n";

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

const CATEGORY_COLORS: Record<string, string> = {
  tech: '#10B981',
  entertainment: '#8B5CF6',
  social: '#3B82F6',
  finance: '#F59E0B',
  sports: '#EF4444',
};

const RAW_CATEGORY_MAP: Record<string, keyof typeof CATEGORY_COLORS> = {
  科技: 'tech',
  技术: 'tech',
  娱乐: 'entertainment',
  社会: 'social',
  财经: 'finance',
  体育: 'sports',
  tech: 'tech',
  entertainment: 'entertainment',
  social: 'social',
  finance: 'finance',
  sports: 'sports',
};

export default function Home() {
  const t = useTranslations('home');
  const common = useTranslations('common');
  const locale = useLocale();
  const { settings, getFeaturedPlatforms } = useSettings();
  const { showVersionModal, currentVersion, handleCloseVersionModal } = useVersionUpdate();
  const { translatedPlatforms, getPlatformInfoByCode } = usePlatformI18n();

  const [trendingData, setTrendingData] = useState<Record<PlatformType, TrendingItemType[]>>({} as Record<PlatformType, TrendingItemType[]>);
  const [loading, setLoading] = useState<Record<PlatformType, boolean>>({} as Record<PlatformType, boolean>);
  const [allDataLoaded, setAllDataLoaded] = useState(false);
  const [dataLoadProgress, setDataLoadProgress] = useState(0);
  const [timeRange, setTimeRange] = useState<'24h' | 'week' | 'month'>('24h');
  const [analysisView, setAnalysisView] = useState<'topics' | 'platforms' | 'visualization'>('topics');
  const [showBackToTop, setShowBackToTop] = useState(false);

  const [analysisData, setAnalysisData] = useState<{
    hotKeywords: HotKeyword[];
    topicDistribution: TopicDistribution[];
    relatedTopicGroups: RelatedTopicGroup[];
    isLoading: boolean;
  }>({
    hotKeywords: [],
    topicDistribution: [],
    relatedTopicGroups: [],
    isLoading: true,
  });

  const [platformComparisonData, setPlatformComparisonData] = useState<{
    platformRankings: PlatformRanking[];
    timeDistribution: {
      morning: TimeDistribution;
      afternoon: TimeDistribution;
      evening: TimeDistribution;
      night: TimeDistribution;
    };
    isLoading: boolean;
  }>({
    platformRankings: [],
    timeDistribution: {
      morning: { label: 'morning', percentage: 0 },
      afternoon: { label: 'afternoon', percentage: 0 },
      evening: { label: 'evening', percentage: 0 },
      night: { label: 'night', percentage: 0 },
    },
    isLoading: true,
  });

  const [crossPlatformData, setCrossPlatformData] = useState<{
    commonTopics: CommonTopic[];
    isLoading: boolean;
  }>({
    commonTopics: [],
    isLoading: true,
  });

  const displayPlatforms = useMemo(() => {
    const selectedPlatformCodes = settings.featuredPlatforms || [];
    const selectedPlatforms = translatedPlatforms.filter((platform) => selectedPlatformCodes.includes(platform.code));

    return [...selectedPlatforms].sort((a, b) => {
      const orderA = settings.platformOrder.indexOf(a.code);
      const orderB = settings.platformOrder.indexOf(b.code);
      if (orderA !== -1 && orderB !== -1) return orderA - orderB;
      if (orderA !== -1) return -1;
      if (orderB !== -1) return 1;
      return 0;
    });
  }, [settings.featuredPlatforms, settings.platformOrder, translatedPlatforms]);

  const topicCategories = useMemo(
    () => [
      { id: 'tech', name: t('categories.tech'), color: CATEGORY_COLORS.tech },
      { id: 'entertainment', name: t('categories.entertainment'), color: CATEGORY_COLORS.entertainment },
      { id: 'social', name: t('categories.social'), color: CATEGORY_COLORS.social },
      { id: 'finance', name: t('categories.finance'), color: CATEGORY_COLORS.finance },
      { id: 'sports', name: t('categories.sports'), color: CATEGORY_COLORS.sports },
    ],
    [t]
  );

  const formatCompactNumber = (value: string | number) => {
    const num = typeof value === 'number' ? value : parseInt(value, 10);
    if (Number.isNaN(num)) return String(value);
    return new Intl.NumberFormat(locale, {
      notation: 'compact',
      compactDisplay: 'short',
      maximumFractionDigits: 1,
    }).format(num);
  };

  const getTopicCategory = (rawCategory: string, index: number) => {
    const normalized = RAW_CATEGORY_MAP[rawCategory] || RAW_CATEGORY_MAP[rawCategory?.toLowerCase?.() || ''];
    if (normalized) {
      return topicCategories.find((item) => item.id === normalized) || topicCategories[index % topicCategories.length];
    }
    return topicCategories[index % topicCategories.length];
  };

  const getTimePeriodLabel = (key: string) => {
    if (key === 'morning') return t('timePeriods.morning');
    if (key === 'afternoon') return t('timePeriods.afternoon');
    if (key === 'evening') return t('timePeriods.evening');
    return t('timePeriods.night');
  };

  const getTimeRangeLabel = (range: '24h' | 'week' | 'month') => {
    if (range === '24h') return t('analysis.timeRange.day');
    if (range === 'week') return t('analysis.timeRange.week');
    return t('analysis.timeRange.month');
  };

  useEffect(() => {
    const platformCodes = displayPlatforms.map((platform) => platform.code);
    const initialLoadingState = platformCodes.reduce((acc, platform) => {
      acc[platform] = true;
      return acc;
    }, {} as Record<PlatformType, boolean>);

    setLoading(initialLoadingState);
  }, [displayPlatforms]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const platformCodes = displayPlatforms.map((platform) => platform.code);
        const response = await fetchMultiPlatformData(platformCodes);

        let loadedCount = 0;

        Object.entries(response).forEach(([platform, platformResponse]) => {
          const platformCode = platform as PlatformType;

          if (platformResponse.status === '200') {
            setTrendingData((prev) => ({
              ...prev,
              [platformCode]: platformResponse.data,
            }));
          } else {
            console.log(`Platform ${platformCode} data load failed:`, platformResponse);
          }

          setLoading((prev) => ({
            ...prev,
            [platformCode]: false,
          }));

          loadedCount += 1;
        });

        const progress = platformCodes.length > 0 ? Math.round((loadedCount / platformCodes.length) * 100) : 100;
        setDataLoadProgress(progress);

        if (loadedCount === platformCodes.length) {
          setAllDataLoaded(true);
        }
      } catch (error) {
        console.error('Error fetching platform data:', error);
        const platformCodes = displayPlatforms.map((platform) => platform.code);
        const updatedLoadingState = { ...loading };
        platformCodes.forEach((platform) => {
          updatedLoadingState[platform] = false;
        });
        setLoading(updatedLoadingState);
      }
    };

    if (displayPlatforms.length > 0) {
      fetchData();
    }
  }, [displayPlatforms]);

  useEffect(() => {
    const getAnalysis = async () => {
      try {
        const response = await fetchAnalysisData('main');
        if (response.status === 'success') {
          setAnalysisData({
            hotKeywords: response.hot_keywords,
            topicDistribution: response.topic_distribution,
            relatedTopicGroups: response.related_topic_groups,
            isLoading: false,
          });
        } else {
          setAnalysisData((prev) => ({ ...prev, isLoading: false }));
        }
      } catch (error) {
        console.error('Error fetching analysis data:', error);
        setAnalysisData((prev) => ({ ...prev, isLoading: false }));
      }
    };

    if (allDataLoaded) {
      getAnalysis();
    }
  }, [allDataLoaded]);

  useEffect(() => {
    const getPlatformComparison = async () => {
      try {
        const response = await fetchPlatformComparisonData();
        if (response.status === 'success') {
          setPlatformComparisonData({
            platformRankings: response.platform_rankings,
            timeDistribution: response.platform_update_frequency.overall,
            isLoading: false,
          });
        } else {
          setPlatformComparisonData((prev) => ({ ...prev, isLoading: false }));
        }
      } catch (error) {
        console.error('Error fetching platform comparison data:', error);
        setPlatformComparisonData((prev) => ({ ...prev, isLoading: false }));
      }
    };

    if (allDataLoaded) {
      getPlatformComparison();
    }
  }, [allDataLoaded]);

  useEffect(() => {
    const getCrossPlatform = async () => {
      try {
        const response = await fetchCrossPlatformData();
        if (response.status === 'success') {
          setCrossPlatformData({
            commonTopics: response.common_topics,
            isLoading: false,
          });
        } else {
          setCrossPlatformData((prev) => ({ ...prev, isLoading: false }));
        }
      } catch (error) {
        console.error('Error fetching cross-platform data:', error);
        setCrossPlatformData((prev) => ({ ...prev, isLoading: false }));
      }
    };

    if (allDataLoaded) {
      getCrossPlatform();
    }
  }, [allDataLoaded]);

  useEffect(() => {
    if (allDataLoaded && Object.keys(trendingData).length > 0) {
      try {
        localStorage.setItem('trendingData', JSON.stringify(trendingData));
      } catch (error) {
        console.error('Failed to save data to localStorage:', error);
      }
    }
  }, [allDataLoaded, trendingData]);

  useEffect(() => {
    const handleScroll = () => setShowBackToTop(window.scrollY > 500);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const renderHotKeywords = () => (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-card overflow-hidden border border-gray-100 dark:border-gray-700">
      <div className="px-6 py-5 border-b border-gray-100 dark:border-gray-700">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white">{t('hotKeywords.title')}</h3>
      </div>

      <div className="p-6">
        {analysisData.isLoading ? (
          <div className="flex justify-center py-8">
            <LoadingSpinner size="md" />
          </div>
        ) : analysisData.hotKeywords.length === 0 ? (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">{t('hotKeywords.empty')}</div>
        ) : (
          <div className="flex flex-wrap gap-3">
            {analysisData.hotKeywords.map((keyword, index) => {
              const size = keyword.weight >= 0.8 ? 'lg' : keyword.weight >= 0.5 ? 'md' : 'sm';
              const category = topicCategories[index % topicCategories.length];
              return (
                <span
                  key={keyword.text}
                  className={`inline-block px-3 py-1.5 rounded-full text-${size} font-medium`}
                  style={{
                    backgroundColor: `${category.color}15`,
                    color: category.color,
                  }}
                >
                  {keyword.text}
                </span>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );

  const renderTopicDistribution = () => (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-card overflow-hidden border border-gray-100 dark:border-gray-700">
      <div className="px-6 py-5 border-b border-gray-100 dark:border-gray-700">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white">{t('topicDistribution.title')}</h3>
      </div>

      <div className="p-6">
        {analysisData.isLoading ? (
          <div className="flex justify-center py-8">
            <LoadingSpinner size="md" />
          </div>
        ) : analysisData.topicDistribution.length === 0 ? (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">{t('topicDistribution.empty')}</div>
        ) : (
          <>
            <div className="grid grid-cols-2 gap-6 mb-6">
              {analysisData.topicDistribution.slice(0, 4).map((topic, index) => {
                const topicCategory = getTopicCategory(topic.category, index);
                return (
                  <div key={`${topic.category}-${index}`} className="flex flex-col">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium" style={{ color: topicCategory.color }}>
                        {topicCategory.name}
                      </span>
                      <span className="text-xs text-gray-500 dark:text-gray-400">{topic.percentage.toFixed(1)}%</span>
                    </div>
                    <div className="h-2 w-full bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                      <div
                        className="h-full transition-all duration-1000 ease-out"
                        style={{
                          width: `${topic.percentage}%`,
                          backgroundColor: topicCategory.color,
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>

            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">{t('topicDistribution.relatedGroups')}</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {analysisData.relatedTopicGroups.map((group, index) => (
                <div key={index} className="bg-gray-50 dark:bg-gray-800/60 p-3 rounded-lg border border-gray-100 dark:border-gray-700">
                  <div className="flex items-center gap-2 mb-2 flex-wrap">
                    {group.words.map((word, i) => (
                      <span key={i} className="font-medium text-sm" style={{ color: topicCategories[i % topicCategories.length].color }}>
                        {word}
                        {i < group.words.length - 1 ? ' + ' : ''}
                      </span>
                    ))}
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex-grow h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                      <div className="h-full bg-primary-500" style={{ width: `${Math.min((group.co_occurrence / 8) * 100, 100)}%` }} />
                    </div>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {t('topicDistribution.coOccurrence', { count: group.co_occurrence })}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );

  const renderPlatformRankings = () => (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-card overflow-hidden border border-gray-100 dark:border-gray-700">
      <div className="px-6 py-5 border-b border-gray-100 dark:border-gray-700">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white">{t('platformRankings.title')}</h3>
      </div>

      <div className="p-6">
        {platformComparisonData.isLoading ? (
          <div className="flex justify-center py-8">
            <LoadingSpinner size="md" />
          </div>
        ) : platformComparisonData.platformRankings.length === 0 ? (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">{t('platformRankings.empty')}</div>
        ) : (
          <div className="space-y-5">
            {platformComparisonData.platformRankings.slice(0, 8).map((platform) => {
              const platformInfo = getPlatformInfoByCode(platform.platform);
              return (
                <div key={platform.platform} className="group">
                  <div className="flex items-center gap-3 mb-2">
                    <div
                      className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-lg text-white font-medium shadow-sm group-hover:shadow-md transition-all duration-300"
                      style={{
                        background: `linear-gradient(135deg, ${platformInfo?.color || '#3b76ea'}, ${adjustColor(platformInfo?.color || '#3b76ea', -20)})`,
                        transform: 'translateZ(0)',
                      }}
                    >
                      {platform.rank}
                    </div>

                    <h4 className="text-base font-medium text-gray-800 dark:text-gray-200 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                      {platformInfo?.name || platform.platform}
                    </h4>

                    <div className="ml-auto flex gap-2 items-center">
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full flex items-center ${platform.trend > 0 ? 'bg-green-100 dark:bg-green-900/20 text-green-600 dark:text-green-400' : 'bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400'}`}
                      >
                        {platform.trend > 0 ? '+' : ''}
                        {platform.trend.toFixed(1)}%
                      </span>

                      <span
                        className="text-sm px-2.5 py-1 rounded-full"
                        style={{
                          backgroundColor: `${platformInfo?.color || '#3b76ea'}15`,
                          color: platformInfo?.color || '#3b76ea',
                        }}
                      >
                        {t('platformRankings.rank', { rank: platform.rank })}
                      </span>
                    </div>
                  </div>

                  <div className="h-2 w-full bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div
                      className="h-full transition-all duration-1000 ease-out"
                      style={{
                        width: `${((platformComparisonData.platformRankings.length - platform.rank + 1) / platformComparisonData.platformRankings.length) * 100}%`,
                        background: `linear-gradient(to right, ${platformInfo?.color || '#3b76ea'}, ${adjustColor(platformInfo?.color || '#3b76ea', 20)})`,
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );

  const renderTimeDistribution = () => (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-card overflow-hidden border border-gray-100 dark:border-gray-700">
      <div className="px-6 py-5 border-b border-gray-100 dark:border-gray-700">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white">{t('timeDistribution.title')}</h3>
      </div>

      <div className="p-6">
        {platformComparisonData.isLoading ? (
          <div className="flex justify-center py-8">
            <LoadingSpinner size="md" />
          </div>
        ) : (
          <div className="flex flex-col gap-8">
            <div>
              <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-4">{t('timeDistribution.periodDistribution')}</h4>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {Object.entries(platformComparisonData.timeDistribution).map(([timeKey, data]) => (
                  <div key={timeKey} className="bg-gray-50 dark:bg-gray-800/60 p-4 rounded-lg border border-gray-100 dark:border-gray-700">
                    <div className="text-center">
                      <span className="block text-xl font-bold text-gray-800 dark:text-gray-200 mb-1">{data.percentage.toFixed(1)}%</span>
                      <span className="block text-sm text-gray-500 dark:text-gray-400">{getTimePeriodLabel(timeKey)}</span>
                      <div className="mt-3 w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                        <div className="h-full bg-primary-600" style={{ width: `${data.percentage}%` }} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="border-t border-gray-100 dark:border-gray-700 pt-5">
              <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">{t('timeDistribution.updateFrequency')}</h4>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {platformComparisonData.platformRankings.slice(0, 6).map((platform) => {
                  const platformInfo = getPlatformInfoByCode(platform.platform);

                  return (
                    <div key={platform.platform} className="flex items-center gap-2 text-sm py-2 px-3 rounded-lg transition-colors hover:bg-gray-50 dark:hover:bg-gray-750">
                      <span className="w-2 h-2 rounded-full" style={{ backgroundColor: platformInfo?.color || '#3b76ea' }} />
                      <span className="text-gray-700 dark:text-gray-300">{platformInfo?.name || platform.platform}</span>
                      <span className="ml-auto text-xs text-gray-500 dark:text-gray-400">{platformInfo?.updateFrequency || common('unknown')}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  const renderCrossPlatformTopics = () => (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-card overflow-hidden border border-gray-100 dark:border-gray-700">
      <div className="px-6 py-5 border-b border-gray-100 dark:border-gray-700">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white">{t('crossPlatform.cardTitle')}</h3>
      </div>

      <div className="divide-y divide-gray-100 dark:divide-gray-700">
        {crossPlatformData.isLoading ? (
          <div className="p-12 flex justify-center">
            <LoadingSpinner size="lg" />
          </div>
        ) : crossPlatformData.commonTopics.length === 0 ? (
          <div className="p-12 text-center">
            <p className="text-gray-500 dark:text-gray-400">{t('crossPlatform.empty')}</p>
          </div>
        ) : (
          crossPlatformData.commonTopics.map((topic, index) => (
            <div key={index} className="p-6">
              <div className="flex flex-wrap items-center gap-3 mb-4">
                <h4 className="text-lg font-medium text-gray-800 dark:text-gray-200">{topic.title}</h4>

                <div className="flex items-center gap-2 ml-auto">
                  <span className="text-xs bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 px-2.5 py-1 rounded-full">
                    {t('crossPlatform.platformCount', { count: topic.platforms_count })}
                  </span>
                  {topic.heat > 0 && (
                    <span className="text-xs bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 px-2.5 py-1 rounded-full">
                      {common('heat', { value: formatCompactNumber(topic.heat) })}
                    </span>
                  )}
                </div>
              </div>

              <div className="flex flex-wrap gap-2 mb-4">
                {topic.platforms.map((platformCode) => {
                  const platform = getPlatformInfoByCode(platformCode);
                  return (
                    <span
                      key={platformCode}
                      className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium"
                      style={{
                        backgroundColor: `${platform?.color || '#3b76ea'}15`,
                        color: platform?.color || '#3b76ea',
                      }}
                    >
                      {platform?.name || platformCode}
                    </span>
                  );
                })}
              </div>

              <div className="space-y-3">
                {topic.related_items.slice(0, 3).map((item, i) => {
                  const platform = getPlatformInfoByCode(item.platform);
                  return (
                    <a
                      key={i}
                      href={item.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors border border-gray-100 dark:border-gray-700"
                    >
                      <div className="flex gap-3">
                        <div className="flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center" style={{ backgroundColor: platform?.color || '#3b76ea' }}>
                          <span className="text-white text-xs font-bold">{platform?.name?.substring(0, 1) || item.platform.substring(0, 1)}</span>
                        </div>
                        <div className="flex-grow">
                          <p className="text-sm font-medium text-gray-700 dark:text-gray-300">{item.title}</p>

                          {item.similarity !== undefined && item.similarity > 0 && (
                            <div className="mt-1 flex items-center gap-2">
                              <div className="flex-grow h-1 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                                <div className="h-full bg-green-500" style={{ width: `${item.similarity * 100}%` }} />
                              </div>
                              <span className="text-xs text-gray-500 dark:text-gray-400">
                                {t('crossPlatform.similarity', { value: Math.round(item.similarity * 100) })}
                              </span>
                            </div>
                          )}
                        </div>

                        <div className="flex-shrink-0 flex items-center text-gray-400 dark:text-gray-500">
                          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                          </svg>
                        </div>
                      </div>
                    </a>
                  );
                })}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );

  return (
    <>
      <section className="mb-16 py-8">
        <HeroSwiper />
      </section>

      <section className="mb-24">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">{t('featuredPlatforms.title')}</h2>
          <Link href="/all" className="text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 font-medium flex items-center">
            {common('viewAll')}
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>

        <motion.div variants={containerVariants} initial="hidden" animate="show" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {displayPlatforms.map((platform, index) => (
            <motion.div key={platform.code} variants={itemVariants}>
              <PlatformCard platform={platform} index={index} trendingItems={trendingData[platform.code] || []} maxItems={settings?.newsDisplayCount || 10} />
            </motion.div>
          ))}
        </motion.div>
      </section>

      <section className="mb-24">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">{t('wordCloud.title')}</h2>
        </div>

        {allDataLoaded ? (
          <WordCloudVisualization trendingData={trendingData} />
        ) : (
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-card p-12 flex flex-col items-center justify-center border border-gray-100 dark:border-gray-700">
            <LoadingSpinner size="lg" className="mb-4" />
            <p className="text-lg font-medium text-gray-700 dark:text-gray-300 mb-2">{t('wordCloud.generating')}</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">{t('wordCloud.generatingDesc', { count: PLATFORMS.length })}</p>
          </div>
        )}
      </section>

      <section className="mb-24">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6 gap-4">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">{t('analysis.title')}</h2>

          {!allDataLoaded && (
            <div className="w-full md:w-auto flex items-center gap-3">
              <div className="flex-grow md:w-64 bg-gray-200 dark:bg-gray-700 rounded-full h-2.5 overflow-hidden">
                <div className="bg-primary-600 h-2.5 rounded-full" style={{ width: `${dataLoadProgress}%`, transition: 'width 0.5s ease-in-out' }} />
              </div>
              <span className="text-sm text-gray-500 dark:text-gray-400 whitespace-nowrap">{t('analysis.loadProgress', { progress: dataLoadProgress })}</span>
            </div>
          )}

          {allDataLoaded && (
            <div className="flex items-center gap-3 flex-wrap">
              <div className="flex p-1 bg-gray-100 dark:bg-gray-800 rounded-lg">
                <button
                  onClick={() => setAnalysisView('topics')}
                  className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${analysisView === 'topics' ? 'bg-white dark:bg-gray-700 shadow-sm text-primary-600 dark:text-primary-400' : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'}`}
                >
                  {t('analysis.views.topics')}
                </button>
                <button
                  onClick={() => setAnalysisView('platforms')}
                  className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${analysisView === 'platforms' ? 'bg-white dark:bg-gray-700 shadow-sm text-primary-600 dark:text-primary-400' : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'}`}
                >
                  {t('analysis.views.platforms')}
                </button>
                <button
                  onClick={() => setAnalysisView('visualization')}
                  className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${analysisView === 'visualization' ? 'bg-white dark:bg-gray-700 shadow-sm text-primary-600 dark:text-primary-400' : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'}`}
                >
                  {t('analysis.views.visualization')}
                </button>
              </div>

              <div className="relative inline-block">
                <button
                  className="flex items-center gap-2 px-3 py-2 text-sm font-medium bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors"
                  onClick={() => {
                    const nextRange = timeRange === '24h' ? 'week' : timeRange === 'week' ? 'month' : '24h';
                    setTimeRange(nextRange);
                  }}
                >
                  <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>{getTimeRangeLabel(timeRange)}</span>
                  <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 9l4-4 4 4m0 6l-4 4-4-4" />
                  </svg>
                </button>
              </div>
            </div>
          )}
        </div>

        {!allDataLoaded ? (
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-card p-12 flex flex-col items-center justify-center border border-gray-100 dark:border-gray-700">
            <LoadingSpinner size="lg" className="mb-4" />
            <p className="text-lg font-medium text-gray-700 dark:text-gray-300 mb-2">{t('analysis.processing')}</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">{t('analysis.processingDesc', { count: PLATFORMS.length })}</p>
          </div>
        ) : (
          <>
            {analysisView === 'topics' && <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">{renderHotKeywords()}{renderTopicDistribution()}</div>}
            {analysisView === 'platforms' && <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">{renderPlatformRankings()}{renderTimeDistribution()}</div>}
            {analysisView === 'visualization' && (
              <div className="space-y-6">
                <TrendVisualization trendingData={trendingData} timeRange={timeRange} />
                <TrendPrediction trendingData={trendingData} />
                <TopicHeatVisualization />
              </div>
            )}
          </>
        )}
      </section>

      <section className="mb-24">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
            {t('crossPlatform.sectionTitle')}
            <span className="ml-2 text-xs px-2 py-1 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-full">{t('crossPlatform.hotBadge')}</span>
          </h2>
        </div>

        {allDataLoaded ? (
          renderCrossPlatformTopics()
        ) : (
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-card p-12 flex flex-col items-center justify-center border border-gray-100 dark:border-gray-700">
            <LoadingSpinner size="lg" className="mb-4" />
            <p className="text-lg font-medium text-gray-700 dark:text-gray-300 mb-2">{t('crossPlatform.loadingTitle')}</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">{t('crossPlatform.loadingDesc')}</p>
          </div>
        )}
      </section>

      <AnimatePresence>
        {showBackToTop && (
          <motion.button
            initial={{ opacity: 0, scale: 0.5, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.5, y: 20 }}
            transition={{ type: 'spring', stiffness: 260, damping: 20, duration: 0.3 }}
            onClick={scrollToTop}
            className="fixed right-8 bottom-8 z-50 flex items-center justify-center w-14 h-14 rounded-full bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-lg hover:shadow-xl hover:from-primary-600 hover:to-primary-700 transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-primary-400 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-gray-900"
            aria-label={common('backToTop')}
            style={{ boxShadow: '0 10px 25px -5px rgba(59, 130, 246, 0.5)' }}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
            </svg>
          </motion.button>
        )}
      </AnimatePresence>

      <VersionUpdateModal isOpen={showVersionModal} onClose={handleCloseVersionModal} version={currentVersion} />
    </>
  );
}

function adjustColor(color: string, amount: number): string {
  if (color.startsWith('#')) {
    let hex = color.slice(1);
    if (hex.length === 3) {
      hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
    }

    const r = parseInt(hex.slice(0, 2), 16);
    const g = parseInt(hex.slice(2, 4), 16);
    const b = parseInt(hex.slice(4, 6), 16);

    const newR = Math.max(0, Math.min(255, r + amount));
    const newG = Math.max(0, Math.min(255, g + amount));
    const newB = Math.max(0, Math.min(255, b + amount));

    return `#${newR.toString(16).padStart(2, '0')}${newG.toString(16).padStart(2, '0')}${newB.toString(16).padStart(2, '0')}`;
  }

  return color;
}
