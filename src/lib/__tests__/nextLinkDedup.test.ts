// 다음 링크 중복 제거 회귀 가드 (2026-09-12, S2-3 / NAV-06)
//
// 배경: 홈·/salary·/monthly·/calc 의 결과 아래 링크 블록(NextActions → RelatedCalculators, /calc 는 결과 핀·
// 관련 카드 그리드까지)이 같은 대상을 반복했다. 수정은 "제외 + 채움"뿐이다 — 어떤 블록도 항목 수를 줄이지
// 않는다(블록이 줄면 그 아래 광고가 올라와 2026-08-16 규칙 위반). 이 테스트가 고정하는 것:
//  1) 표본 페이지에서 RelatedCalculators 와 위 블록들 사이의 href 중복 0 (/calc 의 결과 핀 ∪ 관련 카드는 한 블록)
//  2) RelatedCalculators 가 표본 전부에서 제외 전과 같은 4개를 유지 — 채움 고갈(광고 위 블록 축소) 감지
//  3) /salary 인근 연봉 격자 링크가 다른 블록과 겹치지 않음
//  4) NextActions.tsx buildActions ↔ nextActionLinks.nextActionHrefs 가 전 카테고리에서 같은 href (드리프트 차단)
//  5) 광고 위 블록끼리(결과 핀 ∪ 관련 카드 ↔ NextActions)의 잔여 중복은 표본별로 고정 — 늘거나 줄면 알아채도록
//  6) /share/[data] 도 exclude 를 넘기고(누락분), /calc 의 NextActions 미렌더 카테고리는 salary 폴백 3종을 제외하지
//     않는다 — 화면에 없는 블록의 href 를 빼면 폴백 채움이 이유 없이 일어났다 (2026-09-12 리뷰 지적 2건)
// jsdom 없음 — 렌더 대신 페이지가 쓰는 같은 순수 함수로 각 블록의 href 를 재구성한다.
// ★ 남겨둔 중복(승인 게이트): (a) /calc 결과 핀(최대 3)은 관련 카드 그리드의 부분집합. (b) /calc 일부에서
//   NextActions 3종이 결과 핀·카드와 겹친다(예: cagr-quick 의 복리, mortgage-monthly-quick 의 /home-loan).
//   두 블록 다 광고(GuideMid·InArticle·CoupangBanner·HomeTopAd) 위에 있고 NextActions 는 채울 예비 항목이
//   없어 "제외 + 채움"이 불가능하다 — 줄이면 광고가 올라오므로 운영자 승인 전까지 손대지 않는다.

import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it, vi } from "vitest";

// NextActions.tsx 를 node 에서 import 하기 위한 최소 스텁 (링크·오퍼 슬롯은 이 테스트와 무관)
vi.mock("@/components/AppLink", () => ({ default: () => null }));
vi.mock("@/components/affiliate/AffiliateSlot", () => ({ OfferSlot: () => null }));

import { getRelatedCalculators } from "@/lib/relatedCalculators";
import {
  calcPinHrefs,
  mapToNextActionCategory,
  nextActionHrefs,
  type NextActionCategory,
} from "@/lib/nextActionLinks";
import { buildActions } from "@/components/NextActions";
import { getCalculatorBySlug, toClientCalculator } from "@/lib/simpleCalculators";
import { getSalaryNeighborAmounts, getStaticSalaryAmounts } from "@/lib/salaryStaticParams";
import { getStaticMonthlyAmounts } from "@/lib/monthlyStaticParams";

const RELATED_LIMIT = 4;

const SALARY_AMOUNTS = [30_000_000, 40_000_000, 50_000_000, 60_000_000, 100_000_000];
const MONTHLY_AMOUNTS = [2_000_000, 2_500_000, 3_000_000, 4_000_000, 5_000_000];
const CALC_SLUGS = [
  "compound-interest-quick",
  "cagr-quick",
  "vat-quick",
  "severance-pay-quick",
  "dsr-quick",
  "mortgage-monthly-quick",
  "bmi-quick",
  "holiday-allowance-quick",
  "split-bill",
  "business-margin-quick",
];

interface PageSample {
  label: string;
  /** 페이지 DOM 순서의 링크 블록(이름 → href). RelatedCalculators 는 exclude 적용 후. */
  blocks: Record<string, string[]>;
  /** exclude 없이 계산한 RelatedCalculators (수정 전 상태) */
  relatedBefore: string[];
  relatedAfter: string[];
}

