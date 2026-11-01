"use client";

import { useState, useMemo, useId, type HTMLAttributes } from "react";
import CurrencyInput from "./CurrencyInput";
import AppLink from "./AppLink";
import CountUp from "react-countup";
import {
 calculateYearEndTax,
 deriveAnnualSocialInsurance2026,
 estimatePrepaidIncomeTax2026,
 TaxInputs,
 TaxResult,
} from "@/lib/yearEndTaxCalculator";
import {
 BIRTH_CREDIT_2026,
 CHILD_TAX_CREDIT_2026,
 childTaxCredit2026,
 EDUCATION_CREDIT_2026,
 HOUSING_SUBSCRIPTION_DEDUCTION_2026,
 INSURANCE_CREDIT_2026,
 MARRIAGE_CREDIT_2026,
 MEDICAL_CREDIT_2026,
 PENSION_ACCOUNT_CREDIT_2026,
 RENT_CREDIT_2026,
} from "@/lib/taxConstants2026";
import { CARD_EXTRA_LIMIT_2026, CARD_RATES_2026, CARD_SALARY_THRESHOLD } from "@/lib/cardDeduction2026";
import { formatManwonKorean } from "@/lib/manwonFormat";
import NumberStepper from "./NumberStepper";
import { ChevronDown } from "lucide-react";
import { useCalculatorMeasurement } from "@/hooks/useCalculatorMeasurement";

const formatNumber = (num: number) => num.toLocaleString('ko-KR');

const AnalysisReport = ({ inputs, result }: { inputs: TaxInputs; result: TaxResult; }) => {
 // 단계별 값은 엔진이 계산한 값을 그대로 쓴다. 종전에는 최종 결과에서 역산해
 // 근로소득공제 = 총급여 − 과세표준 − 결정세액, 산출세액 = 결정세액, 세액공제 = 0원으로
 // 표시됐다 (2026-09-25 수정).
 const earnedIncomeDeduction = result.earnedIncomeDeduction;
 const earnedIncomeAmount = inputs.grossSalary - earnedIncomeDeduction;
 const incomeDeductionTotal = result.incomeDeduction;
 const calculatedTax = result.calculatedTax;
 const taxCreditTotal = result.taxCredit;

 const calculationSteps = [
 { label: "총급여액 (A)", value: inputs.grossSalary, isBold: true },
 { label: "(-) 근로소득공제", value: earnedIncomeDeduction },
 { label: "(=) 근로소득금액 (B)", value: earnedIncomeAmount },
 { label: "(-) 소득공제 합계", value: incomeDeductionTotal },
 { label: "(=) 과세표준 (C)", value: result.taxBase, isBold: true },
 { label: "산출세액 (D)", value: calculatedTax },
 { label: "(-) 세액공제 합계", value: taxCreditTotal },
 { label: "(=) 결정세액 (E)", value: result.determinedTax, isBold: true },
 { label: "기납부세액 (F)", value: inputs.prepaidTax, isBold: true },
 { label: "(=) 최종 환급/납부액 (F-E)", value: result.finalRefund, isFinal: true },
 ];

 return (
 <div className="mt-6 p-4 border border-border rounded-lg bg-secondary/30">
 <h4 className="text-lg font-bold text-center mb-4">상세 분석 리포트</h4>
 <div className="space-y-2 text-xs sm:text-sm">
 {calculationSteps.map((step, index) => (
 <div
 key={index}
 className={`flex justify-between items-center py-1.5 ${
 step.isBold ? "border-t border-border mt-1 pt-1.5" : ""
 }`}
 >
 <span className={`${step.isFinal ? "font-bold text-base sm:text-lg" : "text-muted-foreground"}`}>
 {step.label}
 </span>
 <span
 className={`tabular-nums text-sm sm:text-base ${
 step.isFinal && step.value >= 0 ? "text-primary" : ""
 } ${step.isFinal && step.value < 0 ? "text-destructive" : ""} ${
 step.isBold ? "font-bold text-foreground" : "text-muted-foreground"
 }`}
 >
 {formatNumber(Math.round(step.value))} 원
 </span>
 </div>
 ))}
 </div>
 </div>
 );
};

