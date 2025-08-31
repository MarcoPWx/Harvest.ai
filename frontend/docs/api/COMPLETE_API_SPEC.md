# 🔌 Harvest.ai Complete API Specification

> **Version**: 1.0.0  
> **Base URL**: `https://api.harvest.ai/v1`  
> **WebSocket URL**: `wss://ws.harvest.ai/v1`

## Table of Contents

1. [Authentication](#authentication)
2. [Content Generation](#content-generation)
3. [User Management](#user-management)
4. [Teams & Collaboration](#teams--collaboration)
5. [Templates](#templates)
6. [Billing & Subscriptions](#billing--subscriptions)
7. [WebSocket API](#websocket-api)
8. [Error Handling](#error-handling)
9. [Rate Limiting](#rate-limiting)
10. [Webhooks](#webhooks)

---

## Authentication

### Overview

Harvest.ai uses JWT-based authentication with refresh tokens. All API requests must include an `Authorization` header with a valid access token.

```http
Authorization: Bearer <access_token>
```

### Endpoints

#### POST /auth/signup

Create a new user account.

**Request:**

```json
{
  "email": "user@example.com",
  "password": "SecurePass123!",
  "name": "John Doe",
  "referral_code": "FRIEND2024",
  "marketing_consent": true
}
```

**Response (201 Created):**

```json
{
  "user": {
    "id": "usr_2n3k4m5p6q7r",
    "email": "user@example.com",
    "name": "John Doe",
    "avatar": "https://api.dicebear.com/7.x/avataaars/svg?seed=user@example.com",
    "subscription_tier": "free",
    "created_at": "2024-12-20T10:00:00Z"
  },
  "tokens": {
    "access_token": "eyJhbGciOiJIUzI1NiIs...",
    "refresh_token": "eyJhbGciOiJIUzI1NiIs...",
    "expires_in": 3600
  }
}
```

#### POST /auth/login

Authenticate existing user.

**Request:**

```json
{
  "email": "user@example.com",
  "password": "SecurePass123!",
  "remember_me": true
}
```

**Response (200 OK):**

```json
{
  "user": {
    "id": "usr_2n3k4m5p6q7r",
    "email": "user@example.com",
    "name": "John Doe",
    "avatar": "https://...",
    "subscription_tier": "pro",
    "last_login": "2024-12-20T10:00:00Z"
  },
  "tokens": {
    "access_token": "eyJhbGciOiJIUzI1NiIs...",
    "refresh_token": "eyJhbGciOiJIUzI1NiIs...",
    "expires_in": 3600
  }
}
```

#### POST /auth/refresh

Refresh access token.

**Request:**

```json
{
  "refresh_token": "eyJhbGciOiJIUzI1NiIs..."
}
```

**Response (200 OK):**

```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIs...",
  "expires_in": 3600
}
```

#### POST /auth/logout

Invalidate tokens.

**Request:**

```json
{
  "refresh_token": "eyJhbGciOiJIUzI1NiIs..."
}
```

**Response (200 OK):**

```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

#### POST /auth/forgot-password

Request password reset.

**Request:**

```json
{
  "email": "user@example.com"
}
```

**Response (200 OK):**

```json
{
  "success": true,
  "message": "Password reset email sent"
}
```

#### POST /auth/reset-password

Reset password with token.

**Request:**

```json
{
  "token": "rst_abc123def456",
  "password": "NewSecurePass456!"
}
```

**Response (200 OK):**

```json
{
  "success": true,
  "message": "Password reset successfully"
}
```

#### GET /auth/oauth/{provider}

OAuth authentication.

**Providers:** `google`, `github`, `microsoft`, `linkedin`

**Response (302 Found):**
Redirects to provider OAuth consent page.

#### GET /auth/oauth/{provider}/callback

OAuth callback handler.

**Query Parameters:**

- `code`: Authorization code
- `state`: CSRF protection token

**Response (302 Found):**
Redirects to app with tokens in URL fragment.

---

## Content Generation

### POST /generate

Generate content using AI.

**Request:**

```json
{
  "format": "blog",
  "input": "The future of renewable energy...",
  "options": {
    "model": "gpt-4",
    "tone": "professional",
    "length": "medium",
    "language": "en",
    "temperature": 0.7,
    "max_tokens": 2000,
    "audience": "general",
    "style": "informative",
    "keywords": ["solar", "wind", "sustainability"]
  },
  "metadata": {
    "project_id": "prj_xyz789",
    "tags": ["energy", "environment"]
  }
}
```

**Response (200 OK):**

```json
{
  "generation": {
    "id": "gen_abc123xyz789",
    "format": "blog",
    "status": "completed",
    "content": "# The Future of Renewable Energy\n\n...",
    "word_count": 850,
    "tokens_used": 1250,
    "model": "gpt-4",
    "created_at": "2024-12-20T10:00:00Z",
    "processing_time_ms": 3500
  },
  "usage": {
    "tokens_used": 1250,
    "tokens_remaining": 98750,
    "generations_today": 5,
    "generations_limit": 100
  }
}
```

### POST /generate/stream

Generate content with streaming response.

**Request:** Same as `/generate`

**Response (200 OK):**
Server-Sent Events stream:

```
event: start
data: {"generation_id": "gen_abc123xyz789"}

event: progress
data: {"chunk": "The future of renewable", "tokens": 5}

event: progress
data: {"chunk": " energy looks bright", "tokens": 4}

event: complete
data: {"total_tokens": 1250, "word_count": 850}
```

### POST /generate/batch

Batch content generation.

**Request:**

```json
{
  "batch": [
    {
      "id": "batch_1",
      "format": "email",
      "input": "Meeting reminder...",
      "options": {...}
    },
    {
      "id": "batch_2",
      "format": "summary",
      "input": "Long article text...",
      "options": {...}
    }
  ],
  "webhook_url": "https://example.com/webhook"
}
```

**Response (202 Accepted):**

```json
{
  "batch_id": "bat_xyz123abc",
  "status": "processing",
  "items": 2,
  "estimated_time_seconds": 30,
  "webhook_url": "https://example.com/webhook"
}
```

### GET /generate/history

Get generation history.

**Query Parameters:**

- `page`: Page number (default: 1)
- `limit`: Items per page (default: 20, max: 100)
- `format`: Filter by format
- `model`: Filter by model
- `from_date`: Start date (ISO 8601)
- `to_date`: End date (ISO 8601)
- `search`: Search in content

**Response (200 OK):**

```json
{
  "generations": [
    {
      "id": "gen_abc123xyz789",
      "format": "blog",
      "title": "The Future of Renewable Energy",
      "preview": "The future of renewable energy looks...",
      "word_count": 850,
      "model": "gpt-4",
      "created_at": "2024-12-20T10:00:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total_items": 150,
    "total_pages": 8
  }
}
```

### GET /generate/{id}

Get specific generation.

**Response (200 OK):**

```json
{
  "generation": {
    "id": "gen_abc123xyz789",
    "format": "blog",
    "content": "Full content here...",
    "input": "Original input...",
    "options": {...},
    "metadata": {...},
    "versions": [
      {
        "version": 1,
        "created_at": "2024-12-20T10:00:00Z",
        "content": "..."
      }
    ]
  }
}
```

### DELETE /generate/{id}

Delete generation.

**Response (200 OK):**

```json
{
  "success": true,
  "message": "Generation deleted successfully"
}
```

### POST /generate/{id}/export

Export generation.

**Request:**

```json
{
  "format": "pdf",
  "options": {
    "include_metadata": true,
    "watermark": false
  }
}
```

**Response (200 OK):**

```json
{
  "export_url": "https://cdn.harvest.ai/exports/gen_abc123.pdf",
  "expires_at": "2024-12-21T10:00:00Z"
}
```

---

## User Management

### GET /users/me

Get current user profile.

**Response (200 OK):**

```json
{
  "user": {
    "id": "usr_2n3k4m5p6q7r",
    "email": "user@example.com",
    "name": "John Doe",
    "avatar": "https://...",
    "bio": "AI enthusiast",
    "subscription_tier": "pro",
    "subscription_status": "active",
    "preferences": {
      "default_model": "gpt-4",
      "default_tone": "professional",
      "email_notifications": true,
      "theme": "dark"
    },
    "usage": {
      "tokens_used": 15250,
      "tokens_limit": 100000,
      "generations_count": 45,
      "generations_limit": 1000
    },
    "created_at": "2024-01-15T10:00:00Z",
    "updated_at": "2024-12-20T10:00:00Z"
  }
}
```

### PATCH /users/me

Update user profile.

**Request:**

```json
{
  "name": "Jane Doe",
  "bio": "Content creator",
  "preferences": {
    "theme": "light",
    "default_model": "claude-3-opus"
  }
}
```

**Response (200 OK):**

```json
{
  "user": {...},
  "message": "Profile updated successfully"
}
```

### DELETE /users/me

Delete user account.

**Request:**

```json
{
  "password": "CurrentPassword123!",
  "reason": "No longer needed",
  "feedback": "Optional feedback"
}
```

**Response (200 OK):**

```json
{
  "success": true,
  "message": "Account scheduled for deletion",
  "deletion_date": "2025-01-20T10:00:00Z"
}
```

### GET /users/me/api-keys

List API keys.

**Response (200 OK):**

```json
{
  "api_keys": [
    {
      "id": "key_abc123",
      "name": "Production Key",
      "key": "hv_abc123...xyz789",
      "last_4": "z789",
      "permissions": ["read", "write"],
      "last_used": "2024-12-19T15:30:00Z",
      "created_at": "2024-11-01T10:00:00Z"
    }
  ]
}
```

### POST /users/me/api-keys

Create API key.

**Request:**

```json
{
  "name": "Development Key",
  "permissions": ["read", "write"],
  "expires_at": "2025-12-31T23:59:59Z"
}
```

**Response (201 Created):**

```json
{
  "api_key": {
    "id": "key_def456",
    "name": "Development Key",
    "key": "hv_def456ghi789jkl012mno345pqr678stu901vwx234",
    "permissions": ["read", "write"],
    "expires_at": "2025-12-31T23:59:59Z"
  },
  "warning": "Store this key securely. It won't be shown again."
}
```

### DELETE /users/me/api-keys/{id}

Delete API key.

**Response (200 OK):**

```json
{
  "success": true,
  "message": "API key deleted successfully"
}
```

---

## Teams & Collaboration

### GET /teams

List user's teams.

**Response (200 OK):**

```json
{
  "teams": [
    {
      "id": "team_abc123",
      "name": "Marketing Team",
      "description": "Content creation team",
      "role": "admin",
      "members_count": 5,
      "owner": {
        "id": "usr_xyz789",
        "name": "Team Owner",
        "avatar": "https://..."
      },
      "created_at": "2024-06-15T10:00:00Z"
    }
  ]
}
```

### POST /teams

Create team.

**Request:**

```json
{
  "name": "Content Team",
  "description": "Team for content collaboration",
  "settings": {
    "default_model": "gpt-4",
    "shared_templates": true,
    "approval_required": false
  }
}
```

**Response (201 Created):**

```json
{
  "team": {
    "id": "team_def456",
    "name": "Content Team",
    "description": "Team for content collaboration",
    "invite_code": "CNT2024",
    "owner_id": "usr_2n3k4m5p6q7r",
    "settings": {...},
    "created_at": "2024-12-20T10:00:00Z"
  }
}
```

### GET /teams/{id}

Get team details.

**Response (200 OK):**

```json
{
  "team": {
    "id": "team_abc123",
    "name": "Marketing Team",
    "description": "Content creation team",
    "members": [
      {
        "id": "usr_abc123",
        "name": "John Doe",
        "email": "john@example.com",
        "role": "admin",
        "joined_at": "2024-07-01T10:00:00Z"
      }
    ],
    "usage": {
      "total_generations": 250,
      "tokens_used": 125000,
      "active_members": 4
    },
    "settings": {...}
  }
}
```

### POST /teams/{id}/invite

Invite team member.

**Request:**

```json
{
  "email": "newmember@example.com",
  "role": "editor",
  "message": "Welcome to our team!"
}
```

**Response (200 OK):**

```json
{
  "invitation": {
    "id": "inv_xyz789",
    "email": "newmember@example.com",
    "role": "editor",
    "expires_at": "2024-12-27T10:00:00Z",
    "invite_link": "https://harvest.ai/invite/xyz789"
  }
}
```

### DELETE /teams/{id}/members/{userId}

Remove team member.

**Response (200 OK):**

```json
{
  "success": true,
  "message": "Member removed successfully"
}
```

---

## Templates

### GET /templates

List templates.

**Query Parameters:**

- `category`: Filter by category
- `is_public`: Public templates only
- `team_id`: Team templates
- `search`: Search query

**Response (200 OK):**

```json
{
  "templates": [
    {
      "id": "tpl_abc123",
      "name": "Blog Post Outline",
      "description": "Standard blog post structure",
      "category": "blogging",
      "is_public": true,
      "usage_count": 1250,
      "rating": 4.5,
      "author": {
        "id": "usr_xyz",
        "name": "Template Author"
      },
      "created_at": "2024-10-15T10:00:00Z"
    }
  ]
}
```

### POST /templates

Create template.

**Request:**

```json
{
  "name": "Email Campaign",
  "description": "Marketing email template",
  "category": "marketing",
  "prompt": "Create an email campaign about {{product}} targeting {{audience}}...",
  "variables": [
    {
      "name": "product",
      "type": "text",
      "description": "Product name",
      "required": true
    },
    {
      "name": "audience",
      "type": "select",
      "options": ["B2B", "B2C", "Enterprise"],
      "default": "B2B"
    }
  ],
  "is_public": false,
  "team_id": "team_abc123"
}
```

**Response (201 Created):**

```json
{
  "template": {
    "id": "tpl_def456",
    "name": "Email Campaign",
    ...
  }
}
```

### POST /templates/{id}/use

Use template.

**Request:**

```json
{
  "variables": {
    "product": "Harvest.ai",
    "audience": "B2B"
  },
  "options": {
    "model": "gpt-4",
    "tone": "professional"
  }
}
```

**Response (200 OK):**

```json
{
  "generation": {
    "id": "gen_fromtemplate",
    "content": "Generated content from template...",
    "template_id": "tpl_def456"
  }
}
```

---

## Billing & Subscriptions

### GET /billing/subscription

Get subscription details.

**Response (200 OK):**

```json
{
  "subscription": {
    "id": "sub_abc123",
    "tier": "pro",
    "status": "active",
    "current_period_start": "2024-12-01T00:00:00Z",
    "current_period_end": "2024-12-31T23:59:59Z",
    "cancel_at_period_end": false,
    "payment_method": {
      "type": "card",
      "brand": "visa",
      "last4": "4242",
      "exp_month": 12,
      "exp_year": 2025
    },
    "limits": {
      "tokens_per_month": 100000,
      "generations_per_month": 1000,
      "team_members": 10,
      "api_requests_per_minute": 100
    }
  }
}
```

### POST /billing/subscribe

Create or update subscription.

**Request:**

```json
{
  "tier": "pro",
  "payment_method_id": "pm_abc123",
  "coupon_code": "SAVE20"
}
```

**Response (200 OK):**

```json
{
  "subscription": {...},
  "invoice": {
    "id": "inv_xyz789",
    "amount": 2320,
    "currency": "usd",
    "status": "paid"
  }
}
```

### POST /billing/cancel

Cancel subscription.

**Request:**

```json
{
  "reason": "Too expensive",
  "feedback": "Optional feedback",
  "cancel_immediately": false
}
```

**Response (200 OK):**

```json
{
  "subscription": {
    "status": "canceling",
    "cancel_at": "2024-12-31T23:59:59Z"
  }
}
```

### GET /billing/invoices

List invoices.

**Response (200 OK):**

```json
{
  "invoices": [
    {
      "id": "inv_abc123",
      "number": "INV-2024-001",
      "amount": 2900,
      "currency": "usd",
      "status": "paid",
      "pdf_url": "https://cdn.harvest.ai/invoices/inv_abc123.pdf",
      "created_at": "2024-12-01T00:00:00Z"
    }
  ]
}
```

### GET /billing/usage

Get usage statistics.

**Response (200 OK):**

```json
{
  "usage": {
    "period": {
      "start": "2024-12-01T00:00:00Z",
      "end": "2024-12-31T23:59:59Z"
    },
    "tokens": {
      "used": 45250,
      "limit": 100000,
      "percentage": 45.25
    },
    "generations": {
      "count": 156,
      "limit": 1000,
      "by_format": {
        "blog": 45,
        "email": 32,
        "summary": 79
      }
    },
    "api_calls": {
      "count": 1250,
      "limit": 10000
    },
    "daily_breakdown": [
      {
        "date": "2024-12-01",
        "tokens": 1500,
        "generations": 5
      }
    ]
  }
}
```

---

## WebSocket API

### Connection

```javascript
const ws = new WebSocket("wss://ws.harvest.ai/v1?token=ACCESS_TOKEN");
```

### Authentication

Send immediately after connection:

```json
{
  "type": "auth",
  "token": "ACCESS_TOKEN"
}
```

### Message Types

#### Client → Server

**Subscribe to channel:**

```json
{
  "type": "subscribe",
  "channel": "generations",
  "filters": {
    "user_id": "usr_abc123",
    "team_id": "team_xyz789"
  }
}
```

**Start generation with streaming:**

```json
{
  "type": "generation_start",
  "request_id": "req_abc123",
  "data": {
    "format": "blog",
    "input": "Content here...",
    "options": {...}
  }
}
```

**Cancel generation:**

```json
{
  "type": "generation_cancel",
  "generation_id": "gen_abc123"
}
```

**Ping (keep-alive):**

```json
{
  "type": "ping"
}
```

#### Server → Client

**Connection established:**

```json
{
  "type": "connected",
  "session_id": "sess_abc123",
  "server_time": "2024-12-20T10:00:00Z"
}
```

**Subscription confirmed:**

```json
{
  "type": "subscribed",
  "channel": "generations",
  "subscription_id": "sub_xyz789"
}
```

**Generation progress:**

```json
{
  "type": "generation_progress",
  "generation_id": "gen_abc123",
  "progress": 45,
  "estimated_remaining_seconds": 3
}
```

**Generation chunk (streaming):**

```json
{
  "type": "generation_chunk",
  "generation_id": "gen_abc123",
  "chunk": "The future of AI",
  "chunk_index": 5,
  "tokens": 4
}
```

**Generation complete:**

```json
{
  "type": "generation_complete",
  "generation_id": "gen_abc123",
  "content": "Full generated content...",
  "tokens_used": 1250,
  "processing_time_ms": 3500
}
```

**Generation error:**

```json
{
  "type": "generation_error",
  "generation_id": "gen_abc123",
  "error": {
    "code": "RATE_LIMIT",
    "message": "Rate limit exceeded",
    "retry_after": 60
  }
}
```

**Real-time notification:**

```json
{
  "type": "notification",
  "notification": {
    "id": "notif_abc123",
    "type": "team_invite",
    "title": "Team Invitation",
    "message": "You've been invited to join Marketing Team",
    "action_url": "/teams/invite/xyz789",
    "created_at": "2024-12-20T10:00:00Z"
  }
}
```

**Pong (keep-alive response):**

```json
{
  "type": "pong",
  "server_time": "2024-12-20T10:00:00Z"
}
```

### WebSocket Error Codes

| Code | Description      | Action                 |
| ---- | ---------------- | ---------------------- |
| 1000 | Normal closure   | Reconnect if needed    |
| 1001 | Going away       | Reconnect with backoff |
| 1002 | Protocol error   | Check implementation   |
| 1003 | Unsupported data | Check message format   |
| 1006 | Abnormal closure | Reconnect with backoff |
| 1008 | Policy violation | Check authentication   |
| 1011 | Server error     | Retry with backoff     |
| 4000 | Invalid token    | Re-authenticate        |
| 4001 | Token expired    | Refresh token          |
| 4002 | Rate limited     | Wait before reconnect  |
| 4003 | Invalid message  | Check message format   |

---

## Error Handling

### Error Response Format

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input provided",
    "details": {
      "field": "email",
      "reason": "Invalid email format"
    },
    "request_id": "req_abc123xyz",
    "documentation_url": "https://docs.harvest.ai/errors/VALIDATION_ERROR"
  }
}
```

### Common Error Codes

| Code                | HTTP Status | Description                     |
| ------------------- | ----------- | ------------------------------- |
| UNAUTHORIZED        | 401         | Authentication required         |
| FORBIDDEN           | 403         | Insufficient permissions        |
| NOT_FOUND           | 404         | Resource not found              |
| VALIDATION_ERROR    | 400         | Invalid input                   |
| RATE_LIMITED        | 429         | Too many requests               |
| QUOTA_EXCEEDED      | 402         | Usage limit reached             |
| SERVER_ERROR        | 500         | Internal server error           |
| SERVICE_UNAVAILABLE | 503         | Service temporarily unavailable |
| TIMEOUT             | 504         | Request timeout                 |
| CONFLICT            | 409         | Resource conflict               |
| UNSUPPORTED_MODEL   | 400         | Model not available             |
| CONTENT_FILTERED    | 400         | Content violates policies       |

---

## Rate Limiting

### Headers

All responses include rate limit headers:

```http
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1703068800
X-RateLimit-Reset-After: 3600
X-RateLimit-Bucket: api_general
```

### Rate Limits by Tier

| Endpoint               | Free    | Pro      | Enterprise |
| ---------------------- | ------- | -------- | ---------- |
| /generate              | 10/hour | 100/hour | 1000/hour  |
| /api/\*                | 100/min | 500/min  | 2000/min   |
| WebSocket connections  | 1       | 5        | 20         |
| Concurrent generations | 1       | 3        | 10         |

### Rate Limit Response

```json
{
  "error": {
    "code": "RATE_LIMITED",
    "message": "Rate limit exceeded",
    "retry_after": 60,
    "limit": 100,
    "remaining": 0,
    "reset_at": "2024-12-20T11:00:00Z"
  }
}
```

---

## Webhooks

### Webhook Events

Configure webhooks in account settings to receive real-time events.

### Event Types

- `generation.completed` - Generation finished
- `generation.failed` - Generation failed
- `subscription.updated` - Subscription changed
- `team.member.added` - Team member joined
- `team.member.removed` - Team member left
- `usage.limit.warning` - 80% of limit reached
- `usage.limit.exceeded` - Limit exceeded
- `payment.succeeded` - Payment processed
- `payment.failed` - Payment failed

### Webhook Payload

```json
{
  "id": "evt_abc123xyz789",
  "type": "generation.completed",
  "created_at": "2024-12-20T10:00:00Z",
  "data": {
    "generation_id": "gen_abc123",
    "user_id": "usr_xyz789",
    "format": "blog",
    "tokens_used": 1250
  }
}
```

### Webhook Security

Verify webhook signatures:

```javascript
const crypto = require("crypto");

function verifyWebhook(payload, signature, secret) {
  const hmac = crypto.createHmac("sha256", secret);
  hmac.update(payload);
  const digest = hmac.digest("hex");
  return signature === `sha256=${digest}`;
}
```

### Webhook Headers

```http
X-Harvest-Signature: sha256=abc123...
X-Harvest-Event: generation.completed
X-Harvest-Delivery: dlv_xyz789
```

---

## SDK Examples

### JavaScript/TypeScript

```typescript
import { HarvestClient } from "@harvest-ai/sdk";

const client = new HarvestClient({
  apiKey: "hv_abc123...",
  baseUrl: "https://api.harvest.ai/v1",
});

// Generate content
const generation = await client.generate({
  format: "blog",
  input: "The future of AI...",
  options: {
    model: "gpt-4",
    tone: "professional",
  },
});

// Stream generation
const stream = await client.generateStream({
  format: "blog",
  input: "The future of AI...",
});

for await (const chunk of stream) {
  console.log(chunk.text);
}
```

### Python

```python
from harvest_ai import HarvestClient

client = HarvestClient(
    api_key='hv_abc123...',
    base_url='https://api.harvest.ai/v1'
)

# Generate content
generation = client.generate(
    format='blog',
    input='The future of AI...',
    options={
        'model': 'gpt-4',
        'tone': 'professional'
    }
)

# Stream generation
for chunk in client.generate_stream(
    format='blog',
    input='The future of AI...'
):
    print(chunk.text, end='')
```

### cURL

```bash
# Generate content
curl -X POST https://api.harvest.ai/v1/generate \
  -H "Authorization: Bearer ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "format": "blog",
    "input": "The future of AI...",
    "options": {
      "model": "gpt-4",
      "tone": "professional"
    }
  }'

# Stream generation with Server-Sent Events
curl -N https://api.harvest.ai/v1/generate/stream \
  -H "Authorization: Bearer ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -H "Accept: text/event-stream" \
  -d '{"format": "blog", "input": "The future of AI..."}'
```

---

## API Versioning

The API uses URL versioning. The current version is `v1`.

### Version Header

Include version in header (optional):

```http
X-API-Version: 1.0.0
```

### Deprecation Policy

- APIs are supported for minimum 12 months
- Deprecation notices sent 6 months in advance
- Migration guides provided for breaking changes

---

## Idempotency

For POST requests, include idempotency key:

```http
Idempotency-Key: unique-request-id
```

Server returns same response for repeated requests with same key within 24 hours.

---

## Pagination

Standard pagination parameters:

- `page`: Page number (default: 1)
- `limit`: Items per page (default: 20, max: 100)
- `sort`: Sort field (e.g., `created_at`)
- `order`: Sort order (`asc` or `desc`)

Response includes pagination metadata:

```json
{
  "data": [...],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total_items": 150,
    "total_pages": 8,
    "has_next": true,
    "has_previous": false
  }
}
```

---

## Compression

API supports gzip compression. Include header:

```http
Accept-Encoding: gzip
```

Response will include:

```http
Content-Encoding: gzip
```

---

## CORS

API supports CORS for browser-based applications.

Allowed origins:

- `https://*.harvest.ai`
- `http://localhost:*` (development)

Custom origins can be configured in account settings.

---

## Status Page

Check API status at: https://status.harvest.ai

Subscribe to incidents via:

- Email
- Slack
- Webhook

---

## Support

- Documentation: https://docs.harvest.ai
- API Status: https://status.harvest.ai
- Support: support@harvest.ai
- Discord: https://discord.gg/harvest-ai

---

_Last Updated: December 2024 | API Version: 1.0.0_
