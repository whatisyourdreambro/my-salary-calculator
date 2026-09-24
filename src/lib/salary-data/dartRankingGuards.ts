// src/lib/salary-data/dartRankingGuards.ts
//
// DART 공시 랭킹 모수 가드 — dartReport(TOP100 리포트)·dartRanking(업종·지표 랭킹) 공용.
// 데이터 배열을 import 하지 않는 순수 규칙 모듈 (타입만 참조).
//
// 두 집계 방식 괴리 (A19, 2026-09-25 운영자 승인):
//   사이트 순위 값 = 연간 급여총액 ÷ 연말 직원 수 (산정치).
//   회사가 공시한 1인평균급여액을 연말 인원으로 가중 평균한 값과 이 산정치가 크게 다르면
//   (연중 인원 급변·합병·부분연도 등) 산정치가 실제 평균을 대표하지 못한다.
//   종전: 괴리 30% 초과(ETL V4 플래그)만 제외 → 강화: 10% 초과 제외.
//   예: SV인베스트먼트 19,800(공시 기준 15,200, 괴리 23%)이 TOP100 8위에 오르던 문제.
//   회사 카드 통계(순위 배지·이력 표)와 lite 코호트는 종전 모수 유지 — 카드·lite 는
//   광고 위 높이·색인 게이트(10/19) 이후 별도 정리(docs 기록).
import type { DartDisclosedEntry } from "@/data/dart/dartDisclosed";

/** 랭킹 제외 기준 — 두 집계 방식 괴리 % 상한 (초과 시 순위 모수에서 제외) */
export const RANKING_DIVERGENCE_MAX_PCT = 10;

/** 랭킹 기준 강화일 — 인용 자산(TOP100·지표 랭킹)의 날짜 붙은 정정 메모용 */
export const RANKING_METHOD_REVISED_DATE = "2026-09-25";

/**
 * 순위 모수 통과 여부. 1인평균 공시가 전혀 없어 괴리를 잴 수 없는 회사(divergencePct 없음)는
 * 종전처럼 통과 — 교차 검증 불가를 이유로 빼지 않는다(무플래그 기준과 동일).
 */
export function passesRankingDivergence(d: Pick<DartDisclosedEntry, "divergencePct">): boolean {
  return d.divergencePct == null || d.divergencePct <= RANKING_DIVERGENCE_MAX_PCT;
}
