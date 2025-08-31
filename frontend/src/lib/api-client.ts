/**
 * API Client
 * Comprehensive API client with error handling, retries, and rate limiting
 */

import {
  ApiResponse,
  ApiError,
  ApiRequestOptions,
  ApiClientConfig,
  ApiErrorCode,
  RateLimitInfo,
  CreateBYOKSessionRequest,
  CreateBYOKSessionResponse,
  ValidateBYOKKeyRequest,
  ValidateBYOKKeyResponse,
  BYOKSession,
  BYOKUsageMetrics,
  GetConfigRequest,
  GetConfigResponse,
  UpdateConfigRequest,
  UpdateConfigResponse,
  ConfigHistory,
  UserProfile,
  CreateApiKeyRequest,
  CreateApiKeyResponse,
  ApiKey,
  UsageMetrics,
  SystemHealth,
  PaginationParams,
  PaginatedResponse,
} from "@/types/api";

export class ApiClient {
  private config: ApiClientConfig;
  private rateLimitInfo: Map<string, RateLimitInfo> = new Map();
  private retryDelays = [1000, 2000, 4000]; // Exponential backoff

  constructor(config: ApiClientConfig) {
    this.config = {
      timeout: 30000,
      retries: 3,
      ...config,
    };
  }

  // ============================================
  // Core Request Method
  // ============================================

  private async request<T>(
    method: string,
    path: string,
    data?: any,
    options: ApiRequestOptions = {},
  ): Promise<ApiResponse<T>> {
    const url = `${this.config.baseUrl}${path}`;
    const controller = new AbortController();
    const timeout = options.timeout || this.config.timeout;

    const timeoutId = setTimeout(() => controller.abort(), timeout!);

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      ...options.headers,
    };

    if (this.config.apiKey) {
      headers["X-API-Key"] = this.config.apiKey;
    }

    if (this.config.sessionToken) {
      headers["Authorization"] = `Bearer ${this.config.sessionToken}`;
    }

    const requestOptions: RequestInit = {
      method,
      headers,
      signal: options.signal || controller.signal,
      cache: options.cache,
    };

    if (data && method !== "GET") {
      requestOptions.body = JSON.stringify(data);
    }

