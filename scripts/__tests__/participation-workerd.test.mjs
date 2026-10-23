// Real local Workerd + isolated D1. Only synthetic API requests, no documents,
// browser, remote bindings, production configuration, credentials or ad code.
import test from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { build } from 'esbuild';

const require = createRequire(import.meta.url);
const wranglerRequire = createRequire(require.resolve('wrangler/package.json'));
const cleanEnv = {};
for (const name of ['SystemRoot', 'SYSTEMROOT', 'WINDIR', 'PATH', 'Path', 'TEMP', 'TMP', 'TMPDIR', 'NODE_TEST_CONTEXT']) {
  if (process.env[name] !== undefined) cleanEnv[name] = process.env[name];
}
Object.assign(cleanEnv, { CI: 'true', MSY_QA_MODE: '1', NEXT_PUBLIC_ADS_DISABLED: '1', NEXT_TELEMETRY_DISABLED: '1',
  WRANGLER_SEND_METRICS: 'false', CLOUDFLARE_LOAD_DEV_VARS_FROM_DOT_ENV: 'false' });
process.env = cleanEnv;
const { Miniflare, convertV4MiniflareOptions } = wranglerRequire('miniflare');
const root = fileURLToPath(new URL('../../', import.meta.url));
const allowed = new Set(['/api/contact', '/api/participation/opinions', '/api/participation/reactions', '/api/participation/summary', '/__synthetic_maintenance', '/__synthetic_egress']);
const uuid = n => `21926472-c435-4fe1-87c2-${String(n).padStart(12, '0')}`;
const opinion = { submissionId: uuid(1), contractVersion: 'private-opinion-v1', target: 'samsung_bonus', body: 'Synthetic private improvement', inquiryConsent: true };
const reaction = { submissionId: uuid(10), contractVersion: 'public-reaction-v1', target: 'samsung_bonus', vote: 'helpful', reason: null, publicAggregateConsent: true };

