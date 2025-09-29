"use client";

import { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PlatformType, TrendingItem } from '../types';
import { fetchKeywordCloud } from '../utils/api';
import LoadingSpinner from './LoadingSpinner';

interface WordCloudVisualizationProps {
  trendingData: Record<PlatformType, TrendingItem[]>;
  selectedPlatforms?: PlatformType[];
}

// 颜色方案
const CATEGORIES = [
  { 
    name: '科技', 
    color: '#3B82F6',
    keywords: ['科技', '技术', '数字', '智能', 'AI', '人工智能', '算法', '编程', '开发', '软件', 
              '互联网', '创新', '电脑', '手机', '平台', '系统', '网络', '设备']
  },
  { 
    name: '娱乐', 
    color: '#8B5CF6',
    keywords: ['明星', '娱乐', '综艺', '电影', '电视', '剧集', '音乐', '艺人', '演员', '歌手', 
              '导演', '电视剧', '影片', '节目', '作品', '表演', '爱豆']
  },
  { 
    name: '社会', 
    color: '#EC4899',
    keywords: ['社会', '事件', '新闻', '政策', '热议', '事故', '热点', '公共', '话题', '民生', 
              '现象', '问题', '舆论', '讨论']
  },
  { 
    name: '财经', 
    color: '#F59E0B',
    keywords: ['财经', '经济', '股市', '基金', '金融', '投资', '理财', '市场', '企业', '公司', 
              '股票', '销售', '价格', '产业', '商业']
  },
  { 
    name: '体育', 
    color: '#EF4444',
    keywords: ['体育', '赛事', '足球', '篮球', '比赛', '运动', '球员', '联赛', '队员', '冠军', 
              '球队', '战绩', '得分']
  },
];

// 默认颜色
const DEFAULT_CATEGORY = { name: '其他', color: '#6B7280' };

// 预计算类别匹配函数 - 提高性能
const getCategoryForKeyword = (text: string) => {
  const lowercaseText = text.toLowerCase();
  
  // 直接检查类别名称
  for (const cat of CATEGORIES) {
    if (lowercaseText.includes(cat.name.toLowerCase())) {
      return cat;
    }
  }
  
  // 检查关键词
  for (const cat of CATEGORIES) {
    for (const kw of cat.keywords) {
      if (lowercaseText.includes(kw.toLowerCase())) {
        return cat;
      }
    }
  }
  
  return DEFAULT_CATEGORY;
};

