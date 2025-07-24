/**
 * Base environment configuration
 * Contains default environment settings
 */

export interface EnvironmentConfig {
  apiBaseUrl: string;
  useMockData: boolean;
}

/**
 * Default environment configuration
 */
export const baseEnvironment: EnvironmentConfig = {
  // In production, use RENDER_EXTERNAL_URL environment variable if available (Render.com),
  // otherwise default to empty string for relative URLs
  apiBaseUrl: process.env.NODE_ENV === 'production' 
    ? (process.env.REACT_APP_API_URL || process.env.RENDER_EXTERNAL_URL || '')
    : '',
  useMockData: false,
};

/**
 * Check if the application is running in a local development environment
 * @returns boolean indicating if the app is running locally
 */
export const isLocalEnvironment = (): boolean => {
  // Check if window.location.hostname is localhost or 127.0.0.1
  const hostname = window.location.hostname;
  return hostname === "localhost" || hostname === "127.0.0.1";
};

/**
 * Check if the application is running in local development mode
 * @returns boolean indicating if the app is running in local mode
 */
export const isLocalMode = (): boolean => {
  // Check if the app was started with npm run local (REACT_APP_MODE=local)
  return (
    process.env.REACT_APP_MODE === "local" ||
    window.location.search.includes("mode=local") ||
    localStorage.getItem("appMode") === "local"
  );
};

/**
 * Check if the application is running in dev mode
 * @returns boolean indicating if the app is running in dev mode
 */
export const isDevMode = (): boolean => {
  // Check if the app was started with npm run dev (REACT_APP_MODE=dev)
  return (
    process.env.REACT_APP_MODE === "dev" ||
    window.location.search.includes("mode=dev") ||
    localStorage.getItem("appMode") === "dev"
  );
};
