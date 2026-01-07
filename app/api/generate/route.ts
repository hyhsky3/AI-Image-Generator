import { NextRequest, NextResponse } from "next/server";

// Cloudflare Pages 需要 Edge Runtime
export const runtime = 'edge';

const API_KEY = process.env.GRSAI_API_KEY || "";
const BASE_URL = process.env.GRSAI_BASE_URL || "https://grsai.dakka.com.cn";

// 创建超时时间较长的 AbortController (10分钟)
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

    // 处理参考图片
    if (referenceImage) {
      const bytes = await referenceImage.arrayBuffer();
      const buffer = Buffer.from(bytes);
      const base64 = `data:${referenceImage.type};base64,${buffer.toString("base64")}`;
      body.urls = [base64];
    } else if (referenceImageUrl) {
      body.urls = [referenceImageUrl];
    }

    // 调用grsai API (设置10分钟超时)
    const controller = createTimeoutController(10 * 60 * 1000); // 10分钟
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
      const errorText = await response.text();
      return NextResponse.json(
        { message: `API请求失败: ${response.status}` },
        { status: response.status }
      );
    }

    // 处理流式响应
    const reader = response.body?.getReader();
    if (!reader) {
      console.error("无法获取响应流");
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
        // 处理缓冲区中剩余的数据
        if (buffer.trim()) {
          try {
            const data = JSON.parse(buffer);
            console.log("最终数据:", JSON.stringify(data, null, 2));
            finalResult = data;
          } catch (e) {
            console.error("解析最终数据失败:", buffer);
          }
        }
        break;
      }

      buffer += decoder.decode(value, { stream: true });

      // 尝试解析缓冲区中的数据
      // SSE格式可能以 "data: " 开头
      const lines = buffer.split("\n");
      buffer = lines.pop() || ""; // 保留最后一行可能不完整的数据

      for (const line of lines) {
        const trimmedLine = line.trim();
        if (!trimmedLine) continue;

        // 移除SSE的 "data: " 前缀
        const jsonLine = trimmedLine.replace(/^data:\s*/i, "");

        try {
          const data = JSON.parse(jsonLine);
          console.log("解析到数据:", JSON.stringify(data, null, 2));

          if (data.status === "succeeded" || data.status === "failed") {
            finalResult = data;
            break;
          }
        } catch (e) {
          console.log("解析失败，跳过:", jsonLine.substring(0, 100));
        }
      }

      if (finalResult) break;
    }

    if (!finalResult) {
      console.error("未能获取最终结果");
      return NextResponse.json(
        { message: "未能获取生成结果" },
        { status: 500 }
      );
    }

    return NextResponse.json(finalResult);
  } catch (error) {
    console.error("生成图片失败:", error);

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
