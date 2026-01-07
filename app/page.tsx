"use client";

import React, { useState } from "react";
import { useImageHistory } from "@/hooks/useImageHistory";
import { generateImageViaAPI } from "@/lib/api";
import type { TabType, ImageHistoryItem } from "@/lib/types";
import TextToImage from "@/components/TextToImage";
import ImageToImage from "@/components/ImageToImage";
import ImageGallery from "@/components/ImageGallery";
import ResultDisplay from "@/components/ResultDisplay";

export default function Home() {
  const [activeTab, setActiveTab] = useState<TabType>("text-to-image");
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [resultImageUrl, setResultImageUrl] = useState<string | null>(null);
  const [resultPrompt, setResultPrompt] = useState("");
  const { history, addHistory, deleteHistory, clearHistory } =
    useImageHistory();

  // 文生图
  const handleTextToImage = async (params: {
    prompt: string;
    model: string;
    aspectRatio: string;
    imageSize: string;
  }) => {
    setIsGenerating(true);
    setProgress(0);
    setResultImageUrl(null);

    try {
      const result = await generateImageViaAPI(params, (prog) => {
        setProgress(prog);
      });

      if (result.results && result.results.length > 0) {
        const imageUrl = result.results[0].url;
        setResultImageUrl(imageUrl);
        setResultPrompt(params.prompt);

        // 添加到历史记录
        const historyItem: ImageHistoryItem = {
          id: result.id || `gen-${Date.now()}`,
          type: "text-to-image",
          prompt: params.prompt,
          imageUrl,
          model: params.model,
          aspectRatio: params.aspectRatio,
          imageSize: params.imageSize,
          createdAt: Date.now(),
        };
        addHistory(historyItem);
      } else {
        alert("生成失败，请重试");
      }
    } catch (error) {
      console.error("生成失败:", error);
      alert(error instanceof Error ? error.message : "生成失败，请重试");
    } finally {
      setIsGenerating(false);
      setProgress(0);
    }
  };

  // 图生图
  const handleImageToImage = async (params: {
    prompt: string;
    referenceImage: File;
    model: string;
    aspectRatio: string;
    imageSize: string;
  }) => {
    setIsGenerating(true);
    setProgress(0);
    setResultImageUrl(null);

    try {
      const result = await generateImageViaAPI(params, (prog) => {
        setProgress(prog);
      });

      if (result.results && result.results.length > 0) {
        const imageUrl = result.results[0].url;
        setResultImageUrl(imageUrl);
        setResultPrompt(params.prompt);

        // 添加到历史记录
        const historyItem: ImageHistoryItem = {
          id: result.id || `gen-${Date.now()}`,
          type: "image-to-image",
          prompt: params.prompt,
          imageUrl,
          model: params.model,
          aspectRatio: params.aspectRatio,
          imageSize: params.imageSize,
          createdAt: Date.now(),
        };
        addHistory(historyItem);
      } else {
        alert("生成失败，请重试");
      }
    } catch (error) {
      console.error("生成失败:", error);
      alert(error instanceof Error ? error.message : "生成失败，请重试");
    } finally {
      setIsGenerating(false);
      setProgress(0);
    }
  };

  // 标签页配置
  const tabs: { key: TabType; label: string }[] = [
    { key: "text-to-image", label: "文生图" },
    { key: "image-to-image", label: "图生图" },
    { key: "gallery", label: "历史记录" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      {/* 头部 */}
      <header className="sticky top-0 z-40 backdrop-blur-xl bg-white/70 dark:bg-gray-900/70 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-6xl mx-auto px-6 py-4">
          {/* Logo 区域 */}
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 bg-clip-text text-transparent">
                ArtFlow AI
              </h1>
              <p className="text-xs text-gray-500 dark:text-gray-400">智能创作，无限想象</p>
            </div>
          </div>
          {/* 标签导航 */}
          <nav className="flex gap-2">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`px-5 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                  activeTab === tab.key
                    ? "bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg"
                    : "text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>
      </header>

      {/* 主内容 */}
      <main className="max-w-6xl mx-auto px-6 py-8 space-y-8">
        {activeTab === "text-to-image" && (
          <>
            <TextToImage
              onGenerate={handleTextToImage}
              isGenerating={isGenerating}
              progress={progress}
            />
            <ResultDisplay
              imageUrl={resultImageUrl}
              prompt={resultPrompt}
              loading={isGenerating}
            />
          </>
        )}

        {activeTab === "image-to-image" && (
          <>
            <ImageToImage
              onGenerate={handleImageToImage}
              isGenerating={isGenerating}
              progress={progress}
            />
            <ResultDisplay
              imageUrl={resultImageUrl}
              prompt={resultPrompt}
              loading={isGenerating}
            />
          </>
        )}

        {activeTab === "gallery" && (
          <ImageGallery
            history={history}
            onDelete={deleteHistory}
            onClear={clearHistory}
          />
        )}
      </main>

      {/* 页脚 */}
      <footer className="max-w-6xl mx-auto px-6 py-6 text-center text-sm text-gray-500 dark:text-gray-400">
        <p>Powered by nano-banana-pro</p>
      </footer>
    </div>
  );
}
