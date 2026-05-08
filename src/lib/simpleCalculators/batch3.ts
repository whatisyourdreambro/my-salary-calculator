// src/lib/simpleCalculators/batch3.ts
// Phase 3 핫 키워드 군집 — 실업급여, 육아휴직급여, 출산휴가급여, 자동차세, 전월세 환산.
// 한국 검색 트래픽 큰 빈 키워드 군집을 채우는 신규 계산기.

import type { CalculatorDef } from "./types";

// 2026년 실업급여 상한액 (가정 — 실제는 매년 고용노동부 발표).
// 2024년 상한 66,000원 → 2025/2026년 67,000~68,000원 추정.
const UNEMPLOYMENT_DAILY_MAX_2026 = 68_000;
const UNEMPLOYMENT_DAILY_MIN_2026 = 65_792; // 최저시급 80% × 8h (2026 최저시급 10,320원 기준)

// 육아휴직급여 상한 (2024+ 1~3개월 250만, 4~12개월 150만).
const PARENTAL_FIRST_3M_MAX = 2_500_000;
const PARENTAL_REMAINING_MAX = 1_500_000;

// 출산휴가급여 상한 (2026, 90일 기준 약 200만/월).
const MATERNITY_MONTHLY_MAX = 2_100_000;

// ─── 실업급여 ─────────────────────────────────────────────
const UNEMPLOYMENT: CalculatorDef[] = [
 {
 slug: "unemployment-benefit-amount",
 title: "실업급여 수급액 계산기",
 description: "퇴사 전 평균임금·근속기간 입력 → 일 수급액·월 수급액 즉시 계산 (2026 기준)",
 category: "salary",
 categoryLabel: "근로자 권리",
 keywords: ["실업급여 계산기", "실업급여 수급액", "실업급여 일액", "구직급여 계산"],
 fields: [
 { name: "averageMonthly", label: "퇴사 전 3개월 평균 월급", defaultValue: 3_000_000, suffix: "원" },
 ],
 compute: ({ averageMonthly }) => {
 // 평균임금 일액 = 월급 / 30
 const dailyAvg = averageMonthly / 30;
 // 일 수급액 = 평균임금 × 60% (상하한 적용)
 const dailyBenefit = Math.min(
 UNEMPLOYMENT_DAILY_MAX_2026,
 Math.max(UNEMPLOYMENT_DAILY_MIN_2026, Math.round(dailyAvg * 0.6))
 );
 const monthlyBenefit = dailyBenefit * 30;
 const replaceRate = (dailyBenefit / dailyAvg) * 100;

 return {
 primary: { label: "월 수급액 (30일 기준)", value: monthlyBenefit, suffix: "원" },
 secondary: [
 { label: "일 수급액", value: dailyBenefit, suffix: "원" },
 { label: "평균임금 대비", value: replaceRate, suffix: "%" },
 { label: "상한 적용 여부", value: dailyBenefit === UNEMPLOYMENT_DAILY_MAX_2026 ? 1 : 0, suffix: " (1=상한 적용)" },
 ],
 note: "수급일수는 가입기간·연령에 따라 120~270일 (별도 계산기 참고).",
 };
 },
 explanation: "구직급여 일액 = 평균임금 × 60% (상한 68,000원/일·하한 65,792원/일 적용, 2026 추정).",
 formula: "월 수급액 = min(상한, max(하한, 평균임금 × 60%)) × 30일",
 faqs: [
 { q: "실업급여는 누구나 받을 수 있나요?", a: "고용보험 가입 180일 이상 + 비자발적 퇴사 + 적극적 구직활동 시 수급. 자발적 퇴사도 정당한 사유(임금 체불·괴롭힘·통근 곤란 등) 인정되면 가능." },
 { q: "수급 기간은 며칠인가요?", a: "가입기간(180일~10년 이상) + 연령(50세 미만/이상)에 따라 120일~270일. 별도 '실업급여 수급기간 계산기' 참고." },
 { q: "퇴사 후 언제 신청하나요?", a: "퇴사일 다음 날부터 12개월 이내 신청. 늦으면 권리 소멸. 워크넷 구직등록 + 고용센터 방문." },
 ],
 caveats: [
 "이 계산은 2026년 추정 상하한 기준 — 매년 1월 고용노동부 공식 발표값 확인 필요",
 "조기재취업수당(50% 일시 지급)·취업촉진수당 별도",
 "자발적 퇴사 + 정당한 사유 미인정 시 수급 불가",
 ],
 relatedSlugs: ["unemployment-benefit-period", "parental-leave-benefit"],
 },
 {
 slug: "unemployment-benefit-period",
 title: "실업급여 수급기간 계산기",
 description: "고용보험 가입기간·연령 입력 → 수급일수(120~270일) 즉시 산출",
 category: "salary",
 categoryLabel: "근로자 권리",
 keywords: ["실업급여 수급기간", "실업급여 일수", "실업급여 180일", "구직급여 기간"],
 fields: [
 { name: "insuranceMonths", label: "고용보험 가입 개월수", defaultValue: 60, suffix: "개월" },
 { name: "age", label: "퇴사 시 만 나이", defaultValue: 35, suffix: "세" },
 ],
 compute: ({ insuranceMonths, age }) => {
 // 수급일수 표 (만 50세 미만 / 이상 + 장애인)
 // 가입기간: 1년 미만(120) / 1~3년 / 3~5년 / 5~10년 / 10년 이상
 let days = 0;
 const isOver50 = age >= 50;
 const months = insuranceMonths;

 if (months < 12) days = 120;
 else if (months < 36) days = isOver50 ? 180 : 150;
 else if (months < 60) days = isOver50 ? 210 : 180;
 else if (months < 120) days = isOver50 ? 240 : 210;
 else days = isOver50 ? 270 : 240;

 return {
 primary: { label: "수급일수", value: days, suffix: "일" },
 secondary: [
 { label: "약 개월수", value: days / 30, suffix: "개월" },
 { label: "연령 우대", value: isOver50 ? 1 : 0, suffix: " (1=만 50세 이상)" },
 ],
 note: `가입 ${insuranceMonths}개월 + ${age}세 기준. 50세 이상은 30일 추가.`,
 };
 },
 explanation: "수급일수 = 가입기간 × 연령 매트릭스. 만 50세 이상·장애인 30일 추가.",
 faqs: [
 { q: "수급일수가 다 차기 전에 취업하면?", a: "조기재취업수당으로 잔여 일수의 50% 일시 지급. 12개월 이상 근속 조건. 기존 수급액 손실 거의 없음." },
 { q: "180일 가입의 의미는?", a: "최소 수급 자격 기준. 가입 180일 이상이어야 실업급여 신청 가능. 180일은 '근로일' 기준이 아닌 '피보험단위기간'." },
 ],
 relatedSlugs: ["unemployment-benefit-amount", "parental-leave-benefit"],
 },
];