test('Pages handlers and scheduled cleanup operate together on real local D1 with outbound denial', { timeout: 60000 }, async t => {
  // The synthetic wrapper emulates HTTPS termination after loopback dispatch.
  // Neither test endpoint exists in the production Pages or Cron entrypoint.
  const bundle = await build({ absWorkingDir: root, stdin: { contents: `
    import { handlePagesDynamic } from './cloudflare/pages-dynamic';
    import { withRequestBodyLimits } from './cloudflare/request-body-limit.mjs';
    import maintenance from './workers/participation-maintenance';
    export default withRequestBodyLimits({ async fetch(request, env) {
      const url = new URL(request.url);
      if (url.pathname === '/__synthetic_egress') return fetch('https://no-network.invalid/denied');
      if (url.pathname === '/__synthetic_maintenance') {
        try { await maintenance.scheduled({}, env); return Response.json({ ok: true }); }
        catch { return Response.json({ ok: false }, { status: 503 }); }
      }
      const synthetic = new Request('https://participation.invalid' + url.pathname + url.search, request);
      return await handlePagesDynamic(synthetic, env) ?? new Response('Not found', { status: 404 });
    }, scheduled: maintenance.scheduled });
  `, resolveDir: root, sourcefile: 'synthetic-participation.ts', loader: 'ts' }, bundle: true, write: false, metafile: true, platform: 'browser', format: 'esm', logLevel: 'silent' });
  assert.ok(!Object.keys(bundle.metafile.inputs).some(path => /node_modules\/(?:next|react|@opennextjs)\//.test(path.replaceAll('\\', '/'))));
  let blocked = 0;
  const deny = () => { blocked++; return new Response('Outbound denied', { status: 403 }); };
  const options = convertV4MiniflareOptions({ name: 'participation-synthetic-local-d1', host: '127.0.0.1', port: 0,
    cf: false, compatibilityDate: '2026-10-12', modulesRoot: '/',
    modules: [{ type: 'ESModule', path: 'participation-synthetic.mjs', contents: bundle.outputFiles[0].text }],
    d1Databases: { FEEDBACK_DB: 'synthetic-participation-only' },
    bindings: { FEEDBACK_ALLOWED_ORIGIN: 'https://participation.invalid', FEEDBACK_RATE_LIMIT_SECRET: 'synthetic-not-a-real-secret-12345678901234567890',
      PARTICIPATION_OPINIONS_ENABLED: '1', PARTICIPATION_REACTIONS_ENABLED: '1', PARTICIPATION_SUMMARY_ENABLED: '1', PARTICIPATION_MAINTENANCE_ENABLED: '1' },
    outboundService: deny, unsafeRegisterWorker: false, unsafeLocalExplorer: false, unsafeObservability: false, logRequests: false,
  });
  assert.equal(options.host, '127.0.0.1');
  assert.equal(options.cf, false);
  assert.equal(options.workers[0].dev.outboundService.handler, deny);
  const mf = new Miniflare(options);
  t.after(() => mf.dispose());
  const base = await mf.ready;
  assert.equal(base.hostname, '127.0.0.1');
  const db = await mf.getD1Database('FEEDBACK_DB');
  // Migrations contain ordinary schema SQL only; split after removing comments.
  for (const name of ['0001_private_contact', '0002_fixed_feedback', '0003_private_opinions', '0004_public_reactions']) {
    const sql = readFileSync(new URL(`../../migrations/${name}.sql`, import.meta.url), 'utf8');
    const statements = sql.replace(/--[^\r\n]*/g, '').split(';').map(value => value.trim()).filter(Boolean);
    await db.batch(statements.map(value => db.prepare(value)));
  }
  async function dispatch(path, body, ip = '192.0.2.1') {
    assert.ok(allowed.has(path.split('?')[0]), 'Only fixed synthetic paths are permitted');
    const url = new URL(path, base);
    assert.equal(url.hostname, '127.0.0.1');
    return mf.dispatchFetch(url.href, { method: body === undefined ? 'GET' : 'POST', redirect: 'manual',
      headers: { 'User-Agent': 'MoneySalary-QA/1.0', origin: 'https://participation.invalid', 'content-type': 'application/json', 'cf-connecting-ip': ip },
      ...(body === undefined ? {} : { body: JSON.stringify(body) }) });
  }
  async function scalar(sql) { return Number(Object.values(await db.prepare(sql).first())[0]); }
  assert.equal((await dispatch('/__synthetic_egress')).status, 403);
  assert.equal(blocked, 1);
  assert.equal((await dispatch('/api/participation/opinions', opinion)).status, 503, 'No seeded health');
  assert.equal(await scalar('SELECT COUNT(*) AS n FROM private_opinions'), 0);
  assert.equal((await dispatch('/__synthetic_maintenance')).status, 200);
  assert.ok(await scalar('SELECT last_cleanup_at FROM participation_health') > 0);
  assert.deepEqual(await (await dispatch('/api/participation/summary?target=samsung_bonus')).json(), { ok: true, visible: false });

  assert.equal((await dispatch('/api/participation/opinions', opinion)).status, 201);
  assert.equal((await dispatch('/api/participation/opinions', opinion)).status, 200);
  assert.equal((await dispatch('/api/participation/opinions', { ...opinion, body: 'Changed synthetic content' })).status, 409);
  assert.deepEqual(await (await dispatch('/api/participation/opinions', { ...opinion, submissionId: uuid(2), body: 'ㅅ\u200bㅂ' })).json(), { ok: false, error: 'CONTENT_NOT_ALLOWED' });
  assert.equal(await scalar('SELECT COUNT(*) AS n FROM private_opinions'), 1);
  assert.equal(await scalar("SELECT SUM(accepted) AS n FROM participation_daily_usage WHERE module='opinion'"), 1);
  const contact = { submissionId: uuid(3), type: 'privacy', pagePath: '/contact', body: 'Synthetic private deletion request', inquiryConsent: true };
  assert.equal((await dispatch('/api/contact', contact)).status, 201);

  for (let n = 0; n < 10; n++) {
    const response = await dispatch('/api/participation/reactions', { ...reaction, submissionId: uuid(10 + n) }, `192.0.2.${n + 10}`);
    assert.equal(response.status, 201, `reaction ${n}`);
  }
  assert.equal((await dispatch('/api/participation/reactions', reaction, '192.0.2.10')).status, 200);
  assert.equal(await scalar("SELECT SUM(accepted) AS n FROM participation_daily_usage WHERE module='reaction'"), 10);
  // Historical private feedback is retained privately and cannot enter snapshots.
  const now = Math.floor(Date.now() / 1000);
  await db.prepare("INSERT INTO helpfulness_feedback (submission_id,payload_hash,target,page_path,vote,reason_code,consent_version,created_at,expires_at) VALUES ('synthetic-old-private','hash','samsung_bonus','/calc/samsung-bonus','helpful',NULL,'fixed-feedback-v1',?,?)").bind(now, now + 90 * 86400).run();
  assert.equal((await dispatch('/__synthetic_maintenance')).status, 200);
  const generatedAt = await scalar("SELECT generated_at FROM participation_snapshots WHERE target='samsung_bonus'");
  assert.deepEqual(await (await dispatch('/api/participation/summary?target=samsung_bonus')).json(), { ok: true, visible: true, total: 10, helpful: 10, confusing: 0, windowDays: 28, generatedAt });

  await db.prepare('UPDATE participation_health SET last_cleanup_at=? WHERE id=1').bind(now - 26 * 3600 - 10).run();
  assert.equal((await dispatch('/api/participation/opinions', { ...opinion, submissionId: uuid(30) })).status, 503);
  assert.equal((await dispatch('/api/participation/summary?target=samsung_bonus')).status, 503);
  assert.equal((await dispatch('/api/contact', { ...contact, submissionId: uuid(31) })).status, 201, 'Privacy contact stays independent');

  // Failed cleanup restores expired rows and never manufactures fresh health.
  await db.prepare('UPDATE private_opinions SET created_at=?, expires_at=?').bind(now - 90 * 86400 - 60, now - 1).run();
  const previousHealth = await scalar('SELECT last_cleanup_at FROM participation_health');
  await db.prepare("CREATE TRIGGER synthetic_snapshot_failure BEFORE UPDATE ON participation_snapshots BEGIN SELECT RAISE(ABORT, 'synthetic'); END").run();
  assert.equal((await dispatch('/__synthetic_maintenance')).status, 503);
  assert.equal(await scalar('SELECT COUNT(*) AS n FROM private_opinions'), 1, 'Deletion must roll back');
  assert.equal(await scalar('SELECT last_cleanup_at FROM participation_health'), previousHealth);
  await db.prepare('DROP TRIGGER synthetic_snapshot_failure').run();
  assert.equal((await dispatch('/__synthetic_maintenance')).status, 200);
  assert.equal(await scalar('SELECT COUNT(*) AS n FROM private_opinions'), 0);
  assert.ok(await scalar('SELECT last_cleanup_at FROM participation_health') > previousHealth);
  assert.equal(await scalar('SELECT COUNT(*) AS n FROM helpfulness_feedback'), 1);
  assert.equal(blocked, 1, 'Only the deliberately denied egress fixture can attempt outbound traffic');
  t.diagnostic('PASS: real Workerd/D1; Pages env injection; policy/replay; 10 public reactions; old-private exclusion; real delete/rollback; 26h gate; independent privacy contact; no outbound requests.');
});
