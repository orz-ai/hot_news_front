后端项目戳这里：[热点速览](https://github.com/orz-ai/hot_news)

线上地址：[热点速览](https://news.orz.ai/)

中文文档 | [English](README_EN.md)

# 热点速览 - 全网热点聚合平台

热点速览是一个使用 Next.js, TypeScript, Tailwind CSS 和 Framer Motion 构建的现代化热点内容聚合平台。它汇聚了来自 17 个主流平台的热门内容，包括社交媒体、新闻资讯、技术社区、视频平台等多种类型，让用户能够快速了解全网热点。
![热点速览](https://orz.ai/wp-content/uploads/2025/09/1759164896-Snipaste_2025-09-30_00-54-07.png)

## 主要特性

- **多平台支持**：支持 17 个主流平台，包括百度、微博、知乎、B站等
- **实时更新**：每 30 分钟自动更新所有平台的热点数据
- **响应式设计**：完美适配桌面端和移动端
- **丰富动效**：使用 Framer Motion 提供流畅的页面过渡和动画效果
- **暗色模式**：支持明暗主题切换，保护眼睛健康
- **性能优化**：使用 Next.js 的最佳实践，确保页面加载速度和性能

## 支持的平台

| 平台代码 | 平台名称        | 内容类型                 |
| -------- | --------------- | ------------------------ |
| baidu    | 百度热搜        | 社会热点、娱乐、事件     |
| weibo    | 微博热搜        | 社交媒体热点、娱乐、事件 |
| zhihu    | 知乎热榜        | 问答、深度内容、社会热点 |
| bilibili | 哔哩哔哩        | 视频、动漫、游戏、生活   |
| douyin   | 抖音            | 短视频热点、娱乐         |
| github   | GitHub Trending | 开源项目、编程语言       |
| ...      | 以及更多平台    | ...                      |

## 技术栈

- [Next.js](https://nextjs.org/) - React 框架，提供服务端渲染和静态生成
- [TypeScript](https://www.typescriptlang.org/) - 类型安全的 JavaScript 超集
- [Tailwind CSS](https://tailwindcss.com/) - 实用性优先的 CSS 框架
- [Framer Motion](https://www.framer.com/motion/) - 强大的动画库
- [Axios](https://axios-http.com/) - 基于 Promise 的 HTTP 客户端
- [Headless UI](https://headlessui.dev/) - 无样式的 UI 组件库

## 快速开始

1. 克隆仓库

```bash
git clone https://github.com/orz-ai/hot_news_front.git
cd hot_news_front
```

2. 安装依赖

```bash
npm install
# 或
yarn install
```

3. 配置环境变量

```bash
# 复制环境变量示例文件
cp .env.example .env.local

# 根据需要编辑 .env.local 文件
```

4. 启动开发服务器

```bash
npm run dev
# 或
yarn dev
```

5. 在浏览器中打开 [http://localhost:3000](http://localhost:3000)

## 环境变量

项目使用以下环境变量：

| 变量名                   | 描述               | 默认值                           |
| ------------------------ | ------------------ | -------------------------------- |
| NEXT_PUBLIC_API_BASE_URL | API 服务的基础 URL | https://orz.ai/api/v1/dailynews/ |

## API 使用

热点速览还提供了 API 服务，允许开发者获取各平台的热点数据。

```shell
GET https://orz.ai/api/v1/dailynews/?platform=baidu
```

详细的 API 文档请参考[此处](#)。

## 贡献指南

欢迎提交 Pull Request 和 Issue。

## 许可证

本项目采用 MIT 许可证。详见 [LICENSE](LICENSE) 文件。