// ─── 육아휴직급여 / 출산휴가급여 ───────────────────────────
const PARENTAL: CalculatorDef[] = [
 {
 slug: "parental-leave-benefit",
 title: "육아휴직급여 계산기",
 description: "통상임금 입력 → 1~3개월 100%(상한 250만)·4~12개월 80%(상한 150만) 자동 적용 (2026)",
 category: "salary",
 categoryLabel: "정부지원금",
 keywords: ["육아휴직급여", "통상임금 계산", "육아휴직 250만", "육아휴직 12개월"],
 fields: [
 { name: "monthlyWage", label: "통상임금 (월급)", defaultValue: 3_000_000, suffix: "원" },
 { name: "months", label: "휴직 개월수", defaultValue: 12, suffix: "개월" },
 ],
 compute: ({ monthlyWage, months }) => {
 const safeMonths = Math.max(1, Math.min(12, Math.round(months)));
 // 1~3개월: 통상임금 100% (상한 250만)
 const first3 = Math.min(monthlyWage, PARENTAL_FIRST_3M_MAX);
 const first3Months = Math.min(3, safeMonths);
 const first3Total = first3 * first3Months;

 // 4~12개월: 통상임금 80% (상한 150만)
 const remaining = Math.min(monthlyWage * 0.8, PARENTAL_REMAINING_MAX);
 const remainingMonths = Math.max(0, safeMonths - 3);
 const remainingTotal = remaining * remainingMonths;

 const grossTotal = first3Total + remainingTotal;
 // 75% 매월 지급 + 25% 복귀 6개월 후 일시 (사후지급금)
 const monthlyPaid = grossTotal * 0.75;
 const lumpSum = grossTotal * 0.25;

 return {
 primary: { label: `${safeMonths}개월 총 수급액`, value: grossTotal, suffix: "원" },
 secondary: [
 { label: "1~3개월 (100%)", value: first3, suffix: "원/월" },
 { label: "4개월 이후 (80%)", value: remaining, suffix: "원/월" },
 { label: "매월 지급 (75%)", value: monthlyPaid, suffix: "원" },
 { label: "복귀 후 사후지급 (25%)", value: lumpSum, suffix: "원" },
 ],
 note: "75%는 휴직 중 매월, 25%는 복귀 후 6개월 이상 근속 시 일시 지급.",
 };
 },
 explanation: "1~3개월 통상임금 100% (상한 250만), 4~12개월 80% (상한 150만). 75% 매월 + 25% 사후 지급.",
 formula: "총액 = (min(월급, 250만) × 3) + (min(월급 × 0.8, 150만) × min(개월-3, 9))",
 faqs: [
 { q: "육아휴직 받으면서 일하면?", a: "육아휴직 중 별도 근로 시 급여 감액·중단. 단, 시간선택제 공무원은 별도 규정. 부업·프리랜서도 신중." },
 { q: "75%만 받고 25%는 왜 사후?", a: "복직 유도 정책. 휴직 후 6개월 이상 근속 시 일시 지급. 6개월 내 퇴사 시 25% 미지급." },
 { q: "부부 동시 휴직 시 가산?", a: "'3+3 부모육아휴직제' — 첫 3개월 부모 모두 100% (상한 300만→450만). 둘째 자녀부터 적용 가능." },
 ],
 caveats: [
 "고용보험 180일 이상 가입 + 만 8세 이하·초2 이하 자녀 대상",
 "회사 사전 통보(30일 전) 필수",
 "재직 30일 이상 + 동일 사업장",
 ],
 relatedSlugs: ["maternity-leave-benefit", "unemployment-benefit-amount"],
 },
 {
 slug: "maternity-leave-benefit",
 title: "출산휴가급여 계산기",
 description: "통상임금 입력 → 90일(다태아 120일) 출산전후휴가급여 자동 계산",
 category: "salary",
 categoryLabel: "정부지원금",
 keywords: ["출산휴가급여", "출산전후휴가", "다태아 120일", "출산휴가 90일"],
 fields: [
 { name: "monthlyWage", label: "통상임금 (월급)", defaultValue: 3_000_000, suffix: "원" },
 { name: "isMultiple", label: "다태아 여부 (1=쌍둥이+, 0=단태아)", defaultValue: 0, suffix: "" },
 ],
 compute: ({ monthlyWage, isMultiple }) => {
 const days = isMultiple > 0 ? 120 : 90;
 // 통상임금 100% (상한 약 210만/월), 90일 = 3개월
 const monthlyBenefit = Math.min(monthlyWage, MATERNITY_MONTHLY_MAX);
 const months = days / 30;
 const total = monthlyBenefit * months;
 // 우선지원 대상기업: 정부 100% 부담
 // 대규모 기업: 60일은 회사, 30(또는 60)일 정부

 return {
 primary: { label: `${days}일 총 수급액`, value: total, suffix: "원" },
 secondary: [
 { label: "월 수급액", value: monthlyBenefit, suffix: "원" },
 { label: "휴가 일수", value: days, suffix: "일" },
 { label: "상한 적용 여부", value: monthlyBenefit === MATERNITY_MONTHLY_MAX ? 1 : 0, suffix: " (1=상한)" },
 ],
 note: "우선지원 대상기업은 정부 100% 부담, 대기업은 60일 회사 부담.",
 };
 },
 explanation: "출산전후휴가 단태아 90일·다태아 120일. 통상임금 100% (월 상한 약 210만, 2026 추정).",
 formula: "총액 = min(월급, 상한) × (휴가일수 / 30)",
 faqs: [
 { q: "출산휴가는 의무인가요?", a: "근로기준법상 사업주 의무. 출산일 전후 90일(전 45일 + 후 45일 권장). 출산 후 45일 이상 보장. 거부 시 노동청 신고." },
 { q: "출산휴가 + 육아휴직 연속 사용?", a: "출산휴가 90일 직후 육아휴직 12개월 연속 사용 일반적. 합산 약 15개월. 회사 30일 전 통보." },
 ],
 caveats: [
 "고용보험 180일 이상 + 출산 30일 전 신청",
 "우선지원 대상기업 = 종업원 500인 이하 (대부분 중소기업)",
 ],
 relatedSlugs: ["parental-leave-benefit", "unemployment-benefit-amount"],
 },
];

