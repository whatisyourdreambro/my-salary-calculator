// src/lib/simpleCalculators/index.ts
// 100개 계산기 통합 진입점 + enrichments 자동 머지

import type { CalculatorDef } from "./types";
import { batch1Calculators } from "./batch1";
import { batch2Calculators } from "./batch2";
import { batch3Calculators } from "./batch3";
import { batch4Calculators } from "./batch4";
import { batch5Calculators } from "./batch5";
import { batch6Calculators } from "./batch6";
import { enrichmentMap } from "./enrichments";

const rawCalculators: CalculatorDef[] = [
 ...batch1Calculators,
 ...batch2Calculators,
 ...batch3Calculators,
 ...batch4Calculators,
 ...batch5Calculators,
 ...batch6Calculators,
];

// enrichments(explanation·formula·faqs·caveats·relatedSlugs)를 슬러그별로 자동 병합
// 기존 batch에 explanation이 있으면 그대로 유지, enrichments에만 있는 키는 추가 적용
export const allCalculators: CalculatorDef[] = rawCalculators.map((calc) => {
 const enrichment = enrichmentMap[calc.slug];
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

export type { CalculatorDef };
