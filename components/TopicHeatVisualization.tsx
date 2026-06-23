"use client";

import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { useTranslations } from 'next-intl';
import { TopicHeatDistribution } from '../types';
import { fetchDataVisualization } from '../utils/api';
import LoadingSpinner from './LoadingSpinner';
import { usePlatformI18n } from '@/lib/platform-i18n';

export default function TopicHeatVisualization() {
  const t = useTranslations('topicHeat');
  const { getPlatformInfoByCode } = usePlatformI18n();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<TopicHeatDistribution | null>(null);
  const [selectedKeyword, setSelectedKeyword] = useState<string | null>(null);
  const [selectedPlatform, setSelectedPlatform] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const response = await fetchDataVisualization();
        if (response.status === 'success') {
          setData(response.topic_heat_distribution);
        } else {
          setError(response.msg || t('fetchFailed'));
        }
      } catch (err) {
        setError(t('fetchError'));
        console.error('Error fetching data visualization:', err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [t]);

  const platformColors = ['#3B82F6', '#EF4444', '#F59E0B', '#10B981', '#8B5CF6', '#EC4899', '#6366F1', '#14B8A6', '#F97316', '#06B6D4'];
  const getPlatformColor = (index: number) => platformColors[index % platformColors.length];
  const formatHeatValue = (value: number) => (value === 0 ? '-' : value.toFixed(1));

  const maxHeatValue = useMemo(() => data?.data.reduce((max, item) => Math.max(max, ...item.values), 0) || 100, [data]);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-card border border-gray-100 dark:border-gray-700 p-6">
      <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-6">{t('title')}</h3>

      {loading ? (
        <div className="flex justify-center items-center py-20">
          <LoadingSpinner size="lg" />
        </div>
      ) : error ? (
        <div className="flex justify-center items-center py-20 text-red-500">{error}</div>
      ) : !data || data.keywords.length === 0 ? (
        <div className="flex justify-center items-center py-20 text-gray-500">{t('empty')}</div>
      ) : (
        <div>
          <div className="mb-6 flex flex-wrap gap-2">
            <button
              onClick={() => setSelectedPlatform(null)}
              className={`px-3 py-1 text-xs rounded-full transition-all ${selectedPlatform === null ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400' : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'}`}
            >
              {t('allPlatforms')}
            </button>

            {data.platforms.map((platform, index) => {
              const platformInfo = getPlatformInfoByCode(platform);
              return (
                <button
                  key={platform}
                  onClick={() => setSelectedPlatform(platform)}
                  className="px-3 py-1 text-xs rounded-full transition-all"
                  style={{
                    backgroundColor: selectedPlatform === platform ? `${getPlatformColor(index)}20` : 'rgba(229, 231, 235, var(--tw-bg-opacity))',
                    color: selectedPlatform === platform ? getPlatformColor(index) : 'rgba(107, 114, 128, var(--tw-text-opacity))',
                  }}
                >
                  {platformInfo?.name || platform}
                </button>
              );
            })}
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400 border-b border-gray-100 dark:border-gray-700">{t('tableHeader')}</th>
                  {data.platforms.map((platform, index) => {
                    if (selectedPlatform && selectedPlatform !== platform) return null;
                    const platformInfo = getPlatformInfoByCode(platform);
                    return (
                      <th key={platform} className="px-4 py-3 text-center text-sm font-medium border-b border-gray-100 dark:border-gray-700" style={{ color: getPlatformColor(index) }}>
                        {platformInfo?.name || platform}
                      </th>
                    );
                  })}
                </tr>
              </thead>
              <tbody>
                {data.data.map((item) => (
                  <tr
                    key={item.keyword}
                    className={`border-b border-gray-100 dark:border-gray-700 ${selectedKeyword === item.keyword ? 'bg-gray-50 dark:bg-gray-750' : 'hover:bg-gray-50 dark:hover:bg-gray-750'} transition-colors`}
                    onClick={() => setSelectedKeyword(selectedKeyword === item.keyword ? null : item.keyword)}
                  >
                    <td className="px-4 py-3 text-sm font-medium text-gray-700 dark:text-gray-300">{item.keyword}</td>
                    {item.values.map((value, colIndex) => {
                      const platformCode = data.platforms[colIndex];
                      if (selectedPlatform && selectedPlatform !== platformCode) return null;
                      return (
                        <td key={`${item.keyword}-${platformCode}`} className="px-4 py-3 text-center">
                          <div className="flex flex-col items-center">
                            {value > 0 ? (
                              <>
                                <div className="w-12 h-12 rounded-md flex items-center justify-center text-white font-medium mb-1" style={{ backgroundColor: getPlatformColor(colIndex), opacity: value / maxHeatValue }}>
                                  {formatHeatValue(value)}
                                </div>
                                <div className="w-full h-1 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                                  <motion.div initial={{ width: 0 }} animate={{ width: `${(value / maxHeatValue) * 100}%` }} transition={{ duration: 0.8, ease: 'easeOut' }} className="h-full" style={{ backgroundColor: getPlatformColor(colIndex) }} />
                                </div>
                              </>
                            ) : (
                              <div className="w-12 h-12 rounded-md flex items-center justify-center text-gray-400 dark:text-gray-600 bg-gray-100 dark:bg-gray-700 opacity-30">-</div>
                            )}
                          </div>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-6 text-xs text-gray-500 dark:text-gray-400">
            <div className="flex items-center justify-center gap-6 flex-wrap">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-gray-300 dark:bg-gray-600" />
                <span>{t('legend.noData')}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: platformColors[0] }} />
                <span>{t('legend.lowHeat')}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: platformColors[1] }} />
                <span>{t('legend.mediumHeat')}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: platformColors[2] }} />
                <span>{t('legend.highHeat')}</span>
              </div>
            </div>

            <div className="text-center mt-4">{t('description')}</div>
          </div>
        </div>
      )}
    </div>
  );
}
