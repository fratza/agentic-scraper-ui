/**
 * Application configuration
 */
import { getApiBaseUrl } from "../utils/environment";

interface ApiConfig {
  baseUrl: string;
  endpoints: {
    scrape: string;
    status: string;
    results: string;
    urlList: string;
  };
  timeout: number;
}

interface UiConfig {
  animationDuration: number;
  progressPollInterval: number;
  progressTimeout: number;
}

interface AppConfig {
  api: ApiConfig;
  ui: UiConfig;
}

export const config: AppConfig = {
  // API configuration
  api: {
    // Use the environment-specific base URL
    baseUrl:
      getApiBaseUrl() ||
      process.env.REACT_APP_API_URL ||
      "http://localhost:3001/api",
    endpoints: {
      scrape: "/api/scrape",
      status: "/api/scrape/status",
      results: "/api/scrape/results",
      urlList: "/api/supabase/url-list",
    },
    timeout: 30000, // 30 seconds
  },

  // UI configuration
  ui: {
    animationDuration: 500,
    progressPollInterval: 1000, // 1 second
    progressTimeout: 120000, // 2 minutes
  },
};

export default config;
