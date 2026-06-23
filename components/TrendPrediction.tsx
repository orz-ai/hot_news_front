"use client";

import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { useTranslations } from 'next-intl';
import { PlatformType, TrendingItem, TrendForecastResponse } from '../types';
import { PLATFORMS } from '../constants/platforms';
import { fetchTrendForecast } from '../utils/api';
import LoadingSpinner from './LoadingSpinner';
import { usePlatformI18n } from '@/lib/platform-i18n';

interface TrendPredictionProps {
  trendingData: Record<PlatformType, TrendingItem[]>;
}

interface PredictionResult {
  topic: string;
  keywords: string[];
  confidence: number;
  relatedTopics: string[];
  platformSource: PlatformType[];
  growthScore: number;
  category: string;
}

export default function TrendPrediction({ trendingData }: TrendPredictionProps) {
  const t = useTranslations('trendPrediction');
  const { getPlatformInfoByCode } = usePlatformI18n();
  const [timeFrame, setTimeFrame] = useState<'day' | 'week' | 'month'>('day');
  const [loading, setLoading] = useState(true);
  const [forecastData, setForecastData] = useState<TrendForecastResponse | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const timeRange = timeFrame === 'day' ? '24h' : timeFrame === 'week' ? '7d' : '30d';
        const response = await fetchTrendForecast(timeRange);
        setForecastData(response);
      } catch (error) {
        console.error('Error fetching trend forecast:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [timeFrame]);

  const predictions = useMemo(() => {
    if (!forecastData || !forecastData.has_enough_data || forecastData.trend_evolution.length === 0) {
      return [];
    }

    return forecastData.trend_evolution.map((item) => {
      const currentHeat = item.current_heat;
      const forecastHeat = item.forecast[0]?.heat || currentHeat;
      const growthDiff = forecastHeat - currentHeat;
      const growthScore = Math.min(Math.max(Math.round(growthDiff * 2), -100), 100);
      const platformSource = item.platforms.filter((p) => PLATFORMS.some((platform) => platform.code === p)).map((p) => p as PlatformType);

      return {
        topic: item.topic,
        keywords: item.keywords,
        confidence: item.probability,
        relatedTopics: item.keywords,
        platformSource,
        growthScore,
        category: item.category,
      } as PredictionResult;
    });
  }, [forecastData]);

  const getGrowthColor = (score: number) => {
    if (score > 50) return '#10B981';
    if (score > 0) return '#60A5FA';
    if (score > -30) return '#F59E0B';
    return '#EF4444';
  };

  const getConfidenceLabel = (score: number) => {
    if (score >= 80) return t('confidenceLevels.veryHigh');
    if (score >= 60) return t('confidenceLevels.high');
    if (score >= 40) return t('confidenceLevels.medium');
    return t('confidenceLevels.low');
  };

  const getGrowthTrend = (score: number) => {
    if (score > 50) return t('growthTrend.strongUp');
    if (score > 20) return t('growthTrend.steadyUp');
    if (score > 0) return t('growthTrend.slightUp');
    if (score > -20) return t('growthTrend.flat');
    if (score > -50) return t('growthTrend.slightDown');
    return t('growthTrend.strongDown');
  };

  const getTimeFrameLabel = (value: 'day' | 'week' | 'month') => {
    if (value === 'day') return t('timeFrame.day');
    if (value === 'week') return t('timeFrame.week');
    return t('timeFrame.month');
  };

  const defaultDescription = t('description', { timeFrame: getTimeFrameLabel(timeFrame) });

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100">
          {t('title')}
          <span className="ml-2 text-xs px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full">{t('beta')}</span>
        </h3>

        <div className="flex p-1 bg-gray-100 dark:bg-gray-700 rounded-lg shadow-sm">
          <button onClick={() => setTimeFrame('day')} className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${timeFrame === 'day' ? 'bg-white dark:bg-gray-600 shadow-sm text-primary-600 dark:text-primary-400' : 'text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-gray-100'}`}>
            {t('timeFrame.day')}
          </button>
          <button onClick={() => setTimeFrame('week')} className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${timeFrame === 'week' ? 'bg-white dark:bg-gray-600 shadow-sm text-primary-600 dark:text-primary-400' : 'text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-gray-100'}`}>
            {t('timeFrame.week')}
          </button>
          <button onClick={() => setTimeFrame('month')} className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${timeFrame === 'month' ? 'bg-white dark:bg-gray-600 shadow-sm text-primary-600 dark:text-primary-400' : 'text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-gray-100'}`}>
            {t('timeFrame.month')}
          </button>
        </div>
      </div>

      <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">{forecastData?.description || defaultDescription}</p>

      {loading ? (
        <div className="py-16 flex flex-col items-center justify-center">
          <LoadingSpinner size="lg" className="mb-4" />
          <p className="text-gray-500 dark:text-gray-400">{t('loading')}</p>
        </div>
      ) : predictions.length > 0 ? (
        <div className="space-y-6">
          {predictions.map((prediction, index) => (
            <motion.div key={prediction.topic} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: index * 0.1 }} className="bg-gray-50 dark:bg-gray-750 rounded-xl p-5">
              <div className="flex flex-col md:flex-row md:items-center gap-4 mb-4">
                <div className="flex-grow">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs px-2 py-0.5 rounded-full" style={{ backgroundColor: `${getGrowthColor(prediction.growthScore)}20`, color: getGrowthColor(prediction.growthScore) }}>
                      {getGrowthTrend(prediction.growthScore)}
                    </span>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300">{prediction.category}</span>
                  </div>

                  <h4 className="text-lg font-bold text-gray-800 dark:text-gray-100 line-clamp-2">{prediction.topic}</h4>
                </div>

                <div className="flex-shrink-0">
                  <div className="flex flex-col items-center">
                    <div className="relative w-16 h-16">
                      <svg className="w-16 h-16 transform -rotate-90" viewBox="0 0 100 100">
                        <circle cx="50" cy="50" r="45" fill="none" stroke="#E5E7EB" strokeWidth="10" className="dark:stroke-gray-600" />
                        <circle cx="50" cy="50" r="45" fill="none" stroke={getGrowthColor(prediction.growthScore)} strokeWidth="10" strokeDasharray={`${prediction.confidence * 2.83} 283`} />
                      </svg>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-lg font-bold" style={{ color: getGrowthColor(prediction.growthScore) }}>{prediction.confidence}%</span>
                      </div>
                    </div>
                    <span className="text-xs text-gray-500 dark:text-gray-400 mt-1">{t('confidence', { label: getConfidenceLabel(prediction.confidence) })}</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <div className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">{t('keywords')}</div>
                  <div className="flex flex-wrap gap-2">
                    {prediction.keywords.map((keyword) => (
                      <span key={keyword} className="text-xs px-2.5 py-1 bg-white dark:bg-gray-700 rounded-full text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-600">{keyword}</span>
                    ))}
                  </div>
                </div>

                <div>
                  <div className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">{t('platforms')}</div>
                  <div className="flex flex-wrap gap-2">
                    {prediction.platformSource.map((platformCode) => {
                      const platform = getPlatformInfoByCode(platformCode);
                      return (
                        <span key={platformCode} className="text-xs px-2.5 py-1 rounded-full" style={{ backgroundColor: `${platform?.color || '#3B82F6'}15`, color: platform?.color || '#3B82F6' }}>
                          {platform?.name || platformCode}
                        </span>
                      );
                    })}
                  </div>
                </div>
              </div>

              <div className="mt-5 h-12">
                <div className="w-full h-full relative">
                  <div className="absolute inset-0 flex items-end">
                    {Array.from({ length: 7 }).map((_, i) => {
                      const trend = prediction.growthScore / 100;
                      const baseHeight = 30 + i * trend * 10;
                      const randomVariance = Math.random() * 15 - 7.5;
                      const height = Math.max(5, Math.min(100, baseHeight + randomVariance));

                      return <motion.div key={i} className="flex-1 mx-0.5 rounded-t-sm" style={{ backgroundColor: getGrowthColor(prediction.growthScore), opacity: 0.7 + i * 0.05 }} initial={{ height: 0 }} animate={{ height: `${height}%` }} transition={{ duration: 0.5, delay: 0.3 + i * 0.05 }} />;
                    })}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="py-16 text-center text-gray-500 dark:text-gray-400">{t('noData')}</div>
      )}

      <div className="mt-8 pt-6 border-t border-gray-100 dark:border-gray-700 text-xs text-gray-500 dark:text-gray-400">
        <p>{t('disclaimer')}</p>
      </div>
    </div>
  );
}
