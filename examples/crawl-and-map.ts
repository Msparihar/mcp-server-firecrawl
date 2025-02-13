/**
 * Example demonstrating the use of crawl and map tools
 *
 * This example shows how to:
 * 1. Crawl a website with various configurations
 * 2. Map site structure
 * 3. Extract data from multiple pages
 *
 * To run this example:
 * 1. Set your API key: export FIRECRAWL_API_KEY=your-api-key
 * 2. Build the project: npm run build
 * 3. Run the example: ts-node examples/crawl-and-map.ts
 */

import { CrawlTool } from "../src/tools/crawl.js";
import { MapTool } from "../src/tools/map.js";
import { ExtractTool } from "../src/tools/extract.js";
import { DEFAULT_ERROR_CONFIG } from "../src/error-handling.js";
import axios from "axios";

async function main() {
  // Create a test axios instance
  const axiosInstance = axios.create({
    baseURL: process.env.FIRECRAWL_API_BASE_URL || "https://api.firecrawl.dev/v1",
    headers: {
      Authorization: `Bearer ${process.env.FIRECRAWL_API_KEY}`,
      "Content-Type": "application/json",
    },
  });

  // Initialize tools
  const toolOptions = {
    axiosInstance,
    errorConfig: DEFAULT_ERROR_CONFIG,
  };

  const crawlTool = new CrawlTool(toolOptions);
  const mapTool = new MapTool(toolOptions);
  const extractTool = new ExtractTool(toolOptions);

  try {
    // Basic crawling example
    console.log("Basic crawling example:");
    const basicCrawlResult = await crawlTool.execute({
      url: "https://example.com",
      maxDepth: 2,
      limit: 10,
      ignoreSitemap: false
    });
    console.log(JSON.stringify(basicCrawlResult, null, 2));

    // Advanced crawling with filters
    console.log("\nAdvanced crawling example:");
    const advancedCrawlResult = await crawlTool.execute({
      url: "https://example.com",
      maxDepth: 3,
      excludePaths: ["/admin", "/private", "/login"],
      includePaths: ["/blog", "/products"],
      ignoreQueryParameters: true,
      limit: 20,
      allowBackwardLinks: false,
      allowExternalLinks: false,
      scrapeOptions: {
        formats: ["markdown"]
      }
    });
    console.log(JSON.stringify(advancedCrawlResult, null, 2));

    // Site mapping example
    console.log("\nSite mapping example:");
    const mapResult = await mapTool.execute({
      url: "https://example.com",
      includeSubdomains: true,
      limit: 100,
      ignoreSitemap: false
    });
    console.log(JSON.stringify(mapResult, null, 2));

    // Targeted mapping with search
    console.log("\nTargeted mapping example:");
    const targetedMapResult = await mapTool.execute({
      url: "https://example.com",
      search: "products",
      sitemapOnly: true,
      limit: 50
    });
    console.log(JSON.stringify(targetedMapResult, null, 2));

    // Extract data from crawled pages
    console.log("\nBulk data extraction example:");
    const extractResult = await extractTool.execute({
      urls: [
        "https://example.com/products/1",
        "https://example.com/products/2",
        "https://example.com/products/3"
      ],
      prompt: "Extract product information including name, price, and description",
      schema: {
        type: "object",
        properties: {
          name: { type: "string" },
          price: { type: "number" },
          description: { type: "string" },
          specifications: {
            type: "object",
            additionalProperties: true
          }
        },
        required: ["name", "price"]
      },
      enableWebSearch: false
    });
    console.log(JSON.stringify(extractResult, null, 2));

  } catch (error) {
    console.error("Error running examples:", error);
    process.exit(1);
  }
}

// Check for API key
if (!process.env.FIRECRAWL_API_KEY) {
  console.error("Error: FIRECRAWL_API_KEY environment variable is required");
  console.error("Please set it before running the example:");
  console.error("export FIRECRAWL_API_KEY=your-api-key");
  process.exit(1);
}

main().catch((error) => {
  console.error("Unhandled error:", error);
  process.exit(1);
});
