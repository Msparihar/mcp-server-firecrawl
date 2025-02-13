# Contributing to Firecrawl MCP Server

We love your input! We want to make contributing to the Firecrawl MCP server as easy and transparent as possible, whether it's:

- Reporting a bug
- Discussing the current state of the code
- Submitting a fix
- Proposing new features
- Becoming a maintainer

## Development Process

We use GitHub to host code, to track issues and feature requests, as well as accept pull requests.

1. Fork the repo and create your branch from `main`
2. If you've added code that should be tested, add tests
3. If you've changed APIs, update the documentation
4. Ensure the test suite passes
5. Make sure your code lints
6. Issue that pull request!

## Local Development Setup

1. Install dependencies:

   ```bash
   npm install
   ```

2. Set up environment variables:

   ```bash
   export FIRECRAWL_API_KEY=your-api-key
   ```

3. Start development server:

   ```bash
   npm run dev
   ```

### Using Docker for Development

1. Start the development container:

   ```bash
   docker-compose up mcp-server-dev
   ```

2. Run tests in container:

   ```bash
   docker-compose up mcp-server-test
   ```

## Testing

We use Jest for testing. Run the test suite with:

```bash
npm test
```

Make sure to:

- Write tests for new features
- Maintain test coverage above 80%
- Use meaningful test descriptions

## Code Style

We use ESLint and Prettier to maintain code quality. Before committing:

1. Run linter:

   ```bash
   npm run lint
   ```

2. Format code:

   ```bash
   npm run format
   ```

## Documentation

- Keep README.md updated
- Document all new tools and configuration options
- Update API documentation for changes
- Include examples for new features

## Pull Request Process

1. Update the README.md with details of changes to the interface
2. Update the API documentation if endpoints or tools change
3. Update the version numbers following [SemVer](http://semver.org/)
4. The PR will be merged once you have the sign-off of two other developers

## Any Contributions You Make Will Be Under the MIT Software License

In short, when you submit code changes, your submissions are understood to be under the same [MIT License](http://choosealicense.com/licenses/mit/) that covers the project. Feel free to contact the maintainers if that's a concern.

## Report Bugs Using GitHub's [Issue Tracker](https://github.com/yourusername/mcp-server-firecrawl/issues)

Report a bug by [opening a new issue](https://github.com/yourusername/mcp-server-firecrawl/issues/new); it's that easy!

## Write Bug Reports With Detail, Background, and Sample Code

**Great Bug Reports** tend to have:

- A quick summary and/or background
- Steps to reproduce
  - Be specific!
  - Give sample code if you can
- What you expected would happen
- What actually happens
- Notes (possibly including why you think this might be happening, or stuff you tried that didn't work)

## License

By contributing, you agree that your contributions will be licensed under its MIT License.

## References

This document was adapted from the open-source contribution guidelines for [Facebook's Draft](https://github.com/facebook/draft-js/blob/a9316a723f9e918afde44dea68b5f9f39b7d9b00/CONTRIBUTING.md).
