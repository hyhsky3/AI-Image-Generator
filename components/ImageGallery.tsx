"use client";

import React, { useState } from "react";
import type { ImageHistoryItem } from "@/lib/types";

interface ImageGalleryProps {
  history: ImageHistoryItem[];
  onDelete: (id: string) => void;
  onClear: () => void;
}

export default function ImageGallery({
  history,
  onDelete,
  onClear,
}: ImageGalleryProps) {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const sortedHistory = [...history].sort((a, b) => b.createdAt - a.createdAt);

  return (
    <div className="apple-card p-8 space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
          历史记录
        </h2>
        {history.length > 0 && (
          <button
            onClick={onClear}
            className="text-sm text-red-500 hover:text-red-600 transition-colors"
          >
            清空历史
          </button>
        )}
      </div>

      {sortedHistory.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <svg
            className="w-24 h-24 text-gray-300 dark:text-gray-600 mb-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
          <p className="text-gray-500 dark:text-gray-400">
            暂无历史记录
          </p>
          <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
            生成的图片将显示在这里
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {sortedHistory.map((item) => (
            <div
              key={item.id}
              className="group relative bg-gray-100 dark:bg-gray-700 rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-lg"
            >
              <div
                className="aspect-square cursor-pointer overflow-hidden"
                onClick={() => setSelectedImage(item.imageUrl)}
              >
                <img
                  src={item.imageUrl}
                  alt={item.prompt}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
              </div>
              <div className="p-4">
                <p className="text-sm text-gray-700 dark:text-gray-300 line-clamp-2 mb-2">
                  {item.prompt}
                </p>
                <div className="flex justify-between items-center text-xs text-gray-500 dark:text-gray-400">
                  <span>
                    {item.type === "text-to-image" ? "文生图" : "图生图"}
                  </span>
                  <span>{item.model}</span>
                </div>
                <button
                  onClick={() => onDelete(item.id)}
                  className="mt-3 w-full py-2 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-colors"
                >
                  删除
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 图片预览模态框 */}
      {selectedImage && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
          onClick={() => setSelectedImage(null)}
        >
          <div className="relative max-w-4xl max-h-[90vh] p-4">
            <img
              src={selectedImage}
              alt="预览"
              className="max-w-full max-h-[85vh] object-contain rounded-2xl"
              onClick={(e) => e.stopPropagation()}
            />
            <button
              onClick={() => setSelectedImage(null)}
              className="absolute top-6 right-6 text-white hover:text-gray-300 transition-colors"
            >
              <svg
                className="w-8 h-8"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
