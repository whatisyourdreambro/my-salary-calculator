import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { latestContentDate, STATIC_LAST_MODIFIED } from '@/config/siteDates';
import { PAGE_VISIBLE_REVISION_DATES } from '@/config/pageContentRevisions';
import { koreanDay, pageRevisionFields } from '../../../scripts/lib/sitemap-freshness.mjs';

describe('sitemap editorial date integrity', () => {
  it('dates the pension, IRP and civil-pay factual corrections without refreshing the home or insurance article', () => {
    const fixture = `globalThis.fetch=()=>{throw new Error('Network forbidden')};
      const rows=require('./src/app/sitemap.ts').default();
      const paths=['/calc/pension-hike-2027','/tools/finance/irp','/','/calc/civil-servant-net-pay','/social-insurance-rates-2027'];
      console.log(JSON.stringify(paths.map(path=>({path,date:rows.find(row=>new URL(row.url).pathname===path).lastModified.toISOString()}))));`;
    const rows = JSON.parse(execFileSync(process.execPath, ['--import', 'tsx', '-e', fixture], {
      cwd: process.cwd(), encoding: 'utf8', timeout: 30_000, maxBuffer: 1024 * 1024,
    })) as Array<{path: string; date: string}>;
    const day = (date: string) => new Date(new Date(date).getTime() + 9 * 3600000).toISOString().slice(0, 10);
    expect(rows.map(row => [row.path, day(row.date)])).toEqual([
      // 2026-11-15: 접힌 FAQ 첫 두 답에 2026~2033 연도별 요율·월 보험료 예시(SEASONA calc ideas[1]) — ROUTE_OVERRIDES 행이 10/23 정확도 검토일보다 늦다.
      ['/calc/pension-hike-2027', '2026-11-15'], ['/tools/finance/irp', '2026-10-23'],
      ['/', '2026-10-19'], ['/calc/civil-servant-net-pay', '2026-10-23'],
      // 2026-11-01: 2027 장기요양 13.90% 확정 반영(PKG-10 DATA-01) — 요율표만 앞당긴다(홈·공무원 계산기는 그대로).
      ['/social-insurance-rates-2027', '2026-11-01'],
    ]);
  }, 35_000);

  it('shared engine reviews set a lower bound and cannot erase newer page revisions', () => {
    const engine = new Date('2026-09-25');
    const page = new Date('2026-10-19T00:00:00+09:00');
    expect(latestContentDate(engine, page).getTime()).toBe(page.getTime());
    expect(latestContentDate(page, engine).getTime()).toBe(page.getTime());
    expect(latestContentDate(undefined, engine).getTime()).toBe(engine.getTime());
    expect(page.toISOString()).toBe('2026-10-18T15:00:00.000Z');
    expect(() => latestContentDate(new Date('invalid'))).toThrow();
    expect(STATIC_LAST_MODIFIED.toISOString()).toBe('2026-07-16T00:00:00.000Z');
  });

  it('the actual sitemap preserves recent Samsung and English page revisions', () => {
    const fixture = `globalThis.fetch=()=>{throw new Error('Network forbidden')};
      const {default:sitemap,ROUTE_OVERRIDES}=require('./src/app/sitemap.ts');
      const paths=['/calc/samsung-bonus','/calc/sk-hynix-bonus','/calc/bonus-home-plan','/en','/en/help'];
      const rows=sitemap();
      console.log(JSON.stringify(paths.map(path=>({path,frequency:rows.find(row=>new URL(row.url).pathname===path)?.changeFrequency,expected:ROUTE_OVERRIDES[path].lastModified.toISOString(),actual:rows.filter(row=>new URL(row.url).pathname===path).map(row=>row.lastModified.toISOString())}))));`;
    const rows = JSON.parse(execFileSync(process.execPath, ['--import', 'tsx', '-e', fixture], {
      cwd: process.cwd(), encoding: 'utf8', timeout: 30_000, maxBuffer: 1024 * 1024,
    })) as Array<{ path: string; frequency: string; expected: string; actual: string[] }>;
    expect(rows).toHaveLength(5);
    for (const row of rows) expect(row.actual, row.path).toEqual([row.expected]);
    expect(rows.find(row => row.path === '/calc/bonus-home-plan')?.frequency).toBe('monthly');
  }, 35_000);

  it('new explanatory sections advance only their reviewed scope; recommendation-only pages retain dates', () => {
    const fixture = `globalThis.fetch=()=>{throw new Error('Network forbidden')};
      const {pageContentRevision,PAGE_LINK_REVIEW_PATHS}=require('./src/config/pageContentRevisions.ts');
      const {default:sitemapRows,ROUTE_OVERRIDES}=require('./src/app/sitemap.ts');
      const sitemap=sitemapRows();
      const industry=require('./src/data/industriesData.ts').industriesData[0].id;
      const region=require('./src/data/regionsData.ts').regionsData[0].id;
      const changed=[...PAGE_LINK_REVIEW_PATHS,'/industry/'+industry];
      const regionPath='/region/'+region;
      console.log(JSON.stringify({changed:changed.map(path=>({path,date:pageContentRevision(path)?.toISOString(),override:ROUTE_OVERRIDES[path]?.lastModified?.toISOString(),matches:sitemap.filter(row=>new URL(row.url).pathname===path).map(row=>row.lastModified.toISOString())})),region:{path:regionPath,date:pageContentRevision(regionPath)?.toISOString(),matches:sitemap.filter(row=>new URL(row.url).pathname===regionPath).map(row=>row.lastModified.toISOString())},untouched:['/job/nurse','/calc/loan-balance-after-payments','/en/calculators','/en/salary-converter','/fun','/guides/tax-guide','/en/guides/tax-deduction','/region'].map(path=>[path,!!pageContentRevision(path)])}));`;
    const result = JSON.parse(execFileSync(process.execPath, ['--import', 'tsx', '-e', fixture], {
      cwd: process.cwd(), encoding: 'utf8', timeout: 30_000, maxBuffer: 1024 * 1024,
    })) as { changed: Array<{path: string; date: string; override?: string; matches: string[]}>; region: {path: string; date: string; matches: string[]}; untouched: Array<[string, boolean]> };
    // 2026-11-15 (DATAB fd8c50245): 지역 상세 히어로 라벨 전체 -> 추정 정정 — 지역 상세는 10/19 대신 그 날짜.
    expect(result.region.date, result.region.path).toBe('2026-11-14T15:00:00.000Z');
    expect(result.region.matches, result.region.path).toEqual(['2026-11-14T15:00:00.000Z']);
    for (const row of result.changed) {
      expect(row.date, row.path).toBe('2026-10-18T15:00:00.000Z');
      // A later page revision recorded in ROUTE_OVERRIDES wins (latestContentDate); verify:sitemap
      // checks that date against the content-review ledger. Nothing may fall below the review date.
      const expected = row.override && row.override > row.date ? row.override : row.date;
      expect(row.matches, row.path).toEqual([expected]);
    }
    expect(result.untouched.every(([, changed]) => !changed)).toBe(true);
  }, 35_000);

  // B36 (owner approval 8, 2026-11-01): the October 19 change on these pages only added the
  // TopicNextSteps link box. The sitemap keeps that link-review lastmod; visible, OG and Article
  // dates return to the last substantive revision (about-page date policy).
  // 2026-11-03 R1 re-land ledger: /chuseok-bonus-2026 left the list after a substantive revision
  // (collapsed FAQ[0] source = 2026 KEF survey, RL-05); all of its dates are 2026-11-03.
  it('link boxes keep the sitemap link-review date without advancing visible, OG or Article dates', () => {
    const routes = Object.keys(PAGE_VISIBLE_REVISION_DATES).sort();
    expect(routes).toEqual(['/basic-pension-2026', '/civil-servant-pay-2027', '/health-insurance-2026']);
    const fixture = `globalThis.fetch=()=>{throw new Error('Network forbidden')};
      const rows=require('./src/app/sitemap.ts').default();
      const paths=${JSON.stringify(routes)};
      console.log(JSON.stringify(paths.map(path=>({path,dates:rows.filter(row=>new URL(row.url).pathname===path).map(row=>new Date(row.lastModified).toISOString())}))));`;
    const rows = JSON.parse(execFileSync(process.execPath, ['--import', 'tsx', '-e', fixture], {
      cwd: process.cwd(), encoding: 'utf8', timeout: 30_000, maxBuffer: 1024 * 1024,
    })) as Array<{ path: string; dates: string[] }>;
    expect(rows.map(row => row.path)).toEqual(routes);
    for (const row of rows) expect(row.dates, row.path).toEqual(['2026-10-18T15:00:00.000Z']);
    for (const route of routes) {
      const visibleDay = PAGE_VISIBLE_REVISION_DATES[route];
      expect(visibleDay < '2026-10-19', route).toBe(true);
      const file = resolve(process.cwd(), 'src/app', route.slice(1), 'page.tsx');
      const fields = pageRevisionFields(readFileSync(file, 'utf8'), file);
      expect(fields.length, route).toBeGreaterThan(0);
      for (const field of fields) {
        expect(field.value === null ? null : koreanDay(field.value), `${route} ${field.name}`).toBe(visibleDay);
      }
    }
  }, 35_000);
  // lens-crawl 검증 missed-1 (2026-11-13): 7/16 뒤에 처음 만든 정적 라우트 6곳·가이드 카테고리 허브 7곳은
  // 첫 커밋일 하한을 lastmod 로 낸다(페이지가 생기기 전 날짜 7/16 금지). 원장 항목 없이 sitemap.ts 상수만 쓴다.
  it('static routes first published after 2026-07-16 never carry a lastmod older than their first commit', () => {
    const fixture = `globalThis.fetch=()=>{throw new Error('Network forbidden')};
      const rows=require('./src/app/sitemap.ts').default();
      const pick=p=>rows.filter(r=>new URL(r.url).pathname===p||new URL(r.url).pathname.startsWith(p+'/')&&p==='/guides/category').map(r=>[new URL(r.url).pathname,new Date(r.lastModified).toISOString()]);
      console.log(JSON.stringify([...['/calc/ordinary-wage','/calc/annual-leave-days','/tools/finance','/tools/real-estate','/tools/life','/tools/finance/dividend-tax'].flatMap(p=>rows.filter(r=>new URL(r.url).pathname===p).map(r=>[p,new Date(r.lastModified).toISOString()])), ...pick('/guides/category')]));`;
    const rows = JSON.parse(execFileSync(process.execPath, ['--import', 'tsx', '-e', fixture], {
      cwd: process.cwd(), encoding: 'utf8', timeout: 30_000, maxBuffer: 1024 * 1024,
    })) as Array<[string, string]>;
    const aug30 = '2026-08-29T15:00:00.000Z';
    const sep1 = '2026-08-31T15:00:00.000Z';
    const aug23 = '2026-08-22T15:00:00.000Z';
    expect(rows.slice(0, 6)).toEqual([
      ['/calc/ordinary-wage', aug30], ['/calc/annual-leave-days', aug30],
      ['/tools/finance', sep1], ['/tools/real-estate', sep1], ['/tools/life', sep1], ['/tools/finance/dividend-tax', sep1],
    ]);
    const hubs = rows.slice(6);
    expect(hubs).toHaveLength(7);
    for (const [path, date] of hubs) expect(date, path).toBe(aug23);
  }, 35_000);
});
