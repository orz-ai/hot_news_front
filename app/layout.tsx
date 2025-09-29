import type { Metadata } from "next";
import { Inter, Roboto_Mono } from "next/font/google";
import "./globals.css";
import Header from "../components/Header";
import Footer from "../components/Footer";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
});

const robotoMono = Roboto_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "热点速览 - 全网热门内容聚合平台",
  description: "汇聚各大平台热门内容，让您一站式了解全网热点。包括百度、微博、知乎、B站等17个平台的热榜内容。",
  keywords: "热点,热搜,热榜,百度热搜,微博热搜,知乎热榜,B站热门,新闻聚合",
  icons: {
    icon: '/favicon.ico',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
      </head>
      <body
        className={`${inter.variable} ${robotoMono.variable} antialiased min-h-screen flex flex-col bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-gray-100`}
      >
        <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-primary-500 focus:text-white focus:rounded-md">
          跳转到主要内容
        </a>
        <Header />
        <main id="main-content" className="flex-grow container mx-auto px-4 py-6">
        {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
