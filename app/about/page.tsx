"use client";

import Link from "next/link";
import { motion } from "framer-motion";

export default function AboutPage() {
  return (
    <>
      <div className="mb-8">
        <Link href="/" className="text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 text-sm flex items-center gap-1">
          
        </Link>
      </div>
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="max-w-3xl mx-auto"
      >
        <h1 className="text-3xl font-bold mb-6">关于热点速览</h1>
        
        <div className="prose dark:prose-invert max-w-none">
          <p className="lead text-lg text-gray-600 dark:text-gray-300 mb-8">
            热点速览是一个汇聚全网热门内容的聚合平台，让用户快速了解各大平台的热点话题和内容。
          </p>
          
          <h2>我们的使命</h2>
          <p>
            在信息爆炸的时代，人们往往被大量碎片化的内容所淹没。我们希望通过热点速览，帮助用户高效地获取各大平台的热门内容，节省时间的同时不错过重要信息。
          </p>
          
          <h2>支持的平台</h2>
          <p>
            我们目前支持 17 个主流平台的热点内容获取，包括社交媒体、新闻资讯、技术社区、视频平台等多种类型。每个平台的内容都会每 30 分钟更新一次，确保信息的时效性。
          </p>
          
          
          <h2>API 服务</h2>
          <p>
            我们提供 RESTful API 服务，允许开发者获取各平台的热点数据。API 使用简单，支持跨域请求，详细的使用方法请参考首页的说明。
          </p>
          
          <h2>隐私声明</h2>
          <p>
            我们重视用户隐私，不会收集任何个人身份信息。我们仅使用 Cookie 记住用户的主题偏好（如暗色模式）以提供更好的用户体验。
          </p>
          
          <h2>联系我们</h2>
          <p>
            如果您有任何问题或建议，请随时与我们联系。您可以通过以下方式联系我们：
          </p>
          <ul>
            <li>电子邮件：deepincode@qq.com</li>
            <li>GitHub 仓库：<a href="https://github.com/orz-ai/hot_news" target="_blank" rel="noopener noreferrer" className="text-primary-600 dark:text-primary-400 hover:underline">热点速览</a></li>
          </ul>
          
          <h2>免责声明</h2>
          <p>
            热点速览仅提供第三方平台的热点内容聚合，不对内容的准确性、合法性负责。所有内容的版权归原作者或平台所有。若有侵权内容，请联系我们删除。
          </p>
        </div>
      </motion.div>
    </>
  );
} 