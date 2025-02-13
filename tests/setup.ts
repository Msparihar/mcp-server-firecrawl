/**
 * Test environment setup and configuration
 */
import { jest, beforeAll, afterAll } from "@jest/globals";

// Configure test environment variables
process.env.FIRECRAWL_API_KEY = "test-api-key";
process.env.FIRECRAWL_API_BASE_URL = "https://api.test.firecrawl.dev/v1";
process.env.FIRECRAWL_TIMEOUT = "1000";
process.env.FIRECRAWL_MAX_RETRIES = "0";
process.env.DEBUG = "false";

// Clean up function for after tests
export function cleanupEnvironment() {
  delete process.env.FIRECRAWL_API_KEY;
  delete process.env.FIRECRAWL_API_BASE_URL;
  delete process.env.FIRECRAWL_TIMEOUT;
  delete process.env.FIRECRAWL_MAX_RETRIES;
  delete process.env.DEBUG;
}

// Store original console methods
const originalConsoleError = console.error;
const originalConsoleWarn = console.warn;
const originalConsoleLog = console.log;

// Mock console methods to reduce noise in tests
const mockConsole = {
  error: jest.fn(),
  warn: jest.fn(),
  log: jest.fn(),
};

beforeAll(() => {
  // Replace console methods with mocks
  console.error = mockConsole.error;
  console.warn = mockConsole.warn;
  console.log = mockConsole.log;
});

afterAll(() => {
  // Restore original console methods
  console.error = originalConsoleError;
  console.warn = originalConsoleWarn;
  console.log = originalConsoleLog;
  cleanupEnvironment();
});

// Export mocks for test usage
export const consoleMocks = mockConsole;
