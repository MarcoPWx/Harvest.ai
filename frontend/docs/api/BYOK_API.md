# BYOK (Bring Your Own Key) API Documentation

## Overview

The BYOK API allows users to securely use their own API keys from various AI providers (OpenAI, Anthropic, Google, Azure) within the Harvest.ai platform. This system ensures zero-retention of keys and provides session-based ephemeral access.

## Security Guarantees

- **Zero Key Storage**: API keys are never stored in any database or logs
- **Session-Only**: Keys exist only in memory during active sessions
- **Auto-Expiry**: Sessions automatically expire after configured duration
- **Sanitized Logging**: All logs are scrubbed of sensitive information
- **Rate Limiting**: Built-in protection against abuse
- **Transport Security**: HTTPS-only with strict CSP headers

## API Endpoints

### 1. Create BYOK Session

Creates a new BYOK session with the provided API key.

**Endpoint**: `POST /api/byok/sessions`

**Request Body**:

```typescript
{
  apiKey: string;           // Your provider API key
  provider: AIProvider;     // 'openai' | 'anthropic' | 'google' | 'azure' | 'custom'
  modelId?: string;         // Optional: specific model to use
  sessionDuration?: number; // Optional: session duration in minutes (default: 60)
  metadata?: {
    capabilities?: string[];
    rateLimit?: {
      requestsPerMinute: number;
      tokensPerMinute: number;
      requestsPerDay: number;
    };
  };
}
```

**Response**:

```typescript
{
  success: true,
  data: {
    session: {
      id: string;
      provider: string;
      modelId: string;
      createdAt: string;
      expiresAt: string;
      usageCount: number;
      metadata: BYOKMetadata;
    },
    token: string;  // JWT token for subsequent requests
    warnings?: string[];
  },
  metadata: {
    requestId: string;
    timestamp: string;
    version: string;
    rateLimit: RateLimitInfo;
  }
}
```

**Example**:

```bash
curl -X POST https://api.harvest.ai/api/byok/sessions \
  -H "Content-Type: application/json" \
  -d '{
    "apiKey": "sk-...",
    "provider": "openai",
    "sessionDuration": 120
  }'
```

### 2. Validate API Key

Validates an API key with the specified provider without creating a session.

**Endpoint**: `POST /api/byok/validate`

**Request Body**:

```typescript
{
  apiKey: string;
  provider: AIProvider;
  testPrompt?: string;  // Optional: test prompt to validate
}
```

**Response**:

```typescript
{
  success: true,
  data: {
    valid: boolean;
    provider: string;
    models?: string[];      // Available models
    capabilities?: string[]; // Provider capabilities
    quotas?: {
      rateLimit?: BYOKRateLimit;
      creditBalance?: number;
      usageToday?: number;
      usageThisMonth?: number;
    };
    error?: string;         // Error message if invalid
  }
}
```

### 3. Get Session Details

Retrieves details about an active BYOK session.

**Endpoint**: `GET /api/byok/sessions/{sessionId}`

**Headers**:

```
Authorization: Bearer {sessionToken}
```

**Response**:

```typescript
{
  success: true,
  data: {
    id: string;
    provider: string;
    modelId: string;
    createdAt: string;
    expiresAt: string;
    lastUsed?: string;
    usageCount: number;
    metadata: BYOKMetadata;
  }
}
```

### 4. Delete Session

Immediately terminates a BYOK session and clears the key from memory.

**Endpoint**: `DELETE /api/byok/sessions/{sessionId}`

**Headers**:

```
Authorization: Bearer {sessionToken}
```

**Response**:

```typescript
{
  success: true,
  data: {
    message: "Session terminated successfully"
  }
}
```

### 5. Get Usage Metrics

Retrieves usage metrics for a BYOK session.

**Endpoint**: `GET /api/byok/sessions/{sessionId}/usage`

**Query Parameters**:

- `startDate`: ISO 8601 date string (optional)
- `endDate`: ISO 8601 date string (optional)

**Response**:

```typescript
{
  success: true,
  data: {
    sessionId: string;
    totalRequests: number;
    totalTokens: number;
    totalCost?: number;
    byModel: {
      [modelId: string]: {
        requests: number;
        inputTokens: number;
        outputTokens: number;
        cost?: number;
      }
    };
    byDate: {
      [date: string]: {
        date: string;
        requests: number;
        tokens: number;
        cost?: number;
      }
    };
  }
}
```

## Provider-Specific Information

### OpenAI

**Supported Models**:

- gpt-4-turbo-preview
- gpt-4
- gpt-3.5-turbo
- text-embedding-ada-002

**Key Format**: `sk-...` (48+ characters)

**Rate Limits**:

- 60 requests/minute
- 90,000 tokens/minute
- 10,000 requests/day

### Anthropic

**Supported Models**:

- claude-3-opus-20240229
- claude-3-sonnet-20240229
- claude-3-haiku-20240307

**Key Format**: `sk-ant-...`

**Rate Limits**:

- 50 requests/minute
- 100,000 tokens/minute
- 5,000 requests/day

### Google AI (Gemini)

**Supported Models**:

- gemini-pro
- gemini-pro-vision

**Key Format**: `AIza...`

**Rate Limits**:

- 60 requests/minute
- 60,000 tokens/minute
- 1,500 requests/day

### Azure OpenAI

**Requirements**:

- API Key
- Endpoint URL (must be configured separately)
- Deployment Name