const Accordion = ({
 title,
 children,
 defaultOpen = false,
 contentProps,
}: {
 title: string;
 children: React.ReactNode;
 defaultOpen?: boolean;
 /** 펼친 내용 영역(기존 div)에만 붙는 속성 — 계산 계측 inputProps 용. 헤더 토글 버튼은 계산 시작이 아니다 */
 contentProps?: HTMLAttributes<HTMLDivElement>;
}) => {
 const [isOpen, setIsOpen] = useState(defaultOpen);
 return (
 <div className="border border-border rounded-lg overflow-hidden">
 {/* 접근성 표준 패턴: 헤딩이 버튼을 감싸야 함 (button 안 heading 금지) */}
 <h3 className="text-lg font-semibold">
 <button
 onClick={() => setIsOpen(!isOpen)}
 aria-expanded={isOpen}
 className="w-full flex justify-between items-center p-4 bg-card hover:bg-secondary/50 transition-colors text-lg font-semibold"
 >
 <span>{title}</span>
 <ChevronDown className={`transform transition-transform duration-200 ${isOpen ? "rotate-180" : "rotate-0"}`} />
 </button>
 </h3>
 {isOpen && <div {...contentProps} className="p-4 space-y-4 bg-card border-t border-border">{children}</div>}
 </div>
 );
};

const OptimizationSlider = ({
 label,
 tip,
 value,
 max,
 onChange,
 labelControl,
 inputProps,
}: {
 label: string;
 tip: string;
 value: number;
 max: number;
 onChange: (value: number) => void;
 labelControl?: React.ReactNode;
 inputProps?: HTMLAttributes<HTMLInputElement>;
}) => {
 // label htmlFor ↔ input id 연결 (인스턴스 고유)
 const sliderId = useId();
 return (
 <div>
 <div className="flex justify-between items-center mb-2">
 {labelControl ?? <label htmlFor={sliderId} className="text-sm font-medium text-muted-foreground">{label}</label>}
 <span className="text-sm font-bold text-primary">{formatNumber(value)}원</span>
 </div>
 <input
 {...inputProps}
 id={sliderId}
 aria-label={labelControl ? label : undefined}
 type="range"
 min="0"
 max={max}
 step={100000}
 value={value}
 onChange={(e) => onChange(Number(e.target.value))}
 aria-valuetext={`${formatNumber(value)}원`}
 className="w-full h-2 bg-secondary rounded-lg appearance-none cursor-pointer accent-primary"
 />
 <p className="text-xs text-muted-foreground mt-2">{tip}</p>
 </div>
 );
};

// ── 접힌 아코디언 2·3 안의 추가 입력 (2026-11-01 B24 YE-03·STR-10, 2026-09-26 W2-A 90f1359d3 포팅) ──────────
// 페이지 설명이 약속한 의료비 등과 전통시장·대중교통·문화·체육·주택청약·보장성보험·교육비·월세·자녀·출산·혼인 입력.
// 아코디언 2·3 은 기본으로 접혀 있어 새 입력은 펼친 뒤에만 그려진다 — 기본 상태의 서버 렌더는 포팅 전
// (origin/main 3b49d42e5)과 바이트 동일하다(HomeTopAd~InArticleAd 사이 높이 불변, yearEndTax2026Engine.test.ts
// 고정본 대조). 안내 문구의 한도·공제율은 전부 정본 상수에서 만든다(리터럴 금지).
// 입력 컴포넌트(IncomeDeductionExtraFields·TaxCreditExtraFields)는 이 파일 맨 아래에 둔다 — 시뮬레이터의
// 연금계좌 선택 상자가 파일의 첫 선택 상자여야 하는 계측 회귀 가드(seasonCalcMeasurement.test.ts)를 지킨다.

/** 원 → "300만원" · "7,000만원" */
const man = (won: number) => formatManwonKorean(won / 10_000);
/** 0.4 → "40%" */
const pct = (rate: number) => `${Number((rate * 100).toFixed(1))}%`;
/** "2026-12-31" → "2026년 12월 31일" */
const koreanDate = (iso: string) => {
 const [y, m, d] = iso.split("-").map(Number);
 return `${y}년 ${m}월 ${d}일`;
};
const won = (value: number | undefined) => (value ?? 0).toLocaleString('ko-KR');

/**
 * 새 입력란의 한도 안내 한 줄 — 근거: 소득세법 §59의2(자녀·출산입양, 연령은 법률 제21548호 부칙 제2조)·
 * §59의4(보장성보험·의료비·교육비), 조특법 §87②(주택청약)·§92(혼인)·§95의2(월세)·§126의2(전통시장·대중교통·
 * 문화·체육 — 문화·체육은 총급여 7천만원 이하만, 추가 한도 300만원을 전통시장·대중교통과 함께 쓴다).
 * 고향사랑·정치자금 기부는 이 화면이 다루지 않는다(기부금 칸 안내대로 /donation-tax-credit-2026).
 */
