#!/bin/bash

# Exit on error
set -e

# Install dependencies
echo "Installing dependencies..."
npm ci || npm install --legacy-peer-deps

# Build the React application
echo "Building React application..."
CI=false npm run build

# Success message
echo "Build completed successfully!"
