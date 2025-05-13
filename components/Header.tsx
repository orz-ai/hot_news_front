"use client";

import Link from 'next/link';
import { motion } from 'framer-motion';
import { useState, useEffect, useRef, useContext } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { TrendingItem } from '../types';
import { PLATFORMS } from '../constants/platforms';

// 全局热点数据上下文类型
interface GlobalDataContextProps {
  trendingData: Record<string, TrendingItem[]>;
  isLoaded: boolean;
}

export default function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchFocused, setSearchFocused] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<TrendingItem[]>([]);
  const searchRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  const router = useRouter();
  
  // 检测滚动以改变header样式
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // 处理搜索结果的点击外部关闭
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setSearchFocused(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // 从localStorage获取热点数据进行搜索
  useEffect(() => {
    if (searchQuery.trim() === '') {
      setSearchResults([]);
      return;
    }

    // 尝试从localStorage获取热点数据
    try {
      const cachedTrendingData = localStorage.getItem('trendingData');
      if (!cachedTrendingData) {
        return;
      }

      const trendingData: Record<string, TrendingItem[]> = JSON.parse(cachedTrendingData);
      
      // 从所有平台的热点数据中搜索匹配的项目
      const allItems = Object.values(trendingData).flat();
      
      // 根据标题和描述进行搜索
      const results = allItems.filter(item => {
        const titleMatch = item.title && item.title.toLowerCase().includes(searchQuery.toLowerCase());
        const descMatch = item.desc && item.desc.toLowerCase().includes(searchQuery.toLowerCase());
        return titleMatch || descMatch;
      });
      
      // 限制结果数量并按热度排序
      setSearchResults(
        results
          .sort((a, b) => {
            const scoreA = parseInt(a.score || '0') || 0;
            const scoreB = parseInt(b.score || '0') || 0;
            return scoreB - scoreA;
          })
          .slice(0, 8)
      );
    } catch (error) {
      console.error('Error searching cached trending data:', error);
      // 如果无法从缓存获取数据，使用默认搜索结果
      if (searchQuery.trim()) {
        setSearchResults([
          {
            title: `没有找到与"${searchQuery}"相关的热点`,
            url: '#',
            score: '0',
            desc: '可能还没有相关的热点内容或数据正在加载中'
          }
        ]);
      }
    }
  }, [searchQuery]);

  // 移动菜单动画变体
  const menuVariants = {
    open: { 
      opacity: 1, 
      height: 'auto',
      transition: { 
        duration: 0.3,
        staggerChildren: 0.1,
        delayChildren: 0.1
      }
    },
    closed: { 
      opacity: 0, 
      height: 0,
      transition: { 
        duration: 0.3,
        when: "afterChildren",
        staggerChildren: 0.05
      }
    }
  };

  const itemVariants = {
    open: { 
      opacity: 1, 
      y: 0, 
      transition: { duration: 0.3 } 
    },
    closed: { 
      opacity: 0, 
      y: -10, 
      transition: { duration: 0.3 } 
    }
  };

  // 导航项配置
  const navItems = [
    { href: '/', label: '首页', icon: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 mr-2">
        <path d="M11.47 3.84a.75.75 0 011.06 0l8.69 8.69a.75.75 0 101.06-1.06l-8.689-8.69a2.25 2.25 0 00-3.182 0l-8.69 8.69a.75.75 0 001.061 1.06l8.69-8.69z" />
        <path d="M12 5.432l8.159 8.159c.03.03.06.058.091.086v6.198c0 1.035-.84 1.875-1.875 1.875H15a.75.75 0 01-.75-.75v-4.5a.75.75 0 00-.75-.75h-3a.75.75 0 00-.75.75V21a.75.75 0 01-.75.75H5.625a1.875 1.875 0 01-1.875-1.875v-6.198a2.29 2.29 0 00.091-.086L12 5.43z" />
      </svg>
    ) },
    { href: '/all', label: '全部平台', icon: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 mr-2">
        <path fillRule="evenodd" d="M3 6a3 3 0 013-3h2.25a3 3 0 013 3v2.25a3 3 0 01-3 3H6a3 3 0 01-3-3V6zm9.75 0a3 3 0 013-3H18a3 3 0 013 3v2.25a3 3 0 01-3 3h-2.25a3 3 0 01-3-3V6zM3 15.75a3 3 0 013-3h2.25a3 3 0 013 3V18a3 3 0 01-3 3H6a3 3 0 01-3-3v-2.25zm9.75 0a3 3 0 013-3H18a3 3 0 013 3V18a3 3 0 01-3 3h-2.25a3 3 0 01-3-3v-2.25z" clipRule="evenodd" />
      </svg>
    ) },
    { href: '/about', label: '关于', icon: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 mr-2">
        <path fillRule="evenodd" d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12zm8.706-1.442c1.146-.573 2.437.463 2.126 1.706l-.709 2.836.042-.02a.75.75 0 01.67 1.34l-.04.022c-1.147.573-2.438-.463-2.127-1.706l.71-2.836-.042.02a.75.75 0 11-.671-1.34l.041-.022zM12 9a.75.75 0 100-1.5.75.75 0 000 1.5z" clipRule="evenodd" />
      </svg>
    ) },
    { href: '/user', label: '用户中心', icon: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 mr-2">
        <path fillRule="evenodd" d="M7.5 6a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0zM3.751 20.105a8.25 8.25 0 0116.498 0 .75.75 0 01-.437.695A18.683 18.683 0 0112 22.5c-2.786 0-5.433-.608-7.812-1.7a.75.75 0 01-.437-.695z" clipRule="evenodd" />
      </svg>
    ) }
  ];

  // 处理搜索输入变化
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  // 处理搜索结果点击
  const handleResultClick = (item: TrendingItem) => {
    if (item.url) {
      window.open(item.url, '_blank');
    }
    setSearchFocused(false);
    setSearchQuery('');
  };

  return (
    <header 
      className={`sticky top-0 z-50 transition-all duration-300 ${
        scrolled 
          ? 'bg-white/90 dark:bg-gray-900/95 backdrop-blur-md shadow-md' 
          : 'bg-white dark:bg-gray-900'
      } border-b border-gray-100 dark:border-gray-800`}
    >
      <div className="container mx-auto px-4 md:px-5 py-3 md:py-4">
        {/* 桌面布局 */}
        <div className="flex items-center justify-between">
          {/* 左侧 Logo */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
            className="flex-shrink-0 mr-4"
          >
            <Link href="/" className="flex items-center gap-3 group">
              <div className="bg-gradient-to-br from-primary-500 via-primary-600 to-primary-700 text-white p-3 rounded-2xl shadow-lg shadow-primary-500/20 group-hover:shadow-primary-500/30 transition-all duration-300 transform group-hover:scale-105 group-hover:translate-y-[-2px]">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
                </svg>
              </div>
              <div className="flex flex-col">
                <span className="text-xl font-bold text-gray-900 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">热点速览</span>
                <span className="text-xs text-gray-500 dark:text-gray-400">一站式热门内容聚合平台</span>
              </div>
            </Link>
          </motion.div>

          {/* 中间导航 - 桌面端显示 */}
          <motion.nav
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
            className="hidden md:flex justify-center mx-auto"
          >
            <NavMenu navItems={navItems} pathname={pathname} />
          </motion.nav>

          {/* 右侧功能区 */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: 0.2 }}
            className="flex items-center justify-end gap-3 flex-shrink-0 ml-auto"
          >
            {/* 搜索框 */}
            <div ref={searchRef} className="relative">
              <motion.div 
                animate={{ 
                  width: searchFocused ? "300px" : "200px"
                }}
                transition={{ 
                  type: "spring", 
                  stiffness: 300, 
                  damping: 30 
                }}
                className="group"
              >
                <div className="relative flex items-center">
                  <input 
                    type="text" 
                    placeholder="搜索热点内容..." 
                    className="w-full py-2 pl-4 pr-10 bg-gray-50 dark:bg-gray-800/60 border border-gray-100 dark:border-gray-700/50 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/50 dark:focus:ring-primary-400/50 text-gray-700 dark:text-gray-200 transition-all duration-300 focus:bg-white dark:focus:bg-gray-800"
                    onFocus={() => setSearchFocused(true)}
                    onChange={handleSearchChange}
                    value={searchQuery}
                  />
                  <div className="absolute right-3 text-gray-400 dark:text-gray-500 group-hover:text-primary-500 dark:group-hover:text-primary-400 transition-colors duration-300">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                    </svg>
                  </div>
                </div>
                
                {/* 搜索结果下拉菜单 */}
                {searchFocused && searchResults.length > 0 && (
                  <motion.div 
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2 }}
                    className="absolute left-0 right-0 mt-2 py-2 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 z-50 max-h-[70vh] overflow-y-auto custom-scrollbar"
                  >
                    <div className="px-4 py-2 text-xs font-medium uppercase text-gray-500 dark:text-gray-400">
                      搜索结果 ({searchResults.length})
                    </div>
                    {searchResults.map((result, index) => {
                      // 查找结果所属的平台
                      let platformCode = '';
                      // 检查localStorage中是否有记录这个结果的平台
                      try {
                        const cachedTrendingData = localStorage.getItem('trendingData');
                        if (cachedTrendingData) {
                          const trendingData = JSON.parse(cachedTrendingData);
                          // 找到包含此结果的平台
                          for (const [code, items] of Object.entries(trendingData)) {
                            if (Array.isArray(items) && items.some(item => item.title === result.title)) {
                              platformCode = code;
                              break;
                            }
                          }
                        }
                      } catch (error) {
                        console.error('Error finding platform for search result:', error);
                      }
                      
                      // 获取平台信息
                      const platform = PLATFORMS.find(p => p.code === platformCode);
                      
                      // 查找该结果在平台中的排名
                      let ranking = -1;
                      try {
                        const cachedTrendingData = localStorage.getItem('trendingData');
                        if (cachedTrendingData && platformCode) {
                          const trendingData = JSON.parse(cachedTrendingData);
                          const platformItems = trendingData[platformCode];
                          if (Array.isArray(platformItems)) {
                            const index = platformItems.findIndex(item => item.title === result.title);
                            if (index !== -1) {
                              ranking = index + 1; // 排名从1开始
                            }
                          }
                        }
                      } catch (error) {
                        console.error('Error finding ranking for search result:', error);
                      }
                      
                      return (
                        <div 
                          key={index} 
                          className="px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer text-gray-700 dark:text-gray-200 group transition-colors duration-150 border-b border-gray-100 dark:border-gray-700 last:border-b-0"
                          onClick={() => handleResultClick(result)}
                        >
                          <div className="flex items-start gap-3">
                            {platformCode && platform && (
                              <div 
                                className="flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center mt-0.5 relative"
                                style={{
                                  backgroundColor: `${platform.color}20`, // 使用平台颜色作为背景，降低透明度
                                  color: platform.color,
                                  border: `1px solid ${platform.color}40`
                                }}
                              >
                                <span className="text-xs font-bold">{platform.name.substring(0, 2)}</span>
                                {ranking > 0 && (
                                  <div className="absolute -top-2 -right-2 w-4 h-4 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center border border-gray-200 dark:border-gray-600 shadow-sm">
                                    <span className="text-[9px] font-bold text-gray-700 dark:text-gray-300">{ranking}</span>
                                  </div>
                                )}
                              </div>
                            )}
                            <div className="flex-grow">
                              <p className="text-sm font-medium group-hover:text-primary-600 dark:group-hover:text-primary-400 line-clamp-1 mb-1">
                                {result.title}
                              </p>
                              <div className="flex flex-wrap gap-1.5 items-center mb-1">
                                {platformCode && platform && (
                                  <span 
                                    className="text-[10px] px-1.5 py-0.5 rounded-sm"
                                    style={{
                                      backgroundColor: `${platform.color}15`,
                                      color: platform.color,
                                      border: `1px solid ${platform.color}30`
                                    }}
                                  >
                                    {platform.name}{ranking > 0 && <span className="ml-1 opacity-90">#{ranking}</span>}
                                  </span>
                                )}
                                {platform?.contentType?.slice(0, 2).map((type, idx) => (
                                  <span
                                    key={idx}
                                    className="text-[10px] px-1.5 py-0.5 rounded-sm bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300"
                                  >
                                    {type}
                                  </span>
                                ))}
                                {result.score && parseInt(result.score) > 0 && (
                                  <span className="text-[10px] px-1.5 py-0.5 rounded-sm bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400 ml-auto">
                                    热度 {result.score}
                                  </span>
                                )}
                              </div>
                              {result.desc && (
                                <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2">
                                  {result.desc}
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </motion.div>
                )}
              </motion.div>
            </div>
            
            {/* 用户中心图标 */}
            <Link 
              href="/user"
              className="p-3 text-gray-600 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 transition-all duration-300 bg-gray-50 dark:bg-gray-800/60 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700/70 border border-gray-100 dark:border-gray-700/50 hover:shadow-md group"
              aria-label="用户中心"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 transform transition-transform duration-300 group-hover:scale-110">
                <path fillRule="evenodd" d="M7.5 6a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0zM3.751 20.105a8.25 8.25 0 0116.498 0 .75.75 0 01-.437.695A18.683 18.683 0 0112 22.5c-2.786 0-5.433-.608-7.812-1.7a.75.75 0 01-.437-.695z" clipRule="evenodd" />
              </svg>
            </Link>
          </motion.div>
        </div>

        {/* 移动端布局 - 仅移动端显示 */}
        <div className="flex md:hidden items-center justify-between mt-4">
          {/* 中央导航菜单 - 移动端 */}
          <motion.nav
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
            className="flex justify-center w-full"
          >
            <div className="flex space-x-2 overflow-x-auto pb-1 w-full justify-between">
              {navItems.map((item) => (
                <Link 
                  key={item.href}
                  href={item.href} 
                  className={`flex items-center py-2 px-3 rounded-lg text-sm font-medium transition-all duration-300 flex-shrink-0 ${
                    pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href))
                      ? 'bg-gradient-to-r from-primary-500/10 to-primary-600/10 text-primary-600 dark:text-primary-400 border border-primary-500/20 dark:border-primary-400/20'
                      : 'text-gray-700 dark:text-gray-200 hover:bg-white dark:hover:bg-gray-700/50 border border-transparent hover:border-gray-200 dark:hover:border-gray-700'
                  }`}
                >
                  {item.icon}
                  <span className="whitespace-nowrap">{item.label}</span>
                </Link>
              ))}
            </div>
          </motion.nav>
        </div>
      </div>

      {/* 移动端搜索框 */}
      <div className="md:hidden px-4 pb-3">
        <div ref={searchRef} className="relative w-full">
          <motion.div className="relative flex items-center">
            <input 
              type="text" 
              placeholder="搜索热点内容..." 
              className="w-full py-2.5 pl-4 pr-10 bg-gray-50 dark:bg-gray-800/60 border border-gray-100 dark:border-gray-700/50 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/50 dark:focus:ring-primary-400/50 text-gray-700 dark:text-gray-200 transition-all duration-300 focus:bg-white dark:focus:bg-gray-800"
              onFocus={() => setSearchFocused(true)}
              onChange={handleSearchChange}
              value={searchQuery}
            />
            <div className="absolute right-3 text-gray-400 dark:text-gray-500 transition-colors duration-300">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
              </svg>
            </div>
          </motion.div>
          
          {/* 搜索结果下拉菜单 - 移动端 */}
          {searchFocused && searchResults.length > 0 && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
              className="absolute left-0 right-0 mt-2 py-2 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 z-50 max-h-[60vh] overflow-y-auto custom-scrollbar"
            >
              <div className="px-4 py-2 text-xs font-medium uppercase text-gray-500 dark:text-gray-400">
                搜索结果 ({searchResults.length})
              </div>
              {searchResults.map((result, index) => {
                // 查找结果所属的平台
                let platformCode = '';
                // 检查localStorage中是否有记录这个结果的平台
                try {
                  const cachedTrendingData = localStorage.getItem('trendingData');
                  if (cachedTrendingData) {
                    const trendingData = JSON.parse(cachedTrendingData);
                    // 找到包含此结果的平台
                    for (const [code, items] of Object.entries(trendingData)) {
                      if (Array.isArray(items) && items.some(item => item.title === result.title)) {
                        platformCode = code;
                        break;
                      }
                    }
                  }
                } catch (error) {
                  console.error('Error finding platform for search result:', error);
                }
                
                // 获取平台信息
                const platform = PLATFORMS.find(p => p.code === platformCode);
                
                // 查找该结果在平台中的排名
                let ranking = -1;
                try {
                  const cachedTrendingData = localStorage.getItem('trendingData');
                  if (cachedTrendingData && platformCode) {
                    const trendingData = JSON.parse(cachedTrendingData);
                    const platformItems = trendingData[platformCode];
                    if (Array.isArray(platformItems)) {
                      const index = platformItems.findIndex(item => item.title === result.title);
                      if (index !== -1) {
                        ranking = index + 1; // 排名从1开始
                      }
                    }
                  }
                } catch (error) {
                  console.error('Error finding ranking for search result:', error);
                }
                
                return (
                  <div 
                    key={index} 
                    className="px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer text-gray-700 dark:text-gray-200 group transition-colors duration-150 border-b border-gray-100 dark:border-gray-700 last:border-b-0"
                    onClick={() => handleResultClick(result)}
                  >
                    <div className="flex items-start gap-3">
                      {platformCode && platform && (
                        <div 
                          className="flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center mt-0.5 relative"
                          style={{
                            backgroundColor: `${platform.color}20`, // 使用平台颜色作为背景，降低透明度
                            color: platform.color,
                            border: `1px solid ${platform.color}40`
                          }}
                        >
                          <span className="text-xs font-bold">{platform.name.substring(0, 2)}</span>
                          {ranking > 0 && (
                            <div className="absolute -top-2 -right-2 w-4 h-4 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center border border-gray-200 dark:border-gray-600 shadow-sm">
                              <span className="text-[9px] font-bold text-gray-700 dark:text-gray-300">{ranking}</span>
                            </div>
                          )}
                        </div>
                      )}
                      <div className="flex-grow">
                        <p className="text-sm font-medium group-hover:text-primary-600 dark:group-hover:text-primary-400 line-clamp-1 mb-1">
                          {result.title}
                        </p>
                        <div className="flex flex-wrap gap-1.5 items-center mb-1">
                          {platformCode && platform && (
                            <span 
                              className="text-[10px] px-1.5 py-0.5 rounded-sm"
                              style={{
                                backgroundColor: `${platform.color}15`,
                                color: platform.color,
                                border: `1px solid ${platform.color}30`
                              }}
                            >
                              {platform.name}{ranking > 0 && <span className="ml-1 opacity-90">#{ranking}</span>}
                            </span>
                          )}
                          {platform?.contentType?.slice(0, 2).map((type, idx) => (
                            <span
                              key={idx}
                              className="text-[10px] px-1.5 py-0.5 rounded-sm bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300"
                            >
                              {type}
                            </span>
                          ))}
                          {result.score && parseInt(result.score) > 0 && (
                            <span className="text-[10px] px-1.5 py-0.5 rounded-sm bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400 ml-auto">
                              热度 {result.score}
                            </span>
                          )}
                        </div>
                        {result.desc && (
                          <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2">
                            {result.desc}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </motion.div>
          )}
        </div>
      </div>
    </header>
  );
}

// 导航菜单组件
function NavMenu({ navItems, pathname }: { navItems: any[], pathname: string }) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const activeIndex = navItems.findIndex(item => 
    pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href))
  );
  
  // 找到活跃项的引用以获取其位置信息
  const itemsRef = useRef<(HTMLAnchorElement | null)[]>([]);
  
  // 计算活跃指示器的位置和尺寸
  const [dimensions, setDimensions] = useState({
    left: 0,
    width: 0,
    height: 0,
  });
  
  // 更新活跃指示器的位置
  useEffect(() => {
    const updateIndicator = () => {
      const currentIndex = hoveredIndex !== null ? hoveredIndex : activeIndex;
      if (currentIndex >= 0 && itemsRef.current[currentIndex]) {
        const item = itemsRef.current[currentIndex];
        if (item) {
          const { offsetLeft, offsetWidth, offsetHeight } = item;
          setDimensions({
            left: offsetLeft,
            width: offsetWidth,
            height: offsetHeight,
          });
        }
      }
    };
    
    updateIndicator();
    window.addEventListener('resize', updateIndicator);
    return () => window.removeEventListener('resize', updateIndicator);
  }, [hoveredIndex, activeIndex, navItems]);

  // ref回调函数，用于保存元素引用
  const setItemRef = (el: HTMLAnchorElement | null, index: number) => {
    itemsRef.current[index] = el;
  };

  return (
    <div className="relative inline-flex bg-gray-50/80 dark:bg-gray-800/40 rounded-2xl p-1.5 backdrop-blur-sm border border-gray-100 dark:border-gray-700/50 shadow-inner">
      <div className="flex items-center">
        {navItems.map((item, index) => (
          <Link 
            key={item.href}
            ref={(el) => setItemRef(el, index)}
            href={item.href} 
            className={`flex items-center px-5 py-2.5 rounded-xl font-medium transition-colors duration-200 relative z-10 mx-1 ${
              (pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href)))
                ? 'text-primary-600 dark:text-primary-400'
                : 'text-gray-700 dark:text-gray-200'
            }`}
            onMouseEnter={() => setHoveredIndex(index)}
            onMouseLeave={() => setHoveredIndex(null)}
          >
            {item.icon}
            {item.label}
          </Link>
        ))}
      </div>
      
      {/* 活跃指示器 */}
      <motion.div 
        className="absolute z-0 bg-white dark:bg-gray-700 rounded-xl border border-primary-500/20 dark:border-primary-400/20"
        initial={false}
        animate={{
          left: dimensions.left,
          width: dimensions.width,
          height: dimensions.height,
          opacity: 1
        }}
        transition={{
          type: "spring",
          stiffness: 300,
          damping: 30,
          mass: 1
        }}
      />
    </div>
  );
}