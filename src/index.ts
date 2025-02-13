#!/usr/bin/env node

/**
 * Firecrawl MCP Server
 * A Model Context Protocol server for web scraping and content searching using the Firecrawl API.
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

import {
  DEFAULT_ERROR_CONFIG,
  ErrorHandlingConfig,
  handleError,
} from "./error-handling.js";
import { ScrapeTool } from "./tools/scrape.js";
import { SearchTool } from "./tools/search.js";
import { CrawlTool } from "./tools/crawl.js";
import { MapTool } from "./tools/map.js";
import { ExtractTool } from "./tools/extract.js";
import {
  isScrapeUrlArgs,
  isSearchContentArgs,
  isCrawlArgs,
  isMapArgs,
  isExtractArgs,
} from "./types.js";

// Load and validate configuration
const config = {
  apiKey: process.env.FIRECRAWL_API_KEY,
  apiBaseUrl:
    process.env.FIRECRAWL_API_BASE_URL || "https://api.firecrawl.dev/v1",
  timeout: parseInt(process.env.FIRECRAWL_TIMEOUT || "30000"),
  maxRetries: parseInt(process.env.FIRECRAWL_MAX_RETRIES || "3"),
  retryDelay: parseInt(process.env.FIRECRAWL_RETRY_DELAY || "1000"),
  debug: process.env.DEBUG === "true",
};

if (!config.apiKey) {
  throw new Error("FIRECRAWL_API_KEY environment variable is required");
}

/**
 * Main server class for the Firecrawl MCP implementation
 */
class FirecrawlServer {
  private server: Server;
  private axiosInstance;
  private errorConfig: ErrorHandlingConfig;
  private tools: {
    scrape: ScrapeTool;
    search: SearchTool;
    crawl: CrawlTool;
    map: MapTool;
    extract: ExtractTool;
  };

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

    // Configure error handling
    this.errorConfig = {
      ...DEFAULT_ERROR_CONFIG,
      maxRetries: config.maxRetries,
      retryDelay: config.retryDelay,
      debug: config.debug,
    };

    // Configure axios instance
    this.axiosInstance = axios.create({
      baseURL: config.apiBaseUrl,
      timeout: config.timeout,
      headers: {
        Authorization: `Bearer ${config.apiKey}`,
        "Content-Type": "application/json",
      },
    });

    // Initialize tools
    const toolOptions = {
      axiosInstance: this.axiosInstance,
      errorConfig: this.errorConfig,
    };

    this.tools = {
      scrape: new ScrapeTool(toolOptions),
      search: new SearchTool(toolOptions),
      crawl: new CrawlTool(toolOptions),
      map: new MapTool(toolOptions),
      extract: new ExtractTool(toolOptions),
    };

    this.setupToolHandlers();

    // Error handling
    this.server.onerror = (error: Error) => {
      console.error("[MCP Error]", error);
      if (config.debug) {
        console.error("[Debug] Stack trace:", error.stack);
      }
    };

    process.on("SIGINT", async () => {
      await this.server.close();
      process.exit(0);
    });
  }

  /**
   * Set up the tool handlers for all operations
   */
  private setupToolHandlers() {
    this.server.setRequestHandler(ListToolsRequestSchema, async () => ({
      tools: [
        this.tools.scrape.getDefinition(),
        this.tools.search.getDefinition(),
        this.tools.crawl.getDefinition(),
        this.tools.map.getDefinition(),
        this.tools.extract.getDefinition(),
      ],
    }));

    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      try {
        const { name, arguments: args } = request.params;

        switch (name) {
          case "scrape_url": {
            if (!isScrapeUrlArgs(args)) {
              throw new McpError(
                ErrorCode.InvalidParams,
                "Invalid scrape_url arguments"
              );
            }
            return await this.tools.scrape.execute(args);
          }

          case "search_content": {
            if (!isSearchContentArgs(args)) {
              throw new McpError(
                ErrorCode.InvalidParams,
                "Invalid search_content arguments"
              );
            }
            return await this.tools.search.execute(args);
          }

          case "crawl": {
            if (!isCrawlArgs(args)) {
              throw new McpError(
                ErrorCode.InvalidParams,
                "Invalid crawl arguments"
              );
            }
            return await this.tools.crawl.execute(args);
          }

          case "map": {
            if (!isMapArgs(args)) {
              throw new McpError(
                ErrorCode.InvalidParams,
                "Invalid map arguments"
              );
            }
            return await this.tools.map.execute(args);
          }

          case "extract": {
            if (!isExtractArgs(args)) {
              throw new McpError(
                ErrorCode.InvalidParams,
                "Invalid extract arguments"
              );
            }
            return await this.tools.extract.execute(args);
          }

          default:
            throw new McpError(
              ErrorCode.MethodNotFound,
              `Unknown tool: ${name}`
            );
        }
      } catch (error) {
        throw handleError(error);
      }
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
