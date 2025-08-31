# Harvest.ai Architecture Overview

## Mermaid Diagram

```mermaid
flowchart TD
  subgraph Client["Client (Browser)"]
    UI["Next.js UI"]
    BYOK["BYOK Manager (localStorage + SubtleCrypto)"]
  end

  subgraph Frontend["Next.js API Routes"]
    GEN["/api/generate"]
    FMT["/api/format"]
  end

  subgraph Providers["AI Providers"]
    OAI["OpenAI"]
    ANTH["Anthropic (future)"]
    OLL["Ollama (local)"]
  end

  subgraph Data["Data (Non-sensitive)"]
    SUPA[("Supabase (Templates, Metadata)")]
  end

  UI --> GEN
  BYOK --> GEN
  GEN --> OAI
  GEN --> FMT
  GEN --> SUPA

  classDef note fill:#f6f8fa,stroke:#bbb,color:#333
  classDef secure fill:#d1fae5,stroke:#10b981,color:#065f46

  class BYOK secure
  class OAI,ANTH,OLL,SUPA note
```

## ASCII Sketch

```
+-------------------+         +------------------------+
|  Client (Browser) |         |   Next.js API Routes   |
|  - UI             |  HTTP   |  /api/generate         |
|  - BYOK Manager   +-------->+  /api/format           |
|  (localStorage)   |         |                        |
+-------------------+         +------------------------+
                                      |
                                      | Using user's API key (BYOK)
                                      v
                              +------------------+
                              |   OpenAI (API)   |
                              +------------------+
                                      |
                                      | Non-sensitive metadata only
                                      v
                              +------------------------+
                              |    Supabase (DB)       |
                              | Templates / Metadata   |
                              +------------------------+
```

## Security Notes
- Zero-knowledge BYOK: Keys live in browser; never persisted server-side.
- Disable logging for requests containing keys; scrub middleware where needed.
- Session-only handling for inputs/outputs; no user content persistence.
- Prefer direct provider calls from edge when feasible.

## Data Flow
1. User provides content + selects format in UI.
2. UI includes BYOK key in the request to `/api/generate`.
3. API proxies to OpenAI using the user key; returns result.
4. Non-sensitive metadata stored in Supabase for analytics (optional).
