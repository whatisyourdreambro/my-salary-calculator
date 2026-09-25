// src/lib/yearEndLimits2026.ts
//
// /year-end-tax '2026년 귀속 연말정산 주요 공제 한도' 표와 한도 FAQ 데이터 (2026-09-25).
// 수치는 전부 정본 상수에서 문자열을 만든다 — 계산 엔진·정밀 계산기와 표가 어긋나지 않게:
//   신용카드   → cardDeduction2026 (CARD_RATES_2026·cardBaseLimit·CARD_EXTRA_LIMIT_2026)
//   연금계좌·월세·의료비·교육비 → taxConstants2026
//   기부금     → donationCredit (DONATION_CREDIT_2026)
// 근거 조문(국가법령정보센터 현행 조문, 2026-09-25 확인):
//   소득세법 §59의3(연금계좌)·§59의4(의료비·교육비·기부금) — 2026-01-01 시행 법률 제21221호
//   조세특례제한법 §126의2(신용카드, ⑩ 자녀 한도 2025-12-23 개정·⑪ 추가공제)·§95의2(월세, ② 배우자
//   추가 적용 2025-12-23 신설)·§58(고향사랑, 10만원 초과 20만원 이하 40% 2025-12-23 개정)·§76(정치자금)
// 기부금 행 구간별 공제율(2026-09-25 조문 대조): 소득세법 §59의4④ 특례·일반 합산 15%·1천만원 초과분 30%
//   (2024년 기부분 한정 3천만원 초과분 추가 10%는 ⑧ 한시 규정 — 2026년 미적용), 조특법 §76① 정치자금
//   10만원까지 100/110·초과분 15%·3천만원 초과분 25%, §58①1~3호 고향사랑 10만원까지 100/110·10만원 초과
//   20만원 이하 40%·20만원 초과 2천만원 이하 15%(특별재난지역 선포 지자체 기부 30%) — 부칙 제13조 2026-01-01 기부분부터.
// ★2027년 귀속 전환(YEAR_END_SEASON 교체, 12/15) 때 이 표는 2026년 귀속 값이다 — 2027 세법 개정
//   (2026-08-03 세제개편안: 대중교통 우대공제 폐지·추가공제 한도 하향 등) 확정 후 별도 갱신할 것.
// FAQ 문구는 화면과 FAQPage JSON-LD 가 같은 배열을 쓴다 (page.tsx faqLd).

import {
  CARD_EXTRA_LIMIT_2026,
  CARD_RATES_2026,
  CARD_SALARY_THRESHOLD,
  cardBaseLimit,
} from "@/lib/cardDeduction2026";
import { DONATION_CREDIT_2026 } from "@/lib/donationCredit";
import { formatManwonKorean } from "@/lib/manwonFormat";
import {
  EDUCATION_CREDIT_2026,
  INSURANCE_RATES_2026,
  MEDICAL_CREDIT_2026,
  PENSION_ACCOUNT_CREDIT_2026,
  RENT_CREDIT_2026,
} from "@/lib/taxConstants2026";

/** 원 → "300만원" / "1,000만원" */
const man = (won: number) => formatManwonKorean(won / 10_000);
/** 0.15 → "15%", 0.165 → "16.5%" */
const pct = (rate: number) => `${Number((rate * 100).toFixed(1))}%`;
/** 소득세 공제율 → 지방소득세(소득세의 10%) 포함 체감 공제율 */
const withLocal = (rate: number) => pct(rate * (1 + INSURANCE_RATES_2026.LOCAL_INCOME_TAX_RATIO));

const R = CARD_RATES_2026;
const CARD_7K = man(CARD_SALARY_THRESHOLD); // "7,000만원"
const P = PENSION_ACCOUNT_CREDIT_2026;
const M = MEDICAL_CREDIT_2026;
const E = EDUCATION_CREDIT_2026;
const D = DONATION_CREDIT_2026;

