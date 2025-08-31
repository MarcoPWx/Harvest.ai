# Help Panel — Behavior & Wiring

This page explains how the Storybook help panel works and how to wire stories to point at relevant in-repo docs.

## Decorator

- File: .storybook/repoDocDecorator.tsx
- Reads `repoDocPath` and optional `repoDocLabel` from a story’s `parameters`
- Renders a floating help panel with a button linking to the repo docs (served under /docs)

## Usage

```tsx
export const parameters = {
  repoDocPath: "/docs/architecture/GENERATION_FLOW.md",
  repoDocLabel: "Generation Flow & AI Gateway",
};
```

## Notes

- If `repoDocPath` is relative (e.g., `architecture/GENERATION_FLOW.md`), it will be prefixed with `/docs` at runtime.
- External links (starting with http) are supported.
- Keep doc pages short and link out to deeper specs if needed.