// ─── 자동차세 ─────────────────────────────────────────────
const AUTO_TAX: CalculatorDef[] = [
 {
 slug: "auto-tax-annual",
 title: "자동차세 연간 계산기",
 description: "배기량 기준 비영업용 승용차 자동차세 + 지방교육세 자동 계산",
 category: "tax",
 categoryLabel: "세금",
 keywords: ["자동차세 계산기", "자동차세", "배기량 자동차세", "지방교육세"],
 fields: [
 { name: "displacement", label: "배기량 (cc)", defaultValue: 1999, suffix: "cc" },
 { name: "carYears", label: "차량 연식 (년)", defaultValue: 3, suffix: "년" },
 ],
 compute: ({ displacement, carYears }) => {
 // 비영업용 승용차 cc당 세율 (2026 기준)
 // 1000cc 이하: 80원, 1600cc 이하: 140원, 1600cc 초과: 200원
 let perCc = 0;
 if (displacement <= 1000) perCc = 80;
 else if (displacement <= 1600) perCc = 140;
 else perCc = 200;

 const baseTax = displacement * perCc;
 // 차령 경감: 3년차부터 매년 5%, 12년차부터 50% 고정
 const carYearsInt = Math.max(0, Math.floor(carYears));
 const yearReduction =
 carYearsInt < 3 ? 0 : Math.min(0.5, (carYearsInt - 2) * 0.05);
 const reducedTax = Math.round(baseTax * (1 - yearReduction));
 const eduTax = Math.round(reducedTax * 0.3); // 지방교육세 30%
 const total = reducedTax + eduTax;

 return {
 primary: { label: "연간 자동차세 + 지방교육세", value: total, suffix: "원" },
 secondary: [
 { label: "자동차세 (본세)", value: reducedTax, suffix: "원" },
 { label: "지방교육세 (×30%)", value: eduTax, suffix: "원" },
 { label: "차령 경감", value: yearReduction * 100, suffix: "%" },
 ],
 note: "1년 6월 + 12월 분할 납부. 1월 연납 시 6.4% 할인 (별도 계산기).",
 };
 },
 explanation: "비영업용 승용차 자동차세 = 배기량 × cc당 세율 (1000↓ 80원 / 1600↓ 140원 / 1600↑ 200원) + 지방교육세 30% + 차령 경감.",
 faqs: [
 { q: "전기차 자동차세는?", a: "비영업용 전기차 정액 13만원/년 (2026 기준). 친환경차 별도 감면 있음." },
 { q: "1월 연납 할인은 얼마?", a: "1월 16일~31일 연납 6.4% 할인. 3월 5%, 6월 3%, 9월 1.5%. 별도 'auto-tax-discount' 계산기." },
 { q: "중고차 사면 자동차세는?", a: "취득세 별도(7%, 비영업용). 자동차세는 매년 6월·12월 등록자 기준 부과. 매매 시 일할 정산." },
 ],
 caveats: [
 "영업용·승합차·화물차는 별도 세율 (본 계산기는 비영업용 승용차)",
 "친환경차(전기·수소)는 정액 13만원, 일부 감면",
 ],
 relatedSlugs: ["auto-tax-acquisition", "auto-tax-discount"],
 },
 {
 slug: "auto-tax-acquisition",
 title: "자동차 취득세 계산기",
 description: "차량 가격 입력 → 비영업용 7%·영업용 4%·경차 4% 자동 적용",
 category: "tax",
 categoryLabel: "세금",
 keywords: ["자동차 취득세 계산기", "신차 취득세", "중고차 취득세", "경차 취득세"],
 fields: [
 { name: "carPrice", label: "차량 가격 (취득가액)", defaultValue: 30_000_000, suffix: "원" },
 { name: "carType", label: "차량 유형 (0=승용 비영업, 1=경차/영업, 2=화물)", defaultValue: 0, suffix: "" },
 ],
 compute: ({ carPrice, carType }) => {
 // 비영업용 7%, 경차/영업용 4%, 화물 5%
 const t = Math.round(carType);
 const rate = t === 1 ? 0.04 : t === 2 ? 0.05 : 0.07;
 const tax = Math.round(carPrice * rate);

 return {
 primary: { label: "자동차 취득세", value: tax, suffix: "원" },
 secondary: [
 { label: "적용 세율", value: rate * 100, suffix: "%" },
 { label: "차량 유형 코드", value: t, suffix: "" },
 ],
 note: "취득일(인도일) 기준 60일 이내 신고·납부. 등기 시 동시 처리 가능.",
 };
 },
 explanation: "비영업용 승용차 7%, 경차·영업용 승용 4%, 화물 5%. 친환경차 감면 별도.",
 faqs: [
 { q: "취득가액은 어떻게 결정?", a: "신차: 출고가 (옵션 포함). 중고차: 매매계약서 + 시가표준액 중 큰 값. 시가표준액은 국세청 자동차 시가 조회." },
 { q: "친환경차 감면은?", a: "전기차 140만 한도 감면, 수소차 140만 한도. 하이브리드는 별도 (140만 한도, 2026 일몰 가능성)." },
 { q: "경차 기준은?", a: "배기량 1000cc 이하 + 길이 3.6m 이하 + 너비 1.6m 이하. 경차는 4% + 추가 감면 가능 (취득세 75만 한도 면제)." },
 ],
 relatedSlugs: ["auto-tax-annual", "auto-tax-discount"],
 },
 {
 slug: "auto-tax-discount",
 title: "자동차세 연납 할인 계산기",
 description: "1월 연납 6.4% 할인·3월 5%·6월 3%·9월 1.5% 자동 산출",
 category: "tax",
 categoryLabel: "세금",
 keywords: ["자동차세 연납 할인", "자동차세 1월", "자동차세 6.4%", "연납 신청"],
 fields: [
 { name: "annualTax", label: "연간 자동차세 (본세 + 교육세)", defaultValue: 520_000, suffix: "원" },
 { name: "month", label: "연납 신청 월 (1/3/6/9)", defaultValue: 1, suffix: "월" },
 ],
 compute: ({ annualTax, month }) => {
 const m = Math.round(month);
 const discountMap: Record<number, number> = { 1: 0.064, 3: 0.05, 6: 0.03, 9: 0.015 };
 const discountRate = discountMap[m] ?? 0;
 const savings = Math.round(annualTax * discountRate);
 const finalTax = annualTax - savings;

 return {
 primary: { label: `${m}월 연납 시 납부액`, value: finalTax, suffix: "원" },
 secondary: [
 { label: "할인율", value: discountRate * 100, suffix: "%" },
 { label: "절감액", value: savings, suffix: "원" },
 { label: "정상 분기 납부 시", value: annualTax, suffix: "원" },
 ],
 note: "1월 16~31일 신청 시 6.4% — 가장 큰 할인. 위택스에서 신청 가능.",
 };
 },
 explanation: "연납 할인율: 1월 6.4%, 3월 5%, 6월 3%, 9월 1.5%. 미신청 시 6월·12월 분할 납부.",
 formula: "할인 후 = 연 세액 × (1 - 할인율)",
 faqs: [
 { q: "연납 어떻게 신청?", a: "위택스(www.wetax.go.kr) 또는 시·군·구청 세무과. 1월 16~31일 사이 신청 + 즉시 납부. 다음 해는 자동 안내." },
 { q: "연납했는데 매각하면?", a: "연납 후 차량 매각 시 미경과 일수만큼 환급. 매매 시점이 8월이면 9~12월 4개월치 환급." },
 ],
 relatedSlugs: ["auto-tax-annual", "auto-tax-acquisition"],
 },
];

