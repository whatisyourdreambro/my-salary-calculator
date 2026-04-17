const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Get all tsx/ts files
const result = execSync('git ls-files src -- "*.tsx" "*.ts"', { cwd: process.cwd(), encoding: 'utf8' });
const files = result.trim().split('\n').filter(Boolean);

let totalFixed = 0;
const fixedFiles = [];

for (const file of files) {
  const fullPath = path.resolve(file);
  let content;
  try {
    content = fs.readFileSync(fullPath, 'utf8');
  } catch (e) {
    continue;
  }
  const original = content;

  // ─── RULE 1: h1 text-white on light pages (not inside dark/primary bg) ───
  // Pattern: h1 className="...text-white..." → replace with text-slate-900
  // But only if the className does NOT contain bg-primary or bg-blue in the same element
  content = content.replace(
    /(<(?:h1|h2|h3|h4|h5|h6)\s[^>]*?className=")([^"]*)\btext-white\b([^"]*)(")/g,
    (match, open, before, after, close) => {
      // Keep text-white if this element has a dark background
      if (/bg-(?:primary|blue|slate-[89]00|black|zinc-[789]|gray-[789])/.test(before + after)) return match;
      return `${open}${before}text-slate-900${after}${close}`;
    }
  );

  // ─── RULE 2: p/span/div showing VALUES (numbers, amounts) with text-white ───
  // This targets result display spans/p's that show computed values
  content = content.replace(
    /(<(?:p|span|div)\s[^>]*?className=")([^"]*)\btext-white\b([^"]*)("[^>]*>)(\s*(?:\{[^}]+\}|[\d,₩+%\-원만억\s\.]+)\s*<\/(?:p|span|div)>)/g,
    (match, open, before, after, closeTag, value) => {
      if (/bg-(?:primary|blue|slate-[89]00|black|zinc-[789]|gray-[789])/.test(before + after)) return match;
      return `${open}${before}text-slate-900${after}${closeTag}${value}`;
    }
  );

  // ─── RULE 3: input/select value text (always dark unless on dark bg) ───
  content = content.replace(
    /(<input\s[^>]*?className=")([^"]*)([^"]*")/g,
    (match, open, cls, close) => {
      // input fields: ensure text is dark (remove text-white, add text-slate-900 if needed)
      if (cls.includes('text-white')) {
        const fixed = cls.replace(/\btext-white\b/g, 'text-slate-900');
        return `${open}${fixed}${close}`;
      }
      return match;
    }
  );

  // ─── RULE 4: any standalone text-white on pure white/light sections ───
  // Fix page-level headings with text-white that aren't on dark backgrounds
  // Pattern from VAT page: <h1 className="text-4xl font-black text-white mb-4">
  content = content.replace(
    /(<h1 className="[^"]*)\btext-white\b([^"]*")/g,
    (match, before, after) => {
      if (/bg-(?:primary|blue-\d|slate-[89]|black|zinc-[89]|gray-[89])/.test(before)) return match;
      return `${before}text-slate-900${after}`;
    }
  );

  // ─── RULE 5: Result value rows - "공급가액", "합계금액" type patterns ───
  // Fix spans inside result-display rows that have bg-white or bg-slate or bg-gray
  // These typically look like: className="font-bold text-white" or className="text-white font-semibold"
  // We keep text-white ONLY when paired with: bg-primary, bg-blue, bg-black, bg-gray-900 etc.
  content = content.replace(
    /className="([^"]*?)\btext-white\b([^"]*?)"/g,
    (match, before, after) => {
      const fullClass = before + 'text-white' + after;
      // Keep if there's a known dark bg in the same className string
      const hasDarkBg = /\bbg-(?:primary|blue-[5-9]\d{2}|indigo-[5-9]\d{2}|slate-[89]\d{2}|gray-[789]\d{2}|zinc-[789]\d{2}|black|neutral-[89]\d{2})\b/.test(fullClass);
      if (hasDarkBg) return match;
      // Replace text-white with text-slate-900
      return `className="${before}text-slate-900${after}"`;
    }
  );

  if (content !== original) {
    fs.writeFileSync(fullPath, content, 'utf8');
    totalFixed++;
    fixedFiles.push(file);
    console.log('Fixed:', file);
  }
}

console.log(`\nTotal files fixed: ${totalFixed}`);
console.log('Done!');
