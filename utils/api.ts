import axios from 'axios';
import { ApiResponse, PlatformType, AnalysisResponse, PlatformComparisonResponse, CrossPlatformResponse, DataVisualizationResponse, TrendForecastResponse, TrendingItem } from '../types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://orz.ai/api/v1/dailynews/';

/**
 * Fetches trending data from a specific platform
 * @param platform - The platform code to fetch data from
 * @returns A promise that resolves to the API response
 */
export async function fetchTrendingData(platform: PlatformType): Promise<ApiResponse> {
  try {
    const url = `${API_BASE_URL}?platform=${platform}`;
    const response = await axios.get<ApiResponse>(url);
    return response.data;
  } catch (error) {
    console.error(`Error fetching data from ${platform}:`, error);
    return {
      status: 'error',
      data: [],
      msg: error instanceof Error ? error.message : 'An unknown error occurred'
    };
  }
}

/**
 * Fetches trending data from multiple platforms in a single API call
 * @param platforms - Array of platform codes to fetch data from
 * @param date - Optional date parameter in YYYY-MM-DD format
 * @returns A promise that resolves to an object with platform codes as keys and trending items as values
 */
export async function fetchMultiPlatformData(
  platforms: PlatformType[], 
  date?: string
): Promise<Record<PlatformType, ApiResponse>> {
  try {
    const platformsParam = platforms.join(',');
    const dateParam = date ? `&date=${date}` : '';
    const url = `${API_BASE_URL}multi?platforms=${platformsParam}${dateParam}`;
    
    const response = await axios.get(url);
    const responseData = response.data;
    
    if (responseData.status !== '200') {
      throw new Error(responseData.msg || 'Failed to fetch multi-platform data');
    }
    
    // Initialize the result with empty data for all requested platforms
    const result: Record<PlatformType, ApiResponse> = platforms.reduce((acc, platform) => {
      acc[platform] = {
        status: responseData.status,
        data: [],
        msg: responseData.msg
      };
      return acc;
    }, {} as Record<PlatformType, ApiResponse>);
    
    // For each platform in the data object
    Object.keys(responseData.data).forEach((platform) => {
      if (platforms.includes(platform as PlatformType)) {
        result[platform as PlatformType] = {
          status: responseData.status,
          data: responseData.data[platform] || [],
          msg: responseData.msg
        };
      }
    });
    
    return result;
  } catch (error) {
    console.error('Error fetching multiple platforms:', error);
    
    // Return empty data for each requested platform
    return platforms.reduce((acc, platform) => {
      acc[platform] = {
        status: 'error',
        data: [],
        msg: error instanceof Error ? error.message : 'An unknown error occurred'
      };
      return acc;
    }, {} as Record<PlatformType, ApiResponse>);
  }
}

/**
 * Fetches trending data from multiple platforms simultaneously
 * @param platforms - Array of platform codes to fetch data from
 * @returns A promise that resolves to an object with platform codes as keys and API responses as values
 * @deprecated Use fetchMultiPlatformData instead for better performance
 */
export async function fetchMultiplePlatforms(platforms: PlatformType[]): Promise<Record<PlatformType, ApiResponse>> {
  try {
    const requests = platforms.map(platform => fetchTrendingData(platform));
    const responses = await Promise.all(requests);
    
    return platforms.reduce((acc, platform, index) => {
      acc[platform] = responses[index];
      return acc;
    }, {} as Record<PlatformType, ApiResponse>);
  } catch (error) {
    console.error('Error fetching multiple platforms:', error);
    throw error;
  }
}

/**
 * Fetches trend analysis data from the server
 * @param analysisType - The type of analysis to fetch (default: 'main')
 * @returns A promise that resolves to the analysis data
 */
