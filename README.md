# Agentic Scraper UI

A modern React-based user interface for the Agentic Scraper system. This application provides a clean and intuitive interface for users to submit web scraping requests and view the results.

## 🚀 Features

- **Modern, Responsive UI**
  - Dark mode support
  - Mobile-first design
  - Accessible components
  - Smooth animations and transitions

- **Enhanced Scraping Experience**
  - Intuitive form validation
  - Real-time progress tracking
  - Error handling and retry mechanisms
  - Support for multiple data formats (JSON, CSV, Excel)

- **Data Visualization**
  - Interactive data tables with sorting and filtering
  - JSON preview with syntax highlighting
  - Image gallery for scraped media
  - Export functionality for all data formats

- **User Experience**
  - Client-side routing with React Router
  - Responsive navigation with mobile menu
  - Loading states and skeleton screens
  - Toast notifications for user feedback

## 🛠️ Tech Stack

- **Frontend**: React 18, TypeScript, Vite
- **Styling**: CSS Modules, CSS Variables
- **State Management**: React Context API
- **Routing**: Custom Router with code-splitting
- **Build Tool**: Vite
- **Linting/Formatting**: ESLint, Prettier
- **Testing**: Jest, React Testing Library

## 🚀 Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm (v8 or higher) or yarn (v1.22 or higher)

### Installation

1. Clone the repository
   ```bash
   git clone https://github.com/yourusername/agentic-scraper-ui.git
   cd agentic-scraper-ui
   ```

2. Install dependencies
   ```bash
   npm install
   # or
   yarn install
   ```

3. Set up environment variables
   ```bash
   cp .env.example .env
   ```
   Then edit the `.env` file with your configuration.

### Available Scripts

- `npm start` or `yarn start` - Start the development server
- `npm run build` or `yarn build` - Build for production
- `npm run serve` or `yarn serve` - Serve the production build locally
- `npm run lint` or `yarn lint` - Run ESLint
- `npm run format` or `yarn format` - Format code with Prettier
- `npm test` or `yarn test` - Run tests

## 🔧 Configuration

### Environment Variables

Copy `.env.example` to `.env` and update the following variables:

```env
# App Configuration
NODE_ENV=development
PORT=3000

# API Configuration
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_USE_MOCK_DATA=false

# Feature Flags
REACT_APP_ENABLE_ANALYTICS=false
REACT_APP_ENABLE_LOGGING=true
```

## 🏗️ Project Structure

```
src/
├── assets/          # Static assets (images, fonts, etc.)
├── components/      # Reusable UI components
│   ├── common/      # Common components (buttons, inputs, etc.)
│   └── layout/      # Layout components (header, footer, etc.)
├── config/         # Application configuration
├── contexts/       # React contexts
├── hooks/          # Custom React hooks
├── pages/          # Page components
├── routes/         # Route configurations
├── services/       # API services
├── styles/         # Global styles and themes
├── types/          # TypeScript type definitions
└── utils/          # Utility functions
```

## 🚀 Deployment

### Building for Production

```bash
npm run build
# or
yarn build
```

This will create a `dist` directory with the production build.

### Serving the Production Build

```bash
npm run serve
# or
yarn serve
```

This will start a production server on port 8080 by default.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

Copyright © 2025 Ncompass-Tv. All rights reserved.

## 🙏 Acknowledgments

- [React](https://reactjs.org/)
- [TypeScript](https://www.typescriptlang.org/)
- [Vite](https://vitejs.dev/)
- And all the amazing open-source libraries used in this project