// 防抖函数
function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;
  
  return function(...args: Parameters<T>) {
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

export default function WordCloudVisualization({ trendingData, selectedPlatforms }: WordCloudVisualizationProps) {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [maxWords, setMaxWords] = useState(100);
  const [isMaxWordsOpen, setIsMaxWordsOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [apiKeywords, setApiKeywords] = useState<Array<{text: string, weight: number}>>([]);
  const containerRef = useRef<HTMLDivElement>(null);
  const isFirstRender = useRef(true);
  const prevMaxWords = useRef(maxWords);
  
  // 加载API数据
  useEffect(() => {
    const loadKeywordCloudData = async () => {
      try {
        setLoading(true);
        
        const response = await fetchKeywordCloud({
          category: selectedCategory?.toLowerCase(),
          keyword_count: maxWords
        });
        
        if (response.status === 'success') {
          const categoryData = selectedCategory ? 
            response.keyword_clouds[selectedCategory.toLowerCase()] : 
            response.keyword_clouds.all;
            
          setApiKeywords(categoryData || response.keyword_clouds.all || []);
        } else {
          console.error('Failed to fetch keyword cloud data:', response.msg);
        }
      } catch (error) {
        console.error('Error fetching keyword cloud data:', error);
      } finally {
        setLoading(false);
      }
    };

    // 第一次渲染或类别变更时立即加载
    if (isFirstRender.current || selectedCategory !== null) {
      loadKeywordCloudData();
      isFirstRender.current = false;
    } else if (maxWords !== prevMaxWords.current) {
      // 当词数量变更时，使用防抖加载，避免频繁请求
      const debouncedLoad = debounce(loadKeywordCloudData, 300);
      debouncedLoad();
    }
    
    prevMaxWords.current = maxWords;
  }, [selectedCategory, maxWords]);

  // 处理关键词数据 - 使用useMemo优化性能
  const processedWords = useMemo(() => {
    if (loading || apiKeywords.length === 0) {
      return [];
    }

    // 限制关键词数量
    const limitedKeywords = apiKeywords.slice(0, maxWords);
    
    // 计算权重范围
    const weights = limitedKeywords.map(k => k.weight);
    const maxVal = Math.max(...weights);
    const minVal = Math.min(...weights);
    
    // 字体大小范围
    const minSize = 14;
    const maxSize = 36;
    
    return limitedKeywords.map((keyword) => {
      // 查找类别 - 使用优化后的函数
      const foundCategory = getCategoryForKeyword(keyword.text);
      
      // 计算字体大小 - 使用对数缩放提高视觉效果
      let fontSize;
      if (maxVal === minVal) {
        fontSize = (minSize + maxSize) / 2;
      } else {
        const normalizedWeight = (keyword.weight - minVal) / (maxVal - minVal);
        // 使用对数缩放，让差异更明显
        fontSize = minSize + Math.pow(normalizedWeight, 0.8) * (maxSize - minSize);
      }

      return {
        text: keyword.text,
        value: keyword.weight,
        category: foundCategory.name,
        color: foundCategory.color,
        fontSize: Math.round(fontSize)
      };
    });
  }, [apiKeywords, loading, maxWords]);

  // 过滤词语
  const filteredWords = useMemo(() => {
    if (!selectedCategory) {
      return processedWords;
    }
    return processedWords.filter(word => word.category === selectedCategory);
  }, [processedWords, selectedCategory]);

  // 排序词语
  const sortedWords = useMemo(() => {
    if (!filteredWords.length) return [];
    return [...filteredWords].sort((a, b) => b.value - a.value);
  }, [filteredWords]);

  // 使用useCallback优化事件处理函数
  const handleCategoryClick = useCallback((category: string | null) => {
    setSelectedCategory(category);
  }, []);

  const handleMaxWordsClick = useCallback((num: number) => {
    setMaxWords(num);
    setIsMaxWordsOpen(false);
  }, []);

  // 为每个词语计算球面上的位置 - 使用Web Worker或分批计算提高性能
  const spherePositions = useMemo(() => {
    if (!sortedWords.length) return [];
    
    // 限制同时渲染的词语数量，提高性能
    const renderLimit = Math.min(sortedWords.length, 150);
    const visibleWords = sortedWords.slice(0, renderLimit);
    
    return visibleWords.map((word, index) => {
      // 使用黄金角螺旋算法均匀分布点在球面上
      const phi = Math.acos(-1 + (2 * index) / visibleWords.length);
      const theta = Math.PI * (1 + Math.sqrt(5)) * index;
      
      // 球面坐标转换为笛卡尔坐标
      const x = Math.cos(theta) * Math.sin(phi);
      const y = Math.sin(theta) * Math.sin(phi);
      const z = Math.cos(phi);
      
      // 计算词语在球面上的位置
      return {
        ...word,
        position: { x, y, z },
        // 根据z坐标计算透明度，使背面的词语半透明
        opacity: (z + 1) / 2 * 0.7 + 0.3
      };
    });
  }, [sortedWords]);

  // 使用IntersectionObserver延迟加载词云
  useEffect(() => {
    if (!containerRef.current) return;
    
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            // 当容器进入视口时，添加类来启动动画
            containerRef.current?.classList.add('is-visible');
          }
        });
      },
      { threshold: 0.1 }
    );
    
    observer.observe(containerRef.current);
    
    return () => {
      if (containerRef.current) {
        observer.unobserve(containerRef.current);
      }
    };
  }, []);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 p-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100 flex items-center">
          <svg className="w-5 h-5 mr-2 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
          </svg>
          热门关键词云图
        </h3>
        
        {/* 控制面板 */}
        <div className="flex flex-wrap gap-3" role="toolbar" aria-label="词云过滤和显示选项">
          {/* 分类过滤 */}
          <div 
            className="flex gap-1.5 bg-gray-50 dark:bg-gray-750 p-1.5 rounded-full shadow-inner overflow-x-auto"
            role="radiogroup"
            aria-label="关键词分类过滤"
          >
            <button
              onClick={() => handleCategoryClick(null)}
              className={`px-3 py-1.5 text-xs rounded-full transition-all whitespace-nowrap ${
                selectedCategory === null
                  ? 'bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 shadow-sm font-medium'
                  : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
              aria-pressed={selectedCategory === null}
              role="radio"
            >
              全部
            </button>
            
            {CATEGORIES.map(category => (
              <button
                key={category.name}
                onClick={() => handleCategoryClick(category.name)}
                className={`px-3 py-1.5 text-xs rounded-full transition-all whitespace-nowrap ${
                  selectedCategory === category.name 
                    ? 'bg-white dark:bg-gray-700 shadow-sm font-medium' 
                    : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
                style={{
                  color: selectedCategory === category.name ? category.color : ''
                }}
                aria-pressed={selectedCategory === category.name}
                role="radio"
              >
                {category.name}
              </button>
            ))}
          </div>
          
          {/* 词数量选择 */}
          <div className="relative">
            <button 
              onClick={() => setIsMaxWordsOpen(!isMaxWordsOpen)}
              className="flex items-center gap-1 px-3.5 py-1.5 text-xs bg-gray-50 dark:bg-gray-750 rounded-full text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-all shadow-inner"
              aria-haspopup="true"
              aria-expanded={isMaxWordsOpen}
              aria-label={`显示关键词数量，当前: ${maxWords}个`}
            >
              <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16m-7 6h7" />
              </svg>
              <span>显示{maxWords}个</span>
              <svg 
                className={`w-3 h-3 ml-1 transition-transform ${isMaxWordsOpen ? 'transform rotate-180' : ''}`}
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
              </svg>
            </button>
            
            <AnimatePresence>
              {isMaxWordsOpen && (
                <motion.div 
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className="absolute right-0 mt-2 w-40 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-100 dark:border-gray-700 z-10 overflow-hidden"
                  role="menu"
                  aria-orientation="vertical"
                  aria-labelledby="word-count-button"
                >
                  {[50, 100, 150, 200].map(num => (
                    <button
                      key={num}
                      className={`block w-full px-4 py-2 text-xs text-left hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors ${
                        maxWords === num 
                          ? 'bg-gray-50 dark:bg-gray-750 text-blue-600 dark:text-blue-400 font-medium' 
                          : 'text-gray-700 dark:text-gray-300'
                      }`}
                      onClick={() => handleMaxWordsClick(num)}
                      role="menuitem"
                      aria-current={maxWords === num ? 'true' : 'false'}
                    >
                      显示{num}个关键词
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
      
      {/* 词云可视化 */}
      <div 
        ref={containerRef}
        className="relative h-[350px] rounded-xl bg-white dark:bg-gray-800 overflow-hidden shadow-inner word-cloud-container"
        role="region"
        aria-label="关键词云可视化"
      >
        {loading ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center" aria-live="polite">
            <LoadingSpinner size="lg" className="mb-4" />
            <div className="text-sm text-gray-500 dark:text-gray-400">加载热门关键词中...</div>
          </div>
        ) : spherePositions.length === 0 ? (
          <div className="absolute inset-0 flex items-center justify-center text-gray-500 dark:text-gray-400" aria-live="polite">
            暂无可用的关键词数据
          </div>
        ) : (
          <div className="w-full h-full flex items-center justify-center perspective-800">
            <div className="rotating-sphere w-[300px] h-[300px] relative" aria-hidden="true">
              {spherePositions.map((word, index) => {
                // 计算词语在球面上的位置
                const radius = 150; // 球体半径
                const { x, y, z } = word.position;
                const translateX = x * radius;
                const translateY = y * radius;
                const translateZ = z * radius;
                
                // 计算词语的大小，重要的词语更大
                const importance = index < 5 ? 1.2 : index < 15 ? 1 : 0.8;
                
                return (
                  <div
                    key={word.text}
                    className="absolute left-1/2 top-1/2 transform-gpu word-item"
                    style={{
                      transform: `translate(-50%, -50%) translate3d(${translateX}px, ${translateY}px, ${translateZ}px) rotateY(${Math.atan2(x, z)}rad) rotateX(${-Math.atan2(y, Math.sqrt(x*x + z*z))}rad)`,
                      fontSize: `${word.fontSize * importance}px`,
                      color: word.color,
                      fontWeight: index < 10 ? 600 : 400,
                      opacity: word.opacity,
                      willChange: 'transform, opacity',
                    }}
                  >
                    {word.text}
                  </div>
                );
              })}
            </div>
            
            {/* 提供可访问的关键词列表，供屏幕阅读器使用 */}
            <div className="sr-only">
              <ul>
                {spherePositions.slice(0, 20).map((word, index) => (
                  <li key={index}>
                    {`${word.text}：热度 ${word.value}，分类：${word.category}`}
                  </li>
                ))}
                {spherePositions.length > 20 && <li>以及更多{spherePositions.length - 20}个关键词</li>}
              </ul>
            </div>
          </div>
        )}
      </div>
          
      <div className="mt-4 text-xs text-gray-500 dark:text-gray-400 flex items-center justify-center">
        <svg className="w-4 h-4 mr-1 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        关键词云图基于全网热点内容智能提取，大小反映热度权重，颜色反映主题分类
      </div>

      {/* 添加必要的CSS */}
      <style jsx global>{`
        .perspective-800 {
          perspective: 800px;
        }
        
        .rotating-sphere {
          transform-style: preserve-3d;
          animation: rotate 30s linear infinite;
          will-change: transform;
        }
        
        .word-cloud-container:not(.is-visible) .rotating-sphere {
          animation-play-state: paused;
        }
        
        .word-item {
          transform-style: preserve-3d;
          backface-visibility: hidden;
          text-shadow: 0 1px 2px rgba(0,0,0,0.1);
          pointer-events: none;
          white-space: nowrap;
        }
        
        @keyframes rotate {
          from {
            transform: rotateY(0deg);
          }
          to {
            transform: rotateY(360deg);
          }
        }
      `}</style>
    </div>
  );
}