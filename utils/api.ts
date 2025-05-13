import axios from 'axios';
import { ApiResponse, PlatformType } from '../types';

const API_BASE_URL = 'https://orz.ai/api/v1/dailynews/';

/**
 * Fetches trending data from a specific platform
 * @param platform - The platform code to fetch data from
 * @returns A promise that resolves to the API response
 */
export async function fetchTrendingData(platform: PlatformType): Promise<ApiResponse> {
  try {
    const response = await axios.get<ApiResponse>(`${API_BASE_URL}?platform=${platform}`);
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
 * Fetches trending data from multiple platforms simultaneously
 * @param platforms - Array of platform codes to fetch data from
 * @returns A promise that resolves to an object with platform codes as keys and API responses as values
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