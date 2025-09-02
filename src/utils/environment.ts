/**
 * Environment utility functions
 * This file exports the environment configuration based on the current mode
 */

import {
  baseEnvironment,
  isLocalEnvironment,
  isLocalMode,
  isDevMode,
  EnvironmentConfig,
} from "./environment.base";

import { localEnvironment } from "./environment.local";
import { devEnvironment } from "./environment.dev";

/**
 * Get the current environment configuration
 * @returns The environment configuration for the current mode
 */
export const getCurrentEnvironment = (): EnvironmentConfig => {
  if (isLocalMode()) {
    return localEnvironment;
  } else if (isDevMode()) {
    return devEnvironment;
  } else {
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

// Re-export utility functions from base

// Export the environment configuration interface
export type { EnvironmentConfig };
