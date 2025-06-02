"use client";

import { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { PlatformType, TrendingItem, PlatformComparisonResponse, PlatformRanking } from '../types';
import { PLATFORMS } from '../constants/platforms';
import { fetchPlatformComparisonData } from '../utils/api';
import LoadingSpinner from './LoadingSpinner';

interface TrendVisualizationProps {
  trendingData: Record<PlatformType, TrendingItem[]>;
  timeRange: string;
}

export default function TrendVisualization({ trendingData, timeRange }: TrendVisualizationProps) {
  const [selectedView, setSelectedView] = useState<'heatmap' | 'comparison' | 'timeline'>('heatmap');
  const [selectedPlatforms, setSelectedPlatforms] = useState<PlatformType[]>([]);
  const [maxItems, setMaxItems] = useState(10);
  const [isMaxItemsOpen, setIsMaxItemsOpen] = useState(false);
  const [platformComparisonData, setPlatformComparisonData] = useState<{
    platformRankings: PlatformRanking[],
    isLoading: boolean
  }>({
    platformRankings: [],
    isLoading: true
  });

  // Initialize with top 5 platforms by data volume
  useEffect(() => {
    if (Object.keys(trendingData).length > 0) {
      const platformsByItemCount = Object.entries(trendingData)
        .map(([platform, items]) => ({
          platform: platform as PlatformType,
          count: items.length
        }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5)
        .map(item => item.platform);
      
      setSelectedPlatforms(platformsByItemCount);
    }
  }, [trendingData]);

  // Fetch platform comparison data
  useEffect(() => {
    const getPlatformComparisonData = async () => {
      try {
        const response = await fetchPlatformComparisonData();
        if (response.status === 'success') {
          setPlatformComparisonData({
            platformRankings: response.platform_rankings,
            isLoading: false
          });
        } else {
          console.error('Failed to fetch platform comparison data:', response.msg);
          setPlatformComparisonData(prev => ({ ...prev, isLoading: false }));
        }
      } catch (error) {
        console.error('Error fetching platform comparison data:', error);
        setPlatformComparisonData(prev => ({ ...prev, isLoading: false }));
      }
    };

    if (Object.keys(trendingData).length > 0) {
      getPlatformComparisonData();
    }
  }, [trendingData]);

  // Toggle platform selection
  const togglePlatform = (platform: PlatformType) => {
    setSelectedPlatforms(prev => 
      prev.includes(platform)
        ? prev.filter(p => p !== platform)
        : [...prev, platform]
    );
  };

  // Calculate platform metrics
  const platformMetrics = useMemo(() => {
    // If we have API data, use that for platform metrics
    if (!platformComparisonData.isLoading && platformComparisonData.platformRankings.length > 0) {
      return platformComparisonData.platformRankings.map(ranking => {
        const platformInfo = PLATFORMS.find(p => p.code === ranking.platform);
        
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
          trend: ranking.trend
        };
      }).filter(metric => metric.itemCount > 0)
        .sort((a, b) => b.totalHeat - a.totalHeat);
    }
    
    // Fallback to calculating from trending data if API data isn't available
    return Object.entries(trendingData)
      .map(([platform, items]) => {
        const platformInfo = PLATFORMS.find(p => p.code === platform);
        const totalHeat = items.reduce((sum, item) => {
          const heat = parseInt(item.score || '0');
          return sum + (isNaN(heat) ? 0 : heat);
        }, 0);
        
        const avgHeat = items.length > 0 ? Math.round(totalHeat / items.length) : 0;
        
        // Calculate peak hours (simulated - would use real timestamps in production)
        const peakHour = Math.floor(Math.random() * 24); // Simulate peak hour
        
        // Calculate hot topic categories
        const categories = platformInfo?.contentType || [];
        
        return {
          platform: platform as PlatformType,
          name: platformInfo?.name || platform,
          color: platformInfo?.color || '#3b76ea',
          itemCount: items.length,
          totalHeat,
          avgHeat,
          peakHour,
          categories,
          avgTitleLength: items.length > 0 ? 
            Math.round(items.reduce((sum, item) => sum + (item.title?.length || 0), 0) / items.length) : 0,
          trend: 0 // Default trend for fallback calculation
        };
      })
      .filter(metric => metric.itemCount > 0)
      .sort((a, b) => b.totalHeat - a.totalHeat);
  }, [trendingData, platformComparisonData]);

  // Render heatmap view showing topic intensity across platforms
  const renderHeatmap = () => {
    // We'll create a basic heatmap of topics across selected platforms
    // This is simplified - a real heatmap would need more sophisticated analysis
    
    // Calculate top 10 overall trending topics
    const allTitles = Object.values(trendingData).flat().map(item => item.title);
    const titleFrequency: Record<string, number> = {};
    
    allTitles.forEach(title => {
      if (!title) return;
      
      // Use a simplified approach - in production would use NLP for topic extraction
      const words = title.split(/[\s,.!?;:()\[\]{}]/);
      words.forEach(word => {
        if (word.length >= 2) {
          titleFrequency[word] = (titleFrequency[word] || 0) + 1;
        }
      });
    });
    
    const topWords = Object.entries(titleFrequency)
      .sort((a, b) => b[1] - a[1])
      .slice(0, maxItems)
      .map(([word]) => word);
    
    return (
      <div className="mt-6">
        <div className="flex flex-wrap justify-between items-center mb-4">
          <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100">主题热度分布图</h3>
          
          {/* 改进的下拉框 */}
          <div className="relative inline-block">
            <button 
              onClick={() => setIsMaxItemsOpen(!isMaxItemsOpen)}
              className="flex items-center gap-2 px-3 py-1.5 text-sm bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-650 transition-colors"
            >
              <span>显示{maxItems}个主题词</span>
              <svg 
                className={`w-4 h-4 text-gray-500 transition-transform ${isMaxItemsOpen ? 'transform rotate-180' : ''}`} 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
              </svg>
            </button>
            
            {isMaxItemsOpen && (
              <div className="absolute right-0 mt-1 py-1 bg-white dark:bg-gray-700 rounded-lg shadow-lg border border-gray-200 dark:border-gray-600 z-10 min-w-[120px]">
                {[5, 10, 15, 20].map(value => (
                  <button
                    key={value}
                    onClick={() => {
                      setMaxItems(value);
                      setIsMaxItemsOpen(false);
                    }}
                    className={`block w-full text-left px-4 py-1.5 text-sm ${
                      maxItems === value 
                        ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400'
                        : 'text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-650'
                    }`}
                  >
                    {value} 个主题词
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
                <th className="px-4 py-2 text-left text-sm font-medium text-gray-500 dark:text-gray-400">主题词</th>
                {selectedPlatforms.map(platform => {
                  const platformInfo = PLATFORMS.find(p => p.code === platform);
                  return (
                    <th 
                      key={platform} 
                      className="px-4 py-2 text-center text-sm font-medium"
                      style={{ color: platformInfo?.color }}
                    >
                      {platformInfo?.name || platform}
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody>
              {topWords.map((word, index) => (
                <tr 
                  key={word}
                  className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors"
                >
                  <td className="px-4 py-3 text-sm font-medium text-gray-700 dark:text-gray-300">
                    {word}
                  </td>
                  
                  {selectedPlatforms.map(platform => {
                    const items = trendingData[platform] || [];
                    const matchCount = items.filter(item => 
                      item.title?.includes(word)
                    ).length;
                    
                    // Calculate intensity (0-100)
                    const maxPossible = items.length;
                    const intensity = maxPossible > 0 ? (matchCount / maxPossible) * 100 : 0;
                    
                    // Color based on platform
                    const platformInfo = PLATFORMS.find(p => p.code === platform);
                    const color = platformInfo?.color || '#3b76ea';
                    
                    return (
                      <td key={`${word}-${platform}`} className="px-4 py-3 text-center">
                        <div className="flex justify-center">
                          <div 
                            className="w-8 h-8 rounded-md flex items-center justify-center text-xs"
                            style={{ 
                              backgroundColor: `${color}${Math.round(intensity).toString(16).padStart(2, '0')}`,
                              color: intensity > 50 ? 'white' : color
                            }}
                          >
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

  // Render platform comparison view
  const renderComparison = () => {
    if (platformComparisonData.isLoading) {
      return (
        <div className="mt-6 flex justify-center py-12">
          <LoadingSpinner size="lg" />
        </div>
      );
    }
    
    const metrics = platformMetrics.filter(m => 
      selectedPlatforms.includes(m.platform)
    );
    
    // Find max values for scaling
    const maxHeat = Math.max(...metrics.map(m => m.totalHeat));
    const maxAvgHeat = Math.max(...metrics.map(m => m.avgHeat));
    const maxItems = Math.max(...metrics.map(m => m.itemCount));
    const maxTitleLength = Math.max(...metrics.map(m => m.avgTitleLength || 0));
    
    return (
      <div className="mt-6">
        <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100 mb-4">平台数据对比</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* 热度总量对比 */}
          <div className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-sm border border-gray-100 dark:border-gray-700">
            <h4 className="text-base font-medium text-gray-700 dark:text-gray-300 mb-4">热度总量</h4>
            
            <div className="space-y-4">
              {metrics.map(metric => (
                <div key={`heat-${metric.platform}`}>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm font-medium" style={{ color: metric.color }}>
                      {metric.name}
                    </span>
                    <div className="flex items-center gap-2">
                      <span 
                        className={`text-xs px-2 py-0.5 rounded-full flex items-center ${
                          metric.trend > 0 
                            ? 'bg-green-100 dark:bg-green-900/20 text-green-600 dark:text-green-400' 
                            : metric.trend < 0
                              ? 'bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400'
                              : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
                        }`}
                      >
                        {metric.trend > 0 ? '+' : ''}{metric.trend.toFixed(1)}%
                      </span>
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        {formatNumber(metric.totalHeat.toString())}
                      </span>
                    </div>
                  </div>
                  <div className="h-2 w-full bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${(metric.totalHeat / maxHeat) * 100}%` }}
                      transition={{ duration: 1, ease: "easeOut" }}
                      className="h-full"
                      style={{ backgroundColor: metric.color }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          {/* 平均热度对比 */}
          <div className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-sm border border-gray-100 dark:border-gray-700">
            <h4 className="text-base font-medium text-gray-700 dark:text-gray-300 mb-4">平均热度</h4>
            
            <div className="space-y-4">
              {metrics.map(metric => (
                <div key={`avg-${metric.platform}`}>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm font-medium" style={{ color: metric.color }}>
                      {metric.name}
                    </span>
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      {formatNumber(metric.avgHeat.toString())}
                    </span>
                  </div>
                  <div className="h-2 w-full bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${(metric.avgHeat / maxAvgHeat) * 100}%` }}
                      transition={{ duration: 1, ease: "easeOut" }}
                      className="h-full"
                      style={{ backgroundColor: metric.color }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          {/* 标题长度对比 - 新增 */}
          <div className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-sm border border-gray-100 dark:border-gray-700">
            <h4 className="text-base font-medium text-gray-700 dark:text-gray-300 mb-4">平均标题长度</h4>
            
            <div className="space-y-4">
              {metrics.map(metric => (
                <div key={`title-${metric.platform}`}>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm font-medium" style={{ color: metric.color }}>
                      {metric.name}
                    </span>
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      {metric.avgTitleLength || 0} 字符
                    </span>
                  </div>
                  <div className="h-2 w-full bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${maxTitleLength > 0 ? (metric.avgTitleLength || 0) / maxTitleLength * 100 : 0}%` }}
                      transition={{ duration: 1, ease: "easeOut" }}
                      className="h-full"
                      style={{ backgroundColor: metric.color }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          {/* 主题分布 */}
          <div className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-sm border border-gray-100 dark:border-gray-700">
            <h4 className="text-base font-medium text-gray-700 dark:text-gray-300 mb-4">主题分布</h4>
            
            <div className="flex flex-wrap gap-2">
              {metrics.map(metric => (
                <div 
                  key={`topic-${metric.platform}`}
                  className="flex flex-col items-center p-3 rounded-lg border border-gray-100 dark:border-gray-700"
                >
                  <div 
                    className="w-4 h-4 rounded-full mb-1.5"
                    style={{ backgroundColor: metric.color }}
                  />
                  <span className="text-sm font-medium text-gray-800 dark:text-gray-200 mb-2">
                    {metric.name}
                  </span>
                  <div className="flex flex-wrap gap-1 justify-center">
                    {metric.categories.map(category => (
                      <span 
                        key={`${metric.platform}-${category}`}
                        className="text-xs px-2 py-1 rounded-full"
                        style={{ 
                          backgroundColor: `${metric.color}15`,
                          color: metric.color
                        }}
                      >
                        {category}
                      </span>
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

  // Render timeline view
  const renderTimeline = () => {
    // Generate 24-hour time points (simplified - would use real timestamps in production)
    const hours = Array.from({ length: 24 }, (_, i) => i);
    
    // Generate random data distribution for each platform (for demo)
    // In production, would use actual publishing timestamps
    const timelineData = selectedPlatforms.map(platform => {
      const platformInfo = PLATFORMS.find(p => p.code === platform);
      const items = trendingData[platform] || [];
      
      // Generate simulated hourly distribution
      const distribution = hours.map(hour => {
        // Simulate peak hours with more weight
        const isPeak = platformMetrics.find(m => m.platform === platform)?.peakHour === hour;
        const weight = isPeak ? 0.3 : Math.random() * 0.1;
        return Math.floor(items.length * weight);
      });
      
      return {
        platform,
        name: platformInfo?.name || platform,
        color: platformInfo?.color || '#3b76ea',
        distribution
      };
    });
    
    // Find max value for scaling
    const maxValue = Math.max(
      ...timelineData.flatMap(d => d.distribution)
    );
    
    return (
      <div className="mt-6">
        <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100 mb-4">24小时热点分布</h3>
        
        <div className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-sm border border-gray-100 dark:border-gray-700">
          <div className="h-64 relative">
            {/* Time labels */}
            <div className="absolute bottom-0 left-0 right-0 flex justify-between text-xs text-gray-500 dark:text-gray-400">
              {[0, 6, 12, 18, 23].map(hour => (
                <span key={hour} style={{ position: 'absolute', left: `${(hour/23)*100}%` }}>
                  {hour}:00
                </span>
              ))}
            </div>
            
            {/* Distribution lines */}
            <div className="absolute inset-0 pt-4 pb-6">
              {timelineData.map(data => (
                <div 
                  key={data.platform}
                  className="absolute inset-0 flex items-end"
                >
                  <div className="w-full h-full flex items-end">
                    {data.distribution.map((value, hour) => {
                      const height = maxValue > 0 ? (value / maxValue) * 100 : 0;
                      
                      return (
                        <motion.div
                          key={hour}
                          initial={{ height: 0 }}
                          animate={{ height: `${height}%` }}
                          transition={{ duration: 1, delay: hour * 0.03 }}
                          className="flex-1 mx-0.5"
                          style={{ 
                            backgroundColor: `${data.color}40`,
                            minHeight: value > 0 ? 2 : 0
                          }}
                        />
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          {/* Legend */}
          <div className="mt-8 flex flex-wrap gap-4 justify-center">
            {timelineData.map(data => (
              <div key={`legend-${data.platform}`} className="flex items-center gap-2">
                <div 
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: data.color }}
                />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {data.name}
                </span>
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
          <button
            onClick={() => setSelectedView('heatmap')}
            className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${
              selectedView === 'heatmap' 
                ? 'bg-primary-600 text-white shadow-sm' 
                : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            主题热度图
          </button>
          <button
            onClick={() => setSelectedView('comparison')}
            className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${
              selectedView === 'comparison' 
                ? 'bg-primary-600 text-white shadow-sm' 
                : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            平台对比
          </button>
          <button
            onClick={() => setSelectedView('timeline')}
            className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${
              selectedView === 'timeline' 
                ? 'bg-primary-600 text-white shadow-sm' 
                : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            时间线分析
          </button>
        </div>
        
        <div className="flex flex-wrap items-center gap-3 bg-white dark:bg-gray-800 p-1.5 rounded-lg shadow-sm">
          <span className="text-xs font-medium text-gray-500 dark:text-gray-400 ml-2">
            选择平台:
          </span>
          
          {platformMetrics.slice(0, 8).map(metric => (
            <button
              key={metric.platform}
              onClick={() => togglePlatform(metric.platform)}
              className={`px-2.5 py-1 text-xs rounded-full transition-all ${
                selectedPlatforms.includes(metric.platform)
                  ? 'shadow-sm'
                  : 'opacity-60'
              }`}
              style={{
                backgroundColor: selectedPlatforms.includes(metric.platform) 
                  ? metric.color 
                  : `${metric.color}20`,
                color: selectedPlatforms.includes(metric.platform) 
                  ? 'white' 
                  : metric.color
              }}
            >
              {metric.name}
            </button>
          ))}
        </div>
      </div>

      {/* Render the selected view */}
      {selectedView === 'heatmap' && renderHeatmap()}
      {selectedView === 'comparison' && renderComparison()}
      {selectedView === 'timeline' && renderTimeline()}
    </div>
  );
}

// 辅助函数: 格式化数字，如果大于1万则显示为x.x万
function formatNumber(value: string): string {
  const num = parseInt(value);
  if (isNaN(num)) return value;
  
  if (num >= 10000) {
    return (num / 10000).toFixed(1) + '万';
  }
  
  return num.toLocaleString();
} 