"use client";

import { useState, useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PlatformType, TrendingItem, HotKeyword } from '../types';
import { fetchAnalysisData } from '../utils/api';
import LoadingSpinner from './LoadingSpinner';

interface WordCloudVisualizationProps {
  trendingData: Record<PlatformType, TrendingItem[]>;
  selectedPlatforms?: PlatformType[];
}

type WordData = {
  text: string;
  value: number;
  category: string;
  color: string;
  gradient: string;
};

// 优化颜色方案，更现代化的配色
const CATEGORIES = [
  { 
    name: '科技', 
    color: '#0EA5E9', // 更鲜明的蓝色
    gradient: 'linear-gradient(135deg, #0EA5E9, #0369A1)',
    keywords: ['科技', '技术', '数字', '智能', 'AI', '人工智能', '算法', '编程', '开发', '软件', 
              '互联网', '创新', '电脑', '手机', '平台', '系统', '网络', '设备', '信息', '芯片', 
              '数据', '云计算', '计算机', '终端', '程序', '功能', '产品', '设计', '研发']
  },
  { 
    name: '娱乐', 
    color: '#A855F7', // 更亮的紫色
    gradient: 'linear-gradient(135deg, #A855F7, #7E22CE)',
    keywords: ['明星', '娱乐', '综艺', '电影', '电视', '剧集', '音乐', '艺人', '演员', '歌手', 
              '导演', '电视剧', '影片', '节目', '作品', '表演', '爱豆', '综艺', '票房', '播出', 
              '热播', '粉丝', '流量', '热度', '剧情', '主演', '偶像', '影视']
  },
  { 
    name: '社会', 
    color: '#F43F5E', // 粉红色
    gradient: 'linear-gradient(135deg, #F43F5E, #BE185D)',
    keywords: ['社会', '事件', '新闻', '政策', '热议', '事故', '热点', '公共', '话题', '民生', 
              '现象', '问题', '舆论', '讨论', '调查', '报道', '公布', '发布', '通报', '教育', 
              '医疗', '安全', '交通', '法律', '法规', '规定', '工作', '服务', '环境', '措施', 
              '情况', '媒体']
  },
  { 
    name: '财经', 
    color: '#F97316', // 更亮的橙色
    gradient: 'linear-gradient(135deg, #F97316, #C2410C)',
    keywords: ['财经', '经济', '股市', '基金', '金融', '投资', '理财', '市场', '企业', '公司', 
              '股票', '销售', '价格', '产业', '商业', '资本', '增长', '业绩', '成本', '营收', 
              '收入', '盈利', '降低', '价值', '银行', '消费', '贷款', '融资', '发展', '行业']
  },
  { 
    name: '体育', 
    color: '#EF4444', // 红色
    gradient: 'linear-gradient(135deg, #EF4444, #B91C1C)',
    keywords: ['体育', '赛事', '足球', '篮球', '比赛', '运动', '球员', '联赛', '队员', '冠军', 
              '球队', '战绩', '得分', '胜利', '夺冠', '训练', '选手', '教练', '世界杯', '奥运', 
              '比分', '排名', '对决', '战胜', '表现', '进球', '失利', '成绩', '体坛']
  },
];

// Default color for words that don't match any category
const DEFAULT_CATEGORY = { 
  name: '其他', 
  color: '#6366F1',
  gradient: 'linear-gradient(135deg, #6366F1, #4338CA)'
};

