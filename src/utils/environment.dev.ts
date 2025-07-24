/**
 * Development environment configuration
 * Contains settings specific to regular development mode
 */

import { EnvironmentConfig } from './environment.base';

/**
 * Development environment configuration
 */
export const devEnvironment: EnvironmentConfig = {
  apiBaseUrl: '',  // Use relative URLs for regular development
  useMockData: true,  // Use mock data in regular development mode
};
