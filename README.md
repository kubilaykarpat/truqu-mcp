# Truqu MCP Server

A skeleton Model Context Protocol (MCP) server built with TypeScript.

## What is MCP?

The Model Context Protocol (MCP) is an open standard that enables AI applications to securely connect to external data sources and tools. This server provides a foundation for building custom MCP integrations.

## Features

- Built with TypeScript for type safety
- Uses the official MCP TypeScript SDK
- Includes a sample "hello" tool
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

## Development

Start the development server with hot reload:

```bash
npm run dev
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

## Running in Production

After building, start the server:

```bash
npm start
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

The server currently provides one sample tool:

- **hello**: Says hello with a custom message
  - Parameters: `name` (optional string, defaults to "World")

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
npx tsx src/index.ts
```

### Option 2: After building

1. Build the project: `npm run build`
2. Run with Node.js: `node dist/index.js`

### Client Configuration

Configure your MCP client with one of these approaches:

**For development/testing:**

- Command: `npx tsx src/index.ts`
- Working directory: `/path/to/truqu-mcp`

**For production:**

- Command: `node dist/index.js`
- Working directory: `/path/to/truqu-mcp`

**Example Claude Desktop configuration:**

```json
{
  "mcpServers": {
    "truqu-mcp": {
      "command": "npx",
      "args": ["tsx", "src/index.ts"],
      "cwd": "/path/to/truqu-mcp"
    }
  }
}
```

## License

MIT
