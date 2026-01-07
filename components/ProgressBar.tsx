"use client";

import React from "react";

interface ProgressBarProps {
  progress: number;
  status?: string;
}

export default function ProgressBar({ progress, status }: ProgressBarProps) {
  const getStatusText = () => {
    if (progress >= 100) return "完成";
    if (progress > 70) return "渲染中...";
    if (progress > 30) return "生成中...";
    return "准备中...";
  };

  return (
    <div className="w-full space-y-3">
      <div className="flex justify-between items-center">
        <span className="text-sm text-gray-600 dark:text-gray-400">
          {status || getStatusText()}
        </span>
        <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
          {progress}%
        </span>
      </div>
      <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-blue-500 to-blue-600 rounded-full transition-all duration-300 ease-out"
          style={{ width: `${Math.min(progress, 100)}%` }}
        />
      </div>
    </div>
  );
}
