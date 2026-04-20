/**
 * remove_ads.js — Removes all AdUnit imports and JSX usage from every file
 * Run: node remove_ads.js
 */

const fs = require("fs");
const path = require("path");

const SRC_ROOT = path.join(__dirname, "src");

let totalFilesModified = 0;
let totalReplacements = 0;

function walk(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (["node_modules", ".next", ".git"].includes(entry.name)) continue;
      walk(full);
    } else if (entry.isFile() && (full.endsWith(".tsx") || full.endsWith(".ts") || full.endsWith(".jsx") || full.endsWith(".js"))) {
      processFile(full);
    }
  }
}

function processFile(filePath) {
  let src = fs.readFileSync(filePath, "utf8");
  const original = src;

  // 1. Remove import lines that import AdUnit
  src = src.replace(/^import\s+AdUnit\s+from\s+["'][^"']+["'];?\s*\n?/gm, "");

  // 2. Remove self-closing <AdUnit ... /> (single line)
  src = src.replace(/<AdUnit\s[^>]*\/>\s*\n?/g, "");

  // 3. Remove multi-line <AdUnit ... /> blocks
  // Pattern: <AdUnit followed by newline, attributes, then />
  let changed = true;
  while (changed) {
    const before = src;
    src = src.replace(/<AdUnit[\s\S]*?\/>/g, "");
    changed = src !== before;
  }

  // 4. Remove wrapping containers that only held an AdUnit (common pattern):
  // e.g. <div className="mt-4">  (empty after AdUnit removal)
  // Just clean up consecutive blank lines
  src = src.replace(/\n{3,}/g, "\n\n");

  if (src !== original) {
    fs.writeFileSync(filePath, src, "utf8");
    totalFilesModified++;
    const replacements = (original.match(/AdUnit/g) || []).length;
    totalReplacements += replacements;
    console.log(`✅ Cleaned: ${path.relative(__dirname, filePath)} (${replacements} AdUnit refs removed)`);
  }
}

console.log("🚀 Starting AdUnit removal...\n");
walk(SRC_ROOT);
console.log(`\n✨ Done! Modified ${totalFilesModified} files, removed ~${totalReplacements} AdUnit references.`);
