/**
 * Example demonstrating how to use the scrape_url tool
 *
 * This example shows different ways to configure and use the scraping functionality,
 * including basic scraping, structured data extraction, and mobile-optimized scraping.
 */

import { ScrapeTool } from "../src/tools/scrape.js";
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

  // Initialize the scrape tool
  const scrapeTool = new ScrapeTool({
    axiosInstance,
    errorConfig: DEFAULT_ERROR_CONFIG,
  });

  try {
    // Basic scraping example
    console.log("Basic scraping example:");
    const basicResult = await scrapeTool.execute({
      url: "https://example.com",
      formats: ["markdown"],
      onlyMainContent: true,
      blockAds: true
    });
    console.log(JSON.stringify(basicResult, null, 2));

    // Advanced scraping with structured data extraction
    console.log("\nAdvanced scraping example:");
    const advancedResult = await scrapeTool.execute({
      url: "https://example.com/blog",
      jsonOptions: {
        prompt: "Extract the article title, author, date, and main content",
        schema: {
          type: "object",
          properties: {
            title: { type: "string" },
            author: { type: "string" },
            date: { type: "string" },
            content: { type: "string" }
          },
          required: ["title", "content"]
        }
      },
      formats: ["markdown", "json"],
      mobile: true,
      location: {
        country: "US",
        languages: ["en-US"]
      },
      waitFor: 2000,
      blockAds: true
    });
    console.log(JSON.stringify(advancedResult, null, 2));

    // Mobile-optimized scraping
    console.log("\nMobile scraping example:");
    const mobileResult = await scrapeTool.execute({
      url: "https://example.com/store",
      mobile: true,
      formats: ["markdown"],
      includeTags: ["article", "main", "product"],
      excludeTags: ["nav", "footer", "ads"],
      removeBase64Images: true
    });
    console.log(JSON.stringify(mobileResult, null, 2));

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
