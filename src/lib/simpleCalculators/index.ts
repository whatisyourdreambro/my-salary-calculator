// src/lib/simpleCalculators/index.ts
// Calculator registry and explanations shared by routes, search and sitemap.

import type { CalculatorDef, ClientCalculatorDef } from "./types";
import type { CalculatorBatch } from "./computeLoader";
import { PRECISION_TWINS } from "./twins";
import { batch1Calculators } from "./batch1";
import { batch2Calculators } from "./batch2";
import { enrichmentMap } from "./enrichments";
import { enrichmentsExtA } from "./enrichments-ext-a";
import { enrichmentsExtB } from "./enrichments-ext-b";
import { enrichmentsExtC } from "./enrichments-ext-c";
import { expandedFinanceCalculators } from "./expandedFinance";
import { expandedPracticalCalculators } from "./expandedPractical";

const rawCalculators: CalculatorDef[] = [
 ...batch1Calculators,
 ...batch2Calculators,
 ...expandedFinanceCalculators,
 ...expandedPracticalCalculators,
];

// 우선순위 30개(enrichments) + 확장 70개(ext-a/b/c) = 100개 전체 enrichment 병합
const mergedEnrichments = {
 ...enrichmentMap,
 ...enrichmentsExtA,
 ...enrichmentsExtB,
 ...enrichmentsExtC,
};

// enrichments(explanation·formula·faqs·caveats·relatedSlugs)를 슬러그별로 자동 병합
// 기존 batch에 explanation이 있으면 그대로 유지, enrichments에만 있는 키는 추가 적용
export const allCalculators: CalculatorDef[] = rawCalculators.map((calc) => {
 const enrichment = mergedEnrichments[calc.slug];
 if (!enrichment) return calc;
 return {
 ...calc,
 explanation: calc.explanation ?? enrichment.explanation,
 formula: calc.formula ?? enrichment.formula,
 faqs: calc.faqs ?? enrichment.faqs,
 caveats: calc.caveats ?? enrichment.caveats,
 relatedSlugs: calc.relatedSlugs ?? enrichment.relatedSlugs,
 };
});

export function getCalculatorBySlug(slug: string): CalculatorDef | undefined {
 return allCalculators.find((c) => c.slug === slug);
}

export function getAllSlugs(): string[] {
 return allCalculators.map((c) => c.slug);
}

// ── 클라이언트 번들 분리 (2026-09-11) ──────────────────────────────────────
// 아래 3개는 서버(page.tsx)에서만 쓴다. 클라이언트 컴포넌트는 이 모듈을 import 하지
// 말 것 — 202종 정의 전체(507KB 청크)가 다시 클라이언트 번들에 들어간다.
// (게이트: src/lib/__tests__/computeLoader.test.ts 가 SimpleCalculatorView 의 import 를 검사)

const BATCH_MEMBERSHIP: Array<[CalculatorBatch, ReadonlySet<string>]> = [
 ["batch1", new Set(batch1Calculators.map((c) => c.slug))],
 ["batch2", new Set(batch2Calculators.map((c) => c.slug))],
 ["expandedFinance", new Set(expandedFinanceCalculators.map((c) => c.slug))],
 ["expandedPractical", new Set(expandedPracticalCalculators.map((c) => c.slug))],
];

/** slug 가 속한 배치 파일 키 — computeLoader.ts 의 동적 import 키와 1:1. */
export function getCalculatorBatch(slug: string): CalculatorBatch | undefined {
 return BATCH_MEMBERSHIP.find(([, set]) => set.has(slug))?.[0];
}

/** compute 를 제외한 직렬화 가능 정의 (RSC props 용). */
export function toClientCalculator(def: CalculatorDef): ClientCalculatorDef {
 // eslint-disable-next-line @typescript-eslint/no-unused-vars -- compute 만 떼어낸다
 const { compute, ...rest } = def;
 const relatedCards = (def.relatedSlugs ?? [])
 .map((s) => getCalculatorBySlug(s))
 .filter((c): c is CalculatorDef => Boolean(c))
 .map((c) => ({ slug: c.slug, title: c.title, description: c.description }));
 return { ...rest, relatedCards, ...(PRECISION_TWINS[def.slug] ? { precisionTwin: PRECISION_TWINS[def.slug] } : {}) };
}

/** 필드 기본값으로 만든 입력 객체 — 서버 초기 결과 계산과 클라이언트 초기 state 가 같은 값을 쓴다. */
export function defaultInputsOf(def: Pick<CalculatorDef, "fields">): Record<string, number> {
 const init: Record<string, number> = {};
 for (const f of def.fields) init[f.name] = f.defaultValue;
 return init;
}

export type { CalculatorDef, ClientCalculatorDef, CalculatorBatch };
