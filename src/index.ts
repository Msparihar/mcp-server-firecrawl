#!/usr/bin/env node

/**
 * Firecrawl MCP Server
 * A Model Context Protocol server for web scraping and content searching using the Firecrawl API.
 *
 * @packageDocumentation
 */

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ErrorCode,
  ListToolsRequestSchema,
  McpError,
} from "@modelcontextprotocol/sdk/types.js";
import axios from "axios";

/** API key for Firecrawl service */
const API_KEY = process.env.FIRECRAWL_API_KEY;
if (!API_KEY) {
  throw new Error("FIRECRAWL_API_KEY environment variable is required");
}

/**
 * Arguments for the scrape_url tool
 */
interface ScrapeUrlArgs {
  /** URL to scrape content from */
  url: string;
  /** Options for JSON extraction */
  jsonOptions?: {
    /** Prompt for extracting specific information */
    prompt: string;
  };
  /** Output formats (e.g. ["markdown"]) */
  formats?: string[];
  /** Custom scraping actions to perform */
  actions?: string[];
  /** Whether to block ads during scraping */
  blockAds?: boolean;
}

/**
 * Arguments for the search_content tool
 */
interface SearchContentArgs {
  /** Search query string */
  query: string;
  /** Options for scraping search results */
  scrapeOptions?: {
    /** Output formats (e.g. ["markdown"]) */
    formats?: string[];
  };
  /** Maximum number of search results (1-100) */
  limit?: number;
}

/**
 * Type guard for ScrapeUrlArgs
 */
const isScrapeUrlArgs = (args: any): args is ScrapeUrlArgs =>
  typeof args === "object" &&
  args !== null &&
  typeof args.url === "string" &&
  (args.jsonOptions === undefined ||
    (typeof args.jsonOptions === "object" &&
      args.jsonOptions !== null &&
      typeof args.jsonOptions.prompt === "string")) &&
  (args.formats === undefined ||
    (Array.isArray(args.formats) &&
      args.formats.every((f: any) => typeof f === "string"))) &&
  (args.actions === undefined ||
    (Array.isArray(args.actions) &&
      args.actions.every((a: any) => typeof a === "string"))) &&
  (args.blockAds === undefined || typeof args.blockAds === "boolean");

/**
 * Type guard for SearchContentArgs
 */
const isSearchContentArgs = (args: any): args is SearchContentArgs =>
  typeof args === "object" &&
  args !== null &&
  typeof args.query === "string" &&
  (args.scrapeOptions === undefined ||
    (typeof args.scrapeOptions === "object" &&
      args.scrapeOptions !== null &&
      (args.scrapeOptions.formats === undefined ||
        (Array.isArray(args.scrapeOptions.formats) &&
          args.scrapeOptions.formats.every(
            (f: any) => typeof f === "string"
          ))))) &&
  (args.limit === undefined || typeof args.limit === "number");

/**
 * Main server class for the Firecrawl MCP implementation
 */
class FirecrawlServer {
  private server: Server;
  private axiosInstance;

  constructor() {
    this.server = new Server(
      {
        name: "firecrawl",
        version: "1.0.0",
      },
      {
        capabilities: {
          tools: {},
        },
      }
    );

    this.axiosInstance = axios.create({
      baseURL: "https://api.firecrawl.dev/v1",
      headers: {
        Authorization: `Bearer ${API_KEY}`,
        "Content-Type": "application/json",
      },
    });

    this.setupToolHandlers();

    this.server.onerror = (error) => console.error("[MCP Error]", error);
    process.on("SIGINT", async () => {
      await this.server.close();
      process.exit(0);
    });
  }

  /**
   * Set up the tool handlers for scraping and searching
   */
  private setupToolHandlers() {
    this.server.setRequestHandler(ListToolsRequestSchema, async () => ({
      tools: [
        {
          name: "scrape_url",
          description: "Scrape content from a URL using Firecrawl API",
          inputSchema: {
            type: "object",
            properties: {
              url: {
                type: "string",
                description: "URL to scrape",
              },
              jsonOptions: {
                type: "object",
                properties: {
                  prompt: {
                    type: "string",
                    description: "Prompt for extracting specific information",
                  },
                },
                required: ["prompt"],
              },
              formats: {
                type: "array",
                items: {
                  type: "string",
                  enum: ["markdown"],
                },
                description: "Output formats",
              },
              actions: {
                type: "array",
                items: {
                  type: "string",
                },
                description: "Actions to perform",
              },
              blockAds: {
                type: "boolean",
                description: "Whether to block ads during scraping",
              },
            },
            required: ["url"],
          },
        },
        {
          name: "search_content",
          description: "Search content using Firecrawl API",
          inputSchema: {
            type: "object",
            properties: {
              query: {
                type: "string",
                description: "Search query",
              },
              scrapeOptions: {
                type: "object",
                properties: {
                  formats: {
                    type: "array",
                    items: {
                      type: "string",
                      enum: ["markdown"],
                    },
                    description: "Output formats",
                  },
                },
              },
              limit: {
                type: "number",
                description: "Maximum number of results",
                minimum: 1,
                maximum: 100,
              },
            },
            required: ["query"],
          },
        },
      ],
    }));

    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      if (request.params.name === "scrape_url") {
        if (!isScrapeUrlArgs(request.params.arguments)) {
          throw new McpError(
            ErrorCode.InvalidParams,
            "Invalid scrape_url arguments"
          );
        }

        try {
          const response = await this.axiosInstance.post(
            "/scrape",
            request.params.arguments
          );
          return {
            content: [
              {
                type: "text",
                text: JSON.stringify(response.data, null, 2),
              },
            ],
          };
        } catch (error) {
          if (axios.isAxiosError(error)) {
            throw new McpError(
              ErrorCode.InternalError,
              `Firecrawl API error: ${
                error.response?.data.message ?? error.message
              }`
            );
          }
          throw error;
        }
      }

      if (request.params.name === "search_content") {
        if (!isSearchContentArgs(request.params.arguments)) {
          throw new McpError(
            ErrorCode.InvalidParams,
            "Invalid search_content arguments"
          );
        }

        try {
          const response = await this.axiosInstance.post(
            "/search",
            request.params.arguments
          );
          return {
            content: [
              {
                type: "text",
                text: JSON.stringify(response.data, null, 2),
              },
            ],
          };
        } catch (error) {
          if (axios.isAxiosError(error)) {
            throw new McpError(
              ErrorCode.InternalError,
              `Firecrawl API error: ${
                error.response?.data.message ?? error.message
              }`
            );
          }
          throw error;
        }
      }

      throw new McpError(
        ErrorCode.MethodNotFound,
        `Unknown tool: ${request.params.name}`
      );
    });
  }

  /**
   * Start the MCP server
   */
  async run() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error("Firecrawl MCP server running on stdio");
  }
}

const server = new FirecrawlServer();
server.run().catch(console.error);
