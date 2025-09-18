# Truqu MCP Server

A Model Context Protocol (MCP) server for interacting with Truqu goal and feedback data, built with TypeScript.

## What is MCP?

The Model Context Protocol (MCP) is an open standard that enables AI applications to securely connect to external data sources and tools. This server provides a foundation for building custom MCP integrations.

## Features

- Built with TypeScript for type safety
- Uses the official MCP TypeScript SDK
- Load and parse Truqu JSON data exports
- Filter data by user ownership automatically
- Date range filtering for goals, feedback, and reflections
- Comprehensive goal management tools
- Hot reload during development
- Production-ready build configuration

## Prerequisites

- Node.js 18 or higher
- npm or yarn

## Installation

1. Clone this repository
2. Install dependencies:

```bash
npm install
```

## Configuration

The server requires a path to your Truqu data JSON file. You can provide this in two ways:

### Method 1: Command Line Argument

```bash
# Development
npm run dev:example
# or with custom file
tsx src/index.ts "/path/to/your/truqu-data.json"

# Production
npm run start:example
# or with custom file
npm run build && node dist/index.js "/path/to/your/truqu-data.json"
```

### Method 2: Environment Variable

```bash
export TRUQU_DATA_PATH="/path/to/your/truqu-data.json"
npm run dev
```

## Development

Start the development server with hot reload:

```bash
npm run dev:example  # Uses the example data file
```

Watch for changes during development:

```bash
npm run watch
```

## Building

Build the TypeScript code to JavaScript:

```bash
npm run build
```

## Project Structure

```
truqu-mcp/
├── src/
│   └── index.ts          # Main server implementation
├── dist/                 # Built JavaScript files (after npm run build)
├── package.json          # Project configuration and dependencies
├── tsconfig.json         # TypeScript configuration
├── .gitignore           # Git ignore rules
└── README.md            # This file
```

## Available Tools

The server provides tools to interact with Truqu goal and feedback data:

### Goals

- **get_goals_list**: Get a list of user's goals with basic information (id, title, dates, status)
  - Parameters: `startDate` (optional string), `endDate` (optional string) - Date filtering in YYYY-MM-DD format
- **get_goals_detailed**: Get detailed information about user's goals including action points and items
  - Parameters: `startDate` (optional string), `endDate` (optional string) - Date filtering in YYYY-MM-DD format
- **get_goal_by_id**: Get a specific goal by its ID
  - Parameters: `goalId` (required string) - The ID of the goal to retrieve

### Feedback

- **get_feedback**: Get feedback/reviews given to the user
  - Parameters: `startDate` (optional string), `endDate` (optional string) - Date filtering in YYYY-MM-DD format

### Reflections

- **get_reflections**: Get user's reflection reports
  - Parameters: `startDate` (optional string), `endDate` (optional string) - Date filtering in YYYY-MM-DD format

## Usage Example

Once the server is running with your Truqu data configured, you can use these tools:

1. Get a list of your goals:

```javascript
// Get all goals
get_goals_list({});

// Get goals from 2024
get_goals_list({ startDate: "2024-01-01", endDate: "2024-12-31" });
```

2. Get detailed goal information:

```javascript
// Get detailed info for all goals
get_goals_detailed({});

// Get a specific goal
get_goal_by_id({ goalId: "168a7025-f6cc-41cc-abd7-087467c634ae" });
```

3. Get feedback and reflections:

```javascript
// Get all feedback
get_feedback({});

// Get reflections from 2025
get_reflections({ startDate: "2025-01-01" });
```

## Data Filtering

- The server automatically filters data to show only items owned by the current user
- Goals are filtered by the `owner.id` field
- Reviews are filtered by the `professional.id` field
- Reflections are filtered by the `user.id` field
- Date filtering uses the `created` field for goals and reflections, and the `date` field for reviews

## Extending the Server

To add new tools:

1. Add the tool definition in the `ListToolsRequestSchema` handler
2. Implement the tool logic in the `CallToolRequestSchema` handler
3. Update this README with documentation for your new tools

## MCP Client Configuration

To use this server with an MCP client, you have several options:

### Option 1: Using npx (Recommended for testing)

You can run the server directly with npx without building:

```bash
npx tsx src/index.ts "/path/to/your/truqu-data.json"
```

### Option 2: After building

1. Build the project: `npm run build`
2. Run with Node.js: `node dist/index.js "/path/to/your/truqu-data.json"`

### Client Configuration

Configure your MCP client with one of these approaches:

**For development/testing:**

- Command: `npx tsx src/index.ts "/path/to/your/truqu-data.json"`
- Working directory: `/path/to/truqu-mcp`

**For production:**

- Command: `node dist/index.js "/path/to/your/truqu-data.json"`
- Working directory: `/path/to/truqu-mcp`

**Example Claude Desktop configuration:**

```json
{
  "mcpServers": {
    "truqu-mcp": {
      "command": "npx",
      "args": ["tsx", "src/index.ts", "/path/to/your/truqu-data.json"],
      "cwd": "/path/to/truqu-mcp"
    }
  }
}
```

**Alternative with environment variable:**

```json
{
  "mcpServers": {
    "truqu-mcp": {
      "command": "npx",
      "args": ["tsx", "src/index.ts"],
      "cwd": "/path/to/truqu-mcp",
      "env": {
        "TRUQU_DATA_PATH": "/path/to/your/truqu-data.json"
      }
    }
  }
}
```

## License

MIT
