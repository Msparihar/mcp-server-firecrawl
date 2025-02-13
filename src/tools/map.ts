import { AxiosInstance } from "axios";
import { ErrorHandlingConfig, retryRequest } from "../error-handling.js";
import { MapArgs } from "../types.js";

/**
 * Options for configuring the map tool
 */
export interface MapToolOptions {
  /** Axios instance for making requests */
  axiosInstance: AxiosInstance;
  /** Error handling configuration */
  errorConfig: ErrorHandlingConfig;
}

/**
 * Structure representing a node in the site map
 */
interface SiteMapNode {
  url: string;
  children?: SiteMapNode[];
}

/**
 * Link structure for mapping
 */
interface SiteLink {
  url: string;
  parent?: string;
}

/**
 * Handles website structure mapping operations
 */
export class MapTool {
  private axiosInstance: AxiosInstance;
  private errorConfig: ErrorHandlingConfig;

  constructor(options: MapToolOptions) {
    this.axiosInstance = options.axiosInstance;
    this.errorConfig = options.errorConfig;
  }

  /**
   * Get the tool definition for registration
   */
  getDefinition() {
    return {
      name: "map",
      description: "Maps a website's structure",
      inputSchema: {
        type: "object",
        properties: {
          url: {
            type: "string",
            description: "Base URL to map",
          },
          search: {
            type: "string",
            description: "Search query for mapping",
          },
          ignoreSitemap: {
            type: "boolean",
            description: "Ignore sitemap.xml during mapping",
          },
          sitemapOnly: {
            type: "boolean",
            description: "Only use sitemap.xml for mapping",
          },
          includeSubdomains: {
            type: "boolean",
            description: "Include subdomains in mapping",
          },
          limit: {
            type: "number",
            description: "Maximum links to return",
            default: 5000,
          },
          timeout: {
            type: "number",
            description: "Request timeout",
          },
        },
        required: ["url"],
      },
    };
  }

  /**
   * Execute the map operation
   */
  async execute(args: MapArgs) {
    const response = await retryRequest(
      () => this.axiosInstance.post("/map", args),
      this.errorConfig
    );

    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(response.data, null, 2),
        },
      ],
    };
  }

  /**
   * Validate the map operation arguments
   */
  validate(args: unknown): args is MapArgs {
    if (typeof args !== "object" || args === null) {
      return false;
    }

    const {
      url,
      search,
      limit,
      timeout,
      ignoreSitemap,
      sitemapOnly,
      includeSubdomains,
    } = args as any;

    if (typeof url !== "string") {
      return false;
    }

    if (search !== undefined && typeof search !== "string") {
      return false;
    }

    if (limit !== undefined && typeof limit !== "number") {
      return false;
    }

    if (timeout !== undefined && typeof timeout !== "number") {
      return false;
    }

    if (ignoreSitemap !== undefined && typeof ignoreSitemap !== "boolean") {
      return false;
    }

    if (sitemapOnly !== undefined && typeof sitemapOnly !== "boolean") {
      return false;
    }

    if (includeSubdomains !== undefined && typeof includeSubdomains !== "boolean") {
      return false;
    }

    return true;
  }

  /**
   * Format the mapping results into a tree structure
   * @private
   */
  private formatTree(links: SiteLink[]): Record<string, SiteMapNode> {
    const tree: Record<string, SiteMapNode> = {};
    const rootNodes = links.filter((link) => !link.parent);

    const buildNode = (node: SiteLink): SiteMapNode => {
      const children = links.filter((link) => link.parent === node.url);
      return {
        url: node.url,
        ...(children.length > 0 && {
          children: children.map(buildNode),
        }),
      };
    };

    rootNodes.forEach((node) => {
      tree[node.url] = buildNode(node);
    });

    return tree;
  }

  /**
   * Extract sitemap URLs if available
   * @private
   */
  private async getSitemapUrls(baseUrl: string): Promise<string[]> {
    try {
      const response = await this.axiosInstance.get(`${baseUrl}/sitemap.xml`);
      // Simple XML parsing for demonstration
      const urls = response.data.match(/<loc>(.*?)<\/loc>/g) || [];
      return urls.map((url: string) =>
        url.replace(/<\/?loc>/g, "").trim()
      );
    } catch {
      return [];
    }
  }
}
