# Swagger — Live vs Snapshot Fallback

This page explains how Swagger UI chooses between a live OpenAPI endpoint and a snapshot for offline viewing.

## Behavior

- Try live: http://localhost:3002/api/openapi.json (when `npm run dev:mock` is running)
- Fallback: /docs/api/openapi.snapshot.json

## Storybook

- See Docs/Swagger UI — the story probes the live URL and falls back to the snapshot automatically.

## Notes

- Use live when possible to catch contract drift early.
- Keep the snapshot updated in version control for offline demos and CI.
