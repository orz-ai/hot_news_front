import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import ClientLayout from "../components/ClientLayout";
import GoogleAnalytics from "../components/GoogleAnalytics";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "热点速览 - 全网热门内容聚合平台",
  description: "汇聚全网热门内容，一站式浏览各大平台热点话题。支持百度、微博、知乎、B站、抖音、GitHub等多个平台的热点内容聚合。",
  keywords: "热点,新闻,聚合,百度热搜,微博热搜,知乎热榜,B站热门,抖音热点,GitHub趋势",
  authors: [{ name: "热点速览团队" }],
  creator: "热点速览",
  publisher: "热点速览",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('https://news.orz.ai'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: "热点速览 - 全网热门内容聚合平台",
    description: "汇聚全网热门内容，一站式浏览各大平台热点话题",
    url: 'https://news.orz.ai',
    siteName: '热点速览',
    locale: 'zh_CN',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: "热点速览 - 全网热门内容聚合平台",
    description: "汇聚全网热门内容，一站式浏览各大平台热点话题",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-CN">
      <body className={inter.className}>
        <GoogleAnalytics />
        <ClientLayout>
          {children}
        </ClientLayout>
      </body>
    </html>
  );
}
