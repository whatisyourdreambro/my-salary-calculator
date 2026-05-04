/**
 * Remove visible placeholder ad boxes from AdUnit (isLocal div)
 * and remove all standalone ad-only divs from pages
 * while keeping the real <ins> adsense tags
 */
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const files = execSync('git ls-files src', { encoding: 'utf8' })
  .trim().split('\n')
  .filter(f => f.endsWith('.tsx') || f.endsWith('.ts'));

let count = 0;

for (const f of files) {
  const full = path.resolve(f);
  let c;
  try { c = fs.readFileSync(full, 'utf8'); } catch { continue; }
  const orig = c;

  // Remove standalone AdUnit blocks that are just wrappers with nothing else
  // Pattern: <div className="...px-4...py-..."><AdUnit ... /></div>
  c = c.replace(/<div className="[^"]*(?:px-4|py-8|py-12|mb-12|max-w)[^"]*">\s*<AdUnit[^/]*\/>\s*<\/div>/gs, '');
  // Pattern: {/* ... 광고 ... */} followed by <div><AdUnit /></div>
  c = c.replace(/\{\/\*[^*]*(?:광고|Ad|ad)[^*]*\*\/\}\s*<div[^>]*>\s*<AdUnit[^/]*\/>\s*<\/div>/gs, '');

  if (c !== orig) {
    fs.writeFileSync(full, c, 'utf8');
    count++;
    console.log('Cleaned:', f);
  }
}

console.log('\nTotal pages cleaned:', count);
