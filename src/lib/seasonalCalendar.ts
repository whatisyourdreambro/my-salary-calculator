// src/lib/seasonalCalendar.ts
//
// 홈 시즌 배너(src/components/SeasonalBanner.tsx)의 캘린더 데이터 + 선택 로직.
// 2026-09-05 L13a: 컴포넌트에서 분리 — jsdom 없이 vitest 로 날짜별 기대 href 를
// 검증하기 위한 순수 함수 모듈 (src/lib/__tests__/seasonalBanner.test.ts).
// 마크업·배너 위치(HomeClient HomeTopAd 아래·CalculatorTabs 위)는 컴포넌트에 그대로.
//
// ★ 선택 규칙: find() 첫 매치. 같은 달에 여러 항목이 있으면 days 범위가 있는 항목을
//   범위 없는(월 전체) 항목보다 앞에 둘 것 — 뒤에 두면 영원히 잡히지 않는다.
//   (테스트가 이 순서 불변식과 "연중 공백 없음"을 검사한다)
// ★ 성과급 슬롯: 1월 OPI(20~31)만 게이트 항목으로 존재(2026-09-05 L13b 선행분 ④) —
//   getCurrentSeasonal(now, { opiAnnounced: true }) 일 때만 열리고, 기본(false)이면 find()가
//   카드공제 항목으로 자연 폴스루. 발표값 정본은 src/data/opiAnnouncement.ts (발표 전 null 강제).
//   12/15~31 TAI H2·2월 SK PS 슬롯은 아직 없다 — 데이터 non-null 게이트와 함께 L13b 에서 추가.

/** 캘린더 항목이 열리기 위해 필요한 외부 발표 게이트 — 호출부가 인자로 주입 */
export interface SeasonalGates {
  /** 삼성전자 OPI 발표 확인 여부 (src/data/opiAnnouncement.ts announced) — 기본 false */
  opiAnnounced?: boolean;
}

export interface SeasonalContent {
  month: number[];
  /** 같은 달 안에서 노출 기간을 좁힐 때 (예: 성과급 지급 주간) */
  days?: { from: number; to: number };
  /** 발표 게이트 — 지정 시 해당 게이트가 true 로 주입될 때만 매치 (발표 전 추정 카피 금지) */
  requires?: keyof SeasonalGates;
  title: string;
  subtitle: string;
  href: string;
  cta: string;
  deadline?: { month: number; day: number };
}

