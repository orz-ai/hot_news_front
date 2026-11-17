import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import ClientLayout from "../components/ClientLayout";
import GoogleAnalytics from "../components/GoogleAnalytics";
import LocaleProvider from "../components/LocaleProvider";
import messages from "../messages/zh-CN.json";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: {
    default: "热点速览 Orz News｜全网热点趋势聚合平台",
    template: "%s｜热点速览 Orz News",
  },
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
  openGraph: {
    title: messages.meta.title,
    description: messages.meta.shortDescription,
    url: 'https://news.orz.ai',
    siteName: "热点速览 Orz News",
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
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@graph": [
                {
                  "@type": "WebSite",
                  "@id": "https://news.orz.ai/#website",
                  name: "热点速览",
                  alternateName: ["Orz News", "news.orz.ai"],
                  url: "https://news.orz.ai/",
                  inLanguage: "zh-CN",
                  publisher: { "@id": "https://news.orz.ai/#organization" },
                },
                {
                  "@type": "Organization",
                  "@id": "https://news.orz.ai/#organization",
                  name: "热点速览 Orz News",
                  url: "https://news.orz.ai/",
                  logo: {
                    "@type": "ImageObject",
                    url: "https://news.orz.ai/android-chrome-512x512.png",
                  },
                  sameAs: [
                    "https://github.com/orz-ai/hot_news",
                    "https://github.com/orz-ai/hot_news_front",
                  ],
                },
              ],
            }).replace(/</g, "\\u003c"),
          }}
        />
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
