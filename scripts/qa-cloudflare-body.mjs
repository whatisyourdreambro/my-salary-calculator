// Synthetic, non-rendering POST checks for the isolated Workerd build only.
// No target URL, hostname, path or request body can be supplied on the CLI.
import assert from 'node:assert/strict';
import http from 'node:http';
import { createHash } from 'node:crypto';
import { existsSync, readFileSync, readdirSync, realpathSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import ts from 'typescript';
import qa from './lib/qa-safety.cjs';

const ROOT = fileURLToPath(new URL('..', import.meta.url));
const PATHS = new Set(['/api/contact', '/api/feedback', '/__qa-body-limit-missing']);
const hash = file => createHash('sha256').update(readFileSync(file)).digest('hex');
export function parsePort(args = []) {
  if (args.length === 0) return 3319;
  if (args.length !== 2 || args[0] !== '--port' || !/^\d+$/.test(args[1])) throw new Error('Only --port <1024..65535> is supported; remote targets are forbidden.');
  const port = Number(args[1]);
  if (!Number.isInteger(port) || port < 1024 || port > 65535) throw new Error('QA port must be1024..65535.');
  return port;
}

export function verifyIsolatedStage(root = ROOT) {
  const stage = path.join(root, '.open-next-qa');
  assert.equal(realpathSync(stage), path.resolve(stage), 'QA stage must not be a symbolic link');
  assert.ok(existsSync(path.join(stage, '.moneysalary-qa-stage')), 'Missing owned QA stage');
  assert.ok(!readdirSync(stage).some(name => /^\.(?:env|dev\.vars)(?:\.|$)/.test(name)), 'QA stage must not contain environment/secret files');
  const configFile = path.join(stage, 'wrangler.jsonc');
  const parsed = ts.parseConfigFileTextToJson(configFile, readFileSync(configFile, 'utf8'));
  assert.equal(parsed.error, undefined, 'Invalid local QA configuration');
  const config = parsed.config;
  const allowed = new Set(['$schema', 'name', 'main', 'compatibility_date', 'compatibility_flags', 'workers_dev', 'preview_urls', 'assets']);
  assert.ok(Object.keys(config).every(key => allowed.has(key)), 'QA config must have no routes, secrets, variables or remote bindings');
  assert.equal(config.workers_dev, false); assert.equal(config.preview_urls, false);
  assert.equal(config.main, 'cloudflare/worker-entry.mjs');
  assert.deepEqual(config.assets, { directory: '.open-next/assets', binding: 'ASSETS', run_worker_first: false, html_handling: 'none', not_found_handling: 'none' });
  const marker = JSON.parse(readFileSync(path.join(stage, 'moneysalary-qa-build.json'), 'utf8'));
  assert.equal(marker.adsDisabled, true, 'Build must have ads disabled');
  assert.equal(marker.configHash, hash(configFile), 'Stage config changed after QA build');
  assert.equal(hash(configFile), hash(path.join(root, 'wrangler.qa.jsonc')), 'Stage must use the checked QA configuration');
  assert.equal(marker.workerHash, hash(path.join(stage, 'cloudflare/worker-entry.mjs')), 'Stage wrapper changed after QA build');
  for (const file of ['worker-entry.mjs', 'request-body-limit.mjs']) {
    assert.equal(hash(path.join(stage, 'cloudflare', file)), hash(path.join(root, 'cloudflare', file)), 'Rebuild QA after body-guard changes');
  }
  return stage;
}

export function smokeCases() {
  return [
    { name: 'contact-overflow', route: '/api/contact', chunks: [Buffer.alloc(4097, 120)], status: 413 },
    { name: 'feedback-overflow', route: '/api/feedback', chunks: [Buffer.alloc(1025, 120)], status: 413 },
    { name: 'unknown-overflow', route: '/__qa-body-limit-missing', chunks: [Buffer.alloc(65537, 120)], status: 413 },
    { name: 'feedback-chunked-overflow', route: '/api/feedback', chunks: [Buffer.alloc(512, 120), Buffer.alloc(513, 120)], chunked: true, status: 413 },
    { name: 'contact-small-fails-closed', route: '/api/contact', chunks: [Buffer.from('{}')], status: [403, 503] },
    { name: 'feedback-small-fails-closed', route: '/api/feedback', chunks: [Buffer.from('{}')], status: [403, 503] },
  ];
}

export function postToLoopback(port, scenario, requestFn = http.request) {
  parsePort(['--port', String(port)]);
  assert.ok(PATHS.has(scenario.route), 'Only the three fixed synthetic paths are permitted');
  assert.ok(scenario.chunks.every(chunk => Buffer.isBuffer(chunk)));
  const byteLength = scenario.chunks.reduce((sum, chunk) => sum + chunk.length, 0);
  assert.ok(byteLength <= 65537, 'Unexpected synthetic payload size');
  const options = {
    hostname: '127.0.0.1', family: 4, port, method: 'POST', path: scenario.route, agent: false,
    headers: { 'User-Agent': qa.QA_USER_AGENT, 'Content-Type': 'application/json',
      Origin: `http://127.0.0.1:${port}`, Connection: 'close',
      ...(scenario.chunked ? { 'Transfer-Encoding': 'chunked' } : { 'Content-Length': String(byteLength) }) },
  };
  // Node http.request does not follow redirects; no URL/Location is dispatched.
  return new Promise((resolve, reject) => {
    let timer;
    const finish = (error, value) => {
      clearTimeout(timer);
      if (error) reject(error);
      else resolve(value);
    };
    const req = requestFn(options, res => {
      const chunks = [];
      let size = 0;
      res.on('data', chunk => {
        size += chunk.length;
        if (size > 4096) req.destroy(new Error('Unexpected local response size'));
        else chunks.push(chunk);
      });
      res.on('error', error => finish(error));
      res.on('end', () => finish(null, { status: res.statusCode, headers: res.headers, body: Buffer.concat(chunks).toString('utf8') }));
    });
    req.on('error', error => finish(error));
    timer = setTimeout(() => req.destroy(new Error('Local body smoke request timed out')), 10000);
    for (const chunk of scenario.chunks) req.write(chunk);
    req.end();
  });
}

export async function runBodySmoke({ port = 3319, verifyStage = verifyIsolatedStage, verifyServer = qa.verifyQaServer, sendPost = postToLoopback } = {}) {
  parsePort(['--port', String(port)]);
  verifyStage();
  await verifyServer(`http://127.0.0.1:${port}`);
  const results = [];
  for (const scenario of smokeCases()) {
    const result = await sendPost(port, scenario);
    const statuses = Array.isArray(scenario.status) ? scenario.status : [scenario.status];
    assert.ok(statuses.includes(result.status), `${scenario.name}: unexpected status${result.status}`);
    assert.match(result.headers['cache-control'] || '', /private.*no-store/);
    assert.equal(result.headers['x-content-type-options'], 'nosniff');
    const body = JSON.parse(result.body);
    assert.equal(body.ok, false);
    if (result.status === 413) assert.equal(body.error, 'PAYLOAD_TOO_LARGE');
    else assert.ok(['INVALID_ORIGIN', 'UNAVAILABLE'].includes(body.error));
    results.push({ name: scenario.name, status: result.status, bytes: scenario.chunks.reduce((sum, chunk) => sum + chunk.length, 0), chunked: Boolean(scenario.chunked), error: body.error });
  }
  return results;
}

if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
  const port = parsePort(process.argv.slice(2));
  process.env.MSY_QA_MODE = '1'; process.env.NEXT_PUBLIC_ADS_DISABLED = '1';
  const results = await runBodySmoke({ port });
  console.log(JSON.stringify({ base: `http://127.0.0.1:${port}`, browser: false, results }, null, 2));
}
