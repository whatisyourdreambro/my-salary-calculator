// N2-calc-21 (R4, 2026-11-18, 운영자 승인 2026-11-17): /calc/bonus-home-plan 영업이익 시나리오 기준을 2026년 상반기에서
// 1~3분기 누적으로(삼성전자는 DS부문). 값은 DART 3분기보고서(2026-11-16 접수)에서 직접 대조한 백만원 단위.
import { createElement, type ReactNode } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

vi.mock("next/navigation", () => ({ usePathname: () => "/calc/bonus-home-plan" }));
vi.mock("@/components/AdPlacement", () => ({
  CalcResultAd: () => createElement("div", { "data-test-ad": "calc-result" }),
  InArticleAd: () => createElement("div", { "data-test-ad": "in-article" }),
  GuideMidAd: () => createElement("div", { "data-test-ad": "guide-mid" }),
}));
vi.mock("@/components/AppLink", () => ({ default: ({ children, ...props }: { children: ReactNode }) => createElement("a", props, children) }));
vi.mock("@/components/RelatedCalculators", () => ({ default: () => null }));

import BonusHomePlanPage from "@/app/calc/bonus-home-plan/page";
import BonusHomePlanClient from "@/app/calc/bonus-home-plan/Client";
import { companyScenarioOps, q1q3Tril, SCENARIO_RULES } from "@/lib/bonusHome/scenarios";
import { buildPlan, DEFAULT_PLAN_STATE, fmtEokShort } from "@/lib/bonusHome/plan";
import {
  Q1_Q3_2026_TENTHS,
  SAMSUNG_DS_OP_2026,
  SAMSUNG_OP,
  SAMSUNG_Q3_2026_MILLION,
  SK_OP_2026,
  SK_Q3_2026_MILLION,
  toTril1,
} from "@/lib/bonusHome/opActuals";
import { Q1_Q3_2026_PROFIT_TRIL } from "@/app/calc/sk-hynix-bonus/psData";

describe("DART 3분기보고서 실적 (opActuals)", () => {
  it("삼성전자 1~3분기 연결 254.2조(254,165,691 백만원) · 3분기 107.4조 · DS부문 1~3분기 249.4조 · DS 3분기 106.5조", () => {
    expect(SAMSUNG_OP.q1q3_2026.millionWon).toBe(254_165_691);
    expect(toTril1(SAMSUNG_OP.q1q3_2026.millionWon)).toBe(254.2);
    expect(SAMSUNG_Q3_2026_MILLION).toBe(107_440_482);
    expect(toTril1(SAMSUNG_Q3_2026_MILLION)).toBe(107.4);
    expect(toTril1(SAMSUNG_DS_OP_2026.q1q3.millionWon)).toBe(249.4);
    expect(toTril1(SAMSUNG_DS_OP_2026.q3.millionWon)).toBe(106.5);
    // DS 는 전사보다 작다(DX·SDC·Harman 몫)
    expect(SAMSUNG_DS_OP_2026.q1q3.millionWon).toBeLessThan(SAMSUNG_OP.q1q3_2026.millionWon);
  });

  it("SK하이닉스 1~3분기 181.5조(181,486,709 백만원)는 뉴스룸 세 분기 합(psData)과 같고 3분기는 83.3조", () => {
    expect(SK_OP_2026.q1q3.millionWon).toBe(181_486_709);
    expect(toTril1(SK_OP_2026.q1q3.millionWon)).toBe(Q1_Q3_2026_PROFIT_TRIL);
    expect(SK_Q3_2026_MILLION).toBe(83_333_818);
    expect(toTril1(SK_Q3_2026_MILLION)).toBe(83.3);
  });

  it("모든 기간에 DART 접수번호(14자리)와 접수일이 있고, 3분기 자료는 2026-11-16 분기보고서", () => {
    const periods = [...Object.values(SAMSUNG_OP), ...Object.values(SAMSUNG_DS_OP_2026), ...Object.values(SK_OP_2026)];
    for (const p of periods) {
      expect(p.source.rcpNo, p.label).toMatch(/^\d{14}$/);
      expect(p.source.filedAt, p.label).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(p.source.rcpNo.slice(0, 8), p.label).toBe(p.source.filedAt.replaceAll("-", ""));
    }
    expect(SAMSUNG_OP.q1q3_2026.source).toEqual({ doc: "삼성전자 분기보고서 (2026.09)", rcpNo: "20261116001482", filedAt: "2026-11-16" });
    expect(SAMSUNG_DS_OP_2026.q1q3.source).toBe(SAMSUNG_OP.q1q3_2026.source);
    expect(SK_OP_2026.q1q3.source).toEqual({ doc: "SK하이닉스 분기보고서 (2026.09)", rcpNo: "20261116001715", filedAt: "2026-11-16" });
  });
});

