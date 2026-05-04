// src/lib/simpleCalculators/batch1.ts
// 세금 15 + 연봉 10 + 대출 10 + 투자 15 = 50개

import type { CalculatorDef } from "./types";

// ─── 세금 (Tax) 15개 ───────────────────────────────────────
const TAX: CalculatorDef[] = [
 {
 slug: "income-tax-bracket-sim",
 title: "소득세 누진세율 시뮬레이터",
 description: "과세표준 입력 → 2026 누진세율 적용 산출세액 즉시 계산",
 category: "tax",
 categoryLabel: "세금",
 keywords: ["소득세 시뮬", "누진세율", "산출세액"],
 fields: [{ name: "base", label: "과세표준", defaultValue: 50000000, suffix: "원" }],
 compute: ({ base }) => {
 let tax = 0;
 if (base <= 14000000) tax = base * 0.06;
 else if (base <= 50000000) tax = base * 0.15 - 1260000;
 else if (base <= 88000000) tax = base * 0.24 - 5760000;
 else if (base <= 150000000) tax = base * 0.35 - 15440000;
 else if (base <= 300000000) tax = base * 0.38 - 19940000;
 else if (base <= 500000000) tax = base * 0.4 - 25940000;
 else if (base <= 1000000000) tax = base * 0.42 - 35940000;
 else tax = base * 0.45 - 65940000;
 const local = tax * 0.1;
 return {
 primary: { label: "산출세액", value: Math.round(tax), suffix: "원" },
 secondary: [
 { label: "지방소득세 (10%)", value: Math.round(local), suffix: "원" },
 { label: "총 부담 세액", value: Math.round(tax + local), suffix: "원" },
 { label: "실효세율", value: ((tax + local) / base) * 100, suffix: "%" },
 ],
 };
 },
 explanation: "산출세액 = 과세표준 × 세율 - 누진공제. 지방소득세 10% 별도.",
 },
 {
 slug: "inheritance-tax-sim",
 title: "상속세 시뮬레이터",
 description: "상속재산·공제 입력 → 누진세율 적용 상속세 즉시 계산",
 category: "tax",
 categoryLabel: "세금",
 keywords: ["상속세 시뮬", "상속세 계산"],
 fields: [
 { name: "estate", label: "상속재산 총액", defaultValue: 2000000000, suffix: "원" },
 { name: "deduction", label: "공제 합계 (일괄+배우자 등)", defaultValue: 500000000, suffix: "원" },
 ],
 compute: ({ estate, deduction }) => {
 const base = Math.max(0, estate - deduction);
 let tax = 0;
 if (base <= 100000000) tax = base * 0.1;
 else if (base <= 500000000) tax = base * 0.2 - 10000000;
 else if (base <= 1000000000) tax = base * 0.3 - 60000000;
 else if (base <= 3000000000) tax = base * 0.4 - 160000000;
 else tax = base * 0.5 - 460000000;
 return {
 primary: { label: "예상 상속세", value: Math.round(Math.max(0, tax)), suffix: "원" },
 secondary: [
 { label: "과세표준", value: base, suffix: "원" },
 { label: "공제 적용 후 비율", value: (base / Math.max(1, estate)) * 100, suffix: "%" },
 ],
 note: "사전 증여 + 배우자 공제(최대 30억) 활용 시 큰 절세 가능. 정확한 계산은 세무사 상담 필수.",
 };
 },
 },
 {
 slug: "gift-tax-quick",
 title: "증여세 간편 계산",
 description: "증여재산·관계별 공제한도 → 즉시 증여세 산출",
 category: "tax",
 categoryLabel: "세금",
 keywords: ["증여세 계산", "증여세 시뮬"],
 fields: [
 { name: "gift", label: "증여재산", defaultValue: 200000000, suffix: "원" },
 { name: "deduction", label: "공제 한도", defaultValue: 50000000, suffix: "원", hint: "배우자 6억, 직계비속 5천만(미성년 2천만)" },
 ],
 compute: ({ gift, deduction }) => {
 const base = Math.max(0, gift - deduction);
 let tax = 0;
 if (base <= 100000000) tax = base * 0.1;
 else if (base <= 500000000) tax = base * 0.2 - 10000000;
 else if (base <= 1000000000) tax = base * 0.3 - 60000000;
 else if (base <= 3000000000) tax = base * 0.4 - 160000000;
 else tax = base * 0.5 - 460000000;
 return {
 primary: { label: "예상 증여세", value: Math.round(Math.max(0, tax)), suffix: "원" },
 secondary: [{ label: "과세표준", value: base, suffix: "원" }],
 };
 },
 },
 {
 slug: "property-tax-quick",
 title: "재산세 간편 계산",
 description: "공시가격 기준 주택 재산세 즉시 산출",
 category: "tax",
 categoryLabel: "세금",
 keywords: ["재산세", "주택 재산세"],
 fields: [
 { name: "value", label: "공시가격", defaultValue: 500000000, suffix: "원" },
 ],
 compute: ({ value }) => {
 const base = value * 0.6; // 공정시장가액비율
 let tax = 0;
 if (base <= 60000000) tax = base * 0.001;
 else if (base <= 150000000) tax = 60000 + (base - 60000000) * 0.0015;
 else if (base <= 300000000) tax = 195000 + (base - 150000000) * 0.0025;
 else tax = 570000 + (base - 300000000) * 0.004;
 return {
 primary: { label: "재산세 (연)", value: Math.round(tax), suffix: "원" },
 secondary: [
 { label: "과세표준 (60% 적용)", value: Math.round(base), suffix: "원" },
 { label: "도시지역분 추가 (0.14%)", value: Math.round(base * 0.0014), suffix: "원" },
 ],
 };
 },
 },
 {
 slug: "comprehensive-property-tax-quick",
 title: "종합부동산세 간편 계산",
 description: "공시가 합계 → 1주택자 종부세 산출",
 category: "tax",
 categoryLabel: "세금",
 keywords: ["종부세", "종합부동산세"],
 fields: [
 { name: "value", label: "주택 공시가격 합계", defaultValue: 1500000000, suffix: "원" },
 ],
 compute: ({ value }) => {
 const threshold = 1200000000; // 1주택자 12억 공제
 const base = Math.max(0, (value - threshold) * 0.6);
 let tax = 0;
 if (base <= 300000000) tax = base * 0.005;
 else if (base <= 600000000) tax = 1500000 + (base - 300000000) * 0.007;
 else if (base <= 1200000000) tax = 3600000 + (base - 600000000) * 0.01;
 else tax = 9600000 + (base - 1200000000) * 0.014;
 return {
 primary: { label: "종부세 (연)", value: Math.round(tax), suffix: "원" },
 secondary: [{ label: "공정시장가액", value: Math.round(base), suffix: "원" }],
 note: "1주택자 12억 비과세 한도. 다주택자는 공제 적고 세율 높음.",
 };
 },
 },
 {
 slug: "registration-tax-quick",
 title: "등록면허세 계산",
 description: "주택 매매·증여 시 취득세에 추가되는 등록면허세 계산",
 category: "tax",
 categoryLabel: "세금",
 keywords: ["등록면허세", "등록세"],
 fields: [
 { name: "price", label: "취득가액", defaultValue: 500000000, suffix: "원" },
 { name: "rate", label: "등록세율", defaultValue: 0.8, suffix: "%", hint: "주택 매매 0.8%, 증여 1.5%" },
 ],
 compute: ({ price, rate }) => {
 const tax = price * (rate / 100);
 return {
 primary: { label: "등록면허세", value: Math.round(tax), suffix: "원" },
 secondary: [{ label: "지방교육세 (20%)", value: Math.round(tax * 0.2), suffix: "원" }],
 };
 },
 },
 {
 slug: "earned-income-tax-quick",
 title: "근로소득세 간편 계산",
 description: "월 급여 → 간이세액표 기반 원천징수액",
 category: "tax",
 categoryLabel: "세금",
 keywords: ["근로소득세", "원천징수"],
 fields: [
 { name: "monthly", label: "월 급여", defaultValue: 4000000, suffix: "원" },
 { name: "dependents", label: "부양가족 수", defaultValue: 1, suffix: "명" },
 ],
 compute: ({ monthly, dependents }) => {
 // 단순 추정 (간이세액표 근사)
 const yearly = monthly * 12;
 const personal = dependents * 1500000;
 const baseEst = Math.max(0, yearly - 10000000 - personal);
 let tax = 0;
 if (baseEst <= 14000000) tax = baseEst * 0.06;
 else if (baseEst <= 50000000) tax = baseEst * 0.15 - 1260000;
 else if (baseEst <= 88000000) tax = baseEst * 0.24 - 5760000;
 else tax = baseEst * 0.35 - 15440000;
 const monthlyTax = tax / 12;
 return {
 primary: { label: "월 원천징수 추정", value: Math.round(monthlyTax), suffix: "원" },
 secondary: [
 { label: "연 산출세액 추정", value: Math.round(tax), suffix: "원" },
 { label: "지방소득세 (10%)", value: Math.round(monthlyTax * 0.1), suffix: "원" },
 ],
 note: "간이세액표 근사치. 실제는 회사가 적용하는 간이세액표·비과세 항목에 따라 다름.",
 };
 },
 },
 {
 slug: "retirement-income-tax-quick",
 title: "퇴직소득세 간편 계산",
 description: "퇴직금 + 근속연수 → 환산급여 방식 퇴직소득세",
 category: "tax",
 categoryLabel: "세금",
 keywords: ["퇴직소득세", "퇴직금 세금"],
 fields: [
 { name: "severance", label: "퇴직금", defaultValue: 50000000, suffix: "원" },
 { name: "years", label: "근속연수", defaultValue: 10, suffix: "년" },
 ],
 compute: ({ severance, years }) => {
 // 환산급여 = (퇴직금 - 근속연수공제) ÷ 근속연수 × 12
 const yearsDeduction =
 years <= 5 ? years * 1000000 :
 years <= 10 ? 5000000 + (years - 5) * 2000000 :
 years <= 20 ? 15000000 + (years - 10) * 2500000 :
 40000000 + (years - 20) * 3000000;
 const adjusted = ((severance - yearsDeduction) / years) * 12;
 const tax = adjusted * 0.15 - 1260000; // 단순 추정
 return {
 primary: { label: "예상 퇴직소득세", value: Math.round(Math.max(0, tax)), suffix: "원" },
 secondary: [
 { label: "근속연수공제", value: yearsDeduction, suffix: "원" },
 { label: "환산급여", value: Math.round(adjusted), suffix: "원" },
 ],
 note: "환산급여 방식 단순 추정. 정확한 계산은 국세청 홈택스 모의계산 권장.",
 };
 },
 },
 {
 slug: "real-estate-capital-gains-quick",
 title: "부동산 양도세 간편 계산",
 description: "1세대 1주택 비과세 vs 일반 양도 비교",
 category: "tax",
 categoryLabel: "세금",
 keywords: ["양도소득세", "부동산 양도세"],
 fields: [
 { name: "buy", label: "매수가", defaultValue: 500000000, suffix: "원" },
 { name: "sell", label: "매도가", defaultValue: 800000000, suffix: "원" },
 { name: "years", label: "보유기간", defaultValue: 5, suffix: "년" },
 ],
 compute: ({ buy, sell, years }) => {
 const gain = sell - buy;
 const longTerm = years >= 3 ? 0.06 + Math.min(years - 3, 12) * 0.02 : 0;
 const adjustedGain = gain * (1 - Math.min(longTerm, 0.3));
 let tax = 0;
 if (adjustedGain <= 14000000) tax = adjustedGain * 0.06;
 else if (adjustedGain <= 50000000) tax = adjustedGain * 0.15 - 1260000;
 else if (adjustedGain <= 88000000) tax = adjustedGain * 0.24 - 5760000;
 else if (adjustedGain <= 150000000) tax = adjustedGain * 0.35 - 15440000;
 else tax = adjustedGain * 0.38 - 19940000;
 return {
 primary: { label: "예상 양도세", value: Math.round(Math.max(0, tax * 1.1)), suffix: "원" },
 secondary: [
 { label: "양도차익", value: gain, suffix: "원" },
 { label: "장기보유특별공제율", value: longTerm * 100, suffix: "%" },
 ],
 note: "1세대 1주택 12억 비과세 미반영. 정확 계산은 세무사 상담 필수.",
 };
 },
 },
 {
 slug: "stock-capital-gains-quick",
 title: "주식 양도세 간편 계산",
 description: "해외주식 양도차익 → 250만 공제 후 22% 적용",
 category: "tax",
 categoryLabel: "세금",
 keywords: ["주식 양도세", "해외주식 세금"],
 fields: [
 { name: "buy", label: "매수가 합계", defaultValue: 10000000, suffix: "원" },
 { name: "sell", label: "매도가 합계", defaultValue: 15000000, suffix: "원" },
 ],
 compute: ({ buy, sell }) => {
 const gain = sell - buy;
 const taxable = Math.max(0, gain - 2500000);
 const tax = taxable * 0.22;
 return {
 primary: { label: "예상 양도세 (22%)", value: Math.round(tax), suffix: "원" },
 secondary: [
 { label: "양도차익", value: gain, suffix: "원" },
 { label: "기본공제 250만 차감", value: taxable, suffix: "원" },
 ],
 };
 },
 },
 {
 slug: "dividend-tax-quick",
 title: "배당소득세 계산",
 description: "배당금 → 15.4% 분리과세 또는 종합과세 비교",
 category: "tax",
 categoryLabel: "세금",
 keywords: ["배당소득세", "배당금 세금"],
 fields: [{ name: "dividend", label: "연 배당금 합계", defaultValue: 5000000, suffix: "원" }],
 compute: ({ dividend }) => {
 const separate = dividend * 0.154;
 return {
 primary: { label: "분리과세 (15.4%)", value: Math.round(separate), suffix: "원" },
 secondary: [
 { label: "실수령 배당", value: Math.round(dividend - separate), suffix: "원" },
 ],
 note: "이자·배당 합계 2,000만 초과 시 종합과세 합산. 본업 연봉 + 배당으로 누진세율 상승 가능.",
 };
 },
 },
 {
 slug: "interest-tax-quick",
 title: "이자소득세 계산",
 description: "예금 이자 → 15.4% 원천징수 후 실수령액",
 category: "tax",
 categoryLabel: "세금",
 keywords: ["이자소득세", "예금 이자세"],
 fields: [{ name: "interest", label: "이자 수령액", defaultValue: 1000000, suffix: "원" }],
 compute: ({ interest }) => {
 const tax = interest * 0.154;
 return {
 primary: { label: "원천징수세", value: Math.round(tax), suffix: "원" },
 secondary: [{ label: "실수령 이자", value: Math.round(interest - tax), suffix: "원" }],
 };
 },
 },
 {
 slug: "vat-quick",
 title: "부가가치세(VAT) 계산",
 description: "공급가액 → VAT 10% / VAT 포함가 → 공급가 역산",
 category: "tax",
 categoryLabel: "세금",
 keywords: ["부가세", "VAT"],
 fields: [{ name: "supply", label: "공급가액", defaultValue: 1000000, suffix: "원" }],
 compute: ({ supply }) => {
 const vat = supply * 0.1;
 return {
 primary: { label: "VAT 10%", value: Math.round(vat), suffix: "원" },
 secondary: [{ label: "총 청구액 (공급+VAT)", value: Math.round(supply + vat), suffix: "원" }],
 };
 },
 },
 {
 slug: "vat-reverse-quick",
 title: "부가세 역산 (VAT 포함가 → 공급가)",
 description: "VAT 포함된 가격에서 공급가·부가세 분리",
 category: "tax",
 categoryLabel: "세금",
 keywords: ["부가세 역산", "VAT 분리"],
 fields: [{ name: "total", label: "VAT 포함 총액", defaultValue: 1100000, suffix: "원" }],
 compute: ({ total }) => {
 const supply = total / 1.1;
 const vat = total - supply;
 return {
 primary: { label: "공급가액", value: Math.round(supply), suffix: "원" },
 secondary: [{ label: "부가세 (10%)", value: Math.round(vat), suffix: "원" }],
 };
 },
 },
 {
 slug: "import-tax-quick",
 title: "해외 직구 관세·부가세 계산",
 description: "해외 구매가 + 관세 + VAT → 총 세금",
 category: "tax",
 categoryLabel: "세금",
 keywords: ["해외 직구 세금", "관세"],
 fields: [
 { name: "price", label: "물품가 + 운송비 (CIF)", defaultValue: 200000, suffix: "원" },
 { name: "duty", label: "관세율", defaultValue: 8, suffix: "%" },
 ],
 compute: ({ price, duty }) => {
 const customs = price * (duty / 100);
 const vat = (price + customs) * 0.1;
 return {
 primary: { label: "총 세금 (관세+VAT)", value: Math.round(customs + vat), suffix: "원" },
 secondary: [
 { label: "관세", value: Math.round(customs), suffix: "원" },
 { label: "부가세", value: Math.round(vat), suffix: "원" },
 ],
 note: "150 USD 이하 면세 (미국 200 USD). 통관 절차·품목별 관세율은 관세청 확인.",
 };
 },
 },
];

