"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { motion } from "framer-motion";
import { useTranslations } from 'next-intl';
import { TrendingItem as TrendingItemType, PlatformType } from "../../../types";
import TrendingItem from "../../../components/TrendingItem";
import LoadingSpinner from "../../../components/LoadingSpinner";
import { fetchMultiPlatformData } from "../../../utils/api";
import { usePlatformI18n } from "@/lib/platform-i18n";

export default function PlatformPage() {
  const params = useParams();
  const platformCode = params.code as PlatformType;
  const t = useTranslations('platformPage');
  const common = useTranslations('common');
  const { getPlatformInfoByCode } = usePlatformI18n();

  const [trendingData, setTrendingData] = useState<TrendingItemType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const platformInfo = getPlatformInfoByCode(platformCode);

  const formatTime = (timeString?: string) => {
    if (!timeString) return null;
    const parts = timeString.split(' ');
    return parts.length > 1 ? parts[1] : timeString;
  };

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetchMultiPlatformData([platformCode]);
      const platformResponse = response[platformCode];
      if (platformResponse && platformResponse.status === '200') {
        const validItems = platformResponse.data.filter(item => item.title && item.title.trim() !== '');
        setTrendingData(validItems);
      } else {
        setError(t('fetchFailed', {message: platformResponse?.msg || 'Unknown'}));
      }
    } catch (error) {
      console.error(`Error fetching ${platformCode} data:`, error);
      setError(t('fetchError'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (platformCode) loadData();
  }, [platformCode]);

  if (!platformInfo) {
    return (
      <div className="text-center py-16">
        <h1 className="text-2xl font-bold mb-4">{t('notFound')}</h1>
        <p className="text-gray-600 dark:text-gray-300 mb-8">{t('notFoundDesc')}</p>
        <Link href="/" className="text-primary-600 dark:text-primary-400 hover:underline">{common('home')}</Link>
      </div>
    );
  }

  return (
    <>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden mb-8 p-6">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-12 h-12 rounded-lg flex items-center justify-center text-white" style={{ backgroundColor: platformInfo.color || '#0ea5e9' }}>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{platformInfo.name}</h1>
            <p className="text-gray-600 dark:text-gray-300">{platformInfo.description}</p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 mt-2">
          <div className="text-sm text-gray-600 dark:text-gray-300 flex items-center gap-1">
            <span className="font-medium">{t('contentType')}</span>
            <div className="flex flex-wrap gap-1">{platformInfo.contentType.map(type => <span key={type} className="inline-block px-2 py-0.5 bg-gray-100 dark:bg-gray-700 rounded-full text-xs">{type}</span>)}</div>
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-300 flex items-center gap-1 ml-4">
            <span className="font-medium">{t('updateFrequency')}</span>
            <span>{trendingData.length > 0 && trendingData[0].publish_time ? formatTime(trendingData[0].publish_time) : platformInfo.updateFrequency}</span>
          </div>
        </div>
      </motion.div>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden">
        <div className="p-4 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">{t('rankingTitle')}</h2>
          <button className="text-sm text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 flex items-center gap-1" onClick={loadData}>{t('refresh')}</button>
        </div>

        {loading ? (
          <div className="p-8 flex justify-center"><LoadingSpinner size="lg" /></div>
        ) : error ? (
          <div className="p-8 text-center text-red-500"><p>{error}</p></div>
        ) : trendingData.length > 0 ? (
          <div>{trendingData.map((item, index) => <TrendingItem key={`${item.title}-${index}`} item={item} index={index} platformColor={platformInfo.color} />)}</div>
        ) : (
          <div className="p-8 text-center text-gray-500 dark:text-gray-400"><p>{t('empty')}</p></div>
        )}
      </div>
    </>
  );
}
