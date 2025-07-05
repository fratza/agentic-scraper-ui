import React from 'react';
import ScraperPage from '../pages/ScraperPage';

/**
 * Simple router configuration
 * This can be expanded to use React Router in the future
 */
const routes = [
  {
    path: '/',
    component: ScraperPage,
    exact: true
  }
];

/**
 * Router component that renders the current route
 * Currently just renders the ScraperPage since we only have one page
 */
export const Router = () => {
  return <ScraperPage />;
};

export default routes;
