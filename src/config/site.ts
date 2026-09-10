// src/config/site.ts
//
// 사이트 지표 단일 소스 — 내비·푸터·메타·본문 카피의 카운트 문자열은 전부 여기서 파생.
// 수치는 site-metrics.generated.ts(코드젠)에서 온다.
//
// ⚠️ 이 모듈은 클라이언트 번들에 실린다("use client" 내비/푸터가 import).
//    회사 데이터 배열(src/data/companies 등)을 여기서 직접 import 금지 —
//    scripts/gen-site-metrics.ts --check 가 위반을 빌드 실패로 잡는다.
import {
  BONUS_CALC_COUNT,
  COMPANY_COUNT,
  GUIDE_COUNT,
  INDUSTRY_COUNT,
  JOB_COUNT,
  REGION_COUNT,
  SIMPLE_CALC_COUNT,
  TOOL_COUNT,
} from "./site-metrics.generated";

export {
  BONUS_CALC_COUNT,
  COMPANY_COUNT,
  GUIDE_COUNT,
  INDUSTRY_COUNT,
  JOB_COUNT,
  REGION_COUNT,
  SIMPLE_CALC_COUNT,
  TOOL_COUNT,
};

/** N을 10 단위로 내림한 "430+" 형 마케팅 표기 */
const plus = (n: number) => `${Math.floor(n / 10) * 10}+`;

// ── 회사 DB ──────────────────────────────────────────────
/** "434곳" — 정확 표기 (푸터·본문 등) */
export const companyCountKo = `${COMPANY_COUNT}곳`;
/** "434개" */
export const companyCountGae = `${COMPANY_COUNT}개`;
/** "430+" — 마케팅 표기 (메타·메뉴 설명) */
export const companyCountPlus = plus(COMPANY_COUNT);

// ── 성과급 계산기 ────────────────────────────────────────
/** "23종" */
export const bonusCalcCountKo = `${BONUS_CALC_COUNT}종`;

// ── 허브 지표 ────────────────────────────────────────────
/** "62개 직종" 파생용 */
export const jobCountGae = `${JOB_COUNT}개`;
/** "27개 산업군" 파생용 */
export const industryCountGae = `${INDUSTRY_COUNT}개`;
/** "17개 시도 + 판교·여의도" — regionsData 는 17개 시도 + 특구 2곳 구조 */
export const regionLabel = `${REGION_COUNT - 2}개 시도 + 판교·여의도`;
/** "320+편" — 한국어 가이드 편수 마케팅 표기 */
export const guideCountPlus = plus(GUIDE_COUNT);

// ── 계산기 수 ────────────────────────────────────────────
/** /calc registry count rounded down to a conservative public label. */
export const simpleCalcCountPlus = plus(SIMPLE_CALC_COUNT);
/** Verified lower bound; overlapping dedicated calculators are not double counted. */
export const TOTAL_CALC_LABEL = simpleCalcCountPlus;
