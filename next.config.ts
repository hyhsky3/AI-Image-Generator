import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // Cloudflare Pages 配置
  experimental: {
    serverComponentsExternalPackages: [],
  },
};

export default nextConfig;
