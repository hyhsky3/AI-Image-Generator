import type {
  GenerateRequest,
  GenerateResponse,
  StreamChunk,
  GenerateParams,
} from "./types";

// 获取环境变量
const API_KEY = process.env.GRSAI_API_KEY || "";
const BASE_URL = process.env.GRSAI_BASE_URL || "https://grsai.dakka.com.cn";

// 文生图API调用
export async function generateImage(
  params: GenerateParams,
  onProgress?: (progress: number, status: string) => void
): Promise<GenerateResponse> {
  const { prompt, referenceImage, model, aspectRatio, imageSize } = params;

  // 构建请求体
  const body: GenerateRequest = {
    model,
    prompt,
    aspectRatio,
    imageSize,
    shutProgress: false,
  };

  // 如果有参考图片，添加到请求
  if (referenceImage) {
    if (typeof referenceImage === "string") {
      body.urls = [referenceImage];
    } else {
      // 将File转换为base64
      const base64 = await fileToBase64(referenceImage);
      body.urls = [base64];
    }
  }

  try {
    const response = await fetch(`${BASE_URL}/v1/draw/nano-banana`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${API_KEY}`,
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`API请求失败: ${response.status} - ${errorText}`);
    }

    // 处理流式响应
    const reader = response.body?.getReader();
    if (!reader) {
      throw new Error("无法获取响应流");
    }

    const decoder = new TextDecoder();
    let finalResult: GenerateResponse | null = null;

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value, { stream: true });
      const lines = chunk.split("\n").filter((line) => line.trim());

      for (const line of lines) {
        try {
          const data: StreamChunk = JSON.parse(line);

          // 更新进度
          if (data.progress !== undefined && onProgress) {
            onProgress(data.progress, data.status || "running");
          }

          // 如果状态是成功或失败，保存结果
          if (data.status === "succeeded" || data.status === "failed") {
            finalResult = {
              id: data.id || "",
              results: data.results || [],
              progress: data.progress || 100,
              status: data.status as "succeeded" | "failed",
              failure_reason: data.failure_reason,
              error: data.error,
            };
          }
        } catch (e) {
          // 忽略解析错误
        }
      }
    }

    if (!finalResult) {
      throw new Error("未能获取生成结果");
    }

    return finalResult;
  } catch (error) {
    console.error("生成图片失败:", error);
    throw error;
  }
}

// 将File转换为base64
function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      // 移除data:image/xxx;base64,前缀
      const base64 = result.split(",")[1];
      resolve(`data:${file.type};base64,${base64}`);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

// 从API路由调用生成接口（前端使用）
export async function generateImageViaAPI(
  params: GenerateParams,
  onProgress?: (progress: number, status: string) => void
): Promise<GenerateResponse> {
  // 创建FormData以支持文件上传
  const formData = new FormData();
  formData.append("prompt", params.prompt);
  formData.append("model", params.model);
  formData.append("aspectRatio", params.aspectRatio);
  formData.append("imageSize", params.imageSize);

  if (params.referenceImage) {
    if (typeof params.referenceImage === "string") {
      formData.append("referenceImageUrl", params.referenceImage);
    } else {
      formData.append("referenceImage", params.referenceImage);
    }
  }

  const response = await fetch("/api/generate", {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "生成失败");
  }

  return response.json();
}
