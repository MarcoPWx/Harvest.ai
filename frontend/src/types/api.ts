/**
 * API Types and Specifications
 * Comprehensive type definitions for all API endpoints
 */

// ============================================
// Base Types
// ============================================

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: ApiError;
  metadata?: ResponseMetadata;
}

export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, any>;
  timestamp: string;
}

export interface ResponseMetadata {
  requestId: string;
  timestamp: string;
  version: string;
  rateLimit?: RateLimitInfo;
}

export interface RateLimitInfo {
  limit: number;
  remaining: number;
  reset: number;
  retryAfter?: number;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
  sort?: string;
  order?: "asc" | "desc";
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  hasMore: boolean;
}

// ============================================
// BYOK (Bring Your Own Key) Types
// ============================================

export interface BYOKSession {
  id: string;
  userId?: string;
  provider: AIProvider;
  modelId: string;
  createdAt: string;
  expiresAt: string;
  lastUsed?: string;
  usageCount: number;
  metadata: BYOKMetadata;
}

export type AIProvider = "openai" | "anthropic" | "google" | "azure" | "custom";

export interface BYOKMetadata {
  userAgent?: string;
  ipAddress?: string;
  region?: string;
  capabilities?: string[];
  rateLimit?: BYOKRateLimit;
}

export interface BYOKRateLimit {
  requestsPerMinute: number;
  tokensPerMinute: number;
  requestsPerDay: number;
}

export interface CreateBYOKSessionRequest {
  apiKey: string;
  provider: AIProvider;
  modelId?: string;
  sessionDuration?: number; // minutes
  metadata?: Partial<BYOKMetadata>;
}

export interface CreateBYOKSessionResponse {
  session: BYOKSession;
  token: string; // Session token for subsequent requests
  warnings?: string[];
}

export interface ValidateBYOKKeyRequest {
  apiKey: string;
  provider: AIProvider;
  testPrompt?: string;
}

export interface ValidateBYOKKeyResponse {
  valid: boolean;
  provider: AIProvider;
  models?: string[];
  capabilities?: string[];
  quotas?: BYOKQuotas;
  error?: string;
}

export interface BYOKQuotas {
  rateLimit?: BYOKRateLimit;
  creditBalance?: number;
  usageToday?: number;
  usageThisMonth?: number;
}

export interface BYOKUsageMetrics {
  sessionId: string;
  totalRequests: number;
  totalTokens: number;
  totalCost?: number;
  byModel: Record<string, ModelUsage>;
  byDate: Record<string, DailyUsage>;
}

export interface ModelUsage {
  requests: number;
  inputTokens: number;
  outputTokens: number;
  cost?: number;
}

export interface DailyUsage {
  date: string;
  requests: number;
  tokens: number;
  cost?: number;
}

// ============================================
// Remote Configuration Types
// ============================================

export interface RemoteConfig {
  id: string;
  key: string;
  value: any;
  type: ConfigValueType;
  environment: Environment;
  version: number;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  updatedBy: string;
  metadata?: ConfigMetadata;
}

export type ConfigValueType = "string" | "number" | "boolean" | "json" | "array";
export type Environment = "development" | "staging" | "production" | "test";

export interface ConfigMetadata {
  description?: string;
  tags?: string[];
  schema?: any; // JSON Schema
  validation?: ConfigValidation;
  rollout?: RolloutConfig;
}

export interface ConfigValidation {
  required?: boolean;
  min?: number;
  max?: number;
  pattern?: string;
  enum?: any[];
}

export interface RolloutConfig {
  percentage?: number;
  userGroups?: string[];
  startDate?: string;
  endDate?: string;
}

export interface GetConfigRequest {
  keys?: string[];
  environment?: Environment;
  userId?: string;
  tags?: string[];
  includeDefaults?: boolean;
}

export interface GetConfigResponse {
  configs: RemoteConfig[];
  defaults?: Record<string, any>;
  overrides?: Record<string, any>;
  effectiveValues: Record<string, any>;
}

export interface UpdateConfigRequest {
  key: string;
  value: any;
  environment?: Environment;
  metadata?: Partial<ConfigMetadata>;
  validateOnly?: boolean;
}

export interface UpdateConfigResponse {
  config: RemoteConfig;
  previousValue?: any;
  affectedUsers?: number;
  warnings?: string[];
}

export interface ConfigHistory {
  id: string;
  configId: string;
  key: string;
  previousValue: any;
  newValue: any;
  changedBy: string;
  changedAt: string;
  reason?: string;
  rollbackId?: string;
}

// ============================================
// User Profile Types
// ============================================

export interface UserProfile {
  id: string;
  email: string;
  displayName?: string;
  avatarUrl?: string;
  role: UserRole;
  createdAt: string;
  updatedAt: string;
  lastLoginAt?: string;
  preferences?: UserPreferences;
  limits?: UserLimits;
  metadata?: UserMetadata;
}

export type UserRole = "admin" | "developer" | "user" | "viewer";

export interface UserPreferences {
  theme?: "light" | "dark" | "system";
  language?: string;
  timezone?: string;
  notifications?: NotificationPreferences;
  features?: Record<string, boolean>;
}

export interface NotificationPreferences {
  email?: boolean;
  push?: boolean;
  inApp?: boolean;
  digest?: "daily" | "weekly" | "never";
}

export interface UserLimits {
  apiRequestsPerDay: number;
  storageQuotaMB: number;
  concurrentSessions: number;
  customModels: number;
}

