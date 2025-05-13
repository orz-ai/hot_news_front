"use client";

import Link from 'next/link';
import { motion } from 'framer-motion';
import { useState, useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';

export default function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pathname = usePathname();
  
  // 检测滚动以改变header样式
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

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
    ) }
  ];

  return (
    <header 
      className={`sticky top-0 z-50 transition-all duration-300 ${
        scrolled 
          ? 'bg-white/90 dark:bg-gray-900/95 backdrop-blur-md shadow-md' 
          : 'bg-white dark:bg-gray-900'
      } border-b border-gray-100 dark:border-gray-800`}
    >
      <div className="container mx-auto px-4 md:px-5 py-3 md:py-4">
        {/* 桌面布局 - 网格布局 */}
        <div className="hidden md:grid md:grid-cols-3 items-center">
          {/* 左侧 Logo */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
            className="col-span-1"
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

          {/* 中间导航 */}
          <motion.nav
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
            className="flex justify-center col-span-1"
          >
            <NavMenu navItems={navItems} pathname={pathname} />
          </motion.nav>

          {/* 右侧功能区 */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: 0.2 }}
            className="flex items-center justify-end gap-3 col-span-1"
          >
            {/* GitHub链接 */}
            <a
              href="https://github.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="p-3 text-gray-600 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 transition-all duration-300 bg-gray-50 dark:bg-gray-800/60 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700/70 border border-gray-100 dark:border-gray-700/50 group"
              aria-label="GitHub"
            >
              <svg className="h-5 w-5 transform transition-transform duration-300 group-hover:rotate-12" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
              </svg>
            </a>
          </motion.div>
        </div>

        {/* 移动端布局 - Flex布局 */}
        <div className="flex md:hidden items-center justify-between">
          {/* Logo */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Link href="/" className="flex items-center gap-2 group">
              <div className="bg-gradient-to-br from-primary-500 via-primary-600 to-primary-700 text-white p-2 rounded-xl shadow-lg shadow-primary-500/20 group-hover:shadow-primary-500/30 transition-all duration-300">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
                </svg>
              </div>
              <div className="flex flex-col">
                <span className="text-lg font-bold text-gray-900 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">热点速览</span>
                <span className="text-xs text-gray-500 dark:text-gray-400">一站式热门内容聚合平台</span>
              </div>
            </Link>
          </motion.div>

          {/* 移动端功能区 */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: 0.2 }}
            className="flex items-center gap-2"
          >
            {/* GitHub链接 */}
            <a
              href="https://github.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 text-gray-600 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 transition-all duration-300 bg-gray-50 dark:bg-gray-800/60 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700/70 border border-gray-100 dark:border-gray-700/50 group"
              aria-label="GitHub"
            >
              <svg className="h-5 w-5 transform transition-transform duration-300 group-hover:rotate-12" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
              </svg>
            </a>
            
            {/* 移动端菜单按钮 */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 text-gray-600 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 transition-all duration-300 bg-gray-50 dark:bg-gray-800/60 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700/70 border border-gray-100 dark:border-gray-700/50"
              aria-label="菜单"
              aria-expanded={isMobileMenuOpen}
            >
              <motion.div
                animate={isMobileMenuOpen ? "open" : "closed"}
                variants={{
                  open: { rotate: 180 },
                  closed: { rotate: 0 }
                }}
                transition={{ duration: 0.3 }}
                className="w-5 h-5 relative"
              >
                <motion.span
                  className="absolute top-2 left-0 w-5 h-0.5 bg-current rounded-full"
                  variants={{
                    open: { rotate: 45, translateY: 0 },
                    closed: { rotate: 0, translateY: 0 }
                  }}
                  transition={{ duration: 0.3 }}
                ></motion.span>
                <motion.span
                  className="absolute top-0 bottom-0 left-0 my-auto w-5 h-0.5 bg-current rounded-full"
                  variants={{
                    open: { opacity: 0 },
                    closed: { opacity: 1 }
                  }}
                  transition={{ duration: 0.3 }}
                ></motion.span>
                <motion.span
                  className="absolute bottom-2 left-0 w-5 h-0.5 bg-current rounded-full"
                  variants={{
                    open: { rotate: -45, translateY: 0 },
                    closed: { rotate: 0, translateY: 0 }
                  }}
                  transition={{ duration: 0.3 }}
                ></motion.span>
              </motion.div>
            </button>
          </motion.div>
        </div>
      </div>

      {/* 移动端菜单 */}
      <motion.div 
        className="md:hidden overflow-hidden"
        animate={isMobileMenuOpen ? "open" : "closed"}
        variants={menuVariants}
        initial="closed"
      >
        <div className="container mx-auto px-4 py-3 border-t border-gray-100 dark:border-gray-800">
          <div className="bg-gray-50/80 dark:bg-gray-800/40 rounded-xl p-2 backdrop-blur-sm border border-gray-100 dark:border-gray-700/50 shadow-inner">
            {navItems.map((item) => (
              <motion.div key={item.href} variants={itemVariants} className="mb-2 last:mb-0">
                <Link 
                  href={item.href} 
                  className={`flex items-center py-2.5 px-3 rounded-lg font-medium transition-all duration-300 ${
                    pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href))
                      ? 'bg-gradient-to-r from-primary-500/10 to-primary-600/10 text-primary-600 dark:text-primary-400 border border-primary-500/20 dark:border-primary-400/20'
                      : 'text-gray-700 dark:text-gray-200 hover:bg-white dark:hover:bg-gray-700/50 border border-transparent hover:border-gray-200 dark:hover:border-gray-700'
                  }`}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {item.icon}
                  {item.label}
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.div>
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