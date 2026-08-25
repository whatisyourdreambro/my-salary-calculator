// src/lib/affiliateOffers.ts
//
// 금융 CPA 오퍼 매칭 — AffiliateSlot 의 순수 로직 계층.
// 오퍼 데이터는 src/data/offers.json 단일 소스: 운영자는 그 파일의 url/active 만
// 수정하면 코드 변경 없이 오퍼가 켜지고 꺼진다. (절차: docs/affiliate-ops.md)
//
// 이 모듈은 클라이언트 번들에 실린다(AffiliateSlot "use client") — 회사/계산기
// 데이터 배열 import 금지. 슬러그→버티컬 규칙은 아래 정적 규칙표로 유지하고,
// 실데이터와의 드리프트는 src/lib/__tests__/affiliateOffers.test.ts 가
// simpleCalculators 카테고리를 서버 컨텍스트에서 대조해 잡는다.
import offersJson from "@/data/offers.json";

export type OfferVertical =
  | "loan"
  | "card"
  | "securities"
  | "insurance"
  | "savings"
  | "remittance";

export interface Offer {
  id: string;
  vertical: OfferVertical;
  /** 명시 적용 페이지 — 접두사 매칭은 "/fun/*" 처럼 끝에 * */
  pages?: string[];
  label: string;
  description: string;
  /** 제휴 네트워크 트래킹 URL — 승인 전 "PLACEHOLDER" */
  url: string;
  /** linkprice | ilikeclick | adpick | tenping ... */
  network: string;
  /** 낮을수록 우선 노출 */
  priority: number;
  active: boolean;
  /** calcResult 보간 문구 — 예: "성과급 {amount}만원 — IRP 환급 확인" */
  template?: string;
  /** 기본 고지문 오버라이드 */
  disclosure?: string | null;
}

/** 오퍼 노출 시 자동 표기되는 기본 고지문 (지시서 §TASK-3-6) */
export const AFFILIATE_DISCLOSURE_TEXT =
  "제휴 링크이며 일정 수수료를 받을 수 있습니다.";

/**
 * 취약 상황 방문자 보호 — 어떤 오퍼도 절대 노출 금지 (지시서 vertical:"none").
 * offers.json 의 pages 에 이 경로가 들어 있어도 여기서 최우선 차단된다.
 * /calc/unemployment-benefit 은 [slug] 로 서빙되는 실업급여 중복 계산기,
 * /lotto·/fortune-2026·/mbti-salary 는 저의도 엔터테인먼트 페이지.
 */
export const BLOCKED_PATHS: RegExp[] = [
  /^\/unemployment-benefit(\/|$)/,
  /^\/earned-income-credit(\/|$)/,
  /^\/parental-leave(\/|$)/,
  /^\/basic-pension-2026(\/|$)/,
  /^\/fun(\/|$)/,
  /^\/calc\/unemployment-benefit(\/|$)/,
  /^\/lotto(\/|$)/,
  /^\/fortune-2026(\/|$)/,
  /^\/mbti-salary(\/|$)/,
];

/**
 * 2차 버티컬 게이트 — 데이터(offers.json active)와 코드(이 상수) 둘 다 열려야
 * 노출된다. savings·remittance 는 지시서 일정상 2차 — 1차 안정화 후 이 배열에서
 * 제거해 개방한다. (remittance 는 /en·/global 대상 — 쿠팡이 /en 에서 null 인
 * 현행과 별개로 오퍼는 렌더 가능하도록 AffiliateSlot 이 처리)
 */
export const PHASE2_VERTICALS: OfferVertical[] = ["savings", "remittance"];

/**
 * 경로 → 버티컬 추론 규칙 (첫 매치 승 — 구체 규칙을 앞에).
 * 지시서 매핑표 + 실존 라우트 전수 확인(2026-08-25) 기준.
 * 주의:
 *  - /year-end-tax-2026 은 이름과 달리 종합소득세(5월) 페이지 — card 매핑 금지.
 *  - /health-insurance-* 는 국민건강보험 — 사보험(insurance) 매핑 금지.
 *  - 퀵 계산기는 전부 /calc/[slug] 동적 라우트 — 디렉터리 glob 으론 안 잡힘.
 */
