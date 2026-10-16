import test from 'node:test';
import assert from 'node:assert/strict';
import { EventEmitter } from 'node:events';
import { createHash } from 'node:crypto';
import { mkdtempSync, mkdirSync, cpSync, readFileSync, writeFileSync, rmSync } from 'node:fs';
import path from 'node:path';
import { tmpdir } from 'node:os';
import { parsePort, verifyIsolatedStage, smokeCases, postToLoopback, runBodySmoke } from '../qa-cloudflare-body.mjs';

const root = new URL('../../', import.meta.url);
const digest = value => createHash('sha256').update(value).digest('hex');
function withStage(change, fn) {
  const dir = mkdtempSync(path.join(tmpdir(), 'msy-body-smoke-test-'));
  const stage = path.join(dir, '.open-next-qa');
  try {
    mkdirSync(path.join(stage, 'cloudflare'), { recursive: true }); mkdirSync(path.join(dir, 'cloudflare'));
    for (const file of ['worker-entry.mjs', 'request-body-limit.mjs']) {
      cpSync(new URL(`cloudflare/${file}`, root), path.join(dir, 'cloudflare', file));
      cpSync(new URL(`cloudflare/${file}`, root), path.join(stage, 'cloudflare', file));
    }
    const config = { name: 'local-only', main: 'cloudflare/worker-entry.mjs', compatibility_date: '2026-10-12',
      compatibility_flags: ['nodejs_compat'], workers_dev: false, preview_urls: false,
      assets: { directory: '.open-next/assets', binding: 'ASSETS', run_worker_first: false, html_handling: 'none', not_found_handling: 'none' } };
    change?.(config, stage);
    const configText = JSON.stringify(config);
    writeFileSync(path.join(stage, '.moneysalary-qa-stage'), 'fixture');
    writeFileSync(path.join(stage, 'wrangler.jsonc'), configText);
    writeFileSync(path.join(dir, 'wrangler.qa.jsonc'), configText);
    // Synthetic marker only; no generated production code is executed.
    const source = new URL('cloudflare/worker-entry.mjs', root);
    writeFileSync(path.join(stage, 'moneysalary-qa-build.json'), JSON.stringify({ adsDisabled: true, configHash: digest(configText), workerHash: digest(readFileSync(source)) }));
    return fn(dir, stage);
  } finally {
    assert.equal(path.dirname(path.resolve(dir)), path.resolve(tmpdir()));
    assert.ok(path.basename(dir).startsWith('msy-body-smoke-test-'));
    rmSync(dir, { recursive: true, force: true });
  }
}

test('CLI permits only a bounded port, with no host/path/body overrides', () => {
  assert.equal(parsePort([]), 3319); assert.equal(parsePort(['--port', '3320']), 3320);
  for (const args of [['--port', '80'], ['--port', '65536'], ['--port', 'NaN'], ['--url', 'https://www.moneysalary.com'], ['https://example.com'], ['--port', '3319', '--host', 'example.com']]) {
    assert.throws(() => parsePort(args));
  }
});

test('stage verification rejects remote bindings, vars, routes and environment files', () => {
  withStage(undefined, dir => assert.ok(verifyIsolatedStage(dir).endsWith('.open-next-qa')));
  for (const field of ['account_id', 'routes', 'd1_databases', 'services', 'vars', 'env']) {
    withStage(config => { config[field] = {}; }, dir => assert.throws(() => verifyIsolatedStage(dir), /no routes, secrets, variables or remote bindings/));
  }
  withStage((_config, stage) => writeFileSync(path.join(stage, '.dev.vars'), 'synthetic'), dir => assert.throws(() => verifyIsolatedStage(dir), /environment\/secret/));
  withStage(undefined, (dir, stage) => {
    writeFileSync(path.join(stage, 'cloudflare/request-body-limit.mjs'), '// modified');
    assert.throws(() => verifyIsolatedStage(dir), /Rebuild QA/);
  });
});

test('no POST occurs until both stage isolation and the ad-free server header are verified', async () => {
  let sent = 0;
  await assert.rejects(runBodySmoke({ verifyStage: () => { throw new Error('no stage'); }, verifyServer: async () => assert.fail('server should not be contacted'), sendPost: async () => { sent++; } }), /no stage/);
  await assert.rejects(runBodySmoke({ verifyStage: () => {}, verifyServer: async () => { throw new Error('missing QA header'); }, sendPost: async () => { sent++; } }), /missing QA header/);
  assert.equal(sent, 0);
});

test('all six fixed synthetic cases use literal IPv4 loopback and never follow redirects', async () => {
  for (const scenario of smokeCases()) {
    let count = 0;
    const sent = [];
    const result = await postToLoopback(3319, scenario, (options, callback) => {
      count++;
      assert.equal(options.hostname, '127.0.0.1'); assert.equal(options.family, 4);
      assert.equal(options.port, 3319); assert.equal(options.method, 'POST'); assert.equal(options.agent, false);
      assert.ok(['/api/contact', '/api/feedback', '/__qa-body-limit-missing'].includes(options.path));
      assert.equal(options.headers['User-Agent'], 'MoneySalary-QA/1.0');
      assert.equal(options.headers.Origin, 'http://127.0.0.1:3319');
      if (scenario.chunked) { assert.equal(options.headers['Content-Length'], undefined); assert.equal(options.headers['Transfer-Encoding'], 'chunked'); }
      const req = new EventEmitter();
      req.write = chunk => sent.push(chunk);
      req.destroy = error => req.emit('error', error);
      req.end = () => queueMicrotask(() => {
        const res = new EventEmitter(); res.statusCode = 302; res.headers = { location: 'https://www.moneysalary.com/' };
        callback(res); res.emit('end');
      });
      return req;
    });
    assert.equal(result.status, 302); assert.equal(count, 1);
    assert.equal(Buffer.concat(sent).length, scenario.chunks.reduce((sum, chunk) => sum + chunk.length, 0));
  }
  assert.throws(() => postToLoopback(3319, { route: 'https://example.com', chunks: [] }), /three fixed/);
  assert.throws(() => postToLoopback(3319, { route: '/adgk/x', chunks: [] }), /three fixed/);
});

test('scenario validation checks private errors and stops on redirect or accidental success', async () => {
  const events = [];
  const options = { verifyStage: () => events.push('stage'), verifyServer: async base => { assert.equal(base, 'http://127.0.0.1:3319'); events.push('server'); },
    sendPost: async (_port, scenario) => {
      events.push(scenario.name);
      const status = Array.isArray(scenario.status) ? 403 : 413;
      return { status, headers: { 'cache-control': 'private, no-store', 'x-content-type-options': 'nosniff' }, body: JSON.stringify({ ok: false, error: status === 413 ? 'PAYLOAD_TOO_LARGE' : 'INVALID_ORIGIN' }) };
    } };
  assert.equal((await runBodySmoke(options)).length, 6);
  assert.deepEqual(events.slice(0, 2), ['stage', 'server']);
  for (const status of [200, 201, 302]) await assert.rejects(runBodySmoke({ ...options, sendPost: async () => ({ status, headers: {} }) }), /unexpected status/);
});
