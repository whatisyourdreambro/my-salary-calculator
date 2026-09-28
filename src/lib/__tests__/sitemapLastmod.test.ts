// 사이트맵 lastmod 회귀 (S10, 2026-10-15 배포) — 9/25~26 실질 수정분과 EN 정적 경로 override.
//
// sitemap() 본문은 require('@/…') 지연 로드라 vitest 에서 직접 부를 수 없다(scripts/verify-sitemap.ts 머리말).
// 모듈 스코프의 ROUTE_OVERRIDES·날짜 함수는 import 로, sitemap() 안의 배선은 소스 문자열로 확인한다.
// 실제 출력 대조는 npm run verify:sitemap · npx tsx scripts/season-announce.ts check 가 한다.
import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import {
  ROUTE_OVERRIDES,
  calcLastModified,
  enStaticLastModified,
  glossaryLastModified,
  latestDate,
  qnaLastModified,
} from "@/app/sitemap";
import { STATIC_LAST_MODIFIED } from "@/config/siteDates";
import { EN_INDEXABLE_STATIC_PATHS } from "@/lib/englishRoutes";
import { qnaData } from "@/data/qnaData";
import { glossaryData } from "@/data/glossaryData";
import { allCalculators } from "@/lib/simpleCalculators";
import { lastmodAction } from "@/lib/seasonAnnounce";

const day = (d: Date) => d.toISOString().slice(0, 10);
const SRC = fs.readFileSync(path.join(process.cwd(), "src/app/sitemap.ts"), "utf8");
const SITEMAP_BODY = SRC.slice(SRC.indexOf("export default function sitemap"));
const isRealDay = (s: string) => /^\d{4}-\d{2}-\d{2}$/.test(s) && new Date(s).toISOString().slice(0, 10) === s;

describe("latestDate", () => {
  it("가장 늦은 날짜를 고르고 undefined·잘못된 날짜는 건너뛴다", () => {
    const base = new Date("2026-07-16");
    expect(latestDate(base)).toBe(base);
    expect(latestDate(base, undefined, new Date("2026-09-25"), new Date("2026-09-01"))).toEqual(new Date("2026-09-25"));
    expect(latestDate(base, new Date("2026-01-01"))).toBe(base);
    expect(latestDate(base, new Date("not-a-date"))).toBe(base);
  });
});

