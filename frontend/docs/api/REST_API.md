# REST API Documentation

## Overview

The Harvest.ai API provides programmatic access to content transformation capabilities. The API currently supports generation, history retrieval, and developer utilities (debug endpoints, OpenAPI), with mock-first behavior in development.

## Base URL

```
Development: http://localhost:3002/api
Production: https://harvest.ai/api (planned)
```

## Authentication

Currently using Bring Your Own Key (BYOK) model - users provide their OpenAI API key with each request.

Future authentication will support:

- API Keys
- OAuth 2.0
- JWT tokens

## Endpoints

### 1. Generate Content

Transform raw content into various formats.

**Endpoint**: `POST /api/generate`

**Status**: 🟢 Implemented (Hybrid: MSW in dev, Supabase-backed where configured)

#### Request

```http
POST /api/generate
Content-Type: application/json
```

```json
{
  "input": "Your raw content to transform",
  "format": "blog|summary|email|quiz",
  "apiKey": "sk-...",
  "options": {
    "tone": "professional|casual|academic",
    "length": "short|medium|long",
    "include_seo": true,
    "target_audience": "general|technical|business",
    "language": "en"
  }
}
```

#### Request Parameters

| Parameter                 | Type    | Required | Description                              |
| ------------------------- | ------- | -------- | ---------------------------------------- |
| `input`                   | string  | Yes      | Content to transform (10-10000 chars)    |
| `format`                  | string  | Yes      | Output format type                       |
| `apiKey`                  | string  | Yes      | OpenAI API key                           |
| `options`                 | object  | No       | Additional formatting options            |
| `options.tone`            | string  | No       | Writing tone (default: "professional")   |
| `options.length`          | string  | No       | Output length (default: "medium")        |
| `options.include_seo`     | boolean | No       | Include SEO optimization for blog format |
| `options.target_audience` | string  | No       | Target audience type                     |
| `options.language`        | string  | No       | Output language (default: "en")          |

#### Response

##### Success Response (200 OK)

```json
{
  "result": "Transformed content...",
  "cost": {
    "tokens_used": 1234,
    "estimated_cost": 0.0234,
    "model_used": "gpt-4"
  },
  "quality_score": 85,
  "processing_time": 5234,
  "metadata": {
    "format": "blog",
    "input_length": 500,
    "output_length": 1200,
    "generated_at": "2024-12-28T10:30:00Z",
    "cached": false,
    "request_id": "req_abc123"
  }
}
```

##### Error Responses

###### 400 Bad Request

```json
{
  "error": "Invalid input",
  "message": "Content must be between 10 and 10000 characters",
  "code": "INVALID_INPUT"
}
```

###### 401 Unauthorized

```json
{
  "error": "Invalid API key",
  "message": "The provided API key is invalid or expired",
  "code": "INVALID_API_KEY"
}
```

###### 402 Payment Required

```json
{
  "error": "Quota exceeded",
  "message": "OpenAI account quota exceeded. Please check your billing.",
  "code": "QUOTA_EXCEEDED"
}
```

###### 429 Too Many Requests

```json
{
  "error": "Rate limit exceeded",
  "message": "Too many requests. Please try again later.",
  "code": "RATE_LIMIT_EXCEEDED",
  "retryAfter": 60
}
```

###### 500 Internal Server Error

```json
{
  "error": "Generation failed",
  "message": "An error occurred during content generation",
  "code": "GENERATION_ERROR",
  "retryAfter": 30
}
```

### 2. Format Content (Legacy)

Legacy endpoint for content formatting.

**Endpoint**: `POST /api/format`

**Status**: 🟡 Partially Implemented

#### Request

```json
{
  "content": "Content to format",
  "outputFormat": "blog|quiz|email|summary|presentation"
}
```

#### Response

```json
{
  "formatted": "Formatted content...",
  "cost": "$0.02",
  "quality": 8.5
}
```

### 3. Validate API Key (Planned)

**Endpoint**: `POST /api/validate-key`

**Status**: 🟢 Implemented

```json
{
  "apiKey": "sk-..."
}
```

### 4. Get Supported Formats (Planned)

**Endpoint**: `GET /api/formats`

**Status**: 🔴 Not Implemented

#### Response

```json
{
  "formats": [
    {
      "id": "blog",
      "name": "Blog Post",
      "description": "SEO-optimized blog post with structure",
      "status": "available",
      "examples": [...],
      "options": [...]
    }
  ]
}
```

### 5. Get Generation History (Implemented)

**Endpoint**: `GET /api/generations`

**Status**: 🔴 Not Implemented

**Authentication**: Required

#### Response

```json
{
  "history": [
    {
      "id": "gen_123",
      "created_at": "2024-12-28T10:30:00Z",
      "format": "blog",
      "input_preview": "First 100 chars...",
      "output_preview": "First 100 chars...",
      "cost": 0.023,
      "quality_score": 85
    }
  ],
  "pagination": {
    "page": 1,
    "per_page": 20,
    "total": 45
  }
}
```

### 6. Get Generation by ID (Implemented)

**Endpoint**: `GET /api/generate/{id}`

**Status**: 🟢 Implemented

### 7. Batch Generation (Planned)

**Endpoint**: `POST /api/batch`

