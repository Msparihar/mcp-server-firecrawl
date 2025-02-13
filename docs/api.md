# Firecrawl MCP Server API Documentation

This document provides detailed information about the Firecrawl MCP server's API and available tools.

## Available Tools

### `scrape_url`

Scrapes content from a specified URL with customizable extraction options.

#### Input Schema

```typescript
{
  url: string;              // URL to scrape content from
  jsonOptions?: {
    prompt: string;         // Prompt for extracting specific information
    schema?: object;        // Schema for structured data extraction
    systemPrompt?: string;  // System prompt for extraction context
  };
  formats?: string[];       // Output formats (markdown, html, rawHtml, links, etc.)
  onlyMainContent?: boolean;// Exclude headers, navs, footers
  includeTags?: string[];   // HTML tags to include
  excludeTags?: string[];   // HTML tags to exclude
  waitFor?: number;         // Delay before fetching (milliseconds)
  mobile?: boolean;         // Emulate mobile device
  location?: {
    country?: string;       // ISO 3166-1 alpha-2 country code
    languages?: string[];   // Preferred languages/locales
  };
  blockAds?: boolean;       // Enable ad/cookie popup blocking
}
```

#### Example

```typescript
{
  name: "scrape_url",
  arguments: {
    url: "https://example.com",
    jsonOptions: {
      prompt: "Extract the article title, date, and main content",
      schema: {
        title: "string",
        date: "string",
        content: "string"
      }
    },
    formats: ["markdown"],
    mobile: true,
    blockAds: true
  }
}
```

### `search_content`

Performs intelligent content searches with customizable parameters.

#### Input Schema

```typescript
{
  query: string;           // Search query string
  scrapeOptions?: {
    formats?: string[];    // Output formats for results
  };
  limit?: number;         // Maximum results (1-100)
  lang?: string;          // Language code
  country?: string;       // Country code
  location?: string;      // Location string
  timeout?: number;       // Request timeout (milliseconds)
}
```

#### Example

```typescript
{
  name: "search_content",
  arguments: {
    query: "latest developments in AI",
    scrapeOptions: {
      formats: ["markdown"]
    },
    limit: 10,
    lang: "en",
    country: "us"
  }
}
```

### `crawl`

Crawls websites recursively with advanced configuration options.

#### Input Schema

```typescript
{
  url: string;                  // Base URL to start crawling
  maxDepth?: number;           // Maximum crawl depth
  excludePaths?: string[];     // URL patterns to exclude
  includePaths?: string[];     // URL patterns to include
  ignoreSitemap?: boolean;     // Ignore sitemap.xml
  ignoreQueryParameters?: boolean; // Ignore URL parameters
  limit?: number;              // Maximum pages to crawl
  allowBackwardLinks?: boolean;// Allow parent directory links
  allowExternalLinks?: boolean;// Allow external domain links
  webhook?: string;           // Progress notification URL
  scrapeOptions?: object;     // Options for scraping pages
}
```

#### Example

```typescript
{
  name: "crawl",
  arguments: {
    url: "https://example.com",
    maxDepth: 3,
    excludePaths: ["/admin", "/private"],
    limit: 1000,
    scrapeOptions: {
      formats: ["markdown"]
    }
  }
}
```

### `map`

Maps website structure and generates site hierarchies.

#### Input Schema

```typescript
{
  url: string;                // Base URL to map
  search?: string;           // Search query for filtering
  ignoreSitemap?: boolean;   // Ignore sitemap.xml
  sitemapOnly?: boolean;     // Only use sitemap.xml
  includeSubdomains?: boolean;// Include subdomains
  limit?: number;            // Maximum links (default: 5000)
  timeout?: number;          // Request timeout
}
```

#### Example

```typescript
{
  name: "map",
  arguments: {
    url: "https://example.com",
    includeSubdomains: true,
    limit: 1000
  }
}
```

### `extract`

Extracts structured data from multiple URLs with schema validation.

#### Input Schema

```typescript
{
  urls: string[];             // URLs to extract from
  prompt?: string;           // Extraction guidance
  schema?: object;          // Data structure schema
  enableWebSearch?: boolean; // Use web search for context
  ignoreSitemap?: boolean;  // Ignore sitemap.xml
  includeSubdomains?: boolean;// Include subdomains
}
```

#### Example

```typescript
{
  name: "extract",
  arguments: {
    urls: ["https://example.com/page1", "https://example.com/page2"],
    prompt: "Extract product information",
    schema: {
      name: "string",
      price: "number",
      description: "string"
    }
  }
}
```

## Response Format

All tools return responses in a standard format:

```typescript
{
  content: [
    {
      type: "text",
      text: string  // JSON string containing the results
    }
  ]
}
```

## Error Handling

The server implements robust error handling with retry capability:

- Rate limiting with exponential backoff
- Configurable retry attempts and delays
- Detailed error messages
- Debug logging options

Error responses follow the standard MCP format:

```typescript
{
  error: {
    code: ErrorCode;
    message: string;
    data?: unknown;
  }
}
```

Common error codes:

- `InvalidParams`: Invalid or missing parameters
- `InvalidRequest`: Invalid request (e.g., rate limit)
- `InternalError`: Server or API errors
- `MethodNotFound`: Unknown tool name

## Configuration

Server behavior can be customized through environment variables:

```bash
# Required
export FIRECRAWL_API_KEY=your-api-key

# Optional
export FIRECRAWL_API_BASE_URL=https://custom-api.firecrawl.dev/v1
export FIRECRAWL_TIMEOUT=30000
export FIRECRAWL_MAX_RETRIES=3
export FIRECRAWL_RETRY_DELAY=1000
export DEBUG=true
```

For detailed configuration options, see the [configuration guide](configuration.md).