export interface UserMetadata {
  organization?: string;
  department?: string;
  tags?: string[];
  customFields?: Record<string, any>;
}

// ============================================
// API Key Management Types
// ============================================

export interface ApiKey {
  id: string;
  userId: string;
  name: string;
  keyPrefix: string; // First 8 chars for identification
  hashedKey?: never; // Never send to client
  permissions: ApiKeyPermissions;
  expiresAt?: string;
  lastUsedAt?: string;
  createdAt: string;
  revokedAt?: string;
  metadata?: ApiKeyMetadata;
}

export interface ApiKeyPermissions {
  scopes: ApiScope[];
  ipWhitelist?: string[];
  origins?: string[];
  rateLimit?: RateLimitConfig;
}

export type ApiScope =
  | "read:config"
  | "write:config"
  | "read:profile"
  | "write:profile"
  | "create:session"
  | "read:metrics"
  | "admin:all";

export interface RateLimitConfig {
  requestsPerMinute?: number;
  requestsPerHour?: number;
  requestsPerDay?: number;
  burstLimit?: number;
}

export interface ApiKeyMetadata {
  description?: string;
  environment?: Environment;
  service?: string;
  version?: string;
}

export interface CreateApiKeyRequest {
  name: string;
  permissions: Partial<ApiKeyPermissions>;
  expiresIn?: number; // days
  metadata?: ApiKeyMetadata;
}

export interface CreateApiKeyResponse {
  apiKey: ApiKey;
  secretKey: string; // Only returned once
  warning?: string;
}

// ============================================
// Usage and Analytics Types
// ============================================

export interface UsageMetrics {
  userId: string;
  period: UsagePeriod;
  apiCalls: number;
  tokensUsed: number;
  storageUsedMB: number;
  computeTimeMs: number;
  cost?: number;
  byEndpoint: Record<string, EndpointUsage>;
  byDay: DailyUsage[];
}

export type UsagePeriod = "hour" | "day" | "week" | "month" | "year";

export interface EndpointUsage {
  calls: number;
  errors: number;
  avgLatencyMs: number;
  p95LatencyMs: number;
  p99LatencyMs: number;
}

export interface SystemHealth {
  status: "healthy" | "degraded" | "down";
  uptime: number;
  services: ServiceHealth[];
  metrics: SystemMetrics;
}

export interface ServiceHealth {
  name: string;
  status: "up" | "down" | "degraded";
  latencyMs: number;
  errorRate: number;
  lastCheck: string;
}

export interface SystemMetrics {
  cpuUsage: number;
  memoryUsage: number;
  diskUsage: number;
  activeConnections: number;
  requestsPerSecond: number;
}

// ============================================
// Error Codes
// ============================================

export enum ApiErrorCode {
  // Authentication & Authorization
  UNAUTHORIZED = "UNAUTHORIZED",
  FORBIDDEN = "FORBIDDEN",
  INVALID_API_KEY = "INVALID_API_KEY",
  EXPIRED_SESSION = "EXPIRED_SESSION",

  // Validation
  INVALID_REQUEST = "INVALID_REQUEST",
  MISSING_PARAMETER = "MISSING_PARAMETER",
  INVALID_PARAMETER = "INVALID_PARAMETER",

  // Rate Limiting
  RATE_LIMIT_EXCEEDED = "RATE_LIMIT_EXCEEDED",
  QUOTA_EXCEEDED = "QUOTA_EXCEEDED",

  // Resource
  NOT_FOUND = "NOT_FOUND",
  ALREADY_EXISTS = "ALREADY_EXISTS",
  CONFLICT = "CONFLICT",

  // System
  INTERNAL_ERROR = "INTERNAL_ERROR",
  SERVICE_UNAVAILABLE = "SERVICE_UNAVAILABLE",
  TIMEOUT = "TIMEOUT",

  // BYOK Specific
  INVALID_PROVIDER_KEY = "INVALID_PROVIDER_KEY",
  PROVIDER_ERROR = "PROVIDER_ERROR",
  MODEL_NOT_AVAILABLE = "MODEL_NOT_AVAILABLE",

  // Config Specific
  CONFIG_VALIDATION_ERROR = "CONFIG_VALIDATION_ERROR",
  CONFIG_ROLLBACK_FAILED = "CONFIG_ROLLBACK_FAILED",
}

// ============================================
// Request/Response Helpers
// ============================================

export interface ApiRequestOptions {
  headers?: Record<string, string>;
  timeout?: number;
  retries?: number;
  cache?: RequestCache;
  signal?: AbortSignal;
}

export interface ApiClientConfig {
  baseUrl: string;
  apiKey?: string;
  sessionToken?: string;
  timeout?: number;
  retries?: number;
  onError?: (error: ApiError) => void;
  onRateLimit?: (info: RateLimitInfo) => void;
}

// ============================================
// WebSocket Types for Real-time Updates
// ============================================

export interface WebSocketMessage {
  type: WebSocketMessageType;
  payload: any;
  timestamp: string;
  id: string;
}

export type WebSocketMessageType =
  | "config.updated"
  | "session.expired"
  | "rate.limit.warning"
  | "system.alert"
  | "user.notification";

export interface ConfigUpdateMessage {
  key: string;
  previousValue: any;
  newValue: any;
  environment: Environment;
  updatedBy: string;
}

export interface RateLimitWarningMessage {
  remaining: number;
  reset: number;
  suggestion: string;
}
