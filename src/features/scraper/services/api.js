import axios from 'axios';
import { config } from '../../../lib/config';

// Create axios instance with config from lib/config
const apiClient = axios.create({
  baseURL: config.api.baseUrl,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: config.api.timeout
});

// API service functions
const apiService = {
  // Submit a scraping request
  submitScrapeRequest: async (data) => {
    try {
      const response = await apiClient.post(config.api.endpoints.scrape, data);
      return response.data;
    } catch (error) {
      console.error('Error submitting scrape request:', error);
      throw error;
    }
  },
  
  // Get scraping status
  getScrapeStatus: async (jobId) => {
    try {
      const response = await apiClient.get(`${config.api.endpoints.status}/${jobId}`);
      return response.data;
    } catch (error) {
      console.error('Error getting scrape status:', error);
      throw error;
    }
  },
  
  // Get scraping results
  getScrapeResults: async (jobId) => {
    try {
      const response = await apiClient.get(`${config.api.endpoints.results}/${jobId}`);
      return response.data;
    } catch (error) {
      console.error('Error getting scrape results:', error);
      throw error;
    }
  }
};

export default apiService;
