"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslations } from 'next-intl';
import { PLATFORMS } from "../constants/platforms";
import { PlatformType } from "../types";
import { usePlatformI18n } from "@/lib/platform-i18n";
import LanguageSwitcher from './LanguageSwitcher';

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
    platformOrder: PLATFORMS.map(platform => platform.code),
    autoRefresh: true,
    darkMode: false,
};

export default function SettingsModal({ isOpen, onClose, settings, onSettingsChange }: SettingsModalProps) {
    const [localSettings, setLocalSettings] = useState<UserSettings>(settings);
    const [activeTab, setActiveTab] = useState<'platforms' | 'display' | 'language' | 'advanced'>('platforms');
    const [draggedItem, setDraggedItem] = useState<PlatformType | null>(null);
    const t = useTranslations('settings');
    const { translatedPlatforms, getPlatformShortName } = usePlatformI18n();

    useEffect(() => {
        if (isOpen) {
            const currentPlatformCodes = translatedPlatforms.map(p => p.code);
            const existingOrder = settings.platformOrder || [];
            const validExistingOrder = existingOrder.filter(code => currentPlatformCodes.includes(code));
            const newPlatforms = currentPlatformCodes.filter(code => !existingOrder.includes(code));
            const syncedPlatformOrder = [...validExistingOrder, ...newPlatforms];

            setLocalSettings({
                ...settings,
                platformOrder: syncedPlatformOrder
            });
        }
    }, [settings, isOpen]);

    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape' && isOpen) {
                onClose();
            }
        };

        if (isOpen) {
            document.addEventListener('keydown', handleKeyDown);
        }

        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, onClose]);

    const handleSave = () => {
        onSettingsChange(localSettings);
        onClose();
    };

    const handleReset = () => {
        setLocalSettings(DEFAULT_SETTINGS);
    };

    const handlePlatformToggle = (platformCode: PlatformType) => {
        if (localSettings.featuredPlatforms.includes(platformCode)) {
            setLocalSettings({
                ...localSettings,
                featuredPlatforms: localSettings.featuredPlatforms.filter(p => p !== platformCode)
            });
        } else {
            if (localSettings.featuredPlatforms.length >= 9) {
                return;
            }
            setLocalSettings({
                ...localSettings,
                featuredPlatforms: [...localSettings.featuredPlatforms, platformCode]
            });
        }
    };

    const handleDragStart = (platformCode: PlatformType) => setDraggedItem(platformCode);
    const handleDragOver = (e: React.DragEvent) => e.preventDefault();
    const handleDrop = (e: React.DragEvent, targetPlatform: PlatformType) => {
        e.preventDefault();
        if (!draggedItem) return;

        const newOrder = [...localSettings.platformOrder];
        const draggedIndex = newOrder.indexOf(draggedItem);
        const targetIndex = newOrder.indexOf(targetPlatform);
        newOrder.splice(draggedIndex, 1);
        newOrder.splice(targetIndex, 0, draggedItem);

        setLocalSettings({ ...localSettings, platformOrder: newOrder });
        setDraggedItem(null);
    };

    const tabs = [
        { id: 'platforms', name: t('tabs.platforms') },
        { id: 'display', name: t('tabs.display') },
        { id: 'language', name: t('tabs.language') },
        { id: 'advanced', name: t('tabs.advanced') }
    ] as const;

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
                        onClick={onClose}
                    />

                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                        className="fixed inset-0 z-50 flex items-center justify-center p-4"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 w-full max-w-4xl h-[600px] overflow-hidden flex flex-col">
                            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
                                <div>
                                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">{t('title')}</h2>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">{t('subtitle')}</p>
                                </div>
                                <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">×</button>
                            </div>

                            <div className="flex border-b border-gray-200 dark:border-gray-700">
                                {tabs.map((tab) => (
                                    <button
                                        key={tab.id}
                                        onClick={() => setActiveTab(tab.id)}
                                        className={`flex items-center gap-2 px-6 py-4 font-medium transition-colors ${activeTab === tab.id
                                            ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400'
                                            : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                                            }`}
                                    >
                                        {tab.name}
                                    </button>
                                ))}
                            </div>

                            <div className="flex-1 p-6 overflow-y-auto">
                                {activeTab === 'display' && (
                                    <div className="space-y-6">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">{t('display.count')}</label>
                                            <div className="flex items-center gap-4">
                                                <input
                                                    type="range"
                                                    min="5"
                                                    max="50"
                                                    value={localSettings.newsDisplayCount}
                                                    onChange={(e) => setLocalSettings({ ...localSettings, newsDisplayCount: parseInt(e.target.value) })}
                                                    className="flex-1 h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer"
                                                />
                                                <div className="flex items-center gap-2">
                                                    <input
                                                        type="number"
                                                        min="5"
                                                        max="50"
                                                        value={localSettings.newsDisplayCount}
                                                        onChange={(e) => setLocalSettings({ ...localSettings, newsDisplayCount: parseInt(e.target.value) || 10 })}
                                                        className="w-16 px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                                    />
                                                    <span className="text-sm text-gray-500 dark:text-gray-400">{t('display.unit')}</span>
                                                </div>
                                            </div>
                                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">{t('display.hint')}</p>
                                        </div>

                                        <label className="flex items-center gap-3 cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={localSettings.autoRefresh}
                                                onChange={(e) => setLocalSettings({ ...localSettings, autoRefresh: e.target.checked })}
                                                className="w-4 h-4"
                                            />
                                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{t('display.autoRefresh')}</span>
                                        </label>
                                    </div>
                                )}

                                {activeTab === 'platforms' && (
                                    <div className="space-y-6">
                                        <div>
                                            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">{t('platforms.title')}</h3>
                                            <div className="flex items-center justify-between mb-4">
                                                <p className="text-sm text-gray-500 dark:text-gray-400">{t('platforms.hint')}</p>
                                                <button
                                                    onClick={() => setLocalSettings({ ...localSettings, featuredPlatforms: [] })}
                                                    disabled={localSettings.featuredPlatforms.length === 0}
                                                    className="px-3 py-1 text-xs font-medium text-gray-600 dark:text-gray-400 hover:text-red-600 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                                >
                                                    {t('platforms.clear')}
                                                </button>
                                            </div>
                                            <div className="grid grid-cols-3 gap-3">
                                                {localSettings.platformOrder.map((platformCode) => {
                                                    const platform = translatedPlatforms.find(p => p.code === platformCode);
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
                                                            <div className="w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold" style={{ backgroundColor: platform.color }}>
                                                                {getPlatformShortName(platform.code).substring(0, 1)}
                                                            </div>
                                                            <span className="text-sm font-medium">{platform.name}</span>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {activeTab === 'language' && (
                                    <div className="space-y-6">
                                        <div>
                                            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">{t('language.title')}</h3>
                                            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">{t('language.hint')}</p>
                                            <div className="inline-flex items-center rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/60 px-4 py-3">
                                                <LanguageSwitcher />
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {activeTab === 'advanced' && (
                                    <div className="space-y-6">
                                        <div>
                                            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">{t('advanced.appearance')}</h3>
                                            <label className="flex items-center gap-3">
                                                <input
                                                    type="checkbox"
                                                    checked={localSettings.darkMode}
                                                    onChange={(e) => setLocalSettings({ ...localSettings, darkMode: e.target.checked })}
                                                    className="w-4 h-4"
                                                />
                                                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{t('advanced.darkMode')}</span>
                                            </label>
                                        </div>

                                        <div>
                                            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">{t('advanced.data')}</h3>
                                            <button onClick={handleReset} className="px-4 py-2 text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 rounded-lg transition-colors">{t('advanced.reset')}</button>
                                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">{t('advanced.resetHint')}</p>
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="flex items-center justify-between p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-750">
                                <div className="text-sm text-gray-500 dark:text-gray-400">{t('footer.hint')}</div>
                                <div className="flex gap-3">
                                    <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">{t('footer.cancel')}</button>
                                    <button onClick={handleSave} className="px-6 py-2 text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 rounded-lg transition-all transform hover:scale-105">{t('footer.save')}</button>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
