// 2026 봉급표 전 호봉 풀표 가드 (수익 추천 #2, 2026-09-25 준비)
//
// 풀표는 수백 칸이라 옮겨 적는 과정의 오류가 곧 금융·세금 정보 신뢰 문제가 된다. 그래서:
//  (1) 기준값(앵커) 4개 — 9급 1호봉 2,133,000 · 경사 1호봉 2,472,100 · 경감 1호봉 2,698,600 · 교원 9호봉 2,495,600
//      (인사혁신처 2026 봉급표 원문, 2026-09-25 재확인). 계급 열이 한 칸 밀리면 경사·경감 앵커가 깨진다.
//  (2) 모든 열이 호봉 오름차순으로 증가하고, 호봉이 1부터 빈틈없이 이어지며, 열별 최고 호봉 수가 원문과 같다
//  (3) 기존 발췌표(civilServantPay.ts — 3중 교차검증)와 겹치는 칸이 전부 같다
//  (4) 풀표는 네 페이지 모두 마지막 광고(사이드바 포함) 뒤, 그리드 밖에 붙고 광고 순서·광고 위 영역은 그대로다
import { createElement, type AnchorHTMLAttributes } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

vi.mock("@/components/AppLink", () => ({
  default: (props: AnchorHTMLAttributes<HTMLAnchorElement>) => createElement("a", props),
}));
vi.mock("@/components/AdPlacement", () => {
  const ad = (name: string) => {
    const MockAd = () => createElement("div", { "data-test-ad": name });
    MockAd.displayName = `MockAd(${name})`;
    return MockAd;
  };
  return {
    HomeTopAd: ad("home-top"),
    CalcResultAd: ad("calc-result"),
    InArticleAd: ad("in-article"),
    GuideMidAd: ad("guide-mid"),
    MultiplexAd: ad("multiplex"),
    SidebarAd: ad("sidebar"),
  };
});
vi.mock("@/components/CoupangBanner", () => ({ default: () => createElement("div", { "data-test-ad": "coupang" }) }));
vi.mock("@/components/ShareButtons", () => ({ default: () => createElement("div", { "data-test-share": "1" }) }));
vi.mock("@/components/RelatedCalculators", () => ({ default: () => null }));
vi.mock("@/components/PrivateFeedback", () => ({ default: () => null }));
vi.mock("@/components/CitationCopyButton", () => ({ default: () => null }));

import TeacherPage from "@/app/teacher-pay-2026/page";
import PolicePage from "@/app/police-pay-2026/page";
import FirePage from "@/app/firefighter-pay-2026/page";
import CivilPage from "@/app/civil-servant-pay-2026/page";
import {
  GENERAL_GRADES_FULL,
  GENERAL_PAY_FULL_2026,
  POLICE_FIRE_PAY_FULL_2026,
  POLICE_FIRE_RANKS_FULL,
  TEACHER_PAY_FULL_2026,
  payAt,
  pickPayColumns,
} from "@/lib/payTablesFull2026";
import {
  GENERAL_PAY_ROWS_2026,
  POLICE_FIRE_ROWS_2026,
  POLICE_RANK_ROWS_2026,
  TEACHER_PAY_ROWS_2026,
} from "@/lib/civilServantPay";

type Rows = ReadonlyArray<ReadonlyArray<number | null>>;
const col = (label: string, labels: ReadonlyArray<string>) => {
  const i = labels.indexOf(label);
  if (i < 0) throw new Error(`열 ${label} 없음`);
  return i + 1; // 행 배열 인덱스 (0 = 호봉)
};
const POLICE = POLICE_FIRE_RANKS_FULL.map((r) => r.police);
const FIRE = POLICE_FIRE_RANKS_FULL.map((r) => r.fire);

