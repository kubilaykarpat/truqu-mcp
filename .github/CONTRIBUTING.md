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

The package is automatically published to npm when a new git tag is created.

### Release Process:

1. **Update the version in `package.json`:**

   ```bash
   npm version patch   # for bug fixes (0.1.1 → 0.1.2)
   npm version minor   # for new features (0.1.1 → 0.2.0)
   npm version major   # for breaking changes (0.1.1 → 1.0.0)
   ```

2. **Push the changes and tag:**

   ```bash
   git push origin main --tags
   ```

3. **GitHub workflow will automatically:**
   - Install dependencies
   - Build the package (via `prepublishOnly` script)
   - Publish to npm

### Alternative Manual Process:

1. **Manually update version in `package.json`**
2. **Create and push a git tag:**
   ```bash
   git tag v0.1.3
   git push origin v0.1.3
   ```

### Version Naming Convention:

- `v0.1.3` - Bug fixes (patch)
- `v0.2.0` - New features (minor)
- `v1.0.0` - Breaking changes (major)

### Simple Workflow:

- ✅ **Standard npm versioning**: Uses `npm version` command
- ✅ **Automatic build**: `prepublishOnly` script handles building
- ✅ **Clean publishing**: Direct publish on tag creation
- ✅ **No complex logic**: Straightforward tag-to-publish workflow

## GitHub Workflows

### CI Workflow (`.github/workflows/ci.yml`)

- Runs on every push and pull request
- Tests on Node.js 18, 20, and 22
- Builds the package and verifies artifacts
- Runs linting and tests (if present)

### Publish Workflow (`.github/workflows/publish.yml`)

- Runs when a new tag is pushed (`v*`)
- Installs dependencies
- Publishes to npm registry (build happens via `prepublishOnly` script)
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
