import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ArtFlow AI - 智能AI生图工具",
  description: "ArtFlow AI - 基于nano-banana-pro模型的AI生图应用，支持文生图和图生图，智能创作，无限想象",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body className="antialiased">{children}</body>
    </html>
  );
}
