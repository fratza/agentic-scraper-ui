/**
 * Development environment configuration
 * Contains settings specific to regular development mode
 */

import { EnvironmentConfig } from "./environment.base";

/**
 * Development environment configuration
 */
export const devEnvironment: EnvironmentConfig = {
  apiBaseUrl: "https://agentic-scraper-api-1.onrender.com", // Use relative URLs for regular development
  useMockData: false, // Use mock data in regular development mode
};
