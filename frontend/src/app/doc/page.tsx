import React from "react";
import fs from "node:fs/promises";
import path from "node:path";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

function slugify(text: string) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-");
}

function Heading({ level, children }: { level: number; children: React.ReactNode }) {
  const text = String(
    (children as any)?.map
      ? (children as any)
          .map((c: any) => (typeof c === "string" ? c : c?.props?.children || ""))
          .join("")
      : children,
  );
  const id = slugify(text);
  const Tag = `h${level}` as any;
  return <Tag id={id}>{children}</Tag>;
}

export default async function DocViewer({
  searchParams,
}: {
  searchParams?: Promise<{ path?: string }>;
}) {
  const params = await searchParams;
  const rel = decodeURIComponent(params?.path || "");
  const root = process.cwd();
  const docsRoot = path.join(root, "docs");
  let abs = "";
  let content = "";
  let error = "";
  try {
    if (!rel) throw new Error("Missing ?path=docs/…");
    abs = path.resolve(root, rel);
    if (!abs.startsWith(docsRoot)) throw new Error("Path must be under /docs");
    content = await fs.readFile(abs, "utf8");
  } catch (e: any) {
    error = e?.message || String(e);
  }

  if (error) {
    return (
      <div style={{ maxWidth: 820, margin: "0 auto", padding: 16 }}>
        <h1>Docs Viewer</h1>
        <p style={{ color: "crimson" }}>Error: {error}</p>
        <p>Example: /doc?path=docs/architecture/GENERATION_FLOW.md</p>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 900, margin: "0 auto", padding: 16 }}>
      <div style={{ fontSize: 12, color: "#666", marginBottom: 8 }}>{rel}</div>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          h1: ({ node, children }) => <Heading level={1}>{children}</Heading>,
          h2: ({ node, children }) => <Heading level={2}>{children}</Heading>,
          h3: ({ node, children }) => <Heading level={3}>{children}</Heading>,
          h4: ({ node, children }) => <Heading level={4}>{children}</Heading>,
          h5: ({ node, children }) => <Heading level={5}>{children}</Heading>,
          h6: ({ node, children }) => <Heading level={6}>{children}</Heading>,
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
