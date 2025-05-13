import { PlatformInfo } from '../types';

export const PLATFORMS: PlatformInfo[] = [
  {
    code: 'baidu',
    name: '百度热搜',
    description: '百度搜索引擎热搜榜单',
    contentType: ['社会热点', '娱乐', '事件'],
    updateFrequency: '30分钟',
    color: '#3388ff'
  },
  {
    code: 'shaoshupai',
    name: '少数派',
    description: '高质量科技媒体',
    contentType: ['科技', '数码', '生活方式'],
    updateFrequency: '30分钟',
    color: '#414141'
  },
  {
    code: 'weibo',
    name: '微博热搜',
    description: '中国最大的社交平台热搜榜',
    contentType: ['社交媒体热点', '娱乐', '事件'],
    updateFrequency: '30分钟',
    color: '#ff8200'
  },
  {
    code: 'zhihu',
    name: '知乎热榜',
    description: '中国知名问答社区热榜',
    contentType: ['问答', '深度内容', '社会热点'],
    updateFrequency: '30分钟',
    color: '#0066ff'
  },
  {
    code: '36kr',
    name: '36氪',
    description: '创业资讯和科技新闻',
    contentType: ['科技创业', '商业资讯'],
    updateFrequency: '30分钟',
    color: '#4a7eff'
  },
  {
    code: '52pojie',
    name: '吾爱破解',
    description: '软件安全和开发社区',
    contentType: ['技术', '软件', '安全'],
    updateFrequency: '30分钟',
    color: '#3c73a8'
  },
  {
    code: 'bilibili',
    name: '哔哩哔哩',
    description: '中国最大的视频弹幕网站',
    contentType: ['视频', '动漫', '游戏', '生活'],
    updateFrequency: '30分钟',
    color: '#fb7299'
  },
  {
    code: 'douban',
    name: '豆瓣',
    description: '文化社区与生活平台',
    contentType: ['书影音', '文化', '讨论'],
    updateFrequency: '30分钟',
    color: '#00b51d'
  },
  {
    code: 'hupu',
    name: '虎扑',
    description: '体育社区',
    contentType: ['体育', '游戏', '数码'],
    updateFrequency: '30分钟',
    color: '#c01d2f'
  },
  {
    code: 'tieba',
    name: '百度贴吧',
    description: '中国最大的兴趣社区',
    contentType: ['兴趣社区', '话题讨论'],
    updateFrequency: '30分钟',
    color: '#4879bd'
  },
  {
    code: 'juejin',
    name: '掘金',
    description: '开发者技术社区',
    contentType: ['编程', '技术文章'],
    updateFrequency: '30分钟',
    color: '#1e80ff'
  },
  {
    code: 'douyin',
    name: '抖音',
    description: '中国最大的短视频平台',
    contentType: ['短视频热点', '娱乐'],
    updateFrequency: '30分钟',
    color: '#fe2c55'
  },
  {
    code: 'v2ex',
    name: 'V2EX',
    description: '创意工作者社区',
    contentType: ['技术', '编程', '创意'],
    updateFrequency: '30分钟',
    color: '#171a1d'
  },
  {
    code: 'jinritoutiao',
    name: '今日头条',
    description: '个性化推荐的资讯平台',
    contentType: ['新闻', '热点事件'],
    updateFrequency: '30分钟',
    color: '#d43d3d'
  },
  {
    code: 'stackoverflow',
    name: 'Stack Overflow',
    description: '全球最大的程序员问答社区',
    contentType: ['编程问答', '技术讨论'],
    updateFrequency: '30分钟',
    color: '#f48024'
  },
  {
    code: 'github',
    name: 'GitHub Trending',
    description: '全球最大的开源代码托管平台',
    contentType: ['开源项目', '编程语言'],
    updateFrequency: '30分钟',
    color: '#24292e'
  },
  {
    code: 'hackernews',
    name: 'Hacker News',
    description: '科技创业社区',
    contentType: ['科技新闻', '创业', '编程'],
    updateFrequency: '30分钟',
    color: '#ff6600'
  }
]; 