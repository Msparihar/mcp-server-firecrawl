import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";

// Mock axios for testing
jest.mock("axios", () => ({
  create: jest.fn(() => ({
    post: jest.fn(),
  })),
}));

describe("Firecrawl MCP Server", () => {
  let client: Client;
  let mockAxiosPost: jest.Mock;

  beforeEach(async () => {
    // Set up client
    client = new Client({
      name: "test-client",
      version: "1.0.0",
    });

    // Connect to server
    const transport = new StdioClientTransport({
      command: "node build/index.js",
      env: { FIRECRAWL_API_KEY: "test-key" },
    });
    await client.connect(transport);

    // Get mock axios instance
    mockAxiosPost = require("axios").create().post;
  });

  afterEach(async () => {
    await client.close();
    jest.clearAllMocks();
  });

  describe("scrape_url tool", () => {
    it("should make correct API call with basic options", async () => {
      const mockResponse = {
        data: {
          content: "Test content",
        },
      };
      mockAxiosPost.mockResolvedValueOnce(mockResponse);

      const result = await client.callTool({
        name: "scrape_url",
        arguments: {
          url: "https://example.com",
          formats: ["markdown"],
        },
      });

      expect(mockAxiosPost).toHaveBeenCalledWith("/scrape", {
        url: "https://example.com",
        formats: ["markdown"],
      });
      expect(result.content[0].text).toContain("Test content");
    });

    it("should handle API errors correctly", async () => {
      const mockError = {
        response: {
          data: {
            message: "API Error",
          },
        },
      };
      mockAxiosPost.mockRejectedValueOnce(mockError);

      await expect(
        client.callTool({
          name: "scrape_url",
          arguments: {
            url: "https://example.com",
          },
        })
      ).rejects.toThrow("Firecrawl API error: API Error");
    });
  });

  describe("search_content tool", () => {
    it("should make correct API call with search query", async () => {
      const mockResponse = {
        data: {
          results: [{ title: "Result 1" }, { title: "Result 2" }],
        },
      };
      mockAxiosPost.mockResolvedValueOnce(mockResponse);

      const result = await client.callTool({
        name: "search_content",
        arguments: {
          query: "test query",
          limit: 2,
        },
      });

      expect(mockAxiosPost).toHaveBeenCalledWith("/search", {
        query: "test query",
        limit: 2,
      });
      expect(result.content[0].text).toContain("Result 1");
    });

    it("should handle invalid arguments", async () => {
      await expect(
        client.callTool({
          name: "search_content",
          arguments: {
            // @ts-expect-error Testing invalid args
            invalidArg: "test",
          },
        })
      ).rejects.toThrow("Invalid search_content arguments");
    });
  });
});