describe("시나리오 기준 = 2026년 1~3분기 누적(삼성 DS부문) — N2-calc-21", () => {
  it("기준값: 삼성 DS부문 249.4조 · SK 181.5조 (0.1조 정수)", () => {
    expect(Q1_Q3_2026_TENTHS).toEqual({ samsung: 2494, sk: 1815 });
    expect(q1q3Tril("samsung")).toBe(toTril1(SAMSUNG_DS_OP_2026.q1q3.millionWon));
    expect(q1q3Tril("sk")).toBe(toTril1(SK_OP_2026.q1q3.millionWon));
  });

  it("보수 2026 값은 이미 공시된 1~3분기 누적 이상이다(종전 상반기 × 1.5 는 누적보다 작았다)", () => {
    expect(companyScenarioOps("samsung", "conservative")[0]).toBeGreaterThanOrEqual(toTril1(SAMSUNG_DS_OP_2026.q1q3.millionWon));
    expect(companyScenarioOps("sk", "conservative")[0]).toBeGreaterThanOrEqual(toTril1(SK_OP_2026.q1q3.millionWon));
    // 종전 값(220.1·147.3)은 누적보다 작았다 — 회귀 방지
    expect(220.1).toBeLessThan(toTril1(SAMSUNG_DS_OP_2026.q1q3.millionWon));
    expect(147.3).toBeLessThan(toTril1(SK_OP_2026.q1q3.millionWon));
  });

  it("기본 = 누적 × 4/3(0.1조 반올림), 낙관 = 그 값에서 매년 × 1.10, 보수 = 누적 그대로에서 매년 × 0.70", () => {
    for (const c of ["samsung", "sk"] as const) {
      const q = Q1_Q3_2026_TENTHS[c];
      expect(companyScenarioOps(c, "base")[0]).toBe(Math.round((q * 4) / 3) / 10);
      expect(companyScenarioOps(c, "base").every((v) => v === companyScenarioOps(c, "base")[0])).toBe(true);
      expect(companyScenarioOps(c, "optimistic")[0]).toBe(companyScenarioOps(c, "base")[0]);
      expect(companyScenarioOps(c, "conservative")[0]).toBe(q / 10);
      expect(companyScenarioOps(c, "conservative")[1]).toBe(Math.round(q * 0.7) / 10);
    }
  });

  it("삼성 특별경영성과급 조건(200조): 보수는 2026년 실적만 넘고 2027년 실적부터 아래 — 본문 문장과 같다", () => {
    const cons = companyScenarioOps("samsung", "conservative");
    expect(cons[0]).toBeGreaterThanOrEqual(200);
    expect(cons[1]).toBeLessThan(200);
  });

  // 폭은 사이트 글꼴 서브셋으로 잰 값(14px): 보수 261.9 -> 233.8px, 기본 269.8 -> 221.5px, 낙관 248.3 -> 245.9px.
  // 여기서는 가장 넓은 글자인 한글 음절 수가 늘지 않았는지만 고정한다(숫자·기호는 한글보다 좁다).
  it("규칙 문구는 종전보다 넓지 않다(광고 위 표·문장) — 한글 음절 수 기준", () => {
    const hangul = (t: string) => [...t].filter((ch) => ch >= "가" && ch <= "힣").length;
    const OLD = { conservative: "2026년 = 상반기 실적 × 1.5, 이후 매년 × 0.70", base: "2026년 = 상반기 실적 × 2(연환산), 이후 같은 값", optimistic: "2026년 = 상반기 실적 × 2, 이후 매년 × 1.10" } as const;
    expect(SCENARIO_RULES.conservative.ruleText).toBe("2026년 = 1~3분기 × 1, 이후 매년 × 0.70");
    expect(SCENARIO_RULES.base.ruleText).toBe("2026년 = 1~3분기 × 4/3, 이후 같은 값");
    expect(SCENARIO_RULES.optimistic.ruleText).toBe("2026년 = 1~3분기 × 4/3, 이후 매년 × 1.10");
    for (const id of ["conservative", "base", "optimistic"] as const) expect(hangul(SCENARIO_RULES[id].ruleText)).toBeLessThan(hangul(OLD[id]));
  });
});

