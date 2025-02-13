import { AxiosInstance } from "axios";
import { ErrorHandlingConfig, retryRequest } from "../error-handling.js";
import { ExtractArgs } from "../types.js";

/**
 * Options for configuring the extract tool
 */
export interface ExtractToolOptions {
  /** Axios instance for making requests */
  axiosInstance: AxiosInstance;
  /** Error handling configuration */
  errorConfig: ErrorHandlingConfig;
}

/**
 * Interface for extraction results
 */
interface ExtractionResult {
  url: string;
  data: Record<string, any>;
  error?: string;
}

/**
 * Handles data extraction operations
 */
export class ExtractTool {
  private axiosInstance: AxiosInstance;
  private errorConfig: ErrorHandlingConfig;

  constructor(options: ExtractToolOptions) {
    this.axiosInstance = options.axiosInstance;
    this.errorConfig = options.errorConfig;
  }

  /**
   * Get the tool definition for registration
   */
  getDefinition() {
    return {
      name: "extract",
      description: "Extracts structured data from URLs",
      inputSchema: {
        type: "object",
        properties: {
          urls: {
            type: "array",
            items: { type: "string" },
            description: "URLs to extract from",
          },
          prompt: {
            type: "string",
            description: "Extraction guidance prompt",
          },
          schema: {
            type: "object",
            description: "Data structure schema",
          },
          enableWebSearch: {
            type: "boolean",
            description: "Use web search for additional data",
            default: false,
          },
          ignoreSitemap: {
            type: "boolean",
            description: "Ignore sitemap.xml during processing",
          },
          includeSubdomains: {
            type: "boolean",
            description: "Include subdomains in processing",
          },
        },
        required: ["urls"],
      },
    };
  }

  /**
   * Execute the extract operation
   */
  async execute(args: ExtractArgs) {
    const response = await retryRequest(
      () => this.axiosInstance.post("/extract", args),
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
   * Validate the extract operation arguments
   */
  validate(args: unknown): args is ExtractArgs {
    if (typeof args !== "object" || args === null) {
      return false;
    }

    const {
      urls,
      prompt,
      schema,
      enableWebSearch,
      ignoreSitemap,
      includeSubdomains,
    } = args as any;

    if (!Array.isArray(urls) || !urls.every((url) => typeof url === "string")) {
      return false;
    }

    if (prompt !== undefined && typeof prompt !== "string") {
      return false;
    }

    if (schema !== undefined && (typeof schema !== "object" || schema === null)) {
      return false;
    }

    if (enableWebSearch !== undefined && typeof enableWebSearch !== "boolean") {
      return false;
    }

    if (ignoreSitemap !== undefined && typeof ignoreSitemap !== "boolean") {
      return false;
    }

    if (includeSubdomains !== undefined && typeof includeSubdomains !== "boolean") {
      return false;
    }

    return true;
  }

  /**
   * Process a single URL for extraction
   * @private
   */
  private async processUrl(
    url: string,
    options: {
      prompt?: string;
      schema?: object;
    }
  ): Promise<ExtractionResult> {
    try {
      const response = await this.axiosInstance.post("/extract", {
        urls: [url],
        ...options,
      });

      return {
        url,
        data: response.data,
      };
    } catch (error) {
      return {
        url,
        data: {},
        error: error instanceof Error ? error.message : "Unknown error occurred",
      };
    }
  }

  /**
   * Process multiple URLs in parallel with rate limiting
   * @private
   */
  private async processBatch(
    urls: string[],
    options: {
      prompt?: string;
      schema?: object;
      batchSize?: number;
      delayMs?: number;
    }
  ): Promise<ExtractionResult[]> {
    const { batchSize = 5, delayMs = 1000 } = options;
    const results: ExtractionResult[] = [];

    for (let i = 0; i < urls.length; i += batchSize) {
      const batch = urls.slice(i, i + batchSize);
      const batchPromises = batch.map(url =>
        this.processUrl(url, {
          prompt: options.prompt,
          schema: options.schema,
        })
      );

      results.push(...await Promise.all(batchPromises));

      if (i + batchSize < urls.length) {
        await new Promise(resolve => setTimeout(resolve, delayMs));
      }
    }

    return results;
  }
}
