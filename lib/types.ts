// API 请求参数类型
export interface GenerateRequest {
  model: string;
  prompt: string;
  aspectRatio?: string;
  imageSize?: string;
  urls?: string[];
  webHook?: string;
  shutProgress?: boolean;
}

// API 响应结果类型
export interface GenerateResult {
  url: string;
  content: string;
}

// API 响应类型
export interface GenerateResponse {
  id: string;
  results: GenerateResult[];
  progress: number;
  status: "running" | "succeeded" | "failed";
  failure_reason?: string;
  error?: string;
}

// 流式响应类型
export interface StreamChunk {
  id?: string;
  results?: GenerateResult[];
  progress?: number;
  status?: string;
  failure_reason?: string;
  error?: string;
}

// 历史记录项类型
export interface ImageHistoryItem {
  id: string;
  type: "text-to-image" | "image-to-image";
  prompt: string;
  imageUrl: string;
  referenceImageUrl?: string;
  model: string;
  aspectRatio: string;
  imageSize: string;
  createdAt: number;
}

// 生成参数类型
export interface GenerateParams {
  prompt: string;
  referenceImage?: File | string;
  model: string;
  aspectRatio: string;
  imageSize: string;
}

// 模型选项
export const MODELS = [
  { value: "nano-banana-fast", label: "Fast (快速)" },
  { value: "nano-banana", label: "Standard (标准)" },
  { value: "nano-banana-pro", label: "Pro (专业)" },
  { value: "nano-banana-pro-vt", label: "Pro VT" },
  { value: "nano-banana-pro-cl", label: "Pro CL" },
] as const;

// 比例选项
export const ASPECT_RATIOS = [
  { value: "auto", label: "自动" },
  { value: "1:1", label: "1:1 (正方形)" },
  { value: "16:9", label: "16:9 (横向)" },
  { value: "9:16", label: "9:16 (竖向)" },
  { value: "4:3", label: "4:3 (横向)" },
  { value: "3:4", label: "3:4 (竖向)" },
  { value: "3:2", label: "3:2 (横向)" },
  { value: "2:3", label: "2:3 (竖向)" },
  { value: "5:4", label: "5:4 (横向)" },
  { value: "4:5", label: "4:5 (竖向)" },
  { value: "21:9", label: "21:9 (超宽)" },
] as const;

// 尺寸选项
export const IMAGE_SIZES = [
  { value: "1K", label: "1K (快速)" },
  { value: "2K", label: "2K (高清)" },
  { value: "4K", label: "4K (超清)" },
] as const;

// 标签页类型
export type TabType = "text-to-image" | "image-to-image" | "gallery";