describe("EN 정적 경로 lastmod — 수기 override 가 이긴다", () => {
  it("override 가 있으면 그 날짜, 없으면 EN 기준일 2026-09-09", () => {
    expect(day(enStaticLastModified(undefined))).toBe("2026-09-09");
    expect(day(enStaticLastModified({ priority: 0.9 }))).toBe("2026-09-09");
    expect(day(enStaticLastModified({ lastModified: new Date("2026-10-15") }))).toBe("2026-10-15");
  });

  it("모든 EN 정적 경로에 규칙 그대로 — /en·/en/help 는 9/25 정정일 이후", () => {
    for (const p of EN_INDEXABLE_STATIC_PATHS) {
      const expected = ROUTE_OVERRIDES[p]?.lastModified ?? new Date("2026-09-09");
      expect(enStaticLastModified(ROUTE_OVERRIDES[p]).getTime(), p).toBe(expected.getTime());
    }
    for (const p of ["/en", "/en/help"]) {
      expect(EN_INDEXABLE_STATIC_PATHS, p).toContain(p);
      expect(day(enStaticLastModified(ROUTE_OVERRIDES[p])) >= "2026-09-25", p).toBe(true);
    }
  });

  it("sitemap() 의 EN 루프가 override 를 9/09 로 덮어쓰지 않는다 (소스)", () => {
    expect(SITEMAP_BODY).toContain("lastModified: enStaticLastModified(routeOverrides[path])");
    expect(SITEMAP_BODY).not.toMatch(/routeOverrides\[path\] = \{ \.\.\.routeOverrides\[path\], lastModified: new Date\(/);
  });
});

describe("9/25~26 실질 수정분 — 수기 override 하한", () => {
  it.each([
    ["/", "2026-09-25"],
    ["/en", "2026-09-25"],
    ["/en/help", "2026-09-25"],
    ["/salary-db", "2026-09-25"],
    ["/salary-db/ranking", "2026-09-25"],
    ["/qna", "2026-09-26"],
  ])("%s ≥ %s", (route, floor) => {
    const lm = ROUTE_OVERRIDES[route]?.lastModified;
    expect(lm, route).toBeInstanceOf(Date);
    expect(day(lm!) >= floor, `${route} ${lm?.toISOString()}`).toBe(true);
  });

  it("하한은 max 로만 합친다 — 더 최신인 기존 행을 되돌리지 않음 (소스)", () => {
    expect(SRC).toContain("lastModified: latestDate(date, ROUTE_OVERRIDES[route]?.lastModified)");
  });

  it("/qna 목록 lastmod 는 Q&A 항목 수정일 중 최신값 이상", () => {
    const newest = latestDate(STATIC_LAST_MODIFIED, ...qnaData.map((q) => qnaLastModified(q)));
    expect(ROUTE_OVERRIDES["/qna"].lastModified!.getTime()).toBeGreaterThanOrEqual(newest.getTime());
  });

  it("/salary-db·/salary-db/ranking 은 routeOverrides 를 읽는다 (소스)", () => {
    expect(SITEMAP_BODY).toContain("lastModified: routeOverrides['/salary-db']?.lastModified ?? STATIC_LAST_MODIFIED");
    expect(SITEMAP_BODY).toContain("lastModified: routeOverrides['/salary-db/ranking']?.lastModified ?? STATIC_LAST_MODIFIED");
  });
});

describe("항목 수정일 modifiedAt → lastmod = max(기준일, …)", () => {
  it("간이 계산기: publishedAt·modifiedAt 은 KST 자정, 기준일보다 이르면 기준일", () => {
    expect(calcLastModified({})).toBe(STATIC_LAST_MODIFIED);
    expect(calcLastModified({ publishedAt: "2026-09-10" }).toISOString()).toBe("2026-09-09T15:00:00.000Z");
    expect(calcLastModified({ publishedAt: "2026-09-10", modifiedAt: "2026-09-25" }).toISOString()).toBe("2026-09-24T15:00:00.000Z");
    expect(calcLastModified({ publishedAt: "2026-09-10", modifiedAt: "2026-09-01" }).toISOString()).toBe("2026-09-09T15:00:00.000Z");
    expect(calcLastModified({ modifiedAt: "2026-01-02" })).toBe(STATIC_LAST_MODIFIED);
  });

  it("간이 계산기: modifiedAt 이 없는 계산기는 종전 규칙(publishedAt ?? 기준일)과 같은 값", () => {
    for (const c of allCalculators) {
      if (c.modifiedAt) continue;
      const before = c.publishedAt ? new Date(`${c.publishedAt}T00:00:00+09:00`) : STATIC_LAST_MODIFIED;
      expect(calcLastModified(c).getTime(), c.slug).toBe(before.getTime());
    }
  });

  it("간이 계산기: employee-cost-quick 은 9/25 FAQ 정정일, modifiedAt 은 실재 날짜이고 publishedAt 이후", () => {
    const ecq = allCalculators.find((c) => c.slug === "employee-cost-quick")!;
    expect(ecq.modifiedAt).toBe("2026-09-25");
    expect(calcLastModified(ecq).toISOString()).toBe("2026-09-24T15:00:00.000Z");
    for (const c of allCalculators.filter((x) => x.modifiedAt)) {
      expect(isRealDay(c.modifiedAt!), c.slug).toBe(true);
      if (c.publishedAt) expect(c.modifiedAt! >= c.publishedAt, c.slug).toBe(true);
    }
  });

  it("Q&A: 9/25~26 정정 7건은 git log 커밋일, modifiedAt 없는 항목은 기준일", () => {
    const corrected: Record<string, string> = {
      "연봉 5,000만원인데 실수령액은 왜 350만원 정도인가요?": "2026-09-25",
      "청년도약계좌, 5년 묶이는 게 부담스러운데 할까요?": "2026-09-25",
      "육아휴직 신청 조건이 뭔가요? 계약직·알바도 가능한가요?": "2026-09-26",
      "출산휴가와 육아휴직은 다른 건가요? 둘 다 받을 수 있나요?": "2026-09-26",
      "본인부담상한제가 뭔가요? 의료비가 너무 많이 나왔을 때 어떻게 하나요?": "2026-09-25",
      "청년내일채움공제가 뭔가요? 아직 신청 가능한가요?": "2026-09-25",
      "연봉 1억을 넘으면 세금이 얼마나 되나요?": "2026-09-25",
    };
    for (const [question, date] of Object.entries(corrected)) {
      const item = qnaData.find((q) => q.question === question);
      expect(item?.modifiedAt, question).toBe(date);
      expect(day(qnaLastModified(item!)), question).toBe(date);
    }
    for (const q of qnaData) {
      if (q.modifiedAt) expect(isRealDay(q.modifiedAt), q.question).toBe(true);
      else expect(qnaLastModified(q), q.question).toBe(STATIC_LAST_MODIFIED);
    }
  });

  it("용어: 템플릿 검수일(9/25 META-10) 하한, 용어 modifiedAt 이 더 늦으면 그 날짜", () => {
    expect(day(glossaryLastModified({}))).toBe("2026-09-25");
    expect(day(glossaryLastModified({ modifiedAt: "2026-09-01" }))).toBe("2026-09-25");
    expect(day(glossaryLastModified({ modifiedAt: "2026-10-20" }))).toBe("2026-10-20");
    for (const g of glossaryData) {
      if (g.modifiedAt) expect(isRealDay(g.modifiedAt), g.title).toBe(true);
      expect(day(glossaryLastModified(g)) >= "2026-09-25", g.title).toBe(true);
    }
  });

  it("sitemap() 이 이 함수들로 동적 URL lastmod 를 만든다 (소스)", () => {
    expect(SITEMAP_BODY).toContain("lastModified: calcLastModified(c)");
    expect(SITEMAP_BODY).toContain("lastModified: glossaryLastModified(item)");
    expect(SITEMAP_BODY).toContain("lastModified: qnaLastModified(item)");
  });

  it("시즌 등록부 calc-publishedAt 손잡이 할 일은 modifiedAt 을 올리라고 안내 (publishedAt 은 신설일)", () => {
    const action = lastmodAction({ kind: "calc-publishedAt", ref: "unemployment-benefit" });
    expect(action).toContain("modifiedAt");
    expect(action).toContain("publishedAt 은 신설일");
  });
});
