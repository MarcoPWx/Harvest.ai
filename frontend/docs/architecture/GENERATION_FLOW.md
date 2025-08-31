# Generation Flow & AI Gateway

This page summarizes the end-to-end generation flow and links to the API gateway specification and Storybook deep-dive diagrams.

## Sequence (Mermaid)

```mermaid
sequenceDiagram
    participant C as Creator
    participant UI as App UI (Next.js)
    participant API as API Route / MSW
    participant WS as WS/SSE

    C->>UI: Click Generate
    UI->>API: POST /api/generate {input, format, model}
    API-->>UI: 202 Accepted {jobId}
    UI->>WS: Connect jobId
    WS-->>UI: progress 10%, chunk "..."
    WS-->>UI: progress 50%, chunk "..."
    WS-->>UI: progress 100%, complete {result}
    UI-->>C: Render content + actions
```

## References

- Storybook: Specs/AI/AI Gateway — Full Specification
- Storybook: Overview/Overview (Insanely Detailed)
- Live OpenAPI: /api/openapi.json (dev)
- Snapshot OpenAPI: /docs/api/openapi.snapshot.json
