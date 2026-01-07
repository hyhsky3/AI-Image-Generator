import { NextRequest, NextResponse } from "next/server";

// Cloudflare Pages 需要 Edge Runtime
export const runtime = 'edge';

// ArrayBuffer 转 Base64 (Edge Runtime 兼容)
function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

// 创建超时控制器
function createTimeoutController(ms: number) {
  const controller = new AbortController();
  setTimeout(() => controller.abort(), ms);
  return controller;
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();

    const prompt = formData.get("prompt") as string;
    const model = formData.get("model") as string;
    const aspectRatio = formData.get("aspectRatio") as string;
    const imageSize = formData.get("imageSize") as string;
    const referenceImage = formData.get("referenceImage") as File | null;
    const referenceImageUrl = formData.get("referenceImageUrl") as string | null;

    if (!prompt) {
      return NextResponse.json({ message: "请输入提示词" }, { status: 400 });
    }

    // 构建请求体
    const body: {
      model: string;
      prompt: string;
      aspectRatio: string;
      imageSize: string;
      urls?: string[];
      shutProgress: boolean;
    } = {
      model,
      prompt,
      aspectRatio,
      imageSize,
      shutProgress: false,
    };

    // 处理参考图片 (Edge Runtime 兼容)
    if (referenceImage) {
      const bytes = await referenceImage.arrayBuffer();
      const base64 = arrayBufferToBase64(bytes);
      body.urls = [`data:${referenceImage.type};base64,${base64}`];
    } else if (referenceImageUrl) {
      body.urls = [referenceImageUrl];
    }

    // 获取环境变量
    const API_KEY = (request.headers.get("x-api-key") || process.env.GRSAI_API_KEY || "");
    const BASE_URL = process.env.GRSAI_BASE_URL || "https://grsai.dakka.com.cn";

    // 调用 grsai API (设置10分钟超时)
    const controller = createTimeoutController(10 * 60 * 1000);
    const response = await fetch(`${BASE_URL}/v1/draw/nano-banana`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${API_KEY}`,
      },
      body: JSON.stringify(body),
      signal: controller.signal,
    });

    if (!response.ok) {
      return NextResponse.json(
        { message: `API请求失败: ${response.status}` },
        { status: response.status }
      );
    }

    // 处理流式响应
    const reader = response.body?.getReader();
    if (!reader) {
      return NextResponse.json(
        { message: "无法获取响应流" },
        { status: 500 }
      );
    }

    const decoder = new TextDecoder();
    let buffer = "";
    let finalResult: any = null;

    while (true) {
      const { done, value } = await reader.read();
      if (done) {
        if (buffer.trim()) {
          try {
            const data = JSON.parse(buffer);
            finalResult = data;
          } catch (e) {
            // 解析失败，忽略
          }
        }
        break;
      }

      buffer += decoder.decode(value, { stream: true });

      const lines = buffer.split("\n");
      buffer = lines.pop() || "";

      for (const line of lines) {
        const trimmedLine = line.trim();
        if (!trimmedLine) continue;

        const jsonLine = trimmedLine.replace(/^data:\s*/i, "");

        try {
          const data = JSON.parse(jsonLine);
          if (data.status === "succeeded" || data.status === "failed") {
            finalResult = data;
            break;
          }
        } catch (e) {
          // 解析失败，跳过
        }
      }

      if (finalResult) break;
    }

    if (!finalResult) {
      return NextResponse.json(
        { message: "未能获取生成结果" },
        { status: 500 }
      );
    }

    // Handle upstream error format { code: -1, msg: "..." }
    if (finalResult.code === -1 && finalResult.msg) {
      return NextResponse.json(
        { message: `服务商错误: ${finalResult.msg}` },
        { status: 400 }
      );
    }

    return NextResponse.json(finalResult);
  } catch (error) {
    // 检查是否是超时错误
    if (error instanceof Error && error.name === "AbortError") {
      return NextResponse.json(
        { message: "生成超时，请尝试使用更小的图片尺寸或简化提示词" },
        { status: 408 }
      );
    }

    return NextResponse.json(
      { message: error instanceof Error ? error.message : "生成失败，请稍后重试" },
      { status: 500 }
    );
  }
}
