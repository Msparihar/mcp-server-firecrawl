import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { ListToolsRequestSchema } from "@modelcontextprotocol/sdk/types.js";

describe("Firecrawl MCP Server Structure", () => {
  let server: Server;

  beforeEach(() => {
    server = new Server(
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
  });

  describe("Tool Schema Validation", () => {
    it("should define required tools", async () => {
      const handler = server["requestHandlers"].get(ListToolsRequestSchema.name);
      expect(handler).toBeDefined();
      if (!handler) throw new Error("Handler not found");

      const result = await handler({
        schema: ListToolsRequestSchema.name,
        params: {},
      });

      const tools = result.tools;
      expect(tools).toHaveLength(2);

      const scrapeUrlTool = tools.find((t) => t.name === "scrape_url");
      expect(scrapeUrlTool).toBeDefined();
      expect(scrapeUrlTool?.inputSchema.required).toContain("url");

      const searchContentTool = tools.find((t) => t.name === "search_content");
      expect(searchContentTool).toBeDefined();
      expect(searchContentTool?.inputSchema.required).toContain("query");
    });

    it("should have valid schema for scrape_url tool", async () => {
      const handler = server["requestHandlers"].get(ListToolsRequestSchema.name);
      if (!handler) throw new Error("Handler not found");

      const result = await handler({
        schema: ListToolsRequestSchema.name,
        params: {},
      });

      const tool = result.tools.find((t) => t.name === "scrape_url");
      expect(tool).toBeDefined();
      expect(tool?.inputSchema.properties).toHaveProperty("url");
      expect(tool?.inputSchema.properties).toHaveProperty("jsonOptions");
      expect(tool?.inputSchema.properties).toHaveProperty("formats");
      expect(tool?.inputSchema.properties).toHaveProperty("blockAds");
    });

    it("should have valid schema for search_content tool", async () => {
      const handler = server["requestHandlers"].get(ListToolsRequestSchema.name);
      if (!handler) throw new Error("Handler not found");

      const result = await handler({
        schema: ListToolsRequestSchema.name,
        params: {},
      });

      const tool = result.tools.find((t) => t.name === "search_content");
      expect(tool).toBeDefined();
      expect(tool?.inputSchema.properties).toHaveProperty("query");
      expect(tool?.inputSchema.properties).toHaveProperty("scrapeOptions");
      expect(tool?.inputSchema.properties).toHaveProperty("limit");
    });
  });

  describe("Environment Validation", () => {
    it("should check for required environment variables", () => {
      expect(() => {
        process.env.FIRECRAWL_API_KEY = "";
        // This will throw due to missing API key
        require("../src/index.js");
      }).toThrow("FIRECRAWL_API_KEY environment variable is required");
    });
  });
});
