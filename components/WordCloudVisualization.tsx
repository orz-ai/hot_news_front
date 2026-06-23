"use client";

import { AnimatePresence, motion } from 'framer-motion';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslations } from 'next-intl';
import { PlatformType, TrendingItem } from '../types';
import { fetchKeywordCloud } from '../utils/api';
import LoadingSpinner from './LoadingSpinner';

interface WordCloudVisualizationProps {
  trendingData: Record<PlatformType, TrendingItem[]>;
  selectedPlatforms?: PlatformType[];
}

const CATEGORY_DEFINITIONS = [
  { id: 'tech', color: '#3B82F6', keywords: ['科技', '技术', '数字', '智能', 'AI', '人工智能', '算法', '编程', '开发', '软件', '互联网', '创新', '电脑', '手机', '平台', '系统', '网络', '设备'] },
  { id: 'entertainment', color: '#8B5CF6', keywords: ['明星', '娱乐', '综艺', '电影', '电视', '剧集', '音乐', '艺人', '演员', '歌手', '导演', '电视剧', '影片', '节目', '作品', '表演', '爱豆'] },
  { id: 'social', color: '#EC4899', keywords: ['社会', '事件', '新闻', '政策', '热议', '事故', '热点', '公共', '话题', '民生', '现象', '问题', '舆论', '讨论'] },
  { id: 'finance', color: '#F59E0B', keywords: ['财经', '经济', '股市', '基金', '金融', '投资', '理财', '市场', '企业', '公司', '股票', '销售', '价格', '产业', '商业'] },
  { id: 'sports', color: '#EF4444', keywords: ['体育', '赛事', '足球', '篮球', '比赛', '运动', '球员', '联赛', '队员', '冠军', '球队', '战绩', '得分'] },
] as const;

const DEFAULT_CATEGORY = { id: 'other', color: '#6B7280' } as const;

