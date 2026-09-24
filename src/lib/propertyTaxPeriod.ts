// src/lib/propertyTaxPeriod.ts
//
// /property-holding-tax-2026 의 납부기간 문구 — 순수 날짜 함수 (의존성 0). B6 DATE-15 (2026-09-25).
//
// 배경: 페이지가 `CURRENT_PERIOD = PERIOD_SEPT` 를 사람이 바꿔 왔고, 9월분 납기(9/16~9/30)가
// description·배지·헤더에 날짜 게이트 없이 박혀 있어 10/1 부터 지난 기한을 광고하게 돼 있었다.
// 이제 빌드 시점(KST) 날짜로 여기서 고른다. 페이지는 정적 프리렌더라 모듈 평가 시각 = 빌드 시각이고,
// 경계일 이후 첫 배포(CF Retry deployment 또는 아무 푸시) + 운영자 캐시 Purge 로 반영된다.
//
// ★ SEASON_KEY(src/lib/seasonKey.ts)를 쓰지 않는다 — 그 키는 9/26 에 OCT 로 넘어가지만
//   9월분 재산세 납기는 9/30 까지다. 경계가 달라서 별도 표를 둔다.
// ★ 경계(KST 자정 기준, 2026년 절대 날짜):
//     ~7/31 JULY | 8/1~9/30 SEPT | 10/1~11/24 OFFSEASON | 11/25~12/15 COMPREHENSIVE | 12/16~ OFFSEASON
//   11/25 = 국세청 종부세 고지서 발송 직후(2025년 11/24 발송 선례). 2027년 경계는 두지 않았다 —
//   JULY·SEPT 문구의 요일이 2026년 전용이라, 2027 페이지로 갱신할 때 날짜표를 새로 만들 것.
//   그 전까지 2027년 빌드는 계속 OFFSEASON(연도 무관 중립 문구)으로 남는다.
// ★ 출처(2026-09-25 확인):
//   - 재산세 납기: 지방세법 제115조 제1항 — 토지 9/16~9/30, 건축물 7/16~7/31,
//     주택 1/2 7/16~7/31·나머지 1/2 9/16~9/30 (연세액 20만원 이하는 7월 일시 부과 가능)
//   - 2026년 9월분: 서울시 발표(2026-09-15, 9월분 4조8,236억 부과, 납부기한 9월 30일(수))
//   - 종부세: 국세청 납부기한 안내(nts.go.kr, 매년 12.1.~12.15., 토·공휴일이면 다음 날) —
//     2026-12-15 는 화요일이라 연장 없음
// ★ 배지(badge)·헤더 문장(headerCta)은 첫 광고(HomeTopAd) 위에 렌더된다 — 새 문구는 SEPT 기준
//   길이를 넘기지 않는다(propertyTaxPeriod.test.ts 가 강제). 광고 위 높이 증가 금지 원칙.

export type PropertyTaxPeriodKey = "JULY" | "SEPT" | "OFFSEASON" | "COMPREHENSIVE";

export interface PropertyTaxPeriod {
  key: PropertyTaxPeriodKey;
  /** 헤더 배지 — HomeTopAd 위 */
  badge: string;
  /** meta/og description 앞머리 */
  metaLead: string;
  /** 헤더 소개 문단의 마지막 문장 — HomeTopAd 위 */
  headerCta: string;
  /** FAQ '가산세' 답변의 마지막 문장 */
  faqDeadline: string;
}

/** 재산세 정기분(7월·9월) — 본문 FAQ·시즌 섹션이 range·scope·deadline 을 직접 쓴다 */
export interface PropertyTaxInstallment extends PropertyTaxPeriod {
  label: string;
  range: string;
  rangeShort: string;
  deadline: string;
  scope: string;
}

function installment(
  key: "JULY" | "SEPT",
  f: Pick<PropertyTaxInstallment, "label" | "range" | "rangeShort" | "deadline" | "scope">,
): PropertyTaxInstallment {
  return {
    key,
    ...f,
    badge: `${f.label} 재산세 납부기간 ${f.rangeShort}`,
    metaLead: `${f.label} 재산세 납부기간 ${f.rangeShort} — 대상은 ${f.scope}.`,
    headerCta: `${f.label} 재산세 고지서를 받았다면 계산기로 내 세액 수준을 확인하고, ${f.deadline}까지 위택스·이택스에서 납부하세요.`,
    faqDeadline: `2026년 ${f.label} 재산세 기한은 ${f.deadline}이므로 하루라도 늦지 않게 납부하는 것이 좋습니다.`,
  };
}

export const PERIOD_JULY = installment("JULY", {
  label: "7월분(1기분)",
  range: "7월 16일(목)~7월 31일(금)",
  rangeShort: "7/16~7/31",
  deadline: "7월 31일(금)",
  scope: "주택분 1/2 + 건축물·선박·항공기분",
});

