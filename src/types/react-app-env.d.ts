/// <reference types="react-scripts" />

import React from 'react';

declare global {
  namespace JSX {
    interface IntrinsicElements {
      [elemName: string]: any;
    }
  }
}

// This ensures TypeScript understands React JSX elements
// This is only needed if you're experiencing "JSX element implicitly has type 'any'" errors
// The react-scripts types should normally handle this automatically
