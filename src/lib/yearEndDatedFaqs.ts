// src/lib/yearEndDatedFaqs.ts
//
// 연말정산 정밀 계산기 4쪽의 '날짜 박힌 FAQ' (SEASON-15 2026-09-26 작성, 2026-11-01 B30 이식).
// 각 쪽 마지막 광고(MultiplexAd)보다 아래, 페이지 맨 끝에 따로 렌더하고 그 쪽 FAQPage JSON-LD 에 합친다.
// 기존 FAQS 배열(쿠팡·멀티플렉스 위)에는 덧붙이지 않는다 — 광고 위 높이 불변.
// 수치는 정본 상수에서 만든다(cardDeduction2026·taxConstants2026·donationCredit). 조문은 국가법령정보센터 현행 조문,
// 정부안은 재정경제부 「2026년 세제개편안」 상세본(2026-08-03)으로 2026-09-26 확인, 2026-11-01 다시 확인했다 —
// 조세특례제한법 [시행 2026. 9. 18.] 법률 제21467호(부칙 법률 제21223호 §13·§17·§47, 법률 제20617호 §14 포함),
// 같은 법 시행령 [시행 2026. 9. 18.] 대통령령 제36587호, 소득세법 [시행 2026. 7. 1.] 법률 제21221호,
// 같은 법 시행령 [시행 2026. 10. 1.] 대통령령 제36737호. 화면 확인일(아래 CHECKED_ON)은 다시 확인한 날이다.
//   카드   조세특례제한법 §126의2 ②(대중교통 40%)·⑩(자녀 한도, 2025-12-23 개정) — 정부안: 대중교통 추가공제 종료('27.1.1. 이후 개시 과세기간)
//   월세   같은 법 §95의2 ①(연 1천만원)·②(배우자, 2025-12-23 신설), 시행령 §95 ②(국민주택규모·기준시가 4억원)·⑤(시·군·구 상이)
//          — 정부안: 한도 1,200만원·청년(15~34세) 17%('27.1.1. 이후 지급분)
//   고향사랑 같은 법 §58 ①2호(10만원 초과 20만원 이하 40%, 부칙 §13 2026-01-01 이후 기부분)·②(산출세액 한도)
//   의료비 소득세법 §59의4 ②1호(총급여 3% 초과분 15%), 시행령 §118의5 ①(실손의료보험금 제외)·①4호(안경·렌즈 1명당 연 50만원)
// ★2027-03-11 귀속연도 전환 때 이 파일은 2026년 귀속 기록으로 남기고 2027년 귀속 FAQ 를 새로 만든다(제자리 교체 금지).

import { cardBaseLimit, CARD_RATES_2026, CARD_SALARY_THRESHOLD } from "@/lib/cardDeduction2026";
import { DONATION_CREDIT_2026 } from "@/lib/donationCredit";
import { formatManwonKorean } from "@/lib/manwonFormat";
import { INSURANCE_RATES_2026, MEDICAL_CREDIT_2026, RENT_CREDIT_2026 } from "@/lib/taxConstants2026";
import { YEAR_END_ATTRIBUTION_LABEL, YEAR_END_FILING_QUERY } from "@/lib/yearEndSeason";

export interface YearEndDatedFaqItem {
  question: string;
  answer: string;
}

/** 조문·공식 발표를 확인한 날 (화면에 날짜로 표기) — 내용을 고치거나 다시 확인하면 함께 바꾼다 */
export const YEAR_END_DATED_FAQ_CHECKED_ON = "2026-11-01";
export const YEAR_END_DATED_FAQ_CHECKED_LABEL = "2026년 11월 1일";

/** "2027 연말정산(2026년 귀속) 기준 — 날짜로 확인한 FAQ" */
export const YEAR_END_DATED_FAQ_HEADING = `${YEAR_END_FILING_QUERY}(${YEAR_END_ATTRIBUTION_LABEL}) 기준 — 날짜로 확인한 FAQ`;

const man = (won: number) => formatManwonKorean(won / 10_000);
const pct = (rate: number) => `${Number((rate * 100).toFixed(1))}%`;
const LOCAL = 1 + INSURANCE_RATES_2026.LOCAL_INCOME_TAX_RATIO; // 지방소득세 = 소득세의 10%
const won = (n: number) => `${Math.round(n).toLocaleString("ko-KR")}원`;

