import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import ClientLayout from "../components/ClientLayout";
import GoogleAnalytics from "../components/GoogleAnalytics";
import LocaleProvider from "../components/LocaleProvider";
import messages from "../messages/zh-CN.json";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: messages.meta.title,
  description: messages.meta.description,
  keywords: messages.meta.keywords,
  authors: [{ name: messages.meta.author }],
  creator: messages.meta.siteName,
  publisher: messages.meta.siteName,
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
    title: messages.meta.title,
    description: messages.meta.shortDescription,
    url: 'https://news.orz.ai',
    siteName: messages.meta.siteName,
    locale: 'zh_CN',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: messages.meta.title,
    description: messages.meta.shortDescription,
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
      <head>
        {/* eslint-disable-next-line @next/next/no-sync-scripts */}
        <script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-6518594342529378"
          crossOrigin="anonymous"
        />
      </head>
      <body className={inter.className}>
        <GoogleAnalytics />
        <LocaleProvider>
          <ClientLayout>
            {children}
          </ClientLayout>
        </LocaleProvider>
      </body>
    </html>
  );
}
