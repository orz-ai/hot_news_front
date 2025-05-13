"use client";

import { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { PLATFORMS } from "../constants/platforms";
import PlatformCard from "../components/PlatformCard";
import TrendingItem from "../components/TrendingItem";
import LoadingSpinner from "../components/LoadingSpinner";
import TrendVisualization from "../components/TrendVisualization";
import WordCloudVisualization from "../components/WordCloudVisualization";
import TrendPrediction from "../components/TrendPrediction";
import { fetchTrendingData } from "../utils/api";
import { ApiResponse, PlatformType, TrendingItem as TrendingItemType } from "../types";

// Featured platforms to show on the homepage
const FEATURED_PLATFORMS: PlatformType[] = ['baidu', 'weibo', 'zhihu', 'bilibili', 'douyin', 'github'];

// 所有平台集合
const ALL_PLATFORMS: PlatformType[] = [
  'baidu', 'weibo', 'zhihu', 'bilibili', 'douyin', 'github', '36kr', 
  'shaoshupai', 'douban', 'hupu', 'tieba', 'juejin', 'v2ex', 
  'jinritoutiao', 'stackoverflow', 'hackernews'
];

// 动画变体
const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5 } }
};

// 定义热点主题/分类
const TOPIC_CATEGORIES = [
  { id: 'tech', name: '科技', color: '#10B981', icon: 'laptop-code', keywords: ['科技', '技术', '创新', '数字', '智能', '研发', 'AI', '人工智能', '算法', '编程'] },
  { id: 'entertainment', name: '娱乐', color: '#8B5CF6', icon: 'film', keywords: ['明星', '综艺', '电影', '剧集', '音乐', '艺人', '热搜', '爆料', '八卦'] },
  { id: 'social', name: '社会', color: '#3B82F6', icon: 'users', keywords: ['社会', '事件', '新闻', '政策', '热议', '事故', '热点', '话题', '公共', '民生'] },
  { id: 'finance', name: '财经', color: '#F59E0B', icon: 'chart-line', keywords: ['财经', '经济', '股市', '基金', '金融', '投资', '理财', '市场', '股票', '企业'] },
  { id: 'sports', name: '体育', color: '#EF4444', icon: 'running', keywords: ['体育', '赛事', '足球', '篮球', '比赛', '运动', '球员', '冠军', '联赛'] },
];

