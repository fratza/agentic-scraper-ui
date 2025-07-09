/**
 * Application configuration
 */

interface ApiConfig {
  baseUrl: string;
  endpoints: {
    scrape: string;
    status: string;
    results: string;
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
    baseUrl: process.env.REACT_APP_API_URL || "http://localhost:3001/api",
    endpoints: {
      scrape: "/scrape",
      status: "/scrape/status",
      results: "/scrape/results",
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