const R = CARD_RATES_2026;
const K7 = man(CARD_SALARY_THRESHOLD);
export const CARD_DATED_FAQS: readonly YearEndDatedFaqItem[] = [
  {
    question: "2027년 1~2월 연말정산(2026년 사용분)에도 대중교통 40%가 적용되나요?",
    answer: `네. 2026년에 쓴 대중교통 이용분은 현행 조세특례제한법 제126조의2에 따라 ${pct(R.TRANSIT)} 공제율이 적용됩니다. 2026년 8월 3일 발표된 세제개편안(정부안)의 대중교통 추가공제 폐지·기본공제 일원화는 국회를 통과해야 하고 2027년 1월 1일 이후 개시하는 과세기간부터 적용 예정이라, 2026년 사용분 정산에는 영향이 없습니다.`,
  },
  {
    question: "2026년 사용분은 총급여 25%를 넘겨야 공제되나요? 체크카드 비중은 어떻게 할까요?",
    answer: `네. 카드·현금영수증 사용액 합계가 총급여의 25%(최저사용금액)를 넘은 부분부터 공제되고, 최저사용금액은 공제율이 낮은 신용카드 사용분(${pct(R.CREDIT)})부터 차감합니다. 그래서 25%를 넘긴 뒤의 사용분을 체크카드·현금영수증(${pct(R.CHECK_CASH)})으로 쓰는 쪽이 공제액이 커집니다. 2026년 사용분 기본 한도는 총급여 ${K7} 이하 ${man(cardBaseLimit(true, 0))}(자녀 1명 ${man(cardBaseLimit(true, 1))}·2명 이상 ${man(cardBaseLimit(true, 2))}), 초과 ${man(cardBaseLimit(false, 0))}(${man(cardBaseLimit(false, 1))}·${man(cardBaseLimit(false, 2))})입니다.`,
  },
];

const RC = RENT_CREDIT_2026;
export const RENT_DATED_FAQS: readonly YearEndDatedFaqItem[] = [
  {
    question: "2027년 1~2월 연말정산(2026년 귀속) 월세 한도는 1,000만원인가요, 1,200만원인가요?",
    answer: `2026년에 낸 월세는 연 ${man(RC.CAP)}까지 인정됩니다(조세특례제한법 제95조의2 제1항, 공제율 ${pct(RC.RATE_LOW)}·총급여 ${man(RC.SALARY_17_MAX)} 이하 ${pct(RC.RATE_HIGH)}). 한도를 연 1,200만원으로 늘리고 15~34세 청년에게 ${pct(RC.RATE_HIGH)}를 적용하는 내용은 2026년 8월 3일 발표된 세제개편안(정부안)으로, 국회를 통과하면 2027년 1월 1일 이후 지급하는 월세분(2028년 초 연말정산)부터 적용됩니다.`,
  },
  {
    question: "어떤 집이어야 하고, 따로 사는 배우자도 공제받을 수 있나요?",
    answer: `국민주택규모 이하이거나 기준시가 4억원 이하인 주택(오피스텔·고시원 포함) 등이어야 하고, 임대차계약서의 주소지와 주민등록 주소지가 같아야 합니다(조세특례제한법 시행령 제95조 제2항). 2026년 지급분부터는 세대주와 다른 시·군·구에 주소를 둔 배우자도 요건을 갖추면 부부 합산 연 ${man(RC.CAP)} 한도 안에서 따로 공제받을 수 있습니다(같은 법 제95조의2 제2항·시행령 제95조 제5항).`,
  },
];

const D = DONATION_CREDIT_2026;
const HOMETOWN_EXAMPLE = D.HOMETOWN_MID_UPPER; // 20만원
const hometownIncomeTax = D.FULL_CREDIT_LIMIT * D.FULL_CREDIT_RATIO + (HOMETOWN_EXAMPLE - D.FULL_CREDIT_LIMIT) * D.HOMETOWN_RATE_MID;
export const DONATION_DATED_FAQS: readonly YearEndDatedFaqItem[] = [
  {
    question: `2026년에 고향사랑기부금 ${man(HOMETOWN_EXAMPLE)}을 내면 2027년 연말정산에서 얼마를 돌려받나요?`,
    answer: `2026년 1월 1일 이후 기부분부터 ${man(D.FULL_CREDIT_LIMIT)} 초과 ${man(D.HOMETOWN_MID_UPPER)} 이하 구간에 ${pct(D.HOMETOWN_RATE_MID)} 세액공제가 적용됩니다(조세특례제한법 제58조 제1항 제2호, 2025년 12월 23일 개정). ${man(HOMETOWN_EXAMPLE)}을 기부하면 ${man(D.FULL_CREDIT_LIMIT)}까지는 110분의 100, 나머지는 ${pct(D.HOMETOWN_RATE_MID)}를 소득세에서 공제해 소득세 공제액이 약 ${won(hometownIncomeTax)}이고, 지방소득세(소득세의 10%)까지 합치면 약 ${won(hometownIncomeTax * LOCAL)}입니다. 지방소득세를 포함한 체감 공제율은 ${man(D.FULL_CREDIT_LIMIT)}까지 100%, 그다음 ${man(D.HOMETOWN_MID_UPPER)}까지 ${pct(D.HOMETOWN_RATE_MID * LOCAL)}, 그 초과분 ${pct(D.HOMETOWN_RATE * LOCAL)}입니다. 공제액은 그해 산출세액을 넘을 수 없습니다(같은 조 제2항).`,
  },
];

