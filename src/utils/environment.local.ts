/**
 * Local environment configuration
 * Contains settings specific to local development mode
 */

import { EnvironmentConfig } from './environment.base';

/**
 * Local environment configuration
 */
export const localEnvironment: EnvironmentConfig = {
  apiBaseUrl: 'https://agentic-scraper-ui-dev.onrender.com',
  useMockData: false,  // When in local mode, use real API data from dev server
};