// ─── 전월세 환산 ──────────────────────────────────────────
const RENT: CalculatorDef[] = [
 {
 slug: "jeonse-monthly-conversion",
 title: "전월세 환산 계산기",
 description: "전세 보증금 → 월세 환산 또는 월세 → 전세 보증금 환산 (전월세전환율 기준)",
 category: "real-estate",
 categoryLabel: "부동산",
 keywords: ["전월세 전환율", "전세 월세 환산", "월세 전세 환산", "갭투자 계산"],
 fields: [
 { name: "jeonseDeposit", label: "전세 보증금", defaultValue: 300_000_000, suffix: "원" },
 { name: "conversionRate", label: "전월세 전환율 (%)", defaultValue: 5.5, suffix: "%" },
 ],
 compute: ({ jeonseDeposit, conversionRate }) => {
 // 월세 환산 = 전세금 × 전환율 / 12
 const annualRent = jeonseDeposit * (conversionRate / 100);
 const monthlyRent = Math.round(annualRent / 12);
 // 보증금 1000만 + 월세 환산
 const baseDeposit = Math.min(10_000_000, jeonseDeposit);
 const reducedDeposit = jeonseDeposit - baseDeposit;
 const monthlyRentWithDeposit = Math.round(
 reducedDeposit * (conversionRate / 100) / 12
 );

 return {
 primary: { label: "보증금 0 기준 월세", value: monthlyRent, suffix: "원" },
 secondary: [
 { label: "보증금 1,000만 + 월세", value: monthlyRentWithDeposit, suffix: "원" },
 { label: "연 환산액", value: annualRent, suffix: "원" },
 { label: "전환율", value: conversionRate, suffix: "%" },
 ],
 note: "한국 평균 전월세전환율 5~6% (서울 4~5%, 지방 6~8%). 한국부동산원 발표값 참고.",
 };
 },
 explanation: "월세 = 전세금 × 전환율 / 12. 전환율은 지역별·연도별 변동, 한국부동산원 월별 발표.",
 formula: "월세 = (전세금 - 보증금) × 전환율 / 12",
 faqs: [
 { q: "전월세전환율은 어디서 확인?", a: "한국부동산원(www.reb.or.kr) 월별 통계. 서울 평균 5%, 경기 6%, 지방 7~8% 수준 (2026 기준 추정). 임대차계약법 상한 5.5%." },
 { q: "전세 vs 월세 어느 게 유리?", a: "전세금 운용수익률 > 전환율이면 전세 유리. 본인 자금 운용 ETF 6% 가능 + 전환율 5.5% → 전세 유리. 단, 전세사기 리스크 별도 고려." },
 { q: "갭투자 계산은?", a: "전세금이 매매가의 80%+면 갭투자 가능. 매매가 5억 + 전세 4억 = 갭 1억 투자. 별도 'gap-investment-quick' 계산기." },
 ],
 caveats: [
 "임대차계약법상 전환율 상한 5.5% (2026 기준 — 변동 가능)",
 "지역·주택 유형·연식별 실제 전환율 다름",
 "전세사기 리스크 — 보증금 보험 권장",
 ],
 relatedSlugs: ["gap-investment-quick", "ltv-quick"],
 },
 {
 slug: "gap-investment-quick",
 title: "갭투자 계산기",
 description: "매매가·전세가 입력 → 갭(차액) + 수익률 시나리오 시뮬",
 category: "real-estate",
 categoryLabel: "부동산",
 keywords: ["갭투자 계산", "갭투자 수익률", "전세 갭", "부동산 갭"],
 fields: [
 { name: "salePrice", label: "매매가", defaultValue: 500_000_000, suffix: "원" },
 { name: "jeonsePrice", label: "전세가", defaultValue: 400_000_000, suffix: "원" },
 { name: "appreciationRate", label: "예상 매매가 상승률 (연 %)", defaultValue: 3, suffix: "%" },
 ],
 compute: ({ salePrice, jeonsePrice, appreciationRate }) => {
 const gap = salePrice - jeonsePrice;
 const jeonseRatio = (jeonsePrice / salePrice) * 100;
 // 1년 후 매매가 + 전세 동결 가정 시 수익
 const oneYearAppreciation = salePrice * (appreciationRate / 100);
 const oneYearROI = (oneYearAppreciation / gap) * 100;
 // 5년 후 (단리 가정)
 const fiveYearGain = salePrice * (appreciationRate / 100) * 5;
 const fiveYearROI = (fiveYearGain / gap) * 100;

 return {
 primary: { label: "갭 (필요 자기자본)", value: gap, suffix: "원" },
 secondary: [
 { label: "전세가율", value: jeonseRatio, suffix: "%" },
 { label: "1년 후 ROI", value: oneYearROI, suffix: "%" },
 { label: "5년 후 ROI", value: fiveYearROI, suffix: "%" },
 ],
 note: "전세가율 80%+면 갭 부담 적음. 단, 전세 하락·역전세 리스크 + 취득세·보유세 별도.",
 };
 },
 explanation: "갭 = 매매가 - 전세가. 자기자본만큼 투자 + 매매가 상승분이 수익. 전세 하락 시 추가 자본 필요.",
 formula: "갭 = 매매가 - 전세가; ROI = 매매가 상승액 / 갭 × 100%",
 faqs: [
 { q: "갭투자는 안전한가요?", a: "매매가 상승 시 고수익이지만, 전세가 하락(역전세) 시 추가 자본 투입 필요 + 매도 어려움. 부동산 하락기에는 큰 손실 가능. 신중 접근." },
 { q: "취득세·보유세는 어떻게?", a: "취득세: 매매가의 1~12% (지역·주택 수). 보유세: 종합부동산세(공시가 12억↑ 다주택자) + 재산세. 본 계산은 갭만 — 별도 비용 추가 고려." },
 { q: "DSR 적용되나요?", a: "갭투자는 보통 자기자본 + 전세금이라 LTV 적용 X. 단, 신용대출 활용 시 DSR 40% 적용. 다주택자는 추가 대출 0%." },
 ],
 caveats: [
 "전세 하락 시 추가 자본 투입(역전세) 위험",
 "보유 중 종부세·재산세 별도",
 "다주택자 양도세 중과 (조정대상지역)",
 ],
 relatedSlugs: ["jeonse-monthly-conversion", "ltv-quick"],
 },
];

export const batch3Calculators: CalculatorDef[] = [
 ...UNEMPLOYMENT,
 ...PARENTAL,
 ...AUTO_TAX,
 ...RENT,
];
