import { execFileSync } from 'node:child_process';
import { describe, expect, it } from 'vitest';
import { latestContentDate, STATIC_LAST_MODIFIED } from '@/config/siteDates';

describe('sitemap editorial date integrity', () => {
  it('dates the two factual corrections without refreshing the home, handoff or insurance article', () => {
    const fixture = `globalThis.fetch=()=>{throw new Error('Network forbidden')};
      const rows=require('./src/app/sitemap.ts').default();
      const paths=['/calc/pension-hike-2027','/tools/finance/irp','/','/calc/civil-servant-net-pay','/social-insurance-rates-2027'];
      console.log(JSON.stringify(paths.map(path=>({path,date:rows.find(row=>new URL(row.url).pathname===path).lastModified.toISOString()}))));`;
    const rows = JSON.parse(execFileSync(process.execPath, ['--import', 'tsx', '-e', fixture], {
      cwd: process.cwd(), encoding: 'utf8', timeout: 30_000, maxBuffer: 1024 * 1024,
    })) as Array<{path: string; date: string}>;
    const day = (date: string) => new Date(new Date(date).getTime() + 9 * 3600000).toISOString().slice(0, 10);
    expect(rows.map(row => [row.path, day(row.date)])).toEqual([
      ['/calc/pension-hike-2027', '2026-10-23'], ['/tools/finance/irp', '2026-10-23'],
      ['/', '2026-10-19'], ['/calc/civil-servant-net-pay', '2026-09-27'],
      ['/social-insurance-rates-2027', '2026-10-04'],
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
      const sitemap=require('./src/app/sitemap.ts').default();
      const industry=require('./src/data/industriesData.ts').industriesData[0].id;
      const region=require('./src/data/regionsData.ts').regionsData[0].id;
      const changed=[...PAGE_LINK_REVIEW_PATHS,'/industry/'+industry,'/region/'+region];
      console.log(JSON.stringify({changed:changed.map(path=>({path,date:pageContentRevision(path)?.toISOString(),matches:sitemap.filter(row=>new URL(row.url).pathname===path).map(row=>row.lastModified.toISOString())})),untouched:['/job/nurse','/calc/loan-balance-after-payments','/en/calculators','/en/salary-converter','/fun','/guides/tax-guide','/en/guides/tax-deduction'].map(path=>[path,!!pageContentRevision(path)])}));`;
    const result = JSON.parse(execFileSync(process.execPath, ['--import', 'tsx', '-e', fixture], {
      cwd: process.cwd(), encoding: 'utf8', timeout: 30_000, maxBuffer: 1024 * 1024,
    })) as { changed: Array<{path: string; date: string; matches: string[]}>; untouched: Array<[string, boolean]> };
    for (const row of result.changed) {
      expect(row.date, row.path).toBe('2026-10-18T15:00:00.000Z');
      expect(row.matches, row.path).toEqual([row.date]);
    }
    expect(result.untouched.every(([, changed]) => !changed)).toBe(true);
  }, 35_000);
});
