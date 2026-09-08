"use client";

import { useState, type ChangeEvent } from "react";
import Link from "@/components/AppLink";
import { useCalculatorMeasurement } from "@/hooks/useCalculatorMeasurement";
import { trackGuideCTAClick } from "@/lib/analytics";
import { RAISE_2027_BUDGET } from "@/lib/civilServantPay";
import { CIVIL_FORECAST_GRADES, CIVIL_FORECAST_STEPS, getCivilServantForecast } from "@/lib/civilServantForecast";

const formatWon = (value: number) => `${value.toLocaleString("ko-KR")}원`;
const percent = (RAISE_2027_BUDGET * 100).toFixed(1);

export default function CivilPayForecastSelector() {
  const [grade, setGrade] = useState(9);
  const [step, setStep] = useState(1);
  const result = getCivilServantForecast(grade, step);
  const measurement = useCalculatorMeasurement({
    calcType: "civil-servant-pay-2027",
    valid: result !== null,
    // This key stays in React memory; grade, step and amounts are not analytics fields.
    resultKey: `${grade}:${step}`,
  });

  function changeGrade(event: ChangeEvent<HTMLSelectElement>) {
    const next = Number(event.currentTarget.value);
    if (next === grade || !getCivilServantForecast(next, step)) return;
    setGrade(next);
    measurement.interact(event);
  }

  function changeStep(event: ChangeEvent<HTMLSelectElement>) {
    const next = Number(event.currentTarget.value);
    if (next === step || !getCivilServantForecast(grade, next)) return;
    setStep(next);
    measurement.interact(event);
  }

  return (
    <section aria-labelledby="civil-forecast-title" className="mx-auto mb-10 max-w-3xl rounded-3xl border border-electric/20 bg-white p-5 sm:p-7">
      <h2 id="civil-forecast-title" className="text-xl font-black text-navy">급수·호봉별 예상 기본급 확인</h2>
      <p id="civil-forecast-help" className="mt-2 text-sm leading-6 text-muted-blue">
        일반직 9급~5급, 1~10호봉을 비교합니다. 2026년 확정 봉급에 예산안 인상률 {percent}%를 단순 적용합니다.
      </p>
      <div className="mt-5 grid grid-cols-2 gap-3" aria-describedby="civil-forecast-help">
        <div>
          <label htmlFor="civil-forecast-grade" className="text-sm font-bold text-navy">급수</label>
          <select id="civil-forecast-grade" value={grade} onChange={changeGrade} className="mt-2 w-full rounded-xl border border-canvas-200 bg-white px-3 py-3 text-base text-navy focus:outline-none focus:ring-2 focus:ring-electric">
            {CIVIL_FORECAST_GRADES.map(value => <option key={value} value={value}>{value}급</option>)}
          </select>
        </div>
        <div>
          <label htmlFor="civil-forecast-step" className="text-sm font-bold text-navy">호봉</label>
          <select id="civil-forecast-step" value={step} onChange={changeStep} className="mt-2 w-full rounded-xl border border-canvas-200 bg-white px-3 py-3 text-base text-navy focus:outline-none focus:ring-2 focus:ring-electric">
            {CIVIL_FORECAST_STEPS.map(value => <option key={value} value={value}>{value}호봉</option>)}
          </select>
        </div>
      </div>
      <div ref={measurement.resultRef} className="mt-5 rounded-2xl bg-electric-5 p-4 sm:p-5" aria-live="polite" aria-atomic="true">
        {result && <>
          <p className="text-sm font-bold text-muted-blue">{grade}급 {step}호봉 · 2027년 예상 월 기본급</p>
          <p className="mt-2 break-words text-3xl font-black tabular-nums text-electric sm:text-4xl">{formatWon(result.predicted2027)}</p>
          <dl className="mt-4 space-y-2 text-sm">
            <div className="flex flex-wrap justify-between gap-x-4 gap-y-1"><dt className="text-muted-blue">2026년 확정 월 기본급</dt><dd className="font-bold tabular-nums text-navy">{formatWon(result.base2026)}</dd></div>
            <div className="flex flex-wrap justify-between gap-x-4 gap-y-1"><dt className="text-muted-blue">월 기본급 증가 예상액</dt><dd className="font-bold tabular-nums text-navy">+{formatWon(result.monthlyIncrease)}</dd></div>
          </dl>
          <p className="mt-4 text-xs leading-6 text-amber-800">천원 단위 반올림에 따른 예상 비교입니다. 수당·세금·공무원연금 등 공제와 저연차 추가 인상은 미반영이며, 실수령액이나 확정 봉급표가 아닙니다.</p>
        </>}
      </div>
      <div className="mt-4 flex flex-wrap gap-x-5 gap-y-3 text-sm font-bold text-electric">
        <a href="#civil-forecast-table" className="underline underline-offset-4">전체 50개 예상액 비교</a>
        <Link href="/civil-servant-pay-2026" onClick={event => { if (event.nativeEvent.isTrusted) trackGuideCTAClick("/civil-servant-pay-2026", "civil-forecast-next"); }} className="underline underline-offset-4">2026년 확정표 확인</Link>
      </div>
    </section>
  );
}