describe("화면 문구 — 상반기 기준 문장이 남지 않는다", () => {
  const strip = (h: string) => h.replaceAll("<!-- -->", "");
  const page = strip(renderToStaticMarkup(createElement(BonusHomePlanPage as never)));
  const above = page.slice(0, page.indexOf('data-test-ad="in-article"'));
  const visible = above.replace(/<[^>]+>/g, "").replaceAll("&#x27;", "'");

  it("본문: 1~3분기 실적(삼성 DS부문 249.4조, SK 181.5조) · 과거 실적 줄 · 예시 숫자(기본 2027 세전 6.99억)", () => {
    expect(visible).toContain("영업이익은 DART에 공시된 2026년 1~3분기 실적(삼성전자 DS부문 249.4조, SK하이닉스 181.5조)에 정해진 규칙을 곱한 시나리오(가정)입니다. 증권사 컨센서스·전망이 아닙니다.");
    expect(visible).toContain("2025년 47.2조, 2026년 1~3분기 181.5조. 삼성전자 2025년 연간 43.6조, 2026년 1~3분기 254.2조(DS부문 249.4조).");
    const ex = buildPlan(DEFAULT_PLAN_STATE).comp.years[0];
    expect(fmtEokShort(ex.gross)).toBe("6.99억");
    expect(visible).toContain(`2027년 성과급 세전 ${fmtEokShort(ex.gross)}(특별경영성과급 ${fmtEokShort(ex.components[1].gross)} 포함)`);
    expect(buildPlan(DEFAULT_PLAN_STATE).afford.buyYear).toBe(2029);
    expect(visible).not.toMatch(/상반기 확정|반기보고서 2026-08-14 등|2026년 = 상반기/);
  });

  // 검토(2026-11-18): 접힌 FAQ 5 는 펼치면 GuideMidAd 위 — 새 규칙 문구로 바꾸되 종전 답보다 넓지 않게(줄 모형 0폭).
  it("FAQ 5(증권사 전망): 1~3분기 영업이익 × 새 규칙, 종전 답보다 길지 않다", () => {
    const OLD = "증권사 실적 예상은 유료로 제공되는 데이터이고, 예측을 계산기 숫자처럼 보여 주면 확정된 것처럼 오해하기 쉽습니다. 이 계산기는 DART에 공시된 상반기 확정 영업이익에 누구나 확인할 수 있는 규칙(×1.5·×2·매년 ×0.7·×1.1)을 곱한 시나리오(가정)만 씁니다. 연도별 값은 '직접' 시나리오에서 원하는 숫자로 바꿀 수 있습니다.";
    const NOW = "증권사 실적 예상은 유료로 제공되는 데이터이고, 예측을 계산기 숫자처럼 보여 주면 확정된 것처럼 오해하기 쉽습니다. 이 계산기는 DART에 공시된 1~3분기 영업이익에 누구나 확인할 수 있는 규칙(×1·×4/3·매년 ×0.7·×1.1)을 곱한 시나리오(가정)만 씁니다. 연도별 값은 '직접' 시나리오에서 원하는 숫자로 바꿀 수 있습니다.";
    expect(page.replaceAll("&#x27;", "'")).toContain(NOW);
    expect(page).not.toContain("상반기 확정 영업이익에");
    const hangul = (t: string) => [...t].filter((ch) => ch >= "가" && ch <= "힣").length;
    expect(NOW.length).toBeLessThan(OLD.length);
    expect(hangul(NOW)).toBeLessThan(hangul(OLD));
  });

  it("계산기 시나리오 문장: 삼성 'DS부문', SK 연결 — 기준은 1~3분기(DART 분기보고서)", () => {
    const client = (initial: Record<string, unknown>) => strip(renderToStaticMarkup(createElement(BonusHomePlanClient as never, { initial } as never))).replace(/<[^>]+>/g, "");
    expect(client({})).toContain("기본 시나리오(가정): 2026년 = 1~3분기 × 4/3, 이후 같은 값. 기준은 1~3분기 DS부문 영업이익 249.4조(DART 분기보고서)입니다.");
    expect(client({ company: "sk", scenario: "conservative" })).toContain("보수 시나리오(가정): 2026년 = 1~3분기 × 1, 이후 매년 × 0.70. 기준은 1~3분기 영업이익 181.5조(DART 분기보고서)입니다.");
    expect(client({})).toContain("영업이익: DART 삼성전자·SK하이닉스 분기보고서 연결·부문 영업이익(2026-11-16 등)");
    expect(client({})).toContain("— 2031년 판정에서 뺐습니다.");
  });
});
