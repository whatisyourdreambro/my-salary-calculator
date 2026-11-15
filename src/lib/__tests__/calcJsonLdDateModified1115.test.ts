// 계산기 SoftwareApplication JSON-LD dateModified = 사이트맵 lastmod (2026-11-15 SEASONA, 감사 calc ideas[0])
//
// 홈·삼성·현대차·연말 성과급 계산기만 staticRouteLastModified(자기 경로)를 넘기고 나머지 /calc 정적 계산기 39곳은
// dateModified 가 없었다 — 성과급·연말정산 시즌 직전에 구조화 데이터 신선도 신호가 비어 있던 것. 이제 /calc 아래
// 정적 page.tsx 는 모두 자기 경로의 사이트맵 날짜를 넘긴다(head 의 JSON-LD 만, 화면 변화 없음).
// 날짜 값 자체가 사이트맵 행과 같은지는 structuredDataTrust.test.ts 가 전체 정적 페이지로 확인한다.
// /calc/bonus-home-plan 은 Dataset(시세 기준일)에만 dateModified 가 있고 SoftwareApplication 에는 없어서 함께 넣었다(39곳).
// 예외(이번 묶음 전부터 다른 값으로 날짜를 넘기던 2곳 — 사이트맵 날짜와 같은지는 structuredDataTrust.test.ts 가 확인):
//   SK하이닉스 psData.LAST_UPDATED(화면 '마지막 갱신'과 같은 상수), 이직 오퍼 비교 문자열 날짜.
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { appLdDateFields } from "../../../scripts/lib/sitemap-freshness.mjs";

type AppLdField = { builder: string; route: string | null; value: string | null };

const OWN_DATE_SOURCE: Readonly<Record<string, string>> = {
  "/calc/sk-hynix-bonus": "dateModified: LAST_UPDATED,",
  "/calc/offer-compare": 'dateModified: "2026-11-01",',
};

const CALC = join(process.cwd(), "src", "app", "calc");
const pages = readdirSync(CALC, { withFileTypes: true })
  .filter((d) => d.isDirectory() && !d.name.startsWith("["))
  .map((d) => ({ route: `/calc/${d.name}`, file: join(CALC, d.name, "page.tsx") }))
  .filter(({ file }) => existsSync(file))
  .map((p) => ({ ...p, source: readFileSync(p.file, "utf8") }))
  .filter(({ source }) => source.includes("softwareApplicationLd("));

describe("/calc 정적 계산기 SoftwareApplication dateModified (SEASONA calc ideas[0])", () => {
  it("대상은 40곳 이상이고, 이번에 넣은 곳이 빠짐없이 들어 있다", () => {
    expect(pages.length).toBeGreaterThanOrEqual(40);
    for (const route of ["/calc/s-oil-bonus", "/calc/samsung-biologics-bonus", "/calc/vacation-pay", "/calc/severance-vs-pension",
      "/calc/pension-hike-2027", "/calc/year-end-bonus-tax", "/calc/voluntary-retirement", "/calc/january-bonus", "/calc/bonus-home-plan"]) {
      expect(pages.map((p) => p.route), route).toContain(route);
    }
  });

  it.each(pages.map((p) => [p.route, p] as const))("%s 는 자기 경로로 staticRouteLastModified 를 부른다", (route, page) => {
    const fields = appLdDateFields(page.source, page.file) as AppLdField[];
    expect(fields, route).toHaveLength(1);
    expect(fields[0].builder).toBe("softwareApplicationLd");
    if (route in OWN_DATE_SOURCE) {
      expect(page.source).toContain(OWN_DATE_SOURCE[route]);
      return;
    }
    expect(fields[0].route, route).toBe(route);
    expect(page.source).toContain('import { staticRouteLastModified } from "@/app/sitemap";');
  });
});