export interface YearEndLimitRow {
  /** 항목명 */
  item: string;
  /** 근거 조문 */
  basis: string;
  /** 공제율 */
  rate: string;
  /** 한도·요건 */
  limit: string;
}

export const YEAR_END_LIMIT_ROWS: readonly YearEndLimitRow[] = [
  {
    item: "신용카드 등 소득공제",
    basis: "조세특례제한법 제126조의2",
    rate: `총급여 25% 초과 사용분에 신용카드 ${pct(R.CREDIT)} · 체크카드·현금영수증 ${pct(R.CHECK_CASH)} · 전통시장·대중교통 ${pct(R.TRADITIONAL)} · 도서·공연·체육시설 등 문화체육 ${pct(R.CULTURE)}(총급여 ${CARD_7K} 이하)`,
    limit: `기본 ${man(cardBaseLimit(true, 0))}(총급여 ${CARD_7K} 초과 ${man(cardBaseLimit(false, 0))}) · 자녀 1명 ${man(cardBaseLimit(true, 1))}(${man(cardBaseLimit(false, 1))}) · 자녀 2명 이상 ${man(cardBaseLimit(true, 2))}(${man(cardBaseLimit(false, 2))})`,
  },
  {
    item: "신용카드 추가 한도",
    basis: "조세특례제한법 제126조의2 제11항",
    rate: `기본 한도를 넘는 공제액 중 전통시장·대중교통 사용분(총급여 ${CARD_7K} 이하는 문화체육 포함)`,
    limit: `추가 ${man(CARD_EXTRA_LIMIT_2026.LOW_SALARY)}(총급여 ${CARD_7K} 초과 ${man(CARD_EXTRA_LIMIT_2026.HIGH_SALARY)})`,
  },
  {
    item: "연금저축·IRP 세액공제",
    basis: "소득세법 제59조의3",
    rate: `총급여 ${man(P.SALARY_15_MAX)} 이하 ${pct(P.RATE_HIGH)} · 초과 ${pct(P.RATE_LOW)} (지방소득세 포함 ${withLocal(P.RATE_HIGH)} · ${withLocal(P.RATE_LOW)})`,
    limit: `연금저축 ${man(P.SAVINGS_CAP)} · IRP 합산 ${man(P.TOTAL_CAP)} (ISA 만기 전환액의 ${pct(P.ISA_TRANSFER_RATIO)}, 최대 ${man(P.ISA_TRANSFER_CAP)} 추가)`,
  },
  {
    item: "월세 세액공제",
    basis: "조세특례제한법 제95조의2",
    rate: `총급여 ${man(RENT_CREDIT_2026.SALARY_17_MAX)} 이하 ${pct(RENT_CREDIT_2026.RATE_HIGH)} · ${man(RENT_CREDIT_2026.SALARY_CAP)} 이하 ${pct(RENT_CREDIT_2026.RATE_LOW)}`,
    limit: `월세 연 ${man(RENT_CREDIT_2026.CAP)}(최대 ${man(RENT_CREDIT_2026.CAP * RENT_CREDIT_2026.RATE_HIGH)} 공제) · 무주택 세대주, 총급여 ${man(RENT_CREDIT_2026.SALARY_CAP)} 이하`,
  },
  {
    item: "의료비 세액공제",
    basis: "소득세법 제59조의4 제2항",
    rate: `총급여 ${pct(M.THRESHOLD_RATIO)} 초과분의 ${pct(M.RATE)} (미숙아·선천성이상아 ${pct(M.PREMATURE_RATE)} · 난임시술비 ${pct(M.INFERTILITY_RATE)})`,
    limit: `부양가족 연 ${man(M.DEPENDENT_CAP)} · 본인·6세 이하·65세 이상·장애인 등 한도 없음 · 산후조리원 출산 1회 ${man(M.POSTPARTUM_CAP)}`,
  },
  {
    item: "교육비 세액공제",
    basis: "소득세법 제59조의4 제3항",
    rate: pct(E.RATE),
    limit: `취학 전·초중고 1명당 ${man(E.SCHOOL_CAP)}(2026년부터 초등 2학년 이하 예체능 학원비 포함) · 대학생 ${man(E.UNIVERSITY_CAP)} · 본인·장애인 특수교육비 한도 없음`,
  },
  {
    item: "기부금 세액공제",
    basis: "소득세법 제59조의4 제4항 · 조세특례제한법 제58조·제76조",
    rate: `특례·일반 ${man(D.GENERAL_HIGH_THRESHOLD)} 이하 ${pct(D.GENERAL_RATE_LOW)} · 초과분 ${pct(D.GENERAL_RATE_HIGH)} / 정치자금 ${man(D.FULL_CREDIT_LIMIT)}까지 100/110 · 초과분 ${pct(D.POLITICAL_RATE)}(${man(D.POLITICAL_HIGH_THRESHOLD)} 초과분 ${pct(D.POLITICAL_RATE_HIGH)}) / 고향사랑 ${man(D.FULL_CREDIT_LIMIT)}까지 100/110 · ${man(D.FULL_CREDIT_LIMIT)} 초과 ${man(D.HOMETOWN_MID_UPPER)} 이하 ${pct(D.HOMETOWN_RATE_MID)}(지방소득세 포함 ${withLocal(D.HOMETOWN_RATE_MID)}) · ${man(D.HOMETOWN_MID_UPPER)} 초과분 ${pct(D.HOMETOWN_RATE)}(특별재난지역 ${pct(D.HOMETOWN_RATE_DISASTER)})`,
    limit: `일반기부금 근로소득금액의 ${pct(D.LIMIT_GENERAL_RATIO)}(종교단체 ${pct(D.LIMIT_RELIGIOUS_RATIO)}) · 고향사랑 연 ${man(D.HOMETOWN_CAP)}까지`,
  },
];

