# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 项目概述

这是一个基于 Next.js 的 AI 生图 Web 应用，使用 grsai 的 nano-banana-pro 模型提供文生图和图生图功能。

## 开发命令

```bash
npm run dev      # 启动开发服务器 (http://localhost:3000)
npm run build    # 构建生产版本
npm run start    # 启动生产服务器
npm run lint     # 运行 ESLint
```

## 技术栈

- **框架**: Next.js 15 (App Router) + React 19 + TypeScript
- **样式**: Tailwind CSS (苹果风格设计)
- **后端**: Next.js API Routes
- **状态管理**: React Hooks + localStorage

## 架构

### API 集成 (grsai nano-banana-pro)

- **基础地址**: `https://grsai.dakka.com.cn`
- **生图接口**: `POST /v1/draw/nano-banana`
- **响应方式**: 流式响应 (SSE格式，每行一个JSON对象)
- **图片URL有效期**: 2小时

API 响应格式：
```json
{
  "id": "任务ID",
  "results": [{"url": "图片URL", "content": "描述"}],
  "progress": 100,
  "status": "succeeded"
}
```

### 目录结构

```
app/
├── api/generate/route.ts    # 后端API路由，调用grsai并处理流式响应
├── layout.tsx                # 根布局
├── page.tsx                  # 主页面，标签切换和状态管理
└── globals.css               # 全局样式和Apple风格组件类
components/
├── TextToImage.tsx           # 文生图表单组件
├── ImageToImage.tsx          # 图生图表单组件（支持图片上传）
├── ProgressBar.tsx           # 进度条组件
├── ResultDisplay.tsx         # 生成结果展示组件
└── ImageGallery.tsx          # 历史记录画廊组件
lib/
├── types.ts                  # TypeScript类型定义和常量（模型、比例、尺寸选项）
└── api.ts                    # API调用封装（前端使用）
hooks/
└── useImageHistory.ts        # 历史记录Hook（localStorage持久化）
```

### 数据流

1. 用户在 `TextToImage` 或 `ImageToImage` 组件中输入参数
2. 前端调用 `lib/api.ts` 中的 `generateImageViaAPI()`
3. 请求发送到 `app/api/generate/route.ts`
4. 后端调用 grsai API，解析流式响应
5. 返回结果给前端，显示在 `ResultDisplay` 组件中
6. 同时保存到历史记录 (localStorage)

### 环境变量

在 `.env.local` 中配置：
```
GRSAI_API_KEY=your_api_key_here
GRSAI_BASE_URL=https://grsai.dakka.com.cn
```

### UI 设计规范

项目使用苹果风格设计，全局样式类定义在 `app/globals.css`：
- `apple-card` - 卡片容器
- `apple-button-primary` - 主要按钮（蓝色渐变）
- `apple-button-secondary` - 次要按钮（灰色）
- `apple-input` - 输入框
- `apple-select` - 下拉选择框

### 支持的模型

- nano-banana-fast (快速)
- nano-banana (标准)
- nano-banana-pro (专业)
- nano-banana-pro-vt
- nano-banana-pro-cl

### 支持的图片比例

auto, 1:1, 16:9, 9:16, 4:3, 3:4, 3:2, 2:3, 5:4, 4:5, 21:9

### 支持的图片尺寸

1K, 2K, 4K (仅 nano-banana-pro 系列支持)
