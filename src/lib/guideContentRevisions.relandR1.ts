// src/lib/guideContentRevisions.relandR1.ts
//
// R1 재착지(운영자 2026-11-01 승인 7번 — RL-01 광고 아래 보강, RL-02 같은 폭 사실 정정)로 사실 문장이 바뀐 가이드 가운데
// 이미 수정일(modifiedDate 2026-10-03)이 있어 히어로 '수정' 칩이 떠 있는 11편의 본문 정정일.
// guideContentRevisions.ts 가 mergeLatest 로 합친다(상세 화면 날짜·OG·사이트맵 lastmod·Article dateModified 공통).
// 칩은 날짜 숫자만 바뀐다: 2026.10.03 → 2026.11.03 (같은 10글자, 글꼴 폭은 '0'→'1' 이라 더 좁다 — 광고 위 줄 수 불변).
// 넣지 않은 글: 수정일이 없는 글(넣으면 GuideMidAd 위에 새 칩이 생긴다 — 광고 위 UI 추가 금지, metaFactFixes20261013.test 의 4편 포함),
//   링크 한 줄만 받은 글(health-insurance-2026-guide·retirement-planning — 링크 줄은 날짜를 올리지 않는다).
// 서버 전용(클라이언트 번들에 싣지 않는다).
import { RELAND_R1_PUSH } from "@/config/relandR1Push";

export const GUIDE_CONTENT_REVISED_RELAND_R1: Readonly<Record<string, string>> = {
  // RL-01 보강: 휴직·퇴사 4대보험 차이(자동차 보험료 폐지 2024-02, 납입고지 유예)
  "career-break-financial-plan": RELAND_R1_PUSH,
  // RL-01 보강: 분납 기한·납부지연 가산세 하루 0.022%
  "comprehensive-income-tax-2026": RELAND_R1_PUSH,
  // RL-02 제목·TL;DR·본문 주휴수당 209시간 재계산(월 336만원) + RL-01 일용근로 세금 보강
  "coupang-fulfillment-night-pay-2026": RELAND_R1_PUSH,
  // RL-01 보강: 디딤돌·보금자리론 조건표, 규제지역 LTV 40%
  "first-home-2026-strategy": RELAND_R1_PUSH,
  // RL-01 보강: 2026 세제개편안 ISA 내용 정정(생산적금융 ISA)
  "isa-account-guide": RELAND_R1_PUSH,
  // RL-02 본문 FY2025 공시 문장 + RL-01 방산 4사 DART 평균연봉 표
  "kai-salary-2026": RELAND_R1_PUSH,
  // RL-01 보강: 2027 최저임금 10,700원 확정 표
  "minimum-wage-impact-2026": RELAND_R1_PUSH,
  // RL-01 보강: SK하이닉스 PS 지급 방식·삼성 인상률·DS 특별경영성과급(보도 기준)
  "performance-pay-complete-2026": RELAND_R1_PUSH,
  // RL-01 보강: 10억 목표 월 적립액 재계산
  "retirement-planning-30s": RELAND_R1_PUSH,
  // RL-02 TL;DR·카드·Article 설명 '금리 인하 시기' → '금리 변동 시기'(10월 1045fdb4a ②)
  "us-treasury-bond": RELAND_R1_PUSH,
  // RL-01 보강: 2026년 귀속 연말정산 FAQ 4문항
  "year-end-tax-2026": RELAND_R1_PUSH,
};
