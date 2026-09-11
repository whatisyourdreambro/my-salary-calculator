// src/config/seasonLinks.ts
//
// 시즌 링크 단일 소스 — 헤더 메가메뉴(시즌 드롭다운)와 푸터(시즌 페이지 섹션)가
// 전부 이 배열에서 파생된다. 신규 시즌 페이지는 여기 1곳에만 추가하면 양쪽에 전파.
//
// 표면별 노출·라벨·순서가 역사적으로 달랐으므로(외관 불변 원칙) surface 필드로 보존:
//  - header 필드가 있으면 헤더 시즌 드롭다운에 노출 (배열 순서 = 헤더 순서)
//  - footer 필드가 있으면 푸터에 노출 (footer.order 오름차순)
//
// TODO(운영 판단): 아래는 표면 간 비대칭 — 노출 변경은 카피 정책 결정 후 반영.
//  - /year-end-tax-2027 (연말정산 허브)      : 헤더에만 있음, 푸터 미노출
//  - /year-end-tax-mid-resign : 푸터에만 있음, 헤더 미노출
//  - (해소 2026-09-02, 전면 최적화) /year-end-tax-2027 푸터 등재·/civil-servant-pay-2027 헤더 등재
//    /chuseok-bonus-2026(헤더+푸터)·/social-insurance-rates-2027(헤더)도 같은 날 등재 — 위 year-end-tax-2027 줄은 해소됨
//  ※ /civil-servant-pay-2026 은 2026-08-30 운영자 지시로 헤더 연봉DB 메뉴에 노출됨
//    (navConfig.ts 봉급표 버티컬 블록 — 군인·교사·경찰·소방과 함께).
//  ※ S3-5 (2026-09-12, docs/next-upgrade-plan-2026-09-11.md §4 NAV-11): 헤더 시즌 드롭다운은
//    키별 ≤ HEADER_SEASON_MAX(12) — 종전 38(SEP)·성과급 메뉴 중복 10·비시즌 2. SEASON_REST 의
//    header 는 상시 5종만 남기고, 내려온 항목은 푸터(order 19+)나 다른 메뉴로 도달한다.
//    게이트: src/lib/__tests__/seasonMenu.test.ts (4키 전부 — S1-1 자동 전환이 구 구조를 되살리지 않도록).
import { bonusCalcCountKo, companyCountKo } from "./site";
import type { SeasonKey } from "@/lib/seasonKey";
import { SEASON_KEY } from "@/config/seasonKey.generated";

export type SeasonBadge = "HOT" | "NEW" | "SEASON" | "MUST";

export type SeasonLink = {
  href: string;
  /** 헤더 메가메뉴 노출 정보 — 없으면 헤더 미노출 */
  header?: { name: string; description?: string; badge?: SeasonBadge };
  /** 푸터 노출 정보 — 없으면 푸터 미노출 */
  footer?: { name: string; order: number };
};

// ── 시즌 상단 블록 — 교체 단위 (배열 순서 = 헤더 순서) ────────────────────
// 2026-09-05 L13a: 세트를 상수로 사전 제작해 둔다. 활성 세트는 사람이 한 줄 바꾸지 않고
// 빌드 시점 키 SEASON_KEY 가 고른다 (S1-1 2026-09-11 — 아래 SEASON_TOP_BY_KEY 참조).
// 상단 블록의 href 가 공통 목록(SEASON_REST)과 겹치면 상단 항목이 우선한다
// (seasonLinks 조립 시 href 기준 첫 항목만 남김 — 배지·순서 승격용).

// 9월 시즌 상단 5종 — 전면 최적화 (운영자 지시 2026-09-02). 추석 9/25·재산세 2기 9/30 종료.
export const SEASON_TOP_SEP: SeasonLink[] = [
  {
    href: "/chuseok-bonus-2026",
    header: { name: "2026 추석 상여금 총정리", description: "평균 지급액·지급 의무·떡값 세금", badge: "SEASON" },
    footer: { name: "추석 상여금 2026", order: 0 },
  },
  {
    href: "/property-holding-tax-2026",
    header: { name: "9월 재산세 2기분 (9/16~30)", description: "주택분 나머지 1/2 + 토지분 — 보유세 계산기", badge: "SEASON" },
    footer: { name: "9월 재산세 2기분 계산기", order: 5 },
  },
  {
    href: "/civil-servant-pay-2027",
    header: { name: "2027 공무원 봉급표 — 3.9% 인상", description: "16년 만 최대 인상 · 9급 1호봉 예상 월급", badge: "HOT" },
  },
  {
    href: "/social-insurance-rates-2027",
    header: { name: "2027 4대보험 요율표", description: "국민연금 10% 확정 — 내 월급 공제 변화", badge: "NEW" },
  },
  {
    href: "/year-end-tax-2027",
    header: { name: "연말정산 2027 총정리 허브", description: "일정·계산기·단계별 로드맵", badge: "SEASON" },
    footer: { name: "연말정산 2027 허브", order: 6 },
  },
];

