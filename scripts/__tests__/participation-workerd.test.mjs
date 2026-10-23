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
const allowed = new Set(['/api/contact', '/api/feedback', '/api/participation/opinions', '/api/participation/reactions', '/api/participation/summary', '/__synthetic_maintenance', '/__synthetic_egress',
  '/__synthetic_retired_contact', '/__synthetic_retired_feedback', '/__synthetic_retired_opinion', '/__synthetic_retired_reaction']);
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
    import { createContactHandler } from './src/lib/server/contactHandler';
    import { createFixedFeedbackHandler } from './src/lib/server/fixedFeedbackHandler';
    import { createOpinionHandler } from './src/lib/server/opinionHandler';
    import { createReactionHandler } from './src/lib/server/reactionHandler';
    const retired = {
      '/__synthetic_retired_contact': createContactHandler(() => false),
      '/__synthetic_retired_feedback': createFixedFeedbackHandler(() => false),
      '/__synthetic_retired_opinion': createOpinionHandler(() => false),
      '/__synthetic_retired_reaction': createReactionHandler(() => false),
    };
    export default withRequestBodyLimits({ async fetch(request, env) {
      const url = new URL(request.url);
      if (url.pathname === '/__synthetic_egress') return fetch('https://no-network.invalid/denied');
      if (url.pathname === '/__synthetic_maintenance') {
        try { await maintenance.scheduled({}, env); return Response.json({ ok: true }); }
        catch { return Response.json({ ok: false }, { status: 503 }); }
      }
      const synthetic = new Request('https://participation.invalid' + url.pathname + url.search, request);
      if (Object.hasOwn(retired, url.pathname)) {
        const now = Number(url.searchParams.get('now'));
        if (!Number.isSafeInteger(now) || now <= 0) return new Response('Invalid synthetic time', { status: 400 });
        let reads = 0;
        const readOnlyDb = {
          prepare(sql) {
            if (!sql.trimStart().toUpperCase().startsWith('SELECT ')) throw new Error('Synthetic replay attempted a write');
            reads++;
            return env.FEEDBACK_DB.prepare(sql);
          },
          batch(statements) { return env.FEEDBACK_DB.batch(statements); },
        };
        const result = await retired[url.pathname](synthetic, { ...env, FEEDBACK_DB: readOnlyDb }, now * 1000);
        result.headers.set('x-synthetic-selects', String(reads));
        return result;
      }
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
  // Freeze new-write admission for each real v1 without inventing a v2 contract.
  // The wrapper refuses every non-SELECT statement; all reads still execute in D1.
  async function receiptState() {
    const statements = [
      'SELECT submission_id,payload_hash,consent_version,created_at,expires_at FROM contact_inquiries ORDER BY submission_id',
      'SELECT submission_id,payload_hash,consent_version,created_at,expires_at FROM helpfulness_feedback ORDER BY submission_id',
      'SELECT submission_id,payload_hash,contract_version,policy_version,created_at,expires_at FROM private_opinions ORDER BY submission_id',
      'SELECT submission_id,payload_hash,contract_version,created_at,expires_at FROM participation_reactions ORDER BY submission_id',
      'SELECT bucket_key,attempts,expires_at FROM feedback_rate_limits ORDER BY bucket_key',
      'SELECT module,day_start,accepted FROM participation_daily_usage ORDER BY module,day_start',
    ];
    return (await db.batch(statements.map(sql => db.prepare(sql)))).map(result => result.results);
  }
  const contracts = [
    { module: 'contact', path: '/api/contact', table: 'contact_inquiries', versionField: 'consent_version', version: 'contact-v1', legacy: true,
      input: { ...contact, submissionId: uuid(100) }, change: { body: 'Different synthetic inquiry' } },
    { module: 'feedback', path: '/api/feedback', table: 'helpfulness_feedback', versionField: 'consent_version', version: 'fixed-feedback-v1', legacy: true,
      input: { submissionId: uuid(101), target: 'samsung_bonus', vote: 'helpful', reason: null, feedbackConsent: true }, change: { vote: 'confusing', reason: 'input_method' } },
    { module: 'opinion', path: '/api/participation/opinions', table: 'private_opinions', versionField: 'contract_version', version: 'private-opinion-v1',
      input: { ...opinion, submissionId: uuid(102) }, change: { body: 'Different synthetic opinion' } },
    { module: 'reaction', path: '/api/participation/reactions', table: 'participation_reactions', versionField: 'contract_version', version: 'public-reaction-v1',
      input: { ...reaction, submissionId: uuid(103) }, change: { vote: 'confusing', reason: 'input_method' } },
  ];
  for (const [index, contract] of contracts.entries()) {
    const ip = `192.0.2.${200 + index}`;
    assert.equal((await dispatch(contract.path, contract.input, ip)).status, 201, `${contract.module} actual v1 admission`);
    const explicit = { ...contract.input, contractVersion: contract.version };
    const stored = await db.prepare(`SELECT payload_hash,${contract.versionField} AS version,created_at,expires_at FROM ${contract.table} WHERE submission_id=?`).bind(explicit.submissionId).first();
    assert.equal(stored.version, contract.version);
    assert.match(stored.payload_hash, /^[a-f0-9]{64}$/);
    assert.equal(stored.expires_at - stored.created_at, 90 * 86400);
    const before = await receiptState();
    const currentReplay = await dispatch(contract.path, explicit, ip);
    assert.equal(currentReplay.status, 200);
    assert.deepEqual(await currentReplay.json(), { ok: true, receiptId: explicit.submissionId, duplicate: true });
    assert.deepEqual(await receiptState(), before, `${contract.module} current replay preserves all metadata/counters`);
    const retiredPath = `/__synthetic_retired_${contract.module}`;
    async function probe(payload, time, status, error) {
      const result = await dispatch(`${retiredPath}?now=${time}`, payload, ip);
      assert.equal(result.status, status, `${contract.module} retired policy at ${time}`);
      assert.equal(result.headers.get('x-synthetic-selects'), error === 'INVALID_REQUEST' ? '0' : '1');
      assert.deepEqual(await result.json(), error ? { ok: false, error } : { ok: true, receiptId: explicit.submissionId, duplicate: true });
      assert.deepEqual(await receiptState(), before, `${contract.module} readonly replay never renews expiry or consumes quota`);
    }
    await probe(explicit, stored.expires_at - 1, 200);
    if (contract.legacy) await probe(contract.input, stored.expires_at - 1, 200);
    await probe({ ...explicit, ...contract.change }, stored.expires_at - 1, 409, 'RECEIPT_CONFLICT');
    await probe(explicit, stored.expires_at, 409, 'RECEIPT_CONFLICT');
    await probe(explicit, stored.expires_at + 1, 409, 'RECEIPT_CONFLICT');
    await probe({ ...explicit, submissionId: uuid(110 + index) }, stored.created_at, 400, 'CONTRACT_CHANGED');
    if (contract.legacy) await probe({ ...contract.input, submissionId: uuid(120 + index) }, stored.created_at, 400, 'CONTRACT_CHANGED');
    await probe({ ...explicit, contractVersion: 'unknown-contract' }, stored.created_at, 400, 'INVALID_REQUEST');
  }
  assert.equal(blocked, 1, 'Only the deliberately denied egress fixture can attempt outbound traffic');
  t.diagnostic('PASS: real Workerd/D1; four actual v1 receipt contracts; legacy contact/fixed replay; retired new-write policy; expiry-1/expiry/expiry+1; SELECT-only replay; unchanged hashes/expiry/counters; Pages env injection; 10 public reactions; old-private exclusion; real delete/rollback; 26h gate; no outbound requests.');
});
