import React from "react";

// Decorator that shows a Presenter Guide overlay when globals.presenterGuide is true.
// On first activation per page load, it will route Storybook to Labs/Index docs.
export const presenterGuideDecorator = (Story: any, context: any) => {
  const enabled: boolean = Boolean(context?.globals?.presenterGuide);
  const [visible, setVisible] = React.useState(enabled);
  const [firstRunDone, setFirstRunDone] = React.useState(false);

  // Keep local visibility in sync with toolbar toggle
  React.useEffect(() => {
    setVisible(enabled);
  }, [enabled]);

  // Helper to set/merge a global in the URL (top window)
  function setGlobalInUrl(name: string, value: string) {
    try {
      const top = (window.top || window) as Window;
      const url = new URL(top.location.href);
      const globalsParam = url.searchParams.get("globals") || "";
      const parts = globalsParam
        .split(",")
        .map((p) => p.trim())
        .filter(Boolean)
        .filter((p) => !p.startsWith(`${name}:`));
      parts.push(`${name}:${value}`);
      url.searchParams.set("globals", parts.join(","));
      top.location.replace(url.toString());
    } catch {}
  }

  // On first activation, navigate to Labs/Index docs (unless presenter=labs is set)
  React.useEffect(() => {
    if (!enabled || firstRunDone) return;
    setFirstRunDone(true);
    try {
      const top = (window.top || window) as Window;
      const url = new URL(top.location.href);
      const mode = url.searchParams.get("presenter") || "";
      const target = `${top.location.origin}${top.location.pathname}?path=/docs/labs-index--docs`;
      // Only redirect if not already on Labs Index and not explicitly in 'labs' mode
      if (!top.location.href.includes("/docs/labs-index--docs") && mode !== "labs") {
        top.location.assign(target);
      }
    } catch {}
  }, [enabled, firstRunDone]);

  // If the URL has tour=1 (or true/start/auto), auto-enable presenter overlay (once)
  React.useEffect(() => {
    try {
      const top = (window.top || window) as Window;
      const url = new URL(top.location.href);
      const tourParam = (url.searchParams.get("tour") || "").toLowerCase();
      const shouldEnable = ["1", "true", "start", "auto"].includes(tourParam);
      if (shouldEnable && !enabled) {
        // Toggle presenter on and stay on Labs
        const globalsParam = url.searchParams.get("globals") || "";
        const parts = globalsParam
          .split(",")
          .map((p) => p.trim())
          .filter(Boolean)
          .filter((p) => !p.startsWith("presenterGuide:"));
        parts.push("presenterGuide:true");
        url.searchParams.set("globals", parts.join(","));
        url.searchParams.set("presenter", "labs");
        if (!url.searchParams.get("path")) {
          url.searchParams.set("path", "/docs/labs-index--docs");
        }
        top.location.replace(url.toString());
      }
      // Optional: if msw=1 present, open MSW Info overlay by default
      const mswParam = (url.searchParams.get("msw") || "").toLowerCase();
      if (["1", "true", "on", "open"].includes(mswParam)) {
        setGlobalInUrl("mswInfo", "open");
      }
    } catch {}
    // run only once on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Hotkeys: 'g' 'g' toggles presenter; 'Escape' closes overlay
  React.useEffect(() => {
    function setPresenter(value: boolean, keepOnLabs?: boolean) {
      try {
        const top = (window.top || window) as Window;
        const url = new URL(top.location.href);
        // parse globals param as comma-separated key:value pairs
        const globalsParam = url.searchParams.get("globals") || "";
        const parts = globalsParam
          .split(",")
          .map((p) => p.trim())
          .filter(Boolean);
        const filtered = parts.filter((p) => !p.startsWith("presenterGuide:"));
        if (value) filtered.push("presenterGuide:true");
        const next = filtered.join(",");
        if (next) url.searchParams.set("globals", next);
        else url.searchParams.delete("globals");
        if (keepOnLabs) url.searchParams.set("presenter", "labs");
        else url.searchParams.delete("presenter");
        // Preserve current path; Storybook will update globals on navigation
        top.location.replace(url.toString());
      } catch {}
    }

    let lastG = 0;
    function onKey(e: KeyboardEvent) {
      // If focus is in an input/textarea/contenteditable, ignore
      const t = e.target as HTMLElement | null;
      const tag = (t?.tagName || "").toLowerCase();
      const isEditable =
        tag === "input" || tag === "textarea" || (t && (t as any).isContentEditable);
      if (isEditable) return;

      if (e.key === "Escape") {
        if (enabled) setPresenter(false);
        return;
      }
      if (e.key === "ArrowLeft" && enabled) {
        e.preventDefault();
        try { navTo(Math.max(0, stepIndex - 1)); } catch {}
        return;
      }
      if (e.key === "ArrowRight" && enabled) {
        e.preventDefault();
        try { navTo(Math.min(steps.length - 1, stepIndex + 1)); } catch {}
        return;
      }
      if (e.key.toLowerCase() === "g") {
        const now = Date.now();
        if (now - lastG < 600) {
          // toggle presenter; keepOnLabs=true to avoid auto-jump
          setPresenter(!enabled, true);
          lastG = 0;
        } else {
          lastG = now;
        }
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [enabled, stepIndex]);

  // Presenter steps (narrative path with "why it matters" bullets)
  const steps: Array<{
    slug: string;
    title: string;
    why: string[];
  }> = [
    {
      slug: "labs-index--docs",
      title: "Labs/Index — Orientation",
      why: [
        "Single index to all live labs and docs",
        "Presenter hotkeys and Start button available here",
      ],
    },
    {
      slug: "journeys-index--docs",
      title: "Journeys/Index — UJDD",
      why: [
        "We start with user journeys to frame acceptance",
        "Mock‑first keeps flows deterministic and safe",
      ],
    },
    {
      slug: "journeys-tdd-msw--docs",
      title: "Journeys/TDD & MSW — Workflow",
      why: [
        "Failing test → minimal change → green → refactor",
        "MSW handlers enable fast, offline iteration",
      ],
    },
    {
      slug: "s2s-index--docs",
      title: "S2S/Index — JSON & SSE",
      why: [
        "Dual-mode endpoints and events mirror journey steps",
        "Triggers (429/500/cached) are demonstrable",
      ],
    },
    {
      slug: "command-center-s2s-streaming-threads--docs",
      title: "Command Center/S2S — Live",
      why: [
        "Show streaming progress (meta/token/final/done)",
        "Validate error handling and cache bypass",
      ],
    },
    {
      slug: "labs-ai-service-lab--docs",
      title: "AI Service Lab — Fallback & Cache",
      why: [
        "Explain provider fallback chain",
        "Demonstrate caching and quality scoring",
      ],
    },
    {
      slug: "labs-provider-adapters-lab--docs",
      title: "Provider Adapters — Toggle Real SDKs",
      why: [
        "PROVIDERS_ON flips to real SDKs when keys exist",
        "Explain secrets in env and CSP connect-src",
      ],
    },
    {
      slug: "docs-user-journeys--docs",
      title: "Docs/User Journeys — Deterministic",
      why: [
        "Run happy/error/cached flows with x-mock-* headers",
        "Great fallback if live server is flaky",
      ],
    },
    {
      slug: "labs-security-lab--docs",
      title: "Security Lab — Headers & CSP",
      why: [
        "Secure defaults: HSTS, CSP, COOP/COEP",
        "Only widen connect-src when enabling real providers",
      ],
    },
    {
      slug: "docs-observability-playground--docs",
      title: "Observability — Structured Logs",
      why: [
        "Show request_id, stream events, and counters",
        "Local /api/metrics JSON for quick insight",
      ],
    },
    {
      slug: "docs-status-dashboard--docs",
      title: "Status Dashboard — CI Artifacts",
      why: [
        "Badges for unit/E2E/storybook",
        "Links to coverage and Playwright report",
      ],
    },
    {
      slug: "agent-boot--docs",
      title: "Agent Boot — Guardrails",
      why: [
        "Single page contract for how the agent works",
        "References canonical docs (DevLog/Epics/Status)",
      ],
    },
    {
      slug: "labs-agent-showcase--docs",
      title: "Agent Showcase — Interview",
      why: [
        "Short talk track and agenda in one place",
        "Use with Presenter overlay for smooth flow",
      ],
    },
    {
      slug: "labs-technology-overview-lab--docs",
      title: "Technology Overview — Stack",
      why: [
        "Real code references linked",
        "Wrap-up with architecture view",
      ],
    },
  ];

  const [stepIndex, setStepIndex] = React.useState<number>(() => {
    try {
      const url = new URL((window.top || window).location.href);
      const v = Number(url.searchParams.get("presenterStep") || "0");
      return Number.isFinite(v) && v >= 0 && v < steps.length ? v : 0;
    } catch {
      return 0;
    }
  });

  React.useEffect(() => {
    if (!enabled) return;
    // Sync from URL when overlay opens
    try {
      const url = new URL((window.top || window).location.href);
      const v = Number(url.searchParams.get("presenterStep") || "0");
      if (Number.isFinite(v) && v >= 0 && v < steps.length) setStepIndex(v);
    } catch {}
  }, [enabled]);

  function navTo(idx: number) {
    if (idx < 0 || idx >= steps.length) return;
    setStepIndex(idx);
    try {
      const top = (window.top || window) as Window;
      const url = new URL(top.location.href);
      url.searchParams.set("path", `/docs/${steps[idx].slug}`);
      // Keep presenter overlay on and stay in 'labs' mode for minimal auto-jump
      const globalsParam = url.searchParams.get("globals") || "";
      const parts = globalsParam
        .split(",")
        .map((p) => p.trim())
        .filter(Boolean)
        .filter((p) => !p.startsWith("presenterGuide:"));
      parts.push("presenterGuide:true");
      url.searchParams.set("globals", parts.join(","));
      url.searchParams.set("presenter", "labs");
      url.searchParams.set("presenterStep", String(idx));
      top.location.assign(url.toString());
    } catch {}
  }

  // Simple overlay UI with agenda and quick links
  const overlay = (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9998,
        background: "rgba(0,0,0,0.45)",
        display: visible ? "flex" : "none",
        alignItems: "center",
        justifyContent: "center",
        padding: 16,
      }}
      role="dialog"
      aria-label="Presenter Guide"
    >
      <div
        style={{
          width: "min(1100px, 96vw)",
          maxHeight: "90vh",
          overflow: "auto",
          background: "#fff",
          borderRadius: 10,
          boxShadow: "0 12px 40px rgba(0,0,0,0.25)",
          padding: 18,
          fontFamily:
            "system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <h2 style={{ margin: 0 }}>Presenter Guide</h2>
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            {/* Auto-advance controls */}
            <AutoAdvanceControls
              stepIndex={stepIndex}
              stepsLen={steps.length}
              onNav={navTo}
              initialEnabled={String(context?.globals?.presenterAuto || 'off') === 'on'}
              initialSec={Number(context?.globals?.presenterAutoSec || 30)}
            />
            <a
              href="/demo/byok?msw=1&tour=1"
              target="_blank"
              rel="noreferrer"
              style={{
                border: "1px solid #e5e7eb",
                borderRadius: 6,
                padding: "6px 10px",
                background: "#10b981",
                color: "white",
                fontSize: 12,
                textDecoration: "none",
              }}
              title="Open Next.js BYOK demo with mocks and tour enabled"
            >
              Start Demo
            </a>
            <button
              onClick={() => navTo(stepIndex)}
              style={{
                border: "1px solid #e5e7eb",
                borderRadius: 6,
                padding: "6px 10px",
                background: "#0ea5e9",
                color: "white",
                fontSize: 12,
              }}
            >
              Open This Step
            </button>
            <button
              onClick={() => setVisible(false)}
              style={{
                border: "1px solid #e5e7eb",
                borderRadius: 6,
                padding: "6px 10px",
                background: "white",
                fontSize: 12,
              }}
            >
              Dismiss
            </button>
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "280px 1fr", gap: 16, marginTop: 12 }}>
          <div style={{ border: "1px solid #e5e7eb", borderRadius: 8, padding: 8 }}>
            <div style={{ fontSize: 12, color: "#666", marginBottom: 6 }}>
              Steps ({stepIndex + 1}/{steps.length}) — click to navigate
            </div>
            <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
              {steps.map((s, i) => (
                <li key={s.slug} style={{ marginBottom: 4 }}>
                  <button
                    onClick={() => navTo(i)}
                    style={{
                      width: "100%",
                      textAlign: "left",
                      border: "1px solid #e5e7eb",
                      background: i === stepIndex ? "#eef6ff" : "white",
                      borderRadius: 6,
                      padding: "6px 8px",
                      fontSize: 12,
                      cursor: "pointer",
                    }}
                  >
                    {s.title}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          <div style={{ fontSize: 14, color: "#374151" }}>
            <div style={{ fontWeight: 600, marginBottom: 4 }}>{steps[stepIndex].title}</div>
            <div style={{ marginBottom: 8 }}>
              <div style={{ fontSize: 12, color: "#666" }}>Why this matters</div>
              <ul style={{ marginTop: 6 }}>
                {steps[stepIndex].why.map((w, i) => (
                  <li key={i} style={{ marginBottom: 4 }}>
                    {w}
                  </li>
                ))}
              </ul>
            </div>

            <div style={{ fontSize: 12, color: "#555", borderTop: "1px solid #eee", paddingTop: 8 }}>
              How it fits together:
              <ul>
                <li>
                  Journeys define acceptance → TDD enforces correctness → MSW stabilizes flows.
                </li>
                <li>
                  S2S (JSON/SSE) surfaces progress and errors in the UI with explicit events.
                </li>
                <li>
                  AI Service orchestrates provider fallback and caching for reliability and cost.
                </li>
                <li>
                  Provider adapters flip between simulate and SDKs; security (CSP) bounds connectivity.
                </li>
                <li>
                  Observability (logs/metrics) and Status Dashboard close the feedback loop.
                </li>
              </ul>
            </div>

            <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
              <button
                onClick={() => navTo(Math.max(0, stepIndex - 1))}
                disabled={stepIndex === 0}
                style={{
                  border: "1px solid #e5e7eb",
                  borderRadius: 6,
                  padding: "6px 10px",
                  background: stepIndex === 0 ? "#f9fafb" : "white",
                  fontSize: 12,
                }}
              >
                ◀ Back
              </button>
              <button
                onClick={() => navTo(Math.min(steps.length - 1, stepIndex + 1))}
                disabled={stepIndex === steps.length - 1}
                style={{
                  border: "1px solid #e5e7eb",
                  borderRadius: 6,
                  padding: "6px 10px",
                  background: stepIndex === steps.length - 1 ? "#f9fafb" : "white",
                  fontSize: 12,
                }}
              >
                Next ▶
              </button>
            </div>

            <div style={{ marginTop: 12, fontSize: 12, color: "#666" }}>
              Tips: Press g then g to toggle overlay; Esc to close. Use Start Presentation on Labs/Index to
              stay anchored on that page while presenting.
            </div>
          </div>
        </div>

        <div style={{ fontSize: 12, color: "#444", marginTop: 12 }}>
          Presenter URL params: globals=presenterGuide:true, presenter=labs, presenterStep={stepIndex}
        </div>
      </div>
    </div>
  );

  // Auto-advance controls component
  function AutoAdvanceControls({ stepIndex, stepsLen, onNav, initialEnabled, initialSec }: { stepIndex: number; stepsLen: number; onNav: (i: number) => void; initialEnabled?: boolean; initialSec?: number }) {
    const [enabled, setEnabled] = React.useState(Boolean(initialEnabled));
    const [sec, setSec] = React.useState(Number(initialSec || 30));
    React.useEffect(() => {
      if (!enabled) return;
      const id = setInterval(() => {
        onNav(Math.min(stepsLen - 1, stepIndex + 1));
      }, Math.max(5, sec) * 1000);
      return () => clearInterval(id);
    }, [enabled, sec, stepIndex, stepsLen]);
    return (
      <div style={{ display: 'inline-flex', gap: 6, alignItems: 'center' }}>
        <label style={{ fontSize: 12, color: '#444' }}>
          <input type="checkbox" checked={enabled} onChange={e => setEnabled(e.target.checked)} /> Auto
        </label>
        <input
          type="number"
          min={5}
          max={600}
          value={sec}
          onChange={e => setSec(parseInt(e.target.value || '30', 10))}
          style={{ width: 56, fontSize: 12, padding: '4px 6px', border: '1px solid #e5e7eb', borderRadius: 6 }}
          title="Seconds between steps"
        />
      </div>
    );
  }

  return (
    <div style={{ position: "relative" }}>
      <Story />
      {overlay}
    </div>
  );
};

