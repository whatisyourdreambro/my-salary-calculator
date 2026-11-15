// 2026 봉급표 전 호봉 전체표 가드 (RL-12 재착지 2026-11-15 — 10월 917e628f7 의 PayStepTable·페이지 상자·테스트 재구현)
//
// 전체표는 수백 칸이라 옮겨 적는 과정의 오류가 곧 금융 정보 신뢰 문제가 된다. 그래서:
//  (1) 기준값(앵커) — 9급 1호봉 2,133,000 · 경사 1호봉 2,472,100 · 경감 1호봉 2,698,600 · 교원 9호봉 2,495,600 등
//      계급 열이 한 칸 밀리면 경사·경감 앵커가 깨진다.
//  (2) 열별 원문 합계·칸 수 — 2026-11-15 인사혁신처 2026 봉급표 페이지(mpm.go.kr)를 스크립트로 읽어 이 데이터 파일과 따로 구한 값.
//      같은 날 법제처 현행 공무원보수규정 [별표 3·10·11](대통령령 제36728호, 2026-10-02 시행, 세 별표 '개정 2026. 1. 2.')
//      PDF 와도 전 칸 대조해 불일치 0. 한 칸이라도 바뀌면 그 열 합계가 깨진다.
//  (3) 모든 열이 호봉 오름차순으로 증가하고, 호봉이 1부터 빈틈없이 이어지며, 열별 최고 호봉 수가 원문과 같다
//  (4) 기존 발췌표(civilServantPay.ts — 광고 위 요약표)와 겹치는 칸이 전부 같다
//  (5) 경찰·소방·일반직 전체표는 기본 접힘 상자 안, 본문 칼럼의 마지막 광고 아래(경찰·소방 = 쿠팡 배너 뒤,
//      일반직 = MultiplexAd·역링크 뒤)에 있고, 광고 순서·광고 위 영역은 그대로다. 없는 2027 직렬 페이지로 링크하지 않는다.
import { existsSync } from "node:fs";
import { createElement, type AnchorHTMLAttributes } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

