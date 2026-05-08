// src/lib/simpleCalculators/batch5.ts
// Phase 6+ 확장: 30개 신규 계산기 (부동산·보험·자녀·노후 심화).

import type { CalculatorDef } from "./types";

// ─── 부동산 (8개) ─────────────────────────────────────────
const REAL_ESTATE: CalculatorDef[] = [
 {
 slug: "property-tax-quarterly",
 title: "재산세 분기 계산기",
 description: "공시가격 × 시가표준액 × 60% × 누진세율",
 category: "tax",
 categoryLabel: "세금",
 keywords: ["재산세", "재산세 계산", "주택 재산세"],
 fields: [
 { name: "publicPrice", label: "공시가격", defaultValue: 500_000_000, suffix: "원" },
 ],
 compute: ({ publicPrice }) => {
 // 공시가 × 60% (공정시장가액비율)
 const taxBase = publicPrice * 0.6;
 // 누진세율 0.1~0.4%
 let tax = 0;
 if (taxBase <= 60_000_000) tax = taxBase * 0.001;
 else if (taxBase <= 150_000_000) tax = taxBase * 0.0015 - 30_000;
 else if (taxBase <= 300_000_000) tax = taxBase * 0.0025 - 180_000;
 else tax = taxBase * 0.004 - 630_000;
 const eduTax = tax * 0.2;
 const total = Math.round(tax + eduTax);
 return {
 primary: { label: "연 재산세", value: total, suffix: "원" },
 secondary: [
 { label: "본세", value: Math.round(tax), suffix: "원" },
 { label: "지방교육세 (20%)", value: Math.round(eduTax), suffix: "원" },
 { label: "분기 (50% 7월 + 50% 9월)", value: Math.round(total / 2), suffix: "원" },
 ],
 note: "주택은 7월·9월 분기 납부. 토지·건물 별도.",
 };
 },
 explanation: "재산세 = 공시가격 × 60% × 누진세율 + 지방교육세 20%.",
 relatedSlugs: ["comprehensive-property-tax", "acquisition-tax"],
 },
 {
 slug: "capital-gains-real-estate",
 title: "주택 양도세 계산기 (단기·장기)",
 description: "보유 기간별 단기 60~70%, 일반 누진세율",
 category: "tax",
 categoryLabel: "세금",
 keywords: ["양도세", "주택 양도세", "단기 양도세"],
 fields: [
 { name: "salePrice", label: "양도가액", defaultValue: 500_000_000, suffix: "원" },
 { name: "buyPrice", label: "취득가액", defaultValue: 350_000_000, suffix: "원" },
 { name: "holdYears", label: "보유 년수", defaultValue: 3 },
 ],
 compute: ({ salePrice, buyPrice, holdYears }) => {
 const gain = salePrice - buyPrice;
 const taxableGain = Math.max(0, gain - 2_500_000); // 기본공제
 let rate = 0;
 if (holdYears < 1) rate = 0.7; // 1년 미만 70%
 else if (holdYears < 2) rate = 0.6; // 2년 미만 60%
 else {
 // 일반 누진세율
 if (taxableGain <= 14_000_000) rate = 0.06;
 else if (taxableGain <= 50_000_000) rate = 0.15;
 else if (taxableGain <= 88_000_000) rate = 0.24;
 else if (taxableGain <= 150_000_000) rate = 0.35;
 else if (taxableGain <= 300_000_000) rate = 0.38;
 else if (taxableGain <= 500_000_000) rate = 0.4;
 else if (taxableGain <= 1_000_000_000) rate = 0.42;
 else rate = 0.45;
 }
 const tax = Math.round(taxableGain * rate);
 const localTax = Math.round(tax * 0.1);
 return {
 primary: { label: "양도세 (지방세 포함)", value: tax + localTax, suffix: "원" },
 secondary: [
 { label: "양도차익", value: gain, suffix: "원" },
 { label: "적용 세율", value: rate * 100, suffix: "%" },
 ],
 note: "1주택 + 2년 보유·거주는 12억 이하 비과세.",
 };
 },
 relatedSlugs: ["single-house-non-tax", "comprehensive-property-tax"],
 },
 {
 slug: "house-purchase-vs-rent",
 title: "매매 vs 전세 비교 시뮬",
 description: "5년 후 자산 비교 (매매 + 대출 vs 전세 + 투자)",
 category: "real-estate",
 categoryLabel: "부동산",
 keywords: ["매매 전세 비교", "갭투자 vs 전세"],
 fields: [
 { name: "salePrice", label: "매매가", defaultValue: 600_000_000, suffix: "원" },
 { name: "jeonsePrice", label: "전세가", defaultValue: 450_000_000, suffix: "원" },
 { name: "appreciation", label: "5년 매매가 상승률 (%)", defaultValue: 15, suffix: "%" },
 ],
 compute: ({ salePrice, jeonsePrice, appreciation }) => {
 // 매매 시나리오: 매매가 상승 - 대출 이자 - 취득세
 const downPayment = salePrice * 0.4; // 자기자본 40%
 const loan = salePrice * 0.6;
 const loanInterest = loan * 0.05 * 5; // 5% × 5년
 const acquisitionTax = salePrice * 0.07;
 const futurePrice = salePrice * (1 + appreciation / 100);
 const buyEquity = futurePrice - loan - loanInterest - acquisitionTax;
 // 전세 시나리오: 전세금 보존 + 차액 투자
 const investableAmount = salePrice - jeonsePrice;
 const investReturn = investableAmount * Math.pow(1.06, 5); // 연 6%
 const rentEquity = jeonsePrice + investReturn;
 const diff = buyEquity - rentEquity;
 return {
 primary: { label: "5년 후 차이", value: Math.round(diff), suffix: "원" },
 secondary: [
 { label: "매매 시 자산", value: Math.round(buyEquity), suffix: "원" },
 { label: "전세 시 자산", value: Math.round(rentEquity), suffix: "원" },
 ],
 note: "매매가 상승률 + 대출 금리·취득세에 따라 결과 달라짐.",
 };
 },
 relatedSlugs: ["jeonse-monthly-conversion", "ltv-quick"],
 },
 {
 slug: "youth-housing-loan",
 title: "청년 전세 대출 한도",
 description: "만 19~34세 청년 전세 대출 (한도 2억·1.5%)",
 category: "loan",
 categoryLabel: "대출",
 keywords: ["청년 전세 대출", "버팀목 전세", "청년 주택"],
 fields: [
 { name: "annualIncome", label: "연 소득", defaultValue: 40_000_000, suffix: "원" },
 { name: "jeonsePrice", label: "전세 보증금", defaultValue: 200_000_000, suffix: "원" },
 ],
 compute: ({ annualIncome, jeonsePrice }) => {
 // 버팀목 전세대출 한도 약 2억, 자격: 연소득 5천만 이하 + 만 34세 이하
 const isEligible = annualIncome <= 50_000_000;
 const limit = Math.min(200_000_000, jeonsePrice * 0.8);
 const monthlyPayment = (limit * 0.015) / 12; // 1.5% 우대금리
 return {
 primary: { label: "월 이자", value: Math.round(monthlyPayment), suffix: "원" },
 secondary: [
 { label: "대출 한도", value: limit, suffix: "원" },
 { label: "자격 충족", value: isEligible ? 1 : 0, suffix: "" },
 ],
 note: "버팀목 전세대출 (HUG·HF). 우대금리 1.5~2.5%. 신혼·자녀 추가 우대.",
 };
 },
 relatedSlugs: ["jeonse-loan", "ltv-quick"],
 },
 {
 slug: "first-time-housing",
 title: "생애최초 주택 구입 대출",
 description: "만 30세+ 무주택 생애최초 LTV 80%·DSR 60% 우대",
 category: "loan",
 categoryLabel: "대출",
 keywords: ["생애최초", "디딤돌 대출", "보금자리론"],
 fields: [
 { name: "salePrice", label: "주택 가격", defaultValue: 400_000_000, suffix: "원" },
 { name: "annualIncome", label: "연 소득", defaultValue: 70_000_000, suffix: "원" },
 ],
 compute: ({ salePrice, annualIncome }) => {
 // 디딤돌 대출 한도 (소득별 차등)
 const isEligible = annualIncome <= 70_000_000 && salePrice <= 600_000_000;
 const ltvLimit = salePrice * 0.8;
 const dsrLimit = annualIncome * 0.6;
 const maxLoan = Math.min(250_000_000, ltvLimit);
 // 우대금리 약 2.5%
 const monthlyPayment = (maxLoan * 0.025) / 12;
 return {
 primary: { label: "최대 대출 한도", value: maxLoan, suffix: "원" },
 secondary: [
 { label: "월 이자 (2.5%)", value: Math.round(monthlyPayment), suffix: "원" },
 { label: "자격 충족", value: isEligible ? 1 : 0, suffix: "" },
 ],
 note: "디딤돌 대출 (HF). 부부 연소득 합 7천만 이하. 30년 만기.",
 };
 },
 relatedSlugs: ["youth-housing-loan", "home-loan"],
 },
 {
 slug: "housing-subscription-points",
 title: "주택청약 가점 계산기",
 description: "무주택·부양·청약 가입기간 합산 가점",
 category: "real-estate",
 categoryLabel: "부동산",
 keywords: ["청약 가점", "주택청약", "84점 만점"],
 fields: [
 { name: "noHouseYears", label: "무주택 년수", defaultValue: 5 },
 { name: "dependents", label: "부양가족 수", defaultValue: 2 },
 { name: "depositMonths", label: "청약 가입 개월", defaultValue: 60 },
 ],
 compute: ({ noHouseYears, dependents, depositMonths }) => {
 // 무주택 (32점) + 부양 (35점) + 청약 (17점) = 84점 만점
 const noHousePoints = Math.min(32, 2 + noHouseYears * 2);
 const dependentPoints = Math.min(35, 5 + dependents * 5);
 const depositPoints = Math.min(17, Math.floor(depositMonths / 6) + 1);
 const total = noHousePoints + dependentPoints + depositPoints;
 return {
 primary: { label: "총 청약 가점", value: total, suffix: "점" },
 secondary: [
 { label: "무주택", value: noHousePoints, suffix: "점" },
 { label: "부양가족", value: dependentPoints, suffix: "점" },
 { label: "청약 가입", value: depositPoints, suffix: "점" },
 ],
 note: "84점 만점. 강남 평균 당첨 가점 70점+. 일반 50~60점.",
 };
 },
 relatedSlugs: ["subscription-saving-housing", "first-time-housing"],
 },
 {
 slug: "rental-income-summary",
 title: "임대소득 종합과세 시뮬",
 description: "주택임대 + 본업 합산 종합소득세",
 category: "tax",
 categoryLabel: "세금",
 keywords: ["임대소득 종합과세", "주택임대 세금"],
 fields: [
 { name: "salaryIncome", label: "근로소득", defaultValue: 50_000_000, suffix: "원" },
 { name: "rentalIncome", label: "주택임대 수입 (연)", defaultValue: 24_000_000, suffix: "원" },
 ],
 compute: ({ salaryIncome, rentalIncome }) => {
 const rentalNet = rentalIncome * 0.4; // 60% 경비 가정
 const total = salaryIncome + rentalNet;
 // 단순 누진세율
 let tax = 0;
 if (total <= 50_000_000) tax = total * 0.15 - 1_260_000;
 else if (total <= 88_000_000) tax = total * 0.24 - 5_760_000;
 else tax = total * 0.35 - 15_440_000;
 return {
 primary: { label: "종합소득세", value: Math.round(tax * 1.1), suffix: "원" },
 secondary: [
 { label: "임대순익 (40%)", value: Math.round(rentalNet), suffix: "원" },
 { label: "합산 과표", value: total, suffix: "원" },
 ],
 note: "2,000만 초과 임대수입은 종합과세 의무. 분리과세 14% 선택 시 별도.",
 };
 },
 relatedSlugs: ["rental-income-tax", "comprehensive-property-tax"],
 },
 {
 slug: "real-estate-broker-fee",
 title: "공인중개사 중개수수료",
 description: "매매·전세 거래 시 법정 수수료 자동 산출",
 category: "real-estate",
 categoryLabel: "부동산",
 keywords: ["중개수수료", "복비 계산", "부동산 수수료"],
 fields: [
 { name: "transactionPrice", label: "거래 금액", defaultValue: 500_000_000, suffix: "원" },
 { name: "type", label: "유형 (1=매매, 2=전세, 3=월세)", defaultValue: 1 },
 ],
 compute: ({ transactionPrice, type }) => {
 let rate = 0;
 if (type === 1) {
 // 매매 (단순화)
 if (transactionPrice < 500_000_000) rate = 0.005;
 else if (transactionPrice < 900_000_000) rate = 0.006;
 else if (transactionPrice < 1_500_000_000) rate = 0.005;
 else rate = 0.007;
 } else if (type === 2) rate = 0.004; // 전세
 else rate = 0.0035; // 월세
 const fee = Math.round(transactionPrice * rate);
 const vat = Math.round(fee * 0.1);
 return {
 primary: { label: "총 수수료 (VAT 포함)", value: fee + vat, suffix: "원" },
 secondary: [
 { label: "본 수수료", value: fee, suffix: "원" },
 { label: "VAT (10%)", value: vat, suffix: "원" },
 { label: "적용 요율", value: rate * 100, suffix: "%" },
 ],
 note: "매수자·매도자 각각 부담. 협의 가능.",
 };
 },
 relatedSlugs: ["acquisition-tax", "house-purchase-vs-rent"],
 },
];

