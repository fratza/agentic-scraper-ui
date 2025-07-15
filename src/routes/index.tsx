import React, { useState, useEffect } from "react";
import ScraperPage from "../pages/ScraperPage";
import Dashboard from "../pages/Dashboard";
import { Route, LocationChangeEvent } from "../model";

/**
 * Simple router configuration
 * This can be expanded to use React Router in the future
 */
const routes: Route[] = [
  {
    path: "/",
    component: ScraperPage,
    exact: true,
  },
  {
    path: "/dashboard",
    component: Dashboard,
    exact: true,
  },
];

/**
 * Router component that renders the current route based on the current path
 */
export const Router: React.FC = () => {
  const [currentPath, setCurrentPath] = useState<string>(
    window.location.pathname
  );

  useEffect(() => {
    // Handle browser back/forward buttons
    const handlePopState = (): void => {
      setCurrentPath(window.location.pathname);
    };

    // Handle custom location change events
    const handleLocationChange = (event: Event): void => {
      const customEvent = event as LocationChangeEvent;
      if (customEvent.detail) {
        setCurrentPath(customEvent.detail);
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
  }, []);

  // Find the matching route
  const route = routes.find((route) => {
    if (route.exact) {
      return route.path === currentPath;
    }
    return currentPath.startsWith(route.path);
  });

  // Render the component for the matching route, or default to ScraperPage
  const RouteComponent = route ? route.component : ScraperPage;
  return <RouteComponent />;
};

export default routes;
