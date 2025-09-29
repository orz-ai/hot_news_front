"use client";

import { useState, useEffect, useMemo } from "react";
import { UserSettings } from "../components/SettingsModal";
import { PlatformType } from "../types";

const STORAGE_KEY = "hot_news_user_settings";

const DEFAULT_SETTINGS: UserSettings = {
  newsDisplayCount: 10,
  featuredPlatforms: ['baidu', 'weibo', 'zhihu', 'bilibili', 'douyin', 'github'],
  platformOrder: ['baidu', 'weibo', 'zhihu', 'bilibili', 'douyin', 'github', '36kr', 'shaoshupai', 'douban', 'hupu', 'tieba', 'juejin', 'v2ex', 'jinritoutiao', 'stackoverflow', 'hackernews'],
  autoRefresh: true,
  refreshInterval: 30,
  darkMode: false,
};

export function useSettings() {
  const [settings, setSettings] = useState<UserSettings>(DEFAULT_SETTINGS);
  const [isLoading, setIsLoading] = useState(true);

  // 从本地存储加载设置
  useEffect(() => {
    try {
      const savedSettings = localStorage.getItem(STORAGE_KEY);
      if (savedSettings) {
        const parsedSettings = JSON.parse(savedSettings);
        // 合并默认设置和保存的设置，确保新增的设置项有默认值
        const mergedSettings = {
          ...DEFAULT_SETTINGS,
          ...parsedSettings,
          // 确保平台列表是最新的
          platformOrder: parsedSettings.platformOrder || DEFAULT_SETTINGS.platformOrder,
          featuredPlatforms: parsedSettings.featuredPlatforms || DEFAULT_SETTINGS.featuredPlatforms,
        };
        setSettings(mergedSettings);
      }
    } catch (error) {
      console.error("Failed to load settings from localStorage:", error);
      setSettings(DEFAULT_SETTINGS);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // 保存设置到本地存储
  const saveSettings = (newSettings: UserSettings) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newSettings));
      setSettings(newSettings);
      
      // 如果深色模式设置发生变化，立即应用
      if (newSettings.darkMode !== settings.darkMode) {
        applyDarkMode(newSettings.darkMode);
      }
    } catch (error) {
      console.error("Failed to save settings to localStorage:", error);
    }
  };

  // 应用深色模式
  const applyDarkMode = (isDark: boolean) => {
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  // 重置设置
  const resetSettings = () => {
    try {
      localStorage.removeItem(STORAGE_KEY);
      setSettings(DEFAULT_SETTINGS);
      applyDarkMode(DEFAULT_SETTINGS.darkMode);
    } catch (error) {
      console.error("Failed to reset settings:", error);
    }
  };

  // 更新特定设置项
  const updateSetting = <K extends keyof UserSettings>(
    key: K,
    value: UserSettings[K]
  ) => {
    const newSettings = { ...settings, [key]: value };
    saveSettings(newSettings);
  };

  // 获取过滤后的平台列表（按用户设置的顺序和选择）
  const getFeaturedPlatforms = useMemo(() => {
    return settings.platformOrder.filter(platformCode => 
      settings.featuredPlatforms.includes(platformCode)
    );
  }, [settings.platformOrder, settings.featuredPlatforms]);

  // 检查平台是否在首页显示
  const isPlatformFeatured = (platformCode: PlatformType) => {
    return settings.featuredPlatforms.includes(platformCode);
  };

  // 初始化深色模式
  useEffect(() => {
    if (!isLoading) {
      applyDarkMode(settings.darkMode);
    }
  }, [settings.darkMode, isLoading]);

  return {
    settings,
    saveSettings,
    resetSettings,
    updateSetting,
    getFeaturedPlatforms,
    isPlatformFeatured,
    isLoading,
  };
}