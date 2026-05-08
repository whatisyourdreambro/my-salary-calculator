// src/lib/simpleCalculators/batch4.ts
// Phase 6 기능 확장 — 50개 신규 계산기 (세금·근로·투자·생활 심화).

import type { CalculatorDef } from "./types";

// ─── 세금 심화 (10개) ─────────────────────────────────────
const TAX_DEEP: CalculatorDef[] = [
 {
 slug: "comprehensive-property-tax",
 title: "종합부동산세 계산기",
 description: "공시가격 합계·1주택·다주택 차등 적용 종부세 산출",
 category: "tax",
 categoryLabel: "세금",
 keywords: ["종합부동산세", "종부세 계산", "1주택 종부세", "다주택 종부세"],
 fields: [
 { name: "totalPublicPrice", label: "공시가격 합계 (원)", defaultValue: 1_500_000_000, suffix: "원" },
 { name: "houseCount", label: "주택 수 (1=1주택, 2=2주택, 3=3주택+)", defaultValue: 1 },
 ],
 compute: ({ totalPublicPrice, houseCount }) => {
 // 1주택자 공제 12억, 다주택자 9억
 const deduction = houseCount === 1 ? 1_200_000_000 : 900_000_000;
 const taxBase = Math.max(0, totalPublicPrice - deduction) * 0.6; // 공정시장가액비율 60%
 // 1주택: 0.5~2.7%, 2주택: 0.5~3.6%, 3주택+: 0.5~6%
 let tax = 0;
 const isMulti = houseCount >= 2;
 if (taxBase <= 300_000_000) tax = taxBase * (isMulti ? 0.005 : 0.005);
 else if (taxBase <= 600_000_000) tax = taxBase * (isMulti ? 0.007 : 0.007) - 600_000;
 else if (taxBase <= 1_200_000_000) tax = taxBase * (isMulti ? 0.013 : 0.01) - 4_200_000;
 else if (taxBase <= 5_000_000_000) tax = taxBase * (isMulti ? 0.015 : 0.014) - 6_600_000;
 else tax = taxBase * (isMulti ? 0.027 : 0.02) - 50_000_000;
 const fairTax = Math.round(tax + tax * 0.2); // 농어촌특별세 20%
 return {
 primary: { label: "예상 종부세 (농특세 포함)", value: fairTax, suffix: "원" },
 secondary: [
 { label: "과세표준", value: taxBase, suffix: "원" },
 { label: "공제액", value: deduction, suffix: "원" },
 ],
 };
 },
 explanation: "종부세 = (공시가격 합계 - 공제) × 60% × 누진세율. 1주택 12억·다주택 9억 공제.",
 faqs: [{ q: "12억은 부부 합산?", a: "1주택자는 부부 합산 공시가 12억. 단독 명의면 9억." }],
 relatedSlugs: ["property-tax", "capital-gains-real-estate"],
 },
 {
 slug: "rental-income-tax",
 title: "주택임대 소득세 계산기",
 description: "연 2000만 초과 종합과세, 이하 분리과세 14% 자동 계산",
 category: "tax",
 categoryLabel: "세금",
 keywords: ["임대소득세", "주택임대 소득세", "분리과세 14%", "임대 소득"],
 fields: [
 { name: "annualRent", label: "연간 임대 수입", defaultValue: 18_000_000, suffix: "원" },
 { name: "expenses", label: "필요경비 (실액)", defaultValue: 7_200_000, suffix: "원" },
 ],
 compute: ({ annualRent, expenses }) => {
 // 2000만 이하: 분리과세 14% (또는 종합)
 // 2000만 초과: 종합과세 의무
 const ratio = annualRent <= 20_000_000 ? "분리과세 가능" : "종합과세 의무";
 const netIncome = Math.max(0, annualRent - expenses);
 const separateTax = Math.round(netIncome * 0.14);
 const localTax = Math.round(separateTax * 0.1);
 return {
 primary: { label: "분리과세 시 세액", value: separateTax + localTax, suffix: "원" },
 secondary: [
 { label: "과세 방식", value: annualRent <= 20_000_000 ? 1 : 0, suffix: " (1=분리)" },
 { label: "순소득", value: netIncome, suffix: "원" },
 { label: "지방소득세 (10%)", value: localTax, suffix: "원" },
 ],
 note: ratio + ". 종합과세는 별도 계산기.",
 };
 },
 explanation: "주택임대소득 연 2000만 이하 → 분리과세 14% 선택. 초과 시 종합과세 의무.",
 relatedSlugs: ["comprehensive-property-tax", "freelance-tax"],
 },
 {
 slug: "dividend-tax",
 title: "배당소득세 계산기",
 description: "배당소득 14% + 지방세 1.4% = 15.4% 자동 계산",
 category: "tax",
 categoryLabel: "세금",
 keywords: ["배당소득세", "배당세", "주식 배당세", "15.4%"],
 fields: [{ name: "dividendIncome", label: "연 배당소득", defaultValue: 3_000_000, suffix: "원" }],
 compute: ({ dividendIncome }) => {
 const tax = Math.round(dividendIncome * 0.14);
 const localTax = Math.round(dividendIncome * 0.014);
 const total = tax + localTax;
 const isCombined = dividendIncome > 20_000_000;
 return {
 primary: { label: "배당세 (지방세 포함)", value: total, suffix: "원" },
 secondary: [
 { label: "본세 (14%)", value: tax, suffix: "원" },
 { label: "지방세 (1.4%)", value: localTax, suffix: "원" },
 { label: "종합과세 대상", value: isCombined ? 1 : 0, suffix: " (1=2,000만 초과)" },
 ],
 note: "이자+배당 합 2,000만 초과 시 종합과세 자동 편입.",
 };
 },
 explanation: "배당세 = 배당소득 × 15.4% (본세 14% + 지방세 1.4%). 2,000만 초과 시 종합과세.",
 relatedSlugs: ["interest-tax-quick", "stock-tax-quick"],
 },
 {
 slug: "interest-tax-quick",
 title: "이자소득세 계산기",
 description: "이자소득 15.4% 분리과세·2,000만 초과 종합과세 자동 판정",
 category: "tax",
 categoryLabel: "세금",
 keywords: ["이자소득세", "예적금 세금", "15.4%", "분리과세"],
 fields: [{ name: "interestIncome", label: "연 이자소득", defaultValue: 2_000_000, suffix: "원" }],
 compute: ({ interestIncome }) => {
 const tax = Math.round(interestIncome * 0.154);
 const net = interestIncome - tax;
 return {
 primary: { label: "세후 이자소득", value: net, suffix: "원" },
 secondary: [
 { label: "이자소득세 (15.4%)", value: tax, suffix: "원" },
 { label: "실효세율", value: 15.4, suffix: "%" },
 ],
 };
 },
 explanation: "이자소득세 = 이자 × 15.4% (분리과세). 이자+배당 2,000만 초과 시 종합과세.",
 relatedSlugs: ["dividend-tax", "stock-tax-quick"],
 },
 {
 slug: "crypto-tax-2026",
 title: "가상자산 양도세 계산기",
 description: "기본공제 250만 + 22% (2027 시행 예정) — 2026 시뮬",
 category: "tax",
 categoryLabel: "세금",
 keywords: ["가상자산 세금", "비트코인 세금", "암호화폐 세금"],
 fields: [
 { name: "annualGain", label: "연 매매차익", defaultValue: 5_000_000, suffix: "원" },
 ],
 compute: ({ annualGain }) => {
 const taxBase = Math.max(0, annualGain - 2_500_000);
 const tax = Math.round(taxBase * 0.22);
 return {
 primary: { label: "예상 가상자산 세금", value: tax, suffix: "원" },
 secondary: [
 { label: "기본공제", value: 2_500_000, suffix: "원" },
 { label: "과세표준", value: taxBase, suffix: "원" },
 ],
 note: "가상자산 과세는 2027년 1월 시행 예정. 본 계산은 2026년 시뮬.",
 };
 },
 explanation: "가상자산 양도세 = (양도차익 - 250만) × 22%. 2027년 1월 시행 예정.",
 caveats: ["2026년은 과세 X (시뮬레이션 용도)", "기본공제 250만 + 22%(지방세 포함)"],
 relatedSlugs: ["stock-tax-quick", "dividend-tax"],
 },
 {
 slug: "overseas-stock-tax-quick",
 title: "해외주식 양도세 계산기",
 description: "환율 적용 + 250만 공제 + 22% 자동 계산",
 category: "tax",
 categoryLabel: "세금",
 keywords: ["해외주식 양도세", "미국주식 세금", "S&P 양도세"],
 fields: [
 { name: "buyAmount", label: "매수 시 원화 환산액", defaultValue: 10_000_000, suffix: "원" },
 { name: "sellAmount", label: "매도 시 원화 환산액", defaultValue: 15_000_000, suffix: "원" },
 ],
 compute: ({ buyAmount, sellAmount }) => {
 const gain = sellAmount - buyAmount;
 const taxBase = Math.max(0, gain - 2_500_000);
 const tax = Math.round(taxBase * 0.22);
 return {
 primary: { label: "예상 양도세", value: tax, suffix: "원" },
 secondary: [
 { label: "양도차익", value: gain, suffix: "원" },
 { label: "기본공제 후", value: taxBase, suffix: "원" },
 ],
 note: "다음 해 5월 종합소득세 신고 시 함께 신고.",
 };
 },
 relatedSlugs: ["stock-tax-quick", "crypto-tax-2026"],
 },
 {
 slug: "single-house-non-tax",
 title: "1주택 비과세 양도세 시뮬",
 description: "1주택 + 2년 보유·거주 비과세 자동 판정",
 category: "tax",
 categoryLabel: "세금",
 keywords: ["1주택 비과세", "양도세 비과세", "2년 보유"],
 fields: [
 { name: "salePrice", label: "양도가액", defaultValue: 800_000_000, suffix: "원" },
 { name: "holdYears", label: "보유 년수", defaultValue: 3 },
 { name: "residYears", label: "실거주 년수", defaultValue: 3 },
 ],
 compute: ({ salePrice, holdYears, residYears }) => {
 const isExempt = holdYears >= 2 && residYears >= 2 && salePrice <= 1_200_000_000;
 const isHighPrice = salePrice > 1_200_000_000;
 return {
 primary: {
 label: "비과세 가능?",
 value: isExempt ? 1 : 0,
 suffix: isExempt ? " (가능)" : " (불가)"
 },
 secondary: [
 { label: "보유 충족 (2년+)", value: holdYears >= 2 ? 1 : 0, suffix: "" },
 { label: "거주 충족 (2년+)", value: residYears >= 2 ? 1 : 0, suffix: "" },
 { label: "고가주택 (12억 초과)", value: isHighPrice ? 1 : 0, suffix: "" },
 ],
 note: "12억 초과는 초과분에 대해 양도세 부과. 2년 미만은 단기 양도세 60%~70%.",
 };
 },
 explanation: "1주택자 + 2년 보유 + 2년 거주 + 12억 이하 = 양도세 비과세.",
 caveats: ["조정대상지역은 거주 요건 강화", "12억 초과 시 초과분에 양도세"],
 relatedSlugs: ["capital-gains-real-estate", "comprehensive-property-tax"],
 },
 {
 slug: "vat-refund-business",
 title: "사업자 부가세 환급 계산기",
 description: "매출 부가세 - 매입 부가세 = 환급 또는 추가 납부",
 category: "tax",
 categoryLabel: "세금",
 keywords: ["부가세 환급", "사업자 환급", "매입세액 환급"],
 fields: [
 { name: "salesVat", label: "매출 부가세", defaultValue: 5_000_000, suffix: "원" },
 { name: "purchaseVat", label: "매입 부가세", defaultValue: 6_500_000, suffix: "원" },
 ],
 compute: ({ salesVat, purchaseVat }) => {
 const netVat = salesVat - purchaseVat;
 return {
 primary: {
 label: netVat < 0 ? "환급액" : "추가 납부액",
 value: Math.abs(netVat),
 suffix: "원",
 },
 secondary: [
 { label: "매출 부가세", value: salesVat, suffix: "원" },
 { label: "매입 부가세 (공제)", value: purchaseVat, suffix: "원" },
 ],
 note: netVat < 0 ? "환급 신청 → 30일 내 입금" : "분기 신고 시 납부",
 };
 },
 relatedSlugs: ["vat-quick", "freelance-tax"],
 },
 {
 slug: "gift-split-strategy",
 title: "증여 분할 시뮬",
 description: "10년 단위 분할 증여로 절세 효과 산출",
 category: "tax",
 categoryLabel: "세금",
 keywords: ["증여 분할", "10년 증여", "증여세 절세"],
 fields: [
 { name: "totalAmount", label: "증여 예정 총액", defaultValue: 200_000_000, suffix: "원" },
 { name: "decades", label: "분할 횟수 (10년 단위)", defaultValue: 2 },
 ],
 compute: ({ totalAmount, decades }) => {
 const perDecade = totalAmount / decades;
 const deduction = 50_000_000; // 직계비속 5천만 공제 (10년)
 // 한 번 증여 시 세금
 const oneTimeBase = Math.max(0, totalAmount - deduction);
 let oneTimeTax = 0;
 if (oneTimeBase <= 100_000_000) oneTimeTax = oneTimeBase * 0.1;
 else if (oneTimeBase <= 500_000_000) oneTimeTax = oneTimeBase * 0.2 - 10_000_000;
 else oneTimeTax = oneTimeBase * 0.3 - 60_000_000;
 // 분할 증여 시 (각 회차당 5천만 공제)
 const splitBase = Math.max(0, perDecade - deduction);
 let splitTaxPer = 0;
 if (splitBase <= 100_000_000) splitTaxPer = splitBase * 0.1;
 else splitTaxPer = splitBase * 0.2 - 10_000_000;
 const splitTaxTotal = splitTaxPer * decades;
 return {
 primary: { label: "분할 시 절세액", value: oneTimeTax - splitTaxTotal, suffix: "원" },
 secondary: [
 { label: "한 번 증여 시", value: oneTimeTax, suffix: "원" },
 { label: "분할 증여 시 합", value: splitTaxTotal, suffix: "원" },
 ],
 note: "10년 단위 분할로 매번 5천만 공제 활용.",
 };
 },
 explanation: "10년마다 5천만 공제 활용 → 분할 증여 절세. 분할 회수 ↑ → 절세액 ↑.",
 relatedSlugs: ["gift-tax-quick", "inheritance-tax-sim"],
 },
 {
 slug: "earned-income-tax-credit",
 title: "근로장려금 (EITC) 자격·수급액",
 description: "총소득·재산·부양 입력 → 수급 자격 + 예상 지급액",
 category: "tax",
 categoryLabel: "세금",
 keywords: ["근로장려금", "EITC", "장려금 신청", "근로장려금 자격"],
 fields: [
 { name: "totalIncome", label: "연 총소득", defaultValue: 25_000_000, suffix: "원" },
 { name: "familyType", label: "가구 유형 (1=단독, 2=홑벌이, 3=맞벌이)", defaultValue: 2 },
 ],
 compute: ({ totalIncome, familyType }) => {
 // 2026 추정 한도 (실제는 매년 갱신)
 // 단독: 2200만 / 홑벌이: 3200만 / 맞벌이: 3800만
 const limits = { 1: 22_000_000, 2: 32_000_000, 3: 38_000_000 };
 const maxBenefits = { 1: 1_650_000, 2: 2_850_000, 3: 3_300_000 };
 const limit = limits[familyType as 1 | 2 | 3] || 22_000_000;
 const max = maxBenefits[familyType as 1 | 2 | 3] || 1_650_000;
 const isEligible = totalIncome <= limit;
 // 점증·평탄·점감 구간 단순화
 let benefit = 0;
 if (isEligible) {
 if (totalIncome <= limit * 0.4) benefit = (totalIncome / (limit * 0.4)) * max;
 else if (totalIncome <= limit * 0.7) benefit = max;
 else benefit = max * (1 - (totalIncome - limit * 0.7) / (limit * 0.3));
 }
 return {
 primary: { label: "예상 수급액", value: Math.round(Math.max(0, benefit)), suffix: "원" },
 secondary: [
 { label: "자격 충족", value: isEligible ? 1 : 0, suffix: "" },
 { label: "최대 수급액", value: max, suffix: "원" },
 { label: "소득 한도", value: limit, suffix: "원" },
 ],
 note: "재산 합계 2.4억 이하 추가 조건. 5월 또는 9월 신청.",
 };
 },
 explanation: "근로장려금 = 단독·홑벌이·맞벌이별 차등. 신청은 5월(정기) 또는 9월(반기).",
 relatedSlugs: ["comprehensive-income-tax-quick", "freelance-tax"],
 },
];

