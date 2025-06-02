export interface TrendingItem {
  title: string;
  url: string;
  score?: string;
  desc?: string;
  pubDate?: string;
  publish_time?: string;
  source?: string;
}

export interface ApiResponse {
  status: string;
  data: TrendingItem[];
  msg: string;
}

export interface HotKeyword {
  text: string;
  weight: number;
}

export interface TopicDistribution {
  category: string;
  percentage: number;
}

export interface RelatedTopicGroup {
  words: string[];
  co_occurrence: number;
}

export interface AnalysisResponse {
  status: string;
  date: string;
  analysis_type: string;
  hot_keywords: HotKeyword[];
  topic_distribution: TopicDistribution[];
  related_topic_groups: RelatedTopicGroup[];
  updated_at: string;
  msg?: string;
}

export interface PlatformStats {
  total_items: number;
  avg_title_length: number;
  has_description: number;
  has_url: number;
}

export interface PlatformRanking {
  platform: string;
  heat: number;
  trend: number;
  rank: number;
  total_items: number;
  total_score: number;
  avg_score: number;
  peak_hour?: number;
  avg_title_length: number;
}

export interface TimeDistribution {
  label: string;
  percentage: number;
}

export interface PlatformComparisonResponse {
  status: string;
  date: string;
  analysis_type: string;
  platform_stats: Record<string, PlatformStats>;
  platform_rankings: PlatformRanking[];
  platform_update_frequency: {
    by_platform: Record<string, {
      morning: TimeDistribution;
      afternoon: TimeDistribution;
      evening: TimeDistribution;
      night: TimeDistribution;
    }>;
    overall: {
      morning: TimeDistribution;
      afternoon: TimeDistribution;
      evening: TimeDistribution;
      night: TimeDistribution;
    };
  };
  updated_at: string;
  msg?: string;
}

export type PlatformType = 
  | 'baidu'
  | 'shaoshupai' 
  | 'weibo' 
  | 'zhihu' 
  | '36kr' 
  | '52pojie' 
  | 'bilibili' 
  | 'douban' 
  | 'hupu' 
  | 'tieba' 
  | 'juejin' 
  | 'douyin' 
  | 'v2ex' 
  | 'jinritoutiao' 
  | 'stackoverflow' 
  | 'github' 
  | 'hackernews'
  | 'tenxunwang';

export interface PlatformInfo {
  code: PlatformType;
  name: string;
  description: string;
  contentType: string[];
  updateFrequency: string;
  color?: string;
  icon?: string;
}

export interface RelatedItem {
  platform: string;
  title: string;
  url: string;
  score: number;
  similarity?: number;
}

export interface CommonTopic {
  title: string;
  platforms_count: number;
  platforms: string[];
  heat: number;
  related_items: RelatedItem[];
}

export interface CrossPlatformResponse {
  status: string;
  date: string;
  analysis_type: string;
  common_topics: CommonTopic[];
  updated_at: string;
  msg?: string;
}

export interface TopicHeatData {
  keyword: string;
  values: number[];
}

export interface TopicHeatDistribution {
  keywords: string[];
  platforms: string[];
  data: TopicHeatData[];
}

export interface DataVisualizationResponse {
  status: string;
  date: string;
  analysis_type: string;
  topic_heat_distribution: TopicHeatDistribution;
  updated_at: string;
  msg?: string;
}

// Trend Forecast Types
interface ForecastDataPoint {
  date: string;
  heat: number;
}

interface TrendEvolutionItem {
  topic: string;
  category: string;
  keywords: string[];
  current_heat: number;
  history: ForecastDataPoint[];
  forecast: ForecastDataPoint[];
  trend_type: string;
  probability: number;
  probability_text: string;
  confidence: string;
  platforms: string[];
  out_platforms: string[];
}

export interface TrendForecastResponse {
  status: string;
  date: string;
  analysis_type: string;
  time_range: string;
  description: string;
  has_enough_data: boolean;
  trend_evolution: TrendEvolutionItem[];
  updated_at: string;
  msg?: string;
} 