export const SEASONAL_CALENDAR: SeasonalContent[] = [
  {
    month: [4, 5],
    title: "5월 종합소득세 신고",
    subtitle: "프리랜서·N잡러는 5/31까지 꼭 신고해야 환급 가능",
    href: "/year-end-tax-2026",
    cta: "신고 가이드 보기",
    deadline: { month: 5, day: 31 },
  },
  // 6월 자동차세 1기분 — 납부기간 6/16~30, 기한 6/30 (지방세법 제128조).
  // 이전의 "7/31 납부·deadline 7/31"은 재산세 1기 기한과 혼동한 오류였음
  // (2026-07-13 사실검증 감사에서 정정 — 잘못된 D-day가 납부 지연·가산세 유발 위험)
  {
    month: [6],
    title: "6월 자동차세 1기분 납부",
    subtitle: "6/16~30 납부 (기한 6/30). 배기량·차령별 정확한 금액 미리 확인",
    href: "/auto-tax-2026",
    cta: "자동차세 계산",
    deadline: { month: 6, day: 30 },
  },
  // 2026-07-06 감사: 7월 양대 실검색 이벤트로 교체 — TAI 지급 주간(7/8) 우선,
  // 이후 재산세 1기(7/16~31). 기존 "7월 건강보험료 정산" 항목은 사실관계가
  // 어긋나(직장가입자 연말정산 반영은 4월) 제거.
  {
    month: [7],
    days: { from: 1, to: 12 },
    title: "삼성전자 TAI 지급일 7/8",
    subtitle: "2026 상반기 사업부별 지급률 확정 — 내 세후 실수령액 바로 확인",
    href: "/calc/samsung-bonus",
    cta: "TAI 계산하기",
  },
  // TAI 지급(7/8) 후에도 명세서 확인·세금 검색 수요가 1~2주 이어짐 —
  // 재산세 납부 개시(7/16) 전날까지 후속 배너로 시즌 트래픽 연장
  {
    month: [7],
    days: { from: 13, to: 15 },
    title: "삼성전자 TAI 지급 완료 — 내 실수령 맞았나?",
    subtitle: "명세서와 비교 — 사업부별 지급률·세후 실수령 확인",
    href: "/calc/samsung-bonus",
    cta: "TAI 세후 확인",
  },
  // SK하이닉스 상반기 PI — 최근 2년 7월 하순 공지(2024 7/25, 2025 7/23) 패턴.
  // 발표 예상 주간(7/20~28)에만 재산세보다 우선 노출 — 발표 당일 검색 폭증 대비.
  // 확정 지급률은 스케줄 작업(sk-hynix-pi-announcement-watch)이 발표 확인 후 반영.
  {
    month: [7],
    days: { from: 20, to: 28 },
    title: "SK하이닉스 상반기 PI 발표 임박",
    subtitle: "최근 2년 연속 최대치 150% — 발표 전에 내 예상 세후 수령액 미리 계산",
    href: "/calc/sk-hynix-bonus",
    cta: "PI 계산하기",
  },
  {
    month: [7],
    title: "7월 재산세 1기 납부 (주택분 50%)",
    subtitle: "7/16~31 납부 — 공시가별 재산세·종부세 부담 미리 점검",
    href: "/property-holding-tax-2026",
    cta: "보유세 계산",
    deadline: { month: 7, day: 31 },
  },
  // 추석(2026-09-25, 연휴 9/24~26) — 상여금·명절휴가비 검색은 8월 말~9월 중순이
  // 피크. 2026-08-17 감사에서 추석 항목 부재 적발 — 재산세 2차보다 우선 노출.
  // days가 단일 범위라 8월분·9월분 두 항목으로 분리 (find()는 첫 매치 우선).
  {
    month: [8],
    days: { from: 16, to: 31 },
    title: "추석 상여금, 우리 회사는 얼마 줄까?",
    subtitle: "명절휴가비·상여금 평균 지급액과 세후 실수령 — 추석 전에 미리 확인",
    href: "/chuseok-bonus-2026",
    cta: "추석 상여금 확인",
    deadline: { month: 9, day: 25 },
  },
  {
    month: [9],
    days: { from: 1, to: 26 },
    title: "추석 상여금, 우리 회사는 얼마 줄까?",
    subtitle: "명절휴가비·상여금 평균 지급액과 세후 실수령 — 연휴 전 미리 확인",
    href: "/chuseok-bonus-2026",
    cta: "추석 상여금 확인",
    deadline: { month: 9, day: 25 },
  },
  // 8차 점검에서 추가 — 9월 부동산 재산세 2차 (추석 항목이 안 잡는 8/1~15와
  // 9/27~30 납부 마감 직전 구간을 커버 — 마감 구간엔 D-day가 긴급 배지로 전환)
  {
    month: [8, 9],
    title: "9월 부동산 재산세 2차",
    subtitle: "주택분 50% + 토지분 9/16~30 납부. 공시가별 부담 미리 점검",
    href: "/property-holding-tax-2026",
    cta: "보유세 계산",
    deadline: { month: 9, day: 30 },
  },
  // 10월 연말정산 예열 — 홈택스 미리보기 (2026-09-05 L13a, 10월 공백 해소).
  // ★ 국세청 미리보기 오픈일 미확인 → 날짜·카운트다운·deadline 삽입 금지
  //   (테스트가 날짜 패턴을 검사). 오픈일 확정 보도 후 별도 커밋에서만 카피 보강.
  {
    month: [10],
    title: "연말정산 미리보기 — 예상 환급액 먼저 점검",
    subtitle: "홈택스 미리보기로 올해 카드 공제·예상 세액 확인, 남은 기간 절세 전략 세우기",
    href: "/year-end-tax-preview",
    cta: "미리보기 이용법",
  },
  // 1월 삼성전자 OPI 발표 슬롯(1/20~31) — 2026-09-05 L13b 선행분 ④. 카드공제(15~31) 항목보다
  // 앞에 두되 requires 게이트로 잠금: getCurrentSeasonal 의 opiAnnounced 가 true 일 때만 매치.
  // ★ 발표 전 추정 수치·날짜 카피 금지(테스트가 숫자 패턴을 검사). 2/1~5 연장은 별도 결정.
  //   1월 홈 배너 1순위 = OPI(카드공제보다 우선)는 운영자 확인 항목 — 미확인 시 게이트를 열지 말 것.
  {
    month: [1],
    days: { from: 20, to: 31 },
    requires: "opiAnnounced",
    title: "삼성전자 OPI 발표 — 내 세후 실수령은?",
    subtitle: "사업부별 지급률 확정 — 지급률 입력하면 세후 실수령액 바로 계산",
    href: "/calc/samsung-bonus",
    cta: "OPI 계산하기",
  },
  // 연말정산 공제 항목별 계산기 3종(신용카드·의료비·월세) — 2026-08 클러스터 편입.
  // 11~12월과 1월 초는 아래 "2027 연말정산 허브"(D-12/31 카운트다운)가 그대로 우선.
  // 간소화 서비스가 열리는 1월 중순부터 회사 제출·정산 마무리기인 2월 중순까지 노출하고,
  // 2/16부터는 기존 "3월 신입 연봉 협상" 항목이 이어받음 (기존 항목 무변경).
  {
    month: [1],
    days: { from: 15, to: 31 },
    title: "연말정산 간소화 오픈 — 공제액 막판 점검",
    subtitle: "신용카드 소득공제·의료비·월세 세액공제, 항목별 예상 공제액 즉시 계산",
    href: "/credit-card-deduction-2026",
    cta: "카드공제 계산",
  },
  {
    month: [2],
    days: { from: 1, to: 15 },
    title: "연말정산 마무리 — 의료비·월세 공제 확인",
    subtitle: "실손 차감 의료비 공제와 최대 170만원 월세 세액공제, 놓친 항목 최종 점검",
    href: "/medical-tax-credit-2026",
    cta: "의료비 공제 계산",
  },
  // 11~1월: 2027 연말정산(2026년 귀속) 허브 — 2026-09-05 L13a 에서
  // /year-end-tax-settlement-2026 → /year-end-tax-2027 허브로 교체 (연도 프레임 통일).
  {
    month: [11, 12, 1],
    title: "2027 연말정산(2026년 귀속) 총정리",
    subtitle: "일정·계산기·단계별 로드맵 — 13월의 월급 극대화하는 점검 항목 한눈에",
    href: "/year-end-tax-2027",
    cta: "연말정산 허브 보기",
    deadline: { month: 12, day: 31 },
  },
  {
    month: [2, 3],
    title: "3월 신입 연봉 협상",
    subtitle: "직군별 평균 초봉과 ±10% 협상법",
    href: "/new-employee-2026",
    cta: "협상 가이드 보기",
  },
];