// 10월 연말정산 예열 세트 — 9/26(추석 종료 익일) 교체용 사전 제작 (2026-09-05 L13a,
// masterplan §12-3 10월 세트 정의 승격). 1순위 연말정산 2027 허브, 추석·재산세는 헤더
// 제거(추석은 푸터도 제거 — 교체 후 '추석' 문구 0건 게이트, 재산세는 푸터만 월 표기 없이
// 보존), 공제 계산기 3종 SEASON 배지. ★국세청 미리보기 오픈일 미확인 → 날짜 카피 금지.
export const SEASON_TOP_OCT: SeasonLink[] = [
  {
    href: "/year-end-tax-2027",
    header: { name: "연말정산 2027 총정리 허브", description: "2026년 귀속 — 일정·계산기·단계별 로드맵", badge: "SEASON" },
    footer: { name: "연말정산 2027 허브", order: 6 },
  },
  {
    href: "/year-end-tax-preview",
    header: { name: "홈택스 연말정산 미리보기", description: "예상 세액 먼저 확인 — 절차·확인 포인트", badge: "NEW" },
  },
  {
    href: "/credit-card-deduction-2026",
    header: { name: "신용카드 소득공제 계산기", description: "결제수단별 공제율·한도", badge: "SEASON" },
  },
  {
    href: "/rent-tax-credit-2026",
    header: { name: "월세 세액공제 계산기", description: "연 1,000만 한도 최대 170만", badge: "SEASON" },
  },
  {
    href: "/medical-tax-credit-2026",
    header: { name: "의료비 세액공제 계산기", description: "난임 30%·무한도 대상 구분", badge: "SEASON" },
  },
  {
    href: "/civil-servant-pay-2027",
    header: { name: "2027 공무원 봉급표 — 3.9% 인상", description: "16년 만 최대 인상 · 9급 1호봉 예상 월급", badge: "HOT" },
  },
  {
    href: "/social-insurance-rates-2027",
    header: { name: "2027 4대보험 요율표", description: "국민연금 10% 확정 — 내 월급 공제 변화", badge: "NEW" },
  },
  {
    href: "/property-holding-tax-2026",
    footer: { name: "재산세·보유세 계산기", order: 5 },
  },
];

// 12월 연말정산 마감 세트 — 12/1 교체용 사전 제작 (2026-09-05, L18' 시점 앞당김).
// 1순위 허브, 2순위 삼성 TAI(하반기 발표 전 → 라벨만·수치 금지, SEASON_REST 의 삼성 항목(footer order 3,
// 헤더는 S3-5 로 제외)을 상단으로 승격 — footer 를 빼면 dedup 으로 푸터 링크가 사라지므로 반드시 동반), 공제 3종 SEASON,
// 12.31 체크리스트. 공무원 2027·4대보험 2027·재산세 푸터는 OCT 세트 그대로 이월.
export const SEASON_TOP_DEC: SeasonLink[] = [
  {
    href: "/year-end-tax-2027",
    header: { name: "연말정산 2027 총정리 허브", description: "2026년 귀속 — 12/31 전 마지막 점검 로드맵", badge: "SEASON" },
    footer: { name: "연말정산 2027 허브", order: 6 },
  },
  {
    href: "/calc/samsung-bonus",
    header: { name: "삼성전자 하반기 TAI 세후 계산기", description: "사업부별 지급률 입력 — 세후 실수령액", badge: "HOT" },
    footer: { name: "삼성 성과급 계산기", order: 3 },
  },
  {
    href: "/credit-card-deduction-2026",
    header: { name: "신용카드 소득공제 계산기", description: "연말 결제수단별 공제율·한도", badge: "SEASON" },
  },
  {
    href: "/medical-tax-credit-2026",
    header: { name: "의료비 세액공제 계산기", description: "난임 30%·무한도 대상 구분", badge: "SEASON" },
  },
  {
    href: "/year-end-tax-checklist",
    header: { name: "연말정산 체크리스트", description: "12.31 마감 전 놓친 공제 점검", badge: "SEASON" },
  },
  {
    href: "/civil-servant-pay-2027",
    header: { name: "2027 공무원 봉급표 — 3.9% 인상", description: "16년 만 최대 인상 · 9급 1호봉 예상 월급", badge: "HOT" },
  },
  {
    href: "/social-insurance-rates-2027",
    header: { name: "2027 4대보험 요율표", description: "국민연금 10% 확정 — 내 월급 공제 변화", badge: "NEW" },
  },
  {
    href: "/property-holding-tax-2026",
    footer: { name: "재산세·보유세 계산기", order: 5 },
  },
];