/** RelatedCalculators 를 뺀 위 블록들 (결과 핀 ∪ 카드, NextActions, 인근 격자) */
const upstreamBlocks = (s: PageSample) =>
  Object.entries(s.blocks)
    .filter(([name]) => name !== "related")
    .map(([, hrefs]) => hrefs);

/** 둘 이상의 블록에 나타나는 href (한 블록 안의 반복은 세지 않는다) */
function crossBlockDuplicates(blocks: string[][]): string[] {
  const count = new Map<string, number>();
  for (const block of blocks) {
    for (const href of new Set(block)) count.set(href, (count.get(href) ?? 0) + 1);
  }
  return [...count].filter(([, n]) => n > 1).map(([href]) => href);
}

// ── 페이지별 블록 재구성 — 각 page.tsx / 컴포넌트가 넘기는 인자와 1:1 ─────────────────────

const paths = (items: { path: string }[]) => items.map((i) => i.path);

/** 홈: SalaryCalculator.tsx — NextActions(category=salary) → ResultAd → RelatedCalculators(currentPath="/") */
function homePage(): PageSample {
  const next = nextActionHrefs("salary");
  return {
    label: "/",
    blocks: { nextActions: next, related: paths(getRelatedCalculators("/", RELATED_LIMIT, undefined, next)) },
    relatedBefore: paths(getRelatedCalculators("/", RELATED_LIMIT)),
    relatedAfter: paths(getRelatedCalculators("/", RELATED_LIMIT, undefined, next)),
  };
}

/** /share/[data]: NextActions(salary) → RelatedCalculators(currentPath="/") — 홈과 같은 구조 (2026-09-12 리뷰: exclude 누락분) */
function sharePage(): PageSample {
  const next = nextActionHrefs("salary");
  return {
    label: "/share/[data]",
    blocks: { nextActions: next, related: paths(getRelatedCalculators("/", RELATED_LIMIT, undefined, next)) },
    relatedBefore: paths(getRelatedCalculators("/", RELATED_LIMIT)),
    relatedAfter: paths(getRelatedCalculators("/", RELATED_LIMIT, undefined, next)),
  };
}

/** /salary/[amount]: NextActions(salary) → 광고들 → 인근 연봉 격자 → RelatedCalculators(currentPath="/") */
function salaryPage(amount: number): PageSample {
  const next = nextActionHrefs("salary");
  const neighbors = getSalaryNeighborAmounts(amount).map((a) => `/salary/${a}`);
  return {
    label: `/salary/${amount}`,
    blocks: {
      nextActions: next,
      neighbors,
      related: paths(getRelatedCalculators("/", RELATED_LIMIT, undefined, next)),
    },
    relatedBefore: paths(getRelatedCalculators("/", RELATED_LIMIT)),
    relatedAfter: paths(getRelatedCalculators("/", RELATED_LIMIT, undefined, next)),
  };
}

/** /monthly/[amount]: NextActions(salary) → 광고들 → RelatedCalculators(currentPath=/monthly/N) */
function monthlyPage(amount: number): PageSample {
  const next = nextActionHrefs("salary");
  const path = `/monthly/${amount}`;
  return {
    label: path,
    blocks: { nextActions: next, related: paths(getRelatedCalculators(path, RELATED_LIMIT, undefined, next)) },
    relatedBefore: paths(getRelatedCalculators(path, RELATED_LIMIT)),
    relatedAfter: paths(getRelatedCalculators(path, RELATED_LIMIT, undefined, next)),
  };
}

/** /calc/[slug]: [결과 핀 ∪ 관련 카드](SimpleCalculatorView) → NextActions(currentPath 필터) → RelatedCalculators */
function calcPage(slug: string): PageSample {
  const calc = getCalculatorBySlug(slug);
  if (!calc) throw new Error(`표본 계산기 없음: ${slug}`);
  const path = `/calc/${slug}`;
  const client = toClientCalculator(calc);
  const pins = calcPinHrefs(client);
  const category = mapToNextActionCategory(calc.category);
  // page.tsx 와 같은 가드 — NextActions 를 렌더하지 않는 카테고리(undefined)는 nextActionHrefs 의 salary 폴백을 제외하지 않는다
  const next = category ? nextActionHrefs(category, path) : [];
  const exclude = [...pins, ...next];
  return {
    label: path,
    blocks: {
      pinsAndCards: pins,
      nextActions: next,
      related: paths(getRelatedCalculators(path, RELATED_LIMIT, calc.category, exclude)),
    },
    relatedBefore: paths(getRelatedCalculators(path, RELATED_LIMIT, calc.category)),
    relatedAfter: paths(getRelatedCalculators(path, RELATED_LIMIT, calc.category, exclude)),
  };
}