export const YEAR_END_FIELD_TIPS = {
 traditionalMarket: `공제율 ${pct(CARD_RATES_2026.TRADITIONAL)} · 카드 기본 한도를 넘으면 대중교통과 합산해 추가 ${man(CARD_EXTRA_LIMIT_2026.LOW_SALARY)}(총급여 ${man(CARD_SALARY_THRESHOLD)} 초과 ${man(CARD_EXTRA_LIMIT_2026.HIGH_SALARY)})까지`,
 publicTransport: `공제율 ${pct(CARD_RATES_2026.TRANSIT)} · 추가 한도는 전통시장과 합산`,
 culture: `공제율 ${pct(CARD_RATES_2026.CULTURE)} · 총급여 ${man(CARD_SALARY_THRESHOLD)} 이하만 · 추가 한도는 전통시장·대중교통과 합산`,
 housingSubscription: `무주택 세대주(배우자 포함)·총급여 ${man(HOUSING_SUBSCRIPTION_DEDUCTION_2026.SALARY_CAP)} 이하 · 연 ${man(HOUSING_SUBSCRIPTION_DEDUCTION_2026.LIMIT)} 한도 납입액의 ${pct(HOUSING_SUBSCRIPTION_DEDUCTION_2026.RATE)} 소득공제`,
 lifeInsurance: `연 ${man(INSURANCE_CREDIT_2026.LIMIT)} 한도 · ${pct(INSURANCE_CREDIT_2026.RATE)} 세액공제`,
 children: `2026년 귀속 9세 이상·2017년생 제외 · 부양가족에 자동 포함 · 1명 ${man(childTaxCredit2026(1))} · 2명 ${man(childTaxCredit2026(2))} · 3명부터 1명당 ${man(CHILD_TAX_CREDIT_2026.THIRD_PLUS)} 추가`,
 birth: "자녀세액공제와 별도 · 부양가족에 자동 포함",
 marriage: `생애 1회 ${man(MARRIAGE_CREDIT_2026.AMOUNT)} · 부부 각각 (${koreanDate(MARRIAGE_CREDIT_2026.REGISTERED_UNTIL)} 신고분까지)`,
 medicalSpecial: `총급여 ${pct(MEDICAL_CREDIT_2026.THRESHOLD_RATIO)} 초과분의 ${pct(MEDICAL_CREDIT_2026.RATE)} · 한도 없음`,
 medicalGeneral: `총급여 ${pct(MEDICAL_CREDIT_2026.THRESHOLD_RATIO)} 초과분의 ${pct(MEDICAL_CREDIT_2026.RATE)} · 연 ${man(MEDICAL_CREDIT_2026.DEPENDENT_CAP)} 한도`,
 educationSelf: `대학원·직업능력개발훈련 포함 · ${pct(EDUCATION_CREDIT_2026.RATE)} · 한도 없음`,
 monthlyRent: `무주택 세대주·총급여 ${man(RENT_CREDIT_2026.SALARY_CAP)} 이하 · 연 ${man(RENT_CREDIT_2026.CAP)} 한도 · ${man(RENT_CREDIT_2026.SALARY_17_MAX)} 이하 ${pct(RENT_CREDIT_2026.RATE_HIGH)}, 초과 ${pct(RENT_CREDIT_2026.RATE_LOW)}`,
 educationChildSchool: `1명당 연 ${man(EDUCATION_CREDIT_2026.SCHOOL_CAP)} 한도 · ${pct(EDUCATION_CREDIT_2026.RATE)}`,
 educationUniversity: `1명당 연 ${man(EDUCATION_CREDIT_2026.UNIVERSITY_CAP)} 한도(대학원 제외) · ${pct(EDUCATION_CREDIT_2026.RATE)}`,
} as const;

/** 출산·입양 순서 선택지 — 소득세법 §59의2③ (0 = 없음) */
const BIRTH_ORDER_OPTIONS = [
 { value: 0, label: "없음" },
 { value: 1, label: `첫째 (${man(BIRTH_CREDIT_2026.FIRST)})` },
 { value: 2, label: `둘째 (${man(BIRTH_CREDIT_2026.SECOND)})` },
 { value: 3, label: `셋째 이상 (${man(BIRTH_CREDIT_2026.THIRD_PLUS)})` },
] as const;

/**
 * 부양가족(본인 포함)의 최소 인원 — 자녀세액공제 대상 자녀와 해당 연도 출산·입양 자녀는 둘 다 '기본공제대상자인
 * 자녀'가 요건이라(소득세법 §59의2①③) 부양가족에 들어가 있어야 한다. 엔진도 자녀세액공제 인원이 본인을 뺀
 * 기본공제 인원보다 많으면 거부한다. 출산·입양 자녀는 9세 미만이라 자녀세액공제 인원과 겹치지 않는다.
 */
export function minDependents(inputs: Pick<TaxInputs, "childTaxCreditEligibleChildren" | "birthOrders">): number {
 return 1 + Math.max(0, inputs.childTaxCreditEligibleChildren) + (inputs.birthOrders?.length ?? 0);
}

