"use client";

import { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { PlatformType, TrendingItem } from '../types';

interface WordCloudVisualizationProps {
  trendingData: Record<PlatformType, TrendingItem[]>;
  selectedPlatforms?: PlatformType[];
}

type WordData = {
  text: string;
  value: number;
  category: string;
  color: string;
};

// Categories with associated colors
const CATEGORIES = [
  { 
    name: '科技', 
    color: '#10B981', 
    keywords: ['科技', '技术', '数字', '智能', 'AI', '人工智能', '算法', '编程', '开发', '软件', 
              '互联网', '创新', '电脑', '手机', '平台', '系统', '网络', '设备', '信息', '芯片', 
              '数据', '云计算', '计算机', '终端', '程序', '功能', '产品', '设计', '研发']
  },
  { 
    name: '娱乐', 
    color: '#8B5CF6', 
    keywords: ['明星', '娱乐', '综艺', '电影', '电视', '剧集', '音乐', '艺人', '演员', '歌手', 
              '导演', '电视剧', '影片', '节目', '作品', '表演', '爱豆', '综艺', '票房', '播出', 
              '热播', '粉丝', '流量', '热度', '剧情', '主演', '偶像', '影视']
  },
  { 
    name: '社会', 
    color: '#3B82F6', 
    keywords: ['社会', '事件', '新闻', '政策', '热议', '事故', '热点', '公共', '话题', '民生', 
              '现象', '问题', '舆论', '讨论', '调查', '报道', '公布', '发布', '通报', '教育', 
              '医疗', '安全', '交通', '法律', '法规', '规定', '工作', '服务', '环境', '措施', 
              '情况', '媒体']
  },
  { 
    name: '财经', 
    color: '#F59E0B', 
    keywords: ['财经', '经济', '股市', '基金', '金融', '投资', '理财', '市场', '企业', '公司', 
              '股票', '销售', '价格', '产业', '商业', '资本', '增长', '业绩', '成本', '营收', 
              '收入', '盈利', '降低', '价值', '银行', '消费', '贷款', '融资', '发展', '行业']
  },
  { 
    name: '体育', 
    color: '#EF4444', 
    keywords: ['体育', '赛事', '足球', '篮球', '比赛', '运动', '球员', '联赛', '队员', '冠军', 
              '球队', '战绩', '得分', '胜利', '夺冠', '训练', '选手', '教练', '世界杯', '奥运', 
              '比分', '排名', '对决', '战胜', '表现', '进球', '失利', '成绩', '体坛']
  },
];

// Default color for words that don't match any category
const DEFAULT_CATEGORY = { name: '其他', color: '#64748B' };

export default function WordCloudVisualization({ trendingData, selectedPlatforms }: WordCloudVisualizationProps) {
  const [hoveredWord, setHoveredWord] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [minFrequency, setMinFrequency] = useState(2);
  const [maxWords, setMaxWords] = useState(50);
  const [isMaxWordsOpen, setIsMaxWordsOpen] = useState(false);
  const [isFrequencySliderOpen, setIsFrequencySliderOpen] = useState(false);

  // 检测是否是中文字符的函数，包含更广泛的中文字符范围
  const isChineseChar = (char: string): boolean => {
    const code = char.charCodeAt(0);
    return (
      (code >= 0x4e00 && code <= 0x9fff) || // CJK统一汉字
      (code >= 0x3400 && code <= 0x4dbf) || // CJK扩展A
      (code >= 0xf900 && code <= 0xfaff) || // CJK兼容汉字
      (code >= 0x20000 && code <= 0x2a6df) || // CJK扩展B
      (code >= 0x2a700 && code <= 0x2b73f) || // CJK扩展C
      (code >= 0x2b740 && code <= 0x2b81f) || // CJK扩展D
      (code >= 0x2b820 && code <= 0x2ceaf) || // CJK扩展E
      (code >= 0x2ceb0 && code <= 0x2ebef)    // CJK扩展F
    );
  };

  // 验证是否是有效的中文词
  const isValidChineseWord = (word: string): boolean => {
    // 长度至少为1
    if (word.length < 1) return false;
    
    // 必须全部是中文字符
    for (let i = 0; i < word.length; i++) {
      if (!isChineseChar(word[i])) return false;
    }
    
    // 不能含有任何英文字母、数字或特殊字符
    if (/[a-zA-Z0-9\s.,!?:;'"()[\]{}\/\\<>@#$%^&*+=|~`-]/.test(word)) return false;
    
    // 不能全部是英文字母 (额外安全检查)
    if (/^[a-zA-Z]+$/.test(word)) return false;
    
    // 检查是否包含英文单词
    const commonEnglishWords = ['the', 'of', 'to', 'and', 'a', 'in', 'is', 'it', 'that', 'for', 'you', 'was', 'on', 
                               'with', 'as', 'his', 'they', 'at', 'be', 'this', 'have', 'from', 'or', 'one', 'had', 'by',
                               'but', 'what', 'all', 'were', 'we', 'when', 'your', 'can', 'said', 'there', 'how'];
    
    if (commonEnglishWords.some(engWord => word.toLowerCase().includes(engWord))) return false;
    
    return true;
  };

  // Extract words and their frequencies from trending data
  const wordData = useMemo(() => {
    // If no platforms are selected or no data is available, return empty array
    if (!trendingData || Object.keys(trendingData).length === 0) {
      return [];
    }

    // Filter by selected platforms if provided
    const platformsToUse = selectedPlatforms || Object.keys(trendingData) as PlatformType[];
    
    // Collect all text content
    const allContent: string[] = [];
    platformsToUse.forEach(platform => {
      const items = trendingData[platform] || [];
      items.forEach(item => {
        if (item.title) allContent.push(item.title);
        if (item.desc) allContent.push(item.desc);
      });
    });

    // 扩展的中文停用词表
    const stopWords = new Set([
      '的', '了', '是', '在', '和', '与', '这', '那', '有', '你', '我', '他', '她',
      '为', '被', '所', '以', '及', '等', '能', '都', '将', '从', '但', '到', '对',
      '后', '前', '今', '来', '去', '只', '又', '也', '还', '上', '下', '中', '内',
      '外', '多', '少', '大', '小', '年', '月', '日', '时', '分', '秒', '最', '更',
      '很', '非常', '就是', '不是', '什么', '如何', '为什么', '可能', '一个', '一种',
      '表示', '称', '看', '让', '说', '称为', '称之为', '称作',
      '啊', '吧', '呢', '吗', '呀', '哦', '啦', '嘛', '呐', '哪', '哇', '喂', '喽',
      
      // 扩展更多常见英文单词，确保它们被过滤掉
      'the', 'of', 'to', 'and', 'a', 'in', 'is', 'it', 'that', 'for', 'you', 'was', 'on',
      'with', 'as', 'his', 'they', 'at', 'be', 'this', 'have', 'from', 'or', 'one', 'had', 'by',
      'but', 'what', 'all', 'were', 'we', 'when', 'your', 'can', 'said', 'there', 'how', 'has',
      'who', 'will', 'more', 'no', 'would', 'should', 'could', 'if', 'my', 'than', 'first',
      'been', 'do', 'its', 'their', 'not', 'now', 'after', 'other', 'into', 'just', 'an',
      'are', 'these', 'any', 'about', 'out', 'our', 'up', 'also', 'may', 'some', 'like', 'even',
      'i', 'me', 'he', 'she', 'us', 'her', 'him', 'them', 'get', 'got', 'go', 'went',
      'come', 'came', 'see', 'saw', 'make', 'made', 'know', 'knew', 'take', 'took',
      'think', 'thought', 'so', 'only', 'then', 'new', 'use', 'used', 'work', 'way',
      'day', 'time', 'year', 'good', 'want', 'because', 'people', 'thing', 'things', 'each', 'every',
      'many', 'few', 'most', 'either', 'neither', 'both', 'while', 'during', 'such',
      'before', 'after', 'since', 'until', 'through', 'throughout', 'within', 'between', 'among', 'without',
      'where', 'why', 'which', 'who', 'whose', 'whom', 'what', 'when', 'how',
      'cannot', 'won', 'not'
    ]);

    // 所有英文单词的集合正则模式 - 确保过滤所有英文单词
    const englishWordRegex = /^[a-zA-Z]+$/;

    // 提取词语并计数
    const wordFrequency: Record<string, number> = {};
    
    allContent.forEach(text => {
      if (!text) return;
      
      // 先过滤掉纯英文内容
      if (/^[a-zA-Z0-9\s.,!?:;'"()[\]{}\/\\<>@#$%^&*+=|~`-]+$/.test(text)) return;
      
      // 提取2-4字的中文词组
      for (let i = 0; i < text.length; i++) {
        // 跳过非中文字符
        if (!isChineseChar(text[i])) continue;
        
        // 确保下一个字符也是中文字符才继续处理
        if (i + 1 < text.length && !isChineseChar(text[i + 1])) continue;
        
        // 提取2字词
        if (i + 1 < text.length) {
          const word = text.substring(i, i + 2);
          // 确保是纯中文词组且不是停用词
          if (isChineseChar(word[0]) && isChineseChar(word[1]) && !stopWords.has(word)) {
            wordFrequency[word] = (wordFrequency[word] || 0) + 1;
          }
        }
        
        // 提取3字词
        if (i + 2 < text.length && isChineseChar(text[i + 2])) {
          const word = text.substring(i, i + 3);
          if (isChineseChar(word[0]) && isChineseChar(word[1]) && isChineseChar(word[2]) && !stopWords.has(word)) {
            wordFrequency[word] = (wordFrequency[word] || 0) + 2; // 给3字词更高权重
          }
        }
        
        // 提取4字词
        if (i + 3 < text.length && isChineseChar(text[i + 3])) {
          const word = text.substring(i, i + 4);
          if (isChineseChar(word[0]) && isChineseChar(word[1]) && isChineseChar(word[2]) && isChineseChar(word[3]) && !stopWords.has(word)) {
            wordFrequency[word] = (wordFrequency[word] || 0) + 3; // 给4字词更高权重
          }
        }
      }
    });

    // 强制过滤掉所有英文单词和含英文的词
    const filteredWordFrequency = Object.fromEntries(
      Object.entries(wordFrequency).filter(([word]) => {
        // 确保没有任何英文字母和数字
        if (/[a-zA-Z0-9]/.test(word) || word.trim().length === 0) return false;
        
        // 确保不是单个英文单词
        if (englishWordRegex.test(word)) return false;
        
        // 确保全是中文字符
        for (let i = 0; i < word.length; i++) {
          if (!isChineseChar(word[i])) return false;
        }
        
        return true;
      })
    );
    
    // 给词长更长的词增加权重，并给常见关键词增加优先级
    const weightedWordFrequency = Object.fromEntries(
      Object.entries(filteredWordFrequency).map(([word, count]) => {
        // 根据词长增加权重
        const lengthWeight = word.length - 1; // 2字词+1，3字词+2，4字词+3
        let finalWeight = count + count * lengthWeight * 0.5; // 增加50%×词长的权重
        
        // 如果是分类关键词，增加额外权重
        const isInCategory = CATEGORIES.some(category => 
          category.keywords.some(keyword => 
            word.includes(keyword) || keyword.includes(word)
          )
        );
        
        if (isInCategory) {
          finalWeight *= 1.2; // 分类词增加20%权重
        }
        
        return [word, finalWeight];
      })
    );

    // Convert to array and sort by frequency
    const sortedWords = Object.entries(weightedWordFrequency)
      .filter(([_, count]) => count >= minFrequency) // Apply minimum frequency filter
      .sort((a, b) => b[1] - a[1])
      .slice(0, maxWords); // Limit to max words

    // 如果没有找到足够的中文词，则增加显示的单个汉字作为补充
    if (sortedWords.length < 5) {
      // 收集单个汉字及频次
      const singleCharFreq: Record<string, number> = {};
      
      allContent.forEach(text => {
        if (!text) return;
        
        for (let i = 0; i < text.length; i++) {
          const char = text[i];
          if (isChineseChar(char) && !/[a-zA-Z0-9\s.,!?:;'"()[\]{}\/\\<>@#$%^&*+=|~`-]/.test(char)) {
            singleCharFreq[char] = (singleCharFreq[char] || 0) + 1;
          }
        }
      });
      
      // 添加到结果中
      const singleChars = Object.entries(singleCharFreq)
        .filter(([_, count]) => count >= minFrequency)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10);
      
      // 合并结果
      sortedWords.push(...singleChars);
    }

    // Assign categories and colors to words
    return sortedWords.map(([text, value]) => {
      // Find matching category based on keywords
      const matchingCategory = CATEGORIES.find(category => 
        category.keywords.some(keyword => 
          text.includes(keyword) || keyword.includes(text)
        )
      );

      return {
        text,
        value,
        category: matchingCategory?.name || DEFAULT_CATEGORY.name,
        color: matchingCategory?.color || DEFAULT_CATEGORY.color
      };
    });
  }, [trendingData, selectedPlatforms, minFrequency, maxWords]);

  // Filter words by selected category and apply final safety check
  const filteredWords = useMemo(() => {
    // 应用最终安全过滤，确保只有中文词
    const safeWords = wordData.filter(word => isValidChineseWord(word.text));
    
    if (!selectedCategory) return safeWords;
    return safeWords.filter(word => word.category === selectedCategory);
  }, [wordData, selectedCategory]);

  // Group words by category for the legend
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = { [DEFAULT_CATEGORY.name]: 0 };
    CATEGORIES.forEach(cat => { counts[cat.name] = 0; });
    
    wordData.forEach(word => {
      counts[word.category] = (counts[word.category] || 0) + 1;
    });
    
    return counts;
  }, [wordData]);

  // Calculate sizes for words based on frequency
  const getSizeStyle = (value: number) => {
    // Find the max value for scaling
    const maxValue = Math.max(...wordData.map(w => w.value));
    const minSize = 0.9; // 稍微提高最小字体大小
    const maxSize = 3.2; // 提高最大字体大小让重要词更突出
    
    // Scale between min and max size - using a slightly non-linear scaling to emphasize differences
    const normalizedValue = value / maxValue;
    const size = minSize + (Math.pow(normalizedValue, 0.8) * (maxSize - minSize));
    
    return {
      fontSize: `${size}rem`,
      fontWeight: value > maxValue / 2 ? 'bold' : value > maxValue / 3 ? '500' : 'normal'
    };
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100">热门关键词云</h3>
        
        <div className="flex flex-wrap gap-3 items-center">
          {/* Category filters */}
          <div className="inline-flex items-center p-1 bg-gray-100 dark:bg-gray-700 rounded-lg">
            <button
              onClick={() => setSelectedCategory(null)}
              className={`px-3 py-1 text-xs rounded-lg transition-all ${
                !selectedCategory 
                  ? 'bg-white dark:bg-gray-600 shadow-sm text-gray-800 dark:text-gray-100' 
                  : 'text-gray-600 dark:text-gray-300'
              }`}
            >
              全部
            </button>
            {CATEGORIES.map(category => (
              <button
                key={category.name}
                onClick={() => setSelectedCategory(category.name === selectedCategory ? null : category.name)}
                className={`px-3 py-1 text-xs rounded-lg transition-all ${
                  selectedCategory === category.name
                    ? 'shadow-sm'
                    : 'opacity-70'
                }`}
                style={{
                  backgroundColor: selectedCategory === category.name 
                    ? category.color 
                    : 'transparent',
                  color: selectedCategory === category.name 
                    ? 'white' 
                    : category.color
                }}
              >
                {category.name} ({categoryCounts[category.name] || 0})
              </button>
            ))}
          </div>
          
          {/* 频率阈值滑块 */}
          <div className="relative">
            <button 
              onClick={() => setIsFrequencySliderOpen(!isFrequencySliderOpen)}
              className="flex items-center gap-2 px-3 py-1.5 text-xs bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-650 transition-colors"
            >
              <span>最小频率: {minFrequency}</span>
              <svg 
                className={`w-3.5 h-3.5 text-gray-500 transition-transform ${isFrequencySliderOpen ? 'transform rotate-180' : ''}`} 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
              </svg>
            </button>
            
            {isFrequencySliderOpen && (
              <div className="absolute right-0 mt-1 py-3 px-4 bg-white dark:bg-gray-700 rounded-lg shadow-lg border border-gray-200 dark:border-gray-600 z-10 min-w-[160px]">
                <div className="text-xs text-gray-500 dark:text-gray-400 mb-2">调整最小出现频率</div>
                <input 
                  type="range" 
                  min="1" 
                  max="5" 
                  step="1" 
                  value={minFrequency}
                  onChange={(e) => setMinFrequency(parseInt(e.target.value))}
                  className="w-full accent-primary-500"
                />
                <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
                  <span>1</span>
                  <span>2</span>
                  <span>3</span>
                  <span>4</span>
                  <span>5</span>
                </div>
              </div>
            )}
          </div>
          
          {/* 改进的词数量下拉框 */}
          <div className="relative">
            <button 
              onClick={() => setIsMaxWordsOpen(!isMaxWordsOpen)}
              className="flex items-center gap-2 px-3 py-1.5 text-xs bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-650 transition-colors"
            >
              <span>显示{maxWords}个词</span>
              <svg 
                className={`w-3.5 h-3.5 text-gray-500 transition-transform ${isMaxWordsOpen ? 'transform rotate-180' : ''}`} 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
              </svg>
            </button>
            
            {isMaxWordsOpen && (
              <div className="absolute right-0 mt-1 py-1 bg-white dark:bg-gray-700 rounded-lg shadow-lg border border-gray-200 dark:border-gray-600 z-10 min-w-[100px]">
                {[30, 50, 80, 100].map(value => (
                  <button
                    key={value}
                    onClick={() => {
                      setMaxWords(value);
                      setIsMaxWordsOpen(false);
                    }}
                    className={`block w-full text-left px-4 py-1.5 text-xs ${
                      maxWords === value 
                        ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400'
                        : 'text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-650'
                    }`}
                  >
                    {value}个词
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
      
      {filteredWords.length > 0 ? (
        <div className="relative">
          {/* Cloud container with perspective effect */}
          <div 
            className="p-4 min-h-[400px] flex flex-wrap justify-center items-center gap-x-4 gap-y-3 perspective"
            style={{ perspective: '500px' }}
          >
            {filteredWords.map((word, index) => (
              <motion.div
                key={word.text}
                initial={{ opacity: 0, scale: 0.5, rotateY: -10, rotateX: 5 }}
                animate={{ 
                  opacity: hoveredWord && hoveredWord !== word.text ? 0.3 : 1, 
                  scale: 1,
                  rotateY: (index % 5 - 2) * 5, 
                  rotateX: (Math.floor(index / 5) % 3 - 1) * 5,
                  translateZ: (word.value / Math.max(...filteredWords.map(w => w.value))) * 30 // 让高频词更凸出
                }}
                transition={{ duration: 0.5, delay: index * 0.01 }}
                className="transform inline-block whitespace-nowrap m-1 px-2 py-1 rounded-md cursor-pointer transition-all"
                style={{
                  ...getSizeStyle(word.value),
                  color: word.color,
                  backgroundColor: `${word.color}10`,
                  borderLeft: hoveredWord === word.text ? `3px solid ${word.color}` : 'none',
                  boxShadow: hoveredWord === word.text ? `0 2px 10px ${word.color}30` : 'none',
                  letterSpacing: '0.05em' // 增加中文间距让词更清晰
                }}
                onMouseEnter={() => setHoveredWord(word.text)}
                onMouseLeave={() => setHoveredWord(null)}
                whileHover={{ scale: 1.1, rotate: 0 }} // 悬停时放大并归正角度
              >
                {word.text}
              </motion.div>
            ))}
          </div>
          
          {/* Hover info panel */}
          {hoveredWord && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="absolute top-2 right-2 bg-white dark:bg-gray-750 p-3 rounded-lg shadow-lg border border-gray-100 dark:border-gray-700 max-w-xs"
            >
              <div className="text-base font-medium text-gray-800 dark:text-gray-100 mb-1">
                {hoveredWord}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-300 mb-2">
                出现次数: <span className="font-medium">{wordData.find(w => w.text === hoveredWord)?.value || 0}</span>
              </div>
              <div className="text-xs">
                <span className="inline-flex items-center gap-1.5">
                  <span
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: wordData.find(w => w.text === hoveredWord)?.color }}
                  ></span>
                  <span className="text-gray-500 dark:text-gray-400">
                    分类: {wordData.find(w => w.text === hoveredWord)?.category}
                  </span>
                </span>
              </div>
            </motion.div>
          )}
        </div>
      ) : (
        <div className="py-20 text-center text-gray-500 dark:text-gray-400">
          没有找到符合条件的关键词
        </div>
      )}
      
      {/* Legend and statistics */}
      <div className="mt-6 pt-6 border-t border-gray-100 dark:border-gray-700">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">热词分类</h4>
            <div className="flex flex-wrap gap-2">
              {[...CATEGORIES, DEFAULT_CATEGORY].map(category => (
                <div 
                  key={category.name}
                  className="flex items-center gap-1.5 bg-gray-50 dark:bg-gray-750 px-2.5 py-1.5 rounded-lg"
                >
                  <div 
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: category.color }}
                  ></div>
                  <span className="text-xs text-gray-700 dark:text-gray-300">
                    {category.name}
                  </span>
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {categoryCounts[category.name] || 0}
                  </span>
                </div>
              ))}
            </div>
          </div>
          
          <div>
            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">统计信息</h4>
            <div className="grid grid-cols-2 gap-2">
              <div className="bg-gray-50 dark:bg-gray-750 p-2.5 rounded-lg">
                <div className="text-xs text-gray-500 dark:text-gray-400">总词数</div>
                <div className="text-lg font-medium text-gray-800 dark:text-gray-100">
                  {wordData.length}
                </div>
              </div>
              <div className="bg-gray-50 dark:bg-gray-750 p-2.5 rounded-lg">
                <div className="text-xs text-gray-500 dark:text-gray-400">最高频次</div>
                <div className="text-lg font-medium text-gray-800 dark:text-gray-100">
                  {wordData.length > 0 ? wordData[0].value : 0}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 