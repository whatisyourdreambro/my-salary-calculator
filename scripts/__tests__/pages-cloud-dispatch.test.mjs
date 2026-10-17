import assert from 'node:assert/strict';
import { test } from 'node:test';
import { cloudDispatchApi, dispatchApprovedCloudRelease } from '../pages-cloud-dispatch.mjs';
const commit = 'a'.repeat(40), prefix = '/repos/whatisyourdreambro/my-salary-calculator';
function fixture({ enabled = 'true', main = commit, ambiguous = false, reserved = false } = {}) {
  const calls = [], receipts = []; let reservation = reserved;
  return { calls, receipts, deps: {
    api: async (resource, method = 'GET', body) => {
      calls.push({ resource, method, body });
      if (method === 'POST') { if (ambiguous) throw Error('timeout'); return null; }
      if (resource.endsWith('/variables/PAGES_CLOUD_PUBLISH_ENABLED')) return { name: 'PAGES_CLOUD_PUBLISH_ENABLED', value: enabled };
      if (resource.endsWith('/commits/main')) return { sha: main };
      return { path: '.github/workflows/pages-publish.yml', state: 'active' };
    },
    reserve: value => { assert.equal(reservation, false, 'Already attempted'); reservation = true; receipts.push(structuredClone(value)); },
    persist: value => receipts.push(structuredClone(value)),
  } };
}
test('approval dispatch reserves before one exact-SHA cloud handoff; queued is not publication', async () => {
  const f = fixture(); const r = await dispatchApprovedCloudRelease({ commit, articleSlug: 'a-guide', articleMarker: '승인 글' }, f.deps);
  assert.equal(r.phase, 'queued'); assert.equal(r.cloudflareCredentialUsed, false);
  const posts = f.calls.filter(x => x.method === 'POST'); assert.equal(posts.length, 1);
  assert.equal(posts[0].body.ref, 'main'); assert.equal(posts[0].body.inputs.approved_commit, commit);
  assert.deepEqual(f.receipts.map(x => x.phase), ['dispatching', 'queued']);
});
test('disabled, stale, duplicate or invalid article never dispatches', async () => {
  for (const options of [{ enabled: 'false' }, { main: 'b'.repeat(40) }, { reserved: true }]) {
    const f = fixture(options); await assert.rejects(dispatchApprovedCloudRelease({ commit }, f.deps));
    assert.equal(f.calls.some(x => x.method === 'POST'), false);
  }
  for (const input of [{ articleSlug: '../bad' }, { articleSlug: 'missing-marker' }, { articleMarker: 'no slug' }, { articleSlug: 'ok', retirementTo: 'https://outside.invalid/' }]) {
    const f = fixture(); await assert.rejects(dispatchApprovedCloudRelease({ commit, ...input }, f.deps)); assert.equal(f.calls.length, 0);
  }
});
test('ambiguous dispatch remains unconfirmed and is never retried', async () => {
  const f = fixture({ ambiguous: true }); await assert.rejects(dispatchApprovedCloudRelease({ commit }, f.deps), /not confirmed/);
  assert.equal(f.calls.filter(x => x.method === 'POST').length, 1); assert.equal(f.receipts.at(-1).phase, 'dispatch-unconfirmed');
});
test('API credential remains only in request header, redirects rejected and other mutations denied', async () => {
  const seen = []; const api = cloudDispatchApi({ env: { GITHUB_TOKEN: 'fixture-only' }, fetchFn: async (url, options) => {
    seen.push({ url, options }); return new Response('{}', { status: 200 });
  } });
  await api(prefix + '/commits/main'); assert.equal(seen[0].options.redirect, 'error');
  assert.equal(seen[0].options.headers.Authorization, 'Bearer fixture-only');
  await assert.rejects(api(prefix + '/git/refs/heads/main', 'POST', {})); assert.equal(seen.length, 1);
});
