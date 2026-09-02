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
import { bonusCalcCountKo, companyCountKo } from "./site";

export type SeasonBadge = "HOT" | "NEW" | "SEASON" | "MUST";

export type SeasonLink = {
  href: string;
  /** 헤더 메가메뉴 노출 정보 — 없으면 헤더 미노출 */
  header?: { name: string; description?: string; badge?: SeasonBadge };
  /** 푸터 노출 정보 — 없으면 푸터 미노출 */
  footer?: { name: string; order: number };
};

export const seasonLinks: SeasonLink[] = [
  // ── 9월 시즌 상단 5종 — 전면 최적화 (운영자 지시 2026-09-02) ──────────────
  // 배열 순서 = 헤더 순서. 10월 초 교체 시 연말정산 2027 허브를 1순위로 올릴 것.
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
    header: { name: "2027 공무원 봉급표 전망", description: "9급~5급 호봉별 내년 예상 월급 미리보기", badge: "SEASON" },
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
  {
    href: "/minimum-wage-2027",
    header: { name: "2027 최저임금 10,700원 확정", description: "+3.7%·월 223.6만원 환산", badge: "HOT" },
    footer: { name: "2027 최저임금 확정", order: 1 },
  },
  {
    href: "/tax-reform-2026",
    header: { name: "2026 세법개정안 (8·3 확정 발표)", description: "발표 내용·직장인 영향 정리", badge: "HOT" },
  },
  {
    href: "/auto-tax-2026",
    header: { name: "6·12월 자동차세 계산기", description: "배기량·차령·연납 5% 공제" },
  },
  {
    href: "/health-insurance-2026",
    header: { name: "건보료 연말정산 (4월 반영)", description: "정산금·분납·환급" },
    footer: { name: "건강보험 2026", order: 10 },
  },
  {
    href: "/year-end-tax-settlement-2026",
    header: { name: "12월 연말정산·성과급", description: "근로자 절세 전략" },
  },
  {
    href: "/credit-card-deduction-2026",
    header: { name: "신용카드 소득공제 계산기", description: "결제수단별 공제율·한도" },
  },
  {
    href: "/rent-tax-credit-2026",
    header: { name: "월세 세액공제 계산기", description: "연 1,000만 한도 최대 170만" },
  },
  {
    href: "/medical-tax-credit-2026",
    header: { name: "의료비 세액공제 계산기", description: "난임 30%·무한도 대상 구분" },
  },
  // R2 (2026-08-31) — 연말정산 공제 4축 완성 + 맞벌이 + 11월 피부양자 시즌
  {
    href: "/donation-tax-credit-2026",
    header: { name: "기부금 세액공제 계산기", description: "정치자금·고향사랑 전액공제·한도", badge: "NEW" },
  },
  {
    href: "/calc/dual-income-year-end",
    header: { name: "맞벌이 연말정산 몰아주기", description: "자녀·의료비 최적 배분 시뮬", badge: "NEW" },
  },
  {
    href: "/health-insurance-dependent",
    header: { name: "건보 피부양자 자격 판정기", description: "11월 재산정 — 탈락 기준 확인", badge: "NEW" },
  },
  {
    href: "/new-employee-salary-2026",
    header: { name: "신입 초봉 TOP 50", description: `회사 ${companyCountKo} 영끌 인덱스` },
    footer: { name: "신입 초봉 TOP 50", order: 7 },
  },
  {
    href: "/minimum-wage-2026",
    header: { name: "최저임금 2026", description: "시급·월급·연봉 환산표" },
  },
  {
    href: "/health-checkup-2026",
    header: { name: "건강검진 2026", description: "대상자·항목·비용·예약" },
  },
  {
    href: "/year-end-tax-checklist",
    header: { name: "연말정산 체크리스트", description: "12.31 마감 점검" },
  },
  {
    href: "/tax-rates-2026",
    header: { name: "2026 세율표", description: "소득세 구간 한눈" },
  },
  {
    href: "/social-insurance-rates-2026",
    header: { name: "2026 4대보험 요율", description: "최신 요율표" },
  },
  {
    href: "/tax-changes-2026",
    header: { name: "2026 세법 변경사항", description: "올해 핵심 변화" },
  },
  {
    href: "/retirement-pension-2026",
    header: { name: "퇴직연금 (DB·DC·IRP)", description: "유형별 비교" },
  },
  {
    href: "/samsung-negotiation-2026",
    header: { name: "삼성 신입 연봉 협상", description: "반도체 대기업 가이드" },
  },
  {
    href: "/calc/samsung-bonus",
    header: { name: "삼성 성과급 시뮬레이터", description: "OPI + TAI 사업부별 분배", badge: "HOT" },
    footer: { name: "삼성 성과급 계산기", order: 3 },
  },
  {
    href: "/calc/sk-hynix-bonus",
    header: { name: "SK하이닉스 PS·PI 계산기", description: "8/25 잠정합의 부결·재협상 중 — 신구 체계 비교", badge: "HOT" },
    footer: { name: "SK하이닉스 성과급 계산기", order: 4 },
  },
  {
    // 현대차 2026 임협 8/31 가결 보도 — 페이지 수치 갱신 전까지 연도·수치 미기재 라벨 (전면 최적화, 운영자 지시 2026-09-02)
    href: "/calc/hyundai-bonus",
    header: { name: "현대차 성과급 계산기", description: "임단협 성과금·격려금·무상주 합산 세후", badge: "HOT" },
  },
  {
    href: "/calc/kia-bonus",
    header: { name: "기아 성과급 계산기", description: "임단협 성과금·격려금·무상주 합산 세후" },
  },
  {
    href: "/calc/lg-energy-bonus",
    header: { name: "LG에너지솔루션 성과급", description: "배터리 사이클별 5가지 시나리오" },
  },
  {
    href: "/calc/hd-hyundai-bonus",
    header: { name: "HD현대중공업 성과급", description: "조선 슈퍼사이클 + 노조 영업이익 30%" },
  },
  {
    href: "/calc/naver-bonus",
    header: { name: "네이버 성과급·RSU", description: "정기 PI + 자사주 RSU 465억" },
  },
  {
    href: "/calc/kakao-bonus",
    header: { name: "카카오 성과급·RSU", description: "RSU 47만주 + 격려금 100만" },
  },
  {
    href: "/calc/celltrion-bonus",
    header: { name: "1월 셀트리온 성과급", description: "연봉의 최대 50% — 1월 선지급" },
  },
  {
    href: "/calc/hyundai-rotem-bonus",
    header: { name: "12월 현대로템 성과급", description: "임단협 450%+1,620만 타결안" },
  },
  // ── 비시즌 항목 — 하단 배치 (전면 최적화, 운영자 지시 2026-09-02). 해당 시즌 진입 시 상단으로 이동.
  {
    // /year-end-tax-2026 은 실제로는 종합소득세(5월 종소세) 페이지 — 표면별 라벨 상이 이력 보존
    href: "/year-end-tax-2026",
    header: { name: "5월 종합소득세 신고", description: "프리랜서·N잡러" },
    footer: { name: "종합소득세 2026", order: 18 },
  },
  {
    href: "/new-employee-2026",
    header: { name: "3월 신입 연봉 협상", description: "첫 협상 가이드" },
  },
  // ── 푸터 전용 (헤더 시즌 드롭다운 미노출) ──────────────────────────
  {
    href: "/calc/bonus-calculators",
    footer: { name: `성과급 계산기 ${bonusCalcCountKo}`, order: 2 },
  },
  { href: "/calc/january-bonus", footer: { name: "13월의 월급", order: 8 } },
  { href: "/calc/year-end-bonus", footer: { name: "성과급 세금", order: 9 } },
  // 2026-08-15 Phase 3 신설 — 1월 검색 폭증 봉급표 + 중도퇴사 연말정산
  { href: "/civil-servant-pay-2026", footer: { name: "공무원 봉급표 2026", order: 11 } },
  { href: "/year-end-tax-mid-resign", footer: { name: "중도퇴사 연말정산", order: 12 } },
  // R2 W3 (2026-08-31) — 8/30 신설 시즌 페이지 링크망 편입 (운영자 승인 R2 실행분).
  // pension-hike는 2027-01 시행 확정 이벤트(12~1월 뉴스 피크) — 헤더+푸터.
  {
    href: "/calc/pension-hike-2027",
    header: { name: "국민연금 인상 계산기 (2027)", description: "요율 9.5→10% — 월급에서 더 빠지는 금액", badge: "NEW" },
    footer: { name: "국민연금 인상 계산기", order: 13 },
  },
  // 봉급표 버티컬 4종 — 헤더는 연봉DB 메뉴(navConfig)에 기노출이라 푸터만.
  { href: "/military-pay-2026", footer: { name: "군인 월급 2026", order: 14 } },
  { href: "/teacher-pay-2026", footer: { name: "교사 호봉표 2026", order: 15 } },
  { href: "/police-pay-2026", footer: { name: "경찰 봉급표 2026", order: 16 } },
  { href: "/firefighter-pay-2026", footer: { name: "소방관 봉급표 2026", order: 17 } },
];

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
