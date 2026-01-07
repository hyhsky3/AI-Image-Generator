"use client";

import React, { useState } from "react";
import { MODELS, ASPECT_RATIOS, IMAGE_SIZES } from "@/lib/types";
import ProgressBar from "./ProgressBar";

interface TextToImageProps {
  onGenerate: (params: {
    prompt: string;
    model: string;
    aspectRatio: string;
    imageSize: string;
  }) => Promise<void>;
  isGenerating: boolean;
  progress: number;
}

export default function TextToImage({
  onGenerate,
  isGenerating,
  progress,
}: TextToImageProps) {
  const [prompt, setPrompt] = useState("");
  const [model, setModel] = useState("nano-banana-pro");
  const [aspectRatio, setAspectRatio] = useState("auto");
  const [imageSize, setImageSize] = useState("1K");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim() || isGenerating) return;

    await onGenerate({ prompt, model, aspectRatio, imageSize });
  };

  return (
    <div className="apple-card p-8 space-y-6">
      <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
        文生图
      </h2>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* 提示词输入 */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            提示词
          </label>
          <textarea
            className="apple-input min-h-[120px] resize-none"
            placeholder="描述你想要生成的图片，例如：一只可爱的猫咪在草地上玩耍..."
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            disabled={isGenerating}
          />
        </div>

        {/* 参数设置 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* 模型选择 */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              模型
            </label>
            <select
              className="apple-select"
              value={model}
              onChange={(e) => setModel(e.target.value)}
              disabled={isGenerating}
            >
              {MODELS.map((m) => (
                <option key={m.value} value={m.value}>
                  {m.label}
                </option>
              ))}
            </select>
          </div>

          {/* 比例选择 */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              图片比例
            </label>
            <select
              className="apple-select"
              value={aspectRatio}
              onChange={(e) => setAspectRatio(e.target.value)}
              disabled={isGenerating}
            >
              {ASPECT_RATIOS.map((ratio) => (
                <option key={ratio.value} value={ratio.value}>
                  {ratio.label}
                </option>
              ))}
            </select>
          </div>

          {/* 尺寸选择 */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              图片尺寸
            </label>
            <select
              className="apple-select"
              value={imageSize}
              onChange={(e) => setImageSize(e.target.value)}
              disabled={isGenerating}
            >
              {IMAGE_SIZES.map((size) => (
                <option key={size.value} value={size.value}>
                  {size.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* 进度条 */}
        {isGenerating && <ProgressBar progress={progress} />}

        {/* 生成按钮 */}
        <div className="flex justify-end">
          <button
            type="submit"
            className="apple-button-primary"
            disabled={!prompt.trim() || isGenerating}
          >
            {isGenerating ? "生成中..." : "开始生成"}
          </button>
        </div>
      </form>
    </div>
  );
}
