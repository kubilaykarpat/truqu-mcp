#!/usr/bin/env node

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
    CallToolRequestSchema,
    ListToolsRequestSchema,
    Tool,
} from "@modelcontextprotocol/sdk/types.js";
import { readFileSync } from "fs";
import { resolve } from "path";

interface TruquUser {
    id: string;
    name: string;
    email: string;
    avatar: string;
}

interface TruquGoal {
    id: string;
    title: string;
    body: string;
    created: string;
    due: string | null;
    status: {
        type: string;
        date?: string;
    };
    owner: TruquUser;
    shared_with: TruquUser[];
    action_points: any[];
    items: any[];
}

interface TruquReview {
    id: string;
    subject: string;
    date: string;
    input: string[];
    professional: TruquUser;
    reviewer: {
        internal?: TruquUser;
        external?: string;
    };
}

interface TruquReflection {
    id: string;
    title: string;
    created: string;
    date_range: {
        from: string;
        to: string;
    };
    input: (string | number)[];
    user: TruquUser;
    assessors: Array<{
        assessed: boolean;
        reviewer: {
            internal?: TruquUser;
        };
    }>;
}

interface TruquData {
    user: TruquUser;
    goals: TruquGoal[];
    reviews: TruquReview[];
    reflections: TruquReflection[];
}

class TruquMCPServer {
    private server: Server;
    private truquData: TruquData | null = null;
    private dataFilePath: string;