describe("앵커 — 인사혁신처 2026 봉급표 원문 기준값", () => {
  it("9급 1호봉 2,133,000원", () => {
    expect(payAt(GENERAL_PAY_FULL_2026, 1, col("9급", GENERAL_GRADES_FULL))).toBe(2133000);
  });
  it("경사(소방장) 1호봉 2,472,100원", () => {
    expect(payAt(POLICE_FIRE_PAY_FULL_2026, 1, col("경사", POLICE))).toBe(2472100);
    expect(payAt(POLICE_FIRE_PAY_FULL_2026, 1, col("소방장", FIRE))).toBe(2472100);
  });
  it("경감(소방경) 1호봉 2,698,600원", () => {
    expect(payAt(POLICE_FIRE_PAY_FULL_2026, 1, col("경감", POLICE))).toBe(2698600);
    expect(payAt(POLICE_FIRE_PAY_FULL_2026, 1, col("소방경", FIRE))).toBe(2698600);
  });
  it("교원 9호봉 2,495,600원", () => {
    expect(TEACHER_PAY_FULL_2026.find(([h]) => h === 9)?.[1]).toBe(2495600);
  });
  it("그 밖의 원문 확인값 — 순경 1호봉 = 9급 1호봉, 경정 1호봉·치안정감 23호봉·1급 23호봉·교원 1·40호봉", () => {
    expect(payAt(POLICE_FIRE_PAY_FULL_2026, 1, col("순경", POLICE))).toBe(2133000);
    expect(payAt(POLICE_FIRE_PAY_FULL_2026, 1, col("경정", POLICE))).toBe(3126100);
    expect(payAt(POLICE_FIRE_PAY_FULL_2026, 23, col("치안정감", POLICE))).toBe(8250400);
    expect(payAt(GENERAL_PAY_FULL_2026, 1, col("1급", GENERAL_GRADES_FULL))).toBe(4656100);
    expect(payAt(GENERAL_PAY_FULL_2026, 23, col("1급", GENERAL_GRADES_FULL))).toBe(8001400);
    expect(TEACHER_PAY_FULL_2026[0]).toEqual([1, 2041500]);
    expect(TEACHER_PAY_FULL_2026[TEACHER_PAY_FULL_2026.length - 1]).toEqual([40, 6205700]);
  });
  it("payAt 은 없는 호봉·열에 예외를 던진다 (대표 호봉 오기재 차단)", () => {
    expect(() => payAt(POLICE_FIRE_PAY_FULL_2026, 24, col("치안정감", POLICE))).toThrow();
    expect(() => payAt(POLICE_FIRE_PAY_FULL_2026, 99, 1)).toThrow();
  });
});

/** 열마다 [호봉, 값] — null 제외 */
const series = (rows: Rows, c: number) =>
  rows.filter((r) => typeof r[c] === "number").map((r) => [r[0] as number, r[c] as number] as const);

describe("구조 — 오름차순·연속·열별 최고 호봉", () => {
  const cases: Array<{ name: string; rows: Rows; labels: ReadonlyArray<string>; maxSteps: Record<string, number> }> = [
    {
      name: "일반직 (별표 3)",
      rows: GENERAL_PAY_FULL_2026,
      labels: GENERAL_GRADES_FULL,
      maxSteps: { "9급": 31, "8급": 31, "7급": 31, "6급": 32, "5급": 30, "4급": 28, "3급": 27, "2급": 25, "1급": 23 },
    },
    {
      name: "경찰·소방 (별표 10)",
      rows: POLICE_FIRE_PAY_FULL_2026,
      labels: POLICE,
      maxSteps: { 순경: 31, 경장: 31, 경사: 31, 경위: 31, 경감: 32, 경정: 30, 총경: 28, 경무관: 27, 치안감: 25, 치안정감: 23 },
    },
  ];

  it.each(cases)("$name: 호봉 행 1~32 빈틈없음, 열 수 일치", ({ rows, labels }) => {
    expect(rows.map((r) => r[0])).toEqual(Array.from({ length: 32 }, (_, i) => i + 1));
    for (const r of rows) expect(r.length, `${r[0]}호봉 열 수`).toBe(labels.length + 1);
  });

  it.each(cases)("$name: 열마다 1호봉부터 연속, 최고 호봉 수가 원문과 같고 호봉이 오를수록 증가", ({ rows, labels, maxSteps }) => {
    labels.forEach((label, i) => {
      const s = series(rows, i + 1);
      expect(s.map(([h]) => h), `${label} 호봉 연속`).toEqual(Array.from({ length: s.length }, (_, k) => k + 1));
      expect(s.length, `${label} 최고 호봉`).toBe(maxSteps[label]);
      for (let k = 1; k < s.length; k++) expect(s[k][1], `${label} ${s[k][0]}호봉 > ${s[k - 1][0]}호봉`).toBeGreaterThan(s[k - 1][1]);
    });
  });

  it.each(cases)("$name: 같은 호봉에서 상위 계급(급수)이 더 많다", ({ rows, labels }) => {
    for (const r of rows) {
      const vals = r.slice(1).filter((v): v is number => typeof v === "number");
      for (let k = 1; k < vals.length; k++) expect(vals[k], `${r[0]}호봉 ${labels[k]}`).toBeGreaterThan(vals[k - 1]);
    }
  });

  it("교원: 1~40호봉 빈틈없고 호봉이 오를수록 증가, 모든 값은 100원 단위", () => {
    expect(TEACHER_PAY_FULL_2026.map(([h]) => h)).toEqual(Array.from({ length: 40 }, (_, i) => i + 1));
    for (let k = 1; k < TEACHER_PAY_FULL_2026.length; k++) {
      expect(TEACHER_PAY_FULL_2026[k][1]).toBeGreaterThan(TEACHER_PAY_FULL_2026[k - 1][1]);
    }
    const all = [
      ...TEACHER_PAY_FULL_2026.map(([, v]) => v),
      ...[...GENERAL_PAY_FULL_2026, ...POLICE_FIRE_PAY_FULL_2026].flatMap((r) => r.slice(1)).filter((v): v is number => typeof v === "number"),
    ];
    for (const v of all) expect(v % 100, String(v)).toBe(0);
  });
});

