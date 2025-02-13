import type { AxiosInstance, AxiosResponse, AxiosResponseHeaders } from "axios";
import type {
  ScrapeUrlArgs,
  SearchContentArgs,
  CrawlArgs,
  MapArgs,
  ExtractArgs,
  ToolResponse,
} from "../src/types";

declare global {
  // Extend Jest matchers
  namespace jest {
    interface Matchers<R> {
      toHaveBeenCalledWithUrl(url: string): R;
      toHaveBeenCalledWithValidArgs(
        type: "scrape" | "search" | "crawl" | "map" | "extract"
      ): R;
    }
  }
}

// Test-specific types
export interface TestResponse<T = any>
  extends Omit<AxiosResponse<T>, "headers"> {
  data: T;
  status: number;
  headers: AxiosResponseHeaders;
}

// Mock function type
type MockFunction<T extends (...args: any) => any> = {
  (...args: Parameters<T>): ReturnType<T>;
  mockClear: () => void;
  mockReset: () => void;
  mockImplementation: (fn: T) => MockFunction<T>;
  mockImplementationOnce: (fn: T) => MockFunction<T>;
  mockResolvedValue: <U>(value: U) => MockFunction<T>;
  mockResolvedValueOnce: <U>(value: U) => MockFunction<T>;
  mockRejectedValue: (error: unknown) => MockFunction<T>;
  mockRejectedValueOnce: (error: unknown) => MockFunction<T>;
};

export interface MockAxiosInstance extends Omit<AxiosInstance, "get" | "post"> {
  get: MockFunction<
    <T = any>(url: string, config?: any) => Promise<TestResponse<T>>
  >;
  post: MockFunction<
    <T = any>(url: string, data?: any, config?: any) => Promise<TestResponse<T>>
  >;
}

export interface TestToolResponse extends ToolResponse {
  error?: string;
  metadata?: Record<string, unknown>;
}

export interface TestArgs {
  scrape: ScrapeUrlArgs;
  search: SearchContentArgs;
  crawl: CrawlArgs;
  map: MapArgs;
  extract: ExtractArgs;
}

// Helper type for resolved promise types
type ResolvedType<T> = T extends Promise<infer R> ? R : T;

// Console mock types
export interface ConsoleMocks {
  error: MockFunction<typeof console.error>;
  warn: MockFunction<typeof console.warn>;
  log: MockFunction<typeof console.log>;
}

// Environment variable types
export interface TestEnvironment {
  FIRECRAWL_API_KEY: string;
  FIRECRAWL_API_BASE_URL: string;
  FIRECRAWL_TIMEOUT: string;
  FIRECRAWL_MAX_RETRIES: string;
  DEBUG: string;
}

// Extend the Jest namespace
declare global {
  namespace jest {
    type Mock<T extends (...args: any[]) => any> = MockFunction<T>;
  }
}
