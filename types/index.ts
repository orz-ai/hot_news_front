export interface TrendingItem {
  title: string;
  url: string;
  score?: string;
  desc?: string;
  pubDate?: string;
}

export interface ApiResponse {
  status: string;
  data: TrendingItem[];
  msg: string;
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
  | 'hackernews';

export interface PlatformInfo {
  code: PlatformType;
  name: string;
  description: string;
  contentType: string[];
  updateFrequency: string;
  color?: string;
  icon?: string;
} 