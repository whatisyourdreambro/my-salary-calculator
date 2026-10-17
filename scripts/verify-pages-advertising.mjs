// Static publication inspection only: generated JavaScript is parsed, never run.
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { inspectClientAdvertising } from './verify-production-worker.mjs';

export function verifyPagesAdvertising(stage) {
  const read = relative => readFileSync(path.join(stage, relative));
  const manifest = JSON.parse(read('generated/pages-manifest.json'));
  assert.equal(manifest.mode, 'production', 'Advertising eligibility inspection requires a production Pages package');
  const headers = manifest.headers.flatMap(rule => rule.headers);
  assert.ok(!headers.some(header => header.key.toLowerCase() === 'x-moneysalary-qa'), 'QA response header in production Pages package');
  const csps = headers.filter(header => header.key.toLowerCase() === 'content-security-policy').map(header => header.value);
  assert.ok(csps.some(csp => /script-src[^;]*https:\/\/pagead2\.googlesyndication\.com/.test(csp)
    && /script-src[^;]*https:\/\/www\.googletagmanager\.com/.test(csp)
    && /frame-src[^;]*https:\/\/googleads\.g\.doubleclick\.net/.test(csp)), 'Ordinary visitor advertising CSP is missing');
  const build = JSON.parse(read('.next/app-build-manifest.json'));
  const chunks = [...new Set(build.pages?.['/layout'] || [])].filter(chunk => chunk.endsWith('.js'));
  assert.ok(chunks.length, 'Pages layout client chunks are missing');
  const sources = chunks.map(chunk => {
    assert.ok(/^static\/[a-zA-Z0-9_./[\]-]+\.js$/.test(chunk) && !chunk.split('/').includes('..'), 'Unsafe client chunk path');
    const source = read(`.next/${chunk}`);
    assert.ok(source.equals(read(`dist/_next/${chunk}`)), 'Pages publication client chunk differs from Next output');
    return { filename: chunk, source: source.toString('utf8') };
  });
  const advertising = inspectClientAdvertising(sources);
  return { advertising, chunksChecked: chunks.length, generatedJavaScriptExecuted: false,
    limitation: 'Verifies compiled eligibility and guarded SDK loaders, not real ad delivery, fill or revenue.' };
}
