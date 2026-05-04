// src/lib/simpleCalculators/index.ts
// 100개 계산기 통합 진입점

import type { CalculatorDef } from "./types";
import { batch1Calculators } from "./batch1";
import { batch2Calculators } from "./batch2";

export const allCalculators: CalculatorDef[] = [
 ...batch1Calculators,
 ...batch2Calculators,
];

export function getCalculatorBySlug(slug: string): CalculatorDef | undefined {
 return allCalculators.find((c) => c.slug === slug);
}

export function getAllSlugs(): string[] {
 return allCalculators.map((c) => c.slug);
}

export type { CalculatorDef };