// ─── 근로 수당 (10개) ─────────────────────────────────────
const LABOR: CalculatorDef[] = [
 {
 slug: "annual-leave-pay",
 title: "연차수당 계산기",
 description: "통상임금·연차일수 입력 → 미사용 연차 수당 자동 산출",
 category: "salary",
 categoryLabel: "근로자 권리",
 keywords: ["연차수당", "미사용 연차", "연차 보상"],
 fields: [
 { name: "monthlyWage", label: "통상임금 (월)", defaultValue: 3_000_000, suffix: "원" },
 { name: "unusedDays", label: "미사용 연차 일수", defaultValue: 10, suffix: "일" },
 ],
 compute: ({ monthlyWage, unusedDays }) => {
 const dailyWage = monthlyWage / 209 * 8; // 시급 × 8h
 const total = Math.round(dailyWage * unusedDays);
 return {
 primary: { label: "연차수당", value: total, suffix: "원" },
 secondary: [
 { label: "1일 수당", value: Math.round(dailyWage), suffix: "원" },
 { label: "통상시급", value: Math.round(monthlyWage / 209), suffix: "원" },
 ],
 note: "퇴사 시 미사용 연차는 수당으로 지급 의무 (근로기준법).",
 };
 },
 explanation: "연차수당 = 통상시급 × 8시간 × 미사용 일수. 통상시급 = 월급 / 209시간.",
 relatedSlugs: ["annual-leave-days", "vacation-pay-quick"],
 },
 {
 slug: "annual-leave-days",
 title: "연차 개수 계산기",
 description: "근속 년수 입력 → 연 발생 연차 일수 (15일 + 가산)",
 category: "salary",
 categoryLabel: "근로자 권리",
 keywords: ["연차 개수", "연차 일수", "근속 연차"],
 fields: [{ name: "workYears", label: "근속 년수", defaultValue: 5, suffix: "년" }],
 compute: ({ workYears }) => {
 const baseDays = 15;
 // 3년차부터 매 2년마다 1일 가산 (최대 25일)
 const bonus = Math.min(10, Math.floor(Math.max(0, workYears - 1) / 2));
 const total = baseDays + bonus;
 return {
 primary: { label: "연 발생 연차", value: total, suffix: "일" },
 secondary: [
 { label: "기본 연차", value: baseDays, suffix: "일" },
 { label: "근속 가산", value: bonus, suffix: "일" },
 ],
 note: "1년 미만 근속자는 매월 1일씩 발생. 3년차+ 가산.",
 };
 },
 explanation: "기본 15일 + 3년부터 2년마다 1일 가산 (최대 25일).",
 relatedSlugs: ["annual-leave-pay", "vacation-pay-quick"],
 },
 {
 slug: "overtime-pay",
 title: "야근수당 계산기",
 description: "통상시급 × 1.5 × 야근시간 + 야간(22~06시) 추가 0.5",
 category: "salary",
 categoryLabel: "근로자 권리",
 keywords: ["야근수당", "야간수당", "연장근로", "초과근무"],
 fields: [
 { name: "hourlyWage", label: "통상시급", defaultValue: 15_000, suffix: "원" },
 { name: "overtimeHours", label: "야근 시간", defaultValue: 10, suffix: "시간" },
 { name: "nightHours", label: "야간(22~06시) 시간", defaultValue: 0, suffix: "시간" },
 ],
 compute: ({ hourlyWage, overtimeHours, nightHours }) => {
 const overtimePay = hourlyWage * 1.5 * overtimeHours;
 const nightAdd = hourlyWage * 0.5 * nightHours;
 const total = Math.round(overtimePay + nightAdd);
 return {
 primary: { label: "야근·야간 수당", value: total, suffix: "원" },
 secondary: [
 { label: "야근수당 (×1.5)", value: Math.round(overtimePay), suffix: "원" },
 { label: "야간 가산 (+0.5)", value: Math.round(nightAdd), suffix: "원" },
 ],
 note: "5인 이상 사업장. 5인 미만은 가산수당 면제 가능.",
 };
 },
 explanation: "야근수당 = 통상시급 × 1.5. 야간(22~06시)은 추가 0.5 (총 ×2). 휴일은 별도.",
 caveats: ["5인 이상 사업장만 가산수당 의무", "포괄임금제는 별도"],
 relatedSlugs: ["weekend-overtime", "annual-leave-pay"],
 },
 {
 slug: "weekend-overtime",
 title: "휴일근무 수당 계산기",
 description: "주말·공휴일 근무 시 통상시급 × 1.5 자동 계산",
 category: "salary",
 categoryLabel: "근로자 권리",
 keywords: ["휴일수당", "주말근무", "공휴일 수당"],
 fields: [
 { name: "hourlyWage", label: "통상시급", defaultValue: 15_000, suffix: "원" },
 { name: "weekendHours", label: "휴일 근무 시간", defaultValue: 8, suffix: "시간" },
 ],
 compute: ({ hourlyWage, weekendHours }) => {
 const baseDuringHoliday = hourlyWage * weekendHours;
 const bonus = hourlyWage * 0.5 * weekendHours;
 const total = Math.round(baseDuringHoliday + bonus);
 // 8시간 초과는 추가 0.5 (1.5 → 2.0)
 const over8 = Math.max(0, weekendHours - 8) * hourlyWage * 0.5;
 return {
 primary: { label: "휴일근무 수당", value: total + Math.round(over8), suffix: "원" },
 secondary: [
 { label: "휴일 기본급", value: Math.round(baseDuringHoliday), suffix: "원" },
 { label: "휴일 가산 (+0.5)", value: Math.round(bonus), suffix: "원" },
 { label: "8시간 초과분", value: Math.round(over8), suffix: "원" },
 ],
 };
 },
 explanation: "휴일근무 = 통상시급 × 1.5. 8시간 초과는 추가 0.5 (총 ×2).",
 relatedSlugs: ["overtime-pay", "weekly-bonus"],
 },
 {
 slug: "weekly-bonus",
 title: "주휴수당 계산기",
 description: "주 15시간 이상 근로자 주휴수당 자동 산출",
 category: "salary",
 categoryLabel: "근로자 권리",
 keywords: ["주휴수당", "주휴 1일", "주휴수당 계산"],
 fields: [
 { name: "hourlyWage", label: "시급", defaultValue: 15_000, suffix: "원" },
 { name: "weeklyHours", label: "주 근무시간", defaultValue: 40, suffix: "시간" },
 ],
 compute: ({ hourlyWage, weeklyHours }) => {
 const isEligible = weeklyHours >= 15;
 // 주휴수당 = 1일 임금 (8시간 기준 또는 비례)
 const dailyHours = Math.min(8, weeklyHours / 5);
 const weeklyBonus = isEligible ? Math.round(hourlyWage * dailyHours) : 0;
 return {
 primary: { label: "주휴수당", value: weeklyBonus, suffix: "원" },
 secondary: [
 { label: "수급 자격", value: isEligible ? 1 : 0, suffix: "" },
 { label: "주 근로시간", value: weeklyHours, suffix: "시간" },
 ],
 note: "주 15시간 미만은 주휴수당 X. 알바·계약직도 동일 기준.",
 };
 },
 explanation: "주휴수당 = 1주 개근 시 1일 임금. 주 15시간 이상 근무자.",
 relatedSlugs: ["overtime-pay", "weekend-overtime"],
 },
 {
 slug: "ordinary-wage-calc",
 title: "통상임금 계산기",
 description: "기본급·정기수당 입력 → 통상시급·일급·월급 산출",
 category: "salary",
 categoryLabel: "근로자 권리",
 keywords: ["통상임금", "통상시급", "통상임금 계산"],
 fields: [
 { name: "baseWage", label: "월 기본급", defaultValue: 2_500_000, suffix: "원" },
 { name: "regularBonus", label: "월 정기수당 (식대·교통비 등)", defaultValue: 300_000, suffix: "원" },
 ],
 compute: ({ baseWage, regularBonus }) => {
 const monthly = baseWage + regularBonus;
 const hourly = monthly / 209;
 const daily = hourly * 8;
 return {
 primary: { label: "통상시급", value: Math.round(hourly), suffix: "원" },
 secondary: [
 { label: "통상일급", value: Math.round(daily), suffix: "원" },
 { label: "통상월급", value: monthly, suffix: "원" },
 ],
 note: "통상임금 = 정기적·일률적·고정적으로 지급되는 임금. 성과급 제외.",
 };
 },
 explanation: "통상임금 = 기본급 + 정기수당. 시급 = 월 통상임금 / 209.",
 relatedSlugs: ["overtime-pay", "average-wage"],
 },
 {
 slug: "average-wage",
 title: "평균임금 계산기",
 description: "퇴사 직전 3개월 임금 합계 / 90일 = 평균임금",
 category: "salary",
 categoryLabel: "근로자 권리",
 keywords: ["평균임금", "평균임금 계산", "퇴직금 평균임금"],
 fields: [
 { name: "month1", label: "퇴사 1개월 전 임금", defaultValue: 3_000_000, suffix: "원" },
 { name: "month2", label: "퇴사 2개월 전 임금", defaultValue: 3_000_000, suffix: "원" },
 { name: "month3", label: "퇴사 3개월 전 임금", defaultValue: 3_500_000, suffix: "원" },
 ],
 compute: ({ month1, month2, month3 }) => {
 const total = month1 + month2 + month3;
 const dailyAvg = total / 90;
 const monthlyAvg = dailyAvg * 30;
 return {
 primary: { label: "일 평균임금", value: Math.round(dailyAvg), suffix: "원" },
 secondary: [
 { label: "월 평균임금", value: Math.round(monthlyAvg), suffix: "원" },
 { label: "3개월 합계", value: total, suffix: "원" },
 ],
 note: "퇴직금·실업급여 계산의 기준. 통상임금과 다름.",
 };
 },
 explanation: "평균임금 = 퇴사 직전 3개월 총 임금 / 90일. 성과급·연말상여 포함.",
 relatedSlugs: ["ordinary-wage-calc", "severance-quick"],
 },
 {
 slug: "minimum-wage-violation",
 title: "최저임금 위반 점검",
 description: "본인 시급 vs 최저시급 비교 + 차액 청구 가능액",
 category: "salary",
 categoryLabel: "근로자 권리",
 keywords: ["최저임금 위반", "최저시급 미달", "차액 청구"],
 fields: [
 { name: "actualWage", label: "본인 시급 (실제)", defaultValue: 9_500, suffix: "원" },
 { name: "monthlyHours", label: "월 근무시간", defaultValue: 209, suffix: "시간" },
 ],
 compute: ({ actualWage, monthlyHours }) => {
 const minWage = 10_320; // 2026 최저시급
 const isViolation = actualWage < minWage;
 const monthlyShortage = isViolation ? (minWage - actualWage) * monthlyHours : 0;
 const yearlyShortage = monthlyShortage * 12;
 return {
 primary: { label: "월 미지급액", value: Math.round(monthlyShortage), suffix: "원" },
 secondary: [
 { label: "위반 여부", value: isViolation ? 1 : 0, suffix: "" },
 { label: "연 미지급액", value: Math.round(yearlyShortage), suffix: "원" },
 { label: "본인 시급", value: actualWage, suffix: "원" },
 { label: "최저시급 (2026)", value: minWage, suffix: "원" },
 ],
 note: "위반 시 고용노동부 1350. 3년 이내 차액 청구 가능.",
 };
 },
 explanation: "최저임금 미달 시 사업주는 차액 + 가산금 지급 의무. 미지급 시 형사처벌.",
 relatedSlugs: ["ordinary-wage-calc", "weekly-bonus"],
 },
 {
 slug: "salary-grade-civil",
 title: "공무원 호봉 봉급 계산",
 description: "직급·호봉 입력 → 2026 봉급액 + 실수령액",
 category: "salary",
 categoryLabel: "공공",
 keywords: ["공무원 봉급", "호봉 봉급", "공무원 호봉표"],
 fields: [
 { name: "grade", label: "직급 (5/7/9급)", defaultValue: 9 },
 { name: "step", label: "호봉 (1~32)", defaultValue: 5 },
 ],
 compute: ({ grade, step }) => {
 // 단순 봉급 추정 (실제는 호봉표 참조)
 const baseByGrade: Record<number, number> = { 5: 2_705_000, 7: 1_995_000, 9: 1_877_000 };
 const base = baseByGrade[grade] || 1_877_000;
 // 호봉당 약 3% 인상
 const increment = base * 0.03 * (step - 1);
 const monthlyWage = Math.round(base + increment);
 return {
 primary: { label: "월 봉급 (추정)", value: monthlyWage, suffix: "원" },
 secondary: [
 { label: "1호봉 봉급", value: base, suffix: "원" },
 { label: "호봉 가산", value: Math.round(increment), suffix: "원" },
 ],
 note: "정근수당·명절상여·시간외수당 별도. 실제는 인사혁신처 봉급표 확인.",
 };
 },
 relatedSlugs: ["ordinary-wage-calc", "average-wage"],
 },
 {
 slug: "retirement-pay-quick",
 title: "퇴직금 즉시 계산",
 description: "월급·근속 입력 → 법정 퇴직금 (3개월 평균임금 × 근속 / 12)",
 category: "salary",
 categoryLabel: "근로자 권리",
 keywords: ["퇴직금", "퇴직금 계산", "법정 퇴직금"],
 fields: [
 { name: "monthlyWage", label: "월 평균임금", defaultValue: 4_000_000, suffix: "원" },
 { name: "workMonths", label: "총 근속 개월", defaultValue: 60, suffix: "개월" },
 ],
 compute: ({ monthlyWage, workMonths }) => {
 const yearsEquiv = workMonths / 12;
 const severance = workMonths < 12 ? 0 : Math.round(monthlyWage * yearsEquiv);
 return {
 primary: { label: "법정 퇴직금", value: severance, suffix: "원" },
 secondary: [
 { label: "환산 근속", value: yearsEquiv, suffix: "년" },
 { label: "1년 미만 자격", value: workMonths < 12 ? 1 : 0, suffix: " (1=불가)" },
 ],
 note: "1년 미만 근속은 미지급. 회사 규정이 더 유리하면 그쪽 적용.",
 };
 },
 explanation: "퇴직금 = 평균임금 × (근속 개월 / 12). 1년 미만은 X.",
 relatedSlugs: ["average-wage", "severance-quick"],
 },
];

