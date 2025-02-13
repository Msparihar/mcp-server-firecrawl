import { jest, describe, expect, it, beforeEach } from "@jest/globals";
import type { AxiosInstance } from "axios";
import axios from "axios";
import { ScrapeTool } from "../../src/tools/scrape.js";
import { DEFAULT_ERROR_CONFIG } from "../../src/error-handling.js";
import type { ScrapeUrlArgs } from "../../src/types.js";

jest.mock("axios");

describe("ScrapeTool", () => {
  let scrapeTool: ScrapeTool;
  let mockAxiosInstance: jest.Mocked<AxiosInstance>;

  beforeEach(() => {
    mockAxiosInstance = {
      post: jest.fn(),
      get: jest.fn(),
    } as unknown as jest.Mocked<AxiosInstance>;

    (axios.create as jest.Mock).mockReturnValue(mockAxiosInstance);

    scrapeTool = new ScrapeTool({
      axiosInstance: mockAxiosInstance,
      errorConfig: DEFAULT_ERROR_CONFIG,
    });
  });

  describe("execute", () => {
    it("should successfully scrape a URL with basic options", async () => {
      const mockResponse = {
        data: {
          content: "Scraped content",
          format: "markdown",
        },
      };

      mockAxiosInstance.post.mockResolvedValueOnce(mockResponse);

      const args: ScrapeUrlArgs = {
        url: "https://example.com",
        formats: ["markdown"],
        onlyMainContent: true,
      };

      const result = await scrapeTool.execute(args);

      expect(mockAxiosInstance.post).toHaveBeenCalledWith("/scrape", args);
      expect(result).toEqual({
        content: [
          {
            type: "text",
            text: JSON.stringify(mockResponse.data, null, 2),
          },
        ],
      });
    });

    it("should handle structured data extraction", async () => {
      const mockResponse = {
        data: {
          title: "Example Title",
          content: "Example Content",
          date: "2024-02-13",
        },
      };

      mockAxiosInstance.post.mockResolvedValueOnce(mockResponse);

      const args: ScrapeUrlArgs = {
        url: "https://example.com/blog",
        jsonOptions: {
          prompt: "Extract title and content",
          schema: {
            type: "object",
            properties: {
              title: { type: "string" },
              content: { type: "string" },
            },
          },
        },
        formats: ["json"],
      };

      const result = await scrapeTool.execute(args);

      expect(mockAxiosInstance.post).toHaveBeenCalledWith("/scrape", args);
      expect(result).toEqual({
        content: [
          {
            type: "text",
            text: JSON.stringify(mockResponse.data, null, 2),
          },
        ],
      });
    });

    it("should handle mobile device emulation", async () => {
      const mockResponse = {
        data: {
          content: "Mobile optimized content",
        },
      };

      mockAxiosInstance.post.mockResolvedValueOnce(mockResponse);

      const args: ScrapeUrlArgs = {
        url: "https://example.com",
        mobile: true,
        location: {
          country: "US",
          languages: ["en-US"],
        },
        blockAds: true,
      };

      const result = await scrapeTool.execute(args);

      expect(mockAxiosInstance.post).toHaveBeenCalledWith("/scrape", args);
      expect(result).toEqual({
        content: [
          {
            type: "text",
            text: JSON.stringify(mockResponse.data, null, 2),
          },
        ],
      });
    });

    it("should handle API errors", async () => {
      const errorMessage = "API request failed";
      mockAxiosInstance.post.mockRejectedValueOnce(new Error(errorMessage));

      await expect(
        scrapeTool.execute({
          url: "https://example.com",
        })
      ).rejects.toThrow(errorMessage);
    });
  });

  describe("validate", () => {
    it("should validate correct scrape arguments", () => {
      const args: ScrapeUrlArgs = {
        url: "https://example.com",
        formats: ["markdown"],
        onlyMainContent: true,
      };

      expect(scrapeTool.validate(args)).toBe(true);
    });

    it("should reject invalid scrape arguments", () => {
      const args = {
        formats: ["markdown"],
      };

      expect(scrapeTool.validate(args)).toBe(false);
    });

    it("should validate complex scrape arguments", () => {
      const args: ScrapeUrlArgs = {
        url: "https://example.com",
        jsonOptions: {
          prompt: "Extract data",
          schema: { type: "object" },
        },
        formats: ["json", "markdown"],
        mobile: true,
        location: {
          country: "US",
          languages: ["en-US"],
        },
      };

      expect(scrapeTool.validate(args)).toBe(true);
    });
  });
});