    try {
      const response = await this.executeWithRetry<T>(url, requestOptions, options.retries);

      clearTimeout(timeoutId);
      return response;
    } catch (error) {
      clearTimeout(timeoutId);

      if (error instanceof Error) {
        if (error.name === "AbortError") {
          throw this.createError(ApiErrorCode.TIMEOUT, "Request timeout");
        }
      }

      throw error;
    }
  }

  private async executeWithRetry<T>(
    url: string,
    options: RequestInit,
    retries?: number,
  ): Promise<ApiResponse<T>> {
    const maxRetries = retries ?? this.config.retries ?? 3;
    let lastError: Error | null = null;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        // Always resolve fetch from globalThis to ensure test mocks are respected
        const fetchFn: typeof fetch = (globalThis as any).fetch || fetch;
        const response = await fetchFn(url, options);

        // Handle rate limiting
        const rateLimitHeader = response.headers.get("X-RateLimit-Remaining");
        if (rateLimitHeader) {
          const info: RateLimitInfo = {
            limit: parseInt(response.headers.get("X-RateLimit-Limit") || "0"),
            remaining: parseInt(rateLimitHeader),
            reset: parseInt(response.headers.get("X-RateLimit-Reset") || "0"),
            retryAfter:
              response.status === 429
                ? parseInt(response.headers.get("Retry-After") || "60")
                : undefined,
          };

          this.rateLimitInfo.set(url, info);

          if (this.config.onRateLimit && info.remaining < 10) {
            this.config.onRateLimit(info);
          }
        }

        const result = (await response.json()) as ApiResponse<T>;

        if (!response.ok) {
          if (response.status === 429 && attempt < maxRetries) {
            // Rate limited, wait and retry
            const retryAfter = parseInt(response.headers.get("Retry-After") || "60");
            await this.delay(retryAfter * 1000);
            continue;
          }

          if (response.status >= 500 && attempt < maxRetries) {
            // Server error, retry with backoff
            await this.delay(this.retryDelays[Math.min(attempt, this.retryDelays.length - 1)]);
            continue;
          }

          // Non-retryable error
          if (result.error && this.config.onError) {
            this.config.onError(result.error);
          }

          throw new ApiClientError(
            result.error || {
              code: ApiErrorCode.INTERNAL_ERROR,
              message: "Unknown error",
              timestamp: new Date().toISOString(),
            },
          );
        }

        return result;
      } catch (error) {
        lastError = error as Error;

        if (attempt === maxRetries) {
          throw lastError;
        }

        // Network error, retry
        await this.delay(this.retryDelays[Math.min(attempt, this.retryDelays.length - 1)]);
      }
    }

    throw lastError || new Error("Max retries exceeded");
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  private createError(code: ApiErrorCode, message: string, details?: any): ApiClientError {
    return new ApiClientError({
      code,
      message,
      details,
      timestamp: new Date().toISOString(),
    });
  }

  // ============================================
  // BYOK Session Management
  // ============================================

  async createBYOKSession(request: CreateBYOKSessionRequest): Promise<CreateBYOKSessionResponse> {
    const response = await this.request<CreateBYOKSessionResponse>(
      "POST",
      "/api/byok/sessions",
      request,
    );

    if (!response.success || !response.data) {
      throw this.createError(ApiErrorCode.INVALID_REQUEST, "Failed to create BYOK session");
    }

    return response.data;
  }

  async validateBYOKKey(request: ValidateBYOKKeyRequest): Promise<ValidateBYOKKeyResponse> {
    const response = await this.request<ValidateBYOKKeyResponse>(
      "POST",
      "/api/byok/validate",
      request,
    );

    if (!response.success || !response.data) {
      throw this.createError(ApiErrorCode.INVALID_PROVIDER_KEY, "Failed to validate API key");
    }

    return response.data;
  }

  async getBYOKSession(sessionId: string): Promise<BYOKSession> {
    const response = await this.request<BYOKSession>("GET", `/api/byok/sessions/${sessionId}`);

    if (!response.success || !response.data) {
      throw this.createError(ApiErrorCode.NOT_FOUND, "Session not found");
    }

    return response.data;
  }

  async deleteBYOKSession(sessionId: string): Promise<void> {
    await this.request("DELETE", `/api/byok/sessions/${sessionId}`);
  }

  async getBYOKUsageMetrics(
    sessionId: string,
    params?: { startDate?: string; endDate?: string },
  ): Promise<BYOKUsageMetrics> {
    const queryParams = new URLSearchParams(params as any).toString();
    const path = `/api/byok/sessions/${sessionId}/usage${queryParams ? `?${queryParams}` : ""}`;

    const response = await this.request<BYOKUsageMetrics>("GET", path);

    if (!response.success || !response.data) {
      throw this.createError(ApiErrorCode.NOT_FOUND, "Usage metrics not found");
    }

    return response.data;
  }

  // ============================================
  // Remote Configuration
  // ============================================

  async getConfig(request: GetConfigRequest = {}): Promise<GetConfigResponse> {
    const queryParams = new URLSearchParams();

    if (request.keys?.length) {
      queryParams.append("keys", request.keys.join(","));
    }
    if (request.environment) {
      queryParams.append("environment", request.environment);
    }
    if (request.userId) {
      queryParams.append("userId", request.userId);
    }
    if (request.tags?.length) {
      queryParams.append("tags", request.tags.join(","));
    }
    if (request.includeDefaults !== undefined) {
      queryParams.append("includeDefaults", String(request.includeDefaults));
    }

    const path = `/api/config${queryParams.toString() ? `?${queryParams}` : ""}`;
    const response = await this.request<GetConfigResponse>("GET", path);

    if (!response.success || !response.data) {
      throw this.createError(ApiErrorCode.NOT_FOUND, "Configuration not found");
    }

    return response.data;
  }

  async updateConfig(request: UpdateConfigRequest): Promise<UpdateConfigResponse> {
    const response = await this.request<UpdateConfigResponse>(
      request.validateOnly ? "POST" : "PUT",
      request.validateOnly ? "/api/config/validate" : "/api/config",
      request,
    );

    if (!response.success || !response.data) {
      throw this.createError(
        ApiErrorCode.CONFIG_VALIDATION_ERROR,
        "Failed to update configuration",
      );
    }

    return response.data;
  }

  async getConfigHistory(
    key: string,
    params?: PaginationParams,
  ): Promise<PaginatedResponse<ConfigHistory>> {
    const queryParams = new URLSearchParams(params as any).toString();
    const path = `/api/config/${key}/history${queryParams ? `?${queryParams}` : ""}`;

    const response = await this.request<PaginatedResponse<ConfigHistory>>("GET", path);

    if (!response.success || !response.data) {
      throw this.createError(ApiErrorCode.NOT_FOUND, "History not found");
    }

    return response.data;
  }

  async rollbackConfig(key: string, version: number): Promise<UpdateConfigResponse> {
    const response = await this.request<UpdateConfigResponse>(
      "POST",
      `/api/config/${key}/rollback`,
      { version },
    );

    if (!response.success || !response.data) {
      throw this.createError(
        ApiErrorCode.CONFIG_ROLLBACK_FAILED,
        "Failed to rollback configuration",
      );
    }

    return response.data;
  }

  // ============================================
  // User Profile Management
  // ============================================

  async getCurrentUser(): Promise<UserProfile> {
    const response = await this.request<UserProfile>("GET", "/api/user/profile");

    if (!response.success || !response.data) {
      throw this.createError(ApiErrorCode.UNAUTHORIZED, "User not authenticated");
    }

    return response.data;
  }

  async updateUserProfile(updates: Partial<UserProfile>): Promise<UserProfile> {
    const response = await this.request<UserProfile>("PATCH", "/api/user/profile", updates);

    if (!response.success || !response.data) {
      throw this.createError(ApiErrorCode.INVALID_REQUEST, "Failed to update profile");
    }

    return response.data;
  }

  // ============================================
  // API Key Management
  // ============================================

  async createApiKey(request: CreateApiKeyRequest): Promise<CreateApiKeyResponse> {
    const response = await this.request<CreateApiKeyResponse>("POST", "/api/keys", request);

    if (!response.success || !response.data) {
      throw this.createError(ApiErrorCode.INVALID_REQUEST, "Failed to create API key");
    }

    return response.data;
  }

  async listApiKeys(params?: PaginationParams): Promise<PaginatedResponse<ApiKey>> {
    const queryParams = new URLSearchParams(params as any).toString();
    const path = `/api/keys${queryParams ? `?${queryParams}` : ""}`;

    const response = await this.request<PaginatedResponse<ApiKey>>("GET", path);

    if (!response.success || !response.data) {
      throw this.createError(ApiErrorCode.NOT_FOUND, "No API keys found");
    }

    return response.data;
  }

  async revokeApiKey(keyId: string): Promise<void> {
    await this.request("DELETE", `/api/keys/${keyId}`);
  }

  // ============================================
  // Usage and Analytics
  // ============================================

  async getUsageMetrics(userId?: string, period: string = "month"): Promise<UsageMetrics> {
    const path = userId ? `/api/usage/${userId}?period=${period}` : `/api/usage?period=${period}`;

    const response = await this.request<UsageMetrics>("GET", path);

    if (!response.success || !response.data) {
      throw this.createError(ApiErrorCode.NOT_FOUND, "Usage metrics not available");
    }

    return response.data;
  }

  async getSystemHealth(): Promise<SystemHealth> {
    const response = await this.request<SystemHealth>("GET", "/api/health");

    if (!response.success || !response.data) {
      throw this.createError(ApiErrorCode.SERVICE_UNAVAILABLE, "Health check failed");
    }

    return response.data;
  }

  // ============================================
  // Utility Methods
  // ============================================

  getRateLimitInfo(endpoint?: string): RateLimitInfo | undefined {
    if (endpoint) {
      return this.rateLimitInfo.get(`${this.config.baseUrl}${endpoint}`);
    }

    // Return the most restrictive rate limit
    let mostRestrictive: RateLimitInfo | undefined;

    for (const info of this.rateLimitInfo.values()) {
      if (!mostRestrictive || info.remaining < mostRestrictive.remaining) {
        mostRestrictive = info;
      }
    }

    return mostRestrictive;
  }

  setSessionToken(token: string): void {
    this.config.sessionToken = token;
  }

  clearSessionToken(): void {
    delete this.config.sessionToken;
  }

  setApiKey(key: string): void {
    this.config.apiKey = key;
  }

  clearApiKey(): void {
    delete this.config.apiKey;
  }
}

// ============================================
// Custom Error Class
// ============================================

export class ApiClientError extends Error {
  public readonly error: ApiError;

  constructor(error: ApiError) {
    super(error.message);
    this.name = "ApiClientError";
    this.error = error;
  }

  get code(): string {
    return this.error.code;
  }

  get details(): any {
    return this.error.details;
  }

  get timestamp(): string {
    return this.error.timestamp;
  }
}

// ============================================
// Default Export
// ============================================

let defaultClient: ApiClient | null = null;

export function createApiClient(config: ApiClientConfig): ApiClient {
  return new ApiClient(config);
}

export function getDefaultApiClient(): ApiClient {
  if (!defaultClient) {
    defaultClient = new ApiClient({
      baseUrl: process.env.NEXT_PUBLIC_API_URL || "/api",
      timeout: 30000,
      retries: 3,
    });
  }

  return defaultClient;
}

export default ApiClient;
