/**
 * BYOK (Bring Your Own Key) Type Definitions
 * Types for BYOK sessions, providers, and related functionality
 */

// ============================================
// Provider Types
// ============================================

export type BYOKProvider = "openai" | "anthropic" | "google" | "azure" | "cohere" | "huggingface";

export type SessionStatus = "active" | "inactive" | "expired";

// ============================================
// Session Types
// ============================================

export interface BYOKSession {
  id: string;
  provider: BYOKProvider;
  status: SessionStatus;
  createdAt: string;
  expiresAt: string;
  lastUsedAt?: string;
  metadata?: SessionMetadata;
  usage?: SessionUsage;
  rateLimits?: RateLimits;
}

export interface SessionMetadata {
  model?: string;
  temperature?: number;
  maxTokens?: number;
  topP?: number;
  frequencyPenalty?: number;
  presencePenalty?: number;
  stopSequences?: string[];
}

export interface SessionUsage {
  tokensUsed: number;
  requestCount: number;
  cost: number;
  lastRequestAt?: string;
  avgTokensPerRequest?: number;
  errorCount?: number;
}

export interface RateLimits {
  requestsPerMinute: number;
  tokensPerMinute: number;
  concurrentRequests: number;
  dailyLimit?: number;
  monthlyLimit?: number;
}

// ============================================
// Request/Response Types
// ============================================

export interface CreateSessionRequest {
  apiKey: string;
  provider: BYOKProvider;
  model?: string;
  metadata?: Partial<SessionMetadata>;
  expiresIn?: number; // hours
}

export interface CreateSessionResponse {
  session: BYOKSession;
  sessionToken: string;
  warnings?: string[];
}

export interface ValidateKeyRequest {
  apiKey: string;
  provider: BYOKProvider;
  testPrompt?: string;
}

export interface ValidateKeyResponse {
  valid: boolean;
  provider: BYOKProvider;
  availableModels?: string[];
  capabilities?: string[];
  quotas?: ProviderQuotas;
  error?: string;
}

export interface ProviderQuotas {
  creditBalance?: number;
  usageToday?: number;
  usageThisMonth?: number;
  rateLimit?: RateLimits;
}

// ============================================
// Provider Configuration
// ============================================

export interface ProviderConfig {
  name: string;
  displayName: string;
  icon: string;
  color: string;
  models: ModelConfig[];
  costPerToken: number;
  baseUrl?: string;
  headers?: Record<string, string>;
  features?: string[];
  limits?: RateLimits;
}

export interface ModelConfig {
  id: string;
  name: string;
  contextLength: number;
  costPerInputToken: number;
  costPerOutputToken: number;
  capabilities?: string[];
  deprecated?: boolean;
}

// ============================================
// Analytics Types
// ============================================

export interface SessionAnalytics {
  totalSessions: number;
  activeSessions: number;
  totalTokensUsed: number;
  totalCost: number;
  totalRequests: number;
  avgSessionDuration: number;
  providerBreakdown: ProviderAnalytics[];
  dailyUsage: DailyUsage[];
  modelUsage: ModelUsageStats[];
}

export interface ProviderAnalytics {
  provider: BYOKProvider;
  sessions: number;
  tokensUsed: number;
  cost: number;
  percentage: number;
  avgResponseTime?: number;
  errorRate?: number;
}

export interface DailyUsage {
  date: string;
  sessions: number;
  tokens: number;
  requests: number;
  cost: number;
  errors?: number;
}

export interface ModelUsageStats {
  model: string;
  provider: BYOKProvider;
  requests: number;
  tokens: number;
  cost: number;
  avgLatency?: number;
}

// ============================================
// Error Types
// ============================================

export interface BYOKError {
  code: BYOKErrorCode;
  message: string;
  provider?: BYOKProvider;
  details?: Record<string, any>;
  retryable?: boolean;
  retryAfter?: number;
}

export type BYOKErrorCode =
  | "INVALID_KEY"
  | "EXPIRED_KEY"
  | "RATE_LIMIT_EXCEEDED"
  | "QUOTA_EXCEEDED"
  | "INVALID_MODEL"
  | "PROVIDER_ERROR"
  | "NETWORK_ERROR"
  | "SESSION_EXPIRED"
  | "UNAUTHORIZED"
  | "VALIDATION_ERROR";

// ============================================
// Security Types
// ============================================

export interface SecurityContext {
  sessionId: string;
  encryptedKey?: never; // Never store keys
  keyFingerprint?: string; // Hash for identification only
  expiresAt: number;
  autoWipeEnabled: boolean;
  wipeOnRouteChange: boolean;
  maxIdleTime?: number;
}

export interface SecurityAuditLog {
  timestamp: string;
  action: SecurityAction;
  sessionId: string;
  provider?: BYOKProvider;
  success: boolean;
  details?: Record<string, any>;
}

export type SecurityAction =
  | "SESSION_CREATED"
  | "SESSION_VALIDATED"
  | "SESSION_USED"
  | "SESSION_EXPIRED"
  | "SESSION_WIPED"
  | "KEY_VALIDATED"
  | "KEY_REJECTED"
  | "RATE_LIMIT_HIT"
  | "SUSPICIOUS_ACTIVITY";

// ============================================
// Demo Mode Types
// ============================================

export interface DemoSession extends BYOKSession {
  isDemoMode: true;
  demoScenario?: DemoScenario;
}

export interface DemoScenario {
  name: string;
  description: string;
  mockResponses: boolean;
  simulateErrors?: boolean;
  latencyMs?: number;
  costMultiplier?: number;
}

// ============================================
// Export utilities
// ============================================

export const PROVIDER_DISPLAY_NAMES: Record<BYOKProvider, string> = {
  openai: "OpenAI",
  anthropic: "Anthropic",
  google: "Google AI",
  azure: "Azure OpenAI",
  cohere: "Cohere",
  huggingface: "Hugging Face",
};

export const PROVIDER_ICONS: Record<BYOKProvider, string> = {
  openai: "🤖",
  anthropic: "🧠",
  google: "🌟",
  azure: "☁️",
  cohere: "🔥",
  huggingface: "🤗",
};

export const SESSION_STATUS_LABELS: Record<SessionStatus, string> = {
  active: "Active",
  inactive: "Inactive",
  expired: "Expired",
};

export const SESSION_STATUS_COLORS: Record<SessionStatus, string> = {
  active: "green",
  inactive: "gray",
  expired: "red",
};
