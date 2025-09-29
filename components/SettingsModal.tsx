"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { PLATFORMS } from "../constants/platforms";
import { PlatformType } from "../types";

interface SettingsModalProps {
    isOpen: boolean;
    onClose: () => void;
    settings: UserSettings;
    onSettingsChange: (settings: UserSettings) => void;
}

export interface UserSettings {
    newsDisplayCount: number;
    featuredPlatforms: PlatformType[];
    platformOrder: PlatformType[];
    autoRefresh: boolean;
    darkMode: boolean;
}

const DEFAULT_SETTINGS: UserSettings = {
    newsDisplayCount: 10,
    featuredPlatforms: ['baidu', 'shaoshupai', 'weibo', 'zhihu', '36kr', 'tieba'],
    platformOrder: ['baidu', 'shaoshupai', 'weibo', 'zhihu', '36kr', 'tieba', 'bilibili', 'douban', 'hupu', 'juejin', 'douyin', 'github', 'v2ex', 'jinritoutiao', 'stackoverflow', 'hackernews', '52pojie', 'tenxunwang'],
    autoRefresh: true,
    darkMode: false,
};

export default function SettingsModal({ isOpen, onClose, settings, onSettingsChange }: SettingsModalProps) {
    const [localSettings, setLocalSettings] = useState<UserSettings>(settings);
    const [activeTab, setActiveTab] = useState<'platforms' | 'display' | 'advanced'>('platforms');
    const [draggedItem, setDraggedItem] = useState<PlatformType | null>(null);

    useEffect(() => {
        if (isOpen) {
            setLocalSettings(settings);
        }
    }, [settings, isOpen]);

    // 添加ESC键关闭功能
    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape' && isOpen) {
                onClose();
            }
        };

        if (isOpen) {
            document.addEventListener('keydown', handleKeyDown);
        }

        return () => {
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, [isOpen, onClose]);

    const handleSave = () => {
        onSettingsChange(localSettings);
        onClose();
    };

    const handleReset = () => {
        setLocalSettings(DEFAULT_SETTINGS);
    };

    const handlePlatformToggle = (platformCode: PlatformType) => {
        // 如果是取消选择，直接移除
        if (localSettings.featuredPlatforms.includes(platformCode)) {
            const newFeaturedPlatforms = localSettings.featuredPlatforms.filter(p => p !== platformCode);
            setLocalSettings({
                ...localSettings,
                featuredPlatforms: newFeaturedPlatforms
            });
        } else {
            // 如果是选择，检查是否超过9个限制
            if (localSettings.featuredPlatforms.length >= 9) {
                // 超过限制，不允许选择
                return;
            }
            const newFeaturedPlatforms = [...localSettings.featuredPlatforms, platformCode];
            setLocalSettings({
                ...localSettings,
                featuredPlatforms: newFeaturedPlatforms
            });
        }
    };

    const handleDragStart = (platformCode: PlatformType) => {
        setDraggedItem(platformCode);
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
    };

    const handleDrop = (e: React.DragEvent, targetPlatform: PlatformType) => {
        e.preventDefault();
        if (!draggedItem) return;

        const newOrder = [...localSettings.platformOrder];
        const draggedIndex = newOrder.indexOf(draggedItem);
        const targetIndex = newOrder.indexOf(targetPlatform);

        newOrder.splice(draggedIndex, 1);
        newOrder.splice(targetIndex, 0, draggedItem);

        setLocalSettings({
            ...localSettings,
            platformOrder: newOrder
        });
        setDraggedItem(null);
    };

    const modalVariants = {
        hidden: { opacity: 0, scale: 0.95 },
        visible: { opacity: 1, scale: 1 },
        exit: { opacity: 0, scale: 0.95 }
    };

    const overlayVariants = {
        hidden: { opacity: 0 },
        visible: { opacity: 1 },
        exit: { opacity: 0 }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* 背景遮罩 */}
                    <motion.div
                        variants={overlayVariants}
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
                        onClick={onClose}
                    />

                    {/* 弹窗主体 */}
                    <motion.div
                        variants={modalVariants}
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                        transition={{ type: "spring", damping: 25, stiffness: 300 }}
                        className="fixed inset-0 z-50 flex items-center justify-center p-4"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 w-full max-w-4xl h-[600px] overflow-hidden flex flex-col">
                            {/* 头部 */}
                            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
                                        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                        </svg>
                                    </div>
                                    <div>
                                        <h2 className="text-xl font-bold text-gray-900 dark:text-white">个性化设置</h2>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">自定义您的热点浏览体验</p>
                                    </div>
                                </div>
                                <button
                                    onClick={onClose}
                                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                                >
                                    <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>

                            {/* 标签页导航 */}
                            <div className="flex border-b border-gray-200 dark:border-gray-700">
                                {[
                                    { id: 'platforms', name: '平台管理', icon: 'M19 11H5m14-7H3a2 2 0 00-2 2v12a2 2 0 002 2h16a2 2 0 002-2V6a2 2 0 00-2-2z' },
                                    { id: 'display', name: '显示设置', icon: 'M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2' },
                                    { id: 'advanced', name: '高级选项', icon: 'M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4' }
                                ].map((tab) => (
                                    <button
                                        key={tab.id}
                                        onClick={() => setActiveTab(tab.id as any)}
                                        className={`flex items-center gap-2 px-6 py-4 font-medium transition-colors ${activeTab === tab.id
                                            ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400'
                                            : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                                            }`}
                                    >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={tab.icon} />
                                        </svg>
                                        {tab.name}
                                    </button>
                                ))}
                            </div>

                            {/* 内容区域 */}
                            <div className="flex-1 p-6 overflow-y-auto">
                                {/* 显示设置 */}
                                {activeTab === 'display' && (
                                    <div className="space-y-6">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                                                每个平台显示新闻数量
                                            </label>
                                            <div className="flex items-center gap-4">
                                                <input
                                                    type="range"
                                                    min="5"
                                                    max="50"
                                                    value={localSettings.newsDisplayCount}
                                                    onChange={(e) => setLocalSettings({
                                                        ...localSettings,
                                                        newsDisplayCount: parseInt(e.target.value)
                                                    })}
                                                    className="flex-1 h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer"
                                                />
                                                <div className="flex items-center gap-2">
                                                    <input
                                                        type="number"
                                                        min="5"
                                                        max="50"
                                                        value={localSettings.newsDisplayCount}
                                                        onChange={(e) => setLocalSettings({
                                                            ...localSettings,
                                                            newsDisplayCount: parseInt(e.target.value) || 10
                                                        })}
                                                        className="w-16 px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                                    />
                                                    <span className="text-sm text-gray-500 dark:text-gray-400">条</span>
                                                </div>
                                            </div>
                                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                                                设置每个平台卡片中显示的热点新闻数量
                                            </p>
                                        </div>

                                        <div>
                                            <label className="flex items-center gap-3 cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    checked={localSettings.autoRefresh}
                                                    onChange={(e) => setLocalSettings({
                                                        ...localSettings,
                                                        autoRefresh: e.target.checked
                                                    })}
                                                    className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                                                />
                                                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                                    自动刷新数据
                                                </span>
                                            </label>
                                        </div>
                                    </div>
                                )}

                                {/* 平台管理 */}
                                {activeTab === 'platforms' && (
                                    <div className="space-y-6">
                                        <div>
                                            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                                                平台选择与排序
                                            </h3>
                                            <div className="flex items-center justify-between mb-4">
                                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                                    点击选择平台（最多9个），拖拽调整显示顺序
                                                </p>
                                                <button
                                                    onClick={() => setLocalSettings({
                                                        ...localSettings,
                                                        featuredPlatforms: []
                                                    })}
                                                    disabled={localSettings.featuredPlatforms.length === 0}
                                                    className="px-3 py-1 text-xs font-medium text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                                >
                                                    全部取消
                                                </button>
                                            </div>
                                            <div className="grid grid-cols-3 gap-3">
                                                {(() => {
                                                    // 获取所有平台，按照platformOrder的顺序排列
                                                    const selectedPlatforms = localSettings.platformOrder.filter(code =>
                                                        localSettings.featuredPlatforms.includes(code)
                                                    );
                                                    const unselectedPlatforms = localSettings.platformOrder.filter(code =>
                                                        !localSettings.featuredPlatforms.includes(code)
                                                    );

                                                    const sortedPlatforms = [...selectedPlatforms, ...unselectedPlatforms];

                                                    return sortedPlatforms.map((platformCode) => {
                                                        const platform = PLATFORMS.find(p => p.code === platformCode);
                                                        if (!platform) return null;

                                                        const isSelected = localSettings.featuredPlatforms.includes(platform.code);
                                                        return (
                                                            <div
                                                                key={platform.code}
                                                                draggable={isSelected}
                                                                onDragStart={() => isSelected && handleDragStart(platform.code)}
                                                                onDragOver={handleDragOver}
                                                                onDrop={(e) => handleDrop(e, platform.code)}
                                                                onClick={() => handlePlatformToggle(platform.code)}
                                                                className={`flex items-center gap-3 p-3 rounded-lg border transition-all ${isSelected
                                                                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 cursor-move'
                                                                    : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 text-gray-700 dark:text-gray-300 cursor-pointer'
                                                                    } ${!isSelected && localSettings.featuredPlatforms.length >= 9 ? 'opacity-50 cursor-not-allowed' : ''}`}
                                                            >
                                                                {isSelected && (
                                                                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                                                                    </svg>
                                                                )}
                                                                <div
                                                                    className="w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold"
                                                                    style={{ backgroundColor: platform.color }}
                                                                >
                                                                    {platform.name.substring(0, 1)}
                                                                </div>
                                                                <span className="text-sm font-medium">{platform.name}</span>
                                                                {isSelected && (
                                                                    <svg className="w-4 h-4 ml-auto text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                                                                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                                    </svg>
                                                                )}
                                                            </div>
                                                        );
                                                    });
                                                })()}
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* 高级选项 */}
                                {activeTab === 'advanced' && (
                                    <div className="space-y-6">
                                        <div>
                                            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                                                外观设置
                                            </h3>
                                            <label className="flex items-center gap-3">
                                                <input
                                                    type="checkbox"
                                                    checked={localSettings.darkMode}
                                                    onChange={(e) => setLocalSettings({
                                                        ...localSettings,
                                                        darkMode: e.target.checked
                                                    })}
                                                    className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                                                />
                                                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                                    深色模式
                                                </span>
                                            </label>
                                        </div>

                                        <div>
                                            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                                                数据管理
                                            </h3>
                                            <div className="space-y-3">
                                                <button
                                                    onClick={handleReset}
                                                    className="px-4 py-2 text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                                                >
                                                    恢复默认设置
                                                </button>
                                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                                    这将重置所有设置到默认值
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* 底部操作栏 */}
                            <div className="flex items-center justify-between p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-750">
                                <div className="text-sm text-gray-500 dark:text-gray-400">
                                    设置将自动保存到本地存储
                                </div>
                                <div className="flex gap-3">
                                    <button
                                        onClick={onClose}
                                        className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                                    >
                                        取消
                                    </button>
                                    <button
                                        onClick={handleSave}
                                        className="px-6 py-2 text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 rounded-lg transition-all transform hover:scale-105"
                                    >
                                        保存设置
                                    </button>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}