// ─── 보험 (8개) ─────────────────────────────────────────
const INSURANCE: CalculatorDef[] = [
 {
 slug: "auto-insurance-quote",
 title: "자동차보험료 추정",
 description: "차량가·운전자 연령·등급 → 연 보험료",
 category: "insurance",
 categoryLabel: "보험",
 keywords: ["자동차보험료", "자보료 계산", "다이렉트 자보"],
 fields: [
 { name: "carPrice", label: "차량 가격", defaultValue: 30_000_000, suffix: "원" },
 { name: "age", label: "운전자 연령", defaultValue: 35 },
 { name: "grade", label: "할인할증 등급 (1~26)", defaultValue: 11 },
 ],
 compute: ({ carPrice, age, grade }) => {
 // 차량가 × 1% 기본 + 연령 가산 + 등급 할인
 let basePremium = carPrice * 0.01;
 if (age < 26) basePremium *= 1.5;
 else if (age < 35) basePremium *= 1.2;
 else if (age >= 60) basePremium *= 1.1;
 // 등급 11이 표준, 1~10은 할증, 12~26은 할인
 const gradeFactor = 1 - (grade - 11) * 0.05;
 const premium = Math.round(basePremium * Math.max(0.3, gradeFactor));
 return {
 primary: { label: "연 보험료 (추정)", value: premium, suffix: "원" },
 secondary: [
 { label: "월 보험료", value: Math.round(premium / 12), suffix: "원" },
 { label: "할인할증 등급", value: grade, suffix: "" },
 ],
 note: "다이렉트 보험사가 더 저렴. 약 15~25% 절약.",
 };
 },
 relatedSlugs: ["car-loan", "auto-tax-annual"],
 },
 {
 slug: "fire-insurance-premium",
 title: "주택 화재보험료",
 description: "주택 평형·구조 → 연 보험료",
 category: "insurance",
 categoryLabel: "보험",
 keywords: ["화재보험", "주택 화재", "주택종합보험"],
 fields: [
 { name: "houseSize", label: "주택 평수", defaultValue: 30, suffix: "평" },
 { name: "structure", label: "구조 (1=아파트, 2=단독, 3=다세대)", defaultValue: 1 },
 ],
 compute: ({ houseSize, structure }) => {
 const ratePerPyeong = structure === 1 ? 4_000 : structure === 2 ? 6_000 : 5_000;
 const premium = houseSize * ratePerPyeong;
 return {
 primary: { label: "연 보험료", value: premium, suffix: "원" },
 secondary: [
 { label: "평당 요율", value: ratePerPyeong, suffix: "원" },
 ],
 note: "아파트 의무가입. 단독·다세대 권장. 장기보험 (15~25년) 시 30~50% 할인.",
 };
 },
 relatedSlugs: ["auto-insurance-quote"],
 },
 {
 slug: "term-life-insurance",
 title: "정기보험료 추정",
 description: "보험금·연령·기간 → 월 보험료",
 category: "insurance",
 categoryLabel: "보험",
 keywords: ["정기보험", "정기보험료", "사망보험"],
 fields: [
 { name: "coverAmount", label: "보험금", defaultValue: 200_000_000, suffix: "원" },
 { name: "age", label: "가입 연령", defaultValue: 35 },
 { name: "years", label: "보장 기간", defaultValue: 20, suffix: "년" },
 ],
 compute: ({ coverAmount, age, years }) => {
 // 단순 추정: 보험금 1억당 월 약 1만 (40세 기준), 연령별 가감
 const baseRate = 0.0001;
 const ageFactor = 1 + (age - 35) * 0.05;
 const monthlyPremium = Math.round((coverAmount / 100_000_000) * 10_000 * ageFactor);
 return {
 primary: { label: "월 보험료 (추정)", value: monthlyPremium, suffix: "원" },
 secondary: [
 { label: "연 보험료", value: monthlyPremium * 12, suffix: "원" },
 { label: "총 납입액", value: monthlyPremium * 12 * years, suffix: "원" },
 ],
 note: "비흡연·비음주·건강 양호 시 더 저렴. 다이렉트 가입 추가 할인.",
 };
 },
 relatedSlugs: ["auto-insurance-quote"],
 },
 {
 slug: "real-loss-insurance",
 title: "실손의료보험료 추정",
 description: "연령·성별별 월 보험료 + 본인부담 한도",
 category: "insurance",
 categoryLabel: "보험",
 keywords: ["실손의료보험", "실비 보험", "실손보험"],
 fields: [
 { name: "age", label: "가입 연령", defaultValue: 35 },
 { name: "gender", label: "성별 (1=남, 2=여)", defaultValue: 1 },
 ],
 compute: ({ age, gender }) => {
 // 4세대 실손 단순 추정
 let base = 12_000;
 if (age >= 40) base = 18_000;
 if (age >= 50) base = 28_000;
 if (age >= 60) base = 45_000;
 if (gender === 2) base *= 0.85; // 여성 할인
 return {
 primary: { label: "월 보험료 (4세대)", value: Math.round(base), suffix: "원" },
 secondary: [
 { label: "연 보험료", value: Math.round(base * 12), suffix: "원" },
 ],
 note: "4세대 실손 (2021+). 매년 갱신·인상. 1년 비보험 의료비 100만 초과분 보장.",
 };
 },
 relatedSlugs: ["term-life-insurance"],
 },
 {
 slug: "cancer-insurance",
 title: "암보험 가입 가이드",
 description: "보험금·연령 → 월 보험료 + 진단비",
 category: "insurance",
 categoryLabel: "보험",
 keywords: ["암보험", "암 진단비", "암보험료"],
 fields: [
 { name: "diagnosisAmount", label: "진단비 보험금", defaultValue: 30_000_000, suffix: "원" },
 { name: "age", label: "가입 연령", defaultValue: 35 },
 ],
 compute: ({ diagnosisAmount, age }) => {
 // 단순 추정
 let rate = 0.0008;
 if (age >= 40) rate = 0.0012;
 if (age >= 50) rate = 0.002;
 if (age >= 60) rate = 0.004;
 const monthly = Math.round(diagnosisAmount * rate);
 return {
 primary: { label: "월 보험료 (추정)", value: monthly, suffix: "원" },
 secondary: [
 { label: "진단비", value: diagnosisAmount, suffix: "원" },
 ],
 note: "갑상선·일반암·고액암 차등. 갱신형 vs 비갱신형 차이 큼.",
 };
 },
 relatedSlugs: ["real-loss-insurance"],
 },
 {
 slug: "self-employed-insurance",
 title: "자영업자 4대보험료",
 description: "사업소득 → 본인 부담 4대보험",
 category: "insurance",
 categoryLabel: "보험",
 keywords: ["자영업자 4대보험", "지역가입자 보험"],
 fields: [
 { name: "businessIncome", label: "월 사업소득", defaultValue: 4_000_000, suffix: "원" },
 ],
 compute: ({ businessIncome }) => {
 // 지역가입자 건강보험 (소득 + 재산 점수)
 const npRate = 0.09; // 본인 부담 9% (지역)
 const hiRate = 0.0709; // 건보료 7.09% (지역가입자)
 const np = businessIncome * npRate;
 const hi = businessIncome * hiRate;
 const total = np + hi;
 return {
 primary: { label: "월 4대보험료", value: Math.round(total), suffix: "원" },
 secondary: [
 { label: "국민연금 (9% 본인 100%)", value: Math.round(np), suffix: "원" },
 { label: "건강보험 (7.09%)", value: Math.round(hi), suffix: "원" },
 ],
 note: "자영업자는 직장가입자(본인 4.5%)보다 약 2배 부담.",
 };
 },
 relatedSlugs: ["small-business-startup-cost", "vat-quick"],
 },
 {
 slug: "medical-expense-deduction",
 title: "의료비 세액공제 한도",
 description: "본인·가족 의료비 → 환급 한도",
 category: "tax",
 categoryLabel: "세금",
 keywords: ["의료비 공제", "의료비 환급", "안경 공제"],
 fields: [
 { name: "totalIncome", label: "총급여", defaultValue: 50_000_000, suffix: "원" },
 { name: "medicalExpense", label: "연 의료비", defaultValue: 3_000_000, suffix: "원" },
 ],
 compute: ({ totalIncome, medicalExpense }) => {
 const threshold = totalIncome * 0.03; // 3% 초과분만
 const deductible = Math.max(0, medicalExpense - threshold);
 const refund = Math.round(deductible * 0.165); // 16.5% 환급
 return {
 primary: { label: "예상 환급액", value: refund, suffix: "원" },
 secondary: [
 { label: "공제 가능 의료비", value: Math.round(deductible), suffix: "원" },
 { label: "총급여 3% 임계", value: Math.round(threshold), suffix: "원" },
 ],
 note: "의료비는 총급여 3% 초과분만 공제. 안경·렌즈비 별도 (1인 50만 한도).",
 };
 },
 relatedSlugs: ["year-end-tax", "child-tax-credit"],
 },
 {
 slug: "out-of-pocket-cap",
 title: "건강보험 본인부담 상한제",
 description: "연 본인부담 의료비가 한도 초과 시 환급",
 category: "insurance",
 categoryLabel: "보험",
 keywords: ["본인부담 상한", "의료비 환급"],
 fields: [
 { name: "incomeBracket", label: "건보료 분위 (1~7)", defaultValue: 4 },
 { name: "yearlyMedical", label: "연 본인부담 의료비", defaultValue: 8_000_000, suffix: "원" },
 ],
 compute: ({ incomeBracket, yearlyMedical }) => {
 // 분위별 한도 (단순화)
 const limits = [870_000, 1_080_000, 1_460_000, 2_460_000, 3_080_000, 4_180_000, 6_000_000];
 const limit = limits[Math.min(6, Math.max(0, incomeBracket - 1))];
 const refund = Math.max(0, yearlyMedical - limit);
 return {
 primary: { label: "환급 가능액", value: refund, suffix: "원" },
 secondary: [
 { label: "본인부담 상한", value: limit, suffix: "원" },
 { label: "연 본인부담 의료비", value: yearlyMedical, suffix: "원" },
 ],
 note: "건보공단 자동 계산 후 다음 해 8월 환급. 요양·입원·외래·약값 모두 포함.",
 };
 },
 relatedSlugs: ["medical-expense-deduction", "real-loss-insurance"],
 },
];

