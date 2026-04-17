const fs = require('fs');
const polluted = [
  'src/app/fun/asset-allocator/page.tsx',
  'src/app/fun/fortune/page.tsx',
  'src/components/WeekendDutyGame.tsx',
  'src/components/calculators/SalaryRankCalculator.tsx'
];

polluted.forEach(f => {
  let c;
  try { c = fs.readFileSync(f, 'utf8'); } catch (e) { console.log('Skip:', f); return; }
  const orig = c;

  // Remove PowerShell script blocks that got embedded in className strings
  // These look like:
  //   "\n        param($m)\n        $n = [int]($m.Value -replace 'bg-stone-','')\n        if ($n -ge 900) { 'bg-white' }\n        else { 'bg-slate-50' }\n     "
  c = c.replace(/\s*param\(\$m\)\s*\$n\s*=\s*\[int\][^\n]*\n[^\n]*\n[^\n]*\n[^\n]*/g, '');

  // Also clean: "...dark:bg-white..." that has leftover PS text
  c = c.replace(/\s+param\(\$m\)\n\s+\$n[^\n]+\n\s+if[^\n]+\n\s+else[^\n]+\n\s+/g, ' ');

  if (c !== orig) {
    fs.writeFileSync(f, c, 'utf8');
    console.log('Cleaned:', f);
  } else {
    console.log('Already clean:', f);
  }
});
