"use client";

import { motion } from 'framer-motion';
import Link from 'next/link';
import { useState, useEffect, useRef } from 'react';
import { PlatformInfo, TrendingItem as TrendingItemType } from '../types';
import { fetchMultiPlatformData } from '../utils/api';
import LoadingSpinner from './LoadingSpinner';

interface PlatformCardProps {
  platform: PlatformInfo;
  index: number;
  trendingItems?: TrendingItemType[]; // Add optional trendingItems prop
}

export default function PlatformCard({ platform, index, trendingItems: propTrendingItems }: PlatformCardProps) {
  const [trendingItems, setTrendingItems] = useState<TrendingItemType[]>([]);
  const [loading, setLoading] = useState(propTrendingItems ? false : true);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // 使用props中的数据或者加载平台热点数据
  useEffect(() => {
    // 如果有传入的trendingItems，直接使用
    if (propTrendingItems) {
      setTrendingItems(propTrendingItems.slice(0, 10));
      setLoading(false);
      return;
    }
    
    // 否则，从API获取数据
    const fetchData = async () => {
      try {
        // 使用新的多平台API获取数据
        const response = await fetchMultiPlatformData([platform.code]);
        const platformResponse = response[platform.code];
        
        if (platformResponse && platformResponse.status === '200') {
          // 调试掘金平台数据
          if (platform.code === 'juejin') {
            console.log('掘金平台原始数据:', JSON.stringify(platformResponse.data.slice(0, 3)));
          }
          
          // 过滤掉没有标题的项目
          const validItems = platformResponse.data
            .filter(item => item.title && item.title.trim() !== '')
            .slice(0, 10);
          
          // 再次检查过滤后的掘金数据
          if (platform.code === 'juejin') {
            console.log('掘金平台过滤后数据:', JSON.stringify(validItems.slice(0, 3)));
          }
          
          setTrendingItems(validItems);
        }
      } catch (error) {
        console.error(`Error fetching ${platform.code} data:`, error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [platform.code, propTrendingItems]);

  // 处理滚动容器的滚动边界问题
  useEffect(() => {
    const scrollContainer = scrollContainerRef.current;
    if (!scrollContainer) return;

    const handleWheel = (e: WheelEvent) => {
      const { deltaY } = e;
      const { scrollTop, scrollHeight, clientHeight } = scrollContainer;
      const isScrollingUp = deltaY < 0;
      const isScrollingDown = deltaY > 0;
      
      // 检查是否已到达容器顶部或底部
      const isAtTop = scrollTop === 0;
      const isAtBottom = Math.abs(scrollHeight - scrollTop - clientHeight) < 1;
      
      // 如果在顶部继续向上滚动，或者在底部继续向下滚动，则阻止事件
      if ((isAtTop && isScrollingUp) || (isAtBottom && isScrollingDown)) {
        e.preventDefault();
      }
    };

    // 添加被动事件监听器，必须使用{passive: false}才能调用preventDefault
    scrollContainer.addEventListener('wheel', handleWheel, { passive: false });
    
    // 清理函数
    return () => {
      scrollContainer.removeEventListener('wheel', handleWheel);
    };
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
      className="bg-white dark:bg-gray-800 rounded-xl shadow-card overflow-hidden h-full border border-gray-100 dark:border-gray-700 transform hover:-translate-y-1 hover:shadow-elevated transition-all duration-300"
    >
      <div className="h-full flex flex-col">
        <div 
          className="h-3 w-full" 
          style={{ 
            background: `linear-gradient(to right, ${platform.color || '#3b76ea'}, ${adjustColor(platform.color || '#3b76ea', 20)})` 
          }}
        />
        
        <div className="p-6 flex-grow flex flex-col">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">
              {platform.name}
            </h3>
            <span 
              className="text-xs px-2.5 py-1 rounded-full flex items-center" 
              style={{ 
                backgroundColor: `${platform.color}15` || '#f1f5f9',
                color: platform.color || '#64748b'
              }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {trendingItems.length > 0 && trendingItems[0].publish_time 
                ? trendingItems[0].publish_time.split(' ')[1] 
                : platform.updateFrequency}
            </span>
          </div>
          
          <p className="text-sm text-gray-600 dark:text-gray-300 mb-4 line-clamp-2">
            {platform.description}
          </p>
          
          {/* 热点列表 */}
          <div 
            ref={scrollContainerRef}
            className="mt-2 flex-grow overflow-y-auto custom-scrollbar max-h-64"
          >
            {loading ? (
              <div className="flex justify-center items-center py-4">
                <LoadingSpinner size="sm" />
              </div>
            ) : trendingItems.length > 0 ? (
              <div className="space-y-2">
                {trendingItems.map((item, idx) => (
                  <HotItem 
                    key={`${platform.code}-${idx}`} 
                    item={item} 
                    rank={idx + 1} 
                    platformColor={platform.color} 
                  />
                ))}
              </div>
            ) : (
              <div className="text-sm text-gray-500 dark:text-gray-400 italic py-2 text-center">
                暂无热点数据
              </div>
            )}
          </div>
        </div>
        
        <div className="px-6 py-3 border-t border-gray-100 dark:border-gray-700 flex justify-end">
          <Link 
            href={`/platform/${platform.code}`}
            className="text-xs text-primary-600 dark:text-primary-400 font-medium flex items-center hover:text-primary-700 dark:hover:text-primary-300 transition-colors"
          >
            查看全部
            <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </Link>
        </div>
      </div>
    </motion.div>
  );
}

// 热点项组件
function HotItem({ item, rank, platformColor = '#3b76ea' }: { 
  item: TrendingItemType; 
  rank: number; 
  platformColor?: string;
}) {
  // 格式化时间，只显示时分秒
  const formatTime = (timeString?: string) => {
    if (!timeString) return null;
    const parts = timeString.split(' ');
    return parts.length > 1 ? parts[1] : timeString;
  };

  // 如果没有标题，则不显示该项目
  if (!item.title || item.title.trim() === '') {
    // 如果有 publish_time 但没有标题，显示一个占位符
    if (item.publish_time) {
      return (
        <div className="flex items-start gap-2 group p-2 rounded-lg text-gray-400 dark:text-gray-500 italic">
          <div 
            className={`flex-shrink-0 w-6 h-6 flex items-center justify-center rounded-md text-xs font-medium opacity-50`}
            style={{ 
              backgroundColor: `${platformColor}15`,
              color: platformColor
            }}
          >
            {rank}
          </div>
          <div className="flex-grow min-w-0">
            <p className="text-sm">暂无内容</p>
            <div className="mt-1 flex items-center">
              <span className="text-xs flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {formatTime(item.publish_time)}
              </span>
            </div>
          </div>
        </div>
      );
    }
    return null;
  }

  // 根据排名确定样式
  const getRankStyles = () => {
    // 默认样式
    let styles = {
      bgColor: `${platformColor}15`,
      textColor: platformColor,
      animation: '',
      shadow: '',
    };
    
    // 特殊排名样式
    if (rank === 1) {
      styles.bgColor = '#FF4D4F';
      styles.textColor = 'white';
      styles.animation = 'animate-pulse';
      styles.shadow = 'shadow-md shadow-red-500/30';
    } else if (rank === 2) {
      styles.bgColor = '#FF7A45';
      styles.textColor = 'white';
      styles.animation = 'animate-pulse';
      styles.shadow = 'shadow-sm shadow-orange-500/20';
    } else if (rank === 3) {
      styles.bgColor = '#FFA940';
      styles.textColor = 'white';
      styles.animation = 'animate-pulse';
      styles.shadow = 'shadow-sm shadow-yellow-500/20';
    }
    
    return styles;
  };
  
  const rankStyles = getRankStyles();
  
  return (
    <a 
      href={item.url} 
      target="_blank" 
      rel="noopener noreferrer"
      className="flex items-start gap-2 group hover:bg-gray-50 dark:hover:bg-gray-750 p-2 rounded-lg transition-colors"
    >
      <div 
        className={`flex-shrink-0 w-6 h-6 flex items-center justify-center rounded-md text-xs font-medium ${rankStyles.animation} ${rankStyles.shadow}`}
        style={{ 
          backgroundColor: rankStyles.bgColor,
          color: rankStyles.textColor
        }}
      >
        {rank}
      </div>
      
      <div className="flex-grow min-w-0">
        <h4 className="text-sm font-medium text-gray-800 dark:text-gray-200 truncate group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
          {item.title}
        </h4>
        
        {item.score && (
          <div className="mt-1 flex items-center">
            <span className="text-xs text-gray-500 dark:text-gray-400 flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
              {formatNumber(item.score)}
            </span>
            {item.publish_time && (
              <span className="text-xs text-gray-400 dark:text-gray-500 ml-2 flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {formatTime(item.publish_time)}
              </span>
            )}
          </div>
        )}
        {!item.score && item.publish_time && (
          <div className="mt-1 flex items-center">
            <span className="text-xs text-gray-400 dark:text-gray-500 flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {formatTime(item.publish_time)}
            </span>
          </div>
        )}
      </div>
    </a>
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