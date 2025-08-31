/**
 * BYOK Validators
 * Validate API keys with different AI providers
 */

import { AIProvider, BYOKRateLimit } from "@/types/api";

export interface ValidationResult {
  valid: boolean;
  error?: string;
  defaultModel?: string;
  capabilities?: string[];
  rateLimit?: BYOKRateLimit;
  warnings?: string[];
}

/**
 * Validate an API key with the specified provider
 * In production, this would make actual API calls to validate
 */
export async function validateApiKey(
  apiKey: string,
  provider: AIProvider,
): Promise<ValidationResult> {
  // Sanitize the key for logging (never log full keys)
  const keyPrefix = apiKey.substring(0, 8);

  try {
    switch (provider) {
      case "openai":
        return await validateOpenAIKey(apiKey);

      case "anthropic":
        return await validateAnthropicKey(apiKey);

      case "google":
        return await validateGoogleKey(apiKey);

      case "azure":
        return await validateAzureKey(apiKey);

      case "custom":
        return validateCustomKey(apiKey);

      default:
        return {
          valid: false,
          error: `Unsupported provider: ${provider}`,
        };
    }
  } catch (error) {
    console.error(`Validation error for ${provider} key ${keyPrefix}...`, error);
    return {
      valid: false,
      error: "Failed to validate API key",
    };
  }
}

async function validateOpenAIKey(apiKey: string): Promise<ValidationResult> {
  // In development, accept keys starting with 'sk-' or 'test-'
  if (process.env.NODE_ENV === "development") {
    if (apiKey.startsWith("sk-") || apiKey.startsWith("test-")) {
      return {
        valid: true,
        defaultModel: "gpt-4-turbo-preview",
        capabilities: ["chat", "completion", "embedding", "vision"],
        rateLimit: {
          requestsPerMinute: 60,
          tokensPerMinute: 90000,
          requestsPerDay: 10000,
        },
        warnings:
          process.env.NODE_ENV === "development"
            ? ["Using mock validation in development mode"]
            : undefined,
      };
    }
  }

  // In test mode, accept keys starting with 'sk-' or 'test-'
  if (process.env.NODE_ENV === "test") {
    if (apiKey.startsWith("sk-") || apiKey.startsWith("test-")) {
      return {
        valid: true,
        defaultModel: "gpt-4-turbo-preview",
        capabilities: ["chat", "completion", "embedding", "vision"],
        rateLimit: {
          requestsPerMinute: 60,
          tokensPerMinute: 90000,
          requestsPerDay: 10000,
        },
        warnings: ["Using mock validation in development mode"],
      };
    }
  }

  // In production, make actual API call to OpenAI
  if (process.env.NODE_ENV === "production") {
    try {
      const response = await fetch("https://api.openai.com/v1/models", {
        headers: {
          Authorization: `Bearer ${apiKey}`,
        },
        signal: AbortSignal.timeout(5000),
      });

      if (response.ok) {
        const data = await response.json();
        const models = data.data?.map((m: any) => m.id) || [];

        return {
          valid: true,
          defaultModel: models.includes("gpt-4-turbo-preview")
            ? "gpt-4-turbo-preview"
            : "gpt-3.5-turbo",
          capabilities: ["chat", "completion", "embedding"],
          rateLimit: {
            requestsPerMinute: 60,
            tokensPerMinute: 90000,
            requestsPerDay: 10000,
          },
        };
      }

      return {
        valid: false,
        error:
          response.status === 401
            ? "Invalid OpenAI API key"
            : `OpenAI API error: ${response.status}`,
      };
    } catch (error) {
      return {
        valid: false,
        error: "Failed to validate with OpenAI",
      };
    }
  }

  // Default: invalid key
  return {
    valid: false,
    error: "Failed to validate with OpenAI",
  };
}

async function validateAnthropicKey(apiKey: string): Promise<ValidationResult> {
  // In development/test, accept keys starting with 'sk-ant-' or 'test-'
  if (process.env.NODE_ENV === "development" || process.env.NODE_ENV === "test") {
    if (apiKey.startsWith("sk-ant-") || apiKey.startsWith("test-")) {
      return {
        valid: true,
        defaultModel: "claude-3-opus-20240229",
        capabilities: ["chat", "completion", "vision"],
        rateLimit: {
          requestsPerMinute: 50,
          tokensPerMinute: 100000,
          requestsPerDay: 5000,
        },
        warnings:
          process.env.NODE_ENV === "development"
            ? ["Using mock validation in development mode"]
            : undefined,
      };
    }
  }

  // In production, make actual API call to Anthropic
  if (process.env.NODE_ENV === "production") {
    try {
      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "x-api-key": apiKey,
          "anthropic-version": "2023-06-01",
          "content-type": "application/json",
        },
        body: JSON.stringify({
          model: "claude-3-haiku-20240307",
          messages: [{ role: "user", content: "Hi" }],
          max_tokens: 1,
        }),
        signal: AbortSignal.timeout(5000),
      });

      // Anthropic returns 400 for valid key with minimal request
      if (response.status === 400 || response.ok) {
        return {
          valid: true,
          defaultModel: "claude-3-opus-20240229",
          capabilities: ["chat", "completion", "vision"],
          rateLimit: {
            requestsPerMinute: 50,
            tokensPerMinute: 100000,
            requestsPerDay: 5000,
          },
        };
      }

      return {
        valid: false,
        error:
          response.status === 401
            ? "Invalid Anthropic API key"
            : `Anthropic API error: ${response.status}`,
      };
    } catch (error) {
      return {
        valid: false,
        error: "Failed to validate with Anthropic",
      };
    }
  }

  // Default: invalid key
  return {
    valid: false,
    error: "Failed to validate with Anthropic",
  };
}