describe("기존 발췌표(3중 교차검증)와 겹치는 칸 전부 일치", () => {
  it("교원 발췌 9행", () => {
    for (const [h, v] of TEACHER_PAY_ROWS_2026) expect(TEACHER_PAY_FULL_2026.find(([x]) => x === h)?.[1], `${h}호봉`).toBe(v);
  });
  it("경찰·소방 순경~경감 1~5호봉 25칸 + 순경·소방사 1~5호봉", () => {
    for (const [h, ...pays] of POLICE_RANK_ROWS_2026) {
      pays.forEach((v, i) => expect(payAt(POLICE_FIRE_PAY_FULL_2026, h, i + 1), `${POLICE[i]} ${h}호봉`).toBe(v));
    }
    for (const [h, v] of POLICE_FIRE_ROWS_2026) expect(payAt(POLICE_FIRE_PAY_FULL_2026, h, 1)).toBe(v);
  });
  it("일반직 9급~5급 1~10호봉 50칸", () => {
    for (const [h, ...pays] of GENERAL_PAY_ROWS_2026) {
      pays.forEach((v, i) => expect(payAt(GENERAL_PAY_FULL_2026, h, i + 1), `${GENERAL_GRADES_FULL[i]} ${h}호봉`).toBe(v));
    }
  });
});

describe("pickPayColumns", () => {
  it("상위 5계급은 경정 최고 30호봉까지, 하위 5계급은 경감 32호봉까지", () => {
    const upper = pickPayColumns(POLICE_FIRE_PAY_FULL_2026, 5, 10);
    const lower = pickPayColumns(POLICE_FIRE_PAY_FULL_2026, 0, 5);
    expect(upper.length).toBe(30);
    expect(lower.length).toBe(32);
    expect(upper[0]).toEqual([1, 3126100, 3619000, 4167700, 4563500, 4905100]);
    expect(lower[31]).toEqual([32, null, null, null, null, 5372500]);
  });
});

// ── 페이지 배치 ───────────────────────────────────────────────────────────
function render(Page: () => unknown) {
  const html = renderToStaticMarkup(createElement(Page as never)).replace(/<script\b[^>]*>[\s\S]*?<\/script>/g, "");
  const ads = [...html.matchAll(/data-test-ad="([^"]+)"/g)].map((m) => ({ name: m[1], index: m.index ?? 0 }));
  return { html, ads };
}

