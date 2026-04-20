/**
 * apply_duotone.js — Replaces all legacy color classes & values with
 * Electric Blue (#0145F2) + Canvas Cloud (#EDF1F5) duotone system.
 *
 * Runs on all .tsx / .ts / .jsx / .js files in src/
 * Node: node apply_duotone.js
 */

const fs = require("fs");
const path = require("path");

const SRC_ROOT = path.join(__dirname, "src");
let totalFilesModified = 0;

/* ──────────────────────────────────────────────────────────────────
   REPLACEMENT RULES
   Order matters: more specific patterns first.
────────────────────────────────────────────────────────────────── */
const RULES = [

  // ── Hard-coded hex colors ──────────────────────────────────────
  // Old Samsung Blue
  [/#1428[Aa]0/g,               "#0145F2"],
  [/#1428a0/gi,                 "#0145F2"],
  // Any pure white bg → Canvas Cloud
  [/bg-\[#ffffff\]/gi,          "bg-white"],
  [/bg-\[#FFFFFF\]/g,           "bg-white"],
  // Old slate-like hex colors in inline styles  
  [/#0f172a/gi,                 "#0A1829"],
  [/#1e293b/gi,                 "#162E4A"],
  [/#334155/gi,                 "#3D5E78"],
  [/#64748b/gi,                 "#7A9AB5"],
  [/#94a3b8/gi,                 "#7A9AB5"],

  // ── Tailwind: background ───────────────────────────────────────
  [/\bbg-blue-50\b/g,           "bg-canvas"],
  [/\bbg-blue-100\b/g,          "bg-canvas-dark"],
  [/\bbg-indigo-50\b/g,         "bg-canvas"],
  [/\bbg-indigo-100\b/g,        "bg-canvas-dark"],
  [/\bbg-blue-600\b/g,          "bg-primary"],
  [/\bbg-blue-700\b/g,          "bg-electric"],
  [/\bbg-blue-800\b/g,          "bg-electric"],
  [/\bbg-blue-500\b/g,          "bg-primary"],
  [/\bbg-indigo-600\b/g,        "bg-primary"],
  [/\bbg-indigo-700\b/g,        "bg-electric"],
  [/\bbg-slate-50\b/g,          "bg-canvas"],
  [/\bbg-slate-100\b/g,         "bg-canvas-dark"],
  [/\bbg-slate-200\b/g,         "bg-canvas-deeper"],
  [/\bbg-gray-50\b/g,           "bg-canvas"],
  [/\bbg-gray-100\b/g,          "bg-canvas-dark"],
  [/\bbg-gray-200\b/g,          "bg-canvas-deeper"],
  [/\bbg-zinc-50\b/g,           "bg-canvas"],
  [/\bbg-zinc-100\b/g,          "bg-canvas-dark"],
  // Dark backgrounds  — map to electric blue
  [/\bbg-slate-700\b/g,         "bg-electric"],
  [/\bbg-slate-800\b/g,         "bg-electric"],
  [/\bbg-slate-900\b/g,         "bg-electric"],
  [/\bbg-gray-700\b/g,          "bg-electric"],
  [/\bbg-gray-800\b/g,          "bg-electric"],
  [/\bbg-gray-900\b/g,          "bg-electric"],
  [/\bbg-zinc-800\b/g,          "bg-electric"],
  [/\bbg-zinc-900\b/g,          "bg-electric"],
  [/\bbg-black\b/g,             "bg-electric"],
  // Purple/violet → electric blue  
  [/\bbg-violet-\d+\b/g,        "bg-primary"],
  [/\bbg-purple-\d+\b/g,        "bg-primary"],
  [/\bbg-teal-\d+\b/g,          "bg-canvas-dark"],
  [/\bbg-green-\d+\b/g,         "bg-canvas-dark"],
  [/\bbg-amber-\d+\b/g,         "bg-canvas-dark"],
  [/\bbg-rose-\d+\b/g,          "bg-canvas-deeper"],
  [/\bbg-red-\d+\b/g,           "bg-canvas-deeper"],
  [/\bbg-yellow-\d+\b/g,        "bg-canvas-dark"],
  [/\bbg-orange-\d+\b/g,        "bg-canvas-deeper"],

  // ── Tailwind: text ─────────────────────────────────────────────
  [/\btext-blue-600\b/g,        "text-electric"],
  [/\btext-blue-700\b/g,        "text-electric"],
  [/\btext-blue-500\b/g,        "text-electric"],
  [/\btext-indigo-600\b/g,      "text-electric"],
  [/\btext-indigo-700\b/g,      "text-electric"],
  [/\btext-blue-50\b/g,         "text-canvas"],
  [/\btext-slate-900\b/g,       "text-navy"],
  [/\btext-slate-800\b/g,       "text-navy"],
  [/\btext-slate-700\b/g,       "text-muted-blue"],
  [/\btext-slate-600\b/g,       "text-muted-blue"],
  [/\btext-slate-500\b/g,       "text-faint-blue"],
  [/\btext-slate-400\b/g,       "text-faint-blue"],
  [/\btext-slate-300\b/g,       "text-faint-blue"],
  [/\btext-gray-900\b/g,        "text-navy"],
  [/\btext-gray-800\b/g,        "text-navy"],
  [/\btext-gray-700\b/g,        "text-muted-blue"],
  [/\btext-gray-600\b/g,        "text-muted-blue"],
  [/\btext-gray-500\b/g,        "text-faint-blue"],
  [/\btext-gray-400\b/g,        "text-faint-blue"],
  [/\btext-zinc-900\b/g,        "text-navy"],
  [/\btext-zinc-800\b/g,        "text-navy"],
  [/\btext-zinc-700\b/g,        "text-muted-blue"],
  [/\btext-zinc-600\b/g,        "text-muted-blue"],
  [/\btext-zinc-500\b/g,        "text-faint-blue"],
  [/\btext-violet-\d+\b/g,      "text-electric"],
  [/\btext-purple-\d+\b/g,      "text-electric"],
  [/\btext-teal-\d+\b/g,        "text-muted-blue"],
  [/\btext-green-\d+\b/g,       "text-muted-blue"],
  [/\btext-amber-\d+\b/g,       "text-muted-blue"],
  [/\btext-rose-\d+\b/g,        "text-electric"],
  [/\btext-red-\d+\b/g,         "text-electric"],

  // ── Tailwind: border ───────────────────────────────────────────
  [/\bborder-blue-\d+\b/g,      "border-electric"],
  [/\bborder-indigo-\d+\b/g,    "border-electric"],
  [/\bborder-slate-\d+\b/g,     "border-canvas"],
  [/\bborder-gray-\d+\b/g,      "border-canvas"],
  [/\bborder-zinc-\d+\b/g,      "border-canvas"],
  [/\bborder-violet-\d+\b/g,    "border-electric"],
  [/\bborder-purple-\d+\b/g,    "border-electric"],
  [/\bborder-green-\d+\b/g,     "border-canvas"],
  [/\bborder-amber-\d+\b/g,     "border-canvas"],
  [/\bborder-rose-\d+\b/g,      "border-canvas"],
  [/\bborder-red-\d+\b/g,       "border-canvas"],
  [/\bborder-teal-\d+\b/g,      "border-canvas"],
  [/\bborder-yellow-\d+\b/g,    "border-canvas"],
  [/\bborder-black\b/g,         "border-electric"],

  // ── Tailwind: ring / outline ───────────────────────────────────
  [/\bring-blue-\d+\b/g,        "ring-primary"],
  [/\bring-indigo-\d+\b/g,      "ring-primary"],
  [/\bring-slate-\d+\b/g,       "ring-primary"],
  [/\bring-gray-\d+\b/g,        "ring-primary"],
  [/\bring-violet-\d+\b/g,      "ring-primary"],
  [/\bring-purple-\d+\b/g,      "ring-primary"],
  [/\bring-green-\d+\b/g,       "ring-primary"],
  [/\bring-rose-\d+\b/g,        "ring-primary"],
  [/\bring-red-\d+\b/g,         "ring-primary"],

  // ── Tailwind: divide ───────────────────────────────────────────
  [/\bdivide-slate-\d+\b/g,     "divide-canvas"],
  [/\bdivide-gray-\d+\b/g,      "divide-canvas"],
  [/\bdivide-zinc-\d+\b/g,      "divide-canvas"],

  // ── Fill / stroke (SVG / recharts) ────────────────────────────
  [/\bfill-blue-\d+\b/g,        "fill-primary"],
  [/\bfill-slate-\d+\b/g,       "fill-canvas"],
  [/\bfill-gray-\d+\b/g,        "fill-canvas"],
  [/\bstroke-blue-\d+\b/g,      "stroke-primary"],
  [/\bstroke-slate-\d+\b/g,     "stroke-canvas"],
  [/\bstroke-gray-\d+\b/g,      "stroke-canvas"],

  // ── Shadow ────────────────────────────────────────────────────
  [/shadow-blue-\d+\/\d+/g,     "shadow-primary-md"],
  [/shadow-indigo-\d+\/\d+/g,   "shadow-primary-md"],

  // ── Hover variants ────────────────────────────────────────────
  [/hover:bg-blue-50\b/g,       "hover:bg-canvas"],
  [/hover:bg-blue-100\b/g,      "hover:bg-canvas-dark"],
  [/hover:bg-blue-600\b/g,      "hover:bg-electric"],
  [/hover:bg-blue-700\b/g,      "hover:bg-electric"],
  [/hover:bg-slate-50\b/g,      "hover:bg-canvas"],
  [/hover:bg-slate-100\b/g,     "hover:bg-canvas-dark"],
  [/hover:bg-slate-200\b/g,     "hover:bg-canvas-deeper"],
  [/hover:bg-gray-50\b/g,       "hover:bg-canvas"],
  [/hover:bg-gray-100\b/g,      "hover:bg-canvas-dark"],
  [/hover:bg-gray-200\b/g,      "hover:bg-canvas-deeper"],
  [/hover:text-blue-\d+\b/g,    "hover:text-electric"],
  [/hover:text-slate-\d+\b/g,   "hover:text-navy"],
  [/hover:text-gray-\d+\b/g,    "hover:text-navy"],
  [/hover:border-blue-\d+\b/g,  "hover:border-electric"],
  [/hover:border-slate-\d+\b/g, "hover:border-canvas"],

  // ── Focus variants ────────────────────────────────────────────
  [/focus:ring-blue-\d+\b/g,    "focus:ring-primary"],
  [/focus:border-blue-\d+\b/g,  "focus:border-electric"],
  [/focus:bg-blue-\d+\b/g,      "focus:bg-canvas"],
  [/focus:ring-slate-\d+\b/g,   "focus:ring-primary"],

  // ── Dark mode classes (remove, site is light-only) ────────────
  [/\bdark:[a-z-]+\b/g,         ""],

  // ── Placeholder colors ────────────────────────────────────────
  [/placeholder-slate-\d+\b/g,  "placeholder-faint-blue"],
  [/placeholder-gray-\d+\b/g,   "placeholder-faint-blue"],

  // ── from/to/via gradient ──────────────────────────────────────
  [/\bfrom-blue-50\b/g,         "from-canvas"],
  [/\bfrom-slate-50\b/g,        "from-canvas"],
  [/\bfrom-white\b/g,           "from-white"],
  [/\bto-blue-50\b/g,           "to-canvas"],
  [/\bto-slate-50\b/g,          "to-canvas"],
  [/\bto-white\b/g,             "to-white"],
  [/\bvia-blue-50\b/g,          "via-canvas"],
  [/\bvia-white\b/g,            "via-white"],

  // ── from-blue gradient (hero bg) ─────────────────────────────
  [/from-blue-50\s+via-white\s+to-white/g, "from-canvas to-white"],
  [/from-blue-50\/\d+/g,        "from-canvas"],
  [/from-blue-\d+\/\d+/g,       "from-primary/20"],

  // ── Clean up doubled spaces from empty dark: removals ─────────
  [/  +/g,                      " "],
];

/* ──────────────────────────────────────────────────────────────── */

function walk(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (["node_modules", ".next", ".git"].includes(entry.name)) continue;
      walk(full);
    } else if (
      entry.isFile() &&
      (full.endsWith(".tsx") || full.endsWith(".ts") ||
       full.endsWith(".jsx") || full.endsWith(".js") ||
       full.endsWith(".css"))
    ) {
      processFile(full);
    }
  }
}

function processFile(filePath) {
  let src = fs.readFileSync(filePath, "utf8");
  const original = src;

  for (const [pattern, replacement] of RULES) {
    src = src.replace(pattern, replacement);
  }

  // Clean up multiple blank lines
  src = src.replace(/\n{3,}/g, "\n\n");

  if (src !== original) {
    fs.writeFileSync(filePath, src, "utf8");
    totalFilesModified++;
    console.log(`✅ ${path.relative(__dirname, filePath)}`);
  }
}

totalFilesModified = 0;
console.log("🎨 Applying duotone color system...\n");
walk(SRC_ROOT);
console.log(`\n✨ Done! Modified ${totalFilesModified} files.`);