const VERTICAL_RULES: Array<[RegExp, OfferVertical]> = [
  // ── card: 카드 발급 (연말정산 허브 카드 섹션 포함) ──
  [/^\/credit-card-deduction-2026(\/|$)/, "card"],
  [/^\/year-end-tax(\/|$)/, "card"], // 연말정산 계산기 허브 (카드 섹션 L155-170)
  [/^\/year-end-tax-2027(\/|$)/, "card"],
  [/^\/hub\/tax-saving(\/|$)/, "card"],

  // ── remittance: 해외송금 (2차) ──
  [/^\/en(\/|$)/, "remittance"],
  [/^\/global(\/|$)/, "remittance"],
  [/^\/calc\/(currency-converter|exchange-impact-quick)(\/|$)/, "remittance"],

  // ── savings: 예적금 비교 (2차) ──
  [/^\/savings-interest-2026(\/|$)/, "savings"],
  [/^\/tools\/deposit(\/|$)/, "savings"],
  [/^\/tools\/finance\/compound(\/|$)/, "savings"],
  [
    /^\/calc\/(compound-interest-quick|simple-interest-quick|savings-goal-time)(\/|$)/,
    "savings",
  ],

  // ── insurance: 다이렉트 견적 — [slug] insurance 카테고리 8종 전수 ──
  [
    /^\/calc\/(auto-insurance-quick|life-insurance-needs|medical-expense-coverage|cancer-insurance-needs|fire-insurance-quick|travel-insurance-quick|pet-insurance-quick|child-insurance-needs)(\/|$)/,
    "insurance",
  ],
  [/^\/hub\/insurance(\/|$)/, "insurance"],

  // ── loan: 대출 비교 ──
  [/^\/(home-loan|car-loan)(\/|$)/, "loan"],
  [/^\/tools\/loan(\/|$)/, "loan"],
  [/^\/tools\/finance\/installment(\/|$)/, "loan"],
  [/^\/tools\/real-estate\/(dsr|ltv)(\/|$)/, "loan"],
  [
    /^\/calc\/(dsr-quick|ltv-quick|loan-[a-z0-9-]+|level-principal-payment|bullet-loan|prepayment-fee-quick|monthly-installment|mortgage-monthly-quick|jeonse-loan-cost|jeonse-loan|housing-subscription)(\/|$)/,
    "loan",
  ],

  // ── securities: 계좌개설·ISA·IRP (성과급 결과 동선의 핵심 버티컬) ──
  [/^\/calc\/[a-z0-9-]+-bonus(\/|$)/, "securities"], // 회사별 23종 + 제네릭 성과급
  [
    /^\/calc\/(bonus-calculators|year-end-bonus-tax|incentive-tax|severance-vs-pension)(\/|$)/,
    "securities",
  ],
  [/^\/tools\/finance\/(irp|stock-tax|severance|bonus|cagr)(\/|$)/, "securities"],
  [/^\/retirement-pension-2026(\/|$)/, "securities"],
  [/^\/fire-calculator(\/|$)/, "securities"],
  [
    /^\/calc\/(stock-[a-z0-9-]+|dividend-[a-z0-9-]+|interest-tax-quick|etf-fee-impact|bond-yield-quick|portfolio-allocation|dollar-cost-average|real-return-quick|inflation-impact-quick|cagr-quick|rule-of-72-quick|fire-target)(\/|$)/,
    "securities",
  ],
  [/^\/guides\/category\/(stock|invest)(\/|$)/, "securities"],
  [/^\/hub\/(invest|fire)(\/|$)/, "securities"],
  [
    // 하이픈 토큰 경계 강제 — 부분 문자열 오탐 방지 (예: "refund"의 fund, "visa"의 isa
    // 로 tax-refund·visa 가이드가 증권으로 오분류되던 버그, 2026-08 점검 수정)
    /^\/guides\/(?:[a-z0-9]+-)*(?:stock|stocks|isa|irp|etf|etfs|fund|funds|bond|bonds|invest|investing|investment|reits|dividend)(?:-[a-z0-9-]+)?(\/|$)/,
    "securities",
  ],
];

const KNOWN_VERTICALS: ReadonlySet<string> = new Set([
  "loan",
  "card",
  "securities",
  "insurance",
  "savings",
  "remittance",
]);

/** 오퍼 절대 금지 경로 여부 */
export function isBlockedPath(pathname: string): boolean {
  return BLOCKED_PATHS.some((re) => re.test(pathname));
}

/** 경로 → 버티컬 추론. 매칭 없으면 null (오퍼 미노출, 쿠팡 폴백만). */
export function inferVertical(pathname: string): OfferVertical | null {
  if (isBlockedPath(pathname)) return null;
  for (const [re, vertical] of VERTICAL_RULES) {
    if (re.test(pathname)) return vertical;
  }
  return null;
}

