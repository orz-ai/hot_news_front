export type ApiParameter = {
  name: string;
  label: string;
  description: string;
  required?: boolean;
  placeholder?: string;
  defaultValue?: string;
  type?: "text" | "date" | "number" | "url" | "select";
  options?: Array<{ value: string; label: string }>;
};

export const PUBLIC_API_ORIGIN = "https://news.orz.ai";

export type PublicEndpoint = {
  id: string;
  group: "热榜数据" | "热点分析" | "AI 总结" | "实用工具" | "系统";
  name: string;
  description: string;
  path: string;
  parameters: ApiParameter[];
};

const date: ApiParameter = {
  name: "date",
  label: "日期",
  description: "格式 YYYY-MM-DD；留空表示今天。",
  type: "date",
};

const refresh: ApiParameter = {
  name: "refresh",
  label: "强制刷新",
  description: "重新计算缓存数据，普通调用建议留空。",
  type: "select",
  options: [
    { value: "", label: "默认（false）" },
    { value: "true", label: "true" },
    { value: "false", label: "false" },
  ],
};

const platforms: ApiParameter = {
  name: "platforms",
  label: "平台代码",
  description: "多个平台使用英文逗号分隔。",
  placeholder: "baidu,weibo,zhihu",
};

export const PUBLIC_ENDPOINTS: PublicEndpoint[] = [
  {
    id: "platform-news",
    group: "热榜数据",
    name: "单平台热榜",
    description: "获取指定平台在某一天的完整热榜。",
    path: "/api/v1/dailynews/",
    parameters: [
      { name: "platform", label: "平台代码", description: "例如 baidu、weibo、zhihu、github。", required: true, defaultValue: "baidu", placeholder: "baidu" },
      date,
    ],
  },
  {
    id: "all-news",
    group: "热榜数据",
    name: "全部平台热榜",
    description: "一次返回所有已支持平台的热榜数据。",
    path: "/api/v1/dailynews/all",
    parameters: [date],
  },
  {
    id: "multi-news",
    group: "热榜数据",
    name: "多平台热榜",
    description: "一次获取多个指定平台的热榜数据。",
    path: "/api/v1/dailynews/multi",
    parameters: [{ ...platforms, required: true, defaultValue: "baidu,weibo,zhihu" }, date],
  },
  {
    id: "search-news",
    group: "热榜数据",
    name: "搜索热点",
    description: "按关键词搜索一个或多个平台的热点标题。",
    path: "/api/v1/dailynews/search",
    parameters: [
      { name: "keyword", label: "关键词", description: "要搜索的热点关键词。", required: true, defaultValue: "AI", placeholder: "AI" },
      platforms,
      date,
      { name: "limit", label: "返回数量", description: "最大返回条数。", type: "number", defaultValue: "20", placeholder: "20" },
    ],
  },
  {
    id: "trend-analysis",
    group: "热点分析",
    name: "主题趋势分析",
    description: "返回热门关键词、主题分布和相关主题词组。",
    path: "/api/v1/analysis/trend",
    parameters: [
      date,
      {
        name: "type",
        label: "分析类型",
        description: "选择要返回的分析维度。",
        type: "select",
        defaultValue: "main",
        options: [
          { value: "main", label: "main · 主题分析" },
          { value: "platform", label: "platform · 平台对比" },
          { value: "cross", label: "cross · 跨平台热点" },
          { value: "advanced", label: "advanced · 高级分析" },
        ],
      },
    ],
  },
  { id: "platform-comparison", group: "热点分析", name: "平台对比", description: "比较各平台的热度、数据量和更新频率。", path: "/api/v1/analysis/platform-comparison", parameters: [date] },
  { id: "cross-platform", group: "热点分析", name: "跨平台热点", description: "发现同时出现在多个平台的热点话题。", path: "/api/v1/analysis/cross-platform", parameters: [date, refresh] },
  { id: "advanced-analysis", group: "热点分析", name: "高级分析", description: "获取关键词、情感和热点演变等高级分析。", path: "/api/v1/analysis/advanced", parameters: [date, refresh] },
  { id: "prediction", group: "热点分析", name: "趋势预测", description: "基于历史数据获取热点发展趋势预测。", path: "/api/v1/analysis/prediction", parameters: [date] },
  {
    id: "keyword-cloud",
    group: "热点分析",
    name: "关键词云",
    description: "返回按权重和分类整理的热点关键词。",
    path: "/api/v1/analysis/keyword-cloud",
    parameters: [
      date,
      platforms,
      { name: "category", label: "分类", description: "例如科技、娱乐、财经。", placeholder: "科技" },
      { name: "keyword_count", label: "关键词数量", description: "默认返回 200 个。", type: "number", defaultValue: "200", placeholder: "200" },
      refresh,
    ],
  },
  {
    id: "data-visualization",
    group: "热点分析",
    name: "可视化数据",
    description: "获取主题热度分布等前端可视化数据。",
    path: "/api/v1/analysis/data-visualization",
    parameters: [date, platforms, refresh],
  },
  {
    id: "trend-forecast",
    group: "热点分析",
    name: "趋势演变预测",
    description: "获取指定时间范围内的热点趋势和预测数据。",
    path: "/api/v1/analysis/trend-forecast",
    parameters: [
      date,
      {
        name: "time_range",
        label: "预测范围",
        description: "预测覆盖的时间范围。",
        type: "select",
        defaultValue: "24h",
        options: [
          { value: "24h", label: "24 小时" },
          { value: "7d", label: "7 天" },
          { value: "30d", label: "30 天" },
        ],
      },
      refresh,
    ],
  },
  { id: "hot-summary", group: "AI 总结", name: "每日热点总结", description: "获取指定日期由 AI 生成的全网热点总结。", path: "/api/v1/llm/hot-summary", parameters: [date, refresh] },
  { id: "latest-summary", group: "AI 总结", name: "最新热点总结", description: "获取目前最新一版热点总结。", path: "/api/v1/llm/hot-summary/latest", parameters: [] },
  {
    id: "website-meta",
    group: "实用工具",
    name: "网站元数据",
    description: "读取公开网页的标题、描述、Open Graph 和图标信息。",
    path: "/api/v1/tools/website-meta/",
    parameters: [
      { name: "url", label: "网站 URL", description: "必须是完整的 HTTP 或 HTTPS 地址。", required: true, type: "url", defaultValue: "https://v2ex.com/", placeholder: "https://example.com/" },
    ],
  },
  { id: "health", group: "系统", name: "健康检查", description: "检查 API 服务是否正常运行。", path: "/health", parameters: [] },
];