const PAGE_CASES = [
  {
    name: "/teacher-pay-2026",
    Page: TeacherPage,
    id: "teacher-full-table",
    ads: ["home-top", "calc-result", "in-article", "guide-mid", "coupang", "sidebar", "coupang"],
    cells: TEACHER_PAY_FULL_2026.length,
    links: ["/teacher-pay-2027"],
  },
  {
    name: "/police-pay-2026",
    Page: PolicePage,
    id: "police-full-table",
    ads: ["home-top", "calc-result", "in-article", "guide-mid", "coupang", "sidebar", "coupang"],
    cells: POLICE_FIRE_PAY_FULL_2026.flatMap((r) => r.slice(1)).filter((v) => typeof v === "number").length,
    links: ["/police-pay-2027", "/firefighter-pay-2026#fire-full-table"],
  },
  {
    name: "/firefighter-pay-2026",
    Page: FirePage,
    id: "fire-full-table",
    ads: ["home-top", "calc-result", "in-article", "guide-mid", "coupang", "sidebar", "coupang"],
    cells: POLICE_FIRE_PAY_FULL_2026.flatMap((r) => r.slice(1)).filter((v) => typeof v === "number").length,
    links: ["/firefighter-pay-2027", "/police-pay-2026#police-full-table"],
  },
  {
    name: "/civil-servant-pay-2026",
    Page: CivilPage,
    id: "general-full-table",
    ads: ["home-top", "calc-result", "in-article", "guide-mid", "coupang", "multiplex", "sidebar", "coupang"],
    cells: GENERAL_PAY_FULL_2026.flatMap((r) => r.slice(1)).filter((v) => typeof v === "number").length,
    links: ["/civil-servant-pay-2027", "/teacher-pay-2026#teacher-full-table"],
  },
];

describe("풀표 배치 — 마지막 광고·공유 버튼 아래, 광고 순서 불변", () => {
  it.each(PAGE_CASES)("$name: 광고 컴포넌트 순서 불변", ({ Page, ads }) => {
    expect(render(Page).ads.map((a) => a.name)).toEqual(ads);
  });

  it.each(PAGE_CASES)("$name: 풀표 섹션은 모든 광고(사이드바 포함)와 공유 버튼보다 뒤", ({ Page, id }) => {
    const { html, ads } = render(Page);
    const at = html.indexOf(`id="${id}"`);
    expect(at, "풀표 섹션").toBeGreaterThan(0);
    expect(at).toBeGreaterThan(Math.max(...ads.map((a) => a.index)));
    expect(at).toBeGreaterThan(html.lastIndexOf('data-test-share="1"'));
    // 섹션 뒤에는 광고가 없다
    expect(html.slice(at)).not.toContain("data-test-ad=");
  });

  it.each(PAGE_CASES)("$name: 풀표의 금액 칸 수가 데이터와 같고 가로 스크롤은 표 영역 안에서만", ({ Page, id, cells }) => {
    const { html } = render(Page);
    const section = html.slice(html.indexOf(`id="${id}"`));
    const tds = [...section.matchAll(/<td\b[^>]*>([\s\S]*?)<\/td>/g)].map((m) => m[1]);
    expect(tds.filter((t) => /^\d{1,3}(,\d{3})+$/.test(t)).length).toBe(cells);
    expect(section).toContain('class="overflow-x-auto"');
    expect(section).toContain('role="region"');
    // 호봉 열은 행 머리글(th scope=row)
    expect(section).toMatch(/<th scope="row"[^>]*>1<!-- -->호봉<\/th>|<th scope="row"[^>]*>1호봉<\/th>/);
  });

  it.each(PAGE_CASES)("$name: 풀표에 출처(인사혁신처)와 관련 링크", ({ Page, id, links }) => {
    const { html } = render(Page);
    const section = html.slice(html.indexOf(`id="${id}"`));
    expect(section).toContain("https://www.mpm.go.kr/mpm/info/resultPay/bizSalary/2026/");
    for (const href of links) expect(section, href).toContain(`href="${href}"`);
  });

  it.each(PAGE_CASES)("$name: 첫 광고 위 영역에 풀표가 없다", ({ Page, id }) => {
    const { html, ads } = render(Page);
    const aboveFirstAd = html.slice(0, ads[0].index);
    expect(aboveFirstAd).not.toContain(`id="${id}"`);
    expect(aboveFirstAd).not.toContain("PayStepTable");
  });

  // 풀표 추가일은 head(메타·Article·Dataset)에만 — 광고 위 PublishedMeta 에 '최종 갱신' 문구를 새로 붙이지 않는다
  // (발행일과 수정일이 달라지면 문구가 길어져 광고 위 텍스트가 늘어난다. teacher·fire 는 B20 에서 이미 표시 중)
  it.each([
    { name: "/police-pay-2026", Page: PolicePage },
    { name: "/civil-servant-pay-2026", Page: CivilPage },
  ])("$name: 광고 위 PublishedMeta 는 발행일만 (이전과 같은 길이)", ({ Page }) => {
    const { html, ads } = render(Page);
    expect(html.slice(0, ads[0].index)).not.toContain("최종 갱신");
  });
});
