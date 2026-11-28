"use client";

import { motion } from 'framer-motion';
import Link from 'next/link';
import { useEffect, useRef, useState, type CSSProperties } from 'react';
import { useTranslations } from 'next-intl';
import { PlatformInfo, TrendingItem as TrendingItemType } from '../types';
import { fetchMultiPlatformData } from '../utils/api';
import LoadingSpinner from './LoadingSpinner';
import LocalTime from './LocalTime';

interface PlatformCardProps {
  platform: PlatformInfo;
  index: number;
  trendingItems?: TrendingItemType[];
  maxItems?: number;
}

export default function PlatformCard({ platform, index, trendingItems: propTrendingItems, maxItems = 10 }: PlatformCardProps) {
  const [trendingItems, setTrendingItems] = useState<TrendingItemType[]>([]);
  const [loading, setLoading] = useState(propTrendingItems ? false : true);
  const t = useTranslations('platformCard');

  useEffect(() => {
    if (propTrendingItems) {
      setTrendingItems(propTrendingItems.slice(0, maxItems));
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      try {
        const response = await fetchMultiPlatformData([platform.code]);
        const platformResponse = response[platform.code];

        if (platformResponse && platformResponse.status === '200') {
          const validItems = platformResponse.data.filter(item => item.title && item.title.trim() !== '').slice(0, maxItems);
          setTrendingItems(validItems);
        }
      } catch (error) {
        console.error(`Error fetching ${platform.code} data:`, error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [platform.code, propTrendingItems, maxItems]);


  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
      className="bg-white dark:bg-gray-800 rounded-xl shadow-card overflow-hidden h-full min-h-[440px] border border-gray-100 dark:border-gray-700 transform hover:-translate-y-1 hover:shadow-elevated transition-all duration-300"
    >
      <div className="h-full flex flex-col">
        <div className="px-6 pt-6 pb-0 flex-1 min-h-0 flex flex-col">
          <div className="flex items-center justify-between mb-3 gap-3">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">{platform.name}</h3>
            <span className="text-xs px-2.5 py-1 rounded-full flex items-center whitespace-nowrap" style={{ backgroundColor: `${platform.color}15` || '#f1f5f9', color: platform.color || '#64748b' }}>
              {trendingItems.length > 0 && trendingItems[0].publish_time ? <LocalTime value={trendingItems[0].publish_time} timeOnly /> : platform.updateFrequency}
            </span>
          </div>

          <div className="mt-2 flex-1 min-h-0 overflow-y-auto overscroll-y-auto custom-scrollbar">
            {loading ? (
              <div className="flex justify-center items-center py-4">
                <LoadingSpinner size="sm" />
              </div>
            ) : trendingItems.length > 0 ? (
              <div className="space-y-1">
                {trendingItems.map((item, idx) => (
                  <HotItem key={`${platform.code}-${idx}`} item={item} rank={idx + 1} platformColor={platform.color} />
                ))}
              </div>
            ) : (
              <div className="text-sm text-gray-500 dark:text-gray-400 italic py-2 text-center">{t('noData')}</div>
            )}
          </div>
        </div>

        <div className="px-6 py-3 border-t border-gray-100 dark:border-gray-700 flex items-center justify-between gap-3">
          <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{platform.description}</p>
          <Link href={`/platform/${platform.code}`} className="text-xs text-primary-600 dark:text-primary-400 font-medium flex items-center hover:text-primary-700 dark:hover:text-primary-300 transition-colors">
            {t('viewAll')}
            <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </Link>
        </div>
      </div>
    </motion.div>
  );
}

function HotItem({ item, rank, platformColor = '#3b76ea' }: { item: TrendingItemType; rank: number; platformColor?: string; }) {
  const t = useTranslations('platformCard');
  const titleContainerRef = useRef<HTMLDivElement>(null);
  const titleTextRef = useRef<HTMLSpanElement>(null);
  const [overflowDistance, setOverflowDistance] = useState(0);

  useEffect(() => {
    const container = titleContainerRef.current;
    const title = titleTextRef.current;
    if (!container || !title) return;

    const measureOverflow = () => {
      setOverflowDistance(Math.max(0, title.scrollWidth - container.clientWidth));
    };

    measureOverflow();
    const resizeObserver = new ResizeObserver(measureOverflow);
    resizeObserver.observe(container);
    resizeObserver.observe(title);
    return () => resizeObserver.disconnect();
  }, [item.title]);

  if (!item.title || item.title.trim() === '') {
    if (item.publish_time) {
      return (
        <div className="flex items-start gap-2 group p-2 rounded-lg text-gray-400 dark:text-gray-500 italic">
          <div className="flex-shrink-0 w-6 h-6 flex items-center justify-center rounded-md text-xs font-medium opacity-50" style={{ backgroundColor: `${platformColor}15`, color: platformColor }}>{rank}</div>
          <div className="flex-grow min-w-0">
            <p className="text-sm">{t('emptyContent')}</p>
          </div>
        </div>
      );
    }
    return null;
  }

  const getRankStyles = () => {
    let styles = { bgColor: `${platformColor}15`, textColor: platformColor, animation: '', shadow: '' };
    if (rank === 1) styles = { bgColor: '#FF4D4F', textColor: 'white', animation: 'animate-pulse', shadow: 'shadow-md shadow-red-500/30' };
    else if (rank === 2) styles = { bgColor: '#FF7A45', textColor: 'white', animation: 'animate-pulse', shadow: 'shadow-sm shadow-orange-500/20' };
    else if (rank === 3) styles = { bgColor: '#FFA940', textColor: 'white', animation: 'animate-pulse', shadow: 'shadow-sm shadow-yellow-500/20' };
    return styles;
  };

  const rankStyles = getRankStyles();

  return (
    <a href={item.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 group hover:bg-gray-50 dark:hover:bg-gray-750 px-2 py-1 rounded-lg transition-colors">
      <div className={`flex-shrink-0 w-5 h-5 flex items-center justify-center rounded text-[10px] font-medium ${rankStyles.animation} ${rankStyles.shadow}`} style={{ backgroundColor: rankStyles.bgColor, color: rankStyles.textColor }}>{rank}</div>
      <div ref={titleContainerRef} className="flex-grow min-w-0 overflow-hidden">
        <h4 className="text-sm font-medium text-gray-800 dark:text-gray-200 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors whitespace-nowrap">
          <span
            ref={titleTextRef}
            className={overflowDistance > 0 ? 'inline-block animate-news-marquee' : 'inline-block'}
            style={overflowDistance > 0 ? ({ '--news-marquee-distance': `-${overflowDistance}px`, '--news-marquee-duration': `${overflowDistance / 40}s` } as CSSProperties) : undefined}
          >
            {item.title}
          </span>
        </h4>
      </div>
    </a>
  );
}