    constructor(dataFilePath: string) {
        this.dataFilePath = dataFilePath;
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

    private loadTruquData(): TruquData {
        try {
            const fullPath = resolve(this.dataFilePath);
            const fileContent = readFileSync(fullPath, 'utf-8');
            const data = JSON.parse(fileContent) as TruquData;

            if (!data.user || !data.goals || !data.reviews || !data.reflections) {
                throw new Error("Invalid Truqu data format");
            }

            return data;
        } catch (error) {
            throw new Error(`Failed to load Truqu data from ${this.dataFilePath}: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    private async initializeData(): Promise<void> {
        try {
            this.truquData = this.loadTruquData();
            console.error(`Successfully loaded Truqu data for user: ${this.truquData.user.name} (${this.truquData.user.email})`);
        } catch (error) {
            console.error(`Failed to initialize Truqu data: ${error instanceof Error ? error.message : 'Unknown error'}`);
            throw error;
        }
    }

    private filterByDateRange(items: any[], startDate?: string, endDate?: string, dateField: string = 'created'): any[] {
        if (!startDate && !endDate) {
            return items;
        }

        return items.filter(item => {
            const itemDate = item[dateField];
            if (!itemDate) return true;

            const date = new Date(itemDate);

            if (startDate && date < new Date(startDate)) {
                return false;
            }

            if (endDate && date > new Date(endDate)) {
                return false;
            }

            return true;
        });
    }

    private filterUserGoals(goals: TruquGoal[], userId: string): TruquGoal[] {
        return goals.filter(goal => goal.owner.id === userId);
    }

    private filterUserReviews(reviews: TruquReview[], userId: string): TruquReview[] {
        return reviews.filter(review => review.professional.id === userId);
    }

    private filterUserReflections(reflections: TruquReflection[], userId: string): TruquReflection[] {
        return reflections.filter(reflection => reflection.user.id === userId);
    }

    private setupToolHandlers(): void {
        // List available tools
        this.server.setRequestHandler(ListToolsRequestSchema, async () => {
            return {
                tools: [
                    {
                        name: "get_goals_list",
                        description: "Get a list of user's goals with basic information (name, id, dates)",
                        inputSchema: {
                            type: "object",
                            properties: {
                                startDate: {
                                    type: "string",
                                    description: "Start date for filtering (ISO format: YYYY-MM-DD)",
                                },
                                endDate: {
                                    type: "string",
                                    description: "End date for filtering (ISO format: YYYY-MM-DD)",
                                },
                            },
                        },
                    },
                    {
                        name: "get_goals_detailed",
                        description: "Get detailed information about user's goals",
                        inputSchema: {
                            type: "object",
                            properties: {
                                startDate: {
                                    type: "string",
                                    description: "Start date for filtering (ISO format: YYYY-MM-DD)",
                                },
                                endDate: {
                                    type: "string",
                                    description: "End date for filtering (ISO format: YYYY-MM-DD)",
                                },
                            },
                        },
                    },
                    {
                        name: "get_goal_by_id",
                        description: "Get a specific goal by its ID",
                        inputSchema: {
                            type: "object",
                            properties: {
                                goalId: {
                                    type: "string",
                                    description: "The ID of the goal to retrieve",
                                },
                            },
                            required: ["goalId"],
                        },
                    },
                    {
                        name: "get_feedback",
                        description: "Get feedback/reviews given to the user",
                        inputSchema: {
                            type: "object",
                            properties: {
                                startDate: {
                                    type: "string",
                                    description: "Start date for filtering (ISO format: YYYY-MM-DD)",
                                },
                                endDate: {
                                    type: "string",
                                    description: "End date for filtering (ISO format: YYYY-MM-DD)",
                                },
                            },
                        },
                    },
                    {
                        name: "get_reflections",
                        description: "Get user's reflection reports",
                        inputSchema: {
                            type: "object",
                            properties: {
                                startDate: {
                                    type: "string",
                                    description: "Start date for filtering (ISO format: YYYY-MM-DD)",
                                },
                                endDate: {
                                    type: "string",
                                    description: "End date for filtering (ISO format: YYYY-MM-DD)",
                                },
                            },
                        },
                    },
                ] satisfies Tool[],
            };
        });

        // Handle tool calls
        this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
            const { name, arguments: args } = request.params;

            switch (name) {
                case "get_goals_list": {
                    if (!this.truquData) {
                        return {
                            content: [
                                {
                                    type: "text",
                                    text: "Truqu data not available. Please check server configuration.",
                                },
                            ],
                        };
                    }

                    const { startDate, endDate } = args as { startDate?: string; endDate?: string };

                    let userGoals = this.filterUserGoals(this.truquData.goals, this.truquData.user.id);
                    userGoals = this.filterByDateRange(userGoals, startDate, endDate, 'created');

                    const goalsList = userGoals.map(goal => ({
                        id: goal.id,
                        title: goal.title,
                        created: goal.created,
                        due: goal.due,
                        status: goal.status.type,
                    }));

                    return {
                        content: [
                            {
                                type: "text",
                                text: JSON.stringify(goalsList, null, 2),
                            },
                        ],
                    };
                }

                case "get_goals_detailed": {
                    if (!this.truquData) {
                        return {
                            content: [
                                {
                                    type: "text",
                                    text: "Truqu data not available. Please check server configuration.",
                                },
                            ],
                        };
                    }

                    const { startDate, endDate } = args as { startDate?: string; endDate?: string };

                    let userGoals = this.filterUserGoals(this.truquData.goals, this.truquData.user.id);
                    userGoals = this.filterByDateRange(userGoals, startDate, endDate, 'created');

                    return {
                        content: [
                            {
                                type: "text",
                                text: JSON.stringify(userGoals, null, 2),
                            },
                        ],
                    };
                }

                case "get_goal_by_id": {
                    if (!this.truquData) {
                        return {
                            content: [
                                {
                                    type: "text",
                                    text: "Truqu data not available. Please check server configuration.",
                                },
                            ],
                        };
                    }

                    const { goalId } = args as { goalId: string };

                    const userGoals = this.filterUserGoals(this.truquData.goals, this.truquData.user.id);
                    const goal = userGoals.find(g => g.id === goalId);

                    if (!goal) {
                        return {
                            content: [
                                {
                                    type: "text",
                                    text: `Goal with ID ${goalId} not found or not owned by current user.`,
                                },
                            ],
                        };
                    }

                    return {
                        content: [
                            {
                                type: "text",
                                text: JSON.stringify(goal, null, 2),
                            },
                        ],
                    };
                }

                case "get_feedback": {
                    if (!this.truquData) {
                        return {
                            content: [
                                {
                                    type: "text",
                                    text: "Truqu data not available. Please check server configuration.",
                                },
                            ],
                        };
                    }

                    const { startDate, endDate } = args as { startDate?: string; endDate?: string };

                    let userReviews = this.filterUserReviews(this.truquData.reviews, this.truquData.user.id);
                    userReviews = this.filterByDateRange(userReviews, startDate, endDate, 'date');

                    return {
                        content: [
                            {
                                type: "text",
                                text: JSON.stringify(userReviews, null, 2),
                            },
                        ],
                    };
                }

                case "get_reflections": {
                    if (!this.truquData) {
                        return {
                            content: [
                                {
                                    type: "text",
                                    text: "Truqu data not available. Please check server configuration.",
                                },
                            ],
                        };
                    }

                    const { startDate, endDate } = args as { startDate?: string; endDate?: string };

                    let userReflections = this.filterUserReflections(this.truquData.reflections, this.truquData.user.id);
                    userReflections = this.filterByDateRange(userReflections, startDate, endDate, 'created');

                    return {
                        content: [
                            {
                                type: "text",
                                text: JSON.stringify(userReflections, null, 2),
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
        // Initialize data first
        await this.initializeData();

        const transport = new StdioServerTransport();
        await this.server.connect(transport);
        console.error("Truqu MCP server running on stdio");
    }
}

// Get data file path from command line arguments or environment variable
const dataFilePath = process.argv[2] || process.env.TRUQU_DATA_PATH;

if (!dataFilePath) {
    console.error("Error: Truqu data file path is required.");
    console.error("Usage: node dist/index.js <path-to-truqu-data.json>");
    console.error("Or set TRUQU_DATA_PATH environment variable");
    process.exit(1);
}

// Start the server
const server = new TruquMCPServer(dataFilePath);
server.run().catch((error) => {
    console.error("Failed to start server:", error);
    process.exit(1);
});
