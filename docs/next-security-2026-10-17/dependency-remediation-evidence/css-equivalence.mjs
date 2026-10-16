// Offline PostCSS comparison. No browser or HTTP requests.
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';

const base = path.dirname(fileURLToPath(import.meta.url));
const snapshot = path.join(base, process.env.MSY_CSS_SOURCE || 'source-snapshot');
const hash = text => createHash('sha256').update(text).digest('hex');
const cases = [
  'src/app/globals.css',
  'src/components/home/home-work-clock.module.css',
  'src/app/work-clock/work-clock.module.css',
].map(file => ({ name: file, css: fs.readFileSync(path.join(snapshot, file), 'utf8') }));
cases.push({ name: 'variant-regression.css', css: `@tailwind base;
@tailwind components;
@tailwind utilities;
@layer components {
  .audit-apply { @apply flex items-center text-sm hover:text-blue-600; }
  .audit-important { @apply !font-bold; }
}` });
const rawVariants = `prose prose-sm prose-lg prose-a:text-blue-600 dark:prose-invert
group-hover/item:text-red-500 peer-checked/item:block hover:before:opacity-50
[&>*]:mt-2 [&:nth-child(2n+1)]:bg-red-500 [&_a[href^='https://']]:underline
[&:is(.a,.b)]:p-2 after:content-['.'] md:grid-cols-[1fr_2fr] animate-in fade-in
dark:md:hover:text-blue-600 aria-checked:bg-blue-600 data-[state=open]:block`;

const outputs = {};
const versions = {};
for (const label of ['baseline', 'candidate']) {
  const fixture = path.join(base, label === 'candidate' ? (process.env.MSY_CSS_CANDIDATE || 'candidate-final') : label);
  const require = createRequire(path.join(fixture, 'package.json'));
  const postcss = require('postcss');
  const tailwind = require('tailwindcss');
  const autoprefixer = require('autoprefixer');
  const loadConfig = require('tailwindcss/loadConfig');
  const config = loadConfig(path.join(fixture, 'tailwind.config.ts'));
  config.content = config.content.map(pattern => path.resolve(snapshot, pattern).replaceAll('\\', '/'));
  versions[label] = Object.fromEntries(['postcss', 'tailwindcss', 'autoprefixer', 'postcss-selector-parser'].map(name => [name, require(`${name}/package.json`).version]));
  outputs[label] = {};
  for (const input of cases) {
    const current = input.name === 'variant-regression.css'
      ? { ...config, content: [{ raw: rawVariants, extension: 'html' }] }
      : config;
    const result = await postcss([tailwind(current), autoprefixer]).process(input.css, {
      from: path.join(snapshot, input.name), map: false,
    });
    const filename = input.name.replaceAll('/', '__');
    const dest = path.join(fixture, filename);
    fs.writeFileSync(dest, result.css);
    outputs[label][input.name] = { file: dest, bytes: Buffer.byteLength(result.css), sha256: hash(result.css), warnings: result.warnings().map(w => w.text) };
  }
}
const comparisons = cases.map(input => {
  const baseline = outputs.baseline[input.name], candidate = outputs.candidate[input.name];
  return { name: input.name, equal: baseline.sha256 === candidate.sha256, baseline, candidate };
});
const baselineLock = JSON.parse(fs.readFileSync(path.join(base, 'baseline/package-lock.json'), 'utf8')).packages;
const candidateLock = JSON.parse(fs.readFileSync(path.join(base, process.env.MSY_CSS_CANDIDATE || 'candidate-final', 'package-lock.json'), 'utf8')).packages;
const changes = [...new Set([...Object.keys(baselineLock), ...Object.keys(candidateLock)])].filter(p => p && baselineLock[p]?.version !== candidateLock[p]?.version).map(p => ({ path: p, baseline: baselineLock[p]?.version ?? null, candidate: candidateLock[p]?.version ?? null }));
const report = { generatedAt: new Date().toISOString(), offline: true, versions, dependencyChanges: changes, comparisons, pass: comparisons.every(x => x.equal) };
fs.writeFileSync(path.join(base, process.env.MSY_CSS_REPORT || 'css-equivalence.json'), JSON.stringify(report, null, 2) + '\n');
console.log(JSON.stringify({ pass: report.pass, versions, dependencyChanges: changes, comparisons: comparisons.map(({ name, equal, baseline, candidate }) => ({ name, equal, bytes: baseline.bytes, candidateBytes: candidate.bytes, sha256: baseline.sha256 })) }, null, 2));
assert.equal(report.pass, true, 'CSS changed under selector-parser upgrade');
