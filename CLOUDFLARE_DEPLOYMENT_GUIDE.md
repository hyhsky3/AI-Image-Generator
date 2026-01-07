# Next.js 项目部署到 Cloudflare Pages 完整技术文档

> 本文档基于实际部署经验编写，涵盖从项目配置到上线的全流程，以及常见问题的解决方案。

---

## 目录

1. [前置条件](#1-前置条件)
2. [项目配置](#2-项目配置)
3. [GitHub 推送](#3-github-推送)
4. [Cloudflare Pages 设置](#4-cloudflare-pages-设置)
5. [环境变量配置](#5-环境变量配置)
6. [常见问题与解决方案](#6-常见问题与解决方案)
7. [调试技巧](#7-调试技巧)
8. [快速检查清单](#8-快速检查清单)

---

## 1. 前置条件

### 本地环境
- Node.js 18+ (推荐 20)
- npm 或 pnpm
- Git

### 账号准备
- GitHub 账号
- Cloudflare 账号

---

## 2. 项目配置

### 2.1 安装 Cloudflare 适配器

```bash
npm install -D @cloudflare/next-on-pages
```

### 2.2 更新 `package.json`

在 `scripts` 中添加：

```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "pages:build": "npx @cloudflare/next-on-pages",
    "preview": "npm run pages:build && wrangler pages dev .vercel/output/static",
    "deploy": "npm run pages:build && wrangler pages deploy .vercel/output/static",
    "start": "next start",
    "lint": "next lint"
  }
}
```

### 2.3 配置 `next.config.ts`

```typescript
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // 如果使用了外部包，在这里配置
  // serverExternalPackages: [],
};

export default nextConfig;
```

### 2.4 API 路由使用 Edge Runtime

对于需要在 Cloudflare 上运行的 API 路由，必须声明使用 Edge Runtime：

```typescript
// app/api/xxx/route.ts
import { NextRequest, NextResponse } from "next/server";

// 关键：声明 Edge Runtime
export const runtime = 'edge';

export async function POST(request: NextRequest) {
  // 你的逻辑
}
```

### 2.5 创建 `wrangler.toml`（可选但推荐）

```toml
# Cloudflare Pages 配置
compatibility_flags = ["nodejs_compat"]
compatibility_date = "2024-01-01"
```

### 2.6 更新 `.gitignore`

确保包含以下内容：

```gitignore
# Dependencies
node_modules

# Next.js
.next/
out/

# Local env files
.env
.env*.local

# Cloudflare
.wrangler

# Build output
.vercel
```

---

## 3. GitHub 推送

### 3.1 初始化 Git（如果还没有）

```bash
git init
git add .
git commit -m "Initial commit"
```

### 3.2 关联远程仓库

```bash
# 方式一：使用 HTTPS（需要 Personal Access Token）
git remote add origin https://用户名:令牌@github.com/用户名/仓库名.git

# 方式二：使用 SSH（需要配置 SSH Key）
git remote add origin git@github.com:用户名/仓库名.git
```

### 3.3 推送代码

```bash
git push -u origin main
```

---

## 4. Cloudflare Pages 设置

### 4.1 创建项目

1. 登录 [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. 进入 **Workers & Pages** > **Create application** > **Pages**
3. 选择 **Connect to Git**
4. 授权并选择你的 GitHub 仓库

### 4.2 构建设置（关键）

| 设置项 | 值 |
|--------|-----|
| **Framework preset** | Next.js |
| **Build command** | `npx @cloudflare/next-on-pages@1` |
| **Build output directory** | `.vercel/output/static` |

### 4.3 兼容性标志（非常重要！）

1. 进入项目 **Settings** > **Functions**
2. 找到 **Compatibility Flags** 部分
3. 添加：`nodejs_compat`
4. 设置 **Compatibility Date**：`2024-01-01` 或更新的日期
5. **保存**

> ⚠️ **不设置 `nodejs_compat` 会导致部署失败！**

---

## 5. 环境变量配置

### 5.1 在 Cloudflare 中设置

1. 进入项目 **Settings** > **Environment variables**
2. 添加所需变量

### 5.2 常用变量示例

| 变量名 | 说明 | 示例值 |
|--------|------|--------|
| `NODE_VERSION` | Node.js 版本 | `20` |
| `GRSAI_API_KEY` | API 密钥 | `sk-xxxxxx` |
| `GRSAI_BASE_URL` | API 地址 | `https://grsai.dakka.com.cn` |

### 5.3 注意事项

- 环境变量修改后需要**重新部署**才能生效
- 敏感信息（如 API Key）应该**加密**存储
- 变量值**不要加引号**，也**不要有多余空格**

---

## 6. 常见问题与解决方案

### 6.1 `no nodejs_compat compatibility flag set`

**原因**：未设置 Node.js 兼容性标志

**解决**：
1. 进入 **Settings** > **Functions**
2. 添加 Compatibility Flag：`nodejs_compat`
3. 重新部署

---

### 6.2 `apikey error` 或类似 API 认证错误

**原因**：API Key 无效或格式错误

**排查步骤**：
1. 在本地用 PowerShell 测试 Key：
```powershell
Invoke-RestMethod -Uri "API地址" -Method POST -Headers @{
    "Authorization"="Bearer 你的Key";
    "Content-Type"="application/json"
} -Body '{"prompt":"test"}'
```

2. 如果本地也报错，说明 Key 本身有问题：
   - 检查 Key 是否过期
   - 检查账户余额
   - 重新生成 Key

3. 确认 Cloudflare 环境变量中的 Key：
   - 没有多余空格
   - 没有加引号
   - 完整复制（没有漏字符）

---

### 6.3 本地 `pages:build` 报错（Windows）

**原因**：`@cloudflare/next-on-pages` 在 Windows 本地运行可能有兼容性问题

**解决**：
- 忽略本地错误，直接推送到 Cloudflare（云端是 Linux 环境）
- 或者使用 WSL2 在本地测试

---

### 6.4 部署成功但页面 404

**原因**：可能是静态资源路径问题

**解决**：
- 检查 `next.config.ts` 中的 `basePath` 配置
- 确认 `Build output directory` 设置正确

---

### 6.5 API 路由返回 500 错误

**原因**：可能使用了 Edge Runtime 不支持的 Node.js API

**解决**：
- 避免使用 `fs`、`path` 等 Node.js 原生模块
- 使用 Web 标准 API（如 `fetch`、`Request`、`Response`）
- 确保所有 API 路由都声明了 `export const runtime = 'edge';`

---

## 7. 调试技巧

### 7.1 增强错误信息

在 API 路由中添加详细的错误处理：

```typescript
if (!response.ok) {
  const errorText = await response.text();
  const keyDebug = API_KEY 
    ? `Length: ${API_KEY.length}, Starts: ${API_KEY.substring(0, 6)}***` 
    : "Unset";
  
  return NextResponse.json({
    message: `API失败 (${response.status}) [Key: ${keyDebug}]: ${errorText.slice(0, 100)}`
  }, { status: response.status });
}
```

### 7.2 检查 Cloudflare 日志

1. 进入项目 **Deployments**
2. 点击具体的部署
3. 查看 **Build logs** 和 **Functions logs**

### 7.3 本地测试 API

使用 PowerShell 直接测试第三方 API：

```powershell
Invoke-RestMethod -Uri "API地址" -Method POST -Headers @{
    "Authorization"="Bearer 你的Key";
    "Content-Type"="application/json"
} -Body '{"key":"value"}'
```

---

## 8. 快速检查清单

部署前请确认以下事项：

- [ ] 安装了 `@cloudflare/next-on-pages`
- [ ] `package.json` 中有 `pages:build` 脚本
- [ ] API 路由声明了 `export const runtime = 'edge'`
- [ ] 代码已推送到 GitHub
- [ ] Cloudflare 构建命令：`npx @cloudflare/next-on-pages@1`
- [ ] Cloudflare 输出目录：`.vercel/output/static`
- [ ] 已添加兼容性标志：`nodejs_compat`
- [ ] 环境变量已正确设置（无空格、无引号）
- [ ] API Key 在本地测试通过

---

## 附录：相关链接

- [Cloudflare Pages 文档](https://developers.cloudflare.com/pages/)
- [@cloudflare/next-on-pages GitHub](https://github.com/cloudflare/next-on-pages)
- [Next.js Edge Runtime 文档](https://nextjs.org/docs/app/api-reference/edge)

---

*文档版本：1.0*  
*最后更新：2026-01-07*
