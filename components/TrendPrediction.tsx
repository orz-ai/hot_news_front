"use client";

import { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { PlatformType, TrendingItem, TrendForecastResponse } from '../types';
import { PLATFORMS } from '../constants/platforms';
import { fetchTrendForecast } from '../utils/api';
import LoadingSpinner from './LoadingSpinner';

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
  const [timeFrame, setTimeFrame] = useState<'day' | 'week' | 'month'>('day');
  const [loading, setLoading] = useState<boolean>(true);
  const [forecastData, setForecastData] = useState<TrendForecastResponse | null>(null);
  
  // Fetch trend forecast data when timeFrame changes
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Convert timeFrame to API parameter format
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
  
  // Transform API data to prediction results format
  const predictions = useMemo(() => {
    if (!forecastData || !forecastData.has_enough_data || forecastData.trend_evolution.length === 0) {
      return [];
    }
    
    return forecastData.trend_evolution.map(item => {
      // Calculate growth score (-100 to 100) based on forecast vs current heat
      const currentHeat = item.current_heat;
      const forecastHeat = item.forecast[0]?.heat || currentHeat;
      const growthDiff = forecastHeat - currentHeat;
      const growthScore = Math.min(Math.max(Math.round(growthDiff * 2), -100), 100);
      
      // Map platforms to PlatformType
      const platformSource = item.platforms
        .filter(p => Object.values(PLATFORMS).some(platform => platform.code === p))
        .map(p => p as PlatformType);
      
      return {
        topic: item.topic,
        keywords: item.keywords,
        confidence: item.probability,
        relatedTopics: item.keywords, // Using keywords as related topics since API doesn't provide separate related topics
        platformSource,
        growthScore,
        category: item.category
      } as PredictionResult;
    });
  }, [forecastData]);
  
  // Get color based on growth score
  const getGrowthColor = (score: number) => {
    if (score > 50) return '#10B981'; // green for strong positive
    if (score > 0) return '#60A5FA'; // blue for positive
    if (score > -30) return '#F59E0B'; // yellow for slight negative
    return '#EF4444'; // red for strong negative
  };
  
  // Get confidence level label
  const getConfidenceLabel = (score: number) => {
    if (score >= 80) return '很高';
    if (score >= 60) return '较高';
    if (score >= 40) return '中等';
    return '较低';
  };
  
  // Get growth trend label
  const getGrowthTrend = (score: number) => {
    if (score > 50) return '强劲上升';
    if (score > 20) return '稳步上升';
    if (score > 0) return '小幅上升';
    if (score > -20) return '持平';
    if (score > -50) return '小幅下降';
    return '明显下降';
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100">
          趋势预测
          <span className="ml-2 text-xs px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full">
            BETA
          </span>
        </h3>
        
        <div className="flex p-1 bg-gray-100 dark:bg-gray-700 rounded-lg shadow-sm">
          <button
            onClick={() => setTimeFrame('day')}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${
              timeFrame === 'day' 
                ? 'bg-white dark:bg-gray-600 shadow-sm text-primary-600 dark:text-primary-400' 
                : 'text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-gray-100'
            }`}
          >
            24小时
          </button>
          <button
            onClick={() => setTimeFrame('week')}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${
              timeFrame === 'week' 
                ? 'bg-white dark:bg-gray-600 shadow-sm text-primary-600 dark:text-primary-400' 
                : 'text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-gray-100'
            }`}
          >
            7天
          </button>
          <button
            onClick={() => setTimeFrame('month')}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${
              timeFrame === 'month' 
                ? 'bg-white dark:bg-gray-600 shadow-sm text-primary-600 dark:text-primary-400' 
                : 'text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-gray-100'
            }`}
          >
            30天
          </button>
        </div>
      </div>
      
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
        {forecastData?.description || `基于当前热点数据和历史趋势，预测未来${timeFrame === 'day' ? '24小时' : timeFrame === 'week' ? '7天' : '30天'}内可能持续升温的热门话题。`}
      </p>
      
      {loading ? (
        <div className="py-16 flex flex-col items-center justify-center">
          <LoadingSpinner size="lg" className="mb-4" />
          <p className="text-gray-500 dark:text-gray-400">加载预测数据中...</p>
        </div>
      ) : predictions.length > 0 ? (
        <div className="space-y-6">
          {predictions.map((prediction, index) => (
            <motion.div
              key={prediction.topic}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
              className="bg-gray-50 dark:bg-gray-750 rounded-xl p-5"
            >
              <div className="flex flex-col md:flex-row md:items-center gap-4 mb-4">
                <div className="flex-grow">
                  <div className="flex items-center gap-2 mb-2">
                    <span 
                      className="text-xs px-2 py-0.5 rounded-full"
                      style={{ 
                        backgroundColor: getGrowthColor(prediction.growthScore) + '20',
                        color: getGrowthColor(prediction.growthScore)
                      }}
                    >
                      {getGrowthTrend(prediction.growthScore)}
                    </span>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300">
                      {prediction.category}
                    </span>
                  </div>
                  
                  <h4 className="text-lg font-bold text-gray-800 dark:text-gray-100 line-clamp-2">
                    {prediction.topic}
                  </h4>
                </div>
                
                <div className="flex-shrink-0">
                  <div className="flex flex-col items-center">
                    <div className="relative w-16 h-16">
                      <svg className="w-16 h-16 transform -rotate-90" viewBox="0 0 100 100">
                        <circle
                          cx="50"
                          cy="50"
                          r="45"
                          fill="none"
                          stroke="#E5E7EB"
                          strokeWidth="10"
                          className="dark:stroke-gray-600"
                        />
                        <circle
                          cx="50"
                          cy="50"
                          r="45"
                          fill="none"
                          stroke={getGrowthColor(prediction.growthScore)}
                          strokeWidth="10"
                          strokeDasharray={`${prediction.confidence * 2.83} 283`}
                        />
                      </svg>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-lg font-bold" style={{ color: getGrowthColor(prediction.growthScore) }}>
                          {prediction.confidence}%
                        </span>
                      </div>
                    </div>
                    <span className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      可信度{getConfidenceLabel(prediction.confidence)}
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <div className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">
                    关键词
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {prediction.keywords.map(keyword => (
                      <span
                        key={keyword}
                        className="text-xs px-2.5 py-1 bg-white dark:bg-gray-700 rounded-full text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-600"
                      >
                        {keyword}
                      </span>
                    ))}
                  </div>
                </div>
                
                <div>
                  <div className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">
                    出现平台
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {prediction.platformSource.map(platformCode => {
                      const platform = PLATFORMS.find(p => p.code === platformCode);
                      return (
                        <span
                          key={platformCode}
                          className="text-xs px-2.5 py-1 rounded-full"
                          style={{
                            backgroundColor: `${platform?.color || '#3B82F6'}15`,
                            color: platform?.color || '#3B82F6'
                          }}
                        >
                          {platform?.name || platformCode}
                        </span>
                      );
                    })}
                  </div>
                </div>
              </div>
              
              {/* Trend Chart (Simulated) */}
              <div className="mt-5 h-12">
                <div className="w-full h-full relative">
                  <div className="absolute inset-0 flex items-end">
                    {Array.from({ length: 7 }).map((_, i) => {
                      // Generate random height values with an overall trend following the growth score
                      const trend = prediction.growthScore / 100;
                      const baseHeight = 30 + (i * trend * 10);
                      const randomVariance = Math.random() * 15 - 7.5;
                      const height = Math.max(5, Math.min(100, baseHeight + randomVariance));
                      
                      return (
                        <motion.div
                          key={i}
                          className="flex-1 mx-0.5 rounded-t-sm"
                          style={{ 
                            backgroundColor: getGrowthColor(prediction.growthScore),
                            opacity: 0.7 + (i * 0.05)
                          }}
                          initial={{ height: 0 }}
                          animate={{ height: `${height}%` }}
                          transition={{ duration: 0.5, delay: 0.3 + (i * 0.05) }}
                        />
                      );
                    })}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="py-16 text-center text-gray-500 dark:text-gray-400">
          没有足够的数据进行趋势预测
        </div>
      )}
      
      <div className="mt-8 pt-6 border-t border-gray-100 dark:border-gray-700 text-xs text-gray-500 dark:text-gray-400">
        <p>
          趋势预测基于当前热点数据分析和历史趋势算法，仅供参考。实际趋势可能受到多种因素影响而变化。
        </p>
      </div>
    </div>
  );
} 