"use client";

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { TopicHeatDistribution } from '../types';
import { fetchDataVisualization } from '../utils/api';
import LoadingSpinner from './LoadingSpinner';

interface TopicHeatVisualizationProps {
}

export default function TopicHeatVisualization({ }: TopicHeatVisualizationProps) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<TopicHeatDistribution | null>(null);
  const [selectedKeyword, setSelectedKeyword] = useState<string | null>(null);
  const [selectedPlatform, setSelectedPlatform] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await fetchDataVisualization();
        if (response.status === 'success') {
          setData(response.topic_heat_distribution);
        } else {
          setError(response.msg || '获取数据失败');
        }
      } catch (error) {
        setError('获取数据时发生错误');
        console.error('Error fetching data visualization:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Generate a color for each platform
  const platformColors = [
    '#3B82F6', // Blue
    '#EF4444', // Red
    '#F59E0B', // Amber
    '#10B981', // Green
    '#8B5CF6', // Purple
    '#EC4899', // Pink
    '#6366F1', // Indigo
    '#14B8A6', // Teal
    '#F97316', // Orange
    '#06B6D4', // Cyan
  ];

  // Get color for a platform
  const getPlatformColor = (platformIndex: number) => {
    return platformColors[platformIndex % platformColors.length];
  };

  // Format heat value for display
  const formatHeatValue = (value: number) => {
    if (value === 0) return '-';
    return value.toFixed(1);
  };

  // Calculate max heat value for scaling
  const maxHeatValue = data?.data.reduce((max, item) => {
    const itemMax = Math.max(...item.values);
    return itemMax > max ? itemMax : max;
  }, 0) || 100;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-card border border-gray-100 dark:border-gray-700 p-6">
      <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-6">主题热度分布图</h3>

      {loading ? (
        <div className="flex justify-center items-center py-20">
          <LoadingSpinner size="lg" />
        </div>
      ) : error ? (
        <div className="flex justify-center items-center py-20 text-red-500">
          {error}
        </div>
      ) : !data || data.keywords.length === 0 ? (
        <div className="flex justify-center items-center py-20 text-gray-500">
          暂无热度分布数据
        </div>
      ) : (
        <div>
          {/* Platform filters */}
          <div className="mb-6 flex flex-wrap gap-2">
            <button
              onClick={() => setSelectedPlatform(null)}
              className={`px-3 py-1 text-xs rounded-full transition-all ${selectedPlatform === null
                ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
            >
              全部平台
            </button>

            {data.platforms.map((platform, index) => (
              <button
                key={platform}
                onClick={() => setSelectedPlatform(platform)}
                className="px-3 py-1 text-xs rounded-full transition-all"
                style={{
                  backgroundColor: selectedPlatform === platform ? `${getPlatformColor(index)}20` : 'rgba(229, 231, 235, var(--tw-bg-opacity))',
                  color: selectedPlatform === platform ? getPlatformColor(index) : 'rgba(107, 114, 128, var(--tw-text-opacity))'
                }}
              >
                {platform}
              </button>
            ))}
          </div>

          {/* Heat map table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400 border-b border-gray-100 dark:border-gray-700">
                    关键词 / 平台
                  </th>

                  {data.platforms.map((platform, index) => (
                    (!selectedPlatform || selectedPlatform === platform) && (
                      <th
                        key={platform}
                        className="px-4 py-3 text-center text-sm font-medium border-b border-gray-100 dark:border-gray-700"
                        style={{ color: getPlatformColor(index) }}
                      >
                        {platform}
                      </th>
                    )
                  ))}
                </tr>
              </thead>

              <tbody>
                {data.data.map((item, rowIndex) => (
                  <tr
                    key={item.keyword}
                    className={`
                      border-b border-gray-100 dark:border-gray-700 
                      ${selectedKeyword === item.keyword ? 'bg-gray-50 dark:bg-gray-750' : 'hover:bg-gray-50 dark:hover:bg-gray-750'}
                      transition-colors
                    `}
                    onClick={() => setSelectedKeyword(selectedKeyword === item.keyword ? null : item.keyword)}
                  >
                    <td className="px-4 py-3 text-sm font-medium text-gray-700 dark:text-gray-300">
                      {item.keyword}
                    </td>

                    {item.values.map((value, colIndex) => (
                      (!selectedPlatform || selectedPlatform === data.platforms[colIndex]) && (
                        <td key={colIndex} className="px-4 py-3 text-center">
                          <div className="flex flex-col items-center">
                            {value > 0 ? (
                              <>
                                <div
                                  className="w-12 h-12 rounded-md flex items-center justify-center text-white font-medium mb-1"
                                  style={{
                                    backgroundColor: getPlatformColor(colIndex),
                                    opacity: value / maxHeatValue
                                  }}
                                >
                                  {formatHeatValue(value)}
                                </div>

                                <div className="w-full h-1 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                                  <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: `${(value / maxHeatValue) * 100}%` }}
                                    transition={{ duration: 0.8, ease: "easeOut" }}
                                    className="h-full"
                                    style={{ backgroundColor: getPlatformColor(colIndex) }}
                                  />
                                </div>
                              </>
                            ) : (
                              <div className="w-12 h-12 rounded-md flex items-center justify-center text-gray-400 dark:text-gray-600 bg-gray-100 dark:bg-gray-700 opacity-30">
                                -
                              </div>
                            )}
                          </div>
                        </td>
                      )
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Legend */}
          <div className="mt-6 text-xs text-gray-500 dark:text-gray-400">
            <div className="flex items-center justify-center gap-6 flex-wrap">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-gray-300 dark:bg-gray-600"></div>
                <span>无数据</span>
              </div>

              {platformColors.slice(0, 3).map((color, index) => (
                <div key={index} className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: color }}></div>
                  <span>
                    {index === 0 && '低热度'}
                    {index === 1 && '中热度'}
                    {index === 2 && '高热度'}
                  </span>
                </div>
              ))}
            </div>

            <div className="text-center mt-4">
              数值表示关键词在各平台上的热度指数，点击行可选中特定关键词进行对比
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 