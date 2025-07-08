import React from "react";
import ScraperPage from "../pages/ScraperPage";
import ExtractedDataPage from "../pages/ExtractedDataPage";
import TemplatePage from "../pages/TemplatePage";

/**
 * Simple router configuration
 * This can be expanded to use React Router in the future
 */
const routes = [
  {
    path: "/",
    component: ScraperPage,
    exact: true,
  },
  {
    path: "/extracted-data",
    component: ExtractedDataPage,
    exact: true,
  },
  {
    path: "/template",
    component: TemplatePage,
    exact: true,
  },
];

/**
 * Router component that renders the current route based on the current path
 */
export const Router = () => {
  const [currentPath, setCurrentPath] = React.useState(window.location.pathname);

  React.useEffect(() => {
    // Handle browser back/forward buttons
    const handlePopState = () => {
      setCurrentPath(window.location.pathname);
    };

    // Handle custom location change events
    const handleLocationChange = (event) => {
      if (event.detail) {
        setCurrentPath(event.detail);
      }
    };

    // Add event listeners
    window.addEventListener('popstate', handlePopState);
    window.addEventListener('locationchange', handleLocationChange);

    // Clean up event listeners
    return () => {
      window.removeEventListener('popstate', handlePopState);
      window.removeEventListener('locationchange', handleLocationChange);
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
