#!/usr/bin/env node
/*
 Export Harvest.ai Overview (Storybook docs page) to PDF using Playwright.

 Usage:
   npm run docs:overview:pdf
 Options:
   STORY_PATH  Override the Storybook docs path segment (default: docs-harvest-ai-overview--docs)
   PORT        Port for static server (default: 6106)
 Output:
   docs/HarvestAI_Overview.pdf
*/

import http from "node:http";
import path from "node:path";
import fs from "node:fs/promises";
import { chromium } from "playwright";

const ROOT = process.cwd();
const STATIC_DIR = path.join(ROOT, "storybook-static");
const OUT_PDF = path.join(ROOT, "docs", "HarvestAI_Overview.pdf");
const PORT = Number(process.env.PORT || 6106);
const STORY_PATH = process.env.STORY_PATH || "overview-overview-insanely-detailed--docs";

async function exists(p) {
  try {
    await fs.access(p);
    return true;
  } catch {
    return false;
  }
}

const mime = {
  ".html": "text/html; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".gif": "image/gif",
  ".ico": "image/x-icon",
  ".json": "application/json; charset=utf-8",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
};

function contentType(p) {
  const ext = path.extname(p).toLowerCase();
  return mime[ext] || "application/octet-stream";
}

async function startServer(rootDir, port) {
  const server = http.createServer(async (req, res) => {
    try {
      const url = new URL(req.url, `http://localhost:${port}`);
      let filePath = decodeURIComponent(url.pathname);
      if (filePath.endsWith("/")) filePath += "index.html";
      const fsPath = path.join(rootDir, filePath);
      const rel = path.relative(rootDir, fsPath);
      if (rel.startsWith("..")) {
        res.writeHead(403);
        res.end("Forbidden");
        return;
      }
      const buf = await fs.readFile(fsPath);
      res.writeHead(200, { "Content-Type": contentType(fsPath) });
      res.end(buf);
    } catch (e) {
      res.writeHead(404);
      res.end("Not found");
    }
  });
  await new Promise((resolve) => server.listen(port, resolve));
  return server;
}

async function main() {
  if (!(await exists(STATIC_DIR))) {
    console.error("[export-overview] storybook-static not found. Run: npm run build-storybook");
    process.exit(1);
  }
  const server = await startServer(STATIC_DIR, PORT);
  console.log(`[export-overview] Serving ${STATIC_DIR} at http://localhost:${PORT}`);

  const browser = await chromium.launch();
  const page = await browser.newPage();
  const url = `http://localhost:${PORT}/?path=/docs/${encodeURIComponent(STORY_PATH)}&viewMode=docs&singleStory=true`;
  console.log("[export-overview] Opening", url);
  await page.goto(url, { waitUntil: "networkidle" });

  // Ensure fonts/assets settle
  await page.waitForTimeout(500);

  await fs.mkdir(path.dirname(OUT_PDF), { recursive: true });
  await page.pdf({
    path: OUT_PDF,
    printBackground: true,
    format: "A4",
    margin: { top: "16mm", right: "12mm", bottom: "16mm", left: "12mm" },
  });
  console.log("[export-overview] PDF written to", OUT_PDF);

  await browser.close();
  await new Promise((resolve) => server.close(resolve));
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
