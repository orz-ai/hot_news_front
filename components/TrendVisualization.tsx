"use client";

import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { useLocale, useTranslations } from 'next-intl';
import { PlatformType, TrendingItem, PlatformRanking } from '../types';
import { fetchPlatformComparisonData } from '../utils/api';
import LoadingSpinner from './LoadingSpinner';
import { usePlatformI18n } from '@/lib/platform-i18n';

interface TrendVisualizationProps {
  trendingData: Record<PlatformType, TrendingItem[]>;
  timeRange: string;
}

export default function TrendVisualization({ trendingData }: TrendVisualizationProps) {
  const t = useTranslations('trendVisualization');
  const locale = useLocale();
  const { getPlatformInfoByCode } = usePlatformI18n();
  const [selectedView, setSelectedView] = useState<'heatmap' | 'comparison' | 'timeline'>('heatmap');
  const [selectedPlatforms, setSelectedPlatforms] = useState<PlatformType[]>([]);
  const [maxItems, setMaxItems] = useState(10);
  const [isMaxItemsOpen, setIsMaxItemsOpen] = useState(false);
  const [platformComparisonData, setPlatformComparisonData] = useState<{ platformRankings: PlatformRanking[]; isLoading: boolean }>({
    platformRankings: [],
    isLoading: true,
  });

  useEffect(() => {
    if (Object.keys(trendingData).length > 0) {
      const platformsByItemCount = Object.entries(trendingData)
        .map(([platform, items]) => ({ platform: platform as PlatformType, count: items.length }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5)
        .map((item) => item.platform);
      setSelectedPlatforms(platformsByItemCount);
    }
  }, [trendingData]);

  useEffect(() => {
    const getPlatformComparisonData = async () => {
      try {
        const response = await fetchPlatformComparisonData();
        if (response.status === 'success') {
          setPlatformComparisonData({ platformRankings: response.platform_rankings, isLoading: false });
        } else {
          setPlatformComparisonData((prev) => ({ ...prev, isLoading: false }));
        }
      } catch (error) {
        console.error('Error fetching platform comparison data:', error);
        setPlatformComparisonData((prev) => ({ ...prev, isLoading: false }));
      }
    };

    if (Object.keys(trendingData).length > 0) {
      getPlatformComparisonData();
    }
  }, [trendingData]);

  const togglePlatform = (platform: PlatformType) => {
    setSelectedPlatforms((prev) => (prev.includes(platform) ? prev.filter((p) => p !== platform) : [...prev, platform]));
  };

  const formatNumber = (value: string | number) => {
    const num = typeof value === 'number' ? value : parseInt(value, 10);
    if (Number.isNaN(num)) return String(value);
    return new Intl.NumberFormat(locale, { notation: 'compact', compactDisplay: 'short', maximumFractionDigits: 1 }).format(num);
  };

  const platformMetrics = useMemo(() => {
    if (!platformComparisonData.isLoading && platformComparisonData.platformRankings.length > 0) {
      return platformComparisonData.platformRankings
        .map((ranking) => {
          const platformInfo = getPlatformInfoByCode(ranking.platform);
          return {
            platform: ranking.platform as PlatformType,
            name: platformInfo?.name || ranking.platform,
            color: platformInfo?.color || '#3b76ea',
            itemCount: ranking.total_items,
            totalHeat: ranking.total_score,
            avgHeat: ranking.avg_score,
            peakHour: ranking.peak_hour || Math.floor(Math.random() * 24),
            categories: platformInfo?.contentType || [],
            avgTitleLength: ranking.avg_title_length,
            trend: ranking.trend,
          };
        })
        .filter((metric) => metric.itemCount > 0)
        .sort((a, b) => b.totalHeat - a.totalHeat);
    }

    return Object.entries(trendingData)
      .map(([platform, items]) => {
        const platformInfo = getPlatformInfoByCode(platform);
        const totalHeat = items.reduce((sum, item) => sum + (parseInt(item.score || '0', 10) || 0), 0);
        return {
          platform: platform as PlatformType,
          name: platformInfo?.name || platform,
          color: platformInfo?.color || '#3b76ea',
          itemCount: items.length,
          totalHeat,
          avgHeat: items.length > 0 ? Math.round(totalHeat / items.length) : 0,
          peakHour: Math.floor(Math.random() * 24),
          categories: platformInfo?.contentType || [],
          avgTitleLength: items.length > 0 ? Math.round(items.reduce((sum, item) => sum + (item.title?.length || 0), 0) / items.length) : 0,
          trend: 0,
        };
      })
      .filter((metric) => metric.itemCount > 0)
      .sort((a, b) => b.totalHeat - a.totalHeat);
  }, [getPlatformInfoByCode, platformComparisonData, trendingData]);

  const renderHeatmap = () => {
    const titleFrequency: Record<string, number> = {};
    Object.values(trendingData).flat().map((item) => item.title).forEach((title) => {
      if (!title) return;
      title.split(/[\s,.!?;:()\[\]{}]/).forEach((word) => {
        if (word.length >= 2) titleFrequency[word] = (titleFrequency[word] || 0) + 1;
      });
    });

    const topWords = Object.entries(titleFrequency).sort((a, b) => b[1] - a[1]).slice(0, maxItems).map(([word]) => word);

    return (
      <div className="mt-6">
        <div className="flex flex-wrap justify-between items-center mb-4">
          <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100">{t('heatmap.title')}</h3>
          <div className="relative inline-block">
            <button onClick={() => setIsMaxItemsOpen(!isMaxItemsOpen)} className="flex items-center gap-2 px-3 py-1.5 text-sm bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-650 transition-colors">
              <span>{t('heatmap.showTopicWords', { count: maxItems })}</span>
              <svg className={`w-4 h-4 text-gray-500 transition-transform ${isMaxItemsOpen ? 'transform rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
            </button>

            {isMaxItemsOpen && (
              <div className="absolute right-0 mt-1 py-1 bg-white dark:bg-gray-700 rounded-lg shadow-lg border border-gray-200 dark:border-gray-600 z-10 min-w-[120px]">
                {[5, 10, 15, 20].map((value) => (
                  <button key={value} onClick={() => { setMaxItems(value); setIsMaxItemsOpen(false); }} className={`block w-full text-left px-4 py-1.5 text-sm ${maxItems === value ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400' : 'text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-650'}`}>
                    {t('heatmap.topicWordOption', { count: value })}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr>
                <th className="px-4 py-2 text-left text-sm font-medium text-gray-500 dark:text-gray-400">{t('heatmap.topicWord')}</th>
                {selectedPlatforms.map((platform) => {
                  const platformInfo = getPlatformInfoByCode(platform);
                  return <th key={platform} className="px-4 py-2 text-center text-sm font-medium" style={{ color: platformInfo?.color }}>{platformInfo?.name || platform}</th>;
                })}
              </tr>
            </thead>
            <tbody>
              {topWords.map((word) => (
                <tr key={word} className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors">
                  <td className="px-4 py-3 text-sm font-medium text-gray-700 dark:text-gray-300">{word}</td>
                  {selectedPlatforms.map((platform) => {
                    const items = trendingData[platform] || [];
                    const matchCount = items.filter((item) => item.title?.includes(word)).length;
                    const intensity = items.length > 0 ? (matchCount / items.length) * 100 : 0;
                    const platformInfo = getPlatformInfoByCode(platform);
                    const color = platformInfo?.color || '#3b76ea';
                    return (
                      <td key={`${word}-${platform}`} className="px-4 py-3 text-center">
                        <div className="flex justify-center">
                          <div className="w-8 h-8 rounded-md flex items-center justify-center text-xs" style={{ backgroundColor: `${color}${Math.round(intensity).toString(16).padStart(2, '0')}`, color: intensity > 50 ? 'white' : color }}>
                            {matchCount > 0 ? matchCount : '-'}
                          </div>
                        </div>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  const renderComparison = () => {
    if (platformComparisonData.isLoading) {
      return <div className="mt-6 flex justify-center py-12"><LoadingSpinner size="lg" /></div>;
    }

    const metrics = platformMetrics.filter((metric) => selectedPlatforms.includes(metric.platform));
    const maxHeat = Math.max(...metrics.map((metric) => metric.totalHeat), 1);
    const maxAvgHeat = Math.max(...metrics.map((metric) => metric.avgHeat), 1);
    const maxTitleLength = Math.max(...metrics.map((metric) => metric.avgTitleLength || 0), 1);

    return (
      <div className="mt-6">
        <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100 mb-4">{t('comparison.title')}</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-sm border border-gray-100 dark:border-gray-700">
            <h4 className="text-base font-medium text-gray-700 dark:text-gray-300 mb-4">{t('comparison.totalHeat')}</h4>
            <div className="space-y-4">
              {metrics.map((metric) => (
                <div key={`heat-${metric.platform}`}>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm font-medium" style={{ color: metric.color }}>{metric.name}</span>
                    <div className="flex items-center gap-2">
                      <span className={`text-xs px-2 py-0.5 rounded-full flex items-center ${metric.trend > 0 ? 'bg-green-100 dark:bg-green-900/20 text-green-600 dark:text-green-400' : metric.trend < 0 ? 'bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400' : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'}`}>
                        {metric.trend > 0 ? '+' : ''}{metric.trend.toFixed(1)}%
                      </span>
                      <span className="text-sm text-gray-600 dark:text-gray-400">{formatNumber(metric.totalHeat)}</span>
                    </div>
                  </div>
                  <div className="h-2 w-full bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                    <motion.div initial={{ width: 0 }} animate={{ width: `${(metric.totalHeat / maxHeat) * 100}%` }} transition={{ duration: 1, ease: 'easeOut' }} className="h-full" style={{ backgroundColor: metric.color }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-sm border border-gray-100 dark:border-gray-700">
            <h4 className="text-base font-medium text-gray-700 dark:text-gray-300 mb-4">{t('comparison.avgHeat')}</h4>
            <div className="space-y-4">
              {metrics.map((metric) => (
                <div key={`avg-${metric.platform}`}>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm font-medium" style={{ color: metric.color }}>{metric.name}</span>
                    <span className="text-sm text-gray-600 dark:text-gray-400">{formatNumber(metric.avgHeat)}</span>
                  </div>
                  <div className="h-2 w-full bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                    <motion.div initial={{ width: 0 }} animate={{ width: `${(metric.avgHeat / maxAvgHeat) * 100}%` }} transition={{ duration: 1, ease: 'easeOut' }} className="h-full" style={{ backgroundColor: metric.color }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-sm border border-gray-100 dark:border-gray-700">
            <h4 className="text-base font-medium text-gray-700 dark:text-gray-300 mb-4">{t('comparison.avgTitleLength')}</h4>
            <div className="space-y-4">
              {metrics.map((metric) => (
                <div key={`title-${metric.platform}`}>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm font-medium" style={{ color: metric.color }}>{metric.name}</span>
                    <span className="text-sm text-gray-600 dark:text-gray-400">{t('comparison.charCount', { count: metric.avgTitleLength || 0 })}</span>
                  </div>
                  <div className="h-2 w-full bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                    <motion.div initial={{ width: 0 }} animate={{ width: `${((metric.avgTitleLength || 0) / maxTitleLength) * 100}%` }} transition={{ duration: 1, ease: 'easeOut' }} className="h-full" style={{ backgroundColor: metric.color }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-sm border border-gray-100 dark:border-gray-700">
            <h4 className="text-base font-medium text-gray-700 dark:text-gray-300 mb-4">{t('comparison.topicDistribution')}</h4>
            <div className="flex flex-wrap gap-2">
              {metrics.map((metric) => (
                <div key={`topic-${metric.platform}`} className="flex flex-col items-center p-3 rounded-lg border border-gray-100 dark:border-gray-700">
                  <div className="w-4 h-4 rounded-full mb-1.5" style={{ backgroundColor: metric.color }} />
                  <span className="text-sm font-medium text-gray-800 dark:text-gray-200 mb-2">{metric.name}</span>
                  <div className="flex flex-wrap gap-1 justify-center">
                    {metric.categories.map((category) => (
                      <span key={`${metric.platform}-${category}`} className="text-xs px-2 py-1 rounded-full" style={{ backgroundColor: `${metric.color}15`, color: metric.color }}>{category}</span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderTimeline = () => {
    const hours = Array.from({ length: 24 }, (_, i) => i);
    const timelineData = selectedPlatforms.map((platform) => {
      const platformInfo = getPlatformInfoByCode(platform);
      const items = trendingData[platform] || [];
      const distribution = hours.map((hour) => {
        const isPeak = platformMetrics.find((metric) => metric.platform === platform)?.peakHour === hour;
        const weight = isPeak ? 0.3 : Math.random() * 0.1;
        return Math.floor(items.length * weight);
      });
      return {
        platform,
        name: platformInfo?.name || platform,
        color: platformInfo?.color || '#3b76ea',
        distribution,
      };
    });

    const maxValue = Math.max(...timelineData.flatMap((item) => item.distribution), 1);

    return (
      <div className="mt-6">
        <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100 mb-4">{t('timeline.title')}</h3>
        <div className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-sm border border-gray-100 dark:border-gray-700">
          <div className="h-64 relative">
            <div className="absolute bottom-0 left-0 right-0 flex justify-between text-xs text-gray-500 dark:text-gray-400">
              {[0, 6, 12, 18, 23].map((hour) => <span key={hour} style={{ position: 'absolute', left: `${(hour / 23) * 100}%` }}>{hour}:00</span>)}
            </div>
            <div className="absolute inset-0 pt-4 pb-6">
              {timelineData.map((data) => (
                <div key={data.platform} className="absolute inset-0 flex items-end">
                  <div className="w-full h-full flex items-end">
                    {data.distribution.map((value, hour) => {
                      const height = maxValue > 0 ? (value / maxValue) * 100 : 0;
                      return <motion.div key={hour} initial={{ height: 0 }} animate={{ height: `${height}%` }} transition={{ duration: 1, delay: hour * 0.03 }} className="flex-1 mx-0.5" style={{ backgroundColor: `${data.color}40`, minHeight: value > 0 ? 2 : 0 }} />;
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="mt-8 flex flex-wrap gap-4 justify-center">
            {timelineData.map((data) => (
              <div key={`legend-${data.platform}`} className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: data.color }} />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{data.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="bg-gray-50 dark:bg-gray-850 rounded-2xl p-6 border border-gray-100 dark:border-gray-700">
      <div className="flex flex-col md:flex-row gap-4 md:items-center md:justify-between">
        <div className="flex p-1 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
          <button onClick={() => setSelectedView('heatmap')} className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${selectedView === 'heatmap' ? 'bg-primary-600 text-white shadow-sm' : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'}`}>{t('view.heatmap')}</button>
          <button onClick={() => setSelectedView('comparison')} className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${selectedView === 'comparison' ? 'bg-primary-600 text-white shadow-sm' : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'}`}>{t('view.comparison')}</button>
          <button onClick={() => setSelectedView('timeline')} className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${selectedView === 'timeline' ? 'bg-primary-600 text-white shadow-sm' : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'}`}>{t('view.timeline')}</button>
        </div>

        <div className="flex flex-wrap items-center gap-3 bg-white dark:bg-gray-800 p-1.5 rounded-lg shadow-sm">
          <span className="text-xs font-medium text-gray-500 dark:text-gray-400 ml-2">{t('selectPlatform')}</span>
          {platformMetrics.slice(0, 8).map((metric) => (
            <button key={metric.platform} onClick={() => togglePlatform(metric.platform)} className={`px-2.5 py-1 text-xs rounded-full transition-all ${selectedPlatforms.includes(metric.platform) ? 'shadow-sm' : 'opacity-60'}`} style={{ backgroundColor: selectedPlatforms.includes(metric.platform) ? metric.color : `${metric.color}20`, color: selectedPlatforms.includes(metric.platform) ? 'white' : metric.color }}>
              {metric.name}
            </button>
          ))}
        </div>
      </div>

      {selectedView === 'heatmap' && renderHeatmap()}
      {selectedView === 'comparison' && renderComparison()}
      {selectedView === 'timeline' && renderTimeline()}
    </div>
  );
}