/**
 * 자녀세액공제 대상 자녀 수 변경 — 부양가족이 모자라면 함께 올린다. 카드 한도용 children 은 건드리지 않는다
 * (연간 자녀세액공제 인원과 다른 기준이라 이 화면은 0 으로 둔다).
 */
export function withChildren(prev: TaxInputs, childTaxCreditEligibleChildren: number): TaxInputs {
 const next = { ...prev, childTaxCreditEligibleChildren };
 return { ...next, dependents: Math.max(prev.dependents, minDependents(next)) };
}

/** 출산·입양 순서 선택(0 = 없음) — birthOrders 로 넘기고, 부양가족이 모자라면 함께 올린다 */
export function withBirthOrder(prev: TaxInputs, order: number): TaxInputs {
 const next = { ...prev, birthOrders: order > 0 ? [order] : [] };
 return { ...next, dependents: Math.max(prev.dependents, minDependents(next)) };
}

// 기본값 총급여 — 4대보험 기본값은 이 값에서 요율로 파생 (드리프트 방지)
const DEFAULT_SALARY = 50_000_000;
// 이 화면에는 월 원천징수(간이세액표 8~20세) 자녀 입력이 없다. 아코디언 3 의 자녀세액공제 대상 인원
// (2026년 귀속 9세 이상·2017년생 제외)은 연간 공제 인원이라 이 값으로 대체하지 않는다.
const WITHHOLDING_CHILDREN_8_TO_20 = 0;

