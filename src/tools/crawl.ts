import { AxiosInstance } from "axios";
import { ErrorHandlingConfig, retryRequest } from "../error-handling.js";
import { CrawlArgs } from "../types.js";

/**
 * Options for configuring the crawl tool
 */
export interface CrawlToolOptions {
  /** Axios instance for making requests */
  axiosInstance: AxiosInstance;
  /** Error handling configuration */
  errorConfig: ErrorHandlingConfig;
}

/**
 * Handles web crawling operations
 */
export class CrawlTool {
  private axiosInstance: AxiosInstance;
  private errorConfig: ErrorHandlingConfig;

  constructor(options: CrawlToolOptions) {
    this.axiosInstance = options.axiosInstance;
    this.errorConfig = options.errorConfig;
  }

  /**
   * Get the tool definition for registration
   */
  getDefinition() {
    return {
      name: "crawl",
      description: "Crawls a website starting from a base URL",
      inputSchema: {
        type: "object",
        properties: {
          url: {
            type: "string",
            description: "Base URL to start crawling from",
          },
          maxDepth: {
            type: "number",
            description: "Maximum crawl depth",
            default: 2,
          },
          excludePaths: {
            type: "array",
            items: { type: "string" },
            description: "URL patterns to exclude",
          },
          includePaths: {
            type: "array",
            items: { type: "string" },
            description: "URL patterns to include",
          },
          ignoreSitemap: {
            type: "boolean",
            description: "Ignore sitemap.xml during crawling",
          },
          ignoreQueryParameters: {
            type: "boolean",
            description: "Ignore URL query parameters when comparing URLs",
          },
          limit: {
            type: "number",
            description: "Maximum pages to crawl",
            default: 10000,
          },
          allowBackwardLinks: {
            type: "boolean",
            description: "Allow crawling links that point to parent directories",
          },
          allowExternalLinks: {
            type: "boolean",
            description: "Allow crawling links to external domains",
          },
          webhook: {
            type: "string",
            description: "Webhook URL for progress notifications",
          },
          scrapeOptions: {
            type: "object",
            description: "Options for scraping crawled pages",
          },
        },
        required: ["url"],
      },
    };
  }

  /**
   * Execute the crawl operation
   */
  async execute(args: CrawlArgs) {
    const response = await retryRequest(
      () => this.axiosInstance.post("/crawl", args),
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
   * Validate the crawl operation arguments
   */
  validate(args: unknown): args is CrawlArgs {
    if (typeof args !== "object" || args === null) {
      return false;
    }

    const {
      url,
      maxDepth,
      excludePaths,
      includePaths,
      limit,
      webhook,
    } = args as any;

    if (typeof url !== "string") {
      return false;
    }

    if (maxDepth !== undefined && typeof maxDepth !== "number") {
      return false;
    }

    if (
      excludePaths !== undefined &&
      (!Array.isArray(excludePaths) ||
        !excludePaths.every((path) => typeof path === "string"))
    ) {
      return false;
    }

    if (
      includePaths !== undefined &&
      (!Array.isArray(includePaths) ||
        !includePaths.every((path) => typeof path === "string"))
    ) {
      return false;
    }

    if (limit !== undefined && typeof limit !== "number") {
      return false;
    }

    if (webhook !== undefined && typeof webhook !== "string") {
      return false;
    }

    return true;
  }

  /**
   * Process and normalize URLs for crawling
   * @private
   */
  private normalizeUrl(url: string): string {
    try {
      const parsed = new URL(url);
      return parsed.toString();
    } catch {
      return url;
    }
  }

  /**
   * Check if a URL should be crawled based on patterns
   * @private
   */
  private shouldCrawl(
    url: string,
    includePaths?: string[],
    excludePaths?: string[]
  ): boolean {
    if (excludePaths?.some((pattern) => url.includes(pattern))) {
      return false;
    }

    if (includePaths?.length && !includePaths.some((pattern) => url.includes(pattern))) {
      return false;
    }

    return true;
  }
}
