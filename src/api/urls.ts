import { apiClient, UrlListResponse } from '../services/api';
import { config } from '../lib/config';

export const fetchUrlList = async (): Promise<UrlListResponse> => {
  try {
    const response = await apiClient.get<UrlListResponse>(config.api.endpoints.urlList);
    return response.data;
  } catch (error) {
    console.error('Failed to fetch URL list:', error);
    throw new Error('Failed to fetch URL list');
  }
};
