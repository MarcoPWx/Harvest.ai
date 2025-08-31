import React, { useEffect, useState } from "react";
import type { Meta, StoryObj } from "@storybook/react";

function escapeHtml(s: string) {
  return s
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function mdToHtml(md: string) {
  const parts: { kind: "text" | "code"; lang?: string; content: string }[] = [];
  const re = /```([a-zA-Z0-9_-]+)?\n([\s\S]*?)```/g;
  let last = 0;
  let m: RegExpExecArray | null;
  while ((m = re.exec(md)) !== null) {
    if (m.index > last) parts.push({ kind: "text", content: md.slice(last, m.index) });
    parts.push({ kind: "code", lang: m[1] || "", content: m[2] || "" });
    last = re.lastIndex;
  }
  if (last < md.length) parts.push({ kind: "text", content: md.slice(last) });

  const chunks = parts.map((p) => {
    if (p.kind === "code") {
      return `<pre style="background:#0b0f19;color:#e6edf3;padding:12px;border-radius:6px;overflow:auto"><code class="language-${escapeHtml(p.lang || "")}">${escapeHtml(p.content)}</code></pre>`;
    }
    let s = p.content;
    s = s
      .replace(/^######\s+(.*)$/gm, "<h6>$1</h6>")
      .replace(/^#####\s+(.*)$/gm, "<h5>$1</h5>")
      .replace(/^####\s+(.*)$/gm, "<h4>$1</h4>")
      .replace(/^###\s+(.*)$/gm, "<h3>$1</h3>")
      .replace(/^##\s+(.*)$/gm, "<h2>$1</h2>")
      .replace(/^#\s+(.*)$/gm, "<h1>$1</h1>");
    s = s.replace(
      /`([^`]+)`/g,
      (_, code) =>
        `<code style="background:#f6f8fa;padding:2px 4px;border-radius:4px">${escapeHtml(code)}</code>`,
    );
    s = s.replace(
      /\[([^\]]+)\]\((https?:[^)]+)\)/g,
      '<a href="$2" target="_blank" rel="noreferrer">$1</a>',
    );
    s = s.replace(/^(\s*)([-*])\s+(.+)$/gm, "$1<li>$3</li>");
    s = s.replace(/(?:<li>[^<]*<\/li>\n?)+/g, (block) => `<ul>${block.trim()}</ul>\n`);
    const lines = s.split(/\n{2,}/);
    const rendered = lines
      .map((line) =>
        /^(<h\d|<ul|<pre|<blockquote|<p|<table|<hr|\s*$)/.test(line.trim())
          ? line
          : `<p>${line.replace(/\n/g, "<br/>")}</p>`,
      )
      .join("\n");
    return rendered;
  });

  return chunks.join("\n");
}

function DocReader() {
  const [path, setPath] = useState("/docs/testing/TESTING.md");
  const [html, setHtml] = useState("");
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let ok = true;
    setLoading(true);
    setError("");
    setText("");
    setHtml("");
    fetch(path)
      .then(async (r) => {
        if (!ok) return;
        if (!r.ok) throw new Error("HTTP " + r.status);
        const t = await r.text();
        setText(t);
        try {
          setHtml(mdToHtml(t));
        } catch {
          setHtml("");
        }
      })
      .catch((e) => ok && setError(String(e)))
      .finally(() => ok && setLoading(false));
    return () => {
      ok = false;
    };
  }, [path]);

  const curated = [
    { label: "Testing & CI (Consolidated)", path: "/docs/testing/TESTING.md" },
    { label: "Local Development Guide", path: "/docs/status/LOCAL_DEV_GUIDE.md" },
    { label: "Tech Stack Cheat Sheet", path: "/docs/TECH_STACK_CHEATSHEET.md" },
    { label: "Implementation Progress", path: "/docs/status/implementation-progress.md" },
    { label: "System Architecture", path: "/docs/architecture/SYSTEM_ARCHITECTURE.md" },
    { label: "REST API (overview)", path: "/docs/api/REST_API.md" },
  ];

  return (
    <div style={{ maxWidth: 1200 }}>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr auto auto auto",
          gap: 8,
          alignItems: "center",
          marginBottom: 10,
        }}
      >
        <select value={path} onChange={(e) => setPath(e.target.value)}>
          {curated.map((c) => (
            <option key={c.path} value={c.path}>
              {c.label}
            </option>
          ))}
        </select>
        <a href={path} target="_blank" rel="noreferrer">
          Open raw
        </a>
        <a href="/docs/api" target="_blank" rel="noreferrer">
          Swagger UI
        </a>
        <a href="/docs" target="_blank" rel="noreferrer">
          In-app Docs
        </a>
      </div>
      <div>
        {loading && <div style={{ fontFamily: "monospace" }}>Loading…</div>}
        {error && <div style={{ fontFamily: "monospace", color: "crimson" }}>{error}</div>}
        {!loading && !error && html && (
          <div
            style={{
              border: "1px solid #eee",
              borderRadius: 6,
              padding: 14,
              background: "white",
              fontSize: 14,
              lineHeight: 1.55,
            }}
            dangerouslySetInnerHTML={{ __html: html }}
          />
        )}
        {!loading && !error && !html && (
          <pre
            style={{
              whiteSpace: "pre-wrap",
              border: "1px solid #eee",
              borderRadius: 6,
              padding: 8,
              background: "#fafafa",
              fontSize: 12,
              overflow: "auto",
            }}
          >
            {text}
          </pre>
        )}
      </div>
    </div>
  );
}

const meta: Meta<typeof DocReader> = {
  title: "Docs/Project Docs Reader",
  component: DocReader,
};
export default meta;

type Story = StoryObj<typeof meta>;
export const Reader: Story = {};
