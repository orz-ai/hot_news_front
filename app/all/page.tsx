"use client";

import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { useTranslations } from 'next-intl';
import { PLATFORMS } from "../../constants/platforms";
import PlatformCard from "../../components/PlatformCard";
import LoadingSpinner from "../../components/LoadingSpinner";
import { fetchAllPlatformsData } from "../../utils/api";
import { PlatformType, TrendingItem } from "../../types";
import { usePlatformI18n } from "@/lib/platform-i18n";

export default function AllPlatformsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [trendingData, setTrendingData] = useState<Record<PlatformType, TrendingItem[]>>({} as Record<PlatformType, TrendingItem[]>);
  const [currentDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const t = useTranslations('allPlatforms');
  const { translatedPlatforms } = usePlatformI18n();

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const response = await fetchAllPlatformsData(currentDate);
        if (response.status === '200') {
          setTrendingData(response.data);
        }
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [currentDate]);

  const allCategories = Array.from(new Set(translatedPlatforms.flatMap(platform => platform.contentType))).sort();

  const filteredPlatforms = translatedPlatforms.filter(platform => {
    const matchesSearch = platform.name.toLowerCase().includes(searchTerm.toLowerCase()) || platform.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory ? platform.contentType.includes(selectedCategory) : true;
    return matchesSearch && matchesCategory;
  });

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
      <h1 className="text-3xl font-bold mb-2">{t('title')}</h1>
      <p className="text-gray-600 dark:text-gray-300 mb-8">{t('description', {count: translatedPlatforms.length})}</p>

      <div className="relative bg-white dark:bg-gray-800 rounded-xl shadow-card overflow-visible border border-gray-100 dark:border-gray-700 mb-12">
        <div className="p-5">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-grow">
              <input
                type="text"
                className="bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white text-sm rounded-xl block w-full py-3.5 px-4"
                placeholder={t('searchPlaceholder')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div className="flex-shrink-0 relative min-w-[220px]" ref={dropdownRef}>
              <button onClick={() => setIsDropdownOpen(!isDropdownOpen)} className="w-full flex items-center justify-between bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white text-sm rounded-xl py-3.5 px-4" type="button">
                <span>{selectedCategory || t('allCategories')}</span>
              </button>

              {isDropdownOpen && (
                <div className="absolute mt-2 w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-lg py-2 z-50 max-h-[300px] overflow-y-auto">
                  <button className="w-full text-left px-4 py-2.5 text-sm" onClick={() => { setSelectedCategory(null); setIsDropdownOpen(false); }}>{t('allCategories')}</button>
                  {allCategories.map(category => (
                    <button key={category} className="w-full text-left px-4 py-2.5 text-sm" onClick={() => { setSelectedCategory(category); setIsDropdownOpen(false); }}>{category}</button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {(searchTerm || selectedCategory) && (
            <div className="mt-4 flex items-center flex-wrap gap-2">
              <span className="text-sm text-gray-600 dark:text-gray-400 mr-1">{t('currentFilters')}</span>
              <button className="text-primary-600 dark:text-primary-400 text-xs font-medium hover:underline" onClick={() => { setSearchTerm(''); setSelectedCategory(null); }}>{t('clearFilters')}</button>
            </div>
          )}
        </div>
      </div>

      <div className="mb-4 text-sm text-gray-600 dark:text-gray-400 flex justify-between">
        <span>{t('platformCount', {count: filteredPlatforms.length})}</span>
        <span>{selectedCategory ? t('currentCategory', {category: selectedCategory}) : t('allCategories')}</span>
      </div>

      {loading ? (
        <div className="py-12 flex justify-center"><LoadingSpinner size="lg" /></div>
      ) : filteredPlatforms.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPlatforms.map((platform, index) => (
            <PlatformCard key={platform.code} platform={platform} index={index} trendingItems={trendingData[platform.code] || []} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <h3 className="text-xl font-medium mb-2">{t('emptyTitle')}</h3>
          <p className="text-gray-500 dark:text-gray-400 mb-4">{t('emptyDesc')}</p>
          <button onClick={() => { setSearchTerm(''); setSelectedCategory(null); }} className="text-primary-600 dark:text-primary-400 hover:underline">{t('clearAll')}</button>
        </div>
      )}
    </motion.div>
  );
}
