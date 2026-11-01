// src/data/yearEndTaxHub.ts
//
// 연말정산 허브(/year-end-tax-2027)의 단일 소스 — bonusCalcHub.ts 패턴 복제.
// 단계(시기)별 도구·가이드 목록 + 시즌 캘린더 + 뉴스 타임라인.
// ★일정은 국세청 공식 발표만 — 미확정 일정은 "예년 기준"으로 명시 (추정 금지).
// 갱신 체크포인트: 10월 말 홈택스 미리보기 오픈 시 캘린더·뉴스 확정일 반영,
// 1월 초 간소화 오픈일 확정 반영.

import { formatManwonKorean } from "@/lib/manwonFormat";
import { MARRIAGE_CREDIT_2026 } from "@/lib/taxConstants2026";
import { MARRIAGE_CREDIT_WINDOW } from "@/lib/yearEndLimits2026";

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
    desc: "홈택스 미리보기(예년 기준 10월 말 이후) 전에도 예상 환급액을 계산해 남은 기간의 절세 전략을 세울 수 있습니다.",
    entries: [
      { href: "/year-end-tax", title: "연말정산 계산기", desc: "예상 환급·추가납부 즉시 계산 + 절세 시뮬레이터", kind: "calculator" },
      { href: "/year-end-tax-preview", title: "홈택스 미리보기 이용법", desc: "오픈 시점·이용 절차·확인 포인트", kind: "guide" },
      { href: "/guides/hometax-year-end-preview-2026", title: "미리보기 100% 활용 가이드", desc: "미리보기 숫자 읽는 법", kind: "guide" },
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

/**
 * 뉴스·변경사항 타임라인 — 확정 사실만 (갱신: 10월 말·12월·1월)
 * ★행 수 고정 — 새 소식은 가장 오래된 행과 폭 맞춰 교체(CalcResultAd 와 InArticleAd 사이 광고 위 목록,
 *   seasonAboveAdListGuard.test.ts 가 3행 고정). 행 수를 바꿔야 하면 실측 스윕으로 광고 위 높이 불변을 먼저 증명한다.
 */
export const YEAR_END_NEWS: YearEndNewsRow[] = [
  { date: "2026-01", text: "2026년 귀속부터 신용카드 기본공제 한도가 자녀 수(최대 2명분)에 따라 상향 적용" },
  { date: "2026-01", text: "보육수당 비과세 한도 자녀 1인당 월 20만원 적용" },
  { date: "2026-08", text: "2026 세제개편안 발표 — 국회 통과 시 2027년 소득분부터 적용(올해 정산 무관)" },
];

/**
 * 허브 맨 끝(마지막 광고 MultiplexAd·RelatedCalculators 아래) '연말정산 시즌 도구 더 보기' — TS-08 2026-09-29 작성,
 * 2026-11-01 B30 이식. RelatedCalculators(limit 4)가 yearEnd 앞 4개만 보여 빠져 있던 시즌 도구. 라벨은 각 페이지 실제 이름.
 */
export const YEAR_END_MORE_TOOLS: YearEndStepEntry[] = [
  { href: "/donation-tax-credit-2026", title: "기부금 세액공제 계산기", desc: "고향사랑·정치자금 구간별 공제", kind: "calculator" },
  { href: "/calc/dual-income-year-end", title: "맞벌이 연말정산 몰아주기 계산기", desc: "부부 중 누가 공제받을지 비교", kind: "calculator" },
  { href: "/calc/child-deduction", title: "자녀 인적공제·세액공제 계산기", desc: "자녀 수·나이별 공제 계산", kind: "calculator" },
  { href: "/calc/january-bonus", title: "13월의 월급 시뮬레이터", desc: "환급 예상액 미리 보기", kind: "calculator" },
  { href: "/tools/finance/irp", title: "IRP·연금저축 세액공제 계산기", desc: "12월 31일 납입분까지 공제", kind: "calculator" },
  { href: "/calc/smb-income-tax-break", title: "중소기업 취업자 소득세 감면 계산기", desc: "청년 90%·감면 한도 반영", kind: "calculator" },
  { href: "/tax-reform-2026", title: "2026 세법개정안 총정리", desc: "2027년 귀속부터 달라지는 공제", kind: "guide" },
];

export interface YearEndReformRow {
  item: string;
  /** 현행(2026년 귀속까지) */
  now: string;
  /** 정부안(국회 통과 시) */
  plan: string;
}

/**
 * 2026 세제개편안 정부안 — 허브(/year-end-tax-2027) 마지막 광고(MultiplexAd) 아래 날짜 박힌 블록
 * (SEASON-05 2026-09-26 작성, 2026-11-01 B30 이식·재확인).
 * 출처(2026-11-01 원문 재확인): 재정경제부 「2026년 세제개편안」 상세본(2026-08-03 발표, mofe.go.kr 보도자료
 * MOSF_000000000078809 첨부) — 조특법 §126의2(대중교통 추가공제 적용 종료·추가공제 한도 200/100만원·도서공연 총급여 요건 삭제)·
 * §95의2(월세 한도 1,200만원·청년 15~34세 17%)·§92(혼인세액공제 적용기한 종료, 재정지출 전환), 소득법 §50①(소득금액 300만원·
 * 총급여 750만원) 항목의 현행/개정안 표와 적용시기(카드·기본공제 '27.1.1. 이후 개시 과세기간분, 월세 '27.1.1. 이후 지급분).
 * 「2026년 세제개편안 정부안 확정」(2026-09-01 국무회의 의결, MOSF_000000000079193 첨부 — 9/3 까지 국회 제출, 정기국회 심사)
 * 첨부 수정사항 7건(ISA·생산적금융 ISA·종부세 기본공제·세부담 상한·지방이전 환류기간·인적용역 원천징수세율 인하 대상·
 * 도시철도 건설용역 영세율 경과조치)은 모두 아래 항목과 무관(2026-11-01 B30 리뷰에서 첨부 원문 대조).
 * ★국회 통과 전 제안이다 — 확정 사실(YEAR_END_NEWS)과 섞지 않는다. statusCheckedOn 은 '국회 의결 전'을 확인한 날.
 *   국회 의결(예산부수법안, 12월 초 예상) 뒤에는 통과안으로 label·화면 문단·행을 다시 쓰고 statusCheckedOn 을 바꾼다
 *   (정밀 계산기 날짜 FAQ 와 /year-end-tax 혼인 FAQ 의 '정부안' 문장도 같은 날 함께).
 */
export const YEAR_END_REFORM_2027: {
  label: string;
  announced: string;
  confirmed: string;
  /** 국회 의결 전임을 확인한 날 (YYYY-MM-DD, 화면에 날짜로 표기) */
  statusCheckedOn: string;
  rows: YearEndReformRow[];
} = {
  label: "정부안 — 국회 통과 시 2027년 귀속부터",
  announced: "2026-08-03",
  confirmed: "2026-09-01",
  statusCheckedOn: "2026-11-01",
  rows: [
    {
      item: "신용카드 대중교통 사용분",
      now: "40% 추가공제",
      plan: "추가공제 폐지, 결제수단별 기본공제(신용 15%·체크 30%)로 일원화",
    },
    {
      item: "신용카드 추가공제 한도",
      now: "총급여 7천만원 이하 300만원·초과 200만원",
      plan: "200만원·100만원(100만원씩 하향), 도서·공연 등 30% 공제는 총급여 요건 폐지",
    },
    {
      item: "월세 세액공제",
      now: "월세 연 1,000만원 한도, 15%(총급여 5,500만원 이하 17%)",
      plan: "월세 연 1,200만원 한도, 청년(15~34세)은 17%",
    },
    {
      item: "부양가족 기본공제 소득요건",
      now: "연 소득금액 100만원(근로소득만 있으면 총급여 500만원) 이하",
      plan: "300만원(총급여 750만원) 이하",
    },
    {
      item: "혼인세액공제",
      // 기간·금액은 정본 상수에서 — 조특법 §92①·부칙(법률 제20617호) 제14조: 2024-01-01~2026-12-31 혼인신고분
      now: `${MARRIAGE_CREDIT_WINDOW} 혼인신고한 해에 1명당 ${formatManwonKorean(MARRIAGE_CREDIT_2026.AMOUNT / 10_000)}(생애 1회)`,
      plan: "적용기한 연장 없이 종료, 재정지원으로 전환",
    },
  ],
};
