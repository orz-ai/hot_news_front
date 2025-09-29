"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { PLATFORMS } from "../constants/platforms";
import PlatformCard from "../components/PlatformCard";
import TrendingItem from "../components/TrendingItem";
import LoadingSpinner from "../components/LoadingSpinner";
import TrendVisualization from "../components/TrendVisualization";
import WordCloudVisualization from "../components/WordCloudVisualization";
import TrendPrediction from "../components/TrendPrediction";
import TopicHeatVisualization from "../components/TopicHeatVisualization";
import SettingsModal from "../components/SettingsModal";
import { useSettings } from "../hooks/useSettings";
import { fetchTrendingData, fetchAnalysisData, fetchPlatformComparisonData, fetchCrossPlatformData, fetchMultiPlatformData } from "../utils/api";
import { ApiResponse, PlatformType, TrendingItem as TrendingItemType, HotKeyword, TopicDistribution, RelatedTopicGroup, PlatformRanking, TimeDistribution, CommonTopic } from "../types";

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

// 检测是否是中文字符
const isChineseChar = (char: string): boolean => {
  const code = char.charCodeAt(0);
  return (
    (code >= 0x4e00 && code <= 0x9fff) || // CJK统一汉字
    (code >= 0x3400 && code <= 0x4dbf) || // CJK扩展A
    (code >= 0xf900 && code <= 0xfaff)    // CJK兼容汉字
  );
};

// 忽略的常见词
const COMMON_STOP_WORDS = new Set([
  '的', '了', '在', '是', '和', '与', '这', '那', '有', '将', '被', '对', '为', '从', '到', '上', '下', '中',
  '最新', '消息', '热门', '热点', '新闻', '发布', '报道', '揭秘', '曝光', '一个', '什么', '来', '去',
  '如何', '为什么', '可能', '终于', '突然', '原来', '真的', '官宣', '重磅', '首次', '都', '每',
  '让', '把', '能', '说', '要', '会', '我', '你', '他', '她', '它', '他们', '她们', '它们',

  // 常见英文单词作为额外过滤
  'the', 'of', 'to', 'and', 'a', 'in', 'is', 'it', 'that', 'for', 'you', 'was', 'on',
  'with', 'as', 'his', 'they', 'at', 'be', 'this', 'have', 'from', 'or', 'one', 'had', 'by',
  'but', 'what', 'all', 'were', 'we', 'when', 'your', 'can', 'said', 'there', 'how', 'has',
  'who', 'will', 'more', 'no', 'would', 'should', 'could', 'if', 'my', 'than', 'first',
  'been', 'do', 'its', 'their', 'not', 'now', 'after', 'other', 'into', 'just', 'an'
]);

