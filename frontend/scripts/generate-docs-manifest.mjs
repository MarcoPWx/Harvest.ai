#!/usr/bin/env node
import { readdir, readFile, writeFile, stat } from "node:fs/promises";
import path from "node:path";

const ROOT = process.cwd();
const DOCS_DIR = path.resolve(ROOT, "docs");
const OUT_FILE = path.resolve(DOCS_DIR, "manifest.json");

const isMarkdown = (name) => /\.(md|mdx)$/i.test(name);

async function readHeading(file) {
  try {
    const buf = await readFile(file, "utf8");
    const m1 = buf.match(/^#\s+(.+)$/m);
    if (m1) return m1[1].trim();
    const m2 = buf.match(/^##\s+(.+)$/m);
    if (m2) return m2[1].trim();
  } catch {}
  const base = path.basename(file).replace(/\.(md|mdx)$/i, "");
  return base.replace(/[_-]+/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

async function walk(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  const children = [];
  for (const ent of entries) {
    if (ent.name.startsWith(".")) continue;
    const full = path.join(dir, ent.name);
    if (ent.isDirectory()) {
      const sub = await walk(full);
      if (sub.children.length) {
        children.push({ type: "dir", name: ent.name, children: sub.children });
      }
    } else if (ent.isFile() && isMarkdown(ent.name)) {
      const title = await readHeading(full);
      const rel = path.relative(DOCS_DIR, full).split(path.sep).join("/");
      children.push({ type: "file", name: ent.name, title, path: `/docs/${rel}` });
    }
  }
  // Sort: files first alpha, then dirs alpha
  children.sort((a, b) => {
    if (a.type !== b.type) return a.type === "file" ? -1 : 1;
    const an = a.type === "file" ? a.title || a.name : a.name;
    const bn = b.type === "file" ? b.title || b.name : b.name;
    return an.localeCompare(bn);
  });
  return { children };
}

function toIndexMarkdown(children) {
  let out = "# Docs Index (auto-generated)\n\n";
  const render = (nodes, depth = 2, base = "") => {
    for (const n of nodes) {
      if (n.type === "dir") {
        out += `${"#".repeat(depth)} ${n.name}\n\n`;
        render(n.children || [], Math.min(depth + 1, 6), `${base}/${n.name}`);
      } else if (n.type === "file") {
        const title = n.title || n.name;
        out += `- [${title}](${n.path})\n`;
      }
    }
    out += "\n";
  };
  render(children);
  out += "\n_This file is generated. Do not edit manually._\n";
  return out;
}

async function main() {
  try {
    // Ensure docs dir exists
    const st = await stat(DOCS_DIR);
    if (!st.isDirectory()) throw new Error("docs is not a directory");
    const tree = await walk(DOCS_DIR);
    const manifest = {
      generatedAt: new Date().toISOString(),
      root: "/docs",
      tree: tree.children,
    };
    await writeFile(OUT_FILE, JSON.stringify(manifest, null, 2), "utf8");
    console.log(`Docs manifest written: ${path.relative(ROOT, OUT_FILE)}`);

    // Also write an index page
    const indexFile = path.resolve(DOCS_DIR, "INDEX.md");
    const md = toIndexMarkdown(tree.children);
    await writeFile(indexFile, md, "utf8");
    console.log(`Docs index written: ${path.relative(ROOT, indexFile)}`);
  } catch (e) {
    console.error("Failed to generate docs manifest:", e);
    process.exit(1);
  }
}

main();
