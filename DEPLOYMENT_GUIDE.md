# Cloudflare Pages 部署指南

本项目已经配置好支持 Cloudflare Pages 部署（包含 Edge Runtime API）。

## 1. 推送到 GitHub

首先，确保你的代码已经提交并推送到 GitHub 仓库。

```bash
git add .
git commit -m "Ready for deployment"
# 关联你的远程仓库 (如果你还没有关联)
# git remote add origin https://github.com/你的用户名/你的仓库名.git
git push
```

## 2. Cloudflare Pages 设置

1. 登录 [Cloudflare Dashboard](https://dash.cloudflare.com/)。
2. 进入 **Workers & Pages** > **Create application** > **Pages** > **Connect to Git**。
3. 选择你的 GitHub 仓库。
4. 配置构建设置：
   - **Production branch**: `main` (或你的主分支名称)
   - **Framework preset**: 选择 **Next.js**
   - **Build command**: `npx @cloudflare/next-on-pages` (注意：这里我们使用适配器命令，而不是默认的 next build)
     - *注意：如果在预设中无法修改命令，可以在设置完成后去 Settings -> Builds & deployments 中修改。*
   - **Build output directory**: `.vercel/output/static` (这是 @cloudflare/next-on-pages 的默认输出目录)

## 3. 环境变量配置

在部署前（或部署失败后），你需要设置必要的环境变量。在项目设置的 **Settings** > **Environment variables** 中添加：

- `GRSAI_API_KEY`: 你的 API Key
- `GRSAI_BASE_URL`: `https://grsai.dakka.com.cn` (可选，默认为此值)
- `NODE_VERSION`: `20` (建议指定 Node 版本，例如 18 或 20)

## 4. 重新部署

配置好环境变量后，点击 **Create Project** 或去部署列表点击 **Retry deployment**。

## 本地预览 Cloudflare 构建

如果你想在本地模拟 Cloudflare 环境运行：

```bash
npm run preview
```

这将先构建项目，然后使用 Wrangler 本地运行。
