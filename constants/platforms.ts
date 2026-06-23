import { PlatformType } from '../types';

export type PlatformCategoryKey =
  | 'socialHotspot'
  | 'entertainment'
  | 'event'
  | 'technology'
  | 'digital'
  | 'lifestyle'
  | 'socialMediaHotspot'
  | 'qa'
  | 'deepContent'
  | 'techStartup'
  | 'businessNews'
  | 'tech'
  | 'software'
  | 'security'
  | 'video'
  | 'animation'
  | 'gaming'
  | 'life'
  | 'booksMoviesMusic'
  | 'culture'
  | 'discussion'
  | 'sports'
  | 'interestCommunity'
  | 'topicDiscussion'
  | 'programming'
  | 'techArticle'
  | 'shortVideoHotspot'
  | 'creativity'
  | 'news'
  | 'hotEvent'
  | 'programmingQa'
  | 'techDiscussion'
  | 'openSourceProject'
  | 'programmingLanguage'
  | 'techNews'
  | 'startup'
  | 'financeNews'
  | 'stockNews'
  | 'investment'
  | 'financeInfo'
  | 'stockAnalysis'
  | 'stockInvestment'
  | 'financeCommunity'
  | 'investmentStrategy'
  | 'financeFlash'
  | 'marketUpdates'
  | 'realTimeInfo';

export type PlatformUpdateFrequencyKey = 'every30Minutes';

export interface PlatformDefinition {
  code: PlatformType;
  contentTypeKeys: PlatformCategoryKey[];
  updateFrequencyKey: PlatformUpdateFrequencyKey;
  color: string;
  icon?: string;
}

export const PLATFORMS: PlatformDefinition[] = [
  {
    code: 'baidu',
    contentTypeKeys: ['socialHotspot', 'entertainment', 'event'],
    updateFrequencyKey: 'every30Minutes',
    color: '#3388ff'
  },
  {
    code: 'shaoshupai',
    contentTypeKeys: ['technology', 'digital', 'lifestyle'],
    updateFrequencyKey: 'every30Minutes',
    color: '#414141'
  },
  {
    code: 'weibo',
    contentTypeKeys: ['socialMediaHotspot', 'entertainment', 'event'],
    updateFrequencyKey: 'every30Minutes',
    color: '#ff8200'
  },
  {
    code: 'zhihu',
    contentTypeKeys: ['qa', 'deepContent', 'socialHotspot'],
    updateFrequencyKey: 'every30Minutes',
    color: '#0066ff'
  },
  {
    code: '36kr',
    contentTypeKeys: ['techStartup', 'businessNews'],
    updateFrequencyKey: 'every30Minutes',
    color: '#4a7eff'
  },
  {
    code: '52pojie',
    contentTypeKeys: ['tech', 'software', 'security'],
    updateFrequencyKey: 'every30Minutes',
    color: '#3c73a8'
  },
  {
    code: 'bilibili',
    contentTypeKeys: ['video', 'animation', 'gaming', 'life'],
    updateFrequencyKey: 'every30Minutes',
    color: '#fb7299'
  },
  {
    code: 'douban',
    contentTypeKeys: ['booksMoviesMusic', 'culture', 'discussion'],
    updateFrequencyKey: 'every30Minutes',
    color: '#00b51d'
  },
  {
    code: 'hupu',
    contentTypeKeys: ['sports', 'gaming', 'digital'],
    updateFrequencyKey: 'every30Minutes',
    color: '#c01d2f'
  },
  {
    code: 'tieba',
    contentTypeKeys: ['interestCommunity', 'topicDiscussion'],
    updateFrequencyKey: 'every30Minutes',
    color: '#4879bd'
  },
  {
    code: 'juejin',
    contentTypeKeys: ['programming', 'techArticle'],
    updateFrequencyKey: 'every30Minutes',
    color: '#1e80ff'
  },
  {
    code: 'douyin',
    contentTypeKeys: ['shortVideoHotspot', 'entertainment'],
    updateFrequencyKey: 'every30Minutes',
    color: '#fe2c55'
  },
  {
    code: 'v2ex',
    contentTypeKeys: ['tech', 'programming', 'creativity'],
    updateFrequencyKey: 'every30Minutes',
    color: '#171a1d'
  },
  {
    code: 'jinritoutiao',
    contentTypeKeys: ['news', 'hotEvent'],
    updateFrequencyKey: 'every30Minutes',
    color: '#d43d3d'
  },
  {
    code: 'stackoverflow',
    contentTypeKeys: ['programmingQa', 'techDiscussion'],
    updateFrequencyKey: 'every30Minutes',
    color: '#f48024'
  },
  {
    code: 'github',
    contentTypeKeys: ['openSourceProject', 'programmingLanguage'],
    updateFrequencyKey: 'every30Minutes',
    color: '#24292e'
  },
  {
    code: 'hackernews',
    contentTypeKeys: ['techNews', 'startup', 'programming'],
    updateFrequencyKey: 'every30Minutes',
    color: '#ff6600'
  },
  {
    code: 'tenxunwang',
    contentTypeKeys: ['news', 'socialHotspot', 'entertainment', 'technology'],
    updateFrequencyKey: 'every30Minutes',
    color: '#00a4ff'
  },
  {
    code: 'sina_finance',
    contentTypeKeys: ['financeNews', 'stockNews', 'investment'],
    updateFrequencyKey: 'every30Minutes',
    color: '#e60012'
  },
  {
    code: 'eastmoney',
    contentTypeKeys: ['financeInfo', 'investment', 'stockAnalysis'],
    updateFrequencyKey: 'every30Minutes',
    color: '#ff6600'
  },
  {
    code: 'xueqiu',
    contentTypeKeys: ['stockInvestment', 'financeCommunity', 'investmentStrategy'],
    updateFrequencyKey: 'every30Minutes',
    color: '#00aa88'
  },
  {
    code: 'cls',
    contentTypeKeys: ['financeFlash', 'marketUpdates', 'realTimeInfo'],
    updateFrequencyKey: 'every30Minutes',
    color: '#1890ff'
  }
];
