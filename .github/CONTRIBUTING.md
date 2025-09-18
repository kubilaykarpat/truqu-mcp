# Contributing to Truqu MCP Server

Thank you for your interest in contributing to the Truqu MCP Server!

## Development Setup

1. Fork and clone the repository
2. Install dependencies: `npm install`
3. Make your changes
4. Build and test: `npm run build`
5. Submit a pull request

## Scripts

- `npm run build` - Build TypeScript to JavaScript
- `npm run dev` - Run in development mode with a data file
- `npm run watch` - Watch for changes during development
- `npm run clean` - Clean build artifacts

## Publishing

The package is automatically published to npm when a new tag is created:

1. Update the version in `package.json`
2. Create and push a git tag: `git tag v0.1.2 && git push origin v0.1.2`
3. The GitHub workflow will automatically build and publish to npm

## GitHub Workflows

### CI Workflow (`.github/workflows/ci.yml`)

- Runs on every push and pull request
- Tests on Node.js 18, 20, and 22
- Builds the package and verifies artifacts
- Runs linting and tests (if present)

### Publish Workflow (`.github/workflows/publish.yml`)

- Runs when a new tag is pushed or release is published
- Builds the package
- Publishes to npm registry
- Requires `NPM_TOKEN` secret to be set in GitHub repository settings

## Setting up NPM_TOKEN Secret

To enable automatic publishing:

1. Go to [npmjs.com](https://npmjs.com) and create an access token
2. In your GitHub repository, go to Settings > Secrets and variables > Actions
3. Add a new secret named `NPM_TOKEN` with your npm access token

## Code Style

- Use TypeScript for type safety
- Follow the existing code style
- Add JSDoc comments for public APIs
- Keep the code clean and well-documented
