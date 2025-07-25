import React from "react";

/**
 * Interface for route configuration
 */
export interface Route {
  path: string;
  component: React.ComponentType;
  exact: boolean;
  title?: string;
}

/**
 * Custom event interface for location change events
 */
export interface LocationChangeEvent extends Event {
  detail?: string;
}
