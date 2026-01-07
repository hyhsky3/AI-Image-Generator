"use client";

import { useState, useEffect } from "react";
import type { ImageHistoryItem } from "@/lib/types";

const STORAGE_KEY = "ai-image-history";

export function useImageHistory() {
  const [history, setHistory] = useState<ImageHistoryItem[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // 从localStorage加载历史记录
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        setHistory(parsed);
      }
    } catch (error) {
      console.error("加载历史记录失败:", error);
    } finally {
      setIsLoaded(true);
    }
  }, []);

  // 保存到localStorage
  const saveHistory = (newHistory: ImageHistoryItem[]) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newHistory));
    } catch (error) {
      console.error("保存历史记录失败:", error);
    }
  };

  // 添加历史记录
  const addHistory = (item: ImageHistoryItem) => {
    const newHistory = [...history, item];
    setHistory(newHistory);
    saveHistory(newHistory);
  };

  // 删除历史记录
  const deleteHistory = (id: string) => {
    const newHistory = history.filter((item) => item.id !== id);
    setHistory(newHistory);
    saveHistory(newHistory);
  };

  // 清空历史记录
  const clearHistory = () => {
    setHistory([]);
    saveHistory([]);
  };

  return {
    history,
    isLoaded,
    addHistory,
    deleteHistory,
    clearHistory,
  };
}
