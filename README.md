# Agentic Scraper UI

A modern React-based user interface for the Agentic Scraper system. This application provides a clean and intuitive interface for users to submit web scraping requests and view the results.

## Features

- Modern, responsive UI with dark mode
- Form validation for scraping requests
- Real-time progress tracking
- JSON preview with copy functionality
- Tabular display of scraped data
- Backend API integration

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn

### Installation

1. Clone the repository
2. Install dependencies:

```bash
npm install
# or
yarn install
```

3. Configure the backend API URL in the `.env` file:

```
REACT_APP_API_URL=http://your-backend-url/api
```

### Running the Application

```bash
npm start
# or
yarn start
```

The application will be available at [http://localhost:3000](http://localhost:3000).

### Building for Production

```bash
npm run build
# or
yarn build
```

## Connecting to the Backend

This UI is designed to work with the Agentic Scraper API. Make sure your backend is running and accessible at the URL specified in the `.env` file.

## License

Copyright © 2025 Ncompass-Tv. All rights reserved.