const samples: PageSample[] = [
  homePage(),
  sharePage(),
  ...SALARY_AMOUNTS.map(salaryPage),
  ...MONTHLY_AMOUNTS.map(monthlyPage),
  ...CALC_SLUGS.map(calcPage),
];

/**
 * 광고 위 블록끼리(결과 핀 ∪ 관련 카드 ↔ NextActions)의 잔여 중복 — 승인 게이트(머리말 ★ 참조).
 * 표본에서 현재 남는 것을 고정한다. 새로 생기면(데이터 relatedSlugs·twins·NextActions 변경) 여기에 추가하거나
 * 운영자 승인 아래 위 블록을 손보는 결정을 내릴 것. RelatedCalculators 쪽 중복은 항상 0 이어야 한다.
 */
const KNOWN_ABOVE_AD_RESIDUE: Record<string, string[]> = {
  "/calc/cagr-quick": ["/calc/compound-interest-quick"], // 관련 카드 ∩ NextActions(investment)
  "/calc/mortgage-monthly-quick": ["/home-loan"], // 정밀 계산기 핀 ∩ NextActions(loan)
};

describe("다음 링크 중복 제거 (S2-3) — 표본 페이지", () => {
  it("표본 금액·슬러그가 실제 정적 생성 집합에 있다", () => {
    const salaryGrid = new Set(getStaticSalaryAmounts());
    for (const a of SALARY_AMOUNTS) expect(salaryGrid.has(a), `/salary/${a} 가 정적 집합에 없음`).toBe(true);
    const monthlyGrid = new Set(getStaticMonthlyAmounts());
    for (const a of MONTHLY_AMOUNTS) expect(monthlyGrid.has(a), `/monthly/${a} 가 격자에 없음`).toBe(true);
    for (const s of CALC_SLUGS) expect(getCalculatorBySlug(s), `/calc/${s} 없음`).toBeDefined();
  });

  it("RelatedCalculators 는 어떤 위 블록과도 같은 href 를 내지 않는다", () => {
    for (const s of samples) {
      const dup = crossBlockDuplicates([upstreamBlocks(s).flat(), s.blocks.related]);
      expect(dup, `${s.label} RelatedCalculators 중복: ${dup.join(", ")}`).toEqual([]);
    }
  });

  it("광고 위 블록끼리의 잔여 중복은 알려진 목록과 정확히 같다 (승인 게이트 — 늘어나도 줄어도 알아챈다)", () => {
    for (const s of samples) {
      const residue = crossBlockDuplicates(upstreamBlocks(s)).sort();
      expect(residue, `${s.label} 광고 위 블록 잔여 중복`).toEqual([...(KNOWN_ABOVE_AD_RESIDUE[s.label] ?? [])].sort());
    }
  });

  it("RelatedCalculators 는 제외 후에도 제외 전과 같은 4개를 유지한다 (광고 위 블록 높이 불변)", () => {
    for (const s of samples) {
      expect(s.relatedBefore, `${s.label} 제외 전`).toHaveLength(RELATED_LIMIT);
      expect(s.relatedAfter, `${s.label} 제외 후`).toHaveLength(RELATED_LIMIT);
      expect(new Set(s.relatedAfter).size, `${s.label} 관련 계산기 내부 중복`).toBe(RELATED_LIMIT);
    }
  });

  it("제외는 자기 자신도 계속 뺀다 (exclude 가 기존 self 제외를 덮지 않음)", () => {
    for (const s of samples) {
      expect(s.relatedAfter).not.toContain(s.label);
    }
  });

  it("수정 전에는 표본 안에 실제 중복이 있었다 (테스트가 공허하지 않음)", () => {
    const before = samples.flatMap((s) =>
      crossBlockDuplicates([...Object.values({ ...s.blocks, related: s.relatedBefore })]),
    );
    expect(before.length).toBeGreaterThan(0);
  });

  it("/share: 수정 전에는 /year-end-tax 가 NextActions 와 RelatedCalculators 에 겹쳤고, exclude 후 0 (2026-09-12 리뷰)", () => {
    const s = sharePage();
    expect(s.blocks.nextActions).toContain("/year-end-tax");
    expect(s.relatedBefore).toContain("/year-end-tax");
    expect(crossBlockDuplicates([s.blocks.nextActions, s.relatedAfter])).toEqual([]);
    expect(s.relatedAfter).toHaveLength(RELATED_LIMIT);
    // page.tsx 가 실제로 같은 exclude 를 넘긴다 (source scan — /salary/[amount] 와 동일 호출)
    const src = readFileSync(resolve(process.cwd(), "src/app/share/[data]/page.tsx"), "utf8");
    expect(src).toContain('exclude={nextActionHrefs("salary")}');
    expect(src).toMatch(/import \{ nextActionHrefs \} from "@\/lib\/nextActionLinks";/);
  });

  it("/calc 카테고리 매핑이 없는 계산기(NextActions 미렌더)는 salary 폴백 3종을 제외하지 않는다 (2026-09-12 리뷰)", () => {
    const unmapped = CALC_SLUGS.filter((s) => mapToNextActionCategory(getCalculatorBySlug(s)!.category) === undefined);
    expect(unmapped.length, "표본에 미매핑 카테고리 계산기가 있어야 한다").toBeGreaterThan(0);
    for (const slug of unmapped) {
      const s = calcPage(slug);
      const calc = getCalculatorBySlug(slug)!;
      expect(s.blocks.nextActions, slug).toEqual([]);
      // 제외 목록은 결과 핀 ∪ 관련 카드뿐이어야 한다 — 페이지가 넘기는 exclude(핀만)로 계산한 결과와 같다
      const pinsOnly = paths(getRelatedCalculators(`/calc/${slug}`, RELATED_LIMIT, calc.category, calcPinHrefs(toClientCalculator(calc))));
      expect(s.relatedAfter, slug).toEqual(pinsOnly);
    }
    // page.tsx 의 가드 (source scan)
    const src = readFileSync(resolve(process.cwd(), "src/app/calc/[slug]/page.tsx"), "utf8");
    expect(src).toContain("...(nextActionCategory ? nextActionHrefs(nextActionCategory, `/calc/${calc.slug}`) : []),");
    expect(src).not.toMatch(/\.\.\.nextActionHrefs\(nextActionCategory,/);
  });

  it("/salary 인근 연봉 격자는 다른 블록과 겹치지 않고 자기 자신을 포함하지 않는다", () => {
    for (const a of SALARY_AMOUNTS) {
      const s = salaryPage(a);
      const others = new Set([...s.blocks.nextActions, ...s.blocks.related]);
      for (const href of s.blocks.neighbors) {
        expect(others.has(href), `${s.label} 인근 격자 ${href} 가 다른 블록에도 있음`).toBe(false);
        expect(href).not.toBe(s.label);
      }
    }
  });
});

describe("NextActions.tsx ↔ nextActionLinks 드리프트", () => {
  const CATEGORIES: Array<NextActionCategory | undefined> = [
    "salary",
    "loan",
    "tax",
    "insurance",
    "investment",
    "real-estate",
    undefined,
  ];

  it("전 카테고리(+미지정)에서 buildActions 의 href 순서가 nextActionHrefs 와 같다 — 연봉 유무 무관", () => {
    for (const c of CATEGORIES) {
      for (const salary of [undefined, 50_000_000]) {
        expect(buildActions(c, salary).map((a) => a.href), `category=${c} salary=${salary}`).toEqual(
          nextActionHrefs(c),
        );
      }
      expect(nextActionHrefs(c)).toHaveLength(3);
    }
  });

  it("currentPath 필터가 NextActions 와 같은 방식으로 자기 링크만 뺀다", () => {
    const self = "/calc/compound-interest-quick";
    expect(nextActionHrefs("investment", self)).toEqual(
      buildActions("investment", undefined).map((a) => a.href).filter((h) => h !== self),
    );
    expect(nextActionHrefs("investment", self)).toHaveLength(2);
    expect(nextActionHrefs("investment", "/somewhere-else")).toHaveLength(3);
  });

  it("nextActionHrefs 는 호출마다 새 배열을 준다 (호출부가 변형해도 정본 불변)", () => {
    const a = nextActionHrefs("tax");
    a.push("/mutated");
    expect(nextActionHrefs("tax")).not.toContain("/mutated");
  });

  it("calcPinHrefs 는 정밀 계산기 → 관련 카드 순으로 SimpleCalculatorView 와 같은 href 를 만든다", () => {
    const client = toClientCalculator(getCalculatorBySlug("compound-interest-quick")!);
    const hrefs = calcPinHrefs(client);
    expect(hrefs[0]).toBe(client.precisionTwin!.href);
    expect(hrefs.slice(1)).toEqual((client.relatedCards ?? []).map((c) => `/calc/${c.slug}`));
    expect(calcPinHrefs({})).toEqual([]);
  });
});
