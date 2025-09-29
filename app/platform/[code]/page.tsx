"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { motion } from "framer-motion"
import { PLATFORMS } from "../../../constants/platforms";
import TrendingItem from "../../../components/TrendingItem";
import LoadingSpinner from "../../../components/LoadingSpinner";
import { fetchTrendingData, fetchMultiPlatformData } from "../../../utils/api";
import { TrendingItem as TrendingItemType, PlatformType } from "../../../types";

export default function PlatformPage() {
  const params = useParams();
  const platformCode = params.code as PlatformType;

  const [trendingData, setTrendingData] = useState<TrendingItemType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Get platform info
  const platformInfo = PLATFORMS.find(p => p.code === platformCode);

  // 格式化时间，只显示时分秒
  const formatTime = (timeString?: string) => {
    if (!timeString) return null;
    const parts = timeString.split(' ');
    return parts.length > 1 ? parts[1] : timeString;
  };

  // Fetch data for the platform
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);

      try {
        // 使用新的多平台API获取数据
        const response = await fetchMultiPlatformData([platformCode]);
        const platformResponse = response[platformCode];

        if (platformResponse && platformResponse.status === '200') {
          // 过滤掉没有标题的项目
          const validItems = platformResponse.data.filter(item => item.title && item.title.trim() !== '');
          setTrendingData(validItems);
        } else {
          setError(`获取数据失败: ${platformResponse?.msg || '未知错误'}`);
        }
      } catch (error) {
        console.error(`Error fetching ${platformCode} data:`, error);
        setError('获取数据时出错，请稍后再试');
      } finally {
        setLoading(false);
      }
    };

    if (platformCode) {
      fetchData();
    }
  }, [platformCode]);

  if (!platformInfo) {
    return (
      <div className="text-center py-16">
        <h1 className="text-2xl font-bold mb-4">平台不存在</h1>
        <p className="text-gray-600 dark:text-gray-300 mb-8">
          您访问的平台不存在或已被移除
        </p>
        <Link
          href="/"
          className="text-primary-600 dark:text-primary-400 hover:underline"
        >
        </Link>
      </div>
    );
  }

  return (
    <>
      <div className="mb-8">
        <Link href="/" className="text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 text-sm flex items-center gap-1">

        </Link>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden mb-8 p-6"
      >
        <div className="flex items-center gap-4 mb-4">
          <div
            className="w-12 h-12 rounded-lg flex items-center justify-center text-white"
            style={{ backgroundColor: platformInfo.color || '#0ea5e9' }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              {platformInfo.name}
            </h1>
            <p className="text-gray-600 dark:text-gray-300">
              {platformInfo.description}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 mt-2">
          <div className="text-sm text-gray-600 dark:text-gray-300 flex items-center gap-1">
            <span className="font-medium">内容类型:</span>
            <div className="flex flex-wrap gap-1">
              {platformInfo.contentType.map(type => (
                <span
                  key={type}
                  className="inline-block px-2 py-0.5 bg-gray-100 dark:bg-gray-700 rounded-full text-xs"
                >
                  {type}
                </span>
              ))}
            </div>
          </div>

          <div className="text-sm text-gray-600 dark:text-gray-300 flex items-center gap-1 ml-4">
            <span className="font-medium">更新频率:</span>
            <span>
              {trendingData.length > 0 && trendingData[0].publish_time
                ? formatTime(trendingData[0].publish_time)
                : platformInfo.updateFrequency}
            </span>
          </div>
        </div>
      </motion.div>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden">
        <div className="p-4 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            热榜内容
          </h2>
          <button
            className="text-sm text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 flex items-center gap-1"
            onClick={() => {
              setLoading(true);
              fetchMultiPlatformData([platformCode]).then(response => {
                const platformResponse = response[platformCode];
                if (platformResponse && platformResponse.status === '200') {
                  // 过滤掉没有标题的项目
                  const validItems = platformResponse.data.filter(item => item.title && item.title.trim() !== '');
                  setTrendingData(validItems);
                } else {
                  setError(`获取数据失败: ${platformResponse?.msg || '未知错误'}`);
                }
                setLoading(false);
              }).catch(error => {
                console.error('Error refreshing data:', error);
                setError('获取数据时出错，请稍后再试');
                setLoading(false);
              });
            }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            刷新
          </button>
        </div>

        {loading ? (
          <div className="p-8 flex justify-center">
            <LoadingSpinner size="lg" />
          </div>
        ) : error ? (
          <div className="p-8 text-center text-red-500">
            <p>{error}</p>
          </div>
        ) : trendingData.length > 0 ? (
          <div>
            {trendingData.map((item, index) => (
              <TrendingItem
                key={`${item.title}-${index}`}
                item={item}
                index={index}
                platformColor={platformInfo.color}
              />
            ))}
          </div>
        ) : (
          <div className="p-8 text-center text-gray-500 dark:text-gray-400">
            <p>暂无数据，请稍后再试。</p>
          </div>
        )}
      </div>
    </>
  );
} 