// ─── 연봉 (Salary) 10개 ──────────────────────────────────────
const SALARY: CalculatorDef[] = [
 {
 slug: "hourly-to-yearly",
 title: "시급 → 연봉 환산",
 description: "시급 + 주 근무시간 → 월급·연봉 환산",
 category: "salary",
 categoryLabel: "연봉",
 keywords: ["시급 연봉 환산", "시급 계산"],
 fields: [
 { name: "hourly", label: "시급", defaultValue: 10320, suffix: "원" },
 { name: "weekHours", label: "주 근무시간", defaultValue: 40, suffix: "시간" },
 ],
 compute: ({ hourly, weekHours }) => {
 const weekly = hourly * weekHours;
 const monthly = weekly * 4.345;
 const yearly = monthly * 12;
 return {
 primary: { label: "예상 연봉", value: Math.round(yearly), suffix: "원" },
 secondary: [
 { label: "주급", value: Math.round(weekly), suffix: "원" },
 { label: "월급", value: Math.round(monthly), suffix: "원" },
 ],
 };
 },
 },
 {
 slug: "yearly-to-hourly",
 title: "연봉 → 시급 환산",
 description: "연봉 + 주 근무시간 → 시급 역산",
 category: "salary",
 categoryLabel: "연봉",
 keywords: ["연봉 시급 환산", "연봉 시급"],
 fields: [
 { name: "yearly", label: "연봉", defaultValue: 50000000, suffix: "원" },
 { name: "weekHours", label: "주 근무시간", defaultValue: 40, suffix: "시간" },
 ],
 compute: ({ yearly, weekHours }) => {
 const monthly = yearly / 12;
 const weekly = monthly / 4.345;
 const hourly = weekly / weekHours;
 return {
 primary: { label: "환산 시급", value: Math.round(hourly), suffix: "원" },
 secondary: [
 { label: "주급", value: Math.round(weekly), suffix: "원" },
 { label: "월급", value: Math.round(monthly), suffix: "원" },
 ],
 };
 },
 },
 {
 slug: "weekly-pay",
 title: "주급 계산",
 description: "월급 → 주급 환산 (주 5일 기준)",
 category: "salary",
 categoryLabel: "연봉",
 keywords: ["주급 계산", "주급"],
 fields: [{ name: "monthly", label: "월급", defaultValue: 3000000, suffix: "원" }],
 compute: ({ monthly }) => {
 const weekly = monthly / 4.345;
 const daily = weekly / 5;
 return {
 primary: { label: "주급", value: Math.round(weekly), suffix: "원" },
 secondary: [{ label: "일급 (주 5일)", value: Math.round(daily), suffix: "원" }],
 };
 },
 },
 {
 slug: "daily-pay",
 title: "일급 계산",
 description: "월급/연봉 → 일급 환산",
 category: "salary",
 categoryLabel: "연봉",
 keywords: ["일급 계산", "하루 임금"],
 fields: [
 { name: "yearly", label: "연봉", defaultValue: 50000000, suffix: "원" },
 { name: "workDays", label: "연 근무일수", defaultValue: 250, suffix: "일" },
 ],
 compute: ({ yearly, workDays }) => {
 const daily = yearly / workDays;
 return {
 primary: { label: "일급", value: Math.round(daily), suffix: "원" },
 };
 },
 },
 {
 slug: "holiday-allowance-quick",
 title: "주휴수당 계산",
 description: "시급 × 8시간 = 주휴수당. 주 15시간+ 근무자 의무 지급",
 category: "salary",
 categoryLabel: "연봉",
 keywords: ["주휴수당", "주휴수당 계산"],
 fields: [{ name: "hourly", label: "시급", defaultValue: 10320, suffix: "원" }],
 compute: ({ hourly }) => {
 const weekly = hourly * 8;
 return {
 primary: { label: "주 1회 주휴수당", value: Math.round(weekly), suffix: "원" },
 secondary: [
 { label: "월 4회분 (4.345주)", value: Math.round(weekly * 4.345), suffix: "원" },
 ],
 note: "주 15시간 이상 일한 근로자에게 주 1일 추가 임금 지급 의무 (근로기준법).",
 };
 },
 },
 {
 slug: "overtime-pay-quick",
 title: "시간외 수당 계산",
 description: "시급 × 1.5배 = 시간외 수당 (8시간 초과)",
 category: "salary",
 categoryLabel: "연봉",
 keywords: ["시간외 수당", "야근 수당"],
 fields: [
 { name: "hourly", label: "통상시급", defaultValue: 15000, suffix: "원" },
 { name: "hours", label: "시간외 근무시간", defaultValue: 10, suffix: "시간" },
 ],
 compute: ({ hourly, hours }) => {
 const overtime = hourly * 1.5 * hours;
 return {
 primary: { label: "시간외 수당", value: Math.round(overtime), suffix: "원" },
 secondary: [{ label: "할증분 (50%)", value: Math.round(hourly * 0.5 * hours), suffix: "원" }],
 };
 },
 },
 {
 slug: "night-shift-pay-quick",
 title: "야간 근로 수당 계산",
 description: "22시~06시 근무 시 시급 × 1.5배",
 category: "salary",
 categoryLabel: "연봉",
 keywords: ["야간수당", "심야수당"],
 fields: [
 { name: "hourly", label: "통상시급", defaultValue: 15000, suffix: "원" },
 { name: "hours", label: "야간 근무시간", defaultValue: 5, suffix: "시간" },
 ],
 compute: ({ hourly, hours }) => {
 const night = hourly * 1.5 * hours;
 return {
 primary: { label: "야간 수당", value: Math.round(night), suffix: "원" },
 };
 },
 },
 {
 slug: "weekend-pay-quick",
 title: "휴일 근로 수당",
 description: "8시간 이내 1.5배, 8시간 초과 2배",
 category: "salary",
 categoryLabel: "연봉",
 keywords: ["휴일수당", "주말근무"],
 fields: [
 { name: "hourly", label: "통상시급", defaultValue: 15000, suffix: "원" },
 { name: "hours", label: "휴일 근무시간", defaultValue: 8, suffix: "시간" },
 ],
 compute: ({ hourly, hours }) => {
 const within = Math.min(hours, 8) * hourly * 1.5;
 const beyond = Math.max(0, hours - 8) * hourly * 2;
 return {
 primary: { label: "휴일 수당", value: Math.round(within + beyond), suffix: "원" },
 secondary: [
 { label: "8시간 이내 (1.5배)", value: Math.round(within), suffix: "원" },
 { label: "8시간 초과 (2배)", value: Math.round(beyond), suffix: "원" },
 ],
 };
 },
 },
 {
 slug: "annual-leave-pay-quick",
 title: "연차수당 계산",
 description: "남은 연차 × 일급 = 미사용 연차수당",
 category: "salary",
 categoryLabel: "연봉",
 keywords: ["연차수당", "연차 계산"],
 fields: [
 { name: "monthly", label: "월급", defaultValue: 3000000, suffix: "원" },
 { name: "days", label: "남은 연차일수", defaultValue: 5, suffix: "일" },
 ],
 compute: ({ monthly, days }) => {
 const dailyWage = monthly / 30 * 8 / 8; // 통상임금 단순화 (월 209시간 기준)
 const daily = monthly / 209 * 8;
 const total = daily * days;
 return {
 primary: { label: "연차수당", value: Math.round(total), suffix: "원" },
 secondary: [{ label: "1일 통상임금", value: Math.round(daily), suffix: "원" }],
 };
 },
 },
 {
 slug: "severance-pay-quick",
 title: "퇴직금 간편 계산",
 description: "30일분 평균임금 × 근속연수",
 category: "salary",
 categoryLabel: "연봉",
 keywords: ["퇴직금 계산", "퇴직금"],
 fields: [
 { name: "monthly", label: "최근 3개월 평균 월급", defaultValue: 3500000, suffix: "원" },
 { name: "years", label: "근속연수", defaultValue: 5, suffix: "년" },
 ],
 compute: ({ monthly, years }) => {
 const severance = monthly * years;
 return {
 primary: { label: "예상 퇴직금", value: Math.round(severance), suffix: "원" },
 note: "근속 1년 이상 정규직 근로자 의무 지급. IRP 이전 시 절세 가능.",
 };
 },
 },
];

