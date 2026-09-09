"use client";

import { useState } from "react";
import { CalcResultAd } from "@/components/AdPlacement";
import { calculateChildDeduction2026, CHILD_DEDUCTION_COUNT_LIMIT, type ChildDeductionInput } from "@/lib/childDeduction";

function fmt(n: number) { return n.toLocaleString("ko-KR"); }

export default function ChildDeductionClient() {
  const [input, setInput] = useState<ChildDeductionInput>({
    eligibleUnder8: 0, eligible8Plus: 0,
    firstBirthOrAdoption: 0, secondBirthOrAdoption: 0, thirdPlusBirthOrAdoption: 0,
  });
  const result = calculateChildDeduction2026(input);
  const update = (field: keyof ChildDeductionInput, value: number) => setInput((previous) => ({ ...previous, [field]: value }));

  return (
    <div className="space-y-5 mb-10">
      <div className="rounded-2xl bg-white dark:bg-canvas-900 border border-canvas-200 dark:border-canvas-800 p-5 sm:p-6 space-y-6">
        <fieldset aria-describedby="child-eligibility">
          <legend className="font-bold text-navy dark:text-canvas-50">1. 내가 기본공제를 신청할 자녀·손자녀</legend>
          <p id="child-eligibility" className="mt-2 mb-4 text-sm text-muted-blue dark:text-canvas-300 leading-relaxed">
            2026년 귀속 기본공제의 나이·소득·부양 요건을 충족하고 다른 가족이 중복 신청하지 않는 인원만 넣어 주세요.
            일반적으로 만 20세 이하이며, 연간 소득금액 100만원 이하(근로소득만 있으면 총급여 500만원 이하)여야 합니다.
            장애인은 나이 제한이 없지만 소득 요건은 확인해야 합니다.
          </p>
          <div className="grid sm:grid-cols-2 gap-5">
            <Counter label="만 8세 미만" value={input.eligibleUnder8} onChange={(value) => update("eligibleUnder8", value)} />
            <Counter label="만 8세 이상" value={input.eligible8Plus} onChange={(value) => update("eligible8Plus", value)} />
          </div>
          <p className="mt-3 text-xs text-muted-blue dark:text-canvas-300">일반적인 연령 판정은 2026년 12월 31일 기준입니다. 만 7세는 8세 미만에 포함합니다. 요건을 충족하지 않는 자녀는 입력에서 제외해 주세요.</p>
        </fieldset>

        <fieldset aria-describedby="child-birth-help">
          <legend className="font-bold text-navy dark:text-canvas-50">2. 그중 2026년에 출산·입양한 자녀</legend>
          <p id="child-birth-help" className="mt-2 mb-4 text-sm text-muted-blue dark:text-canvas-300">
            자녀의 순서별로 해당 인원을 입력하세요. 출산은 해당 연도 출생, 입양은 해당 연도 입양신고 기준입니다.
            손자녀는 이 출산·입양 항목에 넣지 않습니다.
          </p>
          <div className="grid sm:grid-cols-3 gap-5">
            <Counter label="첫째 출산·입양" value={input.firstBirthOrAdoption} max={1} onChange={(value) => update("firstBirthOrAdoption", value)} />
            <Counter label="둘째 출산·입양" value={input.secondBirthOrAdoption} max={1} onChange={(value) => update("secondBirthOrAdoption", value)} />
            <Counter label="셋째 이후 출산·입양" value={input.thirdPlusBirthOrAdoption} onChange={(value) => update("thirdPlusBirthOrAdoption", value)} />
          </div>
        </fieldset>
      </div>

      <section aria-label="자녀 공제액 결과" aria-live="polite" aria-atomic="true" className="rounded-2xl border border-canvas-200 dark:border-canvas-800 bg-white dark:bg-canvas-900 p-5 sm:p-6">
        {!result.valid ? <p className="font-medium text-red-700 dark:text-red-300">{result.error}</p> : (
          <>
            <h2 className="text-xl font-black text-navy dark:text-canvas-50 mb-4">공제액은 두 종류로 나뉩니다</h2>
            <dl className="grid sm:grid-cols-2 gap-4">
              <div className="rounded-xl bg-canvas-50 dark:bg-canvas-800 p-4">
                <dt className="text-sm font-bold text-muted-blue dark:text-canvas-300">소득공제액</dt>
                <dd className="mt-2 text-3xl font-black tabular-nums text-navy dark:text-canvas-50">{fmt(result.incomeDeduction)}원</dd>
                <dd className="mt-2 text-sm text-muted-blue dark:text-canvas-300">기본공제 대상 1명당 150만원. 세금 계산의 기초가 되는 소득을 줄이는 금액입니다.</dd>
              </div>
              <div className="rounded-xl bg-electric-5 dark:bg-canvas-800 p-4">
                <dt className="text-sm font-bold text-muted-blue dark:text-canvas-300">세액공제 계산액 · 소득세 기준</dt>
                <dd className="mt-2 text-3xl font-black tabular-nums text-electric dark:text-canvas-50">{fmt(result.taxCreditBeforeLimit)}원</dd>
                <dd className="mt-2 text-sm text-muted-blue dark:text-canvas-300">자녀세액공제 {fmt(result.childTaxCredit)}원<br />출산·입양 공제 {fmt(result.birthAdoptionTaxCredit)}원</dd>
              </div>
            </dl>
            <p className="mt-4 text-sm leading-relaxed text-muted-blue dark:text-canvas-300">
              두 금액을 더해 환급액으로 계산하지 않습니다. 실제 적용 세액공제는 다른 공제와 남은 세액 등에 따라 제한될 수 있습니다.
              실제 환급·추가 납부는 최종 결정세액과 이미 낸 세금의 차이이며, 이 계산에는 지방소득세와 장애인 등 추가공제를 포함하지 않습니다.
            </p>
          </>
        )}
      </section>

      <CalcResultAd />
    </div>
  );
}

function Counter({ label, value, onChange, max = CHILD_DEDUCTION_COUNT_LIMIT }: { label: string; value: number; onChange: (v: number) => void; max?: number }) {
  return (
    <div role="group" aria-label={label}>
      <p className="text-sm font-bold mb-2 text-muted-blue dark:text-canvas-300">{label}</p>
      <div className="flex items-center gap-2">
        <button type="button" onClick={() => onChange(Math.max(0, value - 1))} disabled={value === 0}
          className="shrink-0 w-10 h-10 rounded-xl bg-canvas-50 dark:bg-canvas-800 border border-canvas-200 dark:border-canvas-700 text-electric font-black text-xl disabled:opacity-40"
          aria-label={`${label} 줄이기`}>−</button>
        <span className="flex-1 text-center text-2xl font-black text-navy dark:text-canvas-50" aria-live="polite">{value}명</span>
        <button type="button" onClick={() => onChange(Math.min(max, value + 1))} disabled={value === max}
          className="shrink-0 w-10 h-10 rounded-xl bg-electric text-white font-black text-xl disabled:opacity-40"
          aria-label={`${label} 늘리기`}>+</button>
      </div>
    </div>
  );
}
