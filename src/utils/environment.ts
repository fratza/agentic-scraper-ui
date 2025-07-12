/**
 * Environment utility functions
 */

/**
 * Check if the application is running in a local development environment
 * @returns boolean indicating if the app is running locally
 */
export const isLocalEnvironment = (): boolean => {
  // Check if window.location.hostname is localhost or 127.0.0.1
  const hostname = window.location.hostname;
  return hostname === 'localhost' || hostname === '127.0.0.1';
};

/**
 * Check if mock data should be used based on environment
 * @returns boolean indicating if mock data should be used
 */
export const useMockData = (): boolean => {
  // In a real app, you might also check for specific URL parameters or environment variables
  return isLocalEnvironment();
};
