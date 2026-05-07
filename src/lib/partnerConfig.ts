// src/lib/partnerConfig.ts
//
// 한국형 제휴 마케팅(핀다·토스·굿리치·삼쩜삼·카카오) 자리잡기 인프라.
//
// 동작 원리:
//   - 운영자가 제휴 가입 전 → ENV 변수 비어 있음 → PartnerSlot이 fallback(주로 CoupangBanner) 렌더
//   - 운영자가 가입 완료 → Cloudflare Pages 환경변수에 URL/Ref 입력 → 자동 활성화
// 즉, 페이지 디자인/SEO/사용자 흐름은 가입 전이라도 미리 자리잡혀 있고
// 가입 완료 시 ENV 1줄만 갈아끼우면 즉시 매출 발생.
//
// 환경 변수 네이밍 규칙:
//   NEXT_PUBLIC_PARTNER_<PARTNER>_URL  — 클릭 시 이동할 기본 URL
//   NEXT_PUBLIC_PARTNER_<PARTNER>_REF  — 추천인/파트너 코드 (있으면 ?ref=<REF> 자동 부착)

export type PartnerId =
  | "finda-dsr"
  | "finda-loan-home"
  | "finda-loan-calc"
  | "finda-loan-guide"
  | "finda-company"
  | "toss-insurance-home"
  | "toss-insurance-guide"
  | "toss-tax-refund"
  | "samjeomsam-tax"
  | "goodrich-insurance"
  | "kakaopay-securities"
  | "kakao-finance-calc";

export interface PartnerConfig {
  id: PartnerId;
  /** 카드에 표시되는 한 줄 헤드라인 */
  headline: string;
  /** 부제 (작은 설명) */
  subline: string;
  /** 컨텍스트별 동적 헤드라인 (annualSalary 받아서 가공) */
  buildDynamicHeadline?: (ctx: PartnerContext) => string;
  /** CTA 버튼 라벨 */
  cta: string;
  /** 카테고리 — UI 컬러/아이콘 매칭 */
  kind: "loan" | "insurance" | "tax" | "investment";
  /** ENV 키 (URL용) */
  envUrlKey: string;
  /** ENV 키 (ref용, 선택) */
  envRefKey?: string;
  /** 트래킹 파라미터 이름 (annualSalary가 있을 때 query에 부착) */
  amountQueryParam?: string;
}

export interface PartnerContext {
  annualSalary?: number;
  industry?: string;
}

