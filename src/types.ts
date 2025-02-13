import type { Server } from "@modelcontextprotocol/sdk/server/index.js";
import type {
  ErrorCode,
  McpError,
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";

// Server types
export interface ServerConfig {
  name: string;
  version: string;
}

export interface ServerCapabilities {
  tools: Record<string, unknown>;
}

// Request/Response types
export interface RequestHandler<T> {
  (request: T): Promise<any>;
}

export interface ErrorHandler {
  (error: Error): void;
}

// Tool types
export interface ToolDefinition {
  name: string;
  description: string;
  inputSchema: {
    type: string;
    properties: Record<string, unknown>;
    required?: string[];
  };
}

export interface ToolResponse {
  content: Array<{
    type: string;
    text: string;
  }>;
}

// Re-export types from SDK
export type {
  Server,
  ErrorCode,
  McpError,
  CallToolRequestSchema,
  ListToolsRequestSchema,
};

// Configuration types
export interface FirecrawlConfig {
  apiKey: string;
  apiBaseUrl?: string;
  timeout?: number;
  maxRetries?: number;
  retryDelay?: number;
  backoffMultiplier?: number;
  maxBackoff?: number;
  debug?: boolean;
  customHeaders?: Record<string, string>;
  allowedDomains?: string[];
  validateRequests?: boolean;
  logLevel?: "error" | "warn" | "info" | "debug";
  logFile?: string;
  sandbox?: boolean;
}

// Tool-specific types
export interface ScrapeUrlArgs {
  url: string;
  jsonOptions?: {
    prompt: string;
    schema?: object;
    systemPrompt?: string;
  };
  formats?: string[];
  onlyMainContent?: boolean;
  includeTags?: string[];
  excludeTags?: string[];
  waitFor?: number;
  mobile?: boolean;
  location?: {
    country?: string;
    languages?: string[];
  };
  blockAds?: boolean;
  removeBase64Images?: boolean;
}

export interface SearchContentArgs {
  query: string;
  scrapeOptions?: {
    formats?: string[];
  };
  limit?: number;
  lang?: string;
  country?: string;
  location?: string;
  timeout?: number;
}

export interface CrawlArgs {
  url: string;
  maxDepth?: number;
  excludePaths?: string[];
  includePaths?: string[];
  ignoreSitemap?: boolean;
  ignoreQueryParameters?: boolean;
  limit?: number;
  allowBackwardLinks?: boolean;
  allowExternalLinks?: boolean;
  webhook?: string;
  scrapeOptions?: Record<string, unknown>;
}

export interface MapArgs {
  url: string;
  search?: string;
  ignoreSitemap?: boolean;
  sitemapOnly?: boolean;
  includeSubdomains?: boolean;
  limit?: number;
  timeout?: number;
}

export interface ExtractArgs {
  urls: string[];
  prompt?: string;
  schema?: object;
  enableWebSearch?: boolean;
  ignoreSitemap?: boolean;
  includeSubdomains?: boolean;
}

// Type guards
export const isScrapeUrlArgs = (args: unknown): args is ScrapeUrlArgs => {
  if (typeof args !== "object" || args === null) {
    return false;
  }

  const { url, jsonOptions, formats } = args as ScrapeUrlArgs;

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
};

export const isSearchContentArgs = (
  args: unknown
): args is SearchContentArgs => {
  if (typeof args !== "object" || args === null) {
    return false;
  }

  const { query, scrapeOptions, limit } = args as SearchContentArgs;

  if (typeof query !== "string") {
    return false;
  }

  if (scrapeOptions !== undefined) {
    if (
      typeof scrapeOptions !== "object" ||
      scrapeOptions === null ||
      (scrapeOptions.formats !== undefined &&
        (!Array.isArray(scrapeOptions.formats) ||
          !scrapeOptions.formats.every((f) => typeof f === "string")))
    ) {
      return false;
    }
  }

  if (limit !== undefined && typeof limit !== "number") {
    return false;
  }

  return true;
};

export const isCrawlArgs = (args: unknown): args is CrawlArgs => {
  if (typeof args !== "object" || args === null) {
    return false;
  }

  const { url } = args as CrawlArgs;
  return typeof url === "string";
};

export const isMapArgs = (args: unknown): args is MapArgs => {
  if (typeof args !== "object" || args === null) {
    return false;
  }

  const { url } = args as MapArgs;
  return typeof url === "string";
};

export const isExtractArgs = (args: unknown): args is ExtractArgs => {
  if (typeof args !== "object" || args === null) {
    return false;
  }

  const { urls } = args as ExtractArgs;
  return Array.isArray(urls) && urls.every((url) => typeof url === "string");
};
