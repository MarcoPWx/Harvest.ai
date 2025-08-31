# BYOK Runbook

## Purpose
Operational procedures for Bring Your Own Key (BYOK) handling with zero-knowledge guarantees.

## Principles
- Keys never persisted server-side.
- Scrub sensitive fields from logs.
- Client-side encryption preferred.

## Procedures
1. Key Entry (Frontend)
   - Store in localStorage (encrypted) with SubtleCrypto.
   - Warn users: Keys used only for active requests.
2. Key Use (API)
   - Accept `apiKey` in request body.
   - Disable logging for body or scrub `apiKey` before logging.
   - Use key only for outbound provider request.
3. Error Handling
   - Mask keys in error messages.
   - Return generic errors; no stack traces in prod.
4. Auditing
   - Log request metadata (format, latency) without sensitive fields.
5. Rotation
   - Provide UI flow to clear/replace local key.

## Verification Checklist
- [ ] No server-side persistence of keys
- [ ] Logs scrubbed of secrets
- [ ] TLS enforced end-to-end
- [ ] Rate limiting enabled
- [ ] Error responses generic