export default function YearEndTaxCalculator() {
 const [inputs, setInputs] = useState<TaxInputs>({
 grossSalary: DEFAULT_SALARY,
 // 기납부세액은 사용자가 직접 고치기 전까지 derivedInputs 가 간이세액표로 추정한다
 // (prepaidTaxTouched). 종전 250만원 고정값은 총급여 6,000만원 이상에서 환급을 추가 납부로
 // 뒤집어 보여줬다 (2026-09-26 W1-A). 이 시드는 수정 전까지 쓰이지 않는다.
 prepaidTax: 0,
 // 4대보험 기본값 — taxConstants2026 요율에서 파생 (2026-08-23: 2025 요율
 // 하드코딩 잔존 버그 수정. 2027 요율 변경 시 자동 반영)
 // 아래 3개는 초기 렌더용 시드일 뿐이다 — 실제 계산은 derivedInputs 가
 // 현재 총급여에서 매번 다시 파생한다(총급여 변경 시 갱신 보장).
 // 장기요양보험료 포함 (소득세법 §52①1 — 둘 다 전액 소득공제 대상)
 ...deriveAnnualSocialInsurance2026(DEFAULT_SALARY),
 dependents: 1,
 disabledDependents: 0,
 seniorDependents: 0,
 housingSubscription: 0,
 creditCard: 15000000,
 debitCardAndCash: 5000000,
 // 전통시장·대중교통은 종전에 입력란 없이 기본값(100만·50만)이 40% 공제로 몰래 들어가 결정세액을
 // 5,000만 기준 9만원 낮게(환급 과대) 보여줬다 (2026-09-25 감사 CALC-05). 2026-11-01 B24 부터 접힌
 // 아코디언 2 에 입력란이 있고 기본값은 0 이다 — 아래 새 항목도 전부 0 (출산·입양·혼인은 미선택).
 traditionalMarket: 0,
 publicTransport: 0,
 culture: 0,
 children: 0,
 childTaxCreditEligibleChildren: 0,
 birthsOrAdoptions: 0,
 pensionSavings: 0,
 irp: 0,
 lifeInsurance: 0,
 medicalExpenses: 0,
 medicalExpensesGeneral: 0,
 educationExpenses: 0,
 educationSelf: 0,
 educationChildSchool: 0,
 educationChildSchoolCount: 1,
 educationUniversity: 0,
 educationUniversityCount: 1,
 donation: 0,
 monthlyRent: 0,
 });

 const [showReport, setShowReport] = useState(false);
 const [pensionAccount, setPensionAccount] = useState<"pensionSavings" | "irp">("pensionSavings");
 // 사용자가 기납부세액을 직접 입력했는지 — 그 전까지는 총급여·부양가족·자녀 수에서 추정한다
 const [prepaidTaxTouched, setPrepaidTaxTouched] = useState(false);

 // 4대보험 소득공제는 총급여에서 파생돼야 한다. 종전에는 useState 초기값
 // (DEFAULT_SALARY=5,000만 기준)으로 한 번 계산된 뒤 총급여를 바꿔도 갱신되지
 // 않았다 — 화면에 4대보험 입력란이 없으므로 사용자가 고칠 수단도 없었다.
 // 총급여 1억을 넣어도 5,000만원어치 보험료만 공제돼 결정세액이 크게 과대
 // 표시됐다(2026-09-06 전수검사). 계산 직전에 현재 총급여로 다시 파생한다.
 // 기납부세액도 같은 방식이다 — 직접 고치기 전까지 간이세액표(100%) × 12 추정 (2026-09-26 W1-A).
 const derivedInputs = useMemo(
 () => ({
 ...inputs,
 ...deriveAnnualSocialInsurance2026(inputs.grossSalary),
 prepaidTax: prepaidTaxTouched
 ? inputs.prepaidTax
 : estimatePrepaidIncomeTax2026(inputs.grossSalary, inputs.dependents, WITHHOLDING_CHILDREN_8_TO_20),
 }),
 [inputs, prepaidTaxTouched]
 );

 const result = useMemo(() => calculateYearEndTax(derivedInputs), [derivedInputs]);

 // GA4 calc_start·calc_success·result_view (calc_type 만 전송, 금액 미전송) — /year-end-tax 와 홈 연말정산 탭
 const measurement = useCalculatorMeasurement({
 calcType: "year_end_tax",
 valid:
 inputs.grossSalary > 0 &&
 [result.finalRefund, result.determinedTax, derivedInputs.prepaidTax].every(Number.isFinite),
 resultKey: result,
 });

 // 시뮬레이터 두 슬라이더(연금저축/IRP·신용카드)를 0 으로 둔 환급액 — 아래 문구는 '두 공제 덕분에 늘어난 환급' 이다.
 // 2026-10-05 감사 code26-08 정정: 종전 문구 '환급액 N원 증가!' 는 기본값(카드 1,500만원)만으로 첫 화면부터 떠서
 // 사용자가 바꾸지도 않은 증가를 주장했다(기준에서 기부금까지 0 으로 둬 슬라이더와 무관한 몫도 섞였다).
 // 같은 자리·같은 글자 구성의 '공제로 환급 +N원' 으로 바꿔 높이는 그대로 둔다.
 const initialRefund = useMemo(
 () =>
 calculateYearEndTax({
 ...derivedInputs,
 pensionSavings: 0,
 irp: 0,
 creditCard: 0,
 }).finalRefund,
 [derivedInputs]
 );

 const handleInputChange = (field: keyof TaxInputs, value: string) => {
 setInputs((prev) => ({ ...prev, [field]: Number(value.replace(/,/g, "")) || 0 }));
 };

 const handleNumberChange = (field: keyof TaxInputs, value: number) => {
 setInputs((prev) => ({ ...prev, [field]: value }));
 };

 const handleChildrenChange = (value: number) => setInputs((prev) => withChildren(prev, value));
 const handleBirthOrderChange = (order: number) => setInputs((prev) => withBirthOrder(prev, order));
 const handleMarriedChange = (checked: boolean) => setInputs((prev) => ({ ...prev, marriedIn2026: checked }));

 return (
 <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
 <div className="lg:col-span-2 space-y-6">
 <Accordion title="1. 기본 정보" defaultOpen={true} contentProps={measurement.inputProps}>
 <CurrencyInput
 label="총급여 (연봉, 비과세 제외)"
 value={inputs.grossSalary.toLocaleString('ko-KR')}
 onValueChange={(v) => handleInputChange("grossSalary", v)}
 quickAmounts={[10000000, 5000000, 1000000]}
 />
 {/* 라벨은 320px 에서 한 줄 유지(종전 라벨 189.8px → 217.9px, 가용 254px) — 줄 추가 금지 구역(광고 위) */}
 <CurrencyInput
 label="기납부세액 (간이세액표 추정·수정 가능)"
 value={derivedInputs.prepaidTax.toLocaleString('ko-KR')}
 onValueChange={(v) => {
 setPrepaidTaxTouched(true);
 handleInputChange("prepaidTax", v);
 }}
 quickAmounts={[500000, 100000, 50000]}
 />
 </Accordion>

 <Accordion title="2. 소득 공제 항목" contentProps={measurement.inputProps}>
 <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
 <NumberStepper label="부양가족(본인포함)" value={inputs.dependents} onValueChange={(v) => handleNumberChange("dependents", v)} min={minDependents(inputs)} unit="명" />
 <NumberStepper label="만 70세 이상" value={inputs.seniorDependents} onValueChange={(v) => handleNumberChange("seniorDependents", v)} unit="명" />
 <NumberStepper label="장애인" value={inputs.disabledDependents} onValueChange={(v) => handleNumberChange("disabledDependents", v)} unit="명" />
 </div>
 <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
 <CurrencyInput
 label="신용카드"
 value={inputs.creditCard.toLocaleString('ko-KR')}
 onValueChange={(v) => handleInputChange("creditCard", v)}
 quickAmounts={[5000000, 1000000, 500000]}
 />
 <CurrencyInput
 label="체크카드·현금영수증"
 value={inputs.debitCardAndCash.toLocaleString('ko-KR')}
 onValueChange={(v) => handleInputChange("debitCardAndCash", v)}
 quickAmounts={[5000000, 1000000, 500000]}
 />
 </div>
 <IncomeDeductionExtraFields
 inputs={inputs}
 handleInputChange={handleInputChange}
 handleNumberChange={handleNumberChange}
 />
 </Accordion>

 <Accordion title="3. 세액 공제 항목" contentProps={measurement.inputProps}>
 <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
 <CurrencyInput
 label="연금저축 납입액"
 value={inputs.pensionSavings.toLocaleString('ko-KR')}
 onValueChange={(v) => handleInputChange("pensionSavings", v)}
 quickAmounts={[3000000, 1000000, 500000]}
 />
 <CurrencyInput
 label="IRP·퇴직연금 본인 납입액"
 value={inputs.irp.toLocaleString('ko-KR')}
 onValueChange={(v) => handleInputChange("irp", v)}
 quickAmounts={[3000000, 1000000, 500000]}
 />
 <CurrencyInput
 label="일반·특례 기부금 공제대상액"
 description={<>유형별 한도를 확인한 공제대상 금액(원)을 입력하세요. 이 화면은 한도·이월액을 자동 계산하지 않습니다. 정치자금·고향사랑 기부금은 <AppLink href="/donation-tax-credit-2026" className="underline underline-offset-2">유형별 계산기</AppLink>에서 확인하고, 계산된 세액공제액을 이 칸에 옮겨 입력하지 마세요.</>}
 value={inputs.donation.toLocaleString('ko-KR')}
 onValueChange={(v) => handleInputChange("donation", v)}
 quickAmounts={[100000, 50000, 10000]}
 />
 </div>
 <TaxCreditExtraFields
 inputs={inputs}
 handleInputChange={handleInputChange}
 handleNumberChange={handleNumberChange}
 onChildrenChange={handleChildrenChange}
 onBirthOrderChange={handleBirthOrderChange}
 onMarriedChange={handleMarriedChange}
 />
 </Accordion>
 </div>

 <div className="lg:col-span-1 space-y-6">
 <div className="sticky top-24 bg-card p-4 sm:p-6 rounded-xl shadow-lg border border-border">
 <h2 className="text-xl sm:text-2xl font-bold text-center mb-4">💸 연말정산 예상 결과</h2>
 <p role="status" aria-live="polite" aria-atomic="true" className="sr-only" data-calculation-announcement="year-end-tax">{Number.isFinite(result.finalRefund) ? `${result.finalRefund >= 0 ? "예상 환급액" : "예상 추가 납부액"}: ${formatNumber(Math.abs(result.finalRefund))}원. 소득세 기준이며 지방소득세는 별도입니다.` : "입력값과 허용 범위를 확인해 주세요."}</p>
 <div
 ref={measurement.resultRef}
 data-calculation-result="year-end-tax"
 className={`p-4 rounded-lg text-center transition-colors duration-300 ${
 result.finalRefund >= 0 ? "bg-primary/10" : "bg-destructive/10"
 }`}
 >
 <p className="font-semibold text-muted-foreground">
 {result.finalRefund >= 0 ? "예상 환급액" : "예상 추가 납부액"}
 </p>
 <p
 className={`text-3xl sm:text-4xl font-bold my-1 transition-colors duration-300 ${
 result.finalRefund >= 0 ? "text-primary" : "text-destructive"
 }`}
 >
 <CountUp end={Math.abs(result.finalRefund)} separator="," duration={0.5} /> 원
 </p>
 {/* 지방세 기준 고지 — 엔진(소득세 기준)과 안내 문구(16.5% 등 지방세 포함)
 의 표기 정합 (2026-08-23) */}
 <p className="text-xs text-muted-foreground mt-1">
 소득세 기준이며, 지방소득세(소득세의 10%)는 별도로 환급·납부됩니다.
 </p>
 </div>

 <div className="mt-4">
 <button
 onClick={() => setShowReport(!showReport)}
 className="w-full text-sm text-center text-muted-foreground hover:text-primary transition-colors"
 >
 {showReport ? "리포트 숨기기 ▲" : "상세 분석 리포트 보기 ▼"}
 </button>
 {/* 기납부세액 (F)는 추정값일 수 있으므로 계산에 쓴 derivedInputs 를 넘긴다 */}
 {showReport && <AnalysisReport inputs={derivedInputs} result={result} />}
 </div>

 <div className="mt-6 pt-6 border-t border-border">
 <h3 className="text-lg font-bold text-center mb-4">절세 최적화 시뮬레이터</h3>
 <div className="space-y-4">
 <OptimizationSlider
 inputProps={measurement.inputProps}
 label={pensionAccount === "pensionSavings" ? "연금저축 납입액 조정" : "IRP·퇴직연금 본인 납입액 조정"}
 labelControl={
 <select
 aria-label="조정할 연금계좌"
 value={pensionAccount}
 onChange={(event) => setPensionAccount(event.target.value === "irp" ? "irp" : "pensionSavings")}
 className="min-w-0 max-w-[60%] bg-card text-sm font-medium text-foreground rounded border border-border"
 >
 <option value="pensionSavings">연금저축</option>
 <option value="irp">IRP·퇴직연금</option>
 </select>
 }
 tip="연금저축 600만원·퇴직연금 합산 900만원 한도. ISA 추가한도 제외."
 value={inputs[pensionAccount]}
 max={Math.max(PENSION_ACCOUNT_CREDIT_2026.TOTAL_CAP, inputs[pensionAccount])}
 onChange={(v) => handleNumberChange(pensionAccount, v)}
 />
 <OptimizationSlider
 inputProps={measurement.inputProps}
 label="신용카드"
 tip="총급여의 25% 초과 사용분부터 공제 대상이 됩니다."
 value={inputs.creditCard}
 max={inputs.grossSalary}
 onChange={(v) => handleNumberChange("creditCard", v)}
 />
 </div>
 {result.finalRefund > initialRefund && (
 <div className="mt-4 text-center p-2 bg-primary/10 rounded-lg">
 <p className="text-sm font-bold text-primary">
 공제로 환급 +{formatNumber(result.finalRefund - initialRefund)}원
 </p>
 </div>
 )}
 </div>
 </div>
 </div>
 </div>
 );
}

