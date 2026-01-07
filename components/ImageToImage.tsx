"use client";

import React, { useState, useRef } from "react";
import { MODELS, ASPECT_RATIOS, IMAGE_SIZES } from "@/lib/types";
import ProgressBar from "./ProgressBar";

interface ImageToImageProps {
  onGenerate: (params: {
    prompt: string;
    referenceImage: File;
    model: string;
    aspectRatio: string;
    imageSize: string;
  }) => Promise<void>;
  isGenerating: boolean;
  progress: number;
}

export default function ImageToImage({
  onGenerate,
  isGenerating,
  progress,
}: ImageToImageProps) {
  const [prompt, setPrompt] = useState("");
  const [model, setModel] = useState("nano-banana-pro");
  const [aspectRatio, setAspectRatio] = useState("auto");
  const [imageSize, setImageSize] = useState("1K");
  const [referenceImage, setReferenceImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith("image/")) {
      setReferenceImage(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  const handleRemoveImage = () => {
    setReferenceImage(null);
    setPreviewUrl(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim() || !referenceImage || isGenerating) return;

    await onGenerate({ prompt, referenceImage, model, aspectRatio, imageSize });
  };

  return (
    <div className="apple-card p-8 space-y-6">
      <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
        图生图
      </h2>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* 参考图片上传 */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            参考图片
          </label>
          <div className="flex flex-col items-center justify-center">
            {previewUrl ? (
              <div className="relative w-full">
                <img
                  src={previewUrl}
                  alt="参考图片"
                  className="w-full h-64 object-cover rounded-2xl"
                />
                <button
                  type="button"
                  onClick={handleRemoveImage}
                  className="absolute top-3 right-3 bg-red-500 text-white rounded-full w-8 h-8 flex items-center justify-center hover:bg-red-600 transition-colors"
                  disabled={isGenerating}
                >
                  ×
                </button>
              </div>
            ) : (
              <div
                className="w-full h-64 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-2xl flex flex-col items-center justify-center cursor-pointer hover:border-blue-500 transition-colors"
                onClick={() => !isGenerating && fileInputRef.current?.click()}
              >
                <svg
                  className="w-16 h-16 text-gray-400 mb-3"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
                <p className="text-gray-500 dark:text-gray-400">
                  点击上传参考图片
                </p>
                <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
                  支持 PNG, JPG, JPEG
                </p>
              </div>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
              disabled={isGenerating}
            />
          </div>
        </div>

        {/* 提示词输入 */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            提示词
          </label>
          <textarea
            className="apple-input min-h-[120px] resize-none"
            placeholder="描述你想要生成的图片，例如：将这张图片转换为卡通风格..."
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
            disabled={!prompt.trim() || !referenceImage || isGenerating}
          >
            {isGenerating ? "生成中..." : "开始生成"}
          </button>
        </div>
      </form>
    </div>
  );
}