// ─── 투자·재테크 (10개) ─────────────────────────────────────
const INVEST: CalculatorDef[] = [
 {
 slug: "savings-interest",
 title: "적금 만기 이자 계산기",
 description: "월 적립·금리·기간 → 만기 원리금·이자·세후 수령액",
 category: "investment",
 categoryLabel: "투자",
 keywords: ["적금 이자", "적금 만기", "적금 계산"],
 fields: [
 { name: "monthlyDeposit", label: "월 적립금", defaultValue: 300_000, suffix: "원" },
 { name: "annualRate", label: "연 금리 (%)", defaultValue: 4.0, suffix: "%" },
 { name: "months", label: "기간 (개월)", defaultValue: 24, suffix: "개월" },
 ],
 compute: ({ monthlyDeposit, annualRate, months }) => {
 const r = annualRate / 100 / 12;
 const principal = monthlyDeposit * months;
 // 단리 적금 이자 = 월적립 × n × (n+1)/2 × 월금리
 const interest = (monthlyDeposit * months * (months + 1) / 2) * r;
 const tax = interest * 0.154;
 const net = principal + interest - tax;
 return {
 primary: { label: "세후 수령액", value: Math.round(net), suffix: "원" },
 secondary: [
 { label: "원금", value: principal, suffix: "원" },
 { label: "총 이자", value: Math.round(interest), suffix: "원" },
 { label: "이자소득세 (15.4%)", value: Math.round(tax), suffix: "원" },
 ],
 };
 },
 relatedSlugs: ["fixed-deposit", "isa-tax-saving"],
 },
 {
 slug: "fixed-deposit",
 title: "정기예금 이자 계산기",
 description: "예치금·금리·기간 → 만기 이자·세후",
 category: "investment",
 categoryLabel: "투자",
 keywords: ["정기예금 이자", "예금 계산", "정기예금"],
 fields: [
 { name: "principal", label: "예치금", defaultValue: 10_000_000, suffix: "원" },
 { name: "annualRate", label: "연 금리 (%)", defaultValue: 3.5, suffix: "%" },
 { name: "months", label: "기간 (개월)", defaultValue: 12, suffix: "개월" },
 ],
 compute: ({ principal, annualRate, months }) => {
 const interest = principal * (annualRate / 100) * (months / 12);
 const tax = interest * 0.154;
 const net = principal + interest - tax;
 return {
 primary: { label: "세후 수령액", value: Math.round(net), suffix: "원" },
 secondary: [
 { label: "총 이자", value: Math.round(interest), suffix: "원" },
 { label: "세금 (15.4%)", value: Math.round(tax), suffix: "원" },
 ],
 };
 },
 relatedSlugs: ["savings-interest", "isa-tax-saving"],
 },
 {
 slug: "isa-tax-saving",
 title: "ISA 절세 계산기",
 description: "ISA 일반형 200만·서민형 400만 비과세 한도 적용",
 category: "investment",
 categoryLabel: "투자",
 keywords: ["ISA 절세", "ISA 비과세", "ISA 200만"],
 fields: [
 { name: "annualGain", label: "연 수익", defaultValue: 3_000_000, suffix: "원" },
 { name: "isaType", label: "유형 (1=일반, 2=서민형)", defaultValue: 1 },
 ],
 compute: ({ annualGain, isaType }) => {
 const exemption = isaType === 2 ? 4_000_000 : 2_000_000;
 const taxable = Math.max(0, annualGain - exemption);
 const tax = Math.round(taxable * 0.099); // ISA 분리과세 9.9%
 const generalTax = Math.round(annualGain * 0.154);
 const saving = generalTax - tax;
 return {
 primary: { label: "ISA 절세액", value: saving, suffix: "원" },
 secondary: [
 { label: "ISA 세금 (9.9%)", value: tax, suffix: "원" },
 { label: "일반 세금 (15.4%)", value: generalTax, suffix: "원" },
 { label: "비과세 한도", value: exemption, suffix: "원" },
 ],
 note: "ISA 의무 가입기간 3년 (서민형은 5년 더 유리).",
 };
 },
 relatedSlugs: ["savings-interest", "irp-quick"],
 },
 {
 slug: "irp-quick",
 title: "IRP 세액공제 즉시 계산",
 description: "납입액·총급여 입력 → 세액공제 환급액",
 category: "investment",
 categoryLabel: "투자",
 keywords: ["IRP 세액공제", "IRP 환급", "연금저축 IRP"],
 fields: [
 { name: "deposit", label: "연 납입액 (한도 900만)", defaultValue: 6_000_000, suffix: "원" },
 { name: "totalIncome", label: "총급여", defaultValue: 50_000_000, suffix: "원" },
 ],
 compute: ({ deposit, totalIncome }) => {
 const cap = Math.min(deposit, 9_000_000);
 const rate = totalIncome <= 55_000_000 ? 0.165 : 0.132;
 const refund = Math.round(cap * rate);
 return {
 primary: { label: "세액공제 환급", value: refund, suffix: "원" },
 secondary: [
 { label: "환급률", value: rate * 100, suffix: "%" },
 { label: "공제 한도 적용", value: cap, suffix: "원" },
 ],
 note: "12/31까지 입금분만 당해 연도 공제.",
 };
 },
 explanation: "IRP·연금저축 합 900만 한도. 총급여 5,500만 이하 16.5%, 초과 13.2%.",
 relatedSlugs: ["isa-tax-saving", "savings-interest"],
 },
 {
 slug: "compound-future-value",
 title: "복리 미래가치 (FV) 계산",
 description: "원금·이자율·기간 입력 → 복리 미래가치",
 category: "investment",
 categoryLabel: "투자",
 keywords: ["복리 계산", "미래가치", "FV"],
 fields: [
 { name: "principal", label: "현재 원금", defaultValue: 10_000_000, suffix: "원" },
 { name: "annualRate", label: "연 수익률 (%)", defaultValue: 7, suffix: "%" },
 { name: "years", label: "투자 기간", defaultValue: 20, suffix: "년" },
 ],
 compute: ({ principal, annualRate, years }) => {
 const fv = principal * Math.pow(1 + annualRate / 100, years);
 return {
 primary: { label: "미래가치", value: Math.round(fv), suffix: "원" },
 secondary: [
 { label: "원금", value: principal, suffix: "원" },
 { label: "복리 수익", value: Math.round(fv - principal), suffix: "원" },
 { label: "수익 배수", value: fv / principal, suffix: "배" },
 ],
 };
 },
 explanation: "FV = PV × (1 + r)^n. 연 7% 30년 = 약 7.6배.",
 relatedSlugs: ["savings-interest", "compound-monthly"],
 },
 {
 slug: "compound-monthly",
 title: "월 적립 복리 (FV)",
 description: "월 적립·이자율·기간 → 복리 미래가치",
 category: "investment",
 categoryLabel: "투자",
 keywords: ["월 적립 복리", "월 적립 미래가치"],
 fields: [
 { name: "monthly", label: "월 적립", defaultValue: 500_000, suffix: "원" },
 { name: "annualRate", label: "연 수익률 (%)", defaultValue: 7, suffix: "%" },
 { name: "years", label: "기간", defaultValue: 20, suffix: "년" },
 ],
 compute: ({ monthly, annualRate, years }) => {
 const r = annualRate / 100 / 12;
 const n = years * 12;
 const fv = monthly * ((Math.pow(1 + r, n) - 1) / r);
 const principal = monthly * n;
 return {
 primary: { label: "미래가치", value: Math.round(fv), suffix: "원" },
 secondary: [
 { label: "원금 합계", value: principal, suffix: "원" },
 { label: "복리 수익", value: Math.round(fv - principal), suffix: "원" },
 ],
 };
 },
 relatedSlugs: ["compound-future-value", "isa-tax-saving"],
 },
 {
 slug: "stock-buyback-roi",
 title: "주식 매도 ROI 계산",
 description: "매수가·매도가·수수료 → 실수익률",
 category: "investment",
 categoryLabel: "투자",
 keywords: ["주식 ROI", "주식 수익률", "주식 손익"],
 fields: [
 { name: "buyPrice", label: "매수가", defaultValue: 1_000_000, suffix: "원" },
 { name: "sellPrice", label: "매도가", defaultValue: 1_200_000, suffix: "원" },
 { name: "commission", label: "수수료율 (%)", defaultValue: 0.015, suffix: "%" },
 ],
 compute: ({ buyPrice, sellPrice, commission }) => {
 const totalCommission = (buyPrice + sellPrice) * (commission / 100);
 const tax = sellPrice * 0.0023; // 증권거래세 0.23%
 const netGain = sellPrice - buyPrice - totalCommission - tax;
 const roi = (netGain / buyPrice) * 100;
 return {
 primary: { label: "실수익", value: Math.round(netGain), suffix: "원" },
 secondary: [
 { label: "ROI", value: roi, suffix: "%" },
 { label: "수수료 합계", value: Math.round(totalCommission), suffix: "원" },
 { label: "증권거래세", value: Math.round(tax), suffix: "원" },
 ],
 };
 },
 explanation: "ROI = (매도가 - 매수가 - 수수료 - 거래세) / 매수가 × 100%.",
 relatedSlugs: ["stock-tax-quick", "cagr-quick"],
 },
 {
 slug: "fund-fee-impact",
 title: "펀드 수수료 영향 시뮬",
 description: "수수료 0.1%p 차이가 30년 누적 자산에 미치는 영향",
 category: "investment",
 categoryLabel: "투자",
 keywords: ["펀드 수수료", "ETF 수수료", "수수료 영향"],
 fields: [
 { name: "principal", label: "원금", defaultValue: 100_000_000, suffix: "원" },
 { name: "yearlyReturn", label: "연 수익률 (%)", defaultValue: 7, suffix: "%" },
 { name: "feeRate", label: "수수료 (%)", defaultValue: 1.0, suffix: "%" },
 { name: "years", label: "기간", defaultValue: 30, suffix: "년" },
 ],
 compute: ({ principal, yearlyReturn, feeRate, years }) => {
 const netReturn = yearlyReturn - feeRate;
 const fvWithFee = principal * Math.pow(1 + netReturn / 100, years);
 const fvNoFee = principal * Math.pow(1 + yearlyReturn / 100, years);
 const lossDueToFee = fvNoFee - fvWithFee;
 return {
 primary: { label: "수수료로 인한 손실", value: Math.round(lossDueToFee), suffix: "원" },
 secondary: [
 { label: "수수료 포함 시", value: Math.round(fvWithFee), suffix: "원" },
 { label: "수수료 0% 가정", value: Math.round(fvNoFee), suffix: "원" },
 ],
 note: "ETF 수수료 0.1% vs 펀드 수수료 1.5% 차이는 30년 누적 수억.",
 };
 },
 explanation: "수수료 1%p 차이가 30년 누적 자산의 약 25~30% 차이.",
 relatedSlugs: ["compound-future-value", "isa-tax-saving"],
 },
 {
 slug: "fx-trading-roi",
 title: "환차익 시뮬레이터",
 description: "달러 매수·매도 환율 입력 → 환차익 + 수수료 차감",
 category: "currency",
 categoryLabel: "환율",
 keywords: ["환차익", "달러 환차익", "환율 시뮬"],
 fields: [
 { name: "amount", label: "환전액 (USD)", defaultValue: 10_000, suffix: "USD" },
 { name: "buyRate", label: "매수 환율", defaultValue: 1300, suffix: "원/USD" },
 { name: "sellRate", label: "매도 환율", defaultValue: 1380, suffix: "원/USD" },
 ],
 compute: ({ amount, buyRate, sellRate }) => {
 const buyTotal = amount * buyRate;
 const sellTotal = amount * sellRate;
 const grossGain = sellTotal - buyTotal;
 const fee = (buyTotal + sellTotal) * 0.005; // 0.5% 환전 수수료
 const netGain = grossGain - fee;
 return {
 primary: { label: "환차익 (수수료 차감 후)", value: Math.round(netGain), suffix: "원" },
 secondary: [
 { label: "총 환차익", value: Math.round(grossGain), suffix: "원" },
 { label: "환전 수수료", value: Math.round(fee), suffix: "원" },
 ],
 note: "외화예금 이자는 별도. 환차익은 비과세 (개인).",
 };
 },
 relatedSlugs: ["fixed-deposit", "stock-buyback-roi"],
 },
 {
 slug: "subscription-saving-housing",
 title: "주택청약 저축 누적",
 description: "월 적립·기간 → 청약 가점·1순위 자격",
 category: "real-estate",
 categoryLabel: "부동산",
 keywords: ["청약 저축", "주택청약", "청약 가점"],
 fields: [
 { name: "monthlyDeposit", label: "월 적립", defaultValue: 100_000, suffix: "원" },
 { name: "months", label: "가입 기간 (개월)", defaultValue: 36, suffix: "개월" },
 ],
 compute: ({ monthlyDeposit, months }) => {
 const totalDeposit = monthlyDeposit * months;
 const isFirstTier = months >= 24 && totalDeposit >= 6_000_000;
 const points = Math.min(17, Math.floor(months / 2));
 return {
 primary: { label: "청약 가점 (저축)", value: points, suffix: "점" },
 secondary: [
 { label: "1순위 자격", value: isFirstTier ? 1 : 0, suffix: "" },
 { label: "총 적립", value: totalDeposit, suffix: "원" },
 ],
 note: "민영 1순위: 24개월+ 600만+. 공공 1순위: 24개월+ 240만+.",
 };
 },
 relatedSlugs: ["jeonse-loan", "ltv-quick"],
 },
];