const PARTNERS: Record<PartnerId, PartnerConfig> = {
  "finda-dsr": {
    id: "finda-dsr",
    headline: "내 연봉으로 받을 수 있는 대출 한도",
    subline: "DSR 40% 기준 · 53개 금융사 비교",
    buildDynamicHeadline: ({ annualSalary }) => {
      if (!annualSalary) return "내 연봉으로 받을 수 있는 대출 한도";
      const dsrLimit = Math.round((annualSalary * 0.4) / 10000);
      return `연봉 기준 연 ${dsrLimit.toLocaleString("ko-KR")}만원까지 대출 가능`;
    },
    cta: "1분 만에 한도 조회 →",
    kind: "loan",
    envUrlKey: "NEXT_PUBLIC_PARTNER_FINDA_DSR_URL",
    envRefKey: "NEXT_PUBLIC_PARTNER_FINDA_REF",
    amountQueryParam: "income",
  },
  "finda-loan-home": {
    id: "finda-loan-home",
    headline: "53개 금융사 대출 비교 한 번에",
    subline: "신용·주담대·전세대출 통합 한도 조회",
    cta: "한도 비교하기 →",
    kind: "loan",
    envUrlKey: "NEXT_PUBLIC_PARTNER_FINDA_HOME_URL",
    envRefKey: "NEXT_PUBLIC_PARTNER_FINDA_REF",
  },
  "finda-loan-calc": {
    id: "finda-loan-calc",
    headline: "이 계산기 결과로 실제 받을 수 있는 대출",
    subline: "53개 금융사 한도 1분 비교",
    cta: "내 한도 조회 →",
    kind: "loan",
    envUrlKey: "NEXT_PUBLIC_PARTNER_FINDA_CALC_URL",
    envRefKey: "NEXT_PUBLIC_PARTNER_FINDA_REF",
    amountQueryParam: "amount",
  },
  "finda-loan-guide": {
    id: "finda-loan-guide",
    headline: "이 가이드대로 실제 한도를 알아보세요",
    subline: "53개 금융사 대출 한도 즉시 조회",
    cta: "한도 조회 →",
    kind: "loan",
    envUrlKey: "NEXT_PUBLIC_PARTNER_FINDA_GUIDE_URL",
    envRefKey: "NEXT_PUBLIC_PARTNER_FINDA_REF",
  },
  "finda-company": {
    id: "finda-company",
    headline: "이 회사 입사 후 받을 수 있는 대출 한도",
    subline: "DSR 40% 기준 · 신입 초봉 자동 반영",
    buildDynamicHeadline: ({ annualSalary }) => {
      if (!annualSalary) return "이 회사 입사 후 받을 수 있는 대출 한도";
      const dsrLimit = Math.round((annualSalary * 0.4) / 10000);
      return `이 회사 신입 기준 연 ${dsrLimit.toLocaleString("ko-KR")}만원 대출 가능`;
    },
    cta: "한도 조회 →",
    kind: "loan",
    envUrlKey: "NEXT_PUBLIC_PARTNER_FINDA_COMPANY_URL",
    envRefKey: "NEXT_PUBLIC_PARTNER_FINDA_REF",
    amountQueryParam: "income",
  },
  "toss-insurance-home": {
    id: "toss-insurance-home",
    headline: "내 연봉/나이 맞춤 보험료 비교",
    subline: "토스 보험 1분 견적",
    cta: "내 보험료 →",
    kind: "insurance",
    envUrlKey: "NEXT_PUBLIC_PARTNER_TOSS_INS_HOME_URL",
    envRefKey: "NEXT_PUBLIC_PARTNER_TOSS_REF",
  },
  "toss-insurance-guide": {
    id: "toss-insurance-guide",
    headline: "이 가이드 핵심을 내 보험에 적용",
    subline: "토스 보험 견적 1분",
    cta: "견적 받기 →",
    kind: "insurance",
    envUrlKey: "NEXT_PUBLIC_PARTNER_TOSS_INS_GUIDE_URL",
    envRefKey: "NEXT_PUBLIC_PARTNER_TOSS_REF",
  },
  "toss-tax-refund": {
    id: "toss-tax-refund",
    headline: "환급금 더 받는 법 — 1분 진단",
    subline: "토스 환급 도우미",
    cta: "내 환급금 →",
    kind: "tax",
    envUrlKey: "NEXT_PUBLIC_PARTNER_TOSS_TAX_URL",
    envRefKey: "NEXT_PUBLIC_PARTNER_TOSS_REF",
  },
  "samjeomsam-tax": {
    id: "samjeomsam-tax",
    headline: "삼쩜삼 — 종합소득세 환급금 조회",
    subline: "평균 환급액 17만원 · 5분 신청",
    cta: "내 환급금 조회 →",
    kind: "tax",
    envUrlKey: "NEXT_PUBLIC_PARTNER_3O3_URL",
    envRefKey: "NEXT_PUBLIC_PARTNER_3O3_REF",
  },
  "goodrich-insurance": {
    id: "goodrich-insurance",
    headline: "굿리치 — 30개사 보험 비교",
    subline: "FC 무료 상담 · 맞춤 설계",
    cta: "무료 상담 →",
    kind: "insurance",
    envUrlKey: "NEXT_PUBLIC_PARTNER_GOODRICH_URL",
    envRefKey: "NEXT_PUBLIC_PARTNER_GOODRICH_REF",
  },
  "kakaopay-securities": {
    id: "kakaopay-securities",
    headline: "카카오페이증권 — 주식 시작하기",
    subline: "수수료 평생 우대 · 1주부터",
    cta: "계좌 개설 →",
    kind: "investment",
    envUrlKey: "NEXT_PUBLIC_PARTNER_KAKAOPAY_SEC_URL",
    envRefKey: "NEXT_PUBLIC_PARTNER_KAKAOPAY_REF",
  },
  "kakao-finance-calc": {
    id: "kakao-finance-calc",
    headline: "투자 시작 — 카카오페이증권",
    subline: "1주부터 가능 · 평생 수수료 우대",
    cta: "시작하기 →",
    kind: "investment",
    envUrlKey: "NEXT_PUBLIC_PARTNER_KAKAOPAY_SEC_URL",
    envRefKey: "NEXT_PUBLIC_PARTNER_KAKAOPAY_REF",
  },
};

export function getPartnerConfig(id: PartnerId): PartnerConfig {
  return PARTNERS[id];
}

/**
 * 런타임에 ENV에서 URL을 읽음.
 * NEXT_PUBLIC_* 만 클라이언트에서 접근 가능 → process.env로 직접 접근.
 *
 * 주의: Next.js는 빌드 타임에 NEXT_PUBLIC_*를 인라이닝.
 * 따라서 dynamic key 접근(process.env[key])은 동작하지 않을 수 있어
 * 정적 매핑 함수로 우회.
 */
