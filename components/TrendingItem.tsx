"use client";

import { motion } from 'framer-motion';
import { useTranslations } from 'next-intl';
import { TrendingItem as TrendingItemType } from '../types';

interface TrendingItemProps {
  item: TrendingItemType;
  index: number;
  platformColor?: string;
}

export default function TrendingItem({ item, index, platformColor = '#3b76ea' }: TrendingItemProps) {
  const t = useTranslations('trendingItem');

  const formatTime = (timeString?: string) => {
    if (!timeString) return t('latest');
    const parts = timeString.split(' ');
    return parts.length > 1 ? parts[1] : timeString;
  };

  if (!item.title || item.title.trim() === '') {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2, delay: index * 0.05 }}
      className="group"
    >
      <a href={item.url} target="_blank" rel="noopener noreferrer" className="block p-5 bg-white dark:bg-gray-800 border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors">
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0 w-9 h-9 flex items-center justify-center rounded-lg text-white font-medium text-sm shadow-sm transition-all duration-300 group-hover:shadow-md" style={{ background: `linear-gradient(135deg, ${platformColor}, ${adjustColor(platformColor, -20)})`, transform: 'translateZ(0)' }}>{index + 1}</div>

          <div className="flex-grow">
            <h3 className="text-base font-medium text-gray-900 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">{item.title}</h3>

            {item.desc && <p className="mt-2 text-sm text-gray-600 dark:text-gray-300 line-clamp-2 leading-relaxed">{item.desc}</p>}

            <div className="mt-3 flex items-center gap-3">
              {item.score && (
                <span className="text-xs px-2.5 py-1 rounded-full flex items-center" style={{ backgroundColor: `${platformColor}15`, color: platformColor }}>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                  {t('heat', {value: formatNumber(item.score)})}
                </span>
              )}

              <span className="text-xs text-gray-400 dark:text-gray-500 flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {formatTime(item.publish_time || item.pubDate)}
              </span>
            </div>
          </div>
        </div>
      </a>
    </motion.div>
  );
}

function formatNumber(value: string): string {
  const num = parseInt(value);
  if (isNaN(num)) return value;
  if (num >= 10000) return (num / 10000).toFixed(1) + '万';
  return num.toLocaleString();
}

function adjustColor(color: string, amount: number): string {
  if (color.startsWith('#')) {
    let hex = color.slice(1);
    if (hex.length === 3) hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
    const r = parseInt(hex.slice(0, 2), 16);
    const g = parseInt(hex.slice(2, 4), 16);
    const b = parseInt(hex.slice(4, 6), 16);
    const newR = Math.max(0, Math.min(255, r + amount));
    const newG = Math.max(0, Math.min(255, g + amount));
    const newB = Math.max(0, Math.min(255, b + amount));
    return `#${newR.toString(16).padStart(2, '0')}${newG.toString(16).padStart(2, '0')}${newB.toString(16).padStart(2, '0')}`;
  }
  return color;
}