// 验证是否是有效的中文词
const isValidChineseWord = (word: string): boolean => {
  // 长度至少为2
  if (word.length < 2) return false;

  // 必须全部是中文字符
  for (let i = 0; i < word.length; i++) {
    if (!isChineseChar(word[i])) return false;
  }

  // 不能含有英文字母、数字或特殊字符
  if (/[a-zA-Z0-9\s.,!?:;'"()[\]{}\/\\<>@#$%^&*+=|~`-]/.test(word)) return false;

  // 不能是停用词
  if (COMMON_STOP_WORDS.has(word)) return false;

  return true;
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
  // 使用设置Hook
  const { settings, saveSettings, getFeaturedPlatforms } = useSettings();
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const [trendingData, setTrendingData] = useState<Record<PlatformType, TrendingItemType[]>>({} as Record<PlatformType, TrendingItemType[]>);
  const [loading, setLoading] = useState<Record<PlatformType, boolean>>({} as Record<PlatformType, boolean>);
  const [allDataLoaded, setAllDataLoaded] = useState(false);
  const [dataLoadProgress, setDataLoadProgress] = useState(0);
  const [activePlatform, setActivePlatform] = useState<PlatformType>('baidu');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [timeRange, setTimeRange] = useState('24h');
  const [analysisView, setAnalysisView] = useState('topics');
  const [showBackToTop, setShowBackToTop] = useState(false);

  // 获取用户设置的精选平台 - 现在是缓存的值而不是函数调用
  const featuredPlatforms = getFeaturedPlatforms;

  // 根据用户设置的顺序对平台进行排序
  const sortedPlatforms = useMemo(() => {
    const platformsToShow = PLATFORMS.filter(platform => featuredPlatforms.includes(platform.code));

    // 根据设置中的平台顺序进行排序
    return platformsToShow.sort((a, b) => {
      const indexA = settings.platformOrder.indexOf(a.code);
      const indexB = settings.platformOrder.indexOf(b.code);

      // 如果平台不在排序列表中，放到最后
      if (indexA === -1 && indexB === -1) return 0;
      if (indexA === -1) return 1;
      if (indexB === -1) return -1;

      return indexA - indexB;
    });
  }, [featuredPlatforms, settings.platformOrder]);

  // 分析数据状态
  const [analysisData, setAnalysisData] = useState<{
    hotKeywords: HotKeyword[],
    topicDistribution: TopicDistribution[],
    relatedTopicGroups: RelatedTopicGroup[],
    isLoading: boolean
  }>({
    hotKeywords: [],
    topicDistribution: [],
    relatedTopicGroups: [],
    isLoading: true
  });

  // 平台对比数据状态
  const [platformComparisonData, setPlatformComparisonData] = useState<{
    platformRankings: PlatformRanking[],
    timeDistribution: {
      morning: TimeDistribution,
      afternoon: TimeDistribution,
      evening: TimeDistribution,
      night: TimeDistribution
    },
    isLoading: boolean
  }>({
    platformRankings: [],
    timeDistribution: {
      morning: { label: '上午', percentage: 0 },
      afternoon: { label: '下午', percentage: 0 },
      evening: { label: '晚上', percentage: 0 },
      night: { label: '凌晨', percentage: 0 }
    },
    isLoading: true
  });

  // 跨平台数据状态
  const [crossPlatformData, setCrossPlatformData] = useState<{
    commonTopics: CommonTopic[],
    isLoading: boolean
  }>({
    commonTopics: [],
    isLoading: true
  });

  // 初始化加载状态
  useEffect(() => {
    const initialLoadingState = featuredPlatforms.reduce((acc, platform) => {
      acc[platform] = true;
      return acc;
    }, {} as Record<PlatformType, boolean>);

    setLoading(initialLoadingState);
  }, [featuredPlatforms]);

  // 获取所有平台数据
  useEffect(() => {
    const fetchData = async () => {
      try {
        // 只获取首页需要显示的精选平台数据，而不是所有平台
        const response = await fetchMultiPlatformData(featuredPlatforms);

        // 更新每个平台的数据和加载状态
        let loadedCount = 0;

        // 处理每个平台的响应
        Object.entries(response).forEach(([platform, platformResponse]) => {
          const platformCode = platform as PlatformType;

          if (platformResponse.status === '200') {
            setTrendingData(prev => ({
              ...prev,
              [platformCode]: platformResponse.data
            }));
          }

          setLoading(prev => ({
            ...prev,
            [platformCode]: false
          }));

          loadedCount++;
        });

        // 更新加载进度
        const progress = Math.round((loadedCount / featuredPlatforms.length) * 100);
        setDataLoadProgress(progress);

        // 如果所有精选平台都已加载，设置allDataLoaded为true
        if (loadedCount === featuredPlatforms.length) {
          setAllDataLoaded(true);
        }
      } catch (error) {
        console.error('Error fetching platform data:', error);

        // 如果出错，将所有平台的加载状态设为false
        const updatedLoadingState = { ...loading };
        featuredPlatforms.forEach(platform => {
          updatedLoadingState[platform] = false;
        });
        setLoading(updatedLoadingState);
      }
    };

    fetchData();
  }, [featuredPlatforms]);

  // 获取分析数据
  useEffect(() => {
    const getAnalysisData = async () => {
      try {
        const response = await fetchAnalysisData('main');
        if (response.status === 'success') {
          setAnalysisData({
            hotKeywords: response.hot_keywords,
            topicDistribution: response.topic_distribution,
            relatedTopicGroups: response.related_topic_groups,
            isLoading: false
          });
        } else {
          console.error('Failed to fetch analysis data:', response.msg);
          setAnalysisData(prev => ({ ...prev, isLoading: false }));
        }
      } catch (error) {
        console.error('Error fetching analysis data:', error);
        setAnalysisData(prev => ({ ...prev, isLoading: false }));
      }
    };

    if (allDataLoaded) {
      getAnalysisData();
    }
  }, [allDataLoaded]);

  // 获取平台对比数据
  useEffect(() => {
    const getPlatformComparisonData = async () => {
      try {
        const response = await fetchPlatformComparisonData();
        if (response.status === 'success') {
          setPlatformComparisonData({
            platformRankings: response.platform_rankings,
            timeDistribution: response.platform_update_frequency.overall,
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

    if (allDataLoaded) {
      getPlatformComparisonData();
    }
  }, [allDataLoaded]);

  // 获取跨平台热点数据
  useEffect(() => {
    const getCrossPlatformData = async () => {
      try {
        const response = await fetchCrossPlatformData();
        if (response.status === 'success') {
          setCrossPlatformData({
            commonTopics: response.common_topics,
            isLoading: false
          });
        } else {
          console.error('Failed to fetch cross-platform data:', response.msg);
          setCrossPlatformData(prev => ({ ...prev, isLoading: false }));
        }
      } catch (error) {
        console.error('Error fetching cross-platform data:', error);
        setCrossPlatformData(prev => ({ ...prev, isLoading: false }));
      }
    };

    if (allDataLoaded) {
      getCrossPlatformData();
    }
  }, [allDataLoaded]);

  // 将数据存储到localStorage以便搜索功能使用
  useEffect(() => {
    // 检查数据是否已加载完成
    if (allDataLoaded && Object.keys(trendingData).length > 0) {
      try {
        // 将数据存储到localStorage中
        localStorage.setItem('trendingData', JSON.stringify(trendingData));
        console.log('热点数据已保存到localStorage，可用于搜索');
      } catch (error) {
        console.error('保存数据到localStorage失败:', error);
      }
    }
  }, [allDataLoaded, trendingData]);

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
    const trends: Array<{ topic: string, platforms: string[], totalHeat: number, matches: TrendingItemType[] }> = [];
    const processedTitles = new Set();

    // 简单的相似度匹配（实际项目应使用更复杂的文本相似度算法）
    const findSimilarTitle = (title: string, threshold = 0.5) => {
      if (processedTitles.has(title)) return null;

      const titleTokens = title.split(/[\s\!\.\,\:\;\?\(\)\[\]\{\}\"\'\，\。\！\？\：\；\（\）\【\】\「\」]/)
        .filter(w => w.length >= 2)
        .map(w => w.toLowerCase());

      const matches: Array<{ platform: string, item: TrendingItemType, similarity: number }> = [];

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

  // 主题分析视图 - 热门关键词组件 - 更新为使用API数据
  const renderHotKeywords = () => (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-card overflow-hidden border border-gray-100 dark:border-gray-700">
      <div className="px-6 py-5 border-b border-gray-100 dark:border-gray-700">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white">全网热门关键词</h3>
      </div>

      <div className="p-6">
        {analysisData.isLoading ? (
          <div className="flex justify-center py-8">
            <LoadingSpinner size="md" />
          </div>
        ) : analysisData.hotKeywords.length === 0 ? (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            暂无热门关键词数据
          </div>
        ) : (
          <div className="flex flex-wrap gap-3">
            {analysisData.hotKeywords.map((keyword, index) => {
              // 根据权重选择样式
              const size = keyword.weight >= 0.8 ? 'lg' :
                keyword.weight >= 0.5 ? 'md' : 'sm';
              const randomCategory = TOPIC_CATEGORIES[index % TOPIC_CATEGORIES.length];
              return (
                <span
                  key={keyword.text}
                  className={`inline-block px-3 py-1.5 rounded-full text-${size} font-medium`}
                  style={{
                    backgroundColor: `${randomCategory.color}15`,
                    color: randomCategory.color
                  }}
                >
                  {keyword.text}
                </span>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );

  // 主题分析视图 - 主题分布组件 - 更新为使用API数据
  const renderTopicDistribution = () => (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-card overflow-hidden border border-gray-100 dark:border-gray-700">
      <div className="px-6 py-5 border-b border-gray-100 dark:border-gray-700">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white">热点主题分布</h3>
      </div>

      <div className="p-6">
        {analysisData.isLoading ? (
          <div className="flex justify-center py-8">
            <LoadingSpinner size="md" />
          </div>
        ) : analysisData.topicDistribution.length === 0 ? (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            暂无主题分布数据
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 gap-6 mb-6">
              {analysisData.topicDistribution.slice(0, 4).map((topic, index) => {
                const topicCategory = TOPIC_CATEGORIES.find(t => t.name === topic.category) || TOPIC_CATEGORIES[index % TOPIC_CATEGORIES.length];
                return (
                  <div key={topic.category} className="flex flex-col">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium" style={{ color: topicCategory.color }}>
                        {topic.category}
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
                          backgroundColor: topicCategory.color
                        }}
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>

            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">相关主题词组</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {analysisData.relatedTopicGroups.map((group, index) => (
                <div
                  key={index}
                  className="bg-gray-50 dark:bg-gray-800/60 p-3 rounded-lg border border-gray-100 dark:border-gray-700"
                >
                  <div className="flex items-center gap-2 mb-2">
                    {group.words.map((word, i) => (
                      <span
                        key={i}
                        className="font-medium text-sm"
                        style={{
                          color: TOPIC_CATEGORIES[i % TOPIC_CATEGORIES.length].color
                        }}
                      >
                        {word}{i < group.words.length - 1 ? ' + ' : ''}
                      </span>
                    ))}
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex-grow h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary-500"
                        style={{ width: `${Math.min((group.co_occurrence / 8) * 100, 100)}%` }}
                      ></div>
                    </div>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {group.co_occurrence}次共现
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );

  // 平台热度排行组件 - 更新为使用API数据
  const renderPlatformRankings = () => (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-card overflow-hidden border border-gray-100 dark:border-gray-700">
      <div className="px-6 py-5 border-b border-gray-100 dark:border-gray-700">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white">平台热度排行</h3>
      </div>

      <div className="p-6">
        {platformComparisonData.isLoading ? (
          <div className="flex justify-center py-8">
            <LoadingSpinner size="md" />
          </div>
        ) : platformComparisonData.platformRankings.length === 0 ? (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            暂无平台排名数据
          </div>
        ) : (
          <div className="space-y-5">
            {platformComparisonData.platformRankings.slice(0, 8).map((platform) => {
              const platformInfo = PLATFORMS.find(p => p.code === platform.platform);
              return (
                <div key={platform.platform} className="group">
                  <div className="flex items-center gap-3 mb-2">
                    <div
                      className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-lg text-white font-medium shadow-sm group-hover:shadow-md transition-all duration-300"
                      style={{
                        background: `linear-gradient(135deg, ${platformInfo?.color || '#3b76ea'}, ${adjustColor(platformInfo?.color || '#3b76ea', -20)})`,
                        transform: "translateZ(0)"
                      }}
                    >
                      {platform.rank}
                    </div>

                    <h4 className="text-base font-medium text-gray-800 dark:text-gray-200 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                      {platformInfo?.name || platform.platform}
                    </h4>

                    <div className="ml-auto flex gap-2 items-center">
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full flex items-center ${platform.trend > 0
                          ? 'bg-green-100 dark:bg-green-900/20 text-green-600 dark:text-green-400'
                          : 'bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400'
                          }`}
                      >
                        {platform.trend > 0 ? '+' : ''}{platform.trend.toFixed(1)}%
                      </span>

                      <span
                        className="text-sm px-2.5 py-1 rounded-full"
                        style={{
                          backgroundColor: `${platformInfo?.color || '#3b76ea'}15`,
                          color: platformInfo?.color || '#3b76ea'
                        }}
                      >
                        排名 {platform.rank}
                      </span>
                    </div>
                  </div>

                  <div className="h-2 w-full bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div
                      className="h-full transition-all duration-1000 ease-out"
                      style={{
                        width: `${((platformComparisonData.platformRankings.length - platform.rank + 1) / platformComparisonData.platformRankings.length) * 100}%`,
                        background: `linear-gradient(to right, ${platformInfo?.color || '#3b76ea'}, ${adjustColor(platformInfo?.color || '#3b76ea', 20)})`
                      }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );

  // 热点时间分布组件 - 更新为使用API数据
  const renderTimeDistribution = () => (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-card overflow-hidden border border-gray-100 dark:border-gray-700">
      <div className="px-6 py-5 border-b border-gray-100 dark:border-gray-700">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white">热点时间分布</h3>
      </div>

      <div className="p-6">
        {platformComparisonData.isLoading ? (
          <div className="flex justify-center py-8">
            <LoadingSpinner size="md" />
          </div>
        ) : (
          <div className="flex flex-col gap-8">
            {/* 时间段分布 */}
            <div>
              <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-4">一天内热点发布时段分布</h4>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {Object.entries(platformComparisonData.timeDistribution).map(([timeKey, data]) => (
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
                {platformComparisonData.platformRankings.slice(0, 6).map((platform) => {
                  const platformInfo = PLATFORMS.find(p => p.code === platform.platform);

                  return (
                    <div
                      key={platform.platform}
                      className="flex items-center gap-2 text-sm py-2 px-3 rounded-lg transition-colors hover:bg-gray-50 dark:hover:bg-gray-750"
                    >
                      <span
                        className="w-2 h-2 rounded-full"
                        style={{ backgroundColor: platformInfo?.color || '#3b76ea' }}
                      ></span>
                      <span className="text-gray-700 dark:text-gray-300">{platformInfo?.name || platform.platform}</span>
                      <span className="ml-auto text-xs text-gray-500 dark:text-gray-400">
                        {platformInfo?.updateFrequency || '未知'}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  // 跨平台热点视图 - 更新为使用API数据
  const renderCrossPlatformTopics = () => (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-card overflow-hidden border border-gray-100 dark:border-gray-700">
      <div className="px-6 py-5 border-b border-gray-100 dark:border-gray-700">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white">跨平台热点事件</h3>
      </div>

      <div className="divide-y divide-gray-100 dark:divide-gray-700">
        {crossPlatformData.isLoading ? (
          <div className="p-12 flex justify-center">
            <LoadingSpinner size="lg" />
          </div>
        ) : crossPlatformData.commonTopics.length === 0 ? (
          <div className="p-12 text-center">
            <p className="text-gray-500 dark:text-gray-400">暂无跨平台热点数据</p>
          </div>
        ) : (
          crossPlatformData.commonTopics.map((topic, index) => (
            <div key={index} className="p-6">
              <div className="flex flex-wrap items-center gap-3 mb-4">
                <h4 className="text-lg font-medium text-gray-800 dark:text-gray-200">
                  {topic.title}
                </h4>

                <div className="flex items-center gap-2 ml-auto">
                  <span className="text-xs bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 px-2.5 py-1 rounded-full">
                    {topic.platforms_count}个平台
                  </span>
                  {topic.heat > 0 && (
                    <span className="text-xs bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 px-2.5 py-1 rounded-full">
                      热度 {formatNumber(topic.heat.toString())}
                    </span>
                  )}
                </div>
              </div>

              <div className="flex flex-wrap gap-2 mb-4">
                {topic.platforms.map(platformCode => {
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
                {topic.related_items.slice(0, 3).map((item, i) => {
                  const platform = PLATFORMS.find(p => p.code === item.platform);
                  return (
                    <a
                      key={i}
                      href={item.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors border border-gray-100 dark:border-gray-700"
                    >
                      <div className="flex gap-3">
                        <div className="flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center"
                          style={{ backgroundColor: platform?.color || '#3b76ea' }}>
                          <span className="text-white text-xs font-bold">
                            {platform?.name?.substring(0, 1) || item.platform.substring(0, 1)}
                          </span>
                        </div>
                        <div className="flex-grow">
                          <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            {item.title}
                          </p>

                          {item.similarity !== undefined && item.similarity > 0 && (
                            <div className="mt-1 flex items-center gap-2">
                              <div className="flex-grow h-1 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                                <div
                                  className="h-full bg-green-500"
                                  style={{ width: `${item.similarity * 100}%` }}
                                ></div>
                              </div>
                              <span className="text-xs text-gray-500 dark:text-gray-400">
                                相似度 {Math.round(item.similarity * 100)}%
                              </span>
                            </div>
                          )}
                        </div>

                        <div className="flex-shrink-0 flex items-center text-gray-400 dark:text-gray-500">
                          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                          </svg>
                        </div>
                      </div>
                    </a>
                  );
                })}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );

  // 监听滚动显示回到顶部按钮
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 500) {
        setShowBackToTop(true);
      } else {
        setShowBackToTop(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  // 回到顶部功能
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

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
            <button
              onClick={() => setIsSettingsOpen(true)}
              className="px-8 py-4 bg-gradient-to-r from-secondary-600 to-secondary-700 text-white font-medium rounded-xl hover:shadow-lg hover:shadow-secondary-500/20 transform hover:-translate-y-1 transition-all duration-300 flex items-center justify-center gap-2"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              设置
            </button>
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
          {sortedPlatforms.map((platform, index) => (
            <motion.div key={platform.code} variants={itemVariants}>
              <PlatformCard
                platform={platform}
                index={index}
                trendingItems={trendingData[platform.code] || []}
                maxItems={settings.newsDisplayCount}
              />
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* 关键词云图 */}
      <section className="mb-24">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">关键词云图</h2>
        </div>

        {allDataLoaded ? (
          <WordCloudVisualization
            trendingData={trendingData}
          />
        ) : (
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-card p-12 flex flex-col items-center justify-center border border-gray-100 dark:border-gray-700">
            <LoadingSpinner size="lg" className="mb-4" />
            <p className="text-lg font-medium text-gray-700 dark:text-gray-300 mb-2">正在生成关键词云图</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              正在从{ALL_PLATFORMS.length}个平台获取数据并生成词云...
            </p>
          </div>
        )}
      </section>

      {/* 热点聚合分析 */}
      <section className="mb-24">
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
                  className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${analysisView === 'topics'
                    ? 'bg-white dark:bg-gray-700 shadow-sm text-primary-600 dark:text-primary-400'
                    : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
                    }`}
                >
                  主题分析
                </button>
                <button
                  onClick={() => setAnalysisView('platforms')}
                  className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${analysisView === 'platforms'
                    ? 'bg-white dark:bg-gray-700 shadow-sm text-primary-600 dark:text-primary-400'
                    : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
                    }`}
                >
                  平台对比
                </button>
                <button
                  onClick={() => setAnalysisView('visualization')}
                  className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${analysisView === 'visualization'
                    ? 'bg-white dark:bg-gray-700 shadow-sm text-primary-600 dark:text-primary-400'
                    : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
                    }`}
                >
                  数据可视化
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
                {renderHotKeywords()}

                {/* 热点主题分布 */}
                {renderTopicDistribution()}
              </div>
            )}

            {/* 平台对比视图 */}
            {analysisView === 'platforms' && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* 平台热度排行 */}
                {renderPlatformRankings()}

                {/* 热点时间分布 */}
                {renderTimeDistribution()}
              </div>
            )}

            {/* 数据可视化 */}
            {analysisView === 'visualization' && (
              <div className="space-y-6">
                {/* 主题热度图 */}
                <TopicHeatVisualization />
              </div>
            )}
          </>
        )}
      </section>

      {/* 热点趋势预测 - New Feature Section */}
      {/* <section className="mb-24">
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
      </section> */}

      {/* 跨平台热点 */}
      <section className="mb-24">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
            跨平台热点
            <span className="ml-2 text-xs px-2 py-1 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-full">
              热门
            </span>
          </h2>
        </div>

        {allDataLoaded ? (
          renderCrossPlatformTopics()
        ) : (
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-card p-12 flex flex-col items-center justify-center border border-gray-100 dark:border-gray-700">
            <LoadingSpinner size="lg" className="mb-4" />
            <p className="text-lg font-medium text-gray-700 dark:text-gray-300 mb-2">正在分析跨平台热点</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              我们正在对多个平台的热点数据进行交叉分析，请稍候...
            </p>
          </div>
        )}
      </section>

      {/* 回到顶部按钮 */}
      <AnimatePresence>
        {showBackToTop && (
          <motion.button
            initial={{ opacity: 0, scale: 0.5, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.5, y: 20 }}
            transition={{
              type: "spring",
              stiffness: 260,
              damping: 20,
              duration: 0.3
            }}
            onClick={scrollToTop}
            className="fixed right-8 bottom-8 z-50 flex items-center justify-center w-14 h-14 rounded-full bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-lg hover:shadow-xl hover:from-primary-600 hover:to-primary-700 transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-primary-400 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-gray-900"
            aria-label="回到顶部"
            style={{
              boxShadow: "0 10px 25px -5px rgba(59, 130, 246, 0.5)"
            }}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
            </svg>
          </motion.button>
        )}
      </AnimatePresence>

      {/* 设置弹窗 */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={settings}
        onSettingsChange={saveSettings}
      />
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
