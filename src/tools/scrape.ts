import { AxiosInstance } from "axios";
import { ErrorHandlingConfig, retryRequest } from "../error-handling.js";
import { ScrapeUrlArgs } from "../types.js";

/**
 * Options for configuring the scrape tool
 */
export interface ScrapeToolOptions {
  /** Axios instance for making requests */
  axiosInstance: AxiosInstance;
  /** Error handling configuration */
  errorConfig: ErrorHandlingConfig;
}

/**
 * Handles content scraping operations
 */
export class ScrapeTool {
  private axiosInstance: AxiosInstance;
  private errorConfig: ErrorHandlingConfig;

  constructor(options: ScrapeToolOptions) {
    this.axiosInstance = options.axiosInstance;
    this.errorConfig = options.errorConfig;
  }

  /**
   * Get the tool definition for registration
   */
  getDefinition() {
    return {
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
              schema: {
                type: "object",
                description: "Schema for extraction",
              },
              systemPrompt: {
                type: "string",
                description: "System prompt for extraction",
              },
            },
          },
          formats: {
            type: "array",
            items: {
              type: "string",
              enum: [
                "markdown",
                "html",
                "rawHtml",
                "links",
                "screenshot",
                "screenshot@fullPage",
                "json",
              ],
            },
            description: "Output formats",
          },
          onlyMainContent: {
            type: "boolean",
            description:
              "Only return main content excluding headers, navs, footers",
            default: true,
          },
          includeTags: {
            type: "array",
            items: { type: "string" },
            description: "Tags to include in output",
          },
          excludeTags: {
            type: "array",
            items: { type: "string" },
            description: "Tags to exclude from output",
          },
          waitFor: {
            type: "number",
            description: "Delay in milliseconds before fetching content",
            default: 0,
          },
          mobile: {
            type: "boolean",
            description: "Emulate mobile device",
            default: false,
          },
          location: {
            type: "object",
            properties: {
              country: {
                type: "string",
                description: "ISO 3166-1 alpha-2 country code",
              },
              languages: {
                type: "array",
                items: { type: "string" },
                description: "Preferred languages/locales",
              },
            },
          },
          blockAds: {
            type: "boolean",
            description: "Enable ad/cookie popup blocking",
            default: true,
          },
        },
        required: ["url"],
      },
    };
  }

  /**
   * Execute the scrape operation
   */
  async execute(args: ScrapeUrlArgs) {
    const response = await retryRequest(
      () => this.axiosInstance.post("/scrape", args),
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
   * Validate the scrape operation arguments
   */
  validate(args: unknown): args is ScrapeUrlArgs {
    if (typeof args !== "object" || args === null) {
      return false;
    }

    const { url, jsonOptions, formats } = args as any;

    if (typeof url !== "string") {
      return false;
    }

    if (jsonOptions !== undefined) {
      if (
        typeof jsonOptions !== "object" ||
        jsonOptions === null ||
        typeof jsonOptions.prompt !== "string"
      ) {
        return false;
      }
    }

    if (formats !== undefined) {
      if (
        !Array.isArray(formats) ||
        !formats.every((f) => typeof f === "string")
      ) {
        return false;
      }
    }

    return true;
  }
}