function getEnvValue(key: string): string | undefined {
  // 정적 매핑 — Next.js가 빌드 타임에 인라이닝하기 위함
  const staticMap: Record<string, string | undefined> = {
    NEXT_PUBLIC_PARTNER_FINDA_DSR_URL: process.env.NEXT_PUBLIC_PARTNER_FINDA_DSR_URL,
    NEXT_PUBLIC_PARTNER_FINDA_HOME_URL: process.env.NEXT_PUBLIC_PARTNER_FINDA_HOME_URL,
    NEXT_PUBLIC_PARTNER_FINDA_CALC_URL: process.env.NEXT_PUBLIC_PARTNER_FINDA_CALC_URL,
    NEXT_PUBLIC_PARTNER_FINDA_GUIDE_URL: process.env.NEXT_PUBLIC_PARTNER_FINDA_GUIDE_URL,
    NEXT_PUBLIC_PARTNER_FINDA_COMPANY_URL: process.env.NEXT_PUBLIC_PARTNER_FINDA_COMPANY_URL,
    NEXT_PUBLIC_PARTNER_FINDA_REF: process.env.NEXT_PUBLIC_PARTNER_FINDA_REF,
    NEXT_PUBLIC_PARTNER_TOSS_INS_HOME_URL: process.env.NEXT_PUBLIC_PARTNER_TOSS_INS_HOME_URL,
    NEXT_PUBLIC_PARTNER_TOSS_INS_GUIDE_URL: process.env.NEXT_PUBLIC_PARTNER_TOSS_INS_GUIDE_URL,
    NEXT_PUBLIC_PARTNER_TOSS_TAX_URL: process.env.NEXT_PUBLIC_PARTNER_TOSS_TAX_URL,
    NEXT_PUBLIC_PARTNER_TOSS_REF: process.env.NEXT_PUBLIC_PARTNER_TOSS_REF,
    NEXT_PUBLIC_PARTNER_3O3_URL: process.env.NEXT_PUBLIC_PARTNER_3O3_URL,
    NEXT_PUBLIC_PARTNER_3O3_REF: process.env.NEXT_PUBLIC_PARTNER_3O3_REF,
    NEXT_PUBLIC_PARTNER_GOODRICH_URL: process.env.NEXT_PUBLIC_PARTNER_GOODRICH_URL,
    NEXT_PUBLIC_PARTNER_GOODRICH_REF: process.env.NEXT_PUBLIC_PARTNER_GOODRICH_REF,
    NEXT_PUBLIC_PARTNER_KAKAOPAY_SEC_URL: process.env.NEXT_PUBLIC_PARTNER_KAKAOPAY_SEC_URL,
    NEXT_PUBLIC_PARTNER_KAKAOPAY_REF: process.env.NEXT_PUBLIC_PARTNER_KAKAOPAY_REF,
  };
  return staticMap[key];
}

/**
 * PartnerSlot이 활성화될 수 있는지(=ENV가 채워졌는지) 판단.
 */
export function isPartnerActive(id: PartnerId): boolean {
  const config = PARTNERS[id];
  return Boolean(getEnvValue(config.envUrlKey));
}

/**
 * 최종 클릭 URL 빌드 — ref/amount 자동 부착.
 */
export function buildPartnerUrl(id: PartnerId, ctx?: PartnerContext): string | null {
  const config = PARTNERS[id];
  const baseUrl = getEnvValue(config.envUrlKey);
  if (!baseUrl) return null;

  const url = new URL(baseUrl);
  if (config.envRefKey) {
    const ref = getEnvValue(config.envRefKey);
    if (ref && !url.searchParams.has("ref")) url.searchParams.set("ref", ref);
  }
  if (config.amountQueryParam && ctx?.annualSalary) {
    url.searchParams.set(config.amountQueryParam, String(ctx.annualSalary));
  }
  return url.toString();
}

/**
 * 계산기 카테고리 → 추천 PartnerId 매핑.
 * /calc/[slug] 페이지에서 자동 PartnerSlot 결정용.
 */
export function getPartnerForCalcCategory(
  category:
    | "tax"
    | "salary"
    | "loan"
    | "real-estate"
    | "investment"
    | "insurance"
    | "business"
    | "life"
    | "health"
    | "family"
    | "career"
    | "currency"
): PartnerId | null {
  switch (category) {
    case "loan":
    case "real-estate":
      return "finda-loan-calc";
    case "insurance":
    case "health":
      return "toss-insurance-home";
    case "investment":
      return "kakao-finance-calc";
    case "tax":
      return "samjeomsam-tax";
    default:
      return null;
  }
}

/**
 * 가이드 카테고리/태그 → 추천 PartnerId.
 */
export function getPartnerForGuideTags(tags: string[]): PartnerId | null {
  const lower = tags.map((t) => t.toLowerCase());
  if (lower.some((t) => t.includes("세") || t.includes("환급") || t.includes("연말정산") || t.includes("tax")))
    return "samjeomsam-tax";
  if (lower.some((t) => t.includes("대출") || t.includes("주담대") || t.includes("loan") || t.includes("주택")))
    return "finda-loan-guide";
  if (lower.some((t) => t.includes("보험") || t.includes("insurance")))
    return "toss-insurance-guide";
  if (lower.some((t) => t.includes("투자") || t.includes("주식") || t.includes("stock")))
    return "kakaopay-securities";
  return null;
}