function debounce<T extends (...args: any[]) => any>(func: T, wait: number): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;
  return (...args: Parameters<T>) => {
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

export default function WordCloudVisualization({ selectedPlatforms }: WordCloudVisualizationProps) {
  const t = useTranslations('wordCloud');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [maxWords, setMaxWords] = useState(100);
  const [isMaxWordsOpen, setIsMaxWordsOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [apiKeywords, setApiKeywords] = useState<Array<{ text: string; weight: number }>>([]);
  const containerRef = useRef<HTMLDivElement>(null);
  const isFirstRender = useRef(true);
  const prevMaxWords = useRef(maxWords);

  const categories = useMemo(
    () => CATEGORY_DEFINITIONS.map((item) => ({ ...item, name: t(`categories.${item.id}`) })),
    [t]
  );

  const getCategoryForKeyword = useCallback(
    (text: string) => {
      const lowercaseText = text.toLowerCase();

      for (const cat of categories) {
        if (lowercaseText.includes(cat.name.toLowerCase())) {
          return cat;
        }
      }

      for (const cat of CATEGORY_DEFINITIONS) {
        for (const keyword of cat.keywords) {
          if (lowercaseText.includes(keyword.toLowerCase())) {
            return categories.find((item) => item.id === cat.id) || { ...DEFAULT_CATEGORY, name: t('categories.other') };
          }
        }
      }

      return { ...DEFAULT_CATEGORY, name: t('categories.other') };
    },
    [categories, t]
  );

  useEffect(() => {
    const loadKeywordCloudData = async () => {
      try {
        setLoading(true);
        const response = await fetchKeywordCloud({
          keyword_count: maxWords,
          platforms: selectedPlatforms?.join(','),
        });

        if (response.status === 'success') {
          setApiKeywords(response.keyword_clouds.all || []);
        }
      } catch (error) {
        console.error('Error fetching keyword cloud data:', error);
      } finally {
        setLoading(false);
      }
    };

    if (isFirstRender.current || selectedCategory !== null) {
      loadKeywordCloudData();
      isFirstRender.current = false;
    } else if (maxWords !== prevMaxWords.current) {
      debounce(loadKeywordCloudData, 300)();
    }

    prevMaxWords.current = maxWords;
  }, [selectedCategory, maxWords, selectedPlatforms]);

  const processedWords = useMemo(() => {
    if (loading || apiKeywords.length === 0) return [];

    const limitedKeywords = apiKeywords.slice(0, maxWords);
    const weights = limitedKeywords.map((item) => item.weight);
    const maxVal = Math.max(...weights);
    const minVal = Math.min(...weights);
    const minSize = 14;
    const maxSize = 36;

    return limitedKeywords.map((keyword) => {
      const foundCategory = getCategoryForKeyword(keyword.text);
      const normalizedWeight = maxVal === minVal ? 0.5 : (keyword.weight - minVal) / (maxVal - minVal);
      const fontSize = minSize + Math.pow(normalizedWeight, 0.8) * (maxSize - minSize);

      return {
        text: keyword.text,
        value: keyword.weight,
        category: foundCategory.name,
        categoryId: 'id' in foundCategory ? foundCategory.id : DEFAULT_CATEGORY.id,
        color: foundCategory.color,
        fontSize: Math.round(fontSize),
      };
    });
  }, [apiKeywords, getCategoryForKeyword, loading, maxWords]);

  const filteredWords = useMemo(() => {
    if (!selectedCategory) return processedWords;
    return processedWords.filter((word) => word.categoryId === selectedCategory);
  }, [processedWords, selectedCategory]);

  const sortedWords = useMemo(() => [...filteredWords].sort((a, b) => b.value - a.value), [filteredWords]);

  const spherePositions = useMemo(() => {
    if (!sortedWords.length) return [];
    const visibleWords = sortedWords.slice(0, Math.min(sortedWords.length, 150));

    return visibleWords.map((word, index) => {
      const phi = Math.acos(-1 + (2 * index) / visibleWords.length);
      const theta = Math.PI * (1 + Math.sqrt(5)) * index;
      const x = Math.cos(theta) * Math.sin(phi);
      const y = Math.sin(theta) * Math.sin(phi);
      const z = Math.cos(phi);

      return {
        ...word,
        position: { x, y, z },
        opacity: ((z + 1) / 2) * 0.7 + 0.3,
      };
    });
  }, [sortedWords]);

  useEffect(() => {
    if (!containerRef.current) return;
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          containerRef.current?.classList.add('is-visible');
        }
      });
    }, { threshold: 0.1 });

    observer.observe(containerRef.current);
    return () => {
      if (containerRef.current) observer.unobserve(containerRef.current);
    };
  }, []);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 p-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100 flex items-center">
          <svg className="w-5 h-5 mr-2 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
          </svg>
          {t('title')}
        </h3>

        <div className="flex flex-wrap gap-3" role="toolbar" aria-label={t('toolbarAria')}>
          <div className="flex gap-1.5 bg-gray-50 dark:bg-gray-750 p-1.5 rounded-full shadow-inner overflow-x-auto" role="radiogroup" aria-label={t('categoryFilterAria')}>
            <button
              onClick={() => setSelectedCategory(null)}
              className={`px-3 py-1.5 text-xs rounded-full transition-all whitespace-nowrap ${selectedCategory === null ? 'bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 shadow-sm font-medium' : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'}`}
              aria-pressed={selectedCategory === null}
              role="radio"
            >
              {t('all')}
            </button>

            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`px-3 py-1.5 text-xs rounded-full transition-all whitespace-nowrap ${selectedCategory === category.id ? 'bg-white dark:bg-gray-700 shadow-sm font-medium' : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'}`}
                style={{ color: selectedCategory === category.id ? category.color : '' }}
                aria-pressed={selectedCategory === category.id}
                role="radio"
              >
                {category.name}
              </button>
            ))}
          </div>

          <div className="relative">
            <button
              onClick={() => setIsMaxWordsOpen(!isMaxWordsOpen)}
              className="flex items-center gap-1 px-3.5 py-1.5 text-xs bg-gray-50 dark:bg-gray-750 rounded-full text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-all shadow-inner"
              aria-haspopup="true"
              aria-expanded={isMaxWordsOpen}
              aria-label={t('wordCountAria', { count: maxWords })}
            >
              <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16m-7 6h7" />
              </svg>
              <span>{t('showWordCount', { count: maxWords })}</span>
              <svg className={`w-3 h-3 ml-1 transition-transform ${isMaxWordsOpen ? 'transform rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            <AnimatePresence>
              {isMaxWordsOpen && (
                <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }} className="absolute right-0 mt-2 w-40 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-100 dark:border-gray-700 z-10 overflow-hidden" role="menu" aria-orientation="vertical">
                  {[50, 100, 150, 200].map((num) => (
                    <button
                      key={num}
                      className={`block w-full px-4 py-2 text-xs text-left hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors ${maxWords === num ? 'bg-gray-50 dark:bg-gray-750 text-blue-600 dark:text-blue-400 font-medium' : 'text-gray-700 dark:text-gray-300'}`}
                      onClick={() => {
                        setMaxWords(num);
                        setIsMaxWordsOpen(false);
                      }}
                      role="menuitem"
                      aria-current={maxWords === num ? 'true' : 'false'}
                    >
                      {t('wordCountOption', { count: num })}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      <div ref={containerRef} className="relative h-[350px] rounded-xl bg-white dark:bg-gray-800 overflow-hidden shadow-inner word-cloud-container" role="region" aria-label={t('visualizationAria')}>
        {loading ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center" aria-live="polite">
            <LoadingSpinner size="lg" className="mb-4" />
            <div className="text-sm text-gray-500 dark:text-gray-400">{t('loading')}</div>
          </div>
        ) : spherePositions.length === 0 ? (
          <div className="absolute inset-0 flex items-center justify-center text-gray-500 dark:text-gray-400" aria-live="polite">
            {t('empty')}
          </div>
        ) : (
          <div className="w-full h-full flex items-center justify-center perspective-800">
            <div className="rotating-sphere w-[300px] h-[300px] relative" aria-hidden="true">
              {spherePositions.map((word, index) => {
                const radius = 150;
                const { x, y, z } = word.position;
                const translateX = x * radius;
                const translateY = y * radius;
                const translateZ = z * radius;
                const importance = index < 5 ? 1.2 : index < 15 ? 1 : 0.8;

                return (
                  <div
                    key={word.text}
                    className="absolute left-1/2 top-1/2 transform-gpu word-item"
                    style={{
                      transform: `translate(-50%, -50%) translate3d(${translateX}px, ${translateY}px, ${translateZ}px) rotateY(${Math.atan2(x, z)}rad) rotateX(${-Math.atan2(y, Math.sqrt(x * x + z * z))}rad)`,
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

            <div className="sr-only">
              <ul>
                {spherePositions.slice(0, 20).map((word, index) => (
                  <li key={index}>{t('srItem', { text: word.text, value: word.value, category: word.category })}</li>
                ))}
                {spherePositions.length > 20 && <li>{t('srMore', { count: spherePositions.length - 20 })}</li>}
              </ul>
            </div>
          </div>
        )}
      </div>

      <div className="mt-4 text-xs text-gray-500 dark:text-gray-400 flex items-center justify-center">
        <svg className="w-4 h-4 mr-1 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        {t('description')}
      </div>

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
          from { transform: rotateY(0deg); }
          to { transform: rotateY(360deg); }
        }
      `}</style>
    </div>
  );
}