export default function WordCloudVisualization({ trendingData, selectedPlatforms }: WordCloudVisualizationProps) {
  const [hoveredWord, setHoveredWord] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [maxWords, setMaxWords] = useState(50);
  const [isMaxWordsOpen, setIsMaxWordsOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [apiKeywords, setApiKeywords] = useState<HotKeyword[]>([]);
  const [containerSize, setContainerSize] = useState({ width: 800, height: 600 });
  const containerRef = useRef<HTMLDivElement>(null);
  const [animationComplete, setAnimationComplete] = useState(false);

  // Load data from API
  useEffect(() => {
    const loadAnalysisData = async () => {
      try {
        setLoading(true);
        const response = await fetchAnalysisData('main');
        if (response.status === 'success') {
          setApiKeywords(response.hot_keywords);
        } else {
          console.error('Failed to fetch hot keywords:', response.msg);
        }
      } catch (error) {
        console.error('Error fetching hot keywords:', error);
      } finally {
        setLoading(false);
      }
    };

    loadAnalysisData();
  }, []);

  // Update container size on window resize
  useEffect(() => {
    const updateSize = () => {
      if (containerRef.current) {
        setContainerSize({
          width: containerRef.current.clientWidth,
          height: containerRef.current.clientHeight
        });
      }
    };

    // Initial size
    updateSize();

    // Listen for resize events
    window.addEventListener('resize', updateSize);
    
    return () => {
      window.removeEventListener('resize', updateSize);
    };
  }, []);

  // Convert API data to word cloud format
  const wordData = useMemo(() => {
    if (loading || apiKeywords.length === 0) {
      return [];
    }

    // Map API keywords to WordData format
    return apiKeywords
      .slice(0, maxWords)
      .map((keyword) => {
        // Find category based on keyword text
        const category = CATEGORIES.find(cat => 
          cat.keywords.some(k => keyword.text.includes(k) || k.includes(keyword.text))
        ) || DEFAULT_CATEGORY;

        return {
          text: keyword.text,
          value: keyword.weight * 100, // Scale weight to a reasonable value for display
          category: category.name,
          color: category.color,
          gradient: category.gradient
        };
      });
  }, [apiKeywords, maxWords, loading]);

  // 过滤展示的词
  const filteredWords = useMemo(() => {
    if (!selectedCategory) {
      return wordData;
    }
    return wordData.filter(word => word.category === selectedCategory);
  }, [wordData, selectedCategory]);

  // 获取分类样式
  const getCategoryStyle = (categoryName: string) => {
    const category = CATEGORIES.find(c => c.name === categoryName) || DEFAULT_CATEGORY;
    return {
      color: category.color,
      gradient: category.gradient
    };
  };

  // 智能分布位置算法 - 改进版
  const wordPositions = useMemo(() => {
    if (filteredWords.length === 0) return {};
    
    const positions: Record<string, {x: number, y: number, rotate: number, fontSize: number, opacity: number, delay: number}> = {};
    const placedAreas: Array<{x: number, y: number, width: number, height: number}> = [];
    
    // Sort words by value (largest first)
    const sortedWords = [...filteredWords].sort((a, b) => b.value - a.value);
    
    // Calculate the center of the container
    const centerX = 0;
    const centerY = 0;
    
    // Calculate the available space - use more of the container
    const maxRadius = Math.min(containerSize.width, containerSize.height) * 0.45;
    
    // Function to check if a position overlaps with already placed words
    const checkOverlap = (x: number, y: number, width: number, height: number) => {
      // Add generous padding between words
      const padding = 20;
      width += padding * 2;
      height += padding * 2;
      
      // Check if position is within container bounds
      if (
        x - width/2 < -containerSize.width/2 * 0.9 || 
        x + width/2 > containerSize.width/2 * 0.9 || 
        y - height/2 < -containerSize.height/2 * 0.9 || 
        y + height/2 > containerSize.height/2 * 0.9
      ) {
        return true;
      }
      
      // Check if position overlaps with any placed word
      return placedAreas.some(area => {
        return !(
          x + width/2 < area.x - area.width/2 ||
          x - width/2 > area.x + area.width/2 ||
          y + height/2 < area.y - area.height/2 ||
          y - height/2 > area.y + area.height/2
        );
      });
    };

    // Generate initial positions using a golden ratio spiral
    // This creates a more aesthetically pleasing distribution
    const generateInitialPositions = () => {
      const phi = (Math.sqrt(5) + 1) / 2 - 1; // Golden ratio - 1
      const positions: Array<{x: number, y: number}> = [];
      
      for (let i = 0; i < sortedWords.length; i++) {
        // Golden angle increment
        const theta = i * 2 * Math.PI * phi;
        
        // Radius increases with each point, but not linearly
        // Using square root creates more even distribution
        const radius = maxRadius * 0.8 * Math.sqrt(i / sortedWords.length);
        
        positions.push({
          x: centerX + radius * Math.cos(theta),
          y: centerY + radius * Math.sin(theta)
        });
      }
      
      return positions;
    };
    
    // Get initial positions based on golden ratio spiral
    const initialPositions = generateInitialPositions();
    
    // Place words using the initial positions as starting points
    sortedWords.forEach((word, index) => {
      // Calculate font size based on word value
      const minSize = 16;
      const maxSize = 56;
      const maxVal = Math.max(...wordData.map(w => w.value));
      const minVal = Math.min(...wordData.map(w => w.value));
      
      let fontSize;
      if (maxVal === minVal) {
        fontSize = (minSize + maxSize) / 2;
      } else {
        fontSize = minSize + ((word.value - minVal) / (maxVal - minVal)) * (maxSize - minSize);
      }
      
      // Estimate word dimensions
      const wordWidth = word.text.length * fontSize * 0.65;
      const wordHeight = fontSize * 1.8;
      
      // Start from the initial position from our golden ratio spiral
      let x = initialPositions[index].x;
      let y = initialPositions[index].y;
      let placed = false;
      let attempts = 0;
      const maxAttempts = 300;
      
      // First word in center
      if (index === 0) {
        x = centerX;
        y = centerY;
        placed = true;
      }
      
      // Try to place the word near its initial position
      while (!placed && attempts < maxAttempts) {
        // Check if this position works
        if (!checkOverlap(x, y, wordWidth, wordHeight)) {
          placed = true;
        } else {
          // Move in a small random direction from the initial position
          // This creates a more natural, less structured look
          const angle = Math.random() * Math.PI * 2;
          const distance = attempts * 1.5; // Gradually move further out
          x = initialPositions[index].x + distance * Math.cos(angle);
          y = initialPositions[index].y + distance * Math.sin(angle);
          attempts++;
        }
      }
      
      // If we couldn't place it after max attempts, try a completely different area
      if (!placed) {
        // Find an area with fewer words by dividing the container into quadrants
        // and counting words in each quadrant
        const quadrants = [
          {x: -containerSize.width/4, y: -containerSize.height/4, count: 0},
          {x: containerSize.width/4, y: -containerSize.height/4, count: 0},
          {x: -containerSize.width/4, y: containerSize.height/4, count: 0},
          {x: containerSize.width/4, y: containerSize.height/4, count: 0}
        ];
        
        // Count words in each quadrant
        placedAreas.forEach(area => {
          if (area.x < 0 && area.y < 0) quadrants[0].count++;
          else if (area.x >= 0 && area.y < 0) quadrants[1].count++;
          else if (area.x < 0 && area.y >= 0) quadrants[2].count++;
          else quadrants[3].count++;
        });
        
        // Sort quadrants by word count (ascending)
        quadrants.sort((a, b) => a.count - b.count);
        
        // Try to place in the least crowded quadrant
        const leastCrowdedQuadrant = quadrants[0];
        x = leastCrowdedQuadrant.x + (Math.random() * 0.5 - 0.25) * containerSize.width/2;
        y = leastCrowdedQuadrant.y + (Math.random() * 0.5 - 0.25) * containerSize.height/2;
      }
      
      // Add to placed areas
      placedAreas.push({
        x,
        y,
        width: wordWidth,
        height: wordHeight
      });
      
      // Store position with enhanced parameters
      const isTop10 = index < 10;
      positions[word.text] = {
        x,
        y,
        rotate: (index % 2 === 0) ? Math.random() * 8 - 4 : 0, // Reduced rotation for better readability
        fontSize,
        opacity: isTop10 ? 1 : 0.7 + (0.3 * (1 - index / sortedWords.length)),
        delay: index * 0.03 // Staggered animation delay
      };
    });
    
    return positions;
  }, [filteredWords, containerSize, wordData]);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 p-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100 flex items-center">
          <svg className="w-5 h-5 mr-2 text-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
          </svg>
          热门关键词云图
        </h3>
        
        {/* Controls */}
        <div className="flex flex-wrap gap-3">
          {/* 分类过滤 */}
          <div className="flex gap-2 bg-gray-50 dark:bg-gray-750 p-1.5 rounded-full shadow-inner">
            <button
              onClick={() => setSelectedCategory(null)}
              className={`px-3 py-1.5 text-xs rounded-full transition-all ${
                selectedCategory === null
                  ? 'bg-white dark:bg-gray-700 text-primary-600 dark:text-primary-400 shadow-sm'
                  : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              全部
            </button>
            
            {CATEGORIES.map(category => (
              <button
                key={category.name}
                onClick={() => setSelectedCategory(category.name)}
                className={`px-3 py-1.5 text-xs rounded-full transition-all ${
                  selectedCategory === category.name 
                    ? 'bg-white dark:bg-gray-700 shadow-sm' 
                    : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
                style={{
                  color: selectedCategory === category.name ? category.color : ''
                }}
              >
                {category.name}
              </button>
            ))}
          </div>
          
          {/* 词数量选择下拉框 */}
          <div className="relative">
            <button 
              onClick={() => setIsMaxWordsOpen(!isMaxWordsOpen)}
              className="flex items-center gap-1 px-3.5 py-1.5 text-xs bg-gray-50 dark:bg-gray-750 rounded-full text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-all shadow-inner"
            >
              <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16m-7 6h7" />
              </svg>
              <span>显示{maxWords}个</span>
              <svg 
                className={`w-3 h-3 ml-1 transition-transform ${isMaxWordsOpen ? 'transform rotate-180' : ''}`}
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
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
                >
                  {[20, 30, 50, 80, 100].map(num => (
                    <button
                      key={num}
                      className={`block w-full px-4 py-2 text-xs text-left hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors ${
                        maxWords === num 
                          ? 'bg-gray-50 dark:bg-gray-750 text-primary-600 dark:text-primary-400 font-medium' 
                          : 'text-gray-700 dark:text-gray-300'
                      }`}
                      onClick={() => {
                        setMaxWords(num);
                        setIsMaxWordsOpen(false);
                      }}
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
      
      {/* Word Cloud Visualization */}
      <div 
        ref={containerRef}
        id="word-cloud-container"
        className="relative h-[600px] rounded-xl bg-gradient-to-br from-gray-50/80 via-white to-gray-100/80 dark:from-gray-800/80 dark:via-gray-850 dark:to-gray-900/80 overflow-hidden shadow-inner"
      >
        {/* 背景装饰元素 */}
        <div className="absolute inset-0 overflow-hidden opacity-5">
          <div className="absolute -top-20 -left-20 w-60 h-60 rounded-full bg-primary-500 blur-3xl"></div>
          <div className="absolute -bottom-20 -right-20 w-60 h-60 rounded-full bg-indigo-500 blur-3xl"></div>
          <div className="absolute top-1/2 left-1/4 w-40 h-40 rounded-full bg-pink-500 blur-3xl"></div>
        </div>
        
        {loading ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <LoadingSpinner size="lg" className="mb-4" />
            <div className="text-sm text-gray-500 dark:text-gray-400">加载热门关键词中...</div>
          </div>
        ) : filteredWords.length === 0 ? (
          <div className="absolute inset-0 flex items-center justify-center text-gray-500 dark:text-gray-400">
            暂无可用的关键词数据
          </div>
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="relative w-full h-full flex items-center justify-center">
              {filteredWords.map((word) => {
                const position = wordPositions[word.text];
                if (!position) return null;
                
                // Get category style
                const categoryStyle = getCategoryStyle(word.category);
                
                return (
                  <motion.div
                    key={word.text}
                    className="absolute inline-block transform-gpu cursor-pointer"
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ 
                      opacity: hoveredWord && hoveredWord !== word.text ? position.opacity * 0.5 : position.opacity, 
                      scale: 1,
                      x: position.x,
                      y: position.y,
                      rotate: position.rotate,
                      transition: { 
                        duration: 0.7,
                        delay: animationComplete ? 0 : position.delay,
                        ease: [0.34, 1.56, 0.64, 1] // Custom spring-like easing
                      }
                    }}
                    onAnimationComplete={() => !animationComplete && setAnimationComplete(true)}
                    whileHover={{ 
                      scale: 1.15, 
                      rotate: 0, 
                      opacity: 1,
                      zIndex: 10,
                      transition: { duration: 0.3 }
                    }}
                    onMouseEnter={() => setHoveredWord(word.text)}
                    onMouseLeave={() => setHoveredWord(null)}
                  >
                    <div 
                      className="px-4 py-2 rounded-xl backdrop-blur-sm transition-all"
                      style={{
                        fontSize: `${position.fontSize}px`,
                        background: hoveredWord === word.text 
                          ? categoryStyle.gradient 
                          : 'rgba(255, 255, 255, 0.85)',
                        color: hoveredWord === word.text ? 'white' : categoryStyle.color,
                        boxShadow: hoveredWord === word.text 
                          ? `0 10px 25px -5px ${categoryStyle.color}40, 0 0 10px 2px ${categoryStyle.color}20`
                          : '0 4px 15px -2px rgba(0, 0, 0, 0.1), 0 2px 5px -2px rgba(0, 0, 0, 0.05)',
                        fontWeight: position.fontSize > 30 ? 700 : position.fontSize > 25 ? 600 : 500,
                        letterSpacing: hoveredWord === word.text ? '0.02em' : 'normal',
                        border: hoveredWord === word.text 
                          ? 'none' 
                          : '1px solid rgba(255, 255, 255, 0.8)',
                        backdropFilter: 'blur(8px)',
                        textShadow: hoveredWord === word.text ? '0 1px 2px rgba(0,0,0,0.2)' : 'none'
                      }}
                    >
                      {word.text}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        )}
      </div>
          
      <div className="mt-6 text-xs text-gray-500 dark:text-gray-400 flex items-center justify-center">
        <svg className="w-4 h-4 mr-1 text-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        关键词云图基于全网热点内容智能提取，大小反映热度权重，颜色反映主题分类
      </div>
    </div>
  );
} 