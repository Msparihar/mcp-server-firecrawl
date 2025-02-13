import { jest, expect } from "@jest/globals";
import type { ScrapeUrlArgs } from "../src/types";

declare global {
  namespace jest {
    interface Matchers<R> {
      toHaveBeenCalledWithUrl(url: string): R;
    }
  }
}

expect.extend({
  toHaveBeenCalledWithUrl(received: jest.Mock, url: string) {
    const calls = received.mock.calls;
    const urlCalls = calls.some((call) => {
      const arg = call[0] as ScrapeUrlArgs;
      return arg && arg.url === url;
    });

    return {
      pass: urlCalls,
      message: () =>
        `expected ${received.getMockName()} to have been called with URL ${url}`,
    };
  },
});

// Configure Jest globals
global.jest = jest;
