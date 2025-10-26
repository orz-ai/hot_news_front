"use client";

import { useState, useEffect } from "react";

const VERSION_STORAGE_KEY = "app_version_seen";

export function useVersionUpdate() {
  const [showVersionModal, setShowVersionModal] = useState(false);
  const [currentVersion, setCurrentVersion] = useState("");

  useEffect(() => {
    // 获取当前版本号
    const version = "1.0.3";
    setCurrentVersion(version);

    // 检查是否已经看过这个版本的更新说明
    const seenVersion = localStorage.getItem(VERSION_STORAGE_KEY);

    // 如果没有看过这个版本，或者版本号不同，则显示弹窗
    if (!seenVersion || seenVersion !== version) {
      setShowVersionModal(true);
    }
  }, []);

  const handleCloseVersionModal = () => {
    // 记录用户已经看过当前版本
    localStorage.setItem(VERSION_STORAGE_KEY, currentVersion);
    setShowVersionModal(false);
  };

  const resetVersionSeen = () => {
    localStorage.removeItem(VERSION_STORAGE_KEY);
    setShowVersionModal(true);
  };

  return {
    showVersionModal,
    currentVersion,
    handleCloseVersionModal,
    resetVersionSeen
  };
}