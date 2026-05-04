/**
 * fix_remaining_colors.js
 * Replaces any remaining dark backgrounds, gray-900/slate-800 patterns,
 * indigo-500 refs, and text-blue-100/200/300/400 with duotone equivalents.
 */

const fs = require("fs");
const path = require("path");

const SRC_ROOT = path.join(__dirname, "src");
let modified = 0;

const RULES = [
  // Dark gradient backgrounds → Electric Blue gradient
  [/from-gray-900 to-black/g,              "from-[#0145F2] to-[#0D5BFF]"],
  [/from-gray-900 via-slate-800 to-black/g, "from-[#0145F2] via-[#0950EE] to-[#0D5BFF]"],
  [/from-slate-900 to-slate-800/g,          "from-[#0145F2] to-[#0D5BFF]"],
  [/from-slate-800\/80 to-slate-900\/80/g,  "from-[#EDF1F5] to-[#DDE4EC]"],
  [/bg-gradient-to-br from-slate-800\/80 to-slate-900\/80[^\n]*/g,
   "style={{ backgroundColor: '#FFFFFF', border: '1.5px solid #DDE4EC' }}"],
  // indigo-500 → primary/electric
  [/\btext-indigo-500\b/g,         "text-electric"],
  [/\baccent-indigo-500\b/g,       "accent-[#0145F2]"],
  [/\bto-indigo-500\b/g,           "to-[#3D7FF5]"],
  [/\bfrom-indigo-500\b/g,         "from-[#0145F2]"],
  [/\bvia-indigo-500\b/g,          "via-[#0145F2]"],
  [/\bborder-t-indigo-500\b/g,     "border-t-electric"],
  // text-blue-100 to text-blue-400 → on-primary variant
  [/\btext-blue-100\b/g,           "text-[rgba(255,255,255,0.7)]"],
  [/\btext-blue-200\b/g,           "text-[rgba(255,255,255,0.7)]"],
  [/\btext-blue-300\b/g,           "text-[rgba(255,255,255,0.75)]"],
  [/\btext-blue-400\b/g,           "text-[rgba(255,255,255,0.8)]"],
  // bg-blue-400 → primary
  [/\bbg-blue-400\b/g,             "bg-primary"],
  // text-gray-300 → text-faint-blue
  [/\btext-gray-300\b/g,           "text-faint-blue"],
  // Remaining confetti colors
  [/'#0F4C81'/g,                   "'#0145F2'"],
  [/'#FFD700'/g,                   "'#EDF1F5'"],
  [/'#f59e0b'/g,                   "'#0145F280'"],
  // PayStub dark gradient
  [/from-gray-800 to-gray-900/g,   "from-[#EDF1F5] to-[#DDE4EC]"],
  // border-white/20 → canvas border (only on light bg contexts)
  // bg-white/10 used as glassmorphism on dark → ok to keep when on blue bg
  // Clean up double spaces from class removals
  [/  +/g,                         " "],
];

function walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (["node_modules", ".next", ".git"].includes(entry.name)) continue;
      walk(full);
    } else if (entry.isFile() && /\.(tsx?|jsx?|css)$/.test(entry.name)) {
      let src = fs.readFileSync(full, "utf8");
      const orig = src;
      for (const [pat, rep] of RULES) src = src.replace(pat, rep);
      if (src !== orig) {
        fs.writeFileSync(full, src, "utf8");
        modified++;
        console.log("✅ " + path.relative(__dirname, full));
      }
    }
  }
}

console.log("🎨 Fixing remaining colors...\n");
walk(SRC_ROOT);
console.log(`\n✨ Done — ${modified} files updated.`);