interface ExtraFieldProps {
 inputs: TaxInputs;
 handleInputChange: (field: keyof TaxInputs, value: string) => void;
 handleNumberChange: (field: keyof TaxInputs, value: number) => void;
}

/**
 * 스테퍼·선택·체크박스 + 한도 안내 한 줄 (OptimizationSlider 안내와 같은 글씨). 금액 입력은 CurrencyInput 의
 * description 으로 안내를 넘겨 aria-describedby 로 잇는다 (기부금 칸과 같은 방식).
 */
const WithTip = ({ tip, className, children }: { tip: string; className?: string; children: React.ReactNode }) => (
 <div className={className}>
 {children}
 <p className="text-xs text-muted-foreground mt-2">{tip}</p>
 </div>
);

/** 아코디언 2 '소득 공제 항목' 추가 입력 — 훅 없음(테스트가 요소 트리를 직접 확인한다) */
export function IncomeDeductionExtraFields({ inputs, handleInputChange }: ExtraFieldProps) {
 return (
 <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
 <CurrencyInput
 label="전통시장"
 description={YEAR_END_FIELD_TIPS.traditionalMarket}
 value={won(inputs.traditionalMarket)}
 onValueChange={(v) => handleInputChange("traditionalMarket", v)}
 quickAmounts={[1000000, 500000, 100000]}
 />
 <CurrencyInput
 label="대중교통"
 description={YEAR_END_FIELD_TIPS.publicTransport}
 value={won(inputs.publicTransport)}
 onValueChange={(v) => handleInputChange("publicTransport", v)}
 quickAmounts={[500000, 100000, 50000]}
 />
 <CurrencyInput
 label="문화·체육 (도서·공연·영화·체육시설 등)"
 description={YEAR_END_FIELD_TIPS.culture}
 value={won(inputs.culture)}
 onValueChange={(v) => handleInputChange("culture", v)}
 quickAmounts={[500000, 100000, 50000]}
 />
 <CurrencyInput
 label="주택청약 납입액"
 description={YEAR_END_FIELD_TIPS.housingSubscription}
 value={won(inputs.housingSubscription)}
 onValueChange={(v) => handleInputChange("housingSubscription", v)}
 quickAmounts={[1000000, 500000, 100000]}
 />
 </div>
 );
}

