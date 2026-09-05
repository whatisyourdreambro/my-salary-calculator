// src/data/yearEndTaxHub.ts
//
// 연말정산 허브(/year-end-tax-2027)의 단일 소스 — bonusCalcHub.ts 패턴 복제.
// 단계(시기)별 도구·가이드 목록 + 시즌 캘린더 + 뉴스 타임라인.
// ★일정은 국세청 공식 발표만 — 미확정 일정은 "예년 기준"으로 명시 (추정 금지).
// 갱신 체크포인트: 10월 말 홈택스 미리보기 오픈 시 캘린더·뉴스 확정일 반영,
// 1월 초 간소화 오픈일 확정 반영.

export interface YearEndStepEntry {
  href: string;
  title: string;
  desc: string;
  /** calculator | guide | checklist */
  kind: "calculator" | "guide" | "checklist";
}

export interface YearEndStep {
  id: string;
  period: string;
  title: string;
  desc: string;
  entries: YearEndStepEntry[];
}

/** 단계별 실행 로드맵 — 링크는 전부 실존 경로 (내부 404 금지) */
export const YEAR_END_STEPS: YearEndStep[] = [
  {
    id: "preview",
    period: "지금 ~ 11월",
    title: "미리보기로 환급 전망 파악",
    desc: "홈택스 미리보기(예년 기준 10월 말 오픈) 전에도 예상 환급액을 계산해 남은 기간의 절세 전략을 세울 수 있습니다.",
    entries: [
      { href: "/year-end-tax", title: "연말정산 계산기", desc: "예상 환급·추가납부 즉시 계산 + 절세 시뮬레이터", kind: "calculator" },
      { href: "/year-end-tax-preview", title: "홈택스 미리보기 이용법", desc: "오픈 시점·이용 절차·확인 포인트", kind: "guide" },
      { href: "/guides/hometax-year-end-preview-2026", title: "미리보기 200% 활용 가이드", desc: "미리보기 숫자 읽는 법", kind: "guide" },
    ],
  },
  {
    id: "december",
    period: "~ 12월 31일",
    title: "공제 지출 마감 전 액션",
    desc: "연금저축·IRP 납입, 카드 사용액 조절, 기부금 등 12월 31일까지의 지출만 올해 귀속 공제에 들어갑니다.",
    entries: [
      { href: "/year-end-tax-checklist", title: "연말정산 체크리스트", desc: "마감 전 점검 40+ 항목", kind: "checklist" },
      { href: "/year-end-tax-settlement-2026", title: "12월 시즌 가이드", desc: "성과급 절세·막판 전략", kind: "guide" },
      { href: "/credit-card-deduction-2026", title: "신용카드 공제 계산기", desc: "12월에 어떤 카드를 쓸지 판단", kind: "calculator" },
      { href: "/rent-tax-credit-2026", title: "월세 세액공제 계산기", desc: "요건 판정 + 환급액 계산", kind: "calculator" },
    ],
  },
  {
    id: "january",
    period: "1월",
    title: "간소화 자료 확인·회사 제출",
    desc: "간소화 서비스(예년 기준 1월 중순 오픈)에서 자료를 확인하고, 누락분은 영수증을 직접 챙겨 회사에 제출합니다.",
    entries: [
      { href: "/medical-tax-credit-2026", title: "의료비 세액공제 계산기", desc: "3% 문턱 넘는지 먼저 확인", kind: "calculator" },
      // 2026-09-05 L14' — /year-end-tax 중복 등재(preview 단계와 중복)를 R2 판정기로 치환 (항목 수 불변)
      { href: "/calc/dependent-check", title: "부양가족 인적공제 판정기", desc: "회사 제출 전 부모님·자녀 기본공제 가능 여부 판정", kind: "calculator" },
      { href: "/calc/year-end-bonus-tax", title: "연말 상여금 세금 계산기", desc: "12~1월 상여금 세후 확인", kind: "calculator" },
    ],
  },
  {
    id: "refund",
    period: "2월 ~ 3월",
    title: "환급 확인",
    desc: "정산 결과는 보통 2월 급여에 반영됩니다(회사별 상이). 명세서의 연말정산 항목으로 환급·추가납부를 확인하세요.",
    entries: [
      { href: "/table/2026/monthly", title: "월급 실수령액표", desc: "환급 반영된 2월 월급 확인", kind: "calculator" },
      { href: "/guides/year-end-tax-refund-secrets-2026", title: "환급 더 받는 비법", desc: "놓치기 쉬운 공제 총정리", kind: "guide" },
      { href: "/guides/tax-refund-mistakes-2026", title: "환급 실수 사례", desc: "잘못 신고하면 가산세 — 주의 목록", kind: "guide" },
    ],
  },
  {
    id: "missed",
    period: "놓쳤다면",
    title: "중도퇴사·누락 공제 구제",
    desc: "퇴사·이직으로 정산을 못 했거나 공제를 빠뜨렸다면 5월 종합소득세 신고(또는 경정청구)로 돌려받을 수 있습니다.",
    entries: [
      { href: "/year-end-tax-mid-resign", title: "중도퇴사 연말정산", desc: "퇴사·이직자 환급 방법 총정리", kind: "guide" },
      { href: "/year-end-tax-2026", title: "5월 종합소득세 신고", desc: "프리랜서·N잡러·누락 공제 신고", kind: "guide" },
      { href: "/income-tax-2026", title: "종합소득세 계산기", desc: "누진세율 즉시 산출", kind: "calculator" },
    ],
  },
];

export interface YearEndCalendarRow {
  period: string;
  event: string;
  note: string;
}

/** 시즌 캘린더 — 확정 일정은 국세청 발표 기준, 미확정은 "예년 기준" 명시 */
export const YEAR_END_CALENDAR: YearEndCalendarRow[] = [
  { period: "10월 말~11월 (예년 기준)", event: "홈택스 '연말정산 미리보기' 오픈", note: "1~9월 카드 사용액 기반 예상 세액 확인 — 남은 기간 전략 수립" },
  { period: "12월 31일", event: "공제 대상 지출 마감", note: "연금저축·IRP·기부금·카드 사용액 등 올해 귀속 공제의 기준일" },
  { period: "1월 중순 (예년 기준 1/15 전후)", event: "간소화 서비스 오픈", note: "국세청이 수집한 공제 자료 일괄 확인" },
  { period: "1월 말~2월 초", event: "회사 서류 제출", note: "회사별 마감일 상이 — 누락 영수증(월세·안경 등)은 직접 제출" },
  { period: "2월 급여일", event: "환급·추가납부 반영", note: "회사별로 2~3월 급여에 반영 (분납 신청 가능)" },
  { period: "3월 10일", event: "회사 원천세 신고 마감", note: "지급명세서 제출 기한 — 근로자 액션 없음" },
  { period: "5월", event: "종합소득세 신고·경정청구", note: "누락 공제 구제, 중도퇴사자·프리랜서 신고 기간" },
];

export interface YearEndNewsRow {
  date: string;
  text: string;
}

/** 뉴스·변경사항 타임라인 — 확정 사실만 (갱신: 10월 말·12월·1월) */
export const YEAR_END_NEWS: YearEndNewsRow[] = [
  { date: "2026-01", text: "2026년 귀속부터 신용카드 기본공제 한도가 자녀 수(최대 2명분)에 따라 상향 적용" },
  { date: "2026-01", text: "출산·보육수당 비과세 한도 자녀 1인당 월 20만원 적용" },
  { date: "2026-08", text: "2026 세제개편안 발표 — 국회 통과 시 2027년 소득분부터 적용(올해 정산 무관)" },
];
