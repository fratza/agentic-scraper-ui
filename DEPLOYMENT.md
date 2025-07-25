# Deployment Guide

This document provides instructions for deploying the Agentic Scraper UI to various environments.

## Prerequisites

- Node.js (v16 or higher)
- npm (v8 or higher) or yarn (v1.22 or higher)
- Git
- Access to the deployment target (Vercel, Netlify, or your own server)

## Environment Variables

Before deploying, make sure to set up the following environment variables:

```env
# App Configuration
NODE_ENV=production
PORT=3000

# API Configuration
REACT_APP_API_URL=/api  # Update with your API URL
REACT_APP_USE_MOCK_DATA=false

# Feature Flags
REACT_APP_ENABLE_ANALYTICS=true
REACT_APP_ENABLE_LOGGING=true

# External Services
REACT_APP_GOOGLE_ANALYTICS_ID=  # Optional
REACT_APP_SENTRY_DSN=           # Optional
```

## Local Development

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/agentic-scraper-ui.git
   cd agentic-scraper-ui
   ```

2. Install dependencies:
   ```bash
   npm install
   # or
   yarn install
   ```

3. Create a `.env` file:
   ```bash
   cp .env.example .env
   ```
   Then edit the `.env` file with your local configuration.

4. Start the development server:
   ```bash
   npm start
   # or
   yarn start
   ```

## Building for Production

1. Build the application:
   ```bash
   npm run build
   # or
   yarn build
   ```

2. The production build will be created in the `build` directory.

## Deployment to Vercel

1. Install Vercel CLI (if not already installed):
   ```bash
   npm install -g vercel
   ```

2. Deploy:
   ```bash
   vercel
   ```

3. Follow the prompts to complete the deployment.

## Deployment to Netlify

1. Install Netlify CLI (if not already installed):
   ```bash
   npm install -g netlify-cli
   ```

2. Build the application:
   ```bash
   npm run build
   ```

3. Deploy:
   ```bash
   netlify deploy --prod
   ```

## Manual Deployment to a Static Server

1. Build the application:
   ```bash
   npm run build
   ```

2. Copy the contents of the `build` directory to your web server's document root.

3. Configure your web server to serve `index.html` for all routes (client-side routing).

## Environment-Specific Configuration

### Development
- Set `NODE_ENV=development`
- Enable development tools and logging
- Use mock data if needed

### Staging
- Set `NODE_ENV=production`
- Connect to staging API
- Enable detailed logging

### Production
- Set `NODE_ENV=production`
- Connect to production API
- Enable production optimizations
- Enable analytics and monitoring

## CI/CD Configuration

Example GitHub Actions workflow (`.github/workflows/deploy.yml`):

```yaml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      
      - name: Use Node.js
        uses: actions/setup-node@v2
        with:
          node-version: '16'
          
      - name: Install dependencies
        run: npm ci
        
      - name: Build
        run: npm run build
        env:
          NODE_ENV: production
          REACT_APP_API_URL: ${{ secrets.REACT_APP_API_URL }}
          
      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          working-directory: ./
          vercel-args: '--prod'
```

## Troubleshooting

### Common Issues

1. **Blank Page on Refresh**
   - Ensure your web server is configured to serve `index.html` for all routes
   - Check for client-side routing configuration

2. **Environment Variables Not Loading**
   - Make sure variables are prefixed with `REACT_APP_`
   - Restart the development server after changing environment variables

3. **Build Failures**
   - Check Node.js and npm/yarn versions
   - Clear npm/yarn cache
   - Delete `node_modules` and reinstall dependencies

## Monitoring and Maintenance

- Set up error tracking (e.g., Sentry)
- Configure logging and monitoring
- Set up performance monitoring
- Schedule regular dependency updates
