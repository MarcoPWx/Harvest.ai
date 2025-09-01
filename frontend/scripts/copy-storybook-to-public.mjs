#!/usr/bin/env node
import fs from "fs";
import path from "path";

const root = process.cwd();
const fromDir = path.join(root, "storybook-static");
const toDir = path.join(root, "public", "storybook");

function copyRecursive(src, dest) {
  if (!fs.existsSync(src)) return;
  const stat = fs.statSync(src);
  if (stat.isDirectory()) {
    if (!fs.existsSync(dest)) fs.mkdirSync(dest, { recursive: true });
    for (const entry of fs.readdirSync(src)) {
      copyRecursive(path.join(src, entry), path.join(dest, entry));
    }
  } else {
    fs.copyFileSync(src, dest);
  }
}

copyRecursive(fromDir, toDir);
console.log(`[storybook-export] Copied ${fromDir} -> ${toDir}`);
