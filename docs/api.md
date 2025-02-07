# Firecrawl MCP Server API Documentation

This document provides detailed information about the Firecrawl MCP server's API and available tools.

## MCP Tools

### `scrape_url`

Scrapes content from a specified URL with customizable extraction options.

#### Input Schema

```typescript
{
  type: "object",
  properties: {
    url: {
      type: "string",
      description: "URL to scrape"
    },
    jsonOptions: {
      type: "object",
      properties: {
        prompt: {
          type: "string",
          description: "Prompt for extracting specific information"
        }
      },
      required: ["prompt"]
    },
    formats: {
      type: "array",
      items: {
        type: "string",
        enum: ["markdown"]
      },
      description: "Output formats"
    },
    actions: {
      type: "array",
      items: {
        type: "string"
      },
      description: "Actions to perform"
    },
    blockAds: {
      type: "boolean",
      description: "Whether to block ads during scraping"
    }
  },
  required: ["url"]
}
```

#### Examples

Basic Scraping:
```typescript
{
  name: "scrape_url",
  arguments: {
    url: "https://example.com",
    formats: ["markdown"]
  }
}
```

Advanced Extraction:
```typescript
{
  name: "scrape_url",
  arguments: {
    url: "https://example.com/blog",
    jsonOptions: {
      prompt: "Extract the article title, author, date, and main content"
    },
    formats: ["markdown"],
    blockAds: true
  }
}
```

#### Response Format

```typescript
{
  content: [
    {
      type: "text",
      text: string // JSON string containing the scraped content
    }
  ]
}
```

### `search_content`

Performs intelligent content searches using the Firecrawl API.

#### Input Schema

```typescript
{
  type: "object",
  properties: {
    query: {
      type: "string",
      description: "Search query"
    },
    scrapeOptions: {
      type: "object",
      properties: {
        formats: {
          type: "array",
          items: {
            type: "string",
            enum: ["markdown"]
          },
          description: "Output formats"
        }
      }
    },
    limit: {
      type: "number",
      description: "Maximum number of results",
      minimum: 1,
      maximum: 100
    }
  },
  required: ["query"]
}
```

#### Examples

Basic Search:
```typescript
{
  name: "search_content",
  arguments: {
    query: "latest developments in artificial intelligence"
  }
}
```

Advanced Search:
```typescript
{
  name: "search_content",
  arguments: {
    query: "machine learning tutorials",
    scrapeOptions: {
      formats: ["markdown"]
    },
    limit: 5
  }
}
```

#### Response Format

```typescript
{
  content: [
    {
      type: "text",
      text: string // JSON string containing the search results
    }
  ]
}
```

## Error Handling

The server returns standardized MCP error responses:

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
- `InvalidParams`: Invalid or missing required parameters
- `InternalError`: Error communicating with Firecrawl API
- `MethodNotFound`: Unknown tool name

## Authentication

The server requires a Firecrawl API key to be set in the environment:

```bash
export FIRECRAWL_API_KEY=your-api-key
```

The API key is used to authenticate all requests to the Firecrawl API.