// ─── 자녀·교육 (7개) ─────────────────────────────────────
const CHILD_EDU: CalculatorDef[] = [
 {
 slug: "student-loan-repayment",
 title: "학자금 대출 상환",
 description: "원금·금리·기간 → 월 상환액 + 총 이자",
 category: "loan",
 categoryLabel: "대출",
 keywords: ["학자금 대출", "학자금 상환"],
 fields: [
 { name: "principal", label: "대출 원금", defaultValue: 30_000_000, suffix: "원" },
 { name: "rate", label: "금리 (%)", defaultValue: 1.7, suffix: "%" },
 { name: "years", label: "상환 기간", defaultValue: 10, suffix: "년" },
 ],
 compute: ({ principal, rate, years }) => {
 const r = rate / 100 / 12;
 const n = years * 12;
 const monthly = (principal * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
 const totalInterest = monthly * n - principal;
 return {
 primary: { label: "월 상환액", value: Math.round(monthly), suffix: "원" },
 secondary: [
 { label: "총 이자", value: Math.round(totalInterest), suffix: "원" },
 { label: "총 상환액", value: Math.round(monthly * n), suffix: "원" },
 ],
 note: "한국장학재단 일반학자금 우대금리 1.7%. 취업 후 상환제 별도.",
 };
 },
 relatedSlugs: ["installment-quick"],
 },
 {
 slug: "daycare-monthly-cost",
 title: "어린이집 월 비용",
 description: "국공립·민간·평일·종일별 월 부담액",
 category: "family",
 categoryLabel: "육아",
 keywords: ["어린이집 비용", "보육료", "어린이집 월"],
 fields: [
 { name: "childAge", label: "자녀 연령 (만)", defaultValue: 2 },
 { name: "type", label: "유형 (1=국공립, 2=민간)", defaultValue: 1 },
 ],
 compute: ({ childAge, type }) => {
 // 정부 지원 후 본인 부담
 const baseCost = type === 1 ? 50_000 : 200_000;
 const ageFactor = childAge >= 3 ? 0.7 : 1.0;
 const monthly = Math.round(baseCost * ageFactor);
 return {
 primary: { label: "월 본인부담", value: monthly, suffix: "원" },
 secondary: [
 { label: "유형", value: type === 1 ? 1 : 2, suffix: " (1=국공립)" },
 ],
 note: "기본보육료 정부 지원. 추가 특별활동비·간식비 별도 (월 5~30만).",
 };
 },
 relatedSlugs: ["child-tax-credit", "kindergarten-cost"],
 },
 {
 slug: "private-academy-cost",
 title: "사교육비 합산 분석",
 description: "과목별 학원비 → 월·연 사교육비 합계",
 category: "family",
 categoryLabel: "육아",
 keywords: ["사교육비", "학원비 합산", "자녀 학원"],
 fields: [
 { name: "english", label: "영어 학원 (월)", defaultValue: 250_000, suffix: "원" },
 { name: "math", label: "수학 학원 (월)", defaultValue: 250_000, suffix: "원" },
 { name: "etc", label: "기타 (음악·체육 등)", defaultValue: 200_000, suffix: "원" },
 ],
 compute: ({ english, math, etc }) => {
 const monthly = english + math + etc;
 const yearly = monthly * 12;
 return {
 primary: { label: "월 사교육비", value: monthly, suffix: "원" },
 secondary: [
 { label: "연 사교육비", value: yearly, suffix: "원" },
 { label: "12년 누적 (초~고)", value: yearly * 12, suffix: "원" },
 ],
 note: "한국 평균 자녀 1명 월 약 50만. 본 계산 70만은 평균 이상.",
 };
 },
 relatedSlugs: ["student-loan-repayment", "child-tax-credit"],
 },
 {
 slug: "kindergarten-cost",
 title: "유치원 비용",
 description: "공립·사립 유치원 월 부담",
 category: "family",
 categoryLabel: "육아",
 keywords: ["유치원 비용", "사립 유치원", "유치원 월"],
 fields: [
 { name: "type", label: "유형 (1=공립, 2=사립)", defaultValue: 2 },
 ],
 compute: ({ type }) => {
 const monthly = type === 1 ? 100_000 : 350_000;
 return {
 primary: { label: "월 본인부담 (추정)", value: monthly, suffix: "원" },
 secondary: [
 { label: "정부 지원", value: type === 1 ? 600_000 : 350_000, suffix: "원/월" },
 ],
 note: "공립 유치원 매우 저렴 (월 10만). 사립 35만~50만. 누리과정 지원 별도.",
 };
 },
 relatedSlugs: ["daycare-monthly-cost", "private-academy-cost"],
 },
 {
 slug: "university-tuition",
 title: "대학 등록금",
 description: "국립·사립·계열별 학기 등록금",
 category: "family",
 categoryLabel: "육아",
 keywords: ["대학 등록금", "사립대 등록금", "국립대 등록금"],
 fields: [
 { name: "type", label: "유형 (1=국립, 2=사립인문, 3=사립이공)", defaultValue: 2 },
 ],
 compute: ({ type }) => {
 const tuitions = [0, 2_500_000, 4_000_000, 5_000_000];
 const semester = tuitions[Math.min(3, type)];
 const yearly = semester * 2;
 const total = yearly * 4;
 return {
 primary: { label: "1학기 등록금", value: semester, suffix: "원" },
 secondary: [
 { label: "1년 (2학기)", value: yearly, suffix: "원" },
 { label: "4년 총액", value: total, suffix: "원" },
 ],
 note: "국가장학금 + 한국장학재단 학자금 대출 활용. 의학·치대 더 비쌈 (학기 700만+).",
 };
 },
 relatedSlugs: ["student-loan-repayment"],
 },
 {
 slug: "child-savings-target",
 title: "자녀 적금 목표",
 description: "성인까지 누적 목표 금액 + 월 적립",
 category: "family",
 categoryLabel: "육아",
 keywords: ["자녀 적금", "어린이 적금", "자녀 자금"],
 fields: [
 { name: "childAge", label: "자녀 현재 연령 (만)", defaultValue: 5 },
 { name: "targetAge", label: "목표 나이", defaultValue: 19 },
 { name: "targetAmount", label: "목표 금액", defaultValue: 100_000_000, suffix: "원" },
 ],
 compute: ({ childAge, targetAge, targetAmount }) => {
 const years = Math.max(1, targetAge - childAge);
 const months = years * 12;
 // 연 4% 가정
 const r = 0.04 / 12;
 const monthly = (targetAmount * r) / (Math.pow(1 + r, months) - 1);
 return {
 primary: { label: "월 적립 필요액", value: Math.round(monthly), suffix: "원" },
 secondary: [
 { label: "기간", value: years, suffix: "년" },
 { label: "원금 합계", value: Math.round(monthly * months), suffix: "원" },
 ],
 note: "연 4% 적금 가정. 주식형 ETF는 더 적은 적립으로 도달 가능 (변동성).",
 };
 },
 relatedSlugs: ["compound-monthly", "child-tax-credit"],
 },
 {
 slug: "wedding-gift-tax",
 title: "결혼 자금 증여 비과세",
 description: "직계존속 결혼 1억 + 일반 5천만 = 1.5억 비과세",
 category: "tax",
 categoryLabel: "세금",
 keywords: ["결혼 증여", "결혼 자금 비과세", "신혼 증여"],
 fields: [
 { name: "marriageGift", label: "결혼 증여 (1억 한도)", defaultValue: 100_000_000, suffix: "원" },
 { name: "generalGift", label: "일반 증여 (5천만 한도)", defaultValue: 50_000_000, suffix: "원" },
 ],
 compute: ({ marriageGift, generalGift }) => {
 const exemption = Math.min(100_000_000, marriageGift) + Math.min(50_000_000, generalGift);
 const total = marriageGift + generalGift;
 const taxable = Math.max(0, total - exemption);
 const tax = Math.round(taxable * 0.1);
 return {
 primary: { label: "비과세 한도", value: exemption, suffix: "원" },
 secondary: [
 { label: "과세 대상", value: taxable, suffix: "원" },
 { label: "예상 증여세", value: tax, suffix: "원" },
 ],
 note: "결혼증여 1억 + 일반 5천만 = 1.5억 비과세. 부부 양가 합 3억 가능.",
 };
 },
 relatedSlugs: ["gift-split-strategy", "marriage-cost-estimate"],
 },
];

// ─── 노후·연금 (7개) ─────────────────────────────────────
const RETIREMENT: CalculatorDef[] = [
 {
 slug: "national-pension-estimate",
 title: "국민연금 수령액 추정",
 description: "가입 년수·평균 보수 → 65세 이후 월 수령액",
 category: "investment",
 categoryLabel: "노후",
 keywords: ["국민연금 수령액", "노령연금", "국민연금 추정"],
 fields: [
 { name: "yearsContributed", label: "가입 년수", defaultValue: 30 },
 { name: "avgMonthlyWage", label: "평균 월 보수", defaultValue: 4_000_000, suffix: "원" },
 ],
 compute: ({ yearsContributed, avgMonthlyWage }) => {
 // 단순 추정: 가입 20년 평균보수 100만 → 약 30만/월
 // 가입 1년당 평균보수의 0.6%를 받는다는 가정
 const monthlyPension = Math.round(avgMonthlyWage * 0.006 * yearsContributed);
 return {
 primary: { label: "65세 이후 월 수령액", value: monthlyPension, suffix: "원" },
 secondary: [
 { label: "연 수령액", value: monthlyPension * 12, suffix: "원" },
 { label: "65세부터 30년", value: monthlyPension * 12 * 30, suffix: "원" },
 ],
 note: "단순 추정. 정확한 수령액은 NPS '내 연금 알아보기' 활용.",
 };
 },
 relatedSlugs: ["retirement-pay-quick", "irp-quick"],
 },
 {
 slug: "early-retirement-pension",
 title: "국민연금 조기 수령",
 description: "60~64세 조기 수령 시 매월 0.5% 감액",
 category: "investment",
 categoryLabel: "노후",
 keywords: ["국민연금 조기", "조기 노령연금"],
 fields: [
 { name: "regularPension", label: "정상 수령액 (월)", defaultValue: 1_000_000, suffix: "원" },
 { name: "earlyYears", label: "조기 수령 년수 (1~5)", defaultValue: 3 },
 ],
 compute: ({ regularPension, earlyYears }) => {
 // 조기 수령 시 매년 6% 감액 (월 0.5%)
 const reductionRate = earlyYears * 0.06;
 const earlyPension = Math.round(regularPension * (1 - reductionRate));
 return {
 primary: { label: "조기 수령 시 월 수령액", value: earlyPension, suffix: "원" },
 secondary: [
 { label: "감액률", value: reductionRate * 100, suffix: "%" },
 { label: "정상 수령 시", value: regularPension, suffix: "원" },
 ],
 note: "조기 수령 후 평생 감액 적용. 65세까지 다른 자금 있으면 정상 수령 권장.",
 };
 },
 relatedSlugs: ["national-pension-estimate"],
 },
 {
 slug: "pension-tax-low",
 title: "연금 수령 세금 (3.3~5.5%)",
 description: "55세+ 연금 수령 시 저세율 적용",
 category: "investment",
 categoryLabel: "노후",
 keywords: ["연금 세금", "연금 수령 세율", "5.5%"],
 fields: [
 { name: "annualPension", label: "연 연금 수령액", defaultValue: 12_000_000, suffix: "원" },
 { name: "age", label: "수령 연령", defaultValue: 60 },
 ],
 compute: ({ annualPension, age }) => {
 // 55~70세: 5.5%, 70~80세: 4.4%, 80세+: 3.3%
 let rate = 0.055;
 if (age >= 70 && age < 80) rate = 0.044;
 if (age >= 80) rate = 0.033;
 const tax = Math.round(annualPension * rate);
 const net = annualPension - tax;
 return {
 primary: { label: "세후 연금 수령액", value: net, suffix: "원" },
 secondary: [
 { label: "연금세", value: tax, suffix: "원" },
 { label: "적용 세율", value: rate * 100, suffix: "%" },
 ],
 note: "일반 소득세보다 저세율. 1,200만 초과 시 종합과세 가능.",
 };
 },
 relatedSlugs: ["irp-quick", "national-pension-estimate"],
 },
 {
 slug: "annuity-fixed-monthly",
 title: "확정연금 (즉시연금)",
 description: "일시금 → 평생 매월 연금 수령",
 category: "investment",
 categoryLabel: "노후",
 keywords: ["즉시연금", "확정연금", "종신연금"],
 fields: [
 { name: "lumpSum", label: "일시금", defaultValue: 200_000_000, suffix: "원" },
 { name: "age", label: "가입 연령", defaultValue: 60 },
 ],
 compute: ({ lumpSum, age }) => {
 // 단순: 60세 가입 시 연 5% 수령 (20년 보장)
 // 실제로는 보험사 상품별 차이
 const lifeExpectancy = 85 - age;
 const yearlyPayout = lumpSum / lifeExpectancy * 1.2; // 이자 가정
 const monthlyPayout = Math.round(yearlyPayout / 12);
 return {
 primary: { label: "월 연금 수령액", value: monthlyPayout, suffix: "원" },
 secondary: [
 { label: "기대 수령 기간", value: lifeExpectancy, suffix: "년" },
 { label: "총 수령액 (예상)", value: Math.round(yearlyPayout * lifeExpectancy), suffix: "원" },
 ],
 note: "보험사 상품별 차이 큼. 종신형은 평생, 확정기간형은 N년.",
 };
 },
 relatedSlugs: ["national-pension-estimate", "irp-quick"],
 },
 {
 slug: "retirement-monthly-need",
 title: "노후 월 생활비 산정",
 description: "현재 생활비 × 70~80% = 노후 월 필요액",
 category: "investment",
 categoryLabel: "노후",
 keywords: ["노후 생활비", "은퇴 생활비", "노후 월"],
 fields: [
 { name: "currentMonthly", label: "현재 월 생활비", defaultValue: 4_000_000, suffix: "원" },
 ],
 compute: ({ currentMonthly }) => {
 const minimal = Math.round(currentMonthly * 0.5);
 const moderate = Math.round(currentMonthly * 0.7);
 const comfortable = Math.round(currentMonthly * 0.85);
 return {
 primary: { label: "권장 노후 월 (적당)", value: moderate, suffix: "원" },
 secondary: [
 { label: "최소 (검소)", value: minimal, suffix: "원" },
 { label: "여유 (풍족)", value: comfortable, suffix: "원" },
 ],
 note: "은퇴 후엔 자녀 양육비·주거 대출이 줄어 보통 70%로 충분. 의료비는 ↑.",
 };
 },
 relatedSlugs: ["fire-calculator", "national-pension-estimate"],
 },
 {
 slug: "elder-medical-cost",
 title: "노후 의료비 누적 추정",
 description: "65세 이후 평균 의료비 (연·평생)",
 category: "investment",
 categoryLabel: "노후",
 keywords: ["노후 의료비", "은퇴 후 의료비"],
 fields: [
 { name: "currentAge", label: "현재 연령", defaultValue: 50 },
 ],
 compute: ({ currentAge }) => {
 // 65세 이후 평균 연 의료비 약 350만 (한국)
 const yearlyMedical = 3_500_000;
 const lifeExpectancy = 85;
 const yearsToLive = Math.max(0, lifeExpectancy - 65);
 const totalLifetime = yearlyMedical * yearsToLive;
 // 인플레이션 5% 반영
 const inflated = totalLifetime * 1.5;
 return {
 primary: { label: "65세 이후 평생 의료비", value: Math.round(inflated), suffix: "원" },
 secondary: [
 { label: "65세 이후 연평균", value: yearlyMedical, suffix: "원" },
 { label: "현재 시점 가치", value: Math.round(totalLifetime), suffix: "원" },
 ],
 note: "건강보험 외 본인부담 의료비. 실손보험 + 정기적 검진 권장.",
 };
 },
 relatedSlugs: ["real-loss-insurance", "out-of-pocket-cap"],
 },
 {
 slug: "inheritance-prep",
 title: "상속 준비 — 자산 분배",
 description: "총 자산 + 상속세 + 분배 시뮬",
 category: "tax",
 categoryLabel: "세금",
 keywords: ["상속 준비", "유산 분배", "상속세 시뮬"],
 fields: [
 { name: "totalAssets", label: "총 자산", defaultValue: 1_000_000_000, suffix: "원" },
 { name: "spouseShare", label: "배우자 몫 (%)", defaultValue: 50, suffix: "%" },
 ],
 compute: ({ totalAssets, spouseShare }) => {
 // 일괄공제 5억 + 배우자 공제 (최대 30억)
 const spouseExemption = Math.min(3_000_000_000, totalAssets * (spouseShare / 100));
 const totalExemption = 500_000_000 + spouseExemption;
 const taxBase = Math.max(0, totalAssets - totalExemption);
 // 상속세 누진세율
 let tax = 0;
 if (taxBase <= 100_000_000) tax = taxBase * 0.1;
 else if (taxBase <= 500_000_000) tax = taxBase * 0.2 - 10_000_000;
 else if (taxBase <= 1_000_000_000) tax = taxBase * 0.3 - 60_000_000;
 else if (taxBase <= 3_000_000_000) tax = taxBase * 0.4 - 160_000_000;
 else tax = taxBase * 0.5 - 460_000_000;
 return {
 primary: { label: "예상 상속세", value: Math.round(tax), suffix: "원" },
 secondary: [
 { label: "공제 합계", value: totalExemption, suffix: "원" },
 { label: "과세표준", value: taxBase, suffix: "원" },
 ],
 note: "사전 증여 (10년 단위) + 보험 활용으로 절세 가능.",
 };
 },
 relatedSlugs: ["inheritance-tax-sim", "gift-split-strategy"],
 },
];

export const batch5Calculators: CalculatorDef[] = [
 ...REAL_ESTATE,
 ...INSURANCE,
 ...CHILD_EDU,
 ...RETIREMENT,
];
