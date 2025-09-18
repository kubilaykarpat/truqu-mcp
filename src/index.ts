#!/usr/bin/env node

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
    CallToolRequestSchema,
    ListToolsRequestSchema,
    Tool,
} from "@modelcontextprotocol/sdk/types.js";

class TruquMCPServer {
    private server: Server;

    constructor() {
        this.server = new Server(
            {
                name: "truqu-mcp",
                version: "0.1.0",
            },
            {
                capabilities: {
                    tools: {},
                },
            }
        );

        this.setupToolHandlers();
        this.setupErrorHandling();
    }

    private setupToolHandlers(): void {
        // List available tools
        this.server.setRequestHandler(ListToolsRequestSchema, async () => {
            return {
                tools: [
                    {
                        name: "hello",
                        description: "Say hello with a custom message",
                        inputSchema: {
                            type: "object",
                            properties: {
                                name: {
                                    type: "string",
                                    description: "Name to greet",
                                    default: "World",
                                },
                            },
                        },
                    } satisfies Tool,
                ],
            };
        });

        // Handle tool calls
        this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
            const { name, arguments: args } = request.params;

            switch (name) {
                case "hello": {
                    const name = (args as { name?: string }).name || "World";
                    return {
                        content: [
                            {
                                type: "text",
                                text: `Hello, ${name}! This is your Truqu MCP server.`,
                            },
                        ],
                    };
                }

                default:
                    throw new Error(`Unknown tool: ${name}`);
            }
        });
    }

    private setupErrorHandling(): void {
        this.server.onerror = (error) => {
            console.error("[MCP Error]", error);
        };

        process.on("SIGINT", async () => {
            await this.server.close();
            process.exit(0);
        });
    }

    async run(): Promise<void> {
        const transport = new StdioServerTransport();
        await this.server.connect(transport);
        console.error("Truqu MCP server running on stdio");
    }
}

// Start the server
const server = new TruquMCPServer();
server.run().catch((error) => {
    console.error("Failed to start server:", error);
    process.exit(1);
});