**Rate Limits**: Depends on your Azure subscription

## Error Codes

| Code                   | Description                              | HTTP Status |
| ---------------------- | ---------------------------------------- | ----------- |
| `UNAUTHORIZED`         | Missing or invalid authentication        | 401         |
| `INVALID_API_KEY`      | The provided API key is invalid          | 401         |
| `INVALID_PROVIDER_KEY` | Key doesn't work with specified provider | 401         |
| `EXPIRED_SESSION`      | BYOK session has expired                 | 401         |
| `RATE_LIMIT_EXCEEDED`  | Too many requests                        | 429         |
| `QUOTA_EXCEEDED`       | Provider quota exceeded                  | 429         |
| `NOT_FOUND`            | Session not found                        | 404         |
| `INVALID_REQUEST`      | Invalid request parameters               | 400         |
| `PROVIDER_ERROR`       | Error from AI provider                   | 502         |
| `MODEL_NOT_AVAILABLE`  | Requested model not available            | 400         |

## Rate Limiting

The API implements rate limiting at multiple levels:

1. **API Level**: Limits on session creation and API calls
2. **Provider Level**: Respects provider-specific rate limits
3. **User Level**: Per-user quotas based on subscription

Rate limit information is returned in response headers:

```
X-RateLimit-Limit: 60
X-RateLimit-Remaining: 45
X-RateLimit-Reset: 1703001600
Retry-After: 60 (only on 429 responses)
```

## Security Best Practices

1. **Never share session tokens**: Treat them like passwords
2. **Use short session durations**: Minimize exposure window
3. **Rotate API keys regularly**: Update keys periodically
4. **Monitor usage**: Check metrics for unusual activity
5. **Use IP allowlisting**: Restrict access when possible
6. **Enable 2FA**: On your provider accounts
7. **Audit logs**: Review access patterns regularly

## Client SDK Usage

### JavaScript/TypeScript

```typescript
import { ApiClient } from "@/lib/api-client";

const client = new ApiClient({
  baseUrl: "https://api.harvest.ai",
  timeout: 30000,
});

// Create BYOK session
const { session, token } = await client.createBYOKSession({
  apiKey: "sk-...",
  provider: "openai",
  sessionDuration: 120,
});

// Use the session token for requests
client.setSessionToken(token);

// Get session details
const sessionInfo = await client.getBYOKSession(session.id);

// Get usage metrics
const metrics = await client.getBYOKUsageMetrics(session.id);

// Clean up when done
await client.deleteBYOKSession(session.id);
```

### cURL Examples

**Create Session**:

```bash
curl -X POST https://api.harvest.ai/api/byok/sessions \
  -H "Content-Type: application/json" \
  -d '{
    "apiKey": "sk-...",
    "provider": "openai",
    "modelId": "gpt-4-turbo-preview"
  }'
```

**Validate Key**:

```bash
curl -X POST https://api.harvest.ai/api/byok/validate \
  -H "Content-Type: application/json" \
  -d '{
    "apiKey": "sk-ant-...",
    "provider": "anthropic"
  }'
```

**Get Session**:

```bash
curl -X GET https://api.harvest.ai/api/byok/sessions/{sessionId} \
  -H "Authorization: Bearer {token}"
```

## Webhook Events

Subscribe to these events for real-time notifications:

- `byok.session.created` - New session created
- `byok.session.expired` - Session expired
- `byok.session.deleted` - Session manually deleted
- `byok.rate_limit.warning` - Approaching rate limit
- `byok.quota.warning` - Approaching quota limit

## Testing

Use these test keys in development mode:

- OpenAI: `test-openai-key` or any key starting with `sk-`
- Anthropic: `test-anthropic-key` or any key starting with `sk-ant-`
- Google: `test-google-key` or any key starting with `AIza`
- Azure: Any key longer than 20 characters

## Migration Guide

### From Direct API Calls

Before:

```javascript
const response = await fetch("https://api.openai.com/v1/chat/completions", {
  headers: {
    Authorization: `Bearer ${apiKey}`,
  },
  // ...
});
```

After:

```javascript
// Create session once
const { token } = await client.createBYOKSession({
  apiKey: apiKey,
  provider: "openai",
});

// Use session token for all requests
const response = await client.generateContent({
  prompt: "Your prompt",
  // Session token is automatically included
});
```

## FAQ

**Q: Are API keys stored anywhere?**
A: No, keys exist only in memory during active sessions and are automatically cleared on expiry.

**Q: Can I use multiple provider keys simultaneously?**
A: Yes, create separate sessions for each provider.

**Q: What happens if my session expires during a request?**
A: The request will fail with `EXPIRED_SESSION`. Create a new session to continue.

**Q: How is usage calculated?**
A: Token counts and costs are estimated based on provider pricing at the time of request.

**Q: Can I extend a session duration?**
A: No, for security reasons. Create a new session when needed.

## Support

For issues or questions:

- Documentation: [https://docs.harvest.ai/byok](https://docs.harvest.ai/byok)
- GitHub Issues: [https://github.com/harvest-ai/issues](https://github.com/harvest-ai/issues)
- Email: support@harvest.ai

## Changelog

### v1.0.0 (2024-12-29)

- Initial BYOK API release
- Support for OpenAI, Anthropic, Google, Azure providers
- Session-based key management
- Usage metrics and rate limiting
- Comprehensive testing suite
