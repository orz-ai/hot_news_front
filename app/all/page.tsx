"use client";

import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { PLATFORMS } from "../../constants/platforms";
import PlatformCard from "../../components/PlatformCard";
import LoadingSpinner from "../../components/LoadingSpinner";
import { fetchAllPlatformsData, AllPlatformsResponse } from "../../utils/api";
import { PlatformType, TrendingItem } from "../../types";

// 动画变体
const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4 } }
};

export default function AllPlatformsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [trendingData, setTrendingData] = useState<Record<PlatformType, TrendingItem[]>>({} as Record<PlatformType, TrendingItem[]>);
  const [currentDate, setCurrentDate] = useState<string>(new Date().toISOString().split('T')[0]);
  
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  // 点击外部关闭下拉框
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    }
    
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);
  
  // 加载所有平台数据
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // 使用新的API一次性获取所有平台数据
        const response = await fetchAllPlatformsData(currentDate);
        
        if (response.status === '200') {
          setTrendingData(response.data);
        } else {
          console.error('Failed to fetch all platforms data:', response.msg);
        }
      } catch (error) {
        console.error('Error fetching all platforms data:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [currentDate]);
  
  // Extract all unique categories from platforms
  const allCategories = Array.from(
    new Set(
      PLATFORMS.flatMap(platform => platform.contentType)
    )
  ).sort();
  
  // Filter platforms based on search term and selected category
  const filteredPlatforms = PLATFORMS.filter(platform => {
    const matchesSearch = platform.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         platform.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = selectedCategory ? 
                           platform.contentType.includes(selectedCategory) : 
                           true;
    
    return matchesSearch && matchesCategory;
  });

  return (
    <>
      <div className="mb-8">
        <Link href="/" className="text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 text-sm flex items-center gap-1">

        </Link>
      </div>
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <h1 className="text-3xl font-bold mb-2">全部平台</h1>
        <p className="text-gray-600 dark:text-gray-300 mb-8">
          我们支持以下 {PLATFORMS.length} 个平台的热点内容获取，每 30 分钟更新一次。
        </p>
      </motion.div>
      
      <div className="relative bg-white dark:bg-gray-800 rounded-xl shadow-card overflow-visible border border-gray-100 dark:border-gray-700 mb-12">
        <div className="p-5">
          <div className="flex flex-col md:flex-row gap-4">
            {/* 搜索框 */}
            <div className="flex-grow">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
                  <svg className="w-5 h-5 text-gray-500 dark:text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <input
                  type="text"
                  className="bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white text-sm rounded-xl focus:ring-primary-500 focus:border-primary-500 block w-full pl-12 py-3.5 px-4"
                  placeholder="搜索平台名称或描述..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            
            {/* 精美下拉框 */}
            <div className="flex-shrink-0 relative min-w-[220px]" ref={dropdownRef}>
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="w-full flex items-center justify-between bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white text-sm rounded-xl py-3.5 px-4 focus:outline-none focus:ring-2 focus:ring-primary-500"
                type="button"
                aria-haspopup="listbox"
                aria-expanded={isDropdownOpen}
              >
                <div className="flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-gray-500 dark:text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                  </svg>
                  <span>{selectedCategory || '全部分类'}</span>
                </div>
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  className={`h-5 w-5 text-gray-500 dark:text-gray-400 transition-transform duration-200 ${isDropdownOpen ? 'transform rotate-180' : ''}`} 
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              
              {/* 下拉框内容 */}
              {isDropdownOpen && (
                <div 
                  className="absolute mt-2 w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-lg py-2 z-50 max-h-[300px] overflow-y-auto"
                  role="listbox"
                >
                  <button
                    className={`w-full text-left px-4 py-2.5 text-sm ${
                      selectedCategory === null 
                        ? 'bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 font-medium' 
                        : 'hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'
                    }`}
                    onClick={() => {
                      setSelectedCategory(null);
                      setIsDropdownOpen(false);
                    }}
                    role="option"
                    aria-selected={selectedCategory === null}
                  >
                    <div className="flex items-center">
                      {selectedCategory === null && (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2 text-primary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                      <span className={selectedCategory === null ? "" : "ml-6"}>全部分类</span>
                    </div>
                  </button>
                  
                  {allCategories.map(category => (
                    <button
                      key={category}
                      className={`w-full text-left px-4 py-2.5 text-sm ${
                        selectedCategory === category 
                          ? 'bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 font-medium' 
                          : 'hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'
                      }`}
                      onClick={() => {
                        setSelectedCategory(category);
                        setIsDropdownOpen(false);
                      }}
                      role="option"
                      aria-selected={selectedCategory === category}
                    >
                      <div className="flex items-center">
                        {selectedCategory === category && (
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2 text-primary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                        <span className={selectedCategory === category ? "" : "ml-6"}>{category}</span>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
          
          {/* 激活的筛选条件 */}
          {(searchTerm || selectedCategory) && (
            <div className="mt-4 flex items-center flex-wrap gap-2">
              <span className="text-sm text-gray-600 dark:text-gray-400 mr-1">
                当前筛选:
              </span>
              
              {searchTerm && (
                <span className="bg-blue-50 dark:bg-blue-900/30 text-primary-600 dark:text-primary-300 text-xs px-3 py-1.5 rounded-full flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  {searchTerm}
                  <button 
                    className="ml-1.5 text-primary-500 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300"
                    onClick={() => setSearchTerm("")}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  </button>
                </span>
              )}
              
              {selectedCategory && (
                <span className="bg-blue-50 dark:bg-blue-900/30 text-primary-600 dark:text-primary-300 text-xs px-3 py-1.5 rounded-full flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                  </svg>
                  {selectedCategory}
                  <button 
                    className="ml-1.5 text-primary-500 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300"
                    onClick={() => setSelectedCategory(null)}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  </button>
                </span>
              )}
              
              {(searchTerm || selectedCategory) && (
                <button 
                  className="text-primary-600 dark:text-primary-400 text-xs font-medium hover:underline flex items-center"
                  onClick={() => {
                    setSearchTerm("");
                    setSelectedCategory(null);
                  }}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  清除全部筛选
                </button>
              )}
            </div>
          )}
        </div>
      </div>
      
      {/* 筛选结果数 */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">
          {filteredPlatforms.length} 个平台
        </h2>
        <div className="text-sm text-gray-500 dark:text-gray-400">
          {selectedCategory ? `当前分类: ${selectedCategory}` : '全部分类'}
        </div>
      </div>
      
      {/* 加载指示器 */}
      {loading && (
        <div className="flex justify-center items-center py-20">
          <LoadingSpinner size="lg" />
        </div>
      )}
      
      {/* 平台卡片 */}
      {!loading && (
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {filteredPlatforms.length > 0 ? (
            filteredPlatforms.map((platform, index) => (
              <motion.div key={platform.code} variants={itemVariants}>
                <PlatformCard 
                  platform={platform} 
                  index={index} 
                  trendingItems={trendingData[platform.code] || []}
                />
              </motion.div>
            ))
          ) : (
            <div className="col-span-full text-center py-16 bg-white dark:bg-gray-800 rounded-xl shadow-card border border-gray-100 dark:border-gray-700">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto mb-4 text-gray-300 dark:text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                未找到匹配的平台
              </h3>
              <p className="text-gray-500 dark:text-gray-400 mb-6">
                请尝试使用其他搜索条件或清除筛选
              </p>
              <button
                onClick={() => {
                  setSearchTerm("");
                  setSelectedCategory(null);
                }}
                className="px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white rounded-lg transition-colors text-sm font-medium"
              >
                清除所有筛选
              </button>
            </div>
          )}
        </motion.div>
      )}
    </>
  );
} 