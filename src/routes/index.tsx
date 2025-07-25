import React, { useState, useEffect, useCallback, lazy, Suspense } from "react";
import { Route as RouteType, LocationChangeEvent } from "../model";

// Lazy load pages for better performance
const ScraperPage = lazy(() => import("../pages/ScraperPage"));
const Dashboard = lazy(() => import("../pages/Dashboard"));
const NotFoundPage = lazy(() => import("../pages/NotFoundPage"));

// Loading component for Suspense fallback
const LoadingFallback: React.FC = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
  </div>
);

/**
 * Router configuration
 */
const routes: RouteType[] = [
  {
    path: "/",
    component: ScraperPage,
    exact: true,
    title: "Home | NeuroScrape",
  },
  {
    path: "/dashboard",
    component: Dashboard,
    exact: true,
    title: "Dashboard | NeuroScrape",
  },
  // 404 route - must be the last in the array
  {
    path: "*",
    component: NotFoundPage,
    exact: false,
    title: "Page Not Found | NeuroScrape",
  },
];

/**
 * Custom navigation function
 * @param path The path to navigate to
 * @param options Navigation options
 */
const navigate = (path: string, options: { replace?: boolean } = {}) => {
  if (options.replace) {
    window.history.replaceState({}, "", path);
  } else {
    window.history.pushState({}, "", path);
  }

  // Update document title based on the new route
  const route = findMatchingRoute(path);
  if (route?.title) {
    document.title = route.title;
  }

  // Dispatch the location change event
  window.dispatchEvent(new CustomEvent("locationchange", { detail: path }));
};

// Make navigate available globally for programmatic navigation
if (typeof window !== "undefined") {
  (window as any).navigate = navigate;
}

/**
 * Find the matching route for a given path
 */
const findMatchingRoute = (path: string): RouteType | undefined => {
  // First try exact matches
  const exactMatch = routes.find((route) => route.exact && route.path === path);

  if (exactMatch) return exactMatch;

  // Then try prefix matches
  const prefixMatch = routes.find(
    (route) => !route.exact && path.startsWith(route.path)
  );

  return prefixMatch || routes.find((route) => route.path === "*");
};

/**
 * Router component that renders the current route based on the current path
 */
export const Router: React.FC = () => {
  const [currentPath, setCurrentPath] = useState<string>(
    window.location.pathname
  );

  // Function to update the current path
  const updatePath = useCallback((path: string) => {
    setCurrentPath(path);

    // Scroll to top on route change
    window.scrollTo(0, 0);

    // Update document title
    const route = findMatchingRoute(path);
    if (route?.title) {
      document.title = route.title;
    }
  }, []);

  useEffect(() => {
    // Set initial document title
    const route = findMatchingRoute(currentPath);
    if (route?.title) {
      document.title = route.title;
    }

    // Handle browser back/forward buttons
    const handlePopState = (): void => {
      updatePath(window.location.pathname);
    };

    // Handle custom location change events
    const handleLocationChange = (event: Event): void => {
      const customEvent = event as LocationChangeEvent;
      if (customEvent.detail) {
        updatePath(customEvent.detail);
      }
    };

    // Add event listeners
    window.addEventListener("popstate", handlePopState);
    window.addEventListener("locationchange", handleLocationChange);

    // Clean up event listeners
    return () => {
      window.removeEventListener("popstate", handlePopState);
      window.removeEventListener("locationchange", handleLocationChange);
    };
  }, [updatePath, currentPath]);

  // Find the matching route for the current path
  const route =
    findMatchingRoute(currentPath) || routes.find((r) => r.path === "*");

  if (!route) {
    console.error("No matching route found and no 404 route defined");
    return null;
  }

  // Get the component to render
  const RouteComponent = route.component;

  // Wrap with Suspense for code-splitting
  return (
    <Suspense fallback={<LoadingFallback />}>
      <RouteComponent />
    </Suspense>
  );
};

export default routes;
