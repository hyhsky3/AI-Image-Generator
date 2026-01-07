# AI Image Generator

基于 Next.js 的 AI 生图 Web 应用，使用 grsai 的 nano-banana-pro 模型提供文生图和图生图功能。

## 功能特性

- 文生图 (Text to Image) - 通过文字描述生成图片
- 图生图 (Image to Image) - 上传参考图片生成新图片
- 多种模型选择 (nano-banana-fast / nano-banana / nano-banana-pro 等)
- 多种图片比例支持 (1:1, 16:9, 9:16, 4:3, 3:4, 21:9 等)
- 多种分辨率支持 (1K, 2K, 4K)
- 实时进度显示
- 生成历史记录保存

## 技术栈

- **框架**: Next.js 15 (App Router) + React 19 + TypeScript
- **样式**: Tailwind CSS (Apple 风格设计)
- **状态管理**: React Hooks + localStorage

## 快速开始

### 本地开发

1. 克隆项目并安装依赖：

```bash
npm install
```

2. 配置环境变量，复制 `.env.example` 为 `.env.local`：

```bash
cp .env.example .env.local
```

3. 在 `.env.local` 中填入你的 API Key：

```env
GRSAI_API_KEY=your_api_key_here
GRSAI_BASE_URL=https://grsai.dakka.com.cn
```

4. 启动开发服务器：

```bash
npm run dev
```

访问 [http://localhost:3000](http://localhost:3000) 查看应用。

### 构建生产版本

```bash
npm run build
npm run start
```

## 环境变量

| 变量 | 说明 | 必需 |
|------|------|------|
| `GRSAI_API_KEY` | grsai API 密钥 | 是 |
| `GRSAI_BASE_URL` | API 基础地址 | 否 |

## Cloudflare Pages 部署

### 自动部署

1. 将代码推送到 GitHub
2. 在 Cloudflare Pages 中连接 GitHub 仓库
3. 配置构建设置：
   - **构建命令**: `npm run build`
   - **输出目录**: `.next`
   - **Node.js 版本**: 18 或更高
4. 在环境变量中添加 `GRSAI_API_KEY`
5. 部署

### 注意事项

Cloudflare Pages 默认使用静态站点部署模式，对于 Next.js 应用，需要：

1. 使用 Cloudflare Pages 的 **Next.js 集成** 功能（推荐）
2. 或将应用输出为静态站点：

在 `next.config.ts` 中配置：
```typescript
const nextConfig: NextConfig = {
  reactStrictMode: true,
  output: 'export',
};
```

## 项目结构

```
app/
├── api/generate/route.ts    # 后端 API 路由
├── layout.tsx                # 根布局
├── page.tsx                  # 主页面
└── globals.css               # 全局样式
components/
├── TextToImage.tsx           # 文生图组件
├── ImageToImage.tsx          # 图生图组件
├── ProgressBar.tsx           # 进度条组件
├── ResultDisplay.tsx         # 结果展示组件
└── ImageGallery.tsx          # 历史记录画廊
lib/
├── types.ts                  # 类型定义
└── api.ts                    # API 调用封装
hooks/
└── useImageHistory.ts        # 历史记录 Hook
```

## 许可证

MIT