// ─── 대출 (Loan) 10개 ───────────────────────────────────────
const LOAN: CalculatorDef[] = [
 {
 slug: "loan-monthly-payment",
 title: "대출 월 상환액 계산",
 description: "원리금균등 방식 월 상환액",
 category: "loan",
 categoryLabel: "대출",
 keywords: ["대출 월 상환", "원리금균등"],
 fields: [
 { name: "amount", label: "대출액", defaultValue: 100000000, suffix: "원" },
 { name: "rate", label: "연이자율", defaultValue: 4, suffix: "%" },
 { name: "years", label: "기간", defaultValue: 10, suffix: "년" },
 ],
 compute: ({ amount, rate, years }) => {
 const r = rate / 100 / 12;
 const n = years * 12;
 const monthly = (amount * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
 const total = monthly * n;
 return {
 primary: { label: "월 상환액", value: Math.round(monthly), suffix: "원" },
 secondary: [
 { label: "총 상환액", value: Math.round(total), suffix: "원" },
 { label: "총 이자", value: Math.round(total - amount), suffix: "원" },
 ],
 };
 },
 },
 {
 slug: "loan-total-interest",
 title: "대출 총 이자 계산",
 description: "대출 기간 동안 부담할 총 이자 합계",
 category: "loan",
 categoryLabel: "대출",
 keywords: ["대출 이자", "총 이자"],
 fields: [
 { name: "amount", label: "대출액", defaultValue: 100000000, suffix: "원" },
 { name: "rate", label: "연이자율", defaultValue: 4, suffix: "%" },
 { name: "years", label: "기간", defaultValue: 30, suffix: "년" },
 ],
 compute: ({ amount, rate, years }) => {
 const r = rate / 100 / 12;
 const n = years * 12;
 const monthly = (amount * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
 const total = monthly * n;
 const interest = total - amount;
 return {
 primary: { label: "총 이자", value: Math.round(interest), suffix: "원" },
 secondary: [{ label: "원금 대비 비율", value: (interest / amount) * 100, suffix: "%" }],
 };
 },
 },
 {
 slug: "dsr-quick",
 title: "DSR 한도 계산",
 description: "연소득 × 40% = DSR 한도 → 가능 대출액 추정",
 category: "loan",
 categoryLabel: "대출",
 keywords: ["DSR", "대출 한도"],
 fields: [
 { name: "yearly", label: "연소득", defaultValue: 50000000, suffix: "원" },
 { name: "rate", label: "이자율", defaultValue: 4, suffix: "%" },
 { name: "years", label: "기간", defaultValue: 30, suffix: "년" },
 ],
 compute: ({ yearly, rate, years }) => {
 const annualLimit = yearly * 0.4;
 const monthlyLimit = annualLimit / 12;
 const r = rate / 100 / 12;
 const n = years * 12;
 const principal = (monthlyLimit * (Math.pow(1 + r, n) - 1)) / (r * Math.pow(1 + r, n));
 return {
 primary: { label: "DSR 한도 대출액", value: Math.round(principal), suffix: "원" },
 secondary: [
 { label: "연 원리금 한도", value: Math.round(annualLimit), suffix: "원" },
 { label: "월 한도", value: Math.round(monthlyLimit), suffix: "원" },
 ],
 };
 },
 },
 {
 slug: "ltv-quick",
 title: "LTV 한도 계산",
 description: "주택가격 × LTV 비율 = 가능 대출액",
 category: "loan",
 categoryLabel: "대출",
 keywords: ["LTV", "주담대 한도"],
 fields: [
 { name: "price", label: "주택가격", defaultValue: 500000000, suffix: "원" },
 { name: "ltv", label: "LTV 비율", defaultValue: 60, suffix: "%" },
 ],
 compute: ({ price, ltv }) => {
 const limit = price * (ltv / 100);
 return {
 primary: { label: "LTV 한도 대출액", value: Math.round(limit), suffix: "원" },
 secondary: [{ label: "본인 자기자본 필요", value: Math.round(price - limit), suffix: "원" }],
 };
 },
 },
 {
 slug: "level-principal-payment",
 title: "원금균등 상환 계산",
 description: "매월 원금 + 줄어드는 이자",
 category: "loan",
 categoryLabel: "대출",
 keywords: ["원금균등", "원금균등상환"],
 fields: [
 { name: "amount", label: "대출액", defaultValue: 100000000, suffix: "원" },
 { name: "rate", label: "연이자율", defaultValue: 4, suffix: "%" },
 { name: "years", label: "기간", defaultValue: 10, suffix: "년" },
 ],
 compute: ({ amount, rate, years }) => {
 const n = years * 12;
 const monthlyPrincipal = amount / n;
 const firstInterest = (amount * rate) / 100 / 12;
 const totalInterest = (firstInterest * (n + 1)) / 2;
 return {
 primary: { label: "초기 월 상환액", value: Math.round(monthlyPrincipal + firstInterest), suffix: "원" },
 secondary: [
 { label: "월 원금", value: Math.round(monthlyPrincipal), suffix: "원" },
 { label: "총 이자", value: Math.round(totalInterest), suffix: "원" },
 ],
 note: "원금균등은 초기 부담 크지만 총 이자가 적음 (원리금균등 대비 약 -20%).",
 };
 },
 },
 {
 slug: "bullet-loan",
 title: "만기일시 상환 계산",
 description: "기간 중 이자만 → 만기에 원금 전액 상환",
 category: "loan",
 categoryLabel: "대출",
 keywords: ["만기일시", "이자만 상환"],
 fields: [
 { name: "amount", label: "대출액", defaultValue: 100000000, suffix: "원" },
 { name: "rate", label: "연이자율", defaultValue: 4, suffix: "%" },
 { name: "years", label: "기간", defaultValue: 5, suffix: "년" },
 ],
 compute: ({ amount, rate, years }) => {
 const monthly = (amount * rate) / 100 / 12;
 const total = monthly * years * 12;
 return {
 primary: { label: "월 이자", value: Math.round(monthly), suffix: "원" },
 secondary: [
 { label: "총 이자", value: Math.round(total), suffix: "원" },
 { label: "만기 시 원금 상환", value: amount, suffix: "원" },
 ],
 note: "만기에 원금 전액 일시 상환. 단기 자금이나 부동산 임대 수익 활용 시 적합.",
 };
 },
 },
 {
 slug: "loan-affordability",
 title: "내 연봉 가능 대출액",
 description: "연봉 + DSR 40% + 기간 → 최대 대출 가능액",
 category: "loan",
 categoryLabel: "대출",
 keywords: ["연봉 대출 한도", "내 연봉 대출"],
 fields: [
 { name: "yearly", label: "연봉", defaultValue: 50000000, suffix: "원" },
 { name: "rate", label: "예상 금리", defaultValue: 4, suffix: "%" },
 ],
 compute: ({ yearly, rate }) => {
 const monthlyLimit = (yearly * 0.4) / 12;
 const r = rate / 100 / 12;
 const n = 30 * 12;
 const principal = (monthlyLimit * (Math.pow(1 + r, n) - 1)) / (r * Math.pow(1 + r, n));
 return {
 primary: { label: "30년 만기 가능 대출액", value: Math.round(principal), suffix: "원" },
 secondary: [{ label: "월 상환 한도", value: Math.round(monthlyLimit), suffix: "원" }],
 };
 },
 },
 {
 slug: "prepayment-fee-quick",
 title: "중도상환 수수료 계산",
 description: "중도상환액 × 수수료율 × 잔여기간 비율",
 category: "loan",
 categoryLabel: "대출",
 keywords: ["중도상환수수료", "대출 갈아타기"],
 fields: [
 { name: "amount", label: "중도상환액", defaultValue: 30000000, suffix: "원" },
 { name: "rate", label: "수수료율", defaultValue: 1.5, suffix: "%" },
 { name: "remaining", label: "잔여기간 비율", defaultValue: 70, suffix: "%" },
 ],
 compute: ({ amount, rate, remaining }) => {
 const fee = amount * (rate / 100) * (remaining / 100);
 return {
 primary: { label: "중도상환 수수료", value: Math.round(fee), suffix: "원" },
 note: "보통 3년 이내 상환 시 수수료 발생. 갈아타기 전 절감액과 비교 필수.",
 };
 },
 },
 {
 slug: "loan-refinance-savings",
 title: "대출 갈아타기 절감액",
 description: "기존 vs 신규 금리 차이 누적 이자 절감",
 category: "loan",
 categoryLabel: "대출",
 keywords: ["대출 갈아타기", "리파이낸싱"],
 fields: [
 { name: "amount", label: "잔여 원금", defaultValue: 200000000, suffix: "원" },
 { name: "oldRate", label: "기존 금리", defaultValue: 5, suffix: "%" },
 { name: "newRate", label: "신규 금리", defaultValue: 3.5, suffix: "%" },
 { name: "years", label: "잔여기간", defaultValue: 20, suffix: "년" },
 ],
 compute: ({ amount, oldRate, newRate, years }) => {
 const calc = (rate: number) => {
 const r = rate / 100 / 12;
 const n = years * 12;
 return ((amount * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1)) * n - amount;
 };
 const saving = calc(oldRate) - calc(newRate);
 return {
 primary: { label: "총 이자 절감", value: Math.round(saving), suffix: "원" },
 secondary: [{ label: "월 절감", value: Math.round(saving / (years * 12)), suffix: "원" }],
 note: "중도상환 수수료 차감 후 순절감액으로 판단. 0.5%p+ 차이일 때 갈아타기 유리.",
 };
 },
 },
 {
 slug: "monthly-installment",
 title: "할부 이자 계산",
 description: "신용카드/캐피탈 할부 월 납부액",
 category: "loan",
 categoryLabel: "대출",
 keywords: ["할부 이자", "카드 할부"],
 fields: [
 { name: "amount", label: "할부 원금", defaultValue: 5000000, suffix: "원" },
 { name: "rate", label: "할부 수수료율", defaultValue: 12, suffix: "%" },
 { name: "months", label: "할부 개월", defaultValue: 12, suffix: "개월" },
 ],
 compute: ({ amount, rate, months }) => {
 const r = rate / 100 / 12;
 const monthly = (amount * r * Math.pow(1 + r, months)) / (Math.pow(1 + r, months) - 1);
 const total = monthly * months;
 return {
 primary: { label: "월 납부액", value: Math.round(monthly), suffix: "원" },
 secondary: [
 { label: "총 납부액", value: Math.round(total), suffix: "원" },
 { label: "총 수수료(이자)", value: Math.round(total - amount), suffix: "원" },
 ],
 };
 },
 },
];

// ─── 투자 (Investment) 15개 ───────────────────────────────────
const INVESTMENT: CalculatorDef[] = [
 {
 slug: "compound-interest-quick",
 title: "복리 계산기",
 description: "원금 + 매월 적립 + 연 수익률 → 미래가치",
 category: "investment",
 categoryLabel: "투자",
 keywords: ["복리 계산", "복리"],
 fields: [
 { name: "principal", label: "초기 원금", defaultValue: 10000000, suffix: "원" },
 { name: "monthly", label: "월 적립금", defaultValue: 500000, suffix: "원" },
 { name: "rate", label: "연 수익률", defaultValue: 7, suffix: "%" },
 { name: "years", label: "기간", defaultValue: 20, suffix: "년" },
 ],
 compute: ({ principal, monthly, rate, years }) => {
 const r = rate / 100 / 12;
 const n = years * 12;
 const future = principal * Math.pow(1 + r, n) + monthly * ((Math.pow(1 + r, n) - 1) / r);
 const totalInvested = principal + monthly * n;
 return {
 primary: { label: "미래 자산", value: Math.round(future), suffix: "원" },
 secondary: [
 { label: "총 투자 원금", value: Math.round(totalInvested), suffix: "원" },
 { label: "수익", value: Math.round(future - totalInvested), suffix: "원" },
 ],
 };
 },
 },
 {
 slug: "simple-interest-quick",
 title: "단리 계산기",
 description: "원금 × 이자율 × 기간 (단리)",
 category: "investment",
 categoryLabel: "투자",
 keywords: ["단리 계산", "단리"],
 fields: [
 { name: "principal", label: "원금", defaultValue: 10000000, suffix: "원" },
 { name: "rate", label: "연 이자율", defaultValue: 4, suffix: "%" },
 { name: "years", label: "기간", defaultValue: 5, suffix: "년" },
 ],
 compute: ({ principal, rate, years }) => {
 const interest = principal * (rate / 100) * years;
 return {
 primary: { label: "총 이자", value: Math.round(interest), suffix: "원" },
 secondary: [{ label: "만기 자산", value: Math.round(principal + interest), suffix: "원" }],
 };
 },
 },
 {
 slug: "cagr-quick",
 title: "연평균 수익률 (CAGR)",
 description: "초기/최종 자산 → 연평균 복리 수익률",
 category: "investment",
 categoryLabel: "투자",
 keywords: ["CAGR", "연평균 수익률"],
 fields: [
 { name: "initial", label: "초기 자산", defaultValue: 10000000, suffix: "원" },
 { name: "final", label: "최종 자산", defaultValue: 30000000, suffix: "원" },
 { name: "years", label: "기간", defaultValue: 10, suffix: "년" },
 ],
 compute: ({ initial, final, years }) => {
 const cagr = (Math.pow(final / initial, 1 / years) - 1) * 100;
 return {
 primary: { label: "CAGR", value: cagr, suffix: "%" },
 secondary: [{ label: "총 수익률", value: ((final - initial) / initial) * 100, suffix: "%" }],
 };
 },
 },
 {
 slug: "rule-of-72-quick",
 title: "72의 법칙 — 자산 2배 시간",
 description: "72 ÷ 수익률 = 자산 2배 되는 연수",
 category: "investment",
 categoryLabel: "투자",
 keywords: ["72의 법칙", "복리"],
 fields: [{ name: "rate", label: "연 수익률", defaultValue: 7, suffix: "%" }],
 compute: ({ rate }) => {
 const years = 72 / rate;
 return {
 primary: { label: "자산 2배 되는 시간", value: years, suffix: "년" },
 note: "복리의 마법. 7% 수익률이면 약 10년에 자산 2배.",
 };
 },
 },
 {
 slug: "savings-goal-time",
 title: "저축 목표 도달 시간",
 description: "월 저축액 + 목표 → 도달 시간",
 category: "investment",
 categoryLabel: "투자",
 keywords: ["저축 목표", "목돈 만들기"],
 fields: [
 { name: "goal", label: "목표 자산", defaultValue: 100000000, suffix: "원" },
 { name: "monthly", label: "월 저축", defaultValue: 1000000, suffix: "원" },
 { name: "rate", label: "연 수익률", defaultValue: 5, suffix: "%" },
 ],
 compute: ({ goal, monthly, rate }) => {
 const r = rate / 100 / 12;
 const months = Math.log(1 + (goal * r) / monthly) / Math.log(1 + r);
 return {
 primary: { label: "도달 시간", value: months / 12, suffix: "년" },
 secondary: [{ label: "총 월수", value: Math.round(months), suffix: "개월" }],
 };
 },
 },
 {
 slug: "fire-target",
 title: "FIRE 목표 자산",
 description: "월 생활비 × 12 ÷ 3.5% = 은퇴 자산",
 category: "investment",
 categoryLabel: "투자",
 keywords: ["FIRE", "은퇴 자산"],
 fields: [
 { name: "monthly", label: "은퇴 후 월 생활비", defaultValue: 3000000, suffix: "원" },
 { name: "withdrawRate", label: "안전 인출률", defaultValue: 3.5, suffix: "%" },
 ],
 compute: ({ monthly, withdrawRate }) => {
 const yearly = monthly * 12;
 const target = yearly / (withdrawRate / 100);
 return {
 primary: { label: "FIRE 목표 자산", value: Math.round(target), suffix: "원" },
 secondary: [{ label: "연 인출 가능액", value: yearly, suffix: "원" }],
 note: "한국형은 3~3.5% 룰 권장 (인플레이션·의료비 고려).",
 };
 },
 },
 {
 slug: "dollar-cost-average",
 title: "적립식 투자 시뮬",
 description: "매월 같은 금액 적립 + 평균 수익률",
 category: "investment",
 categoryLabel: "투자",
 keywords: ["적립식", "DCA"],
 fields: [
 { name: "monthly", label: "월 매수액", defaultValue: 500000, suffix: "원" },
 { name: "rate", label: "연 평균 수익률", defaultValue: 8, suffix: "%" },
 { name: "years", label: "기간", defaultValue: 10, suffix: "년" },
 ],
 compute: ({ monthly, rate, years }) => {
 const r = rate / 100 / 12;
 const n = years * 12;
 const future = monthly * ((Math.pow(1 + r, n) - 1) / r);
 const invested = monthly * n;
 return {
 primary: { label: "최종 자산", value: Math.round(future), suffix: "원" },
 secondary: [
 { label: "총 투자", value: invested, suffix: "원" },
 { label: "수익", value: Math.round(future - invested), suffix: "원" },
 ],
 };
 },
 },
 {
 slug: "dividend-yield-quick",
 title: "배당 수익률 계산",
 description: "주가 + 연 배당금 → 배당 수익률",
 category: "investment",
 categoryLabel: "투자",
 keywords: ["배당 수익률", "배당주"],
 fields: [
 { name: "price", label: "주가", defaultValue: 50000, suffix: "원" },
 { name: "dividend", label: "연 배당금", defaultValue: 2000, suffix: "원" },
 ],
 compute: ({ price, dividend }) => {
 const yieldRate = (dividend / price) * 100;
 return {
 primary: { label: "배당 수익률", value: yieldRate, suffix: "%" },
 secondary: [{ label: "100주 매수 시 연 배당", value: dividend * 100, suffix: "원" }],
 };
 },
 },
 {
 slug: "real-return-quick",
 title: "실질 수익률 (인플레이션 차감)",
 description: "명목 수익률 - 인플레이션 = 실질",
 category: "investment",
 categoryLabel: "투자",
 keywords: ["실질 수익률", "인플레이션"],
 fields: [
 { name: "nominal", label: "명목 수익률", defaultValue: 7, suffix: "%" },
 { name: "inflation", label: "인플레이션율", defaultValue: 3, suffix: "%" },
 ],
 compute: ({ nominal, inflation }) => {
 const real = ((1 + nominal / 100) / (1 + inflation / 100) - 1) * 100;
 return {
 primary: { label: "실질 수익률", value: real, suffix: "%" },
 note: "인플레이션 고려한 진짜 수익. 예금 이자가 인플레보다 낮으면 실질 마이너스.",
 };
 },
 },
 {
 slug: "inflation-impact-quick",
 title: "인플레이션 구매력 영향",
 description: "현재 가치 → N년 후 실질 가치",
 category: "investment",
 categoryLabel: "투자",
 keywords: ["인플레이션", "구매력"],
 fields: [
 { name: "value", label: "현재 자산", defaultValue: 100000000, suffix: "원" },
 { name: "inflation", label: "연 인플레이션", defaultValue: 3, suffix: "%" },
 { name: "years", label: "기간", defaultValue: 20, suffix: "년" },
 ],
 compute: ({ value, inflation, years }) => {
 const future = value / Math.pow(1 + inflation / 100, years);
 return {
 primary: { label: "20년 후 실질 가치", value: Math.round(future), suffix: "원" },
 secondary: [{ label: "구매력 감소", value: ((value - future) / value) * 100, suffix: "%" }],
 note: "예금만 가지고 있으면 인플레이션에 자산 가치 잠식. ETF 등 운용 필수.",
 };
 },
 },
 {
 slug: "stock-pl-quick",
 title: "주식 손익 계산",
 description: "매수가·매도가·수량 → 손익",
 category: "investment",
 categoryLabel: "투자",
 keywords: ["주식 손익", "주식 수익"],
 fields: [
 { name: "buy", label: "매수가", defaultValue: 50000, suffix: "원" },
 { name: "sell", label: "매도가", defaultValue: 60000, suffix: "원" },
 { name: "quantity", label: "수량", defaultValue: 100, suffix: "주" },
 ],
 compute: ({ buy, sell, quantity }) => {
 const pl = (sell - buy) * quantity;
 const pct = ((sell - buy) / buy) * 100;
 return {
 primary: { label: "손익", value: Math.round(pl), suffix: "원" },
 secondary: [
 { label: "수익률", value: pct, suffix: "%" },
 { label: "총 매도금", value: sell * quantity, suffix: "원" },
 ],
 };
 },
 },
 {
 slug: "etf-fee-impact",
 title: "ETF 운용수수료 누적 영향",
 description: "수수료 차이 0.3% vs 1.5% → 30년 후 자산 차이",
 category: "investment",
 categoryLabel: "투자",
 keywords: ["ETF 수수료", "펀드 수수료"],
 fields: [
 { name: "monthly", label: "월 적립", defaultValue: 500000, suffix: "원" },
 { name: "years", label: "기간", defaultValue: 30, suffix: "년" },
 { name: "rate", label: "기본 수익률", defaultValue: 7, suffix: "%" },
 { name: "feeDiff", label: "수수료 차이 (%p)", defaultValue: 1.2, suffix: "%p" },
 ],
 compute: ({ monthly, years, rate, feeDiff }) => {
 const calc = (effectiveRate: number) => {
 const r = effectiveRate / 100 / 12;
 const n = years * 12;
 return monthly * ((Math.pow(1 + r, n) - 1) / r);
 };
 const high = calc(rate);
 const low = calc(rate - feeDiff);
 return {
 primary: { label: "수수료 누적 손실", value: Math.round(high - low), suffix: "원" },
 secondary: [
 { label: "저수수료 자산", value: Math.round(high), suffix: "원" },
 { label: "고수수료 자산", value: Math.round(low), suffix: "원" },
 ],
 note: "수수료 1.2%p 차이가 30년 누적 시 매우 큰 자산 차이. ETF가 펀드보다 유리.",
 };
 },
 },
 {
 slug: "bond-yield-quick",
 title: "채권 수익률 계산",
 description: "액면가·쿠폰·매수가 → 만기 수익률",
 category: "investment",
 categoryLabel: "투자",
 keywords: ["채권 수익률", "YTM"],
 fields: [
 { name: "face", label: "액면가", defaultValue: 10000, suffix: "원" },
 { name: "buy", label: "매수가", defaultValue: 9500, suffix: "원" },
 { name: "coupon", label: "연 쿠폰 (이자)", defaultValue: 400, suffix: "원" },
 { name: "years", label: "잔여기간", defaultValue: 5, suffix: "년" },
 ],
 compute: ({ face, buy, coupon, years }) => {
 const ytm = ((coupon + (face - buy) / years) / ((face + buy) / 2)) * 100;
 return {
 primary: { label: "만기수익률 (YTM)", value: ytm, suffix: "%" },
 secondary: [
 { label: "쿠폰 수익률", value: (coupon / buy) * 100, suffix: "%" },
 { label: "자본 수익", value: face - buy, suffix: "원" },
 ],
 };
 },
 },
 {
 slug: "portfolio-allocation",
 title: "포트폴리오 배분 시뮬",
 description: "주식·채권·현금 비중 → 평균 수익률 추정",
 category: "investment",
 categoryLabel: "투자",
 keywords: ["포트폴리오", "자산배분"],
 fields: [
 { name: "stockPct", label: "주식 비중", defaultValue: 60, suffix: "%" },
 { name: "bondPct", label: "채권 비중", defaultValue: 30, suffix: "%" },
 { name: "cashPct", label: "현금 비중", defaultValue: 10, suffix: "%" },
 ],
 compute: ({ stockPct, bondPct, cashPct }) => {
 const total = stockPct + bondPct + cashPct;
 const expected = (stockPct * 8 + bondPct * 4 + cashPct * 2.5) / total;
 return {
 primary: { label: "예상 연 수익률", value: expected, suffix: "%" },
 secondary: [
 { label: "총 비중 합계", value: total, suffix: "%" },
 { label: "주식 8% × 비중", value: (stockPct * 8) / 100, suffix: "%" },
 ],
 note: "주식 8%·채권 4%·현금 2.5% 가정. 비중 100% 합계가 되도록 조정.",
 };
 },
 },
 {
 slug: "exchange-impact-quick",
 title: "환율 변동 자산 영향",
 description: "달러 자산 + 환율 변동 → 원화 환산 손익",
 category: "investment",
 categoryLabel: "투자",
 keywords: ["환율 영향", "환테크"],
 fields: [
 { name: "usd", label: "달러 자산", defaultValue: 10000, suffix: "USD" },
 { name: "buyRate", label: "매수 환율", defaultValue: 1300, suffix: "원" },
 { name: "currentRate", label: "현재 환율", defaultValue: 1400, suffix: "원" },
 ],
 compute: ({ usd, buyRate, currentRate }) => {
 const buyKrw = usd * buyRate;
 const currentKrw = usd * currentRate;
 return {
 primary: { label: "환차익", value: currentKrw - buyKrw, suffix: "원" },
 secondary: [
 { label: "환율 변동", value: ((currentRate - buyRate) / buyRate) * 100, suffix: "%" },
 { label: "현재 원화 가치", value: currentKrw, suffix: "원" },
 ],
 };
 },
 },
];

export const batch1Calculators: CalculatorDef[] = [...TAX, ...SALARY, ...LOAN, ...INVESTMENT];
