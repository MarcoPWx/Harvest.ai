import React from "react";

// Global decorator that reads `repoDocPath` from story parameters
// and renders a small help panel linking to the repo doc served at /docs.
export const repoDocDecorator = (Story: any, context: any) => {
  const params = context?.parameters || {};
  const path: string | undefined = params.repoDocPath || params.repoDoc || params.helpDocPath;
  if (!path) return <Story />;

  const href = path.startsWith("http") ? path : path.startsWith("/docs") ? path : `/docs/${path}`;

  const label: string = params.repoDocLabel || "Open repo doc";

  const panel = (
    <div
      style={{
        position: "fixed",
        right: 12,
        bottom: 12,
        zIndex: 9999,
        background: "white",
        border: "1px solid #eaeaea",
        borderRadius: 8,
        boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
        padding: "10px 12px",
        fontFamily: "system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif",
        fontSize: 12,
        color: "#333",
      }}
    >
      <div
        style={{ fontWeight: 600, marginBottom: 6, display: "flex", alignItems: "center", gap: 6 }}
      >
        <span role="img" aria-label="help">
          ❓
        </span>{" "}
        Help
      </div>
      <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
        <a
          href={href}
          target="_blank"
          rel="noreferrer"
          style={{
            color: "#0366d6",
            textDecoration: "none",
            border: "1px solid #eaeaea",
            borderRadius: 6,
            padding: "4px 8px",
          }}
        >
          {label}
        </a>
      </div>
    </div>
  );

  return (
    <div style={{ position: "relative" }}>
      <Story />
      {panel}
    </div>
  );
};
