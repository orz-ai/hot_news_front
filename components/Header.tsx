"use client";

import Link from 'next/link';
import { motion } from 'framer-motion';
import { useState, useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { TrendingItem } from '../types';
import { searchTrendingItems } from '../utils/api';
import { usePlatformI18n } from '@/lib/platform-i18n';

interface HeaderProps {
  onSettingsClick?: () => void;
}

export default function Header({ onSettingsClick }: HeaderProps) {
  const [scrolled, setScrolled] = useState(false);
  const [visible, setVisible] = useState(true);
  const [searchFocused, setSearchFocused] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<TrendingItem[]>([]);
  const searchRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  const lastScrollY = useRef(0);
  const t = useTranslations('header');
  const common = useTranslations('common');
  const { getPlatformInfoByCode, getPlatformShortName } = usePlatformI18n();

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      setScrolled(currentScrollY > 10);

      if (currentScrollY <= 10) {
        setVisible(true);
      } else if (currentScrollY > lastScrollY.current) {
        setVisible(false);
      } else {
        setVisible(true);
      }

      lastScrollY.current = currentScrollY;
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setSearchFocused(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const debounce = (fn: Function, delay: number) => {
      let timer: NodeJS.Timeout;
      return function (...args: any[]) {
        clearTimeout(timer);
        timer = setTimeout(() => fn(...args), delay);
      };
    };

    const debouncedSearch = debounce(async (query: string) => {
      if (query.trim() === '') {
        setSearchResults([]);
        return;
      }

      try {
        const response = await searchTrendingItems(query);

        if (response.status === '200' && response.data.length > 0) {
          const formattedResults: TrendingItem[] = response.data.map(item => ({
            title: item.title,
            url: item.url,
            score: item.rank || '0',
            desc: `${item.category} · ${item.sub_category}`,
            source: item.source
          }));

          setSearchResults(formattedResults);
        } else {
          setSearchResults([
            {
              title: t('noResultsTitle', {query}),
              url: '#',
              score: '0',
              desc: t('noResultsDesc')
            }
          ]);
        }
      } catch (error) {
        console.error('Error searching trending items:', error);
        setSearchResults([
          {
            title: t('searchErrorTitle'),
            url: '#',
            score: '0',
            desc: t('searchErrorDesc')
          }
        ]);
      }
    }, 300);

    if (searchQuery) {
      debouncedSearch(searchQuery);
    } else {
      setSearchResults([]);
    }
  }, [searchQuery, t]);

  const navItems = [
    { href: '/', label: common('home') },
    { href: '/all', label: common('allPlatforms') },
    { href: '/about', label: common('about') }
  ];

  const handleResultClick = (item: TrendingItem) => {
    if (item.url && item.url !== '#') {
      window.open(item.url, '_blank');
    }
    setSearchFocused(false);
    setSearchQuery('');
  };

  return (
    <motion.header
      className={`sticky top-0 z-50 transition-all duration-300 ${scrolled
        ? 'bg-white/90 dark:bg-gray-900/95 backdrop-blur-md shadow-md'
        : 'bg-white dark:bg-gray-900'
        } border-b border-gray-100 dark:border-gray-800`}
      initial={{ transform: 'translateY(0)' }}
      animate={{ transform: visible ? 'translateY(0)' : 'translateY(-100%)' }}
      transition={{ duration: 0.3 }}
      role="banner"
    >
      <div className="max-w-screen-xl mx-auto px-3 sm:px-4 py-2 sm:py-3">
        <div className="flex items-center justify-between gap-4">
          <div className="flex-shrink-0">
            <Link href="/" className="flex items-center gap-2 group" aria-label={t('homeAria')}>
              <div className="w-10 h-10 flex-shrink-0 rounded-md overflow-hidden">
                <img src="/android-chrome-192x192.png" alt={t('brand')} className="w-full h-full object-cover" />
              </div>
              <div className="flex flex-col">
                <span className="text-base sm:text-lg font-bold text-gray-900 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">{t('brand')}</span>
                <span className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400">{t('tagline')}</span>
              </div>
            </Link>
          </div>

          <nav className="hidden md:flex flex-1 justify-center" aria-label={t('mainNav')}>
            <div className="relative inline-flex bg-gray-50/80 dark:bg-gray-800/40 rounded-2xl p-1.5 backdrop-blur-sm border border-gray-100 dark:border-gray-700/50 shadow-inner">
              <div className="flex items-center">
                {navItems.map((item) => {
                  const active = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`flex items-center px-5 py-2.5 rounded-xl font-medium transition-colors duration-200 relative z-10 mx-1 ${active
                        ? 'bg-white dark:bg-gray-700 text-primary-600 dark:text-primary-400 border border-primary-500/20 dark:border-primary-400/20'
                        : 'text-gray-700 dark:text-gray-200'
                        }`}
                      aria-current={active ? 'page' : undefined}
                    >
                      {item.label}
                    </Link>
                  );
                })}
              </div>
            </div>
          </nav>

          <div className="flex items-center gap-3">
            <div ref={searchRef} className="relative hidden md:block">
              <motion.div
                animate={{ width: searchFocused ? '250px' : '180px' }}
                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                className="group"
              >
                <div className="relative flex items-center">
                  <input
                    type="text"
                    placeholder={t('searchPlaceholder')}
                    className="w-full py-2 pl-4 pr-10 bg-gray-50 dark:bg-gray-800/60 border border-gray-100 dark:border-gray-700/50 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/50 dark:focus:ring-primary-400/50 text-gray-700 dark:text-gray-200 transition-all duration-300 focus:bg-white dark:focus:bg-gray-800"
                    onFocus={() => setSearchFocused(true)}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    value={searchQuery}
                    aria-label={t('searchAria')}
                  />
                </div>

                {searchFocused && searchResults.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2 }}
                    className="absolute left-0 right-0 mt-2 py-2 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 z-50 max-h-[70vh] overflow-y-auto custom-scrollbar"
                    role="listbox"
                    aria-label={t('searchResultsAria')}
                  >
                    <div className="px-4 py-2 text-xs font-medium uppercase text-gray-500 dark:text-gray-400">
                      {t('searchResults', {count: searchResults.length})}
                    </div>
                    {searchResults.map((result, index) => {
                      const platformCode = result.source || '';
                      const platform = platformCode ? getPlatformInfoByCode(platformCode) : undefined;
                      return (
                        <div
                          key={index}
                          className="px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer text-gray-700 dark:text-gray-200 group transition-colors duration-150 border-b border-gray-100 dark:border-gray-700 last:border-b-0"
                          onClick={() => handleResultClick(result)}
                          tabIndex={0}
                          role="option"
                          aria-selected="false"
                        >
                          <div className="flex items-start gap-3">
                            {platformCode && platform && (
                              <div
                                className="flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center mt-0.5 relative"
                                style={{
                                  backgroundColor: `${platform.color}20`,
                                  color: platform.color,
                                  border: `1px solid ${platform.color}40`
                                }}
                              >
                                <span className="text-xs font-bold">{getPlatformShortName(platform.code)}</span>
                              </div>
                            )}
                            <div className="flex-grow">
                              <p className="text-sm font-medium group-hover:text-primary-600 dark:group-hover:text-primary-400 line-clamp-1 mb-1">{result.title}</p>
                              {result.desc && <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2">{result.desc}</p>}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </motion.div>
                )}
              </motion.div>
            </div>

            <button
              onClick={onSettingsClick}
              className="p-2 rounded-xl bg-gray-50 dark:bg-gray-800/60 border border-gray-100 dark:border-gray-700/50 text-gray-600 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-white dark:hover:bg-gray-800 transition-all duration-300 hover:shadow-sm"
              aria-label={t('openSettings')}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M7.84 1.804A1 1 0 018.82 1h2.36a1 1 0 01.98.804l.331 1.652a6.993 6.993 0 011.929 1.115l1.598-.54a1 1 0 011.186.447l1.18 2.044a1 1 0 01-.205 1.251l-1.267 1.113a7.047 7.047 0 010 2.228l1.267 1.113a1 1 0 01.206 1.25l-1.18 2.045a1 1 0 01-1.187.447l-1.598-.54a6.993 6.993 0 01-1.929 1.115l-.33 1.652a1 1 0 01-.98.804H8.82a1 1 0 01-.98-.804l-.331-1.652a6.993 6.993 0 01-1.929-1.115l-1.598.54a1 1 0 01-1.186-.447l-1.18-2.044a1 1 0 01.205-1.251l1.267-1.114a7.05 7.05 0 010-2.227L1.821 7.773a1 1 0 01-.206-1.25l1.18-2.045a1 1 0 011.187-.447l1.598.54A6.993 6.993 0 017.51 3.456l.33-1.652zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        </div>

        <div className="mt-2 md:hidden">
          <div className="relative w-full">
            <input
              type="text"
              placeholder={t('searchPlaceholderMobile')}
              className="w-full py-2 pl-4 pr-10 bg-gray-50 dark:bg-gray-800/60 border border-gray-100 dark:border-gray-700/50 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/50 dark:focus:ring-primary-400/50 text-gray-700 dark:text-gray-200 transition-all duration-300 focus:bg-white dark:focus:bg-gray-800"
              onFocus={() => setSearchFocused(true)}
              onChange={(e) => setSearchQuery(e.target.value)}
              value={searchQuery}
              aria-label={t('searchAria')}
            />
          </div>

          <div className="mt-2 grid grid-cols-4 gap-1">
            {navItems.map((item) => {
              const active = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex flex-col items-center py-2 px-1 rounded-lg text-[10px] font-medium transition-all duration-300 ${active
                    ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400 border border-primary-500/20 dark:border-primary-400/20'
                    : 'text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800 border border-transparent'
                    }`}
                  aria-current={active ? 'page' : undefined}
                >
                  <span className="whitespace-nowrap text-center">{item.label}</span>
                </Link>
              );
            })}
            <button
              onClick={onSettingsClick}
              className="flex flex-col items-center py-2 px-1 rounded-lg text-[10px] font-medium transition-all duration-300 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800 border border-transparent"
              aria-label={t('openSettings')}
            >
              <span className="whitespace-nowrap text-center">{common('settings')}</span>
            </button>
          </div>
        </div>
      </div>
    </motion.header>
  );
}