// ─── 부업·자영업 (10개) ─────────────────────────────────────
const SIDE_BIZ: CalculatorDef[] = [
 {
 slug: "side-job-income-tax",
 title: "부업 소득세 시뮬",
 description: "본업 + 부업 합산 종합과세 시뮬",
 category: "business",
 categoryLabel: "부업·N잡",
 keywords: ["부업 세금", "N잡 세금", "투잡 세금"],
 fields: [
 { name: "mainSalary", label: "본업 연봉", defaultValue: 50_000_000, suffix: "원" },
 { name: "sideIncome", label: "부업 연 소득 (3.3% 떼인 후)", defaultValue: 5_000_000, suffix: "원" },
 ],
 compute: ({ mainSalary, sideIncome }) => {
 const total = mainSalary + sideIncome;
 // 누진세율 적용 (단순화)
 let tax = 0;
 if (total <= 14_000_000) tax = total * 0.06;
 else if (total <= 50_000_000) tax = total * 0.15 - 1_260_000;
 else if (total <= 88_000_000) tax = total * 0.24 - 5_760_000;
 else tax = total * 0.35 - 15_440_000;
 const sideTaxOnly = Math.round(sideIncome * 0.033);
 const additionalDue = tax - sideTaxOnly - mainSalary * 0.15;
 return {
 primary: { label: "추가 납부 예상", value: Math.round(Math.max(0, additionalDue)), suffix: "원" },
 secondary: [
 { label: "원천징수 (3.3%)", value: sideTaxOnly, suffix: "원" },
 { label: "합산 과표", value: total, suffix: "원" },
 ],
 note: "본업 + 부업 합산이 본업만보다 누진 구간 1단계 위로 점프 가능.",
 };
 },
 relatedSlugs: ["freelance-tax-quick", "comprehensive-income-tax-quick"],
 },
 {
 slug: "freelance-tax-quick",
 title: "프리랜서 종소세 즉시 계산",
 description: "사업소득·필요경비 → 종합소득세",
 category: "business",
 categoryLabel: "프리랜서",
 keywords: ["프리랜서 종소세", "프리랜서 세금", "사업소득세"],
 fields: [
 { name: "income", label: "연 사업소득", defaultValue: 50_000_000, suffix: "원" },
 { name: "expenses", label: "필요경비", defaultValue: 15_000_000, suffix: "원" },
 ],
 compute: ({ income, expenses }) => {
 const taxBase = Math.max(0, income - expenses - 1_500_000); // 본인 인적공제
 let tax = 0;
 if (taxBase <= 14_000_000) tax = taxBase * 0.06;
 else if (taxBase <= 50_000_000) tax = taxBase * 0.15 - 1_260_000;
 else if (taxBase <= 88_000_000) tax = taxBase * 0.24 - 5_760_000;
 else tax = taxBase * 0.35 - 15_440_000;
 const localTax = Math.round(tax * 0.1);
 const original33 = Math.round(income * 0.033);
 const refund = original33 - tax - localTax;
 return {
 primary: { label: refund > 0 ? "환급 예상" : "추가 납부", value: Math.abs(refund), suffix: "원" },
 secondary: [
 { label: "산출세액", value: Math.round(tax + localTax), suffix: "원" },
 { label: "원천징수 (3.3%)", value: original33, suffix: "원" },
 { label: "과세표준", value: taxBase, suffix: "원" },
 ],
 };
 },
 relatedSlugs: ["side-job-income-tax", "vat-quick"],
 },
 {
 slug: "vat-quick",
 title: "부가세 신고 즉시 계산",
 description: "공급가액·매입세액 → 신고세액",
 category: "business",
 categoryLabel: "사업자",
 keywords: ["부가세 신고", "VAT 신고", "사업자 부가세"],
 fields: [
 { name: "salesValue", label: "공급가액 (분기)", defaultValue: 30_000_000, suffix: "원" },
 { name: "purchaseVat", label: "매입 부가세", defaultValue: 1_500_000, suffix: "원" },
 ],
 compute: ({ salesValue, purchaseVat }) => {
 const salesVat = salesValue * 0.1;
 const netVat = salesVat - purchaseVat;
 return {
 primary: { label: "신고세액", value: Math.round(netVat), suffix: "원" },
 secondary: [
 { label: "매출 부가세 (10%)", value: Math.round(salesVat), suffix: "원" },
 { label: "매입 부가세", value: purchaseVat, suffix: "원" },
 ],
 note: "음수면 환급. 일반과세자 분기별 신고.",
 };
 },
 relatedSlugs: ["vat-refund-business", "freelance-tax-quick"],
 },
 {
 slug: "simple-vs-general-vat",
 title: "간이 vs 일반과세자 비교",
 description: "매출 8천만 기준 어느 게 유리한지 시뮬",
 category: "business",
 categoryLabel: "사업자",
 keywords: ["간이과세자", "일반과세자", "부가세 유형"],
 fields: [
 { name: "annualSales", label: "연 매출 (공급가액)", defaultValue: 60_000_000, suffix: "원" },
 { name: "purchaseVat", label: "연 매입 부가세", defaultValue: 3_000_000, suffix: "원" },
 ],
 compute: ({ annualSales, purchaseVat }) => {
 // 간이과세자 부가율 약 1.5~4% (서비스업 4%)
 const simpleVat = annualSales * 0.04;
 const generalVat = annualSales * 0.1 - purchaseVat;
 const advantage = simpleVat < generalVat ? "간이" : "일반";
 const diff = Math.abs(simpleVat - generalVat);
 return {
 primary: { label: "유리한 유형", value: advantage === "간이" ? 1 : 0, suffix: " (1=간이)" },
 secondary: [
 { label: "간이과세 시", value: Math.round(simpleVat), suffix: "원" },
 { label: "일반과세 시", value: Math.round(generalVat), suffix: "원" },
 { label: "절세 효과", value: Math.round(diff), suffix: "원" },
 ],
 note: "8천만 초과는 일반과세 자동 전환. 매입 비중 큰 업종은 일반 유리.",
 };
 },
 relatedSlugs: ["vat-quick", "freelance-tax-quick"],
 },
 {
 slug: "noran-umbrella-deduction",
 title: "노란우산공제 절세 계산",
 description: "사업자 전용 노란우산 연 500만 한도 소득공제",
 category: "business",
 categoryLabel: "사업자",
 keywords: ["노란우산공제", "사업자 절세", "노란우산"],
 fields: [
 { name: "deposit", label: "연 납입액 (한도 500만)", defaultValue: 3_000_000, suffix: "원" },
 { name: "businessIncome", label: "사업소득", defaultValue: 60_000_000, suffix: "원" },
 ],
 compute: ({ deposit, businessIncome }) => {
 const cap = Math.min(deposit, 5_000_000);
 // 사업소득 4천만 이하: 16.5%, 4천~1억: 13.2%, 1억 초과: 8.8%
 let rate = 0.165;
 if (businessIncome > 100_000_000) rate = 0.088;
 else if (businessIncome > 40_000_000) rate = 0.132;
 const refund = Math.round(cap * rate);
 return {
 primary: { label: "절세액", value: refund, suffix: "원" },
 secondary: [
 { label: "환급률", value: rate * 100, suffix: "%" },
 { label: "공제 한도 적용", value: cap, suffix: "원" },
 ],
 note: "퇴직금처럼 노후 자금 + 절세. 사업자 전용 (직장인 X).",
 };
 },
 relatedSlugs: ["irp-quick", "freelance-tax-quick"],
 },
 {
 slug: "online-shopping-mall-tax",
 title: "온라인 쇼핑몰 세금 시뮬",
 description: "월 매출·매입 → 부가세·소득세 추정",
 category: "business",
 categoryLabel: "온라인사업",
 keywords: ["쇼핑몰 세금", "스마트스토어", "오픈마켓 세금"],
 fields: [
 { name: "monthlyRevenue", label: "월 매출", defaultValue: 10_000_000, suffix: "원" },
 { name: "purchaseRatio", label: "매입 비중 (%)", defaultValue: 50, suffix: "%" },
 ],
 compute: ({ monthlyRevenue, purchaseRatio }) => {
 const purchaseAmount = monthlyRevenue * (purchaseRatio / 100);
 const grossProfit = monthlyRevenue - purchaseAmount;
 const monthlyVat = (monthlyRevenue * 0.1) - (purchaseAmount * 0.1);
 const monthlyIncomeTax = grossProfit * 0.15; // 단순 가정 15%
 const monthlyTotal = monthlyVat + monthlyIncomeTax;
 return {
 primary: { label: "월 예상 세금", value: Math.round(monthlyTotal), suffix: "원" },
 secondary: [
 { label: "부가세", value: Math.round(monthlyVat), suffix: "원" },
 { label: "소득세 (단순)", value: Math.round(monthlyIncomeTax), suffix: "원" },
 { label: "월 매출총이익", value: grossProfit, suffix: "원" },
 ],
 note: "스마트스토어·쿠팡·11번가 등 운영 시 적용. 사업자등록 필수.",
 };
 },
 relatedSlugs: ["vat-quick", "freelance-tax-quick"],
 },
 {
 slug: "youtube-revenue-tax",
 title: "유튜브 수익 세금 시뮬",
 description: "월 광고 수익 → 종소세 + 부가세",
 category: "business",
 categoryLabel: "크리에이터",
 keywords: ["유튜브 세금", "유튜버 세금", "크리에이터 세금"],
 fields: [
 { name: "monthlyAd", label: "월 광고 수익 (원화 환산)", defaultValue: 5_000_000, suffix: "원" },
 ],
 compute: ({ monthlyAd }) => {
 const yearlyAd = monthlyAd * 12;
 // 사업소득세 (단순)
 const expenses = yearlyAd * 0.3; // 30% 경비 가정
 const taxBase = yearlyAd - expenses;
 let incomeTax = 0;
 if (taxBase <= 50_000_000) incomeTax = taxBase * 0.15 - 1_260_000;
 else if (taxBase <= 88_000_000) incomeTax = taxBase * 0.24 - 5_760_000;
 else incomeTax = taxBase * 0.35 - 15_440_000;
 // 부가세 X (구글이 해외 결제, 영세율 적용 가능)
 return {
 primary: { label: "연 예상 세금", value: Math.round(incomeTax * 1.1), suffix: "원" },
 secondary: [
 { label: "월 평균 세금", value: Math.round(incomeTax * 1.1 / 12), suffix: "원" },
 { label: "연 수입", value: yearlyAd, suffix: "원" },
 ],
 note: "구글 광고 수익은 영세율 부가세 0%. 사업자등록 필수.",
 };
 },
 relatedSlugs: ["online-shopping-mall-tax", "freelance-tax-quick"],
 },
 {
 slug: "delivery-driver-income",
 title: "배달기사 수입 시뮬",
 description: "건당 수익·일일 건수 → 월·연 수입",
 category: "business",
 categoryLabel: "긱워커",
 keywords: ["배달기사 수입", "쿠팡이츠 수입", "배민 라이더"],
 fields: [
 { name: "perDelivery", label: "건당 수익", defaultValue: 4_500, suffix: "원" },
 { name: "dailyCount", label: "1일 평균 건수", defaultValue: 30, suffix: "건" },
 { name: "workDays", label: "월 근무일", defaultValue: 25, suffix: "일" },
 ],
 compute: ({ perDelivery, dailyCount, workDays }) => {
 const monthlyGross = perDelivery * dailyCount * workDays;
 const expenses = monthlyGross * 0.3; // 유류·차량유지비 30%
 const monthlyNet = monthlyGross - expenses;
 const yearlyNet = monthlyNet * 12;
 return {
 primary: { label: "월 순수입", value: Math.round(monthlyNet), suffix: "원" },
 secondary: [
 { label: "월 총 수입", value: monthlyGross, suffix: "원" },
 { label: "예상 경비 (30%)", value: Math.round(expenses), suffix: "원" },
 { label: "연 순수입", value: Math.round(yearlyNet), suffix: "원" },
 ],
 note: "유류·차량 정비·통신비 등 30% 가정. 실제는 경로별 다름.",
 };
 },
 relatedSlugs: ["freelance-tax-quick", "fuel-cost"],
 },
 {
 slug: "small-business-startup-cost",
 title: "소상공인 창업 자금 계산",
 description: "초기 비용 + 월 운영비 → 손익분기점",
 category: "business",
 categoryLabel: "창업",
 keywords: ["창업 자금", "소상공인 창업", "손익분기점"],
 fields: [
 { name: "initialCost", label: "초기 자금 (보증금·인테리어)", defaultValue: 50_000_000, suffix: "원" },
 { name: "monthlyFixed", label: "월 고정비 (월세·인건비)", defaultValue: 5_000_000, suffix: "원" },
 { name: "monthlyRevenue", label: "월 예상 매출", defaultValue: 15_000_000, suffix: "원" },
 ],
 compute: ({ initialCost, monthlyFixed, monthlyRevenue }) => {
 const monthlyVariable = monthlyRevenue * 0.4; // 변동비 40% 가정
 const monthlyProfit = monthlyRevenue - monthlyFixed - monthlyVariable;
 const breakevenMonths = monthlyProfit > 0 ? Math.ceil(initialCost / monthlyProfit) : 999;
 return {
 primary: { label: "손익분기 (개월)", value: breakevenMonths, suffix: "개월" },
 secondary: [
 { label: "월 예상 순익", value: Math.round(monthlyProfit), suffix: "원" },
 { label: "초기 자금 회수", value: initialCost, suffix: "원" },
 ],
 note: "변동비 40% 가정 (음식점 기준). 업종별 차이 큼.",
 };
 },
 relatedSlugs: ["small-business-loan", "vat-quick"],
 },
 {
 slug: "small-business-loan",
 title: "소상공인 대출 한도",
 description: "사업소득·자산 → 정책자금 한도",
 category: "business",
 categoryLabel: "창업",
 keywords: ["소상공인 대출", "창업 자금 대출", "정책자금"],
 fields: [
 { name: "businessIncome", label: "연 사업소득", defaultValue: 30_000_000, suffix: "원" },
 { name: "creditScore", label: "신용점수", defaultValue: 800 },
 ],
 compute: ({ businessIncome, creditScore }) => {
 // 정책자금 한도 (소상공인진흥공단 기준 단순화)
 let limit = 0;
 if (creditScore >= 750) limit = Math.min(70_000_000, businessIncome * 1.5);
 else if (creditScore >= 700) limit = Math.min(50_000_000, businessIncome * 1.0);
 else limit = Math.min(30_000_000, businessIncome * 0.5);
 return {
 primary: { label: "정책자금 한도", value: limit, suffix: "원" },
 secondary: [
 { label: "신용 등급 (단순)", value: creditScore, suffix: "" },
 { label: "사업소득 기준", value: businessIncome, suffix: "원" },
 ],
 note: "소상공인진흥공단·신용보증재단 별도. 우대금리 2~4%.",
 };
 },
 relatedSlugs: ["small-business-startup-cost", "loan-limit-quick"],
 },
];

