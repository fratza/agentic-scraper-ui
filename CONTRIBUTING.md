# Contributing to Agentic Scraper UI

Thank you for your interest in contributing to the Agentic Scraper UI! We welcome all contributions that help improve the project.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Workflow](#development-workflow)
- [Code Style](#code-style)
- [Testing](#testing)
- [Pull Request Process](#pull-request-process)
- [Reporting Issues](#reporting-issues)
- [Feature Requests](#feature-requests)
- [License](#license)

## Code of Conduct

This project adheres to the Contributor Covenant [Code of Conduct](CODE_OF_CONDUCT.md). By participating, you are expected to uphold this code.

## Getting Started

1. **Fork** the repository on GitHub
2. **Clone** your fork locally
   ```bash
   git clone https://github.com/yourusername/agentic-scraper-ui.git
   cd agentic-scraper-ui
   ```
3. **Set up** the development environment
   ```bash
   npm install
   # or
   yarn install
   ```
4. **Create a branch** for your changes
   ```bash
   git checkout -b feature/your-feature-name
   # or
   git checkout -b fix/your-bugfix
   ```

## Development Workflow

1. **Start the development server**
   ```bash
   npm start
   # or
   yarn start
   ```
   This will start the development server at `http://localhost:3000`

2. **Make your changes** following the [Code Style](#code-style) guidelines

3. **Run tests** to ensure nothing is broken
   ```bash
   npm test
   # or
   yarn test
   ```

4. **Lint your code**
   ```bash
   npm run lint
   # or
   yarn lint
   ```

5. **Format your code**
   ```bash
   npm run format
   # or
   yarn format
   ```

6. **Commit your changes** with a descriptive commit message
   ```bash
   git add .
   git commit -m "feat: add new feature"
   ```

7. **Push** your changes to your fork
   ```bash
   git push origin your-branch-name
   ```

8. **Open a Pull Request** from your fork to the main repository

## Code Style

### General
- Use TypeScript for all new code
- Follow the [Airbnb JavaScript Style Guide](https://github.com/airbnb/javascript)
- Use functional components with hooks instead of class components
- Prefer named exports over default exports

### Naming Conventions
- **Components**: PascalCase (e.g., `UserProfile.tsx`)
- **Files and folders**: kebab-case (e.g., `user-profile.tsx`)
- **Variables and functions**: camelCase
- **Constants**: UPPER_SNAKE_CASE
- **Types and Interfaces**: PascalCase with `I` prefix for interfaces (e.g., `IUser`)

### TypeScript
- Always define types for props and state
- Use interfaces for object types
- Avoid using `any` type
- Use type guards for type narrowing

### Styling
- Use CSS Modules for component-specific styles
- Follow BEM naming convention for CSS classes
- Use CSS variables for theming and consistent styling
- Mobile-first responsive design

## Testing

### Writing Tests
- Write unit tests for utility functions and custom hooks
- Write integration tests for components
- Use React Testing Library for component testing
- Test user interactions and component behavior

### Running Tests
```bash
# Run all tests
npm test

# Run tests in watch mode
npm test -- --watch

# Run tests with coverage
npm test -- --coverage
```

## Pull Request Process

1. Fork the repository and create your branch from `main`
2. Ensure your code follows the project's code style
3. Add tests for your changes
4. Update the documentation if needed
5. Ensure all tests pass
6. Submit a pull request with a clear title and description

### PR Guidelines
- Keep PRs focused on a single feature or bug fix
- Reference any related issues in your PR description
- Include screenshots or GIFs for UI changes
- Ensure your code is properly documented

## Reporting Issues

When reporting issues, please include:
1. A clear and descriptive title
2. Steps to reproduce the issue
3. Expected vs. actual behavior
4. Browser/OS version
5. Any relevant console errors

## Feature Requests

For feature requests, please:
1. Describe the feature you'd like to see
2. Explain why this feature would be useful
3. Include any relevant examples or references

## License

By contributing, you agree that your contributions will be licensed under the project's [LICENSE](LICENSE).
