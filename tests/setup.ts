import "@types/jest";
import { Server } from "@modelcontextprotocol/sdk/server/index.js";

declare global {
  namespace jest {
    interface Matchers<R> {
      toHaveProperty(property: string): R;
    }
  }
}

// Add type assertions for private Server properties
declare module "@modelcontextprotocol/sdk/server/index.js" {
  interface Server {
    requestHandlers: Map<string, Function>;
  }
}

export {};
