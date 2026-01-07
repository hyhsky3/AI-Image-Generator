"use client";

import React, { useState } from "react";

interface ResultDisplayProps {
  imageUrl: string | null;
  prompt: string;
  loading: boolean;
  onSave?: () => void;
}

export default function ResultDisplay({
  imageUrl,
  prompt,
  loading,
  onSave,
}: ResultDisplayProps) {
  const [showModal, setShowModal] = useState(false);

  if (!imageUrl && !loading) {
    return null;
  }

  return (
    <>
      <div className="apple-card p-8 space-y-6">
        <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
          生成结果
        </h2>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-16">
            <div className="relative w-24 h-24 mb-6">
              <div className="absolute inset-0 border-4 border-gray-200 dark:border-gray-700 rounded-full"></div>
              <div className="absolute inset-0 border-4 border-blue-500 rounded-full border-t-transparent animate-spin"></div>
            </div>
            <p className="text-gray-600 dark:text-gray-400">
              正在生成图片，请稍候...
            </p>
          </div>
        ) : imageUrl ? (
          <div className="space-y-4">
            <div className="relative overflow-hidden rounded-2xl bg-gray-100 dark:bg-gray-700">
              <img
                src={imageUrl}
                alt={prompt}
                className="w-full h-auto cursor-pointer hover:opacity-90 transition-opacity"
                onClick={() => setShowModal(true)}
              />
            </div>
            <div className="space-y-2">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                <span className="font-medium">提示词：</span>
                {prompt}
              </p>
              <div className="flex gap-3">
                <a
                  href={imageUrl}
                  download={`ai-image-${Date.now()}.png`}
                  className="apple-button-secondary text-center"
                >
                  下载图片
                </a>
                {onSave && (
                  <button onClick={onSave} className="apple-button-secondary">
                    保存到历史
                  </button>
                )}
              </div>
            </div>
          </div>
        ) : null}
      </div>

      {/* 图片预览模态框 */}
      {showModal && imageUrl && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
          onClick={() => setShowModal(false)}
        >
          <div className="relative max-w-4xl max-h-[90vh] p-4">
            <img
              src={imageUrl}
              alt="预览"
              className="max-w-full max-h-[85vh] object-contain rounded-2xl"
              onClick={(e) => e.stopPropagation()}
            />
            <button
              onClick={() => setShowModal(false)}
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
    </>
  );
}
