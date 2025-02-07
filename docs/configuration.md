# Firecrawl MCP Server Configuration Guide

This guide explains how to configure and customize the Firecrawl MCP server for different environments and use cases.

## Environment Variables

### Required Variables

- `FIRECRAWL_API_KEY`: Your Firecrawl API key (required)
  ```bash
  export FIRECRAWL_API_KEY=your-api-key-here
  ```

### Optional Variables

- `FIRECRAWL_API_BASE_URL`: Override the default API endpoint (optional)
  ```bash
  export FIRECRAWL_API_BASE_URL=https://custom-api.firecrawl.dev/v1
  ```

- `DEBUG`: Enable debug logging (optional)
  ```bash
  export DEBUG=firecrawl:*
  ```

## Installation Methods

### Global Installation

Install the server globally to run it from anywhere:

```bash
npm install -g @modelcontextprotocol/mcp-server-firecrawl
```

Then run:
```bash
mcp-server-firecrawl
```

### Local Project Installation

Install as a project dependency:

```bash
npm install @modelcontextprotocol/mcp-server-firecrawl
```

Add to your package.json scripts:
```json
{
  "scripts": {
    "start-mcp": "mcp-server-firecrawl"
  }
}
```

## Integration with MCP Clients

### Claude Desktop App

1. Open Claude desktop app settings
2. Navigate to MCP Server settings
3. Add new server configuration:
   ```json
   {
     "firecrawl": {
       "command": "mcp-server-firecrawl",
       "env": {
         "FIRECRAWL_API_KEY": "your-api-key"
       }
     }
   }
   ```

### Claude VSCode Extension

1. Open VSCode settings
2. Search for "Claude MCP Settings"
3. Add server configuration:
   ```json
   {
     "mcpServers": {
       "firecrawl": {
         "command": "mcp-server-firecrawl",
         "env": {
           "FIRECRAWL_API_KEY": "your-api-key"
         }
       }
     }
   }
   ```

## Advanced Configuration

### Custom HTTP Headers

To add custom headers to API requests, use environment variables:

```bash
export FIRECRAWL_CUSTOM_HEADERS='{"X-Custom-Header": "value"}'
```

### Rate Limiting

The server respects Firecrawl API rate limits. Configure retry behavior with:

```bash
export FIRECRAWL_MAX_RETRIES=3
export FIRECRAWL_RETRY_DELAY=1000  # milliseconds
```

### Proxy Support

Configure proxy settings using standard Node.js environment variables:

```bash
export HTTP_PROXY=http://proxy.company.com:8080
export HTTPS_PROXY=http://proxy.company.com:8080
```

### Timeout Configuration

Adjust request timeouts:

```bash
export FIRECRAWL_TIMEOUT=30000  # milliseconds
```

## Error Handling

The server implements exponential backoff for retrying failed requests:

1. First retry: 1 second delay
2. Second retry: 2 seconds delay
3. Third retry: 4 seconds delay

Configure this behavior with:

```bash
export FIRECRAWL_BACKOFF_MULTIPLIER=2
export FIRECRAWL_MAX_BACKOFF=8000  # milliseconds
```

## Security Considerations

1. Keep your API key secure:
   - Never commit it to version control
   - Use environment variables or secure secrets management
   - Rotate keys periodically

2. Configure allowed domains:
   ```bash
   export FIRECRAWL_ALLOWED_DOMAINS='["example.com","api.example.com"]'
   ```

3. Enable request validation:
   ```bash
   export FIRECRAWL_VALIDATE_REQUESTS=true
   ```

## Monitoring and Logging

Enable detailed logging for monitoring:

```bash
# Log levels: error, warn, info, debug
export FIRECRAWL_LOG_LEVEL=debug

# Log to file
export FIRECRAWL_LOG_FILE=/path/to/firecrawl.log
```

## Development and Testing

When developing or testing, you can use the sandbox environment:

```bash
export FIRECRAWL_SANDBOX=true
export FIRECRAWL_API_KEY=test-key
```

This will route requests to the Firecrawl sandbox API for testing.