export default function Home() {
  const [trendingData, setTrendingData] = useState<Record<PlatformType, TrendingItemType[]>>({} as Record<PlatformType, TrendingItemType[]>);
  const [loading, setLoading] = useState<Record<PlatformType, boolean>>({} as Record<PlatformType, boolean>);
  const [allDataLoaded, setAllDataLoaded] = useState(false);
  const [dataLoadProgress, setDataLoadProgress] = useState(0);
  const [activePlatform, setActivePlatform] = useState<PlatformType>('baidu');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [timeRange, setTimeRange] = useState('24h');
  const [analysisView, setAnalysisView] = useState('topics');
  const [advancedView, setAdvancedView] = useState<'wordcloud' | 'prediction' | 'visualization'>('wordcloud');

  // 初始化加载状态
  useEffect(() => {
    const initialLoadingState = ALL_PLATFORMS.reduce((acc, platform) => {
      acc[platform] = true;
      return acc;
    }, {} as Record<PlatformType, boolean>);
    
    setLoading(initialLoadingState);
  }, []);

  // 获取所有平台数据
  useEffect(() => {
    const fetchData = async () => {
      let loadedCount = 0;
      
      // 确保数据加载进度更新
      const updateProgress = () => {
        loadedCount++;
        const progress = Math.round((loadedCount / ALL_PLATFORMS.length) * 100);
        setDataLoadProgress(progress);
        if (loadedCount === ALL_PLATFORMS.length) {
          setAllDataLoaded(true);
        }
      };
      
      // 并行加载所有平台数据
      const promises = ALL_PLATFORMS.map(async (platform) => {
        try {
          const response = await fetchTrendingData(platform);
          
          if (response.status === '200') {
            setTrendingData(prev => ({
              ...prev,
              [platform]: response.data
            }));
          }
        } catch (error) {
          console.error(`Error fetching ${platform} data:`, error);
        } finally {
          setLoading(prev => ({
            ...prev,
            [platform]: false
          }));
          updateProgress();
        }
      });
      
      await Promise.all(promises);
    };

    fetchData();
  }, []);

  // 获取跨平台热门关键词与主题
  const { hotKeywords, topicDistribution, correlatedTopics } = useMemo(() => {
    if (Object.keys(trendingData).length === 0) {
      return { 
        hotKeywords: [], 
        topicDistribution: [], 
        correlatedTopics: [] 
      };
    }

    // 从所有标题和描述提取文本
    const allContent = Object.values(trendingData)
      .flat()
      .map(item => {
        const title = item.title || '';
        const desc = item.desc || '';
        return { text: title + ' ' + desc, score: parseInt(item.score || '0') || 1 };
      });
    
    // 关键词提取和分类
    const keywords: Record<string, { count: number, score: number, categories: Record<string, number> }> = {};
    
    // 忽略的常见词
    const wordsToIgnore = new Set([
      '的', '了', '在', '是', '和', '与', '这', '那', '有', '将', '被', '对', '为', '从',
      '最新', '消息', '热门', '热点', '新闻', '发布', '报道', '揭秘', '曝光', '一个', '什么',
      '如何', '为什么', '可能', '终于', '突然', '原来', '真的', '官宣', '重磅', '首次'
    ]);
    
    // 处理所有文本内容
    allContent.forEach(({ text, score }) => {
      // 简单分词 (实际项目应使用专业分词库)
      const words = text.split(/[\s\!\.\,\:\;\?\(\)\[\]\{\}\"\'\，\。\！\？\：\；\（\）\【\】\「\」]/);
      
      words.forEach(word => {
        if (word.length >= 2 && !wordsToIgnore.has(word)) {
          if (!keywords[word]) {
            keywords[word] = { 
              count: 0, 
              score: 0,
              categories: {} 
            };
          }
          keywords[word].count += 1;
          keywords[word].score += score;
          
          // 识别关键词属于哪个类别
          TOPIC_CATEGORIES.forEach(category => {
            if (category.keywords.some(k => word.includes(k) || k.includes(word))) {
              keywords[word].categories[category.id] = (keywords[word].categories[category.id] || 0) + 1;
            }
          });
        }
      });
    });
    
    // 计算每个关键词的主要类别
    const keywordsWithMainCategory = Object.entries(keywords).map(([keyword, data]) => {
      // 找出最高频的类别
      let mainCategory = 'other';
      let maxCount = 0;
      
      Object.entries(data.categories).forEach(([category, count]) => {
        if (count > maxCount) {
          maxCount = count;
          mainCategory = category;
        }
      });
      
      // 如果没有匹配的类别，随机分配一个
      if (mainCategory === 'other' && TOPIC_CATEGORIES.length > 0) {
        const randomCategory = TOPIC_CATEGORIES[Math.floor(Math.random() * TOPIC_CATEGORIES.length)];
        mainCategory = randomCategory.id;
      }
      
      return {
        keyword,
        count: data.count,
        score: data.score,
        category: mainCategory
      };
    });
    
    // 获取热门关键词（按照得分和出现次数加权排序）
    const sortedKeywords = keywordsWithMainCategory
      .sort((a, b) => (b.score * b.count) - (a.score * a.count))
      .slice(0, 20);
    
    // 计算主题分布
    const topicCounts = TOPIC_CATEGORIES.map(category => {
      const keywordsInCategory = keywordsWithMainCategory.filter(k => k.category === category.id);
      const totalCount = keywordsInCategory.reduce((sum, k) => sum + k.count, 0);
      const totalScore = keywordsInCategory.reduce((sum, k) => sum + k.score, 0);
      
      return {
        id: category.id,
        name: category.name,
        color: category.color,
        count: totalCount,
        score: totalScore,
        percentage: 0 // 初始值，下面会计算
      };
    });
    
    // 计算百分比
    const totalTopicCount = topicCounts.reduce((sum, t) => sum + t.count, 0);
    topicCounts.forEach(topic => {
      topic.percentage = totalTopicCount > 0 ? (topic.count / totalTopicCount) * 100 : 0;
    });
    
    // 寻找相关联的主题词组
    const correlatedTopics: Array<{topics: string[], count: number, strength: number}> = [];
    
    // 简单实现：查找经常一起出现的关键词对
    const titleWords = Object.values(trendingData).flat().map(item => {
      const words = (item.title || '').split(/[\s\!\.\,\:\;\?\(\)\[\]\{\}\"\'\，\。\！\？\：\；\（\）\【\】\「\」]/)
        .filter(w => w.length >= 2 && !wordsToIgnore.has(w));
      return words;
    });
    
    // 查找共现词对
    const coOccurrences: Record<string, {count: number, words: string[]}> = {};
    
    titleWords.forEach(words => {
      // 找出所有可能的词对
      for (let i = 0; i < words.length; i++) {
        for (let j = i + 1; j < words.length; j++) {
          const word1 = words[i];
          const word2 = words[j];
          
          if (word1 !== word2) {
            // 确保词对排序一致
            const wordPair = [word1, word2].sort().join('_');
            
            if (!coOccurrences[wordPair]) {
              coOccurrences[wordPair] = {
                count: 0,
                words: [word1, word2]
              };
            }
            
            coOccurrences[wordPair].count++;
          }
        }
      }
    });
    
    // 选出出现频率最高的词对
    const topCoOccurrences = Object.values(coOccurrences)
      .sort((a, b) => b.count - a.count)
      .slice(0, 8)
      .map(item => ({
        topics: item.words,
        count: item.count,
        strength: item.count / Math.max(1, titleWords.length * 0.1) // 归一化强度
      }));
    
    return { 
      hotKeywords: sortedKeywords, 
      topicDistribution: topicCounts.sort((a, b) => b.count - a.count), 
      correlatedTopics: topCoOccurrences 
    };
  }, [trendingData]);
  
  // 平台热度对比和时序分析
  const { platformHotness, timeBasedTrends } = useMemo(() => {
    // 平台热度排名
    const hotness = ALL_PLATFORMS.map(code => {
      const platform = PLATFORMS.find(p => p.code === code);
      const items = trendingData[code] || [];
      const itemCount = items.length;
      
      // 计算总热度和平均热度
      const totalScore = items.reduce((sum, item) => {
        const score = parseInt(item.score || '0') || 0;
        return sum + score;
      }, 0);
      
      // 热度增长率（简单模拟 - 实际中应该比较历史数据）
      // 这里使用随机值模拟，实际项目应当使用真实的变化率
      const growthRate = (Math.random() * 20) - 10; // -10% 到 +10% 之间的随机值
      
      return {
        code,
        name: platform?.name || code,
        color: platform?.color || '#3b76ea',
        iconUrl: platform?.icon,
        itemCount,
        totalScore,
        avgScore: itemCount > 0 ? Math.round(totalScore / itemCount) : 0,
        growthRate
      };
    }).filter(p => p.itemCount > 0) // 过滤掉没有数据的平台
      .sort((a, b) => b.totalScore - a.totalScore);
    
    // 时序趋势分析（基于发布时间）
    // 注：此处简单模拟，实际应根据真实的发布时间进行分析
    const timeFrames = {
      'morning': { label: '上午', count: 0, percentage: 0 },
      'afternoon': { label: '下午', count: 0, percentage: 0 },
      'evening': { label: '晚上', count: 0, percentage: 0 },
      'night': { label: '凌晨', count: 0, percentage: 0 }
    };
    
    // 模拟时间分布 (在实际项目中应使用真实数据的pubDate)
    let totalItems = 0;
    Object.values(trendingData).forEach(items => {
      items.forEach(item => {
        totalItems++;
        // 模拟发布时间分布 (实际项目应解析真实的pubDate)
        const rand = Math.random();
        if (rand < 0.3) timeFrames.morning.count++;
        else if (rand < 0.6) timeFrames.afternoon.count++;
        else if (rand < 0.85) timeFrames.evening.count++;
        else timeFrames.night.count++;
      });
    });
    
    // 计算百分比
    Object.values(timeFrames).forEach(frame => {
      frame.percentage = totalItems > 0 ? (frame.count / totalItems) * 100 : 0;
    });
    
    return { platformHotness: hotness, timeBasedTrends: timeFrames };
  }, [trendingData]);
  
  // 内容交叉关联分析
  const crossPlatformTrends = useMemo(() => {
    if (Object.keys(trendingData).length < 2) return [];
    
    // 查找跨平台的相似内容
    const trends: Array<{topic: string, platforms: string[], totalHeat: number, matches: TrendingItemType[]}> = [];
    const processedTitles = new Set();
    
    // 简单的相似度匹配（实际项目应使用更复杂的文本相似度算法）
    const findSimilarTitle = (title: string, threshold = 0.5) => {
      if (processedTitles.has(title)) return null;
      
      const titleTokens = title.split(/[\s\!\.\,\:\;\?\(\)\[\]\{\}\"\'\，\。\！\？\：\；\（\）\【\】\「\」]/)
        .filter(w => w.length >= 2)
        .map(w => w.toLowerCase());
      
      const matches: Array<{platform: string, item: TrendingItemType, similarity: number}> = [];
      
      // 检查每个平台的内容
      Object.entries(trendingData).forEach(([platform, items]) => {
        items.forEach(item => {
          // 跳过自己
          if (item.title === title) return;
          if (processedTitles.has(item.title)) return;
          
          const itemTokens = (item.title || '').split(/[\s\!\.\,\:\;\?\(\)\[\]\{\}\"\'\，\。\！\？\：\；\（\）\【\】\「\」]/)
            .filter(w => w.length >= 2)
            .map(w => w.toLowerCase());
          
          // 计算共同词的数量
          const commonTokens = titleTokens.filter(token => 
            itemTokens.some(itemToken => 
              itemToken.includes(token) || token.includes(itemToken)
            )
          );
          
          // 计算相似度（简单的Jaccard相似度）
          const similarity = commonTokens.length / 
            (titleTokens.length + itemTokens.length - commonTokens.length);
          
          if (similarity >= threshold) {
            matches.push({
              platform,
              item,
              similarity
            });
          }
        });
      });
      
      return matches.length > 0 ? matches : null;
    };
    
    // 处理所有平台数据
    Object.entries(trendingData).forEach(([sourcePlatform, items]) => {
      items.forEach(sourceItem => {
        const title = sourceItem.title;
        if (!title || processedTitles.has(title)) return;
        
        const matches = findSimilarTitle(title);
        if (matches) {
          // 标记所有匹配的标题为已处理
          processedTitles.add(title);
          matches.forEach(m => processedTitles.add(m.item.title || ''));
          
          // 计算总热度
          const totalHeat = parseInt(sourceItem.score || '0') + 
            matches.reduce((sum, m) => sum + parseInt(m.item.score || '0'), 0);
          
          // 收集所有相关平台
          const platforms = [sourcePlatform, ...matches.map(m => m.platform)];
          
          // 收集所有匹配项
          const allMatches = [sourceItem, ...matches.map(m => m.item)];
          
          trends.push({
            topic: title,
            platforms: [...new Set(platforms)], // 去重
            totalHeat,
            matches: allMatches
          });
        }
      });
    });
    
    // 按照跨平台数量和总热度排序
    return trends
      .sort((a, b) => {
        // 首先按平台数量排序
        const platformDiff = b.platforms.length - a.platforms.length;
        // 如果平台数量相同，按热度排序
        return platformDiff !== 0 ? platformDiff : b.totalHeat - a.totalHeat;
      })
      .slice(0, 5); // 只返回前5个
  }, [trendingData]);
  
  // 获取活跃平台信息
  const activePlatformInfo = PLATFORMS.find(p => p.code === activePlatform);

  return (
    <>
      {/* Hero Section */}
      <section className="mb-16 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center max-w-4xl mx-auto"
        >
          <div className="inline-block mb-6 bg-gradient-to-r from-primary-100 to-secondary-100 dark:from-primary-900/30 dark:to-secondary-900/30 px-6 py-2 rounded-full">
            <span className="text-sm font-medium bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent">
              汇聚17个平台的实时热点内容
            </span>
          </div>
          
          <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
            <span className="bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent">
              全网热点
            </span>
            <span className="text-gray-900 dark:text-white"> 一站速览</span>
          </h1>
          
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-10 max-w-3xl mx-auto leading-relaxed">
            每30分钟自动更新，让您随时了解全网最新热门话题、事件和趋势。
          </p>
          
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link 
              href="/all" 
              className="px-8 py-4 bg-gradient-to-r from-primary-600 to-primary-700 text-white font-medium rounded-xl hover:shadow-lg hover:shadow-primary-500/20 transform hover:-translate-y-1 transition-all duration-300"
            >
              浏览全部平台
            </Link>
            <Link 
              href="/about" 
              className="px-8 py-4 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-100 font-medium rounded-xl hover:shadow-md transform hover:-translate-y-1 transition-all duration-300"
            >
              了解更多
            </Link>
          </div>
        </motion.div>
      </section>

      {/* Featured Platforms */}
      <section className="mb-24">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">精选平台</h2>
          <Link href="/all" className="text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 font-medium flex items-center">
            查看全部
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
        
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {PLATFORMS.filter(platform => FEATURED_PLATFORMS.includes(platform.code))
            .map((platform, index) => (
              <motion.div key={platform.code} variants={itemVariants}>
                <PlatformCard platform={platform} index={index} />
              </motion.div>
            ))}
        </motion.div>
      </section>

      {/* 热点聚合分析 */}
      <section className="mb-16">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6 gap-4">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">热点聚合分析</h2>
          
          {!allDataLoaded && (
            <div className="w-full md:w-auto flex items-center gap-3">
              <div className="flex-grow md:w-64 bg-gray-200 dark:bg-gray-700 rounded-full h-2.5 overflow-hidden">
                <div 
                  className="bg-primary-600 h-2.5 rounded-full" 
                  style={{ width: `${dataLoadProgress}%`, transition: "width 0.5s ease-in-out" }}
                ></div>
              </div>
              <span className="text-sm text-gray-500 dark:text-gray-400 whitespace-nowrap">
                {dataLoadProgress}% 已加载
              </span>
            </div>
          )}
          
          {allDataLoaded && (
            <div className="flex items-center gap-3 flex-wrap">
              <div className="flex p-1 bg-gray-100 dark:bg-gray-800 rounded-lg">
                <button
                  onClick={() => setAnalysisView('topics')}
                  className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${
                    analysisView === 'topics' 
                      ? 'bg-white dark:bg-gray-700 shadow-sm text-primary-600 dark:text-primary-400' 
                      : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
                  }`}
                >
                  主题分析
                </button>
                <button
                  onClick={() => setAnalysisView('platforms')}
                  className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${
                    analysisView === 'platforms' 
                      ? 'bg-white dark:bg-gray-700 shadow-sm text-primary-600 dark:text-primary-400' 
                      : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
                  }`}
                >
                  平台对比
                </button>
                <button
                  onClick={() => setAnalysisView('crossplatform')}
                  className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${
                    analysisView === 'crossplatform' 
                      ? 'bg-white dark:bg-gray-700 shadow-sm text-primary-600 dark:text-primary-400' 
                      : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
                  }`}
                >
                  跨平台热点
                </button>
                <button
                  onClick={() => setAnalysisView('advanced')}
                  className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${
                    analysisView === 'advanced' 
                      ? 'bg-white dark:bg-gray-700 shadow-sm text-primary-600 dark:text-primary-400' 
                      : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
                  }`}
                >
                  高级分析
                </button>
              </div>
              
              <div className="relative inline-block">
                <button 
                  className="flex items-center gap-2 px-3 py-2 text-sm font-medium bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors"
                  onClick={() => {
                    const newTimeRange = timeRange === '24h' ? 'week' : timeRange === 'week' ? 'month' : '24h';
                    setTimeRange(newTimeRange);
                  }}
                >
                  <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>
                    {timeRange === '24h' ? '24小时内' : timeRange === 'week' ? '本周内' : '本月内'}
                  </span>
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
            <p className="text-lg font-medium text-gray-700 dark:text-gray-300 mb-2">正在处理全网热点数据</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              正在从{ALL_PLATFORMS.length}个平台获取数据并进行深度分析...
            </p>
          </div>
        ) : (
          <>
            {/* 主题分析视图 */}
            {analysisView === 'topics' && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* 热门关键词 */}
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-card overflow-hidden border border-gray-100 dark:border-gray-700">
                  <div className="px-6 py-5 border-b border-gray-100 dark:border-gray-700 flex flex-wrap justify-between items-center gap-3">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">热门关键词</h3>
                    
                    <div className="flex flex-wrap gap-2">
                      <button 
                        onClick={() => setSelectedCategory('all')} 
                        className={`px-3 py-1 text-xs rounded-full transition-all ${
                          selectedCategory === 'all' 
                            ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400' 
                            : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                        }`}
                      >
                        全部
                      </button>
                      
                      {TOPIC_CATEGORIES.map(category => (
                        <button
                          key={category.id}
                          onClick={() => setSelectedCategory(category.id)}
                          className="px-3 py-1 text-xs rounded-full transition-all"
                          style={{
                            backgroundColor: selectedCategory === category.id ? `${category.color}15` : 'rgba(229, 231, 235, var(--tw-bg-opacity))',
                            color: selectedCategory === category.id ? category.color : 'rgba(75, 85, 99, var(--tw-text-opacity))'
                          }}
                        >
                          {category.name}
                        </button>
                      ))}
                    </div>
                  </div>
                  
                  <div className="p-6">
                    <div className="flex flex-wrap gap-3">
                      {hotKeywords
                        .filter(k => selectedCategory === 'all' || k.category === selectedCategory)
                        .map((item) => {
                          const category = TOPIC_CATEGORIES.find(c => c.id === item.category);
                          const fontSize = Math.min(100 + (item.count * 5), 160); // 根据出现次数调整大小
                          
                          return (
                            <div 
                              key={item.keyword} 
                              className="px-4 py-2 rounded-lg hover:shadow-md transition-all duration-300 hover:-translate-y-1 cursor-pointer"
                              style={{
                                backgroundColor: `${category?.color}15`,
                                borderLeft: `3px solid ${category?.color}`
                              }}
                            >
                              <div className="flex items-center gap-1.5">
                                <span 
                                  className="font-medium" 
                                  style={{ 
                                    color: category?.color,
                                    fontSize: `${fontSize}%`
                                  }}
                                >
                                  {item.keyword}
                                </span>
                                <span className="text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-1.5 py-0.5 rounded-full">
                                  {item.count}
                                </span>
                              </div>
                            </div>
                          );
                        })}
                    </div>
                  </div>
                </div>
                
                {/* 主题分布 */}
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-card overflow-hidden border border-gray-100 dark:border-gray-700">
                  <div className="px-6 py-5 border-b border-gray-100 dark:border-gray-700">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">热点主题分布</h3>
                  </div>
                  
                  <div className="p-6">
                    <div className="grid grid-cols-2 gap-6 mb-6">
                      {topicDistribution.slice(0, 4).map((topic, index) => (
                        <div key={topic.id} className="flex flex-col">
                          <div className="flex justify-between items-center mb-2">
                            <span className="text-sm font-medium" style={{ color: topic.color }}>
                              {topic.name}
                            </span>
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                              {topic.percentage.toFixed(1)}%
                            </span>
                          </div>
                          <div className="h-2 w-full bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                            <div 
                              className="h-full transition-all duration-1000 ease-out"
                              style={{ 
                                width: `${topic.percentage}%`,
                                backgroundColor: topic.color
                              }}
                            ></div>
                          </div>
                        </div>
                      ))}
                    </div>
                    
                    <div className="border-t border-gray-100 dark:border-gray-800 pt-6">
                      <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">相关主题词组</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {correlatedTopics.map((item, index) => (
                          <div 
                            key={index}
                            className="bg-gray-50 dark:bg-gray-800/60 p-3 rounded-lg border border-gray-100 dark:border-gray-700"
                          >
                            <div className="flex items-center gap-2 mb-2">
                              {item.topics.map((topic, i) => (
                                <span 
                                  key={i}
                                  className="font-medium text-sm"
                                  style={{ 
                                    color: TOPIC_CATEGORIES[i % TOPIC_CATEGORIES.length].color
                                  }}
                                >
                                  {topic}{i < item.topics.length - 1 ? ' + ' : ''}
                                </span>
                              ))}
                            </div>
                            <div className="flex items-center gap-2">
                              <div className="flex-grow h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                                <div 
                                  className="h-full bg-primary-500"
                                  style={{ width: `${Math.min(item.strength * 100, 100)}%` }}
                                ></div>
                              </div>
                              <span className="text-xs text-gray-500 dark:text-gray-400">
                                {item.count}次共现
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            {/* 平台对比视图 */}
            {analysisView === 'platforms' && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* 平台热度排行 */}
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-card overflow-hidden border border-gray-100 dark:border-gray-700">
                  <div className="px-6 py-5 border-b border-gray-100 dark:border-gray-700">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">平台热度排行</h3>
                  </div>
                  
                  <div className="p-6">
                    <div className="space-y-5">
                      {platformHotness.slice(0, 8).map((platform, index) => (
                        <div key={platform.code} className="group">
                          <div className="flex items-center gap-3 mb-2">
                            <div 
                              className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-lg text-white font-medium shadow-sm group-hover:shadow-md transition-all duration-300"
                              style={{ 
                                background: `linear-gradient(135deg, ${platform.color}, ${adjustColor(platform.color, -20)})`,
                                transform: "translateZ(0)"
                              }}
                            >
                              {index + 1}
                            </div>
                            
                            <h4 className="text-base font-medium text-gray-800 dark:text-gray-200 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                              {platform.name}
                            </h4>
                            
                            <div className="ml-auto flex gap-2 items-center">
                              <span 
                                className={`text-xs px-2 py-0.5 rounded-full flex items-center ${
                                  platform.growthRate > 0 
                                    ? 'bg-green-100 dark:bg-green-900/20 text-green-600 dark:text-green-400' 
                                    : 'bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400'
                                }`}
                              >
                                {platform.growthRate > 0 ? '+' : ''}{platform.growthRate.toFixed(1)}%
                              </span>
                              
                              <span 
                                className="text-sm px-2.5 py-1 rounded-full"
                                style={{ 
                                  backgroundColor: `${platform.color}15`,
                                  color: platform.color
                                }}
                              >
                                热度 {formatNumber(platform.totalScore.toString())}
                              </span>
                            </div>
                          </div>
                          
                          <div className="h-2 w-full bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                            <div 
                              className="h-full transition-all duration-1000 ease-out"
                              style={{ 
                                width: `${(platform.totalScore / platformHotness[0].totalScore) * 100}%`,
                                background: `linear-gradient(to right, ${platform.color}, ${adjustColor(platform.color, 20)})`
                              }}
                            ></div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                
                {/* 热点时间分布 */}
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-card overflow-hidden border border-gray-100 dark:border-gray-700">
                  <div className="px-6 py-5 border-b border-gray-100 dark:border-gray-700">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">热点时间分布</h3>
                  </div>
                  
                  <div className="p-6">
                    <div className="flex flex-col gap-8">
                      {/* 时间段分布 */}
                      <div>
                        <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-4">一天内热点发布时段分布</h4>
                        
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                          {Object.entries(timeBasedTrends).map(([timeKey, data]) => (
                            <div 
                              key={timeKey}
                              className="bg-gray-50 dark:bg-gray-800/60 p-4 rounded-lg border border-gray-100 dark:border-gray-700"
                            >
                              <div className="text-center">
                                <span className="block text-xl font-bold text-gray-800 dark:text-gray-200 mb-1">
                                  {data.percentage.toFixed(1)}%
                                </span>
                                <span className="block text-sm text-gray-500 dark:text-gray-400">
                                  {data.label}
                                </span>
                                <div className="mt-3 w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                                  <div 
                                    className="h-full bg-primary-600"
                                    style={{ width: `${data.percentage}%` }}
                                  ></div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                      
                      {/* 平台更新频率信息 */}
                      <div className="border-t border-gray-100 dark:border-gray-700 pt-5">
                        <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">平台更新频率</h4>
                        
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                          {platformHotness.slice(0, 6).map((platform) => {
                            const platformInfo = PLATFORMS.find(p => p.code === platform.code);
                            
                            return (
                              <div 
                                key={platform.code}
                                className="flex items-center gap-2 text-sm py-2 px-3 rounded-lg transition-colors hover:bg-gray-50 dark:hover:bg-gray-750"
                              >
                                <span 
                                  className="w-2 h-2 rounded-full" 
                                  style={{ backgroundColor: platform.color }}
                                ></span>
                                <span className="text-gray-700 dark:text-gray-300">{platform.name}</span>
                                <span className="ml-auto text-xs text-gray-500 dark:text-gray-400">
                                  {platformInfo?.updateFrequency || '未知'}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            {/* 跨平台热点视图 */}
            {analysisView === 'crossplatform' && (
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-card overflow-hidden border border-gray-100 dark:border-gray-700">
                <div className="px-6 py-5 border-b border-gray-100 dark:border-gray-700">
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white">跨平台热点事件</h3>
                </div>
                
                <div className="divide-y divide-gray-100 dark:divide-gray-700">
                  {crossPlatformTrends.length > 0 ? (
                    crossPlatformTrends.map((trend, index) => (
                      <div key={index} className="p-6">
                        <div className="flex flex-wrap items-center gap-3 mb-4">
                          <h4 className="text-lg font-medium text-gray-800 dark:text-gray-200">
                            {trend.topic}
                          </h4>
                          
                          <div className="flex items-center gap-2 ml-auto">
                            <span className="text-xs bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 px-2.5 py-1 rounded-full">
                              {trend.platforms.length}个平台
                            </span>
                            <span className="text-xs bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 px-2.5 py-1 rounded-full">
                              热度 {formatNumber(trend.totalHeat.toString())}
                            </span>
                          </div>
                        </div>
                        
                        <div className="flex flex-wrap gap-2 mb-4">
                          {trend.platforms.map(platformCode => {
                            const platform = PLATFORMS.find(p => p.code === platformCode);
                            return (
                              <span 
                                key={platformCode}
                                className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium"
                                style={{ 
                                  backgroundColor: `${platform?.color || '#3b76ea'}15`,
                                  color: platform?.color || '#3b76ea'
                                }}
                              >
                                {platform?.name || platformCode}
                              </span>
                            );
                          })}
                        </div>
                        
                        <div className="space-y-3">
                          {trend.matches.slice(0, 3).map((item, i) => (
                            <a 
                              key={i}
                              href={item.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="block p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors border border-gray-100 dark:border-gray-700"
                            >
                              <div className="flex gap-3">
                                <div className="flex-grow">
                                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                    {item.title}
                                  </p>
                                  
                                  {item.desc && (
                                    <p className="mt-1 text-xs text-gray-500 dark:text-gray-400 line-clamp-1">
                                      {item.desc}
                                    </p>
                                  )}
                                </div>
                                
                                <div className="flex-shrink-0 flex items-center text-gray-400 dark:text-gray-500">
                                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                  </svg>
                                </div>
                              </div>
                            </a>
                          ))}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="p-12 text-center">
                      <p className="text-gray-500 dark:text-gray-400">暂无跨平台热点数据</p>
                    </div>
                  )}
                </div>
              </div>
            )}
            
            {/* 高级分析视图 */}
            {analysisView === 'advanced' && (
              <div className="space-y-6">
                {/* 高级分析标签页 */}
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-card overflow-hidden border border-gray-100 dark:border-gray-700 p-6">
                  <div className="flex flex-wrap justify-center gap-3 mb-6">
                    <div className="flex p-1 bg-gray-100 dark:bg-gray-700 rounded-lg">
                      <button 
                        onClick={() => setAdvancedView('wordcloud')}
                        className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${
                          advancedView === 'wordcloud'
                            ? 'bg-white dark:bg-gray-600 shadow-sm text-primary-600 dark:text-primary-400'
                            : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
                        }`}
                      >
                        关键词云图
                      </button>
                      <button 
                        onClick={() => setAdvancedView('visualization')}
                        className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${
                          advancedView === 'visualization'
                            ? 'bg-white dark:bg-gray-600 shadow-sm text-primary-600 dark:text-primary-400'
                            : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
                        }`}
                      >
                        数据可视化
                      </button>
                      <button 
                        onClick={() => setAdvancedView('prediction')}
                        className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${
                          advancedView === 'prediction'
                            ? 'bg-white dark:bg-gray-600 shadow-sm text-primary-600 dark:text-primary-400'
                            : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
                        }`}
                      >
                        趋势预测
                      </button>
                    </div>
                  </div>
                  
                  <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
                    高级数据分析工具可帮助您深入了解各平台热点内容的模式和趋势，发现隐藏的关联和未来可能的发展方向。
                  </p>
                </div>
                
                {/* 词云可视化 */}
                {advancedView === 'wordcloud' && (
                  <WordCloudVisualization 
                    trendingData={trendingData} 
                  />
                )}
                
                {/* 数据可视化 */}
                {advancedView === 'visualization' && (
                  <TrendVisualization 
                    trendingData={trendingData}
                    timeRange={timeRange}
                  />
                )}
                
                {/* 趋势预测 */}
                {advancedView === 'prediction' && (
                  <TrendPrediction 
                    trendingData={trendingData}
                  />
                )}
              </div>
            )}
          </>
        )}
      </section>

      {/* 热点趋势预测 - New Feature Section */}
      <section className="mb-24">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
            热点趋势预测
            <span className="ml-2 text-xs px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full">
              新功能
            </span>
          </h2>
          
          <div>
            <a 
              href="#" 
              className="text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 font-medium flex items-center"
            >
              了解更多
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </a>
          </div>
        </div>
        
        {allDataLoaded ? (
          <TrendPrediction trendingData={trendingData} />
        ) : (
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-card p-12 flex flex-col items-center justify-center border border-gray-100 dark:border-gray-700">
            <LoadingSpinner size="lg" className="mb-4" />
            <p className="text-lg font-medium text-gray-700 dark:text-gray-300 mb-2">正在准备热点趋势预测</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              我们正在对全网热点数据进行高级分析，请稍候...
            </p>
          </div>
        )}
      </section>
    </>
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

// 辅助函数: 调整颜色深浅
function adjustColor(color: string, amount: number): string {
  // 如果是十六进制颜色
  if (color.startsWith('#')) {
    let hex = color.slice(1);
    
    // 将3位颜色转换为6位
    if (hex.length === 3) {
      hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
    }
    
    // 转换为RGB
    const r = parseInt(hex.slice(0, 2), 16);
    const g = parseInt(hex.slice(2, 4), 16);
    const b = parseInt(hex.slice(4, 6), 16);
    
    // 调整RGB值
    const newR = Math.max(0, Math.min(255, r + amount));
    const newG = Math.max(0, Math.min(255, g + amount));
    const newB = Math.max(0, Math.min(255, b + amount));
    
    // 转回十六进制
    return `#${newR.toString(16).padStart(2, '0')}${newG.toString(16).padStart(2, '0')}${newB.toString(16).padStart(2, '0')}`;
  }
  
  // 返回原始颜色
  return color;
}