**Status**: 🔴 Not Implemented

#### Request

```json
{
  "apiKey": "sk-...",
  "jobs": [
    {
      "input": "Content 1",
      "format": "blog"
    },
    {
      "input": "Content 2",
      "format": "blog"
    }
  ]
}
```

## Developer Utilities

### Debug & Discovery

- GET `/api/debug/endpoints` — list of implemented endpoints and a total count
- GET `/api/debug/logs` — recent in-memory logs; POST to append `{ level, message, meta }`

### OpenAPI (Swagger)

- GET `/api/openapi.json` — OpenAPI 3.0 JSON for this API

### Local-Memory Gateway (Degraded)

- POST `/api/local-memory/index` — index text locally; proxies to `${LOCAL_GATEWAY_URL:-http://localhost:3005}/local-memory/index` and falls back to in-memory
- POST `/api/local-memory/search` — search locally; proxies to `${LOCAL_GATEWAY_URL:-http://localhost:3005}/local-memory/search` and falls back to in-memory

## Rate Limiting

### Current Limits (Planned)

| Tier       | Requests/Hour | Requests/Day | Max Input Size |
| ---------- | ------------- | ------------ | -------------- |
| Free       | 10            | 50           | 5,000 chars    |
| Pro        | 100           | 1,000        | 10,000 chars   |
| Team       | 500           | 5,000        | 50,000 chars   |
| Enterprise | Unlimited     | Unlimited    | Unlimited      |

### Rate Limit Headers

```http
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1703761200
```

## Error Handling

### Error Response Format

All errors follow this structure:

```json
{
  "error": "Short error description",
  "message": "Detailed error message for debugging",
  "code": "ERROR_CODE",
  "details": {}, // Optional additional details
  "retryAfter": 60 // Optional, seconds to wait before retry
}
```

### Error Codes

| Code                  | HTTP Status | Description                     |
| --------------------- | ----------- | ------------------------------- |
| `INVALID_INPUT`       | 400         | Invalid request parameters      |
| `INVALID_FORMAT`      | 400         | Unsupported output format       |
| `CONTENT_TOO_SHORT`   | 400         | Input content too short         |
| `CONTENT_TOO_LONG`    | 400         | Input content exceeds limit     |
| `INVALID_API_KEY`     | 401         | Invalid or missing API key      |
| `UNAUTHORIZED`        | 401         | Authentication required         |
| `QUOTA_EXCEEDED`      | 402         | API quota exceeded              |
| `FORBIDDEN`           | 403         | Access denied                   |
| `NOT_FOUND`           | 404         | Resource not found              |
| `RATE_LIMIT_EXCEEDED` | 429         | Too many requests               |
| `GENERATION_ERROR`    | 500         | Content generation failed       |
| `INTERNAL_ERROR`      | 500         | Internal server error           |
| `SERVICE_UNAVAILABLE` | 503         | Service temporarily unavailable |

## Webhooks (Planned)

### Webhook Events

- `generation.completed`
- `generation.failed`
- `batch.completed`
- `quota.warning`
- `quota.exceeded`

### Webhook Payload

```json
{
  "event": "generation.completed",
  "timestamp": "2024-12-28T10:30:00Z",
  "data": {
    "generation_id": "gen_123",
    "format": "blog",
    "cost": 0.023,
    "quality_score": 85
  }
}
```

## SDK Support (Planned)

### JavaScript/TypeScript

```typescript
import { HarvestClient } from "@harvest-ai/sdk";

const client = new HarvestClient({
  apiKey: "your-api-key",
});

const result = await client.generate({
  input: "Your content",
  format: "blog",
  options: {
    tone: "professional",
  },
});
```

### Python

```python
from harvest_ai import HarvestClient

client = HarvestClient(api_key='your-api-key')

result = client.generate(
    input='Your content',
    format='blog',
    options={'tone': 'professional'}
)
```

## Testing

### Test API Key

For testing purposes, use:

```
API_KEY: test_sk_1234567890
```

This key will return mock responses without making actual API calls.

### Postman Collection

Download our [Postman Collection](https://harvest.ai/api/postman) for easy API testing.

### cURL Examples

#### Generate Blog Post

```bash
curl -X POST https://harvest.ai/api/generate \
  -H "Content-Type: application/json" \
  -d '{
    "input": "Your content here",
    "format": "blog",
    "apiKey": "sk-...",
    "options": {
      "tone": "professional"
    }
  }'
```

## Migration Guide

### From v0 to v1 (Planned)

The v1 API will introduce breaking changes:

1. Authentication moves from BYOK to API Keys
2. Response format standardization
3. New endpoint structure

Migration period: 6 months with both versions supported.

## Status Codes Summary

| Code | Meaning               |
| ---- | --------------------- |
| 200  | Success               |
| 201  | Created               |
| 204  | No Content            |
| 400  | Bad Request           |
| 401  | Unauthorized          |
| 402  | Payment Required      |
| 403  | Forbidden             |
| 404  | Not Found             |
| 429  | Too Many Requests     |
| 500  | Internal Server Error |
| 503  | Service Unavailable   |

---

Last Updated: 2025-08-28
API Version: 0.2.0 (Alpha)
Status: 🟢 Hybrid mocks + Supabase