/** offers.json pages 항목 매칭 — 정확 일치 또는 "prefix/*" */
function pageMatches(pathname: string, pattern: string): boolean {
  if (pattern.endsWith("/*")) {
    const prefix = pattern.slice(0, -2);
    return pathname === prefix || pathname.startsWith(`${prefix}/`);
  }
  return pathname === pattern || pathname === `${pattern}/`;
}

/**
 * offers.json 런타임 검증 — 운영자 오타 내성.
 * 치명 오류(중복 id, active 오퍼의 비정상 url)는 throw,
 * 알 수 없는 vertical 항목은 무시 목록으로 반환한다.
 */
export function validateOffers(raw: unknown): { offers: Offer[]; ignored: string[] } {
  if (!Array.isArray(raw)) throw new Error("[affiliateOffers] offers.json 이 배열이 아님");
  const seen = new Set<string>();
  const offers: Offer[] = [];
  const ignored: string[] = [];
  for (const item of raw as Offer[]) {
    if (!item || typeof item.id !== "string" || !item.id) {
      throw new Error("[affiliateOffers] id 없는 오퍼 존재");
    }
    if (seen.has(item.id)) throw new Error(`[affiliateOffers] 중복 오퍼 id: ${item.id}`);
    seen.add(item.id);
    if (!KNOWN_VERTICALS.has(item.vertical)) {
      ignored.push(item.id);
      continue;
    }
    if (item.active && !/^https:\/\//.test(item.url)) {
      throw new Error(
        `[affiliateOffers] 활성 오퍼 ${item.id} 의 url 이 https 가 아님 (${item.url}) — active 전환 전 트래킹 URL 기입 필요`,
      );
    }
    offers.push(item);
  }
  return { offers, ignored };
}

const { offers: ALL_OFFERS, ignored: IGNORED_OFFER_IDS } = validateOffers(offersJson);

if (IGNORED_OFFER_IDS.length > 0 && process.env.NODE_ENV === "development") {
  console.warn(
    `[affiliateOffers] 알 수 없는 vertical 로 무시된 오퍼: ${IGNORED_OFFER_IDS.join(", ")}`,
  );
}

/** 전체 오퍼 (검증 통과분) — QA 크롤·테스트용 */
export function getAllOffers(): Offer[] {
  return ALL_OFFERS;
}

/**
 * 페이지에 노출할 오퍼 목록.
 * 규칙: BLOCKED 최우선 차단 → active → 2차 버티컬 게이트 →
 *       (pages 명시 매칭 ‖ 버티컬 일치) →
 *       정렬: pages 명시 매칭이 버티컬 광역 매칭보다 우선, 그다음 priority 오름차순.
 * (구체 지정 > 광역 — 같은 버티컬의 두 오퍼를 페이지 분할 A/B 로 운영하는 근거:
 *  예. 올크레딧은 pages 명시 4곳에서 우선, 나머지 loan 지면은 NICE지키미)
 */
export function matchOffers(
  pathname: string,
  verticalOverride?: OfferVertical,
): Offer[] {
  if (!pathname || isBlockedPath(pathname)) return [];
  const pageVertical = verticalOverride ?? inferVertical(pathname);
  return ALL_OFFERS.map((o) => {
    if (!o.active) return null;
    if (PHASE2_VERTICALS.includes(o.vertical)) return null;
    const byPage = o.pages?.some((p) => pageMatches(pathname, p)) ?? false;
    const byVertical = pageVertical !== null && o.vertical === pageVertical;
    if (!byPage && !byVertical) return null;
    return { offer: o, byPage };
  })
    .filter((x): x is { offer: Offer; byPage: boolean } => x !== null)
    .sort(
      (a, b) =>
        Number(b.byPage) - Number(a.byPage) || a.offer.priority - b.offer.priority,
    )
    .map((x) => x.offer);
}

/**
 * 계산 결과 보간 — "{amount}" 형 플레이스홀더를 calcResult 값으로 치환.
 * 숫자는 ko-KR 천단위 포맷. 값이 없는 플레이스홀더는 원문 유지.
 */
export function interpolate(
  template: string,
  calcResult?: Record<string, string | number>,
): string {
  if (!calcResult) return template;
  return template.replace(/\{(\w+)\}/g, (match, key: string) => {
    const v = calcResult[key];
    if (v === undefined || v === null) return match;
    return typeof v === "number" ? v.toLocaleString("ko-KR") : String(v);
  });
}
