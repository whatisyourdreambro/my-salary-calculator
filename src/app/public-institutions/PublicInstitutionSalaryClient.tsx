"use client";

import { useState } from "react";
import { ArrowRight, Plus, X } from "lucide-react";
import Link from "@/components/AppLink";
import { CURRENT_RATES_YEAR } from "@/config/currentRates";
import NumberInput from "@/components/NumberInput";
import { useCalculatorMeasurement } from "@/hooks/useCalculatorMeasurement";
import { calculatePublicInstitutionSalary, parsePublicSalaryAmount } from "@/lib/publicInstitutionSalary";

type Scenario = { name: string; annualPay: string; additionalBonus: string; basis: "personal" | "disclosed" };
const INITIAL: Scenario = { name: "", annualPay: "50000000", additionalBonus: "0", basis: "personal" };
const won = (value: number) => `${value.toLocaleString("ko-KR")}원`;
const fieldClass = "mt-2 min-h-12 w-full rounded-xl border border-border bg-background px-3 py-3 text-base text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary";

export default function PublicInstitutionSalaryClient() {
  const [first, setFirst] = useState<Scenario>({ ...INITIAL });
  const [second, setSecond] = useState<Scenario>({ ...INITIAL, annualPay: "60000000" });
  const [comparing, setComparing] = useState(false);
  const [nonTaxable, setNonTaxable] = useState("200000");
  const [dependents, setDependents] = useState(1);
  const [children, setChildren] = useState(0);
  const [pensionSystem, setPensionSystem] = useState<"national" | "other">("national");
  const [edited, setEdited] = useState(false);
  const scenarios = comparing ? [first, second] : [first];
  const results = scenarios.map((scenario) => calculatePublicInstitutionSalary({
    annualPay: parsePublicSalaryAmount(scenario.annualPay) ?? NaN,
    additionalBonus: parsePublicSalaryAmount(scenario.additionalBonus) ?? NaN,
    nonTaxableMonthly: parsePublicSalaryAmount(nonTaxable) ?? NaN,
    dependents, children, pensionSystem,
  }));
  const measurement = useCalculatorMeasurement({
    calcType: "public_institution_salary",
    valid: results.every((result) => result.ok),
    resultKey: [first.annualPay, first.additionalBonus, second.annualPay, second.additionalBonus, comparing, nonTaxable, dependents, children, pensionSystem].join(":"),
  });
  const updateScenario = (index: number, patch: Partial<Scenario>) => {
    (index === 0 ? setFirst : setSecond)((current) => ({ ...current, ...patch }));
    if (patch.annualPay !== undefined || patch.additionalBonus !== undefined) setEdited(true);
  };

  return (
    <section id="salary-calculator" aria-labelledby="calculator-heading" className="scroll-mt-28">
      <div className="mb-5 flex flex-wrap items-end justify-between gap-4">
        <div><p className="text-sm font-semibold text-link">내 조건으로 확인하기</p><h2 id="calculator-heading" className="mt-2 text-2xl font-bold sm:text-3xl">기관별 연보수, 같은 조건으로 비교해요</h2></div>
        <button type="button" onClick={() => setComparing((value) => !value)} className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-border bg-card px-4 py-2 text-sm font-semibold">
          {comparing ? <X className="h-4 w-4" aria-hidden="true" /> : <Plus className="h-4 w-4" aria-hidden="true" />}{comparing ? "비교 기관 닫기" : "비교 기관 추가"}
        </button>
      </div>
      <p className="mb-6 text-sm leading-7 text-muted-foreground">기관 공시나 채용 조건에서 확인한 세전 금액을 입력하세요. 처음 표시되는 금액은 사용 예시이며 특정 기관의 연봉이 아닙니다.</p>

      <div className={`grid gap-5 ${comparing ? "lg:grid-cols-2" : ""}`}>
        {scenarios.map((scenario, index) => (
          <fieldset key={index} className="min-w-0 rounded-2xl border border-border bg-card p-5 sm:p-6">
            <legend className="px-2 text-base font-bold">기관 {index === 0 ? "A" : "B"}</legend>
            <label htmlFor={`institution-name-${index}`} className="text-sm font-semibold">기관 이름 <span className="font-normal text-muted-foreground">(선택)</span></label>
            <input id={`institution-name-${index}`} value={scenario.name} maxLength={60} onChange={(event) => updateScenario(index, { name: event.target.value })} placeholder="비교할 기관 이름" className={fieldClass} autoComplete="off" />
            <div {...measurement.inputProps}>
              <label htmlFor={`institution-basis-${index}`} className="mt-5 block text-sm font-semibold">입력 금액의 기준</label>
              <select id={`institution-basis-${index}`} className={fieldClass} value={scenario.basis} onChange={(event) => updateScenario(index, { basis: event.target.value as Scenario["basis"] })}>
                <option value="personal">내 연봉·채용 조건으로 계산</option><option value="disclosed">공시 평균보수·초임을 연봉으로 가정</option>
              </select>
              {scenario.basis === "disclosed" && <p className="mt-2 text-sm leading-6 text-muted-foreground">공시 연도·결산/예산·직원 구분을 맞춰 주세요. 아래 결과는 이 금액을 개인 연봉으로 가정한 값입니다.</p>}
              <label htmlFor={`institution-pay-${index}`} className="mt-5 block text-sm font-semibold">연보수 <span className="font-normal text-muted-foreground">(세전, 원)</span></label>
              <NumberInput id={`institution-pay-${index}`} type="text" inputMode="numeric" allowDecimal={false} allowNegative={false} maxLength={16} value={scenario.annualPay} onChange={(event) => updateScenario(index, { annualPay: event.target.value })} className={`${fieldClass} text-xl font-bold tabular-nums`} aria-describedby={`institution-pay-help-${index}`} />
              <p id={`institution-pay-help-${index}`} className="mt-2 text-sm leading-6 text-muted-foreground">비과세 수당을 포함한 연간 현금 급여입니다. 퇴직금·복지포인트·주식 평가액은 제외하세요.</p>
              <label htmlFor={`institution-bonus-${index}`} className="mt-5 block text-sm font-semibold">추가 성과급 <span className="font-normal text-muted-foreground">(연간 세전, 원)</span></label>
              <NumberInput id={`institution-bonus-${index}`} type="text" inputMode="numeric" allowDecimal={false} allowNegative={false} maxLength={16} value={scenario.additionalBonus} onChange={(event) => updateScenario(index, { additionalBonus: event.target.value })} className={fieldClass} aria-describedby={`institution-bonus-help-${index}`} />
              <p id={`institution-bonus-help-${index}`} className="mt-2 text-sm leading-6 text-muted-foreground">위 연보수에 이미 포함되어 있다면 0원으로 두세요. 따로 받을 현금 성과급만 더합니다.</p>
            </div>
          </fieldset>
        ))}
      </div>

      <fieldset className="mt-5 rounded-2xl border border-border bg-card p-5 sm:p-6" {...measurement.inputProps}>
        <legend className="px-2 font-bold">공통 계산 조건</legend>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          <label className="text-sm font-semibold">월 비과세액 (원)<NumberInput type="text" inputMode="numeric" allowDecimal={false} allowNegative={false} maxLength={16} value={nonTaxable} onChange={(event) => { setNonTaxable(event.target.value); setEdited(true); }} className={fieldClass} /><span className="mt-2 block text-xs font-normal leading-5 text-muted-foreground">연보수에 포함된 비과세 수당</span></label>
          <label className="text-sm font-semibold">부양가족 (본인 포함)<select value={dependents} onChange={(event) => { const value = Number(event.target.value); setDependents(value); setChildren((current) => Math.min(current, value - 1)); setEdited(true); }} className={fieldClass}>{Array.from({ length: 20 }, (_, index) => <option key={index + 1} value={index + 1}>{index + 1}명</option>)}</select></label>
          <label className="text-sm font-semibold">공제 대상 자녀<select value={children} onChange={(event) => { setChildren(Number(event.target.value)); setEdited(true); }} className={fieldClass}>{Array.from({ length: dependents }, (_, index) => <option key={index} value={index}>{index}명</option>)}</select><span className="mt-2 block text-xs font-normal leading-5 text-muted-foreground">기본공제 대상 중 자녀세액공제 요건 충족 인원</span></label>
          <label className="text-sm font-semibold">적용할 연금 체계<select value={pensionSystem} onChange={(event) => setPensionSystem(event.target.value as "national" | "other")} className={fieldClass}><option value="national">국민연금 일반 근로자</option><option value="other">공무원·사학연금 등 기타</option></select></label>
        </div>
      </fieldset>

      <div className="mt-6" ref={measurement.resultRef}>
        <div className={`grid gap-5 ${comparing ? "lg:grid-cols-2" : ""}`}>
          {results.map((result, index) => (
            <div key={index} className="min-w-0 rounded-2xl border border-primary/20 bg-accent p-5 sm:p-7">
              <h3 className="break-words text-base font-bold">{scenarios[index].name.trim() || `기관 ${index === 0 ? "A" : "B"}`} · {scenarios[index].basis === "disclosed" ? "공시 금액 가정" : edited ? "입력 조건" : "예시 입력"}</h3>
              {!result.ok ? <p role="alert" className="mt-4 text-sm leading-7">{result.message}</p> : <>
                <p className="mt-5 text-sm text-muted-foreground">추가 성과급 포함 월평균 실수령 추정</p>
                <p className="mt-2 break-words text-3xl font-bold tracking-tight text-link sm:text-4xl" data-testid={`public-salary-net-${index}`}>{won(result.monthlyIncludingBonus.netPay)}</p>
                <p className="mt-3 text-xs leading-6 text-muted-foreground">연간 급여를 12개월로 나눈 비교용 값입니다. 매달 또는 성과급 지급월의 실제 입금액과 다릅니다.</p>
                <dl className="mt-6 space-y-3 text-sm">
                  {[
                    ["합산 세전 연보수", result.grossAnnual],
                    ["연간 실수령 추정", result.annualNetEstimate],
                    ["추가 성과급 제외 월환산 실수령", result.monthlyBeforeBonus.netPay],
                    ["추가 성과급에 따른 연간 실수령 증가", result.annualBonusNetIncrease],
                  ].map(([label, value]) => <div key={label} className="flex flex-wrap justify-between gap-x-4 gap-y-1"><dt className="text-muted-foreground">{label}</dt><dd className="font-semibold tabular-nums">{won(value as number)}</dd></div>)}
                </dl>
                <details className="mt-6 border-t border-border pt-4">
                  <summary className="cursor-pointer text-sm font-semibold">월평균 공제 항목 보기</summary>
                  <dl className="mt-4 space-y-2 text-sm">
                    {[
                      ["국민연금", result.monthlyIncludingBonus.nationalPension],
                      ["건강보험", result.monthlyIncludingBonus.healthInsurance],
                      ["장기요양보험", result.monthlyIncludingBonus.longTermCare],
                      ["고용보험", result.monthlyIncludingBonus.employmentInsurance],
                      ["소득세 추정", result.monthlyIncludingBonus.incomeTax],
                      ["지방소득세 추정", result.monthlyIncludingBonus.localIncomeTax],
                      ["공제 합계", result.monthlyIncludingBonus.totalDeductions],
                    ].map(([label, value]) => <div key={label} className="flex justify-between gap-4"><dt>{label}</dt><dd className="tabular-nums">{won(value as number)}</dd></div>)}
                  </dl>
                </details>
              </>}
            </div>
          ))}
        </div>
        {comparing && results[0].ok && results[1].ok && <p className="mt-4 rounded-xl border border-border bg-card p-4 text-sm leading-7">같은 공제 조건에서 기관 B의 월평균 실수령 추정은 기관 A보다 <strong>{won(Math.abs(results[1].monthlyIncludingBonus.netPay - results[0].monthlyIncludingBonus.netPay))} {results[1].monthlyIncludingBonus.netPay >= results[0].monthlyIncludingBonus.netPay ? "많습니다" : "적습니다"}</strong>. 개인 채용 조건을 비교한 값이며 기관의 보수 순위가 아닙니다.</p>}
      </div>
      <p className="mt-5 text-sm leading-7 text-muted-foreground">{CURRENT_RATES_YEAR}년 일반 근로자 공제 모형과 국민연금 2026년 7월 이후 상·하한을 사용합니다. 소득세는 연간 급여를 12개월로 나눈 월급여액에 근로소득 간이세액표를 적용한 추정치이며, 성과급 지급월의 실제 원천징수·연말정산 결과와 다를 수 있습니다. 기관별 추가 공제, 보수월액 신고·정산 시점은 반영하지 않습니다.</p>
      <p className="mt-2 text-xs leading-6 text-muted-foreground">입력 금액과 기관 이름은 계산에만 사용하며 이 페이지의 URL이나 계산 분석 이벤트에 포함하지 않습니다. 새로고침하면 입력은 초기화됩니다.</p>
      {pensionSystem === "other" && <Link href="/civil-servant-pay-2026" className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-link">공무원 봉급표 안내<ArrowRight aria-hidden="true" className="h-4 w-4" /></Link>}
    </section>
  );
}
