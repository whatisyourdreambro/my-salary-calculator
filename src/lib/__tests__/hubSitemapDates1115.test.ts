import { execFileSync } from 'node:child_process';
import { describe, expect, it } from 'vitest';

// N2-infra-02 (infra-b03-F01, 2026-11-15 감사): 허브 6곳의 사이트맵 lastmod 는 화면 문구를 마지막으로 바꾼
// 운영 커밋의 날(ROUTE_OVERRIDES 행 + 콘텐츠 검토 원장)을 낸다 — 전역 기준일 7/16·DART 기준일 8/23 에 묶이지 않는다.
// /salary-db/listed 는 DART 기준일과 행 날짜 중 늦은 날(나중 DART 갱신이 이긴다). 자식 행과 priority 는 그대로.
// 2026-11-18 R4: /salary-db/listed 소개 문단 '산정한 평균연봉'(COMPANY CL-04 b45dffdf8) — 행 날짜 2026-10-17 -> 2026-11-18.
describe('hub sitemap dates (N2-infra-02)', () => {
  it('six hubs carry their ROUTE_OVERRIDES day, never a future day, with unchanged priorities', () => {
    const fixture = `globalThis.fetch=()=>{throw new Error('Network forbidden')};
      const {default:sitemap,ROUTE_OVERRIDES}=require('./src/app/sitemap.ts');
      const {DART_LITE_DATE}=require('./src/lib/salary-data/dartLite.ts');
      const rows=sitemap();
      const paths=['/salary-db','/salary-db/ranking','/salary-db/listed','/job','/industry','/region'];
      console.log(JSON.stringify({dartLite:new Date(DART_LITE_DATE).toISOString(),rows:paths.map(path=>({path,override:ROUTE_OVERRIDES[path]?.lastModified?.toISOString()??null,overridePriority:ROUTE_OVERRIDES[path]?.priority??null,matches:rows.filter(row=>new URL(row.url).pathname===path).map(row=>({date:new Date(row.lastModified).toISOString(),priority:row.priority}))}))}));`;
    const result = JSON.parse(execFileSync(process.execPath, ['--import', 'tsx', '-e', fixture], {
      cwd: process.cwd(), encoding: 'utf8', timeout: 30_000, maxBuffer: 1024 * 1024,
    })) as { dartLite: string; rows: Array<{ path: string; override: string | null; overridePriority: number | null; matches: Array<{ date: string; priority: number }> }> };
    const priorities: Record<string, number> = {
      '/salary-db': 0.9, '/salary-db/ranking': 0.8, '/salary-db/listed': 0.7, '/job': 0.9, '/industry': 0.9, '/region': 0.9,
    };
    const days: Record<string, string> = {
      '/salary-db': '2026-10-16T15:00:00.000Z', '/salary-db/ranking': '2026-10-16T15:00:00.000Z', '/salary-db/listed': '2026-11-17T15:00:00.000Z',
      '/job': '2026-10-04T15:00:00.000Z', '/industry': '2026-10-04T15:00:00.000Z', '/region': '2026-10-16T15:00:00.000Z',
    };
    const now = Date.now();
    expect(result.rows).toHaveLength(6);
    for (const row of result.rows) {
      expect(row.override, row.path).toBe(days[row.path]);
      expect(row.overridePriority, `${row.path} override has lastModified only`).toBeNull();
      expect(row.matches, row.path).toHaveLength(1);
      const [entry] = row.matches;
      const expected = row.path === '/salary-db/listed' && result.dartLite > row.override! ? result.dartLite : row.override;
      expect(entry.date, row.path).toBe(expected);
      expect(new Date(entry.date).getTime(), row.path).toBeLessThanOrEqual(now);
      expect(entry.priority, row.path).toBe(priorities[row.path]);
    }
  }, 35_000);
});