export async function fetchAnalysisData(analysisType: string = 'main'): Promise<AnalysisResponse> {
  try {
    const baseUrl = API_BASE_URL.replace('dailynews', 'analysis/trend');
    const url = `${baseUrl}?type=${analysisType}`;
    const response = await axios.get<AnalysisResponse>(url);
    return response.data;
  } catch (error) {
    console.error(`Error fetching analysis data:`, error);
    return {
      status: 'error',
      date: new Date().toISOString().slice(0, 10),
      analysis_type: analysisType,
      hot_keywords: [],
      topic_distribution: [],
      related_topic_groups: [],
      updated_at: new Date().toISOString().replace('T', ' ').slice(0, 19),
      msg: error instanceof Error ? error.message : 'An unknown error occurred'
    };
  }
}

/**
 * Fetches platform comparison data from the server
 * @returns A promise that resolves to the platform comparison data
 */
export async function fetchPlatformComparisonData(): Promise<PlatformComparisonResponse> {
  try {
    const baseUrl = API_BASE_URL.replace('dailynews', 'analysis/platform-comparison');
    const response = await axios.get<PlatformComparisonResponse>(baseUrl);
    return response.data;
  } catch (error) {
    console.error(`Error fetching platform comparison data:`, error);
    return {
      status: 'error',
      date: new Date().toISOString().slice(0, 10),
      analysis_type: 'platform',
      platform_stats: {},
      platform_rankings: [],
      platform_update_frequency: {
        by_platform: {},
        overall: {
          morning: { label: '上午', percentage: 0 },
          afternoon: { label: '下午', percentage: 0 },
          evening: { label: '晚上', percentage: 0 },
          night: { label: '凌晨', percentage: 0 }
        }
      },
      updated_at: new Date().toISOString().replace('T', ' ').slice(0, 19),
      msg: error instanceof Error ? error.message : 'An unknown error occurred'
    };
  }
}

/**
 * Fetches cross-platform hot topics data from the server
 * @returns A promise that resolves to the cross-platform analysis data
 */
export async function fetchCrossPlatformData(): Promise<CrossPlatformResponse> {
  try {
    const baseUrl = API_BASE_URL.replace('dailynews', 'analysis/cross-platform');
    const response = await axios.get<CrossPlatformResponse>(baseUrl);
    return response.data;
  } catch (error) {
    console.error(`Error fetching cross-platform data:`, error);
    return {
      status: 'error',
      date: new Date().toISOString().slice(0, 10),
      analysis_type: 'cross_platform',
      common_topics: [],
      updated_at: new Date().toISOString().replace('T', ' ').slice(0, 19),
      msg: error instanceof Error ? error.message : 'An unknown error occurred'
    };
  }
}

/**
 * Fetches data visualization information for topic heat distribution
 * @returns A promise that resolves to the data visualization response
 */
export async function fetchDataVisualization(): Promise<DataVisualizationResponse> {
  try {
    const baseUrl = API_BASE_URL.replace('dailynews', 'analysis/data-visualization');
    const response = await axios.get<DataVisualizationResponse>(baseUrl);
    return response.data;
  } catch (error) {
    console.error(`Error fetching data visualization:`, error);
    return {
      status: 'error',
      date: new Date().toISOString().slice(0, 10),
      analysis_type: 'data_visualization',
      topic_heat_distribution: {
        keywords: [],
        platforms: [],
        data: []
      },
      updated_at: new Date().toISOString().replace('T', ' ').slice(0, 19),
      msg: error instanceof Error ? error.message : 'An unknown error occurred'
    };
  }
}

/**
 * Fetch trend forecast data
 * @param timeRange - The time range for the forecast (24h, week, month)
 */
export async function fetchTrendForecast(timeRange: string = '24h'): Promise<TrendForecastResponse> {
  try {
    const baseUrl = API_BASE_URL.replace('dailynews', 'analysis/trend-forecast');
    const url = `${baseUrl}?time_range=${timeRange}`;
    const response = await axios.get<TrendForecastResponse>(url);
    return response.data;
  } catch (error) {
    console.error('Error fetching trend forecast data:', error);
    return {
      status: 'error',
      date: new Date().toISOString().split('T')[0],
      analysis_type: 'trend_forecast',
      time_range: timeRange,
      description: '基于当前热点数据和历史趋势，预测未来趋势。',
      has_enough_data: false,
      trend_evolution: [],
      updated_at: new Date().toISOString().replace('T', ' ').substring(0, 19)
    };
  }
}