// ─── 생활·건강 (10개) ─────────────────────────────────────
const LIFE_DEEP: CalculatorDef[] = [
 {
 slug: "monthly-budget-50-30-20",
 title: "50/30/20 가계부 분배",
 description: "월급의 50% 필수·30% 욕구·20% 저축 자동 분배",
 category: "life",
 categoryLabel: "가계부",
 keywords: ["가계부", "50/30/20", "월급 분배"],
 fields: [{ name: "monthly", label: "월 실수령액", defaultValue: 3_000_000, suffix: "원" }],
 compute: ({ monthly }) => {
 const needs = Math.round(monthly * 0.5);
 const wants = Math.round(monthly * 0.3);
 const savings = Math.round(monthly * 0.2);
 return {
 primary: { label: "월 저축 목표", value: savings, suffix: "원" },
 secondary: [
 { label: "필수 지출 (50%)", value: needs, suffix: "원" },
 { label: "원하는 지출 (30%)", value: wants, suffix: "원" },
 ],
 note: "필수: 월세·식비·교통·공과금. 욕구: 외식·여행·쇼핑. 저축: 비상금·투자·노후.",
 };
 },
 relatedSlugs: ["emergency-fund", "household-ledger"],
 },
 {
 slug: "emergency-fund",
 title: "비상금 목표 계산기",
 description: "월 지출 × 6개월 = 권장 비상금",
 category: "life",
 categoryLabel: "재테크",
 keywords: ["비상금", "비상자금", "비상금 6개월"],
 fields: [{ name: "monthlyExpense", label: "월 지출", defaultValue: 2_500_000, suffix: "원" }],
 compute: ({ monthlyExpense }) => {
 const min = monthlyExpense * 3;
 const recommended = monthlyExpense * 6;
 const safe = monthlyExpense * 12;
 return {
 primary: { label: "권장 비상금", value: recommended, suffix: "원" },
 secondary: [
 { label: "최소 (3개월)", value: min, suffix: "원" },
 { label: "안전 (12개월)", value: safe, suffix: "원" },
 ],
 note: "비상금은 즉시 인출 가능 (CMA·MMF·예금). 주식·부동산 X.",
 };
 },
 relatedSlugs: ["monthly-budget-50-30-20", "fixed-deposit"],
 },
 {
 slug: "household-ledger",
 title: "가계부 분석 (지출 비중)",
 description: "월 지출 카테고리별 입력 → 비중 분석 + 절감 가능 영역",
 category: "life",
 categoryLabel: "가계부",
 keywords: ["가계부 분석", "지출 분석", "지출 비중"],
 fields: [
 { name: "rent", label: "월세·관리비", defaultValue: 600_000, suffix: "원" },
 { name: "food", label: "식비", defaultValue: 500_000, suffix: "원" },
 { name: "transport", label: "교통비", defaultValue: 100_000, suffix: "원" },
 { name: "etc", label: "기타", defaultValue: 800_000, suffix: "원" },
 ],
 compute: ({ rent, food, transport, etc }) => {
 const total = rent + food + transport + etc;
 const rentRatio = (rent / total) * 100;
 const foodRatio = (food / total) * 100;
 return {
 primary: { label: "월 총 지출", value: total, suffix: "원" },
 secondary: [
 { label: "월세 비중", value: rentRatio, suffix: "%" },
 { label: "식비 비중", value: foodRatio, suffix: "%" },
 { label: "기타 비중", value: ((etc / total) * 100), suffix: "%" },
 ],
 note: "권장: 월세 ≤ 30%, 식비 ≤ 15%, 기타 ≤ 25%, 저축 ≥ 20%.",
 };
 },
 relatedSlugs: ["monthly-budget-50-30-20", "subscription-cost"],
 },
 {
 slug: "marriage-cost-estimate",
 title: "결혼 비용 추정기",
 description: "예식·신혼여행·신혼집 → 총 결혼 비용",
 category: "family",
 categoryLabel: "결혼",
 keywords: ["결혼 비용", "결혼식 비용", "신혼집"],
 fields: [
 { name: "weddingType", label: "결혼식 규모 (1=스몰, 2=일반, 3=호텔)", defaultValue: 2 },
 { name: "honeymoonBudget", label: "신혼여행 예산", defaultValue: 8_000_000, suffix: "원" },
 { name: "homeBudget", label: "신혼집 (전세금/대출)", defaultValue: 250_000_000, suffix: "원" },
 ],
 compute: ({ weddingType, honeymoonBudget, homeBudget }) => {
 const weddingCosts = { 1: 5_000_000, 2: 25_000_000, 3: 60_000_000 };
 const wedding = weddingCosts[weddingType as 1 | 2 | 3] || 25_000_000;
 const total = wedding + honeymoonBudget + homeBudget;
 return {
 primary: { label: "총 결혼 비용", value: total, suffix: "원" },
 secondary: [
 { label: "결혼식", value: wedding, suffix: "원" },
 { label: "신혼여행", value: honeymoonBudget, suffix: "원" },
 { label: "신혼집", value: homeBudget, suffix: "원" },
 ],
 note: "한국 평균 결혼 비용 약 2~3억 (신혼집 포함). 결혼세액공제 50만 별도.",
 };
 },
 relatedSlugs: ["marriage-tax-credit", "jeonse-loan"],
 },
 {
 slug: "marriage-tax-credit",
 title: "결혼세액공제 환급액",
 description: "혼인 신고 연도 50만원 세액공제",
 category: "tax",
 categoryLabel: "세금",
 keywords: ["결혼세액공제", "결혼 세금 환급", "혼인 신고"],
 fields: [
 { name: "totalIncome", label: "총급여", defaultValue: 50_000_000, suffix: "원" },
 { name: "isMarried", label: "혼인 신고 여부 (1=O, 0=X)", defaultValue: 1 },
 ],
 compute: ({ totalIncome, isMarried }) => {
 const isEligible = isMarried === 1 && totalIncome <= 70_000_000;
 const credit = isEligible ? 500_000 : 0;
 return {
 primary: { label: "결혼세액공제", value: credit, suffix: "원" },
 secondary: [
 { label: "자격 충족", value: isEligible ? 1 : 0, suffix: "" },
 { label: "총급여 한도", value: 70_000_000, suffix: "원" },
 ],
 note: "총급여 7천만 이하 + 혼인신고일 또는 다음 해. 부부 모두 신청 시 합 100만.",
 };
 },
 relatedSlugs: ["marriage-cost-estimate", "child-tax-credit"],
 },
 {
 slug: "child-tax-credit",
 title: "자녀세액공제 (출산·다자녀)",
 description: "자녀 수·연령별 세액공제 + 출산 추가",
 category: "family",
 categoryLabel: "육아",
 keywords: ["자녀세액공제", "출산 세액공제", "다자녀"],
 fields: [
 { name: "childCount", label: "자녀 수", defaultValue: 2 },
 { name: "underAgeSix", label: "만 6세 이하 자녀 수", defaultValue: 1 },
 ],
 compute: ({ childCount, underAgeSix }) => {
 // 자녀세액공제: 1자녀 30만, 2자녀 50만, 3자녀 70만, 4자녀+ 100만
 const tier = Math.min(4, childCount);
 const childCredit = [0, 300_000, 800_000, 1_500_000, 2_500_000][tier];
 // 만 6세 이하 추가 100만 / 인당
 const underSixCredit = underAgeSix * 1_000_000 * 0.165; // 16.5% 환급 (단순)
 return {
 primary: { label: "예상 환급", value: Math.round(childCredit + underSixCredit), suffix: "원" },
 secondary: [
 { label: "자녀세액공제", value: childCredit, suffix: "원" },
 { label: "6세 이하 추가공제 환급", value: Math.round(underSixCredit), suffix: "원" },
 ],
 note: "출산 연도 추가 30~70만 별도. 본 계산은 정기 공제만.",
 };
 },
 relatedSlugs: ["marriage-tax-credit", "parental-leave-benefit"],
 },
 {
 slug: "subscription-cost",
 title: "구독료 합계 분석",
 description: "OTT·음악·SaaS 입력 → 월·연 총액 + 절약 가능액",
 category: "life",
 categoryLabel: "구독",
 keywords: ["구독료 합계", "OTT 비용", "구독 절약"],
 fields: [
 { name: "ott", label: "OTT (Netflix·Disney+ 등)", defaultValue: 30_000, suffix: "원" },
 { name: "music", label: "음악 (멜론·유튜브 프리미엄)", defaultValue: 15_000, suffix: "원" },
 { name: "etc", label: "기타 (뉴스·SaaS)", defaultValue: 20_000, suffix: "원" },
 ],
 compute: ({ ott, music, etc }) => {
 const monthly = ott + music + etc;
 const yearly = monthly * 12;
 // 가족 공유 시 약 30~40% 절감 가능
 const sharingSaving = Math.round(monthly * 0.35);
 return {
 primary: { label: "월 구독료", value: monthly, suffix: "원" },
 secondary: [
 { label: "연 구독료", value: yearly, suffix: "원" },
 { label: "가족 공유 시 절감", value: sharingSaving, suffix: "원" },
 ],
 note: "유튜브 프리미엄 가족 6명 공유 → 1인당 ~3,700원 절약.",
 };
 },
 relatedSlugs: ["monthly-budget-50-30-20", "household-ledger"],
 },
 {
 slug: "fitness-roi",
 title: "헬스장 vs 홈트 비용 비교",
 description: "1년 비용 비교 + ROI 분석",
 category: "health",
 categoryLabel: "건강",
 keywords: ["헬스장 비용", "홈트", "PT 비용"],
 fields: [
 { name: "monthlyGym", label: "헬스장 월 회비", defaultValue: 80_000, suffix: "원" },
 { name: "homeEquipment", label: "홈트 장비 (1회)", defaultValue: 500_000, suffix: "원" },
 ],
 compute: ({ monthlyGym, homeEquipment }) => {
 const yearlyGym = monthlyGym * 12;
 const yearlyHome = homeEquipment / 5; // 5년 감가상각
 const saving = yearlyGym - yearlyHome;
 return {
 primary: { label: "연 절약액 (홈트)", value: Math.round(saving), suffix: "원" },
 secondary: [
 { label: "헬스장 1년", value: yearlyGym, suffix: "원" },
 { label: "홈트 1년 (감가)", value: Math.round(yearlyHome), suffix: "원" },
 ],
 note: "홈트는 의지력 + 공간 필요. PT 받으면 PT 비용 추가 (회당 5~10만).",
 };
 },
 relatedSlugs: ["monthly-budget-50-30-20", "subscription-cost"],
 },
 {
 slug: "smoke-cost",
 title: "흡연·음주 연간 비용",
 description: "월 흡연·음주량 → 연 비용 + 평생 누적",
 category: "health",
 categoryLabel: "건강",
 keywords: ["흡연 비용", "담배 비용", "음주 비용"],
 fields: [
 { name: "cigaretteDays", label: "월 담배갑 수", defaultValue: 15, suffix: "갑/월" },
 { name: "drinkingDays", label: "월 음주 횟수", defaultValue: 8, suffix: "회/월" },
 ],
 compute: ({ cigaretteDays, drinkingDays }) => {
 const cigaretteMonthly = cigaretteDays * 4_500;
 const drinkingMonthly = drinkingDays * 30_000;
 const monthlyTotal = cigaretteMonthly + drinkingMonthly;
 const yearlyTotal = monthlyTotal * 12;
 const tenYears = yearlyTotal * 10;
 return {
 primary: { label: "연 흡연·음주 비용", value: yearlyTotal, suffix: "원" },
 secondary: [
 { label: "월 담배 비용", value: cigaretteMonthly, suffix: "원" },
 { label: "월 음주 비용", value: drinkingMonthly, suffix: "원" },
 { label: "10년 누적", value: tenYears, suffix: "원" },
 ],
 note: "담배 1갑 4,500원, 음주 1회 평균 3만원 가정. 10년이면 평생 흡연·음주가 자동차 1대 값.",
 };
 },
 relatedSlugs: ["monthly-budget-50-30-20", "compound-future-value"],
 },
 {
 slug: "fertility-treatment-cost",
 title: "난임 시술 비용",
 description: "건강보험 본인부담 + 난임 시술 횟수 → 연 비용",
 category: "health",
 categoryLabel: "의료",
 keywords: ["난임 시술", "시험관 비용", "건강보험 본인부담"],
 fields: [
 { name: "ivfCount", label: "시험관 시도 횟수", defaultValue: 3 },
 { name: "iuiCount", label: "인공수정 횟수", defaultValue: 0 },
 ],
 compute: ({ ivfCount, iuiCount }) => {
 // 시험관 1회 본인부담 약 100~300만 (난임 지원 후)
 const ivfCost = ivfCount * 1_500_000;
 const iuiCost = iuiCount * 300_000;
 const total = ivfCost + iuiCost;
 // 30% 의료비 세액공제
 const taxRefund = Math.round(total * 0.3 * 0.165);
 return {
 primary: { label: "총 본인부담 (지원 후)", value: total, suffix: "원" },
 secondary: [
 { label: "예상 의료비 환급", value: taxRefund, suffix: "원" },
 { label: "시험관 합계", value: ivfCost, suffix: "원" },
 { label: "인공수정 합계", value: iuiCost, suffix: "원" },
 ],
 note: "난임시술 별도 30% 세액공제. 정부 지원 (난임시술비 지원사업) 별도.",
 };
 },
 relatedSlugs: ["child-tax-credit", "parental-leave-benefit"],
 },
];

export const batch4Calculators: CalculatorDef[] = [
 ...TAX_DEEP,
 ...LABOR,
 ...INVEST,
 ...SIDE_BIZ,
 ...LIFE_DEEP,
];
