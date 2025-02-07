import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";

async function example() {
  // Create a new MCP client
  const client = new Client({
    name: "firecrawl-example",
    version: "1.0.0",
  });

  // Connect to the Firecrawl MCP server
  const transport = new StdioClientTransport({
    command: "node index.js",
    env: { FIRECRAWL_API_KEY: "your-api-key-here" },
  });
  await client.connect(transport);

  try {
    // Example 1: Basic search with default options
    const result1 = await client.callTool({
      name: "search_content",
      arguments: {
        query: "latest developments in artificial intelligence",
      },
    });
    console.log("Basic search result:", result1);

    // Example 2: Advanced search with custom options
    const result2 = await client.callTool({
      name: "search_content",
      arguments: {
        query: "machine learning tutorials",
        scrapeOptions: {
          formats: ["markdown"],
        },
        limit: 5,
      },
    });
    console.log("Advanced search result:", result2);
  } catch (error) {
    console.error("Error:", error);
  } finally {
    await client.close();
  }
}

example().catch(console.error);
