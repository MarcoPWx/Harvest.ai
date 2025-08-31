#!/usr/bin/env node
/*
 Generate docs/status/last-updated.json by reading last git commit dates
 for MD/MDX docs under docs/ and src/stories/.
*/
import { exec as _exec } from "node:child_process";
import { promisify } from "node:util";
import fs from "node:fs/promises";
import path from "node:path";

const exec = promisify(_exec);
const ROOT = process.cwd();

async function walk(dir, exts) {
  const out = [];
  async function rec(d) {
    const entries = await fs.readdir(d, { withFileTypes: true });
    for (const e of entries) {
      const p = path.join(d, e.name);
      if (e.isDirectory()) await rec(p);
      else if (exts.includes(path.extname(e.name))) out.push(p);
    }
  }
  await rec(dir);
  return out;
}

async function lastCommitISO(file) {
  try {
    const { stdout } = await exec(`git log -1 --format=%cI -- ${JSON.stringify(file)}`);
    const s = stdout.trim();
    if (s) return s;
  } catch {}
  try {
    const st = await fs.stat(file);
    return st.mtime.toISOString();
  } catch {}
  return "";
}

async function main() {
  const docsDir = path.join(ROOT, "docs");
  const storiesDir = path.join(ROOT, "src", "stories");
  const files = [];
  if (
    await fs
      .access(docsDir)
      .then(() => true)
      .catch(() => false)
  ) {
    files.push(...(await walk(docsDir, [".md", ".mdx"])));
  }
  if (
    await fs
      .access(storiesDir)
      .then(() => true)
      .catch(() => false)
  ) {
    files.push(...(await walk(storiesDir, [".mdx"])));
  }
  const map = {};
  for (const f of files) {
    const rel = path.relative(ROOT, f).replaceAll("\\", "/");
    map[rel] = await lastCommitISO(f);
  }
  const out = { generatedAt: new Date().toISOString(), files: map };
  const outDir = path.join(ROOT, "docs", "status");
  await fs.mkdir(outDir, { recursive: true });
  await fs.writeFile(path.join(outDir, "last-updated.json"), JSON.stringify(out, null, 2));
  console.log(
    "[docs:updates] wrote docs/status/last-updated.json with",
    Object.keys(map).length,
    "entries",
  );
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
