import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { koreanDay, contentSnapshot, assessContentReview, isFutureSitemapDate, pageRevisionFields } from '../lib/sitemap-freshness.mjs';

function fixture(t) {
  const root = mkdtempSync(path.join(tmpdir(), 'sitemap-review-'));
  t.after(() => rmSync(root, { recursive: true, force: true }));
  function write(file, value) {
    mkdirSync(path.dirname(path.join(root, file)), { recursive: true });
    writeFileSync(path.join(root, file), value);
  }
  write('src/app/page.tsx', 'home\n');
  write('src/app/calc/page.tsx', 'catalog\n');
  write('src/app/calc/Client.tsx', 'client\n');
  write('src/app/calc/child/page.tsx', 'child\n');
  write('src/lib/engine.ts', 'engine\n');
  const review = { contentDate: '2026-10-19', reviewedAtCommit: 'a'.repeat(40), reason: 'Reviewed actual content change and subsequent technical-only diffs.', dependencies: ['src/lib/engine.ts'], ...contentSnapshot(root, '/calc', ['src/lib/engine.ts']) };
  const check = (overrides = {}) => assessContentReview({ root, route: '/calc', review, actualLastModified: '2026-10-19T00:00:00+09:00', now: Date.parse('2026-10-19T00:30:00+09:00'), ...overrides });
  return { root, write, review, check };
}

test('Korean editorial day is independent of the UTC date boundary', () => {
  assert.equal(koreanDay('2026-10-18T15:00:00Z'), '2026-10-19');
  assert.equal(koreanDay('2026-10-18T14:59:59Z'), '2026-10-18');
});
test('date-only guide days and explicit timestamps retain different future semantics', () => {
  const earlyKoreanMorning = Date.parse('2026-10-19T00:30:00+09:00');
  assert.equal(isFutureSitemapDate('2026-10-19', earlyKoreanMorning), false);
  assert.equal(isFutureSitemapDate('2026-10-20', earlyKoreanMorning), true);
  assert.equal(isFutureSitemapDate('2026-10-19T00:00:00Z', earlyKoreanMorning), true);
  assert.equal(isFutureSitemapDate(new Date('2026-10-19'), earlyKoreanMorning), true);
  assert.equal(isFutureSitemapDate('2026-10-19T00:00:00+09:00', earlyKoreanMorning), false);
  assert.equal(isFutureSitemapDate('2026-02-30', earlyKoreanMorning), true);
});
test('page revision scan resolves constants/templates and ignores Dataset dates', () => {
  const fields = pageRevisionFields('const DAY="2026-10-19"; const AT=`${DAY}T00:00:00+09:00`; const metadata={modifiedTime:AT}; articleLd({modifiedDate:DAY}); datasetLd({dateModified:"2026-09-25"}); <PublishedMeta updatedDate={DAY}/>;');
  assert.deepEqual(fields, [
    {name:'modifiedTime',value:'2026-10-19T00:00:00+09:00'},
    {name:'modifiedDate',value:'2026-10-19'},
    {name:'updatedDate',value:'2026-10-19'},
  ]);
});
test('unknown dynamic date expressions require review instead of silently passing', () => {
  assert.deepEqual(pageRevisionFields('const metadata={modifiedTime: externalDate()}; <PublishedMeta updatedDate={outside}/>;'), [
    {name:'modifiedTime',value:null},{name:'updatedDate',value:null},
  ]);
});
test('review works without Git and accepts KST midnight before UTC midnight', (t) => {
  const { check } = fixture(t);
  assert.deepEqual(check(), []);
  assert.match(check({ actualLastModified: '2026-10-19' }).join(), /future/);
});
test('another route change cannot make the home or parent catalog stale', (t) => {
  const { root, write, check } = fixture(t);
  const home = contentSnapshot(root, '/');
  write('src/app/calc/child/page.tsx', 'new child content\n');
  assert.deepEqual(contentSnapshot(root, '/'), home);
  assert.deepEqual(check(), []);
});
test('an own content edit, even a comment or claimed chore, requires review', (t) => {
  const { write, check } = fixture(t);
  write('src/app/calc/Client.tsx', 'client\n// technical claim\n');
  assert.match(check().join(), /source changed/);
});
test('new source files and explicit shared-engine changes require review', (t) => {
  const { write, check } = fixture(t);
  write('src/app/calc/NewContent.tsx', 'new text\n');
  assert.match(check().join(), /source changed/);
  write('src/lib/engine.ts', 'different calculations\n');
  assert.match(check().join(), /source changed/);
});
test('line-ending-only checkout conversions keep the same review', (t) => {
  const { write, check } = fixture(t);
  write('src/app/calc/Client.tsx', 'client\r\n');
  assert.deepEqual(check(), []);
});
test('missing review and invalid/future calendar dates fail closed', (t) => {
  const { review, check } = fixture(t);
  assert.match(check({ review: undefined }).join(), /missing/);
  assert.match(check({ review: { ...review, contentDate: '2026-02-30' } }).join(), /invalid/);
  assert.match(check({ review: { ...review, contentDate: '2026-10-20' } }).join(), /future/);
});
test('actual sitemap output must match review, preventing baseline-loop date regression', (t) => {
  const { check } = fixture(t);
  assert.match(check({ actualLastModified: '2026-09-25' }).join(), /differs/);
  assert.match(check({ actualLastModified: undefined }).join(), /missing/);
});
test('missing sources and unsafe dependency paths cannot pass as technical exceptions', (t) => {
  const { root, review, check } = fixture(t);
  rmSync(path.join(root, 'src/lib/engine.ts'));
  assert.match(check().join(), /missing or unsafe/);
  assert.match(check({ review: { ...review, dependencies: ['src/../../outside.ts'] } }).join(), /unsafe/);
});