export const PERIOD_SEPT = installment("SEPT", {
  label: "9월분(2기분)",
  range: "9월 16일~9월 30일",
  rangeShort: "9/16~9/30",
  deadline: "9월 30일",
  scope: "주택분 나머지 1/2 + 토지분",
});

/** 비시즌 — 날짜가 지나도 틀리지 않는 중립 문구 (10/1~11/24, 12/16~) */
export const PERIOD_OFFSEASON: PropertyTaxPeriod = {
  key: "OFFSEASON",
  badge: "재산세 7·9월 / 종부세 12월 1~15일",
  metaLead: "재산세 7·9월 / 종부세 12월 1~15일 납부 — 연간 보유세를 미리 점검하세요.",
  headerCta: "재산세는 7·9월, 종부세는 12월 1~15일에 내므로 고지서가 오기 전에 계산기로 세액 수준을 미리 확인해 두세요.",
  faqDeadline:
    "2026년 재산세 기한은 7월분 7월 31일·9월분 9월 30일이며, 미납분이 있다면 위택스에서 조회해 바로 납부하는 것이 좋습니다.",
};

/** 종합부동산세 정기고지 납부 시즌 (11/25~12/15) */
export const PERIOD_COMPREHENSIVE: PropertyTaxPeriod = {
  key: "COMPREHENSIVE",
  badge: "종합부동산세 납부기간 12/1~12/15",
  metaLead: "종합부동산세 납부기간 12/1~12/15 — 고지서 세액을 계산기로 미리 확인하세요.",
  headerCta: "종합부동산세 고지서를 받았다면 계산기로 내 세액 수준을 확인하고, 12월 15일까지 홈택스·손택스에서 납부하세요.",
  faqDeadline:
    "2026년 재산세 기한은 7월분 7월 31일·9월분 9월 30일이었고, 종합부동산세는 국세라 가산세 기준이 다르며 기한은 12월 15일입니다.",
};

export const PROPERTY_TAX_PERIODS: Readonly<Record<PropertyTaxPeriodKey, PropertyTaxPeriod>> = {
  JULY: PERIOD_JULY,
  SEPT: PERIOD_SEPT,
  OFFSEASON: PERIOD_OFFSEASON,
  COMPREHENSIVE: PERIOD_COMPREHENSIVE,
};

const KST_OFFSET_MS = 9 * 60 * 60 * 1000;

/** KST 자정을 UTC ms 로 (월은 1~12) — 머신 타임존과 무관 */
function kstMidnight(y: number, m: number, d: number): number {
  return Date.UTC(y, m - 1, d) - KST_OFFSET_MS;
}

export type KstDate = readonly [year: number, month: number, day: number];

/** 전환 경계 — 오름차순. 해당 KST 자정 이상이면 그 키. 첫 경계 이전은 JULY. */
export const PROPERTY_TAX_PERIOD_BOUNDARIES: ReadonlyArray<{
  key: PropertyTaxPeriodKey;
  fromKst: KstDate;
}> = [
  { key: "SEPT", fromKst: [2026, 8, 1] }, // 7월분 납기(7/31) 다음 날
  { key: "OFFSEASON", fromKst: [2026, 10, 1] }, // 9월분 납기(9/30) 다음 날
  { key: "COMPREHENSIVE", fromKst: [2026, 11, 25] }, // 종부세 고지서 발송 직후
  { key: "OFFSEASON", fromKst: [2026, 12, 16] }, // 종부세 납기(12/15) 다음 날
];

/** 날짜(KST 기준)만으로 고르는 납부기간 키 — 파싱 불가 날짜는 중립(OFFSEASON) */
export function pickPropertyTaxPeriodKey(now: Date): PropertyTaxPeriodKey {
  const t = now.getTime();
  if (Number.isNaN(t)) return "OFFSEASON";
  let key: PropertyTaxPeriodKey = "JULY";
  for (const b of PROPERTY_TAX_PERIOD_BOUNDARIES) {
    if (t >= kstMidnight(...b.fromKst)) key = b.key;
  }
  return key;
}

/** 페이지가 쓰는 현재 납부기간 문구 세트 */
export function pickPropertyTaxPeriod(now: Date): PropertyTaxPeriod {
  return PROPERTY_TAX_PERIODS[pickPropertyTaxPeriodKey(now)];
}

/** meta/og description — 납부기간 앞머리 + 공통 꼬리. 모든 기간에서 80~120자 (테스트가 강제) */
export function propertyTaxMetaDescription(period: PropertyTaxPeriod): string {
  return `${period.metaLead} 공시가 10억 1주택자 재산세+지방교육세 약 140만원(도시지역분 별도), 종부세까지 동시 계산.`;
}