vi.mock("next/navigation", () => ({
  usePathname: () => "/police-pay-2026",
  useRouter: () => ({ push: vi.fn() }),
}));
vi.mock("@/components/AppLink", () => ({
  default: (props: AnchorHTMLAttributes<HTMLAnchorElement>) => createElement("a", props),
}));
vi.mock("@/components/AdPlacement", () => {
  const ad = (name: string) => {
    const MockAd = () => createElement("div", { "data-test-ad": name });
    MockAd.displayName = `MockAd(${name})`; // react/display-name
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
vi.mock("@/components/CitationCopyButton", () => ({ default: () => null }));

import TeacherPage from "@/app/teacher-pay-2026/page";
import PolicePage from "@/app/police-pay-2026/page";
import FirePage from "@/app/firefighter-pay-2026/page";
import CivilPage from "@/app/civil-servant-pay-2026/page";
import {
  GENERAL_GRADES_FULL,
  GENERAL_PAY_FULL_2026,
  PAY_FULL_2026_CHECKED,
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

/** 열마다 [호봉, 값] — null 제외 */
const series = (rows: Rows, c: number) =>
  rows.filter((r) => typeof r[c] === "number").map((r) => [r[0] as number, r[c] as number] as const);

describe("앵커 — 인사혁신처 2026 봉급표·공무원보수규정 별표 원문 기준값", () => {
  it("9급 1호봉 2,133,000원 = 순경 1호봉", () => {
    expect(payAt(GENERAL_PAY_FULL_2026, 1, col("9급", GENERAL_GRADES_FULL))).toBe(2133000);
    expect(payAt(POLICE_FIRE_PAY_FULL_2026, 1, col("순경", POLICE))).toBe(2133000);
  });
  it("경사(소방장) 1호봉 2,472,100원", () => {
    expect(payAt(POLICE_FIRE_PAY_FULL_2026, 1, col("경사", POLICE))).toBe(2472100);
    expect(payAt(POLICE_FIRE_PAY_FULL_2026, 1, col("소방장", FIRE))).toBe(2472100);
  });
  it("경감(소방경) 1호봉 2,698,600원, 32호봉 5,372,500원", () => {
    expect(payAt(POLICE_FIRE_PAY_FULL_2026, 1, col("경감", POLICE))).toBe(2698600);
    expect(payAt(POLICE_FIRE_PAY_FULL_2026, 1, col("소방경", FIRE))).toBe(2698600);
    expect(payAt(POLICE_FIRE_PAY_FULL_2026, 32, col("경감", POLICE))).toBe(5372500);
  });
  it("교원 9호봉 2,495,600원", () => {
    expect(TEACHER_PAY_FULL_2026.find(([h]) => h === 9)?.[1]).toBe(2495600);
  });
  it("그 밖의 원문 확인값 — 경정 1호봉·치안정감 23호봉·1급 1·23호봉·6급 32호봉", () => {
    expect(payAt(POLICE_FIRE_PAY_FULL_2026, 1, col("경정", POLICE))).toBe(3126100);
    expect(payAt(POLICE_FIRE_PAY_FULL_2026, 23, col("치안정감", POLICE))).toBe(8250400);
    expect(payAt(GENERAL_PAY_FULL_2026, 1, col("1급", GENERAL_GRADES_FULL))).toBe(4656100);
    expect(payAt(GENERAL_PAY_FULL_2026, 23, col("1급", GENERAL_GRADES_FULL))).toBe(8001400);
    expect(payAt(GENERAL_PAY_FULL_2026, 32, col("6급", GENERAL_GRADES_FULL))).toBe(4967800);
  });
  it("payAt 은 없는 호봉·열에 예외를 던진다 (대표 호봉 오기재 차단)", () => {
    expect(() => payAt(POLICE_FIRE_PAY_FULL_2026, 24, col("치안정감", POLICE))).toThrow();
    expect(() => payAt(POLICE_FIRE_PAY_FULL_2026, 99, 1)).toThrow();
  });
  it("자료 확인일은 법제처 현행 별표 재대조일", () => {
    expect(PAY_FULL_2026_CHECKED).toBe("2026-11-15");
  });
});

/**
 * 열별 원문 합계·칸 수 — 2026-11-15 인사혁신처 2026 봉급표 페이지 표를 스크립트로 읽어 구한 값(이 데이터 파일과 독립).
 * 일반직은 9급→1급, 경찰·소방은 순경→치안정감 순서. 교원은 1~40호봉 합계.
 */
const OFFICIAL_COLUMN_SUMS = {
  general: {
    sums: [91343200, 99454000, 110127000, 126147200, 135511000, 137268500, 149285600, 149981900, 149930000],
    counts: [31, 31, 31, 32, 30, 28, 27, 25, 23],
  },
  policeFire: {
    sums: [94968200, 102624000, 114518400, 121970600, 137973800, 142402000, 147846900, 159707600, 159279400, 155657000],
    counts: [31, 31, 31, 31, 32, 30, 28, 27, 25, 23],
  },
  teacherSum: 150855600,
};

describe("원문 대조 — 열별 합계·칸 수 (한 칸이라도 바뀌면 실패)", () => {
  const columnSums = (rows: Rows, n: number) =>
    Array.from({ length: n }, (_, i) => series(rows, i + 1).reduce((s, [, v]) => s + v, 0));
  const columnCounts = (rows: Rows, n: number) => Array.from({ length: n }, (_, i) => series(rows, i + 1).length);

  it("일반직 9급~1급 (별표 3)", () => {
    expect(columnSums(GENERAL_PAY_FULL_2026, 9)).toEqual(OFFICIAL_COLUMN_SUMS.general.sums);
    expect(columnCounts(GENERAL_PAY_FULL_2026, 9)).toEqual(OFFICIAL_COLUMN_SUMS.general.counts);
  });
  it("경찰·소방 순경~치안정감 (별표 10)", () => {
    expect(columnSums(POLICE_FIRE_PAY_FULL_2026, 10)).toEqual(OFFICIAL_COLUMN_SUMS.policeFire.sums);
    expect(columnCounts(POLICE_FIRE_PAY_FULL_2026, 10)).toEqual(OFFICIAL_COLUMN_SUMS.policeFire.counts);
  });
  it("교원 1~40호봉 (별표 11)", () => {
    expect(TEACHER_PAY_FULL_2026.reduce((s, [, v]) => s + v, 0)).toBe(OFFICIAL_COLUMN_SUMS.teacherSum);
  });
});

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

  it("모든 값은 100원 단위", () => {
    const all = [
      ...TEACHER_PAY_FULL_2026.map(([, v]) => v),
      ...[...GENERAL_PAY_FULL_2026, ...POLICE_FIRE_PAY_FULL_2026].flatMap((r) => r.slice(1)).filter((v): v is number => typeof v === "number"),
    ];
    for (const v of all) expect(v % 100, String(v)).toBe(0);
  });
});

describe("기존 발췌표(광고 위 요약표)와 겹치는 칸 전부 일치", () => {
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
  it("일반직 4급~1급은 4급 최고 28호봉까지", () => {
    expect(pickPayColumns(GENERAL_PAY_FULL_2026, 5, 9).length).toBe(28);
    expect(pickPayColumns(GENERAL_PAY_FULL_2026, 0, 5).length).toBe(32);
  });
});

// ── 페이지 배치 ───────────────────────────────────────────────────────────
function render(Page: () => unknown) {
  const html = renderToStaticMarkup(createElement(Page as never)).replace(/<script\b[^>]*>[\s\S]*?<\/script>/g, "");
  const ads = [...html.matchAll(/data-test-ad="([^"]+)"/g)].map((m) => ({ name: m[1], index: m.index ?? 0 }));
  return { html, ads };
}

/** <details id=…> 상자 원문(여는 태그부터 짝 닫는 태그까지 — 상자 안에 details 중첩 없음) */
function box(html: string, id: string) {
  const idAt = html.indexOf(`id="${id}"`);
  const start = html.lastIndexOf("<details", idAt);
  const end = html.indexOf("</details>", idAt) + "</details>".length;
  return { idAt, start, end, src: idAt < 0 ? "" : html.slice(start, end) };
}

const POLICE_FIRE_CELLS = POLICE_FIRE_PAY_FULL_2026.flatMap((r) => r.slice(1)).filter((v) => typeof v === "number").length;
const PAGE_CASES = [
  {
    name: "/police-pay-2026",
    Page: PolicePage,
    id: "police-full-table",
    summary: "순경~치안정감 전 호봉 보기",
    lastColumnAd: "coupang",
    ads: ["home-top", "calc-result", "in-article", "guide-mid", "coupang", "sidebar", "coupang"],
    cells: POLICE_FIRE_CELLS,
    headers: POLICE,
    links: ["/firefighter-pay-2026#fire-full-table", "/civil-servant-pay-2027"],
    law: "bylNo=0010",
  },
  {
    name: "/firefighter-pay-2026",
    Page: FirePage,
    id: "fire-full-table",
    summary: "소방사~소방정감 전 호봉 보기",
    lastColumnAd: "coupang",
    ads: ["home-top", "calc-result", "in-article", "guide-mid", "coupang", "sidebar", "coupang"],
    cells: POLICE_FIRE_CELLS,
    headers: FIRE,
    links: ["/police-pay-2026#police-full-table", "/civil-servant-pay-2027"],
    law: "bylNo=0010",
  },
  {
    name: "/civil-servant-pay-2026",
    Page: CivilPage,
    id: "general-full-table",
    summary: "9급~1급 전 호봉 보기",
    lastColumnAd: "multiplex",
    ads: ["home-top", "calc-result", "in-article", "guide-mid", "coupang", "multiplex", "sidebar", "coupang"],
    cells: GENERAL_PAY_FULL_2026.flatMap((r) => r.slice(1)).filter((v) => typeof v === "number").length,
    headers: GENERAL_GRADES_FULL,
    links: [
      "/teacher-pay-2026#teacher-full-table",
      "/police-pay-2026#police-full-table",
      "/firefighter-pay-2026#fire-full-table",
      "/civil-servant-pay-2027",
    ],
    law: "bylNo=0003",
  },
];

describe("전체표 상자 배치 — 본문 칼럼 마지막 광고 아래, 기본 접힘, 광고 순서 불변", () => {
  it.each(PAGE_CASES)("$name: 광고 컴포넌트 순서·개수 불변", ({ Page, ads }) => {
    expect(render(Page).ads.map((a) => a.name)).toEqual(ads);
  });

  it.each(PAGE_CASES)("$name: 상자 1개, <details> 기본 접힘(open 없음), 요약 문구", ({ Page, id, summary }) => {
    const { html } = render(Page);
    expect(html.split(`id="${id}"`)).toHaveLength(2);
    const b = box(html, id);
    const openTag = b.src.slice(0, b.src.indexOf(">") + 1);
    expect(openTag.startsWith("<details")).toBe(true);
    expect(openTag, "기본 접힘").not.toMatch(/\sopen(?:[\s=>]|$)/);
    const text = (/<summary\b[^>]*>([\s\S]*?)<\/summary>/.exec(b.src)?.[1] ?? "").replace(/<[^>]+>/g, "").trim();
    expect(text).toBe(summary);
  });

  it.each(PAGE_CASES)("$name: 상자는 본문 칼럼의 모든 광고 뒤·사이드바 앞, 상자와 사이드바 사이에 광고 없음", ({ Page, id, lastColumnAd }) => {
    const { html, ads } = render(Page);
    const b = box(html, id);
    const aside = html.indexOf("<aside");
    const columnAds = ads.filter((a) => a.index < aside);
    expect(columnAds[columnAds.length - 1].name).toBe(lastColumnAd);
    expect(b.start).toBeGreaterThan(columnAds[columnAds.length - 1].index);
    expect(aside).toBeGreaterThan(b.end);
    expect(html.slice(b.end, aside)).not.toContain("data-test-ad=");
  });

  it.each(PAGE_CASES)("$name: 금액 칸 수가 데이터와 같고, 열 머리글·가로 스크롤은 표 영역 안에서만", ({ Page, id, cells, headers }) => {
    const b = box(render(Page).html, id);
    const tds = [...b.src.matchAll(/<td\b[^>]*>([\s\S]*?)<\/td>/g)].map((m) => m[1]);
    expect(tds.filter((t) => /^\d{1,3}(,\d{3})+$/.test(t)).length).toBe(cells);
    const ths = [...b.src.matchAll(/<th scope="col"[^>]*>([^<]*)<\/th>/g)].map((m) => m[1]).filter((t) => t !== "호봉");
    expect(ths).toEqual([...headers]);
    expect(b.src).toContain('class="overflow-x-auto"');
    expect(b.src).toContain('role="region"');
    expect(b.src).toMatch(/<th scope="row"[^>]*>1<!-- -->호봉<\/th>|<th scope="row"[^>]*>1호봉<\/th>/);
  });

  it.each(PAGE_CASES)("$name: 출처(법제처 별표·확인일)와 교차 링크, 없는 2027 직렬 페이지 링크 0", ({ Page, id, links, law }) => {
    const b = box(render(Page).html, id);
    expect(b.src).toContain(law);
    expect(b.src).toContain(`확인일 ${PAY_FULL_2026_CHECKED}`);
    for (const href of links) expect(b.src, href).toContain(`href="${href}"`);
    expect(b.src).not.toMatch(/href="\/(?:teacher|police|firefighter)-pay-2027/);
    // 상자 안 내부 링크는 모두 있는 라우트
    for (const m of b.src.matchAll(/href="(\/[^"#]*)/g)) {
      expect(existsSync(`src/app${m[1]}/page.tsx`), m[1]).toBe(true);
    }
  });

  it.each(PAGE_CASES)("$name: 첫 광고 위 영역에 전체표·행 머리글이 없다", ({ Page, id }) => {
    const { html, ads } = render(Page);
    const lastColumnAdIndex = ads.filter((a) => a.index < html.indexOf("<aside")).slice(-1)[0].index;
    expect(html.slice(0, lastColumnAdIndex)).not.toContain(`id="${id}"`);
    expect(html.slice(0, lastColumnAdIndex)).not.toContain('scope="row"');
  });

  it("교사 1~40호봉 상자 각주는 일반직 전체표로 잇는다 (B35 상자, 기본 접힘 그대로)", () => {
    const b = box(render(TeacherPage).html, "teacher-full-table");
    expect(b.src).toContain('href="/civil-servant-pay-2026#general-full-table"');
    expect(b.src.slice(0, b.src.indexOf(">") + 1)).not.toMatch(/\sopen(?:[\s=>]|$)/);
  });
});
