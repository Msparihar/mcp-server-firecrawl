import { ErrorCode, McpError } from "@modelcontextprotocol/sdk/types.js";
import type { AxiosError } from "axios";
import axios from "axios";

/**
 * Types of errors that can occur in Firecrawl operations
 */
export enum FirecrawlErrorType {
  /** Rate limit exceeded */
  RateLimit = "RATE_LIMIT",
  /** Invalid input parameters */
  InvalidInput = "INVALID_INPUT",
  /** Network or connection error */
  NetworkError = "NETWORK_ERROR",
  /** API-related error */
  APIError = "API_ERROR",
}

/**
 * Configuration for error handling and retries
 */
export interface ErrorHandlingConfig {
  /** Maximum number of retry attempts */
  maxRetries: number;
  /** Initial delay between retries in milliseconds */
  retryDelay: number;
  /** Multiplier for exponential backoff */
  backoffMultiplier: number;
  /** Maximum delay between retries in milliseconds */
  maxBackoff: number;
  /** Enable debug logging */
  debug: boolean;
}

/**
 * Default configuration for error handling
 */
export const DEFAULT_ERROR_CONFIG: ErrorHandlingConfig = {
  maxRetries: 3,
  retryDelay: 1000,
  backoffMultiplier: 2,
  maxBackoff: 8000,
  debug: false,
};

interface ApiErrorResponse {
  message?: string;
  error?: string;
  code?: string;
}

/**
 * Converts API errors to standardized MCP errors
 */
export const handleError = (error: unknown, debug = false): McpError => {
  if (debug) {
    console.error("[Debug] Error details:", error);
  }

  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError<ApiErrorResponse>;
    const status = axiosError.response?.status;
    const responseData = axiosError.response?.data;
    const message =
      responseData?.message || responseData?.error || axiosError.message;

    switch (status) {
      case 429:
        return new McpError(
          ErrorCode.InvalidRequest,
          `Rate limit exceeded: ${message}`
        );
      case 401:
        return new McpError(
          ErrorCode.InvalidParams,
          `Invalid API key: ${message}`
        );
      case 400:
        return new McpError(
          ErrorCode.InvalidParams,
          `Invalid request: ${message}`
        );
      case 404:
        return new McpError(
          ErrorCode.InvalidRequest,
          `Resource not found: ${message}`
        );
      default:
        return new McpError(ErrorCode.InternalError, `API error: ${message}`);
    }
  }

  if (error instanceof Error) {
    return new McpError(ErrorCode.InternalError, error.message);
  }

  return new McpError(ErrorCode.InternalError, "An unknown error occurred");
};

/**
 * Determines if a request should be retried based on the error
 */
export const shouldRetry = (
  error: unknown,
  retryCount: number,
  config: ErrorHandlingConfig
): boolean => {
  if (retryCount >= config.maxRetries) {
    return false;
  }

  if (axios.isAxiosError(error)) {
    const status = error.response?.status;
    return (
      status === 429 || // Rate limit
      status === 500 || // Server error
      error.code === "ECONNABORTED" || // Timeout
      error.code === "ECONNRESET" // Connection reset
    );
  }

  return false;
};

/**
 * Calculates the delay for the next retry attempt
 */
export const calculateRetryDelay = (
  retryCount: number,
  config: ErrorHandlingConfig
): number => {
  const delay =
    config.retryDelay * Math.pow(config.backoffMultiplier, retryCount - 1);
  return Math.min(delay, config.maxBackoff);
};

/**
 * Retries a failed request with exponential backoff
 */
export const retryRequest = async <T>(
  requestFn: () => Promise<T>,
  config: ErrorHandlingConfig = DEFAULT_ERROR_CONFIG
): Promise<T> => {
  let retryCount = 0;
  let lastError: unknown;

  do {
    try {
      return await requestFn();
    } catch (error) {
      lastError = error;

      if (!shouldRetry(error, retryCount, config)) {
        throw handleError(error, config.debug);
      }

      retryCount++;
      const delay = calculateRetryDelay(retryCount, config);

      if (config.debug) {
        console.error(
          `[Debug] Retry ${retryCount}/${config.maxRetries}, waiting ${delay}ms`
        );
      }

      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  } while (retryCount <= config.maxRetries);

  throw handleError(lastError, config.debug);
};
