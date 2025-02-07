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
    // Example 1: Basic URL scraping
    const result1 = await client.callTool({
      name: "scrape_url",
      arguments: {
        url: "https://example.com",
        formats: ["markdown"],
        blockAds: true,
      },
    });
    console.log("Basic scraping result:", result1);

    // Example 2: Scraping with specific extraction prompt
    const result2 = await client.callTool({
      name: "scrape_url",
      arguments: {
        url: "https://example.com/blog",
        jsonOptions: {
          prompt: "Extract the main article title and content",
        },
        formats: ["markdown"],
      },
    });
    console.log("Structured extraction result:", result2);
  } catch (error) {
    console.error("Error:", error);
  } finally {
    await client.close();
  }
}

example().catch(console.error);
