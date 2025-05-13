"use client";

import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { PlatformType, TrendingItem } from '../types';
import { PLATFORMS } from '../constants/platforms';

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
  
  // Generate predictions based on current trending data
  // This is a simplified simulation - in a real app, you would use historical data and ML models
  const predictions = useMemo(() => {
    if (!trendingData || Object.keys(trendingData).length === 0) {
      return [];
    }
    
    // Categories for classification
    const categories = ['科技', '社会', '娱乐', '财经', '体育'];
    
    // Extract all trending items
    const allItems = Object.entries(trendingData).flatMap(([platform, items]) => 
      items.map(item => ({
        ...item,
        platform: platform as PlatformType
      }))
    );
    
    // Get top items based on score
    const topItems = [...allItems]
      .sort((a, b) => {
        const scoreA = parseInt(a.score || '0') || 0;
        const scoreB = parseInt(b.score || '0') || 0;
        return scoreB - scoreA;
      })
      .slice(0, 50);
    
    // Simple keyword extraction
    const extractKeywords = (text: string) => {
      if (!text) return [];
      
      // Remove common words and characters
      const cleanedText = text.replace(/[^\w\s\u4e00-\u9fff]/g, ' ');
      const words = cleanedText.split(/\s+/).filter(word => 
        word.length >= 2 && !['的', '了', '和', '与', '在', '是'].includes(word)
      );
      
      return words;
    };
    
    // Group related items by keywords/similarity
    const relatedGroups: Record<string, {
      items: typeof topItems,
      keywords: string[],
      platforms: Set<PlatformType>
    }> = {};
    
    topItems.forEach(item => {
      const keywords = extractKeywords(item.title || '');
      
      // Find existing group with overlapping keywords
      let matchedGroup = null;
      for (const [groupId, group] of Object.entries(relatedGroups)) {
        const overlap = keywords.filter(kw => 
          group.keywords.some(gkw => gkw.includes(kw) || kw.includes(gkw))
        );
        
        if (overlap.length >= 2 || (overlap.length >= 1 && keywords.length <= 3)) {
          matchedGroup = groupId;
          break;
        }
      }
      
      if (matchedGroup) {
        // Add to existing group
        relatedGroups[matchedGroup].items.push(item);
        relatedGroups[matchedGroup].platforms.add(item.platform);
        
        // Update keywords
        keywords.forEach(kw => {
          if (!relatedGroups[matchedGroup].keywords.includes(kw)) {
            relatedGroups[matchedGroup].keywords.push(kw);
          }
        });
      } else {
        // Create new group
        const groupId = `group_${Object.keys(relatedGroups).length}`;
        relatedGroups[groupId] = {
          items: [item],
          keywords,
          platforms: new Set([item.platform])
        };
      }
    });
    
    // Generate predictions from groups
    const results: PredictionResult[] = Object.values(relatedGroups)
      .filter(group => group.items.length >= 2 && group.platforms.size >= 2)
      .map(group => {
        // Select main topic
        const mainItem = group.items[0];
        
        // Calculate confidence score (0-100)
        // Factors: number of platforms, item scores, keyword overlap
        const platformFactor = Math.min(group.platforms.size / 5, 1) * 0.4;
        const scoreFactor = Math.min(
          group.items.reduce((sum, item) => sum + (parseInt(item.score || '0') || 0), 0) / 10000, 
          1
        ) * 0.4;
        const keywordFactor = Math.min(group.keywords.length / 10, 1) * 0.2;
        
        const confidence = Math.round((platformFactor + scoreFactor + keywordFactor) * 100);
        
        // Simulate growth score (-100 to 100)
        const growthScore = Math.round((Math.random() * 140) - 40);
        
        // Assign random category (in a real app would use NLP)
        const category = categories[Math.floor(Math.random() * categories.length)];
        
        // Generate related topics
        const relatedTopics = group.keywords
          .filter((_, i) => i < 5)
          .filter(kw => kw.length >= 2);
        
        return {
          topic: mainItem.title || '未知主题',
          keywords: group.keywords.slice(0, 5),
          confidence,
          relatedTopics,
          platformSource: Array.from(group.platforms),
          growthScore,
          category
        };
      })
      .sort((a, b) => b.confidence - a.confidence)
      .slice(0, 5);
    
    return results;
  }, [trendingData, timeFrame]);
  
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
        基于当前热点数据和历史趋势，预测未来{timeFrame === 'day' ? '24小时' : timeFrame === 'week' ? '7天' : '30天'}内可能持续升温的热门话题。
      </p>
      
      {predictions.length > 0 ? (
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
          趋势预测基于当前热点数据分析和简单的模拟算法，仅供参考。实际趋势可能受到多种因素影响而变化。
        </p>
      </div>
    </div>
  );
} 