// 1월 연말정산 간소화·OPI 세트 — 1/2 교체용 사전 제작 (2026-09-05, L18' 시점 앞당김).
// 1순위 허브(간소화 순서), 2순위 삼성 OPI(발표 전 → 라벨만·수치 금지, footer 동반 승격),
// 환급금 계산기·카드공제·2027 연봉표. ★간소화 오픈일 미확인 → 날짜 카피 금지.
// ★1/2 교체 전 확인: 공무원 2027 봉급표 라벨(예산안 → 확정 여부)·4대보험 2027 은 시행 중 표기.
export const SEASON_TOP_JAN: SeasonLink[] = [
  {
    href: "/year-end-tax-2027",
    header: { name: "연말정산 간소화 — 2027 허브", description: "간소화 자료 조회부터 회사 제출까지 단계별 순서", badge: "SEASON" },
    footer: { name: "연말정산 2027 허브", order: 6 },
  },
  {
    href: "/calc/samsung-bonus",
    header: { name: "삼성전자 OPI 세후 계산기", description: "발표된 사업부별 지급률 입력 — 세후 실수령액", badge: "HOT" },
    footer: { name: "삼성 성과급 계산기", order: 3 },
  },
  {
    href: "/year-end-tax",
    header: { name: "연말정산 환급금 계산기", description: "간소화 자료 기준 예상 환급·추가납부액", badge: "SEASON" },
  },
  {
    href: "/credit-card-deduction-2026",
    header: { name: "신용카드 소득공제 계산기", description: "결제수단별 공제율·한도 막판 점검", badge: "SEASON" },
  },
  {
    href: "/table/2027/annual",
    header: { name: "2027 연봉 실수령액 표", description: "국민연금 10%(근로자 5%) 적용 — 올해 세후 월급", badge: "NEW" },
  },
  {
    href: "/civil-servant-pay-2027",
    header: { name: "2027 공무원 봉급표 — 3.9% 인상", description: "16년 만 최대 인상 · 9급 1호봉 예상 월급", badge: "HOT" },
  },
  {
    href: "/social-insurance-rates-2027",
    header: { name: "2027 4대보험 요율표", description: "국민연금 10% 확정 — 내 월급 공제 변화", badge: "NEW" },
  },
  {
    href: "/property-holding-tax-2026",
    footer: { name: "재산세·보유세 계산기", order: 5 },
  },
];

// ── 활성 세트 선택 (S1-1, 2026-09-11) — 사람이 한 줄 바꾸지 않는다 ─────────────
// 빌드 시점 키 SEASON_KEY(src/config/seasonKey.generated.ts, prebuild 코드젠)가 세트를 고른다:
//   ~9/25 SEP → 9/26 OCT → 12/1 DEC 자동 (KST 자정, 경계표 src/lib/seasonKey.ts).
//   ★JAN 은 자동 전환 없음 — 1/2 전 확인 2건(공무원 2027 확정·간소화 오픈일) 후
//     src/lib/seasonKey.ts 의 SEASON_KEY_OVERRIDE = "JAN" → tsx scripts/gen-season-key.ts → 커밋.
// 경계일 이후 첫 배포에 반영되고(배포 후 CF 캐시 퍼지는 운영자), 커밋된 키가 만료되면
// verify:site 가 WARNING, 주간 health-check 가 프로덕션 data-season-key 로 알린다.
export const SEASON_TOP_BY_KEY: Record<SeasonKey, SeasonLink[]> = {
  SEP: SEASON_TOP_SEP,
  OCT: SEASON_TOP_OCT,
  DEC: SEASON_TOP_DEC,
  JAN: SEASON_TOP_JAN,
};
const SEASON_TOP: SeasonLink[] = SEASON_TOP_BY_KEY[SEASON_KEY];

// ── 공통 목록 — 시즌과 무관하게 유지 (상단 블록과 href 가 겹치면 상단이 우선) ──
// S3-5 (2026-09-12): 헤더 상시 항목은 아래 5종만(연중 유효·성과급/계산기 메뉴와 미중복). 나머지는
// header 를 떼어 푸터 또는 다른 진입로(navConfig 성과급·계산기 메뉴, hubs, seasonalCalendar,
// yearEndTaxHub)로만 도달한다 — 도달성은 seasonMenu.test 가 4키 전부 검사한다.
//  - 표면 없는 { href } 항목은 삭제하지 않는다: 시즌 재진입 시 header 를 되살릴 자리이자
//    도달성 검사 대상 목록이다. 되살릴 때는 키별 ≤ HEADER_SEASON_MAX 를 넘지 말 것.
//  - 푸터 order 0~18 은 종전 값 그대로(재번호 금지), 19+ 는 이번에 헤더에서 내려온 항목.
export const SEASON_REST: SeasonLink[] = [
  // ── 헤더 상시 5종 (배열 순서 = 헤더 순서) ─────────────────────────────
  {
    href: "/minimum-wage-2027",
    header: { name: "2027 최저임금 10,700원 확정", description: "+3.7%·월 223.6만원 환산", badge: "HOT" },
    footer: { name: "2027 최저임금 확정", order: 1 },
  },
  {
    href: "/tax-reform-2026",
    header: { name: "2026 세법개정안 (8·3 확정 발표)", description: "발표 내용·직장인 영향 정리", badge: "HOT" },
    footer: { name: "2026 세법개정안", order: 19 },
  },
  {
    href: "/health-insurance-2026",
    header: { name: "건보료 연말정산 (4월 반영)", description: "정산금·분납·환급" },
    footer: { name: "건강보험 2026", order: 10 },
  },
  {
    href: "/new-employee-salary-2026",
    header: { name: "신입 초봉 TOP 50", description: `회사 ${companyCountKo} 영끌 인덱스` },
    footer: { name: "신입 초봉 TOP 50", order: 7 },
  },
  // R2 W3 (2026-08-31) — pension-hike는 2027-01 시행 확정 이벤트(12~1월 뉴스 피크) — 헤더+푸터.
  {
    href: "/calc/pension-hike-2027",
    header: { name: "국민연금 인상 계산기 (2027)", description: "요율 9.5→10% — 월급에서 더 빠지는 금액", badge: "NEW" },
    footer: { name: "국민연금 인상 계산기", order: 13 },
  },
  // ── 푸터 노출 (헤더 미노출, footer.order 순) ────────────────────────────
  {
    href: "/calc/bonus-calculators",
    footer: { name: `성과급 계산기 ${bonusCalcCountKo}`, order: 2 },
  },
  // 삼성·SK 는 DEC/JAN 상단 블록이 이 footer 를 승격해 쓴다 — footer 를 빼면 dedup 으로 푸터 링크가 사라진다.
  { href: "/calc/samsung-bonus", footer: { name: "삼성 성과급 계산기", order: 3 } },
  { href: "/calc/sk-hynix-bonus", footer: { name: "SK하이닉스 성과급 계산기", order: 4 } },
  { href: "/calc/january-bonus", footer: { name: "13월의 월급", order: 8 } },
  { href: "/calc/year-end-bonus", footer: { name: "성과급 세금", order: 9 } },
  // 2026-08-15 Phase 3 신설 — 1월 검색 폭증 봉급표 + 중도퇴사 연말정산
  { href: "/civil-servant-pay-2026", footer: { name: "공무원 봉급표 2026", order: 11 } },
  { href: "/year-end-tax-mid-resign", footer: { name: "중도퇴사 연말정산", order: 12 } },
  // 봉급표 버티컬 4종 — 헤더는 연봉DB 메뉴(navConfig)에 기노출이라 푸터만.
  { href: "/military-pay-2026", footer: { name: "군인 월급 2026", order: 14 } },
  { href: "/teacher-pay-2026", footer: { name: "교사 호봉표 2026", order: 15 } },
  { href: "/police-pay-2026", footer: { name: "경찰 봉급표 2026", order: 16 } },
  { href: "/firefighter-pay-2026", footer: { name: "소방관 봉급표 2026", order: 17 } },
  // /year-end-tax-2026 은 실제로는 종합소득세(5월 종소세) 페이지 — 표면별 라벨 상이 이력 보존
  { href: "/year-end-tax-2026", footer: { name: "종합소득세 2026", order: 18 } },
  // S3-5 (2026-09-12) 헤더에서 내려온 항목 — 다른 진입로가 없어 푸터 신설 (order 19+)
  { href: "/year-end-tax-settlement-2026", footer: { name: "연말정산·성과급 절세 2026", order: 20 } },
  { href: "/year-end-tax-checklist", footer: { name: "연말정산 체크리스트", order: 21 } },
  { href: "/new-employee-2026", footer: { name: "신입 연봉 협상 2026", order: 22 } },
  { href: "/health-insurance-dependent", footer: { name: "건보 피부양자 판정기", order: 23 } },
  { href: "/donation-tax-credit-2026", footer: { name: "기부금 세액공제 계산기", order: 24 } },
  { href: "/calc/dual-income-year-end", footer: { name: "맞벌이 연말정산 몰아주기", order: 25 } },
  { href: "/minimum-wage-2026", footer: { name: "최저임금 2026", order: 26 } },
  { href: "/social-insurance-rates-2026", footer: { name: "2026 4대보험 요율", order: 27 } },
  { href: "/retirement-pension-2026", footer: { name: "퇴직연금 DB·DC·IRP", order: 28 } },
  // ── 헤더·푸터 미노출 — 다른 진입로로 도달 (href 만 보존, 시즌 재진입 시 header 부활 자리) ──
  // hubs.ts / seasonalCalendar.ts 경유
  { href: "/auto-tax-2026" },
  { href: "/health-checkup-2026" },
  { href: "/tax-rates-2026" },
  { href: "/tax-changes-2026" },
  { href: "/samsung-negotiation-2026" },
  // navConfig 계산기 메뉴 경유 (+ OCT/DEC/JAN 상단 블록이 시즌 배지로 승격)
  { href: "/credit-card-deduction-2026" },
  { href: "/rent-tax-credit-2026" },
  { href: "/medical-tax-credit-2026" },
  // navConfig 성과급 메뉴 경유 — 시즌 드롭다운과 10건 중복이던 회사별 계산기 (NAV-11)
  { href: "/calc/hyundai-bonus" },
  { href: "/calc/kia-bonus" },
  { href: "/calc/lg-energy-bonus" },
  { href: "/calc/hd-hyundai-bonus" },
  { href: "/calc/naver-bonus" },
  { href: "/calc/kakao-bonus" },
  { href: "/calc/celltrion-bonus" },
  { href: "/calc/hyundai-rotem-bonus" },
];

/** 헤더 시즌 드롭다운 상한 — 키별 header 항목 수 (S3-5, 2026-09-12). seasonMenu.test 가 4키 전부 검사. */
export const HEADER_SEASON_MAX = 12;

/** href 중복은 앞(상단 블록) 항목만 남긴다. */
const dedupByHref = (links: SeasonLink[]): SeasonLink[] =>
  links.filter((l, i, arr) => arr.findIndex((x) => x.href === l.href) === i);

/** 임의 키의 시즌 링크 조립 — seasonLinks 와 같은 dedup. 테스트·검증 스크립트용 (활성 키는 seasonLinks). */
export function buildSeasonLinks(key: SeasonKey): SeasonLink[] {
  return dedupByHref([...SEASON_TOP_BY_KEY[key], ...SEASON_REST]);
}

/** 활성 키의 시즌 상단 블록 + 공통 목록. */
export const seasonLinks: SeasonLink[] = dedupByHref([...SEASON_TOP, ...SEASON_REST]);

/** 헤더 시즌 드롭다운 항목 — navConfig 소비용 (배열 순서 유지) */
export const headerSeasonItems: {
  name: string;
  href: string;
  description?: string;
  badge?: SeasonBadge;
}[] = seasonLinks
  .filter((l) => l.header)
  .map((l) => ({
    name: l.header!.name,
    href: l.href,
    description: l.header!.description,
    badge: l.header!.badge,
  }));

/** 푸터 시즌 섹션 항목 — Footer 소비용 (order 오름차순) */
export const footerSeasonLinks = seasonLinks
  .filter((l) => l.footer)
  .sort((a, b) => a.footer!.order - b.footer!.order)
  .map((l) => ({ name: l.footer!.name, href: l.href }));
