// src/lib/simpleCalculators/computeLoader.ts
//
// 클라이언트가 계산 함수(compute)만 배치 단위로 지연 로드하는 진입점.
//
// 배경 (2026-09-11 번들 실측): SimpleCalculatorView 가 `@/lib/simpleCalculators` 를 직접
// import 해 202종 정의 전체(설명·FAQ·공식 텍스트 포함, 원본 585KB → 청크 507KB·gzip 151KB)가
// /calc/[slug] 202쪽 모두의 첫 로드 JS 에 들어갔다(라우트 JS 170KB·First Load 290KB — 다른
// 라우트 6~18KB·130~150KB 대비 유일한 이상치). 텍스트는 서버 페이지가 props 로 넘기고,
// 클라이언트는 자기 배치 파일 하나만 동적 import 해 compute 를 얻는다.
//
// 배치 키는 index.ts 의 getCalculatorBatch(slug) 가 정본이다 — 두 파일의 배치 목록은 반드시
// 같이 유지한다(테스트 src/lib/__tests__/computeLoader.test.ts 가 202종 전수 대조).

import type { CalculatorDef } from "./types";

export type CalculatorBatch = "batch1" | "batch2" | "expandedFinance" | "expandedPractical";

type ComputeFn = CalculatorDef["compute"];

const BATCH_IMPORTS: Record<CalculatorBatch, () => Promise<CalculatorDef[]>> = {
  batch1: () => import("./batch1").then((m) => m.batch1Calculators),
  batch2: () => import("./batch2").then((m) => m.batch2Calculators),
  expandedFinance: () => import("./expandedFinance").then((m) => m.expandedFinanceCalculators),
  expandedPractical: () => import("./expandedPractical").then((m) => m.expandedPracticalCalculators),
};

/**
 * 배치 로더 팩토리 — 성공한 import 만 세션 캐시에 남긴다.
 * 2026-09-25 CLIENT-08: 거부된 import 를 캐시에 그대로 두면 한 번의 일시 실패(네트워크·배포 직후 청크)로
 * 같은 배치의 계산기 전부가 SPA 세션 내내 '계산 모듈을 불러오지 못했습니다'에 머물렀다. webpack 은 실패한
 * 청크를 초기화하므로 새 import() 는 다시 시도된다 → 실패하면 캐시에서 지워 다음 호출이 재시도하게 한다.
 */
export function createComputeLoader(imports: Record<CalculatorBatch, () => Promise<CalculatorDef[]>>) {
  const batchCache = new Map<CalculatorBatch, Promise<CalculatorDef[]>>();
  return function load(batch: CalculatorBatch, slug: string): Promise<ComputeFn | null> {
    let pending = batchCache.get(batch);
    if (!pending) {
      pending = imports[batch]().catch((e) => {
        batchCache.delete(batch);
        throw e;
      });
      batchCache.set(batch, pending);
    }
    return pending.then((list) => list.find((c) => c.slug === slug)?.compute ?? null);
  };
}

/** 배치 하나를 로드해 slug 의 compute 를 돌려준다. 미존재 slug 는 null. 성공한 로드 결과는 세션 캐시. */
export const loadCalculatorCompute = createComputeLoader(BATCH_IMPORTS);