export const YEAR_END_LIMITS_SOURCE_NOTE =
  "근거: 국가법령정보센터 소득세법 제59조의3·제59조의4(2026. 1. 1. 시행)와 조세특례제한법 제58조·제76조·제95조의2·제126조의2 현행 조문, 국세청 근로자를 위한 연말정산 안내. 2026년 8월 발표된 세제개편안(대중교통 우대공제 폐지 등)은 국회를 통과해야 2027년 귀속부터 적용되므로 반영하지 않았습니다. 기준일 2026-09-25.";

export interface YearEndLimitFaq {
  question: string;
  answer: string;
}

const EXAMPLE_SALARY = 50_000_000;

export const YEAR_END_LIMIT_FAQS: readonly YearEndLimitFaq[] = [
  {
    question: "신용카드 공제 한도를 다 채우면 전통시장·대중교통 사용분은 공제를 못 받나요?",
    answer: `아닙니다. 기본 한도(총급여 ${CARD_7K} 이하 ${man(cardBaseLimit(true, 0))}·초과 ${man(cardBaseLimit(false, 0))}, 자녀 2명 이상이면 ${man(cardBaseLimit(true, 2))}·${man(cardBaseLimit(false, 2))})를 넘는 공제액이 있으면 전통시장·대중교통 사용분 공제액(총급여 ${CARD_7K} 이하는 도서·공연·영화·체육시설 등 문화체육 사용분 포함)에 한해 연 ${man(CARD_EXTRA_LIMIT_2026.LOW_SALARY)}(총급여 ${CARD_7K} 초과자는 ${man(CARD_EXTRA_LIMIT_2026.HIGH_SALARY)})까지 추가로 공제됩니다. 전통시장·대중교통 공제율은 ${pct(R.TRADITIONAL)}로 신용카드(${pct(R.CREDIT)})보다 높아 기본 한도가 찬 뒤에도 절세 효과가 남습니다.`,
  },
  {
    question: "연금저축에만 900만원을 넣어도 전부 세액공제되나요?",
    answer: `아닙니다. 연금저축계좌는 연 ${man(P.SAVINGS_CAP)}까지만 공제 대상이고, ${man(P.TOTAL_CAP)}을 채우려면 나머지를 IRP 등 퇴직연금계좌에 넣어야 합니다(IRP만으로는 ${man(P.TOTAL_CAP)}까지 인정). 공제율은 총급여 ${man(P.SALARY_15_MAX)} 이하 ${pct(P.RATE_HIGH)}(지방소득세 포함 ${withLocal(P.RATE_HIGH)}), 초과 ${pct(P.RATE_LOW)}(${withLocal(P.RATE_LOW)})이며, ISA 만기 자금을 연금계좌로 옮기면 옮긴 금액의 ${pct(P.ISA_TRANSFER_RATIO)}(최대 ${man(P.ISA_TRANSFER_CAP)})만큼 한도가 늘어납니다.`,
  },
  {
    question: "월세 세액공제는 누가, 얼마까지 받을 수 있나요?",
    answer: `12월 31일 현재 무주택 세대의 세대주(세대주가 주택 관련 공제를 받지 않으면 세대원도 가능)이면서 총급여 ${man(RENT_CREDIT_2026.SALARY_CAP)} 이하(종합소득금액 7,000만원 초과자 제외)인 근로자가 국민주택규모 이하이거나 기준시가 4억원 이하인 주택에 낸 월세가 대상입니다. 월세는 연 ${man(RENT_CREDIT_2026.CAP)}까지 인정되고 총급여 ${man(RENT_CREDIT_2026.SALARY_17_MAX)} 이하는 ${pct(RENT_CREDIT_2026.RATE_HIGH)}, 초과는 ${pct(RENT_CREDIT_2026.RATE_LOW)}를 공제해 최대 ${man(RENT_CREDIT_2026.CAP * RENT_CREDIT_2026.RATE_HIGH)}을 돌려받습니다. 2026년부터는 세대주와 주소를 달리하는 배우자도 부부 합산 연 ${man(RENT_CREDIT_2026.CAP)} 한도 안에서 따로 공제받을 수 있습니다.`,
  },
  {
    question: "의료비 세액공제는 얼마 이상 써야 받을 수 있나요?",
    answer: `총급여의 ${pct(M.THRESHOLD_RATIO)}를 넘게 쓴 의료비부터 공제됩니다. 총급여 ${man(EXAMPLE_SALARY)}이라면 ${man(EXAMPLE_SALARY * M.THRESHOLD_RATIO)}을 넘는 금액이 대상이고, 공제율은 ${pct(M.RATE)}(미숙아·선천성이상아 의료비 ${pct(M.PREMATURE_RATE)}, 난임시술비 ${pct(M.INFERTILITY_RATE)})입니다. 본인·6세 이하·65세 이상·장애인·중증질환자 등의 의료비는 한도가 없고, 그 밖의 부양가족 의료비는 연 ${man(M.DEPENDENT_CAP)}까지 인정됩니다. 산후조리원 비용은 소득과 관계없이 출산 1회당 ${man(M.POSTPARTUM_CAP)}까지 포함됩니다.`,
  },
  {
    question: "교육비 세액공제 한도는 자녀 1명당 얼마인가요?",
    answer: `교육비는 지출액의 ${pct(E.RATE)}를 세액공제하며 취학 전 아동과 초·중·고등학생은 1명당 연 ${man(E.SCHOOL_CAP)}, 대학생은 1명당 연 ${man(E.UNIVERSITY_CAP)}까지 인정됩니다(자녀의 대학원 교육비는 제외). 근로자 본인 교육비(대학원·직업능력개발훈련 수강료 포함)와 장애인 특수교육비는 한도가 없습니다. 2026년 지출분부터는 초등학교 2학년 이하(또는 9세 미만) 자녀의 예체능 학원·체육시설 수강료도 ${man(E.SCHOOL_CAP)} 한도 안에서 공제됩니다.`,
  },
];
