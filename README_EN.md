Backend project: [Hot News](https://github.com/orz-ai/hot_news)

Live Demo: [Hot News](https://news.orz.ai/)

[中文文档](README.md) | English

# Hot News - Trending Content Aggregation Platform

Hot News is a modern trending content aggregation platform built with Next.js, TypeScript, Tailwind CSS, and Framer Motion. It aggregates popular content from 17 mainstream platforms, including social media, news, tech communities, video platforms, and more, allowing users to quickly stay updated with trending topics across the web.

![Hot News](https://orz.ai/wp-content/uploads/2025/09/1759164896-Snipaste_2025-09-30_00-54-07.png)

## Key Features

- **Multi-platform Support**: Supports 17 mainstream platforms including Baidu, Weibo, Zhihu, Bilibili, and more
- **Real-time Updates**: Automatically updates trending data from all platforms every 30 minutes
- **Responsive Design**: Perfect adaptation for both desktop and mobile devices
- **Rich Animations**: Smooth page transitions and animation effects powered by Framer Motion
- **Dark Mode**: Support for light/dark theme switching to protect eye health
- **Performance Optimized**: Built with Next.js best practices ensuring fast loading and optimal performance

## Supported Platforms

| Platform Code | Platform Name      | Content Type                                |
| ------------- | ------------------ | ------------------------------------------- |
| baidu         | Baidu Hot Search   | Social trends, entertainment, events        |
| weibo         | Weibo Hot Search   | Social media trends, entertainment, events  |
| zhihu         | Zhihu Hot List     | Q&A, in-depth content, social trends        |
| bilibili      | Bilibili           | Videos, anime, gaming, lifestyle            |
| douyin        | Douyin             | Short video trends, entertainment           |
| github        | GitHub Trending    | Open source projects, programming languages |
| ...           | And more platforms | ...                                         |

## Tech Stack

- [Next.js](https://nextjs.org/) - React framework with server-side rendering and static generation
- [TypeScript](https://www.typescriptlang.org/) - Type-safe JavaScript superset
- [Tailwind CSS](https://tailwindcss.com/) - Utility-first CSS framework
- [Framer Motion](https://www.framer.com/motion/) - Powerful animation library
- [Axios](https://axios-http.com/) - Promise-based HTTP client
- [Headless UI](https://headlessui.dev/) - Unstyled UI component library

## Quick Start

1. Clone the repository

```bash
git clone https://github.com/orz-ai/hot_news_front.git
cd hot_news_front
```

2. Install dependencies

```bash
npm install
# or
yarn install
```

3. Configure environment variables

```bash
# Copy environment variables example file
cp .env.example .env.local

# Edit .env.local file as needed
```

4. Start the development server

```bash
npm run dev
# or
yarn dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

## Environment Variables

The project uses the following environment variables:

| Variable Name            | Description          | Default Value                    |
| ------------------------ | -------------------- | -------------------------------- |
| NEXT_PUBLIC_API_BASE_URL | API service base URL | https://orz.ai/api/v1/dailynews/ |

## API Usage

Hot News also provides API services that allow developers to fetch trending data from various platforms.

```shell
GET https://orz.ai/api/v1/dailynews/?platform=baidu
```

For detailed API documentation, please refer to [here](#).

## Contributing

Pull Requests and Issues are welcome.

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.