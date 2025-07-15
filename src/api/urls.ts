import axios from 'axios';

export interface UrlListResponse {
  status: 'success' | 'error';
  data: string[];
}

export const fetchUrlList = async (): Promise<UrlListResponse> => {
  try {
    const response = await axios.get('/supabase/url-list');
    return response.data;
  } catch (error) {
    console.error('Failed to fetch URL list:', error);
    throw error;
  }
};
