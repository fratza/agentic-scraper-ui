/**
 * Navigation utility functions
 * Provides consistent navigation across the application
 */

/**
 * Navigate to a new route programmatically
 * @param path The path to navigate to
 * @param options Optional navigation options
 */
export const navigateTo = (
  path: string,
  options: { replace?: boolean } = {}
) => {
  if (typeof window === "undefined") return;

  if (options.replace) {
    window.history.replaceState({}, "", path);
  } else {
    window.history.pushState({}, "", path);
  }

  // Dispatch a custom event that our router is listening for
  window.dispatchEvent(new CustomEvent("locationchange", { detail: path }));
};

/**
 * Check if the current path matches the given path
 * @param path The path to check against
 * @param exact Whether to match exactly
 */
export const isActivePath = (path: string, exact: boolean = false): boolean => {
  if (typeof window === "undefined") return false;

  const currentPath = window.location.pathname;
  return exact ? currentPath === path : currentPath.startsWith(path);
};
