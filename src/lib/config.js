/**
 * Application configuration
 */

export const config = {
  // API configuration
  api: {
    baseUrl: process.env.REACT_APP_API_URL || 'http://localhost:3001/api',
    endpoints: {
      scrape: '/scrape',
      status: '/scrape/status',
      results: '/scrape/results'
    },
    timeout: 30000 // 30 seconds
  },
  
  // UI configuration
  ui: {
    animationDuration: 500,
    progressPollInterval: 1000, // 1 second
    progressTimeout: 120000 // 2 minutes
  }
};

export default config;