async function validateGoogleKey(apiKey: string): Promise<ValidationResult> {
  // In development/test, accept test keys
  if (process.env.NODE_ENV === "development" || process.env.NODE_ENV === "test") {
    if (apiKey.startsWith("AIza") || apiKey.startsWith("test-")) {
      return {
        valid: true,
        defaultModel: "gemini-pro",
        capabilities: ["chat", "completion", "vision"],
        rateLimit: {
          requestsPerMinute: 60,
          tokensPerMinute: 60000,
          requestsPerDay: 1500,
        },
        warnings:
          process.env.NODE_ENV === "development"
            ? ["Using mock validation in development mode"]
            : undefined,
      };
    }
  }

  // In production, validate with Google AI
  if (process.env.NODE_ENV === "production") {
    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`,
        {
          signal: AbortSignal.timeout(5000),
        },
      );

      if (response.ok) {
        return {
          valid: true,
          defaultModel: "gemini-pro",
          capabilities: ["chat", "completion", "vision"],
          rateLimit: {
            requestsPerMinute: 60,
            tokensPerMinute: 60000,
            requestsPerDay: 1500,
          },
        };
      }

      return {
        valid: false,
        error:
          response.status === 403
            ? "Invalid Google AI API key"
            : `Google AI API error: ${response.status}`,
      };
    } catch (error) {
      return {
        valid: false,
        error: "Failed to validate with Google AI",
      };
    }
  }

  // Default: invalid key
  return {
    valid: false,
    error: "Failed to validate with Google AI",
  };
}

async function validateAzureKey(apiKey: string): Promise<ValidationResult> {
  // Azure OpenAI requires endpoint URL as well
  // For now, we'll do basic validation

  if (process.env.NODE_ENV === "development" || process.env.NODE_ENV === "test") {
    if (apiKey.length > 20) {
      return {
        valid: true,
        defaultModel: "gpt-4",
        capabilities: ["chat", "completion", "embedding"],
        rateLimit: {
          requestsPerMinute: 60,
          tokensPerMinute: 90000,
          requestsPerDay: 10000,
        },
        warnings: [
          "Azure OpenAI requires endpoint URL configuration",
          process.env.NODE_ENV === "development" ? "Using mock validation in development mode" : "",
        ].filter(Boolean),
      };
    }
  }

  return {
    valid: false,
    error: "Azure OpenAI validation requires additional configuration",
  };
}

function validateCustomKey(apiKey: string): ValidationResult {
  // For custom providers, do basic validation
  if (apiKey && apiKey.length > 10) {
    return {
      valid: true,
      defaultModel: "custom",
      capabilities: ["chat"],
      rateLimit: {
        requestsPerMinute: 30,
        tokensPerMinute: 30000,
        requestsPerDay: 1000,
      },
      warnings: ["Custom provider - limited validation available"],
    };
  }

  return {
    valid: false,
    error: "Invalid custom API key format",
  };
}

/**
 * Check if a key format matches a known provider
 */
export function detectProvider(apiKey: string): AIProvider | null {
  // OpenAI keys: sk- followed by at least 40 chars total
  if (apiKey.startsWith("sk-") && apiKey.length >= 43) {
    // But not Anthropic keys
    if (!apiKey.startsWith("sk-ant-")) {
      return "openai";
    }
  }

  if (apiKey.startsWith("sk-ant-")) {
    return "anthropic";
  }

  if (apiKey.startsWith("AIza")) {
    return "google";
  }

  // Azure keys don't have a specific format
  return null;
}

/**
 * Estimate token count for a text
 * This is a rough approximation
 */
export function estimateTokens(text: string): number {
  if (!text || text.length === 0) {
    return 0;
  }
  // Rough estimate: 1 token ≈ 4 characters
  return Math.ceil(text.length / 4);
}

/**
 * Calculate cost estimate based on token usage
 */
export function calculateCost(
  provider: AIProvider,
  model: string,
  inputTokens: number,
  outputTokens: number,
): number {
  // Prices per 1M tokens (approximate)
  const pricing: Record<string, { input: number; output: number }> = {
    "openai:gpt-4-turbo-preview": { input: 10, output: 30 },
    "openai:gpt-3.5-turbo": { input: 0.5, output: 1.5 },
    "anthropic:claude-3-opus": { input: 15, output: 75 },
    "anthropic:claude-3-sonnet": { input: 3, output: 15 },
    "google:gemini-pro": { input: 0.5, output: 1.5 },
  };

  const key = `${provider}:${model}`;
  const price = pricing[key] || { input: 1, output: 2 };

  return (inputTokens * price.input + outputTokens * price.output) / 1_000_000;
}
