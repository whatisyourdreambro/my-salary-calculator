/**
 * Fix all formatting issues:
 * 1. Replace .toLocaleString() → .toLocaleString('ko-KR') in all files
 * 2. Clean up PowerShell script pollution in TSX files
 */
const fs = require('fs');
const { execSync } = require('child_process');

const files = execSync('git ls-files src', {encoding:'utf8'}).trim().split('\n')
  .filter(f => f.endsWith('.tsx') || f.endsWith('.ts'));

let fixed = 0;
let cleaned = 0;

for (const f of files) {
  const fullPath = require('path').resolve(f);
  let c;
  try { c = fs.readFileSync(fullPath, 'utf8'); } catch { continue; }
  const orig = c;

  // 1. Fix toLocaleString() → toLocaleString('ko-KR')
  c = c.replace(/\.toLocaleString\(\)/g, ".toLocaleString('ko-KR')");

  // 2. Remove PowerShell script pollution in className strings
  // Pattern: className="...param($m)\n...$n = ...\n..." found in previous PowerShell replacement
  c = c.replace(/\s*param\(\$m\)\s*\$n = \[int\]\(\$m\.Value -replace 'bg-stone-',''\)\s*if \(\$n -ge \d+\) \{ '(?:bg-white|bg-slate-\d+)' \}\s*else \{ '(?:bg-white|bg-slate-\d+)' \}\s*/g, ' ');

  // 3. Fix specific pollution patterns: "...param($m) dark:bg-white..."
  // These appear in className strings as leftover PowerShell blocks
  c = c.replace(/param\(\$m\)\n\s+\$n = \[int\]\(\$m\.Value -replace 'bg-stone-',''\)\n\s+if \(\$n -ge \d+\) \{ '.*?' \}\n\s+else \{ '.*?' \}\n\s+dark:bg-white/g, 'bg-slate-100 ');

  // 4. Also fix any remaining raw .toLocaleString with no locale
  c = c.replace(/\.toLocaleString\(''\)/g, ".toLocaleString('ko-KR')");

  if (c !== orig) {
    fs.writeFileSync(fullPath, c, 'utf8');
    fixed++;
    console.log('Fixed:', f);
  }
}

console.log(`\nTotal files updated: ${fixed}`);
