import React, { useEffect, useState, useCallback } from "react";
import type { Meta, StoryObj } from "@storybook/react";

function SystemStatusDoc() {
  const [txt, setTxt] = useState("");
  const [html, setHtml] = useState("");
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  const esc = useCallback(function esc(s: string) {
    return s
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#39;");
  }, []);

  const toHtml = useCallback(
    function toHtml(md: string) {
      const re = /```([a-zA-Z0-9_-]+)?\n([\s\S]*?)```/g;
      let last = 0,
        m,
        out = [];
      while ((m = re.exec(md)) !== null) {
        if (m.index > last) out.push({ k: "t", v: md.slice(last, m.index) });
        out.push({ k: "c", l: m[1] || "", v: m[2] || "" });
        last = re.lastIndex;
      }
      if (last < md.length) out.push({ k: "t", v: md.slice(last) });
      const chunks = out
        .map((p: any) =>
          p.k === "c"
            ? `<pre style="background:#0b0f19;color:#e6edf3;padding:12px;border-radius:6px;overflow:auto"><code class="language-${esc(
                p.l,
              )}">${esc(p.v)}</code></pre>`
            : p.v
                .replace(/^######\s+(.*)$/gm, "<h6>$1</h6>")
                .replace(/^#####\s+(.*)$/gm, "<h5>$1</h5>")
                .replace(/^####\s+(.*)$/gm, "<h4>$1</h4>")
                .replace(/^###\s+(.*)$/gm, "<h3>$1</h3>")
                .replace(/^##\s+(.*)$/gm, "<h2>$1</h2>")
                .replace(/^#\s+(.*)$/gm, "<h1>$1</h1>")
                .replace(
                  /`([^`]+)`/g,
                  (_: string, c: string) =>
                    `<code style="background:#f6f8fa;padding:2px 4px;border-radius:4px">${esc(c)}</code>`,
                )
                .replace(
                  /\[([^\]]+)\]\((https?:[^)]+)\)/g,
                  '<a href="$2" target="_blank" rel="noreferrer">$1</a>',
                )
                .replace(/^(\s*)([-*])\s+(.+)$/gm, "$1<li>$3</li>")
                .replace(/(?:<li>[^<]*<\/li>\n?)+/g, (b: string) => `<ul>${b.trim()}</ul>\n`)
                .split(/\n{2,}/)
                .map((line: string) =>
                  /^(<h\d|<ul|<pre|<blockquote|<p|<table|<hr|\s*$)/.test(line.trim())
                    ? line
                    : `<p>${line.replace(/\n/g, "<br/>")}</p>`,
                )
                .join("\n"),
        )
        .join("\n");
      return chunks;
    },
    [esc],
  );

  useEffect(() => {
    let alive = true;
    setLoading(true);
    setErr("");
    setTxt("");
    setHtml("");
    fetch("/docs/SYSTEM_STATUS.md")
      .then(async (r) => {
        if (!alive) return;
        if (!r.ok) throw new Error("HTTP " + r.status);
        const t = await r.text();
        setTxt(t);
        setHtml(toHtml(t));
      })
      .catch((e) => alive && setErr(String(e)))
      .finally(() => alive && setLoading(false));
    return () => {
      alive = false;
    };
  }, [toHtml]);

  return (
    <div style={{ maxWidth: 1000 }}>
      {loading && <div style={{ fontFamily: "monospace" }}>Loading…</div>}
      {err && <div style={{ fontFamily: "monospace", color: "crimson" }}>{err}</div>}
      {!loading && !err && html && (
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
    </div>
  );
}

const meta: Meta<typeof SystemStatusDoc> = {
  title: "Docs/System Status",
  component: SystemStatusDoc,
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component:
          "A focused view of the current system state rendered directly from `/docs/SYSTEM_STATUS.md`.",
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
