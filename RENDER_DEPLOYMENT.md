# Deploying to Render

This document provides step-by-step instructions for deploying the Agentic Scraper UI to Render.

## Prerequisites

- A [Render account](https://render.com/)
- Your code pushed to a Git repository (GitHub, GitLab, or Bitbucket)

## Deployment Steps

### 1. Log in to Render

Go to [render.com](https://render.com/) and log in to your account.

### 2. Create a New Static Site

1. Click on the "New +" button in the dashboard
2. Select "Static Site"
3. Connect your Git repository where this code is hosted
4. Configure your static site:
   - **Name**: `agentic-scraper-ui` (or your preferred name)
   - **Build Command**: `npm install && npm run build`
   - **Publish Directory**: `build`
   - **Environment Variables**: Add any necessary environment variables (see below)

### 3. Environment Variables

Make sure to set the following environment variable in the Render dashboard:

- `REACT_APP_API_URL`: The URL of your backend API (e.g., `https://your-backend-service.onrender.com/api`)

### 4. Deploy

Click "Create Static Site" and Render will automatically build and deploy your application.

## Connecting to Your Backend

If you're also deploying your backend API to Render:

1. Deploy your backend first
2. Get the URL of your deployed backend service
3. Set the `REACT_APP_API_URL` environment variable to point to your backend

## Troubleshooting

- **Build Failures**: Check the build logs in the Render dashboard
- **Routing Issues**: Ensure the `_redirects` file is in the `public` directory
- **API Connection Issues**: Verify your environment variables are set correctly

## Updating Your Deployment

Any new commits pushed to your connected Git repository will automatically trigger a new build and deployment on Render.