/**
 * Search for trending items across platforms
 * @param keyword - The search keyword
 * @returns A promise that resolves to the search results
 */
export interface SearchResponse {
  status: string;
  data: Array<{
    id: string | null;
    title: string;
    source: string;
    rank: string;
    url: string;
    category: string;
    sub_category: string;
  }>;
  msg: string;
  total: number;
  search_results: number;
}

export async function searchTrendingItems(keyword: string): Promise<SearchResponse> {
  try {
    const baseUrl = API_BASE_URL.replace('dailynews/', 'dailynews/search');
    const url = `${baseUrl}?keyword=${encodeURIComponent(keyword)}`;
    const response = await axios.get<SearchResponse>(url);
    return response.data;
  } catch (error) {
    console.error('Error searching trending items:', error);
    return {
      status: 'error',
      data: [],
      msg: error instanceof Error ? error.message : 'An unknown error occurred',
      total: 0,
      search_results: 0
    };
  }
}

/**
 * Fetches data for all platforms at once
 * @param date - Optional date parameter in YYYY-MM-DD format
 * @returns A promise that resolves to an object with platform codes as keys and trending items arrays as values
 */
export interface AllPlatformsResponse {
  status: string;
  data: Record<PlatformType, TrendingItem[]>;
  msg: string;
}

export async function fetchAllPlatformsData(date?: string): Promise<AllPlatformsResponse> {
  try {
    const dateParam = date ? `?date=${date}` : '';
    const url = `${API_BASE_URL}all${dateParam}`;
    const response = await axios.get<AllPlatformsResponse>(url);
    return response.data;
  } catch (error) {
    console.error('Error fetching all platforms data:', error);
    return {
      status: "500",
      data: {} as Record<PlatformType, TrendingItem[]>,
      msg: "Failed to fetch all platforms data"
    };
  }
}

/**
 * Keyword cloud response interface
 */
export interface KeywordCloudResponse {
  status: string;
  date: string;
  analysis_type: string;
  keyword_clouds: {
    all: Array<{
      text: string;
      weight: number;
    }>;
    [category: string]: Array<{
      text: string;
      weight: number;
    }>;
  };
  msg?: string;
}

/**
 * Fetches keyword cloud data for visualization
 * @param options - Options for fetching keyword cloud data
 * @param options.category - Optional category to filter keywords
 * @param options.date - Optional date in YYYY-MM-DD format
 * @param options.refresh - Whether to refresh the cache
 * @param options.platforms - Optional comma-separated list of platforms
 * @param options.keyword_count - Number of keywords to return (default: 200)
 * @returns A promise that resolves to the keyword cloud data
 */
export async function fetchKeywordCloud(options: {
  category?: string;
  date?: string;
  refresh?: boolean;
  platforms?: string;
  keyword_count?: number;
} = {}): Promise<KeywordCloudResponse> {
  try {
    const { category, date, refresh, platforms, keyword_count } = options;
    
    // Build query parameters
    const params = new URLSearchParams();
    if (category) params.append('category', category);
    if (date) params.append('date', date);
    if (refresh) params.append('refresh', 'true');
    if (platforms) params.append('platforms', platforms);
    if (keyword_count) params.append('keyword_count', keyword_count.toString());
    
    const queryString = params.toString();
    const url = `${API_BASE_URL.replace('dailynews', 'analysis/keyword-cloud')}${queryString ? `?${queryString}` : ''}`;
    
    const response = await axios.get<KeywordCloudResponse>(url);
    return response.data;
  } catch (error) {
    console.error(`Error fetching keyword cloud data:`, error);
    return {
      status: 'error',
      date: new Date().toISOString().slice(0, 10),
      analysis_type: 'keyword_cloud',
      keyword_clouds: {
        all: []
      },
      msg: error instanceof Error ? error.message : 'An unknown error occurred'
    };
  }
} 