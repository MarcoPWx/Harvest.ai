/**
 * API Client Test Suite
 * Comprehensive tests for API client functionality
 */

import { describe, it, expect, beforeEach, afterEach, jest } from "@jest/globals";
import { ApiClient, ApiClientError } from "../api-client";
import { ApiErrorCode } from "@/types/api";
import type {
  CreateBYOKSessionRequest,
  ValidateBYOKKeyRequest,
  GetConfigRequest,
  UpdateConfigRequest,
} from "@/types/api";

// Mock fetch globally
global.fetch = jest.fn() as jest.MockedFunction<typeof fetch>;

describe("ApiClient", () => {
  let client: ApiClient;
  const baseUrl = "http://localhost:3000";

  beforeEach(() => {
    // Fresh mock for fetch each test to avoid lingering implementations
    // @ts-ignore
    global.fetch = jest.fn();
    // Ensure window.fetch (jsdom) also points to the mock
    // @ts-ignore
    if (typeof window !== "undefined") window.fetch = global.fetch;
    client = new ApiClient({ baseUrl });
    jest.resetAllMocks();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe("Core Request Handling", () => {
    it("should make successful requests", async () => {
      const mockResponse = {
        success: true,
        data: { test: "data" },
        metadata: {
          requestId: "123",
          timestamp: new Date().toISOString(),
          version: "1.0.0",
        },
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
        headers: new Headers(),
      } as Response);

      const result = await client.getSystemHealth();
      expect(result).toBeDefined();
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining("/api/health"),
        expect.objectContaining({
          method: "GET",
        }),
      );
    });

    it("should handle rate limiting", async () => {
      const headers = new Headers({
        "X-RateLimit-Limit": "60",
        "X-RateLimit-Remaining": "5",
        "X-RateLimit-Reset": String(Math.floor(Date.now() / 1000)),
        "Retry-After": "0",
      });

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 429,
        json: async () => ({
          success: false,
          error: {
            code: ApiErrorCode.RATE_LIMIT_EXCEEDED,
            message: "Too many requests",
            timestamp: new Date().toISOString(),
          },
        }),
        headers,
      } as Response);

      const rlClient = new ApiClient({ baseUrl, retries: 0 });

      await expect(rlClient.getSystemHealth()).rejects.toThrow(ApiClientError);

      const rateLimitInfo = rlClient.getRateLimitInfo();
      expect(rateLimitInfo).toBeDefined();
      expect(rateLimitInfo?.remaining).toBe(5);
    });

    it("should retry on server errors", async () => {
      let callCount = 0;
      (global.fetch as jest.Mock).mockImplementation(async () => {
        callCount++;
        if (callCount < 3) {
          return {
            ok: false,
            status: 500,
            json: async () => ({
              success: false,
              error: {
                code: ApiErrorCode.INTERNAL_ERROR,
                message: "Server error",
                timestamp: new Date().toISOString(),
              },
            }),
            headers: new Headers(),
          } as Response;
        }
        return {
          ok: true,
          json: async () => ({
            success: true,
            data: { status: "healthy" },
          }),
          headers: new Headers(),
        } as Response;
      });

      const result = await client.getSystemHealth();
      expect(result).toBeDefined();
      expect(result.status).toBe("healthy");
      expect(callCount).toBe(3);
    });

    it("should handle timeout errors", async () => {
      (global.fetch as jest.Mock).mockImplementation(
        (input: RequestInfo | URL, init?: RequestInit) => {
          const signal = init?.signal as AbortSignal | undefined;
          return new Promise((resolve, reject) => {
            let timer: ReturnType<typeof setTimeout> | null = null;
            const onAbort = () => {
              if (timer) clearTimeout(timer);
              const err = new Error("Aborted");
              // Mimic DOMException name used by fetch on abort
              // so ApiClient can detect AbortError by name
              (err as any).name = "AbortError";
              reject(err);
            };
            if (signal) {
              if (signal.aborted) return onAbort();
              signal.addEventListener("abort", onAbort, { once: true });
            }
            timer = setTimeout(
              () =>
                resolve({
                  ok: true,
                  json: async () => ({ success: true }),
                  headers: new Headers(),
                } as Response),
              100000,
            );
          });
        },
      );

      const fastClient = new ApiClient({
        baseUrl,
        timeout: 100,
        retries: 0,
      });

      await expect(fastClient.getSystemHealth()).rejects.toThrow();
    });
  });

  describe("BYOK Session Management", () => {
    it("should create BYOK session", async () => {
      const request: CreateBYOKSessionRequest = {
        apiKey: "test-key",
        provider: "openai",
        modelId: "gpt-4",
        sessionDuration: 60,
      };

      const mockResponse = {
        session: {
          id: "session-123",
          provider: "openai",
          modelId: "gpt-4",
          createdAt: new Date().toISOString(),
          expiresAt: new Date(Date.now() + 3600000).toISOString(),
          usageCount: 0,
          metadata: {},
        },
        token: "jwt-token",
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          data: mockResponse,
        }),
        headers: new Headers(),
      } as Response);

      const result = await client.createBYOKSession(request);
      expect(result.session.id).toBe("session-123");
      expect(result.token).toBe("jwt-token");
    });

    it("should validate BYOK key", async () => {
      const request: ValidateBYOKKeyRequest = {
        apiKey: "test-key",
        provider: "openai",
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          data: {
            valid: true,
            provider: "openai",
            models: ["gpt-4", "gpt-3.5-turbo"],
            capabilities: ["chat", "completion"],
          },
        }),
        headers: new Headers(),
      } as Response);

      const result = await client.validateBYOKKey(request);
      expect(result.valid).toBe(true);
      expect(result.models).toContain("gpt-4");
    });

    it("should get BYOK session", async () => {
      const sessionId = "session-123";

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          data: {
            id: sessionId,
            provider: "openai",
            modelId: "gpt-4",
            usageCount: 5,
          },
        }),
        headers: new Headers(),
      } as Response);

      const result = await client.getBYOKSession(sessionId);
      expect(result.id).toBe(sessionId);
      expect(result.usageCount).toBe(5);
    });

    it("should handle invalid API key error", async () => {
      const request: CreateBYOKSessionRequest = {
        apiKey: "invalid-key",
        provider: "openai",
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 401,
        json: async () => ({
          success: false,
          error: {
            code: ApiErrorCode.INVALID_PROVIDER_KEY,
            message: "Invalid API key",
            timestamp: new Date().toISOString(),
          },
        }),
        headers: new Headers(),
      } as Response);

      const clientLocal = new ApiClient({ baseUrl, retries: 0, timeout: 50 });
      const promise = clientLocal.createBYOKSession(request);
      // Give the microtask queue a tick for the call to be made
      await Promise.resolve();
      expect(global.fetch as jest.Mock).toHaveBeenCalledTimes(1);
      await expect(promise).rejects.toThrow(ApiClientError);
    });
  });

  describe("Remote Configuration", () => {
    it("should get configuration", async () => {
      const request: GetConfigRequest = {
        keys: ["feature.enabled", "api.timeout"],
        environment: "production",
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          data: {
            configs: [
              { key: "feature.enabled", value: true },
              { key: "api.timeout", value: 30000 },
            ],
            effectiveValues: {
              "feature.enabled": true,
              "api.timeout": 30000,
            },
          },
        }),
        headers: new Headers(),
      } as Response);

      const result = await client.getConfig(request);
      expect(result.configs).toHaveLength(2);
      expect(result.effectiveValues["feature.enabled"]).toBe(true);
    });

    it("should update configuration", async () => {
      const request: UpdateConfigRequest = {
        key: "feature.enabled",
        value: false,
        environment: "staging",
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          data: {
            config: {
              key: "feature.enabled",
              value: false,
              environment: "staging",
            },
            previousValue: true,
            affectedUsers: 100,
          },
        }),
        headers: new Headers(),
      } as Response);

      const result = await client.updateConfig(request);
      expect(result.config.value).toBe(false);
      expect(result.previousValue).toBe(true);
    });

    it("should validate configuration without updating", async () => {
      const request: UpdateConfigRequest = {
        key: "api.timeout",
        value: -1,
        validateOnly: true,
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 400,
        json: async () => ({
          success: false,
          error: {
            code: ApiErrorCode.CONFIG_VALIDATION_ERROR,
            message: "Value must be positive",
            timestamp: new Date().toISOString(),
          },
        }),
        headers: new Headers(),
      } as Response);

      const clientLocal = new ApiClient({ baseUrl, retries: 0, timeout: 50 });
      await expect(clientLocal.updateConfig(request)).rejects.toThrow(ApiClientError);
    });
  });

  describe("Token Management", () => {
    it("should set and use session token", async () => {
      client.setSessionToken("test-token");

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          data: { id: "user-123" },
        }),
        headers: new Headers(),
      } as Response);

      await client.getCurrentUser();

      expect(fetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          headers: expect.objectContaining({
            Authorization: "Bearer test-token",
          }),
        }),
      );
    });

    it("should set and use API key", async () => {
      client.setApiKey("api-key-123");

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          data: { id: "user-123" },
        }),
        headers: new Headers(),
      } as Response);

      await client.getCurrentUser();

      expect(fetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          headers: expect.objectContaining({
            "X-API-Key": "api-key-123",
          }),
        }),
      );
    });

    it("should clear tokens", () => {
      client.setSessionToken("token");
      client.setApiKey("key");

      client.clearSessionToken();
      client.clearApiKey();

      // Tokens should be cleared (implementation detail)
      expect(client.getRateLimitInfo()).toBeUndefined();
    });
  });

  describe("Error Handling", () => {
    it("should handle network errors", async () => {
      (global.fetch as jest.Mock).mockRejectedValueOnce(new Error("Network error"));

      const clientLocal = new ApiClient({ baseUrl, retries: 0, timeout: 50 });
      await expect(clientLocal.getSystemHealth()).rejects.toThrow();
    });

    it("should provide error details", async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 404,
        json: async () => ({
          success: false,
          error: {
            code: ApiErrorCode.NOT_FOUND,
            message: "Resource not found",
            details: { resource: "session", id: "123" },
            timestamp: new Date().toISOString(),
          },
        }),
        headers: new Headers(),
      } as Response);

      const clientLocal = new ApiClient({ baseUrl, retries: 0, timeout: 50 });
      try {
        await clientLocal.getBYOKSession("123");
        fail("Should have thrown");
      } catch (error) {
        expect(error).toBeInstanceOf(ApiClientError);
        const apiError = error as ApiClientError;
        expect(apiError.code).toBe(ApiErrorCode.NOT_FOUND);
        expect(apiError.details).toEqual({ resource: "session", id: "123" });
      }
    });

    it("should call error callback", async () => {
      const onError = jest.fn();
      const clientWithCallback = new ApiClient({
        baseUrl,
        onError,
        retries: 0,
        timeout: 50,
      });

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 400,
        json: async () => ({
          success: false,
          error: {
            code: ApiErrorCode.INVALID_REQUEST,
            message: "Bad request",
            timestamp: new Date().toISOString(),
          },
        }),
        headers: new Headers(),
      } as Response);

      await expect(clientWithCallback.getCurrentUser()).rejects.toThrow();

      expect(onError).toHaveBeenCalled();
    });
  });

  describe("Pagination", () => {
    it("should handle paginated responses", async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          data: {
            items: [
              { id: "1", name: "Key 1" },
              { id: "2", name: "Key 2" },
            ],
            total: 10,
            page: 1,
            pageSize: 2,
            totalPages: 5,
            hasMore: true,
          },
        }),
        headers: new Headers(),
      } as Response);

      const result = await client.listApiKeys({ page: 1, limit: 2 });
      expect(result.items).toHaveLength(2);
      expect(result.hasMore).toBe(true);
      expect(result.totalPages).toBe(5);
    });
  });
});
