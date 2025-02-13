import { AxiosInstance } from "axios";
import { ErrorHandlingConfig, retryRequest } from "../error-handling.js";
import { SearchContentArgs } from "../types.js";

/**
 * Options for configuring the search tool
 */
export interface SearchToolOptions {
  /** Axios instance for making requests */
  axiosInstance: AxiosInstance;
  /** Error handling configuration */
  errorConfig: ErrorHandlingConfig;
}

/**
 * Handles content search operations
 */
export class SearchTool {
  private axiosInstance: AxiosInstance;
  private errorConfig: ErrorHandlingConfig;

  constructor(options: SearchToolOptions) {
    this.axiosInstance = options.axiosInstance;
    this.errorConfig = options.errorConfig;
  }

  /**
   * Get the tool definition for registration
   */
  getDefinition() {
    return {
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
          lang: {
            type: "string",
            description: "Language code",
            default: "en",
          },
          country: {
            type: "string",
            description: "Country code",
            default: "us",
          },
          location: {
            type: "string",
            description: "Location parameter",
          },
          timeout: {
            type: "number",
            description: "Request timeout in milliseconds",
            default: 60000,
          },
        },
        required: ["query"],
      },
    };
  }

  /**
   * Execute the search operation
   */
  async execute(args: SearchContentArgs) {
    const response = await retryRequest(
      () => this.axiosInstance.post("/search", args),
      this.errorConfig
    );

    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(response.data, null, 2),
        },
      ],
    };
  }

  /**
   * Validate the search operation arguments
   */
  validate(args: unknown): args is SearchContentArgs {
    if (typeof args !== "object" || args === null) {
      return false;
    }

    const { query, scrapeOptions, limit } = args as any;

    if (typeof query !== "string") {
      return false;
    }

    if (scrapeOptions !== undefined) {
      if (
        typeof scrapeOptions !== "object" ||
        scrapeOptions === null ||
        (scrapeOptions.formats !== undefined &&
          (!Array.isArray(scrapeOptions.formats) ||
            !scrapeOptions.formats.every((f: any) => typeof f === "string")))
      ) {
        return false;
      }
    }

    if (limit !== undefined && typeof limit !== "number") {
      return false;
    }

    return true;
  }

  /**
   * Process search results with optional formatting
   * @private
   */
  private processResults(results: any[], format = "markdown") {
    if (format === "markdown") {
      return results.map((result) => ({
        title: result.title,
        url: result.url,
        snippet: result.snippet,
        content: result.content,
      }));
    }
    return results;
  }
}
