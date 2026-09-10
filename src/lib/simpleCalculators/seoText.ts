// src/lib/simpleCalculators/seoText.ts
//
// /calc/[slug] 의 <title>·meta description 생성 (2026-09-11 SEO 감사).
//
// 배경: (1) 202쪽 모두 title 이 "{제목} — 계산식·조건별 결과 | 머니샐러리" 라 검색어의 핵심 단어인
// '계산기'가 36쪽에서 빠져 있었고(제목이 '…계산'으로 끝남), 접미사 20자는 SERP 표시 폭만 차지했다.
// (2) 101쪽의 description 이 "월 사용량(㎥) × 단가" 같은 9~34자 공식 조각이라 스니펫이 재작성·잘림
// 대상이었다 — 같은 페이지에 140자+ 설명이 이미 있어 그것을 이어 붙인다.
// 순수 함수 — 서버·테스트 공용. H1 은 calc.title 그대로 둔다.

import type { CalculatorDef } from "./types";

const CALC_TERM = /(계산기|시뮬레이터|시뮬레이션|변환기|환산기|비교기|테스트|판정|체크리스트)/;
const YEAR_SENSITIVE = new Set<CalculatorDef["category"]>(["tax", "salary", "insurance"]);

export const SEO_DESCRIPTION_MIN = 60;
export const SEO_DESCRIPTION_MAX = 160;

/** '{제목} 계산기' 형태를 보장하고 연도 민감 카테고리(세금·급여·보험)에는 2026 을 붙인다. */
export function calculatorSeoTitle(def: Pick<CalculatorDef, "title" | "category">): string {
  const t = def.title.replace(/\s+/g, " ").trim();
  const base = CALC_TERM.test(t) ? t : /계산$/.test(t) ? `${t}기` : `${t} 계산기`;
  return YEAR_SENSITIVE.has(def.category) && !/20\d\d/.test(base) ? `${base} 2026` : base;
}

function clampText(s: string, max: number): string {
  if (s.length <= max) return s;
  const cut = s.slice(0, max - 1);
  const stop = Math.max(cut.lastIndexOf(". "), cut.lastIndexOf(" "));
  return (stop > max * 0.6 ? cut.slice(0, stop) : cut).trimEnd() + "…";
}

/** 60자 미만 description 은 설명 본문을 이어 붙여 60~160자 스니펫으로 만든다. */
export function calculatorSeoDescription(
  def: Pick<CalculatorDef, "title" | "category" | "description" | "explanation">
): string {
  const base = def.description.replace(/\s+/g, " ").trim();
  if (base.length >= SEO_DESCRIPTION_MIN) return clampText(base, SEO_DESCRIPTION_MAX);
  const explanation = (def.explanation ?? "").replace(/\s+/g, " ").trim();
  const lead = base.replace(/[.。]$/, "");
  const combined = explanation
    ? `${calculatorSeoTitle(def)} — ${lead}. ${explanation}`
    : `${calculatorSeoTitle(def)} — ${lead}. 조건을 입력하면 결과와 계산 공식, 자주 묻는 질문을 함께 확인할 수 있습니다.`;
  return clampText(combined, SEO_DESCRIPTION_MAX - 5);
}
