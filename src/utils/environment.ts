/**
 * Environment utility functions
 * This file exports the environment configuration based on the current mode
 */

import { baseEnvironment, isLocalEnvironment, isLocalMode, isDevMode, EnvironmentConfig } from './environment.base';
import { devEnvironment } from './environment.dev';
import { localEnvironment } from './environment.local';

/**
 * Get the current environment configuration
 * @returns The environment configuration for the current mode
 */
export const getCurrentEnvironment = (): EnvironmentConfig => {
  if (isLocalMode()) {
    // Local mode (npm run local) - use local environment
    return localEnvironment;
  } else if (isDevMode()) {
    // Dev mode (npm run dev) - use dev environment
    return devEnvironment;
  } else if (isLocalEnvironment()) {
    // Regular development mode (npm start) - use dev environment
    return devEnvironment;
  } else {
    // Production mode - use base environment
    return baseEnvironment;
  }
};

// Export the current environment configuration
const currentEnv = getCurrentEnvironment();

/**
 * Get the base API URL based on the environment
 * @returns string with the base API URL
 */
export const getApiBaseUrl = (): string => {
  return currentEnv.apiBaseUrl;
};

/**
 * Check if mock data should be used based on environment
 * @returns boolean indicating if mock data should be used
 */
export const useMockData = (): boolean => {
  return currentEnv.useMockData;
};

// Re-export utility functions from base
export { isLocalEnvironment, isLocalMode, isDevMode };

// Export the environment configuration interface
export type { EnvironmentConfig };
