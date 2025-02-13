# Firecrawl MCP Server Configuration Guide

This guide explains how to configure and customize the Firecrawl MCP server for different environments and use cases.

## Environment Variables

### Required Variables

- `FIRECRAWL_API_KEY`: Your Firecrawl API key (required)

  ```bash
  export FIRECRAWL_API_KEY=your-api-key-here
  ```

### Optional Variables

#### API Configuration

- `FIRECRAWL_API_BASE_URL`: Override the default API endpoint

  ```bash
  export FIRECRAWL_API_BASE_URL=https://custom-api.firecrawl.dev/v1
  ```

#### Request Configuration

- `FIRECRAWL_TIMEOUT`: Request timeout in milliseconds

  ```bash
  export FIRECRAWL_TIMEOUT=30000  # 30 seconds
  ```

#### Retry Configuration

- `FIRECRAWL_MAX_RETRIES`: Maximum retry attempts for failed requests

  ```bash
  export FIRECRAWL_MAX_RETRIES=3
  ```

- `FIRECRAWL_RETRY_DELAY`: Initial delay between retries (milliseconds)

  ```bash
  export FIRECRAWL_RETRY_DELAY=1000  # 1 second
  ```

- `FIRECRAWL_BACKOFF_MULTIPLIER`: Multiplier for exponential backoff

  ```bash
  export FIRECRAWL_BACKOFF_MULTIPLIER=2
  ```

- `FIRECRAWL_MAX_BACKOFF`: Maximum delay between retries (milliseconds)

  ```bash
  export FIRECRAWL_BACKOFF_MULTIPLIER=8000  # 8 seconds
  ```

#### Debugging

- `DEBUG`: Enable debug logging

  ```bash
  export DEBUG=true
  ```

#### Security

- `FIRECRAWL_VALIDATE_REQUESTS`: Enable request validation

  ```bash
  export FIRECRAWL_VALIDATE_REQUESTS=true
  ```

- `FIRECRAWL_ALLOWED_DOMAINS`: List of allowed domains (JSON array)

  ```bash
  export FIRECRAWL_ALLOWED_DOMAINS='["example.com","api.example.com"]'
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
         "FIRECRAWL_API_KEY": "your-api-key",
         "DEBUG": "true"
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
           "FIRECRAWL_API_KEY": "your-api-key",
           "DEBUG": "true"
         }
       }
     }
   }
   ```

## Advanced Configuration

### Custom HTTP Headers

Add custom headers to API requests:

```bash
export FIRECRAWL_CUSTOM_HEADERS='{"X-Custom-Header": "value"}'
```

### Rate Limiting

The server implements intelligent rate limiting with exponential backoff. Configure behavior with:

```bash
export FIRECRAWL_MAX_RETRIES=3
export FIRECRAWL_RETRY_DELAY=1000  # milliseconds
export FIRECRAWL_BACKOFF_MULTIPLIER=2
export FIRECRAWL_MAX_BACKOFF=8000  # milliseconds
```

### Proxy Support

Configure proxy settings using standard Node.js environment variables:

```bash
export HTTP_PROXY=http://proxy.company.com:8080
export HTTPS_PROXY=http://proxy.company.com:8080
```

### Logging Configuration

Customize logging behavior:

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

## Security Considerations

1. API Key Security:
   - Store in environment variables or secure secrets management
   - Never commit to version control
   - Rotate keys periodically

2. Request Validation:

   ```bash
   export FIRECRAWL_VALIDATE_REQUESTS=true
   export FIRECRAWL_ALLOWED_DOMAINS='["trusted-domain.com"]'
   ```

3. Rate Limiting:
   - Configure appropriate retry limits
   - Use exponential backoff
   - Monitor usage patterns

## Monitoring and Error Handling

Enable comprehensive logging and monitoring:

```bash
# Debug logging
export DEBUG=true

# Detailed error logging
export FIRECRAWL_LOG_LEVEL=debug

# Error tracking
export FIRECRAWL_ERROR_TRACKING=true
```

## Performance Tuning

Optimize performance for your use case:

```bash
# Increase timeouts for large operations
export FIRECRAWL_TIMEOUT=60000

# Adjust concurrent request limits
export FIRECRAWL_MAX_CONCURRENT=5

# Configure batch processing
export FIRECRAWL_BATCH_SIZE=10
export FIRECRAWL_BATCH_DELAY=1000
```

## Docker Configuration

When running in Docker, configure environment variables in your docker-compose.yml:

```yaml
version: '3'
services:
  firecrawl-mcp:
    image: mcp-server-firecrawl
    environment:
      - FIRECRAWL_API_KEY=your-api-key
      - DEBUG=true
      - FIRECRAWL_TIMEOUT=30000
    volumes:
      - ./logs:/app/logs
```

Or use a .env file:

```env
FIRECRAWL_API_KEY=your-api-key
DEBUG=true
FIRECRAWL_TIMEOUT=30000