const M = MEDICAL_CREDIT_2026;
export const MEDICAL_DATED_FAQS: readonly YearEndDatedFaqItem[] = [
  {
    question: "2026년에 산 안경·콘택트렌즈는 얼마까지 의료비로 인정되나요?",
    answer: "시력보정용 안경·콘택트렌즈 구입비는 기본공제대상자 1명당 연 50만원까지 의료비에 들어갑니다(소득세법 시행령 제118조의5 제1항 제4호). 이때 부양가족의 나이·소득 요건은 따지지 않습니다.",
  },
  {
    question: "실손보험금을 받은 병원비도 2027년 연말정산에서 공제되나요?",
    answer: `보험회사에서 받은 실손의료보험금만큼은 공제 대상 의료비에서 뺍니다(소득세법 시행령 제118조의5 제1항). 예를 들어 병원비 100만원 가운데 실손보험금 70만원을 받았다면 본인이 부담한 30만원만 의료비로 계산하고, 의료비 합계가 총급여의 ${pct(M.THRESHOLD_RATIO)}를 넘는 금액부터 ${pct(M.RATE)}가 공제됩니다.`,
  },
];

// ── 연말정산 허브 /year-end-tax-2027 맨 끝(시즌 도구 더 보기 뒤, 마지막 광고 MultiplexAd 아래) 질문형 FAQ 3문항
//    (SE-04 2026-10-22 작성, 2026-11-01 B30 이식) ──
// 허브 FAQPage JSON-LD 에 기존 FAQS 와 합쳐 하나로 낸다. 광고 위 FAQS 배열과 질문이 겹치지 않는다(seasonAboveAdListGuard.test.ts).
//   반영 시기·분납 = 소득세법 제137조 제1항·제4항(국가법령정보센터 현행 조문 [시행 2026. 7. 1.] 법률 제21221호 —
//     2026-09-30 확인, 2026-11-01 재확인)
//   간소화 개통일 = 국세청 발표(정책브리핑 2024-01-15 newsId=148924777·2025-01-15 newsId=148938629·2026-01-15
//     newsId=148958025 기사, 2026-11-01 재확인) — 2027년 개통일은 추정하지 않는다.
export const YEAR_END_HUB_DATED_FAQ_CHECKED_ON = "2026-11-01";
export const YEAR_END_HUB_DATED_FAQ_CHECKED_LABEL = "2026년 11월 1일";
export const YEAR_END_HUB_DATED_FAQ_BASIS = "국가법령정보센터 현행 조문과 국세청 발표로";
export const YEAR_END_HUB_DATED_FAQS: readonly YearEndDatedFaqItem[] = [
  {
    question: "연말정산 환급금이나 추가로 낼 세금은 언제 반영되나요?",
    answer: "회사는 2026년 귀속 연말정산을 2027년 2월분 급여를 지급할 때 합니다(소득세법 제137조 제1항). 그래서 환급액은 보통 2월분 급여와 함께 돌려받고, 더 낼 세금은 2월분 급여에서 원천징수됩니다. 급여 지급일과 처리 방식은 회사마다 다르니 정확한 날짜는 회사 공지를 확인하세요.",
  },
  {
    question: "추가로 낼 세금이 많으면 나눠서 낼 수 있나요?",
    answer: "추가로 낼 세금이 10만원을 넘으면 회사는 2027년 2월분부터 4월분 급여를 지급할 때까지 나누어 원천징수할 수 있습니다(소득세법 제137조 제4항). 나눠 낼지는 회사(원천징수의무자)가 정하므로, 필요하면 연말정산 서류를 낼 때 회사에 요청하세요.",
  },
  {
    question: "연말정산 간소화 서비스는 언제 열리나요?",
    answer: "최근 3년은 2024년 1월 15일, 2025년 1월 15일, 2026년 1월 15일에 열렸습니다(국세청 발표). 2027년 개통일은 국세청 공지가 나오면 이 페이지에 반영합니다.",
  },
];
