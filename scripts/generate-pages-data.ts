// Build-time only. Explicit output root; no network and no runtime framework bundle.
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, resolve, join } from 'node:path';
import { pathToFileURL } from 'node:url';
import {
  generateAnnualSalaryTableData, generateMonthlySalaryTableData,
  generateWeeklyPayTableData, generateHourlyWageTableData,
} from '../src/lib/generateData';
import { dartInjection } from '../src/data/dart/dartInjection';
import { dartNameMap } from '../src/data/dart/dartNameMap';
import { GET as companyWidget } from '../src/app/widget/company/route';

export async function generatePagesData(outDir: string) {
  if (!outDir || !outDir.trim()) throw new Error('An explicit --out <stage/out> directory is required');
  const root = resolve(outDir, '_msy/data/v1');
  const write = (path: string, content: string) => {
    const target = join(root, path);
    mkdirSync(dirname(target), { recursive: true });
    writeFileSync(target, content, 'utf8');
  };
  const tableRows: Record<string, number> = {};
  for (const [type, generate] of Object.entries({
    annual: generateAnnualSalaryTableData, monthly: generateMonthlySalaryTableData,
    weekly: generateWeeklyPayTableData, hourly: generateHourlyWageTableData,
  })) {
    const rows = generate();
    if (rows.length > 3000) throw new Error(`Salary index bound needs review: ${type}`);
    tableRows[type] = rows.length;
    for (let i = 0; i < rows.length; i += 100) {
      write(`salary/${type}/page-${Math.floor(i / 100) + 1}.json`, JSON.stringify(rows.slice(i, i + 100)));
    }
    write(`salary/${type}/index.json`, JSON.stringify({ version: 1, pageSize: 100, preTax: rows.map(row => row.preTax) }));
  }
  const ids = Object.keys(dartNameMap).filter(id => /^[a-z0-9-]{1,64}$/.test(id) && Object.hasOwn(dartInjection, id)).sort();
  if (ids.length > 5000 || ids.includes('fallback')) throw new Error('Company index bound/reserved name needs review');
  for (const id of [...ids, '']) {
    // Pure existing HTML renderer: no application server, JavaScript execution or HTTP request.
    const response = await companyWidget(new Request(`https://pages-data.invalid/widget/company?id=${encodeURIComponent(id)}`));
    if (response.status !== 200) throw new Error('Company widget generation failed');
    // An opaque extension prevents Pages' .html clean-URL redirect handling.
    write(`company/${id || 'fallback'}.body`, await response.text());
  }
  write('company/index.json', JSON.stringify({ version: 1, ids }));
  return { root, tableRows, companyCards: ids.length, pageSize: 100 };
}

export async function main(argv = process.argv.slice(2)) {
  if (argv.length !== 2 || argv[0] !== '--out' || !argv[1] || argv[1].startsWith('--')) {
    throw new Error('Usage: generate-pages-data.ts --out <stage/out> (no default destination)');
  }
  return generatePagesData(argv[1]);
}

if (process.argv[1] && pathToFileURL(resolve(process.argv[1])).href === import.meta.url) {
  main().then(result => console.log(JSON.stringify(result))).catch(error => { console.error(error.message); process.exitCode = 1; });
}
