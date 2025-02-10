# @modelcontextprotocol/mcp-server-firecrawl

A [Model Context Protocol (MCP)](https://github.com/modelcontextprotocol) server that provides web scraping and intelligent content searching capabilities using the Firecrawl API. This server enables AI agents to extract structured data from websites and perform content searches.

[![NPM Version](https://img.shields.io/npm/v/@modelcontextprotocol/mcp-server-firecrawl)](https://www.npmjs.com/package/@modelcontextprotocol/mcp-server-firecrawl)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## Features

- **Web Scraping**: Extract content from any URL with customizable options
- **Content Search**: Perform intelligent searches across web content
- **Markdown Output**: Get results in clean, formatted markdown
- **Ad Blocking**: Optional ad blocking during scraping
- **Custom Actions**: Support for custom scraping actions

<a href="https://glama.ai/mcp/servers/th4nzh22ea"><img width="380" height="200" src="https://glama.ai/mcp/servers/th4nzh22ea/badge" alt="Server Firecrawl MCP server" /></a>

## Installation

```bash
npm install -g @modelcontextprotocol/mcp-server-firecrawl
```

## Configuration

1. Get your Firecrawl API key from [api.firecrawl.dev](https://api.firecrawl.dev)

2. Set your API key as an environment variable:
```bash
export FIRECRAWL_API_KEY=your-api-key
```

3. Start the server:
```bash
mcp-server-firecrawl
```

## Tools

### scrape_url

Scrape content from a URL with customizable options.

```typescript
interface ScrapeUrlArgs {
  url: string;                    // URL to scrape
  jsonOptions?: {
    prompt: string;              // Prompt for extracting specific information
  };
  formats?: string[];           // Output formats (e.g. ["markdown"])
  actions?: string[];          // Custom scraping actions
  blockAds?: boolean;         // Whether to block ads during scraping
}
```

Example:
```typescript
const result = await client.callTool({
  name: "scrape_url",
  arguments: {
    url: "https://example.com",
    jsonOptions: {
      prompt: "Extract the main article content",
    },
    formats: ["markdown"],
    blockAds: true
  }
});
```

### search_content

Search content using Firecrawl's intelligent search capabilities.

```typescript
interface SearchContentArgs {
  query: string;                  // Search query
  scrapeOptions?: {
    formats?: string[];         // Output formats (e.g. ["markdown"])
  };
  limit?: number;              // Maximum number of results (1-100)
}
```

Example:
```typescript
const result = await client.callTool({
  name: "search_content",
  arguments: {
    query: "latest developments in AI",
    scrapeOptions: {
      formats: ["markdown"]
    },
    limit: 5
  }
});
```

## Development

1. Clone the repository:
```bash
git clone https://github.com/yourusername/mcp-server-firecrawl.git
cd mcp-server-firecrawl
```

2. Install dependencies:
```bash
npm install
```

3. Build the project:
```bash
npm run build
```

4. Run tests:
```bash
npm test
```

## Contributing

Contributions are welcome! Please read our [Contributing Guidelines](CONTRIBUTING.md) for details on how to submit pull requests, report issues, and contribute to the project.

## Documentation

- [API Documentation](docs/api.md)
- [Configuration Guide](docs/configuration.md)
- [Contributing Guidelines](CONTRIBUTING.md)
- [Code of Conduct](CODE_OF_CONDUCT.md)

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