/**
 * deadline 까지 남은 일수 (당일 23:59:59 기준). 지난 마감이면 null — 배지를 그리지 않는다.
 * 캘린더의 모든 deadline 은 그 항목의 노출 창(최대 3개월) 끝 달에 있으므로, 마감 달이 현재 달보다
 * 6개월 이상 뒤면 "해를 넘긴 창의 작년 마감"(예: 1월 초에 보는 12/31)으로 본다.
 * 이전 구현은 이 경우 다음 해 마감으로 계산해 1/1~1/14 에 D-365, 마감 다음날(9/26)에 D-0 긴급 배지가
 * 찍혔다(2026-09-05 리뷰 발견). now 주입은 테스트용.
 */
export function getDaysLeft(
  deadline: { month: number; day: number },
  now: Date = new Date()
): number | null {
  const nowMonth = now.getMonth() + 1;
  const year =
    deadline.month - nowMonth >= 6 ? now.getFullYear() - 1 : now.getFullYear();
  const target = new Date(year, deadline.month - 1, deadline.day, 23, 59, 59);
  const diff = target.getTime() - now.getTime();
  if (diff < 0) return null;
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

/**
 * now 기준 첫 매치 항목 (없으면 null). now 주입은 테스트용 — 기본값은 현재 시각.
 * gates: 발표 게이트 주입(선택). requires 가 있는 항목은 해당 게이트가 true 일 때만 매치되고,
 * 기본(미주입·false)이면 건너뛰어 다음 항목으로 폴스루한다 — 순수 함수 유지(호출부가 값을 넘김).
 */
export function getCurrentSeasonal(
  now: Date = new Date(),
  gates: SeasonalGates = {}
): SeasonalContent | null {
  const month = now.getMonth() + 1;
  const day = now.getDate();
  return (
    SEASONAL_CALENDAR.find(
      (s) =>
        s.month.includes(month) &&
        (!s.days || (day >= s.days.from && day <= s.days.to)) &&
        (!s.requires || gates[s.requires] === true)
    ) || null
  );
}
