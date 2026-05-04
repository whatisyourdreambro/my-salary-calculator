const fs = require('fs');
const { execSync } = require('child_process');
const files = execSync('git ls-files src', {encoding:'utf8'}).trim().split('\n').filter(f => f.endsWith('.tsx') || f.endsWith('.ts'));

let polluted = 0;
let noLocale = 0;

files.forEach(f => {
  try {
    const c = fs.readFileSync(f, 'utf8');
    // Check for PowerShell script pollution
    if (c.includes('param($m)') || (c.includes('bg-stone-') && c.includes('$n'))) {
      console.log('POLLUTED:', f);
      polluted++;
    }
    // Check for toLocaleString without ko-KR
    if (c.includes('.toLocaleString()') && !c.includes("toLocaleString('ko-KR')") && !c.includes('toLocaleString("ko-KR")')) {
      console.log('NO-LOCALE:', f);
      noLocale++;
    }
  } catch {}
});
console.log('Polluted:', polluted, '| No ko-KR locale:', noLocale);