/** 아코디언 3 '세액 공제 항목' 추가 입력 — 훅 없음(테스트가 요소 트리를 직접 확인한다) */
export function TaxCreditExtraFields({
 inputs,
 handleInputChange,
 handleNumberChange,
 onChildrenChange,
 onBirthOrderChange,
 onMarriedChange,
}: ExtraFieldProps & {
 onChildrenChange: (value: number) => void;
 onBirthOrderChange: (order: number) => void;
 onMarriedChange: (checked: boolean) => void;
}) {
 const birthOrder = Math.min(3, Math.max(0, inputs.birthOrders?.[0] ?? 0));
 return (
 <>
 <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4">
 <WithTip tip={YEAR_END_FIELD_TIPS.children}>
 <NumberStepper label="자녀세액공제 대상 자녀" value={inputs.childTaxCreditEligibleChildren} onValueChange={onChildrenChange} unit="명" />
 </WithTip>
 <WithTip tip={YEAR_END_FIELD_TIPS.birth}>
 <label className="block">
 <span className="text-sm font-medium text-muted-foreground">2026년 출산·입양</span>
 <select
 value={birthOrder}
 onChange={(e) => onBirthOrderChange(Number(e.target.value))}
 className="ms-field mt-2 font-semibold"
 >
 {BIRTH_ORDER_OPTIONS.map((o) => (
 <option key={o.value} value={o.value}>
 {o.label}
 </option>
 ))}
 </select>
 </label>
 </WithTip>
 <WithTip tip={YEAR_END_FIELD_TIPS.marriage}>
 <span className="text-sm font-medium text-muted-foreground">혼인세액공제</span>
 <label className="mt-2 flex min-h-11 cursor-pointer items-center gap-3 rounded-lg bg-secondary/50 p-2 text-sm font-semibold">
 <input
 type="checkbox"
 checked={inputs.marriedIn2026 === true}
 onChange={(e) => onMarriedChange(e.target.checked)}
 className="h-4 w-4 shrink-0 accent-primary"
 />
 2026년 혼인신고
 </label>
 </WithTip>
 </div>
 <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
 <CurrencyInput
 label="의료비 (본인·6세 이하·65세 이상·장애인)"
 description={YEAR_END_FIELD_TIPS.medicalSpecial}
 value={won(inputs.medicalExpenses)}
 onValueChange={(v) => handleInputChange("medicalExpenses", v)}
 quickAmounts={[1000000, 500000, 100000]}
 />
 <CurrencyInput
 label="의료비 (그 밖의 부양가족)"
 description={YEAR_END_FIELD_TIPS.medicalGeneral}
 value={won(inputs.medicalExpensesGeneral)}
 onValueChange={(v) => handleInputChange("medicalExpensesGeneral", v)}
 quickAmounts={[1000000, 500000, 100000]}
 />
 <CurrencyInput
 label="보장성보험료"
 description={YEAR_END_FIELD_TIPS.lifeInsurance}
 value={won(inputs.lifeInsurance)}
 onValueChange={(v) => handleInputChange("lifeInsurance", v)}
 quickAmounts={[500000, 100000, 50000]}
 />
 <CurrencyInput
 label="월세 (연간 합계)"
 description={YEAR_END_FIELD_TIPS.monthlyRent}
 value={won(inputs.monthlyRent)}
 onValueChange={(v) => handleInputChange("monthlyRent", v)}
 quickAmounts={[5000000, 1000000, 500000]}
 />
 <CurrencyInput
 label="교육비 (본인)"
 description={YEAR_END_FIELD_TIPS.educationSelf}
 value={won(inputs.educationSelf)}
 onValueChange={(v) => handleInputChange("educationSelf", v)}
 quickAmounts={[1000000, 500000, 100000]}
 />
 </div>
 <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4">
 <div className="sm:col-span-2">
 <CurrencyInput
 label="교육비 (취학 전·초중고)"
 description={YEAR_END_FIELD_TIPS.educationChildSchool}
 value={won(inputs.educationChildSchool)}
 onValueChange={(v) => handleInputChange("educationChildSchool", v)}
 quickAmounts={[1000000, 500000, 100000]}
 />
 </div>
 <NumberStepper
 label="취학 전·초중고 인원"
 value={inputs.educationChildSchoolCount ?? 1}
 onValueChange={(v) => handleNumberChange("educationChildSchoolCount", v)}
 min={1}
 unit="명"
 />
 <div className="sm:col-span-2">
 <CurrencyInput
 label="교육비 (대학생)"
 description={YEAR_END_FIELD_TIPS.educationUniversity}
 value={won(inputs.educationUniversity)}
 onValueChange={(v) => handleInputChange("educationUniversity", v)}
 quickAmounts={[1000000, 500000, 100000]}
 />
 </div>
 <NumberStepper
 label="대학생 인원"
 value={inputs.educationUniversityCount ?? 1}
 onValueChange={(v) => handleNumberChange("educationUniversityCount", v)}
 min={1}
 unit="명"
 />
 </div>
 </>
 );
}
