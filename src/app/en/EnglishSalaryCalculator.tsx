"use client";

import { useState } from "react";
import Link from "@/components/AppLink";
import { useCalculatorMeasurement } from "@/hooks/useCalculatorMeasurement";
import { parseWholeKRW } from "@/lib/englishCalculators";
import { calculateEnglishTakeHome } from "@/lib/englishTakeHome";
import { saveEnglishSalarySnapshot } from "@/lib/englishSavedResults";
import ResultSharePanel from "@/components/ResultSharePanel";
import EnglishResultNextTasks from "@/components/english/EnglishResultNextTasks";
import { getEnglishSalaryNextTasks } from "@/lib/englishResultTasks";

const formatKRW = (value: number) => value.toLocaleString("en-US");
const inputClass = "w-full rounded-xl border border-border bg-background px-4 py-3 text-lg focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary";

export default function EnglishSalaryCalculator() {
  const [salary, setSalary] = useState("60000000");
  const [exempt, setExempt] = useState("200000");
  const [dependents, setDependents] = useState(1);
  const [children, setChildren] = useState(0);
  const [saveNotice, setSaveNotice] = useState<{ key: string; message: string; ok: boolean } | null>(null);
  const annualSalary = parseWholeKRW(salary);
  const nonTaxableMonthly = parseWholeKRW(exempt);
  const consistentExempt = annualSalary !== null && nonTaxableMonthly !== null && nonTaxableMonthly * 12 <= annualSalary;
  const result = annualSalary !== null && nonTaxableMonthly !== null ? calculateEnglishTakeHome({ annualSalary, nonTaxableMonthly, dependents, children }) : null;
  const measurement = useCalculatorMeasurement({ calcType: "en-salary", valid: result !== null, resultKey: result });
  const inputKey = JSON.stringify([salary, exempt, dependents, children]);
  const currentSave = saveNotice?.key === inputKey ? saveNotice : null;

  function saveCurrentResult() {
    if (!result || annualSalary === null || nonTaxableMonthly === null) return;
    const saved = saveEnglishSalarySnapshot({ annualSalary, nonTaxableMonthly, dependents, children, ...result });
    const message = saved.ok ? "Saved in this browser. Open My dashboard to review or delete it." : saved.reason === "full" ? "Your dashboard has 20 saved estimates. Delete a saved estimate there before saving another." : "This estimate could not be saved. Check the inputs and browser storage settings; no previous result was removed.";
    setSaveNotice({ key: inputKey, message, ok: saved.ok });
  }

  return (
    <section id="calculator" aria-labelledby="english-salary-title" className="mx-auto mt-10 max-w-4xl scroll-mt-28 px-4 sm:px-6">
      <div className="rounded-3xl border border-border bg-background p-5 sm:p-8">
        <h2 id="english-salary-title" className="text-2xl font-black sm:text-3xl">Korea take-home salary estimate · 2026</h2>
        <p className="mt-3 text-muted-foreground">Estimate average monthly take-home pay from an annual salary, qualifying non-taxable pay and eligible dependents. The estimate assumes standard employee insurance and spreads simplified annual income tax over twelve months.</p>
        <div {...measurement.inputProps} className="mt-6 grid gap-5 sm:grid-cols-2">
          <div>
            <label htmlFor="en-salary-annual" className="mb-2 block font-semibold">Annual gross salary (KRW)</label>
            <input id="en-salary-annual" type="text" inputMode="numeric" value={salary} onChange={(event) => setSalary(event.target.value)} aria-invalid={annualSalary === null} aria-describedby="en-salary-annual-help en-salary-error" className={inputClass} />
            <p id="en-salary-annual-help" className="mt-2 text-sm text-muted-foreground">Whole KRW, 0–1,000,000,000 without commas. Include the annual exempt pay entered alongside; exclude severance.</p>
          </div>
          <div>
            <label htmlFor="en-salary-exempt" className="mb-2 block font-semibold">Monthly non-taxable pay (KRW)</label>
            <input id="en-salary-exempt" type="text" inputMode="numeric" value={exempt} onChange={(event) => setExempt(event.target.value)} aria-invalid={!consistentExempt} aria-describedby="en-salary-exempt-help en-salary-error" className={inputClass} />
            <p id="en-salary-exempt-help" className="mt-2 text-sm text-muted-foreground">Qualifying exempt pay already included in gross salary. Starting example: KRW 200,000 per month. Actual eligibility varies; enter 0 if none.</p>
          </div>
          <div>
            <label htmlFor="en-salary-dependents" className="mb-2 block font-semibold">Basic-deduction people, including you</label>
            <select id="en-salary-dependents" value={dependents} onChange={(event) => setDependents(Number(event.target.value))} className={inputClass} aria-describedby="en-salary-dependent-help">
              {Array.from({ length: 11 }, (_, index) => index + 1).map((count) => <option key={count} value={count}>{count}{count === 1 ? " (you only)" : ""}</option>)}
            </select>
            <p id="en-salary-dependent-help" className="mt-2 text-sm text-muted-foreground">Additional people must satisfy the applicable relationship, income and age conditions. Count each eligible person once.</p>
          </div>
          <div>
            <label htmlFor="en-salary-children" className="mb-2 block font-semibold">Eligible children or grandchildren aged 8+</label>
            <select id="en-salary-children" value={children} onChange={(event) => setChildren(Number(event.target.value))} className={inputClass} aria-invalid={children > dependents - 1} aria-describedby="en-salary-child-help en-salary-error">
              {Array.from({ length: 11 }, (_, count) => <option key={count} value={count}>{count}</option>)}
            </select>
            <p id="en-salary-child-help" className="mt-2 text-sm text-muted-foreground">A subset of the people above, excluding you. Basic-deduction income and age rules still apply; typically up to age 20, with statutory exceptions. Birth/adoption credits are excluded.</p>
          </div>
        </div>
        <p id="en-salary-error" role="status" className="mt-4 text-sm text-muted-foreground">{result ? "The example result is shown below and updates when you change a valid input." : "Check the current inputs: exemptions cannot exceed gross pay, and eligible children cannot exceed other basic-deduction people. Very small positive salaries may be outside this standard-insurance model."}</p>
        {result && (
          <div className="mt-6">
            <section ref={measurement.resultRef} aria-live="polite" aria-atomic="true" className="rounded-2xl border border-primary/20 bg-primary/5 p-5">
              <h3 className="font-semibold">Estimated average monthly take-home</h3>
              <p className="mt-2 break-words text-3xl font-black text-primary">{formatKRW(result.netPay)} KRW</p>
              <p className="mt-2 text-sm">Average monthly deductions: {formatKRW(result.totalDeductions)} KRW</p>
            </section>
            <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
              {[
                ["National Pension", result.nationalPension],
                ["Health Insurance", result.healthInsurance],
                ["Long-term Care", result.longTermCare],
                ["Employment Insurance", result.employmentInsurance],
                ["National income tax", result.incomeTax],
                ["Local income tax", result.localIncomeTax],
              ].map(([label, value]) => <div key={label} className="flex flex-wrap justify-between gap-2 rounded-lg bg-secondary/30 p-3"><dt>{label}</dt><dd className="font-semibold">{formatKRW(Number(value))} KRW</dd></div>)}
            </dl>
            <EnglishResultNextTasks source="salary" plan={getEnglishSalaryNextTasks(result)} />
            <div className="mt-5 rounded-xl border border-border p-4">
              <button type="button" onClick={saveCurrentResult} disabled={currentSave?.ok} className="min-h-11 rounded-xl bg-primary px-5 py-3 font-bold text-primary-foreground disabled:opacity-50">{currentSave?.ok ? "Saved in this browser" : "Save this estimate"}</button>
              <p className="mt-2 text-xs leading-5 text-muted-foreground">Optional: save this KRW estimate and its four inputs on this device. It is separate from Korean dashboard data and is not an account or cloud backup.</p>
              {currentSave && <p role="status" className="mt-2 text-sm">{currentSave.message}</p>}
              <Link href="/en/dashboard" className="mt-2 inline-flex min-h-11 items-center text-primary underline">Open My dashboard</Link>
            </div>
            <ResultSharePanel className="mt-5" locale="en" resultKey={inputKey} resultIsCurrent={result !== null} pageUrl="https://www.moneysalary.com/en" pageTitle="Korea Salary Calculator 2026" pageDescription="Estimate Korean take-home pay with explicit assumptions." url="https://www.moneysalary.com/en" title="My Korean take-home salary estimate" description={`Estimated average monthly take-home: ${formatKRW(result.netPay)} KRW. Monthly deductions in the simplified 2026 regular-employee model: ${formatKRW(result.totalDeductions)} KRW. Not an actual payslip or refund.`} previewDescription="Only the result text below and a page link will be shared. The link does not restore your salary or family inputs. Continue only if you want to disclose these result amounts." contentType="salary_result" />
          </div>
        )}
        <details className="mt-5 rounded-xl border border-border p-4">
          <summary className="cursor-pointer py-2 font-semibold">Model assumptions and limitations</summary>
          <div className="mt-3 space-y-3 text-sm text-muted-foreground">
            <p>The annual salary is spread over twelve equal months. National tax is a simplified annual calculation divided by twelve, not the official monthly withholding-table calculation. Bonuses, irregular pay and actual year-end deductions can change each payslip and final tax.</p>
            <p>The model assumes standard employee pension, health, long-term-care and employment-insurance coverage. It uses current July 2026 pension limits throughout the estimate; a real January–December statement can use different limits in each half. Nationality, visa, age and social-security agreements are not checked.</p>
            <p>Its income-tax calculation includes the earned-income deduction, basic deductions, pension deduction, earned-income tax credit and entered qualifying child credits. It omits other deductions and credits, including rent and medical expenses. It does not model a foreign-worker flat-tax election, treaty relief or non-resident restrictions.</p>
            <p>Amounts are estimates in KRW. They are not an actual payroll quote or a refund calculation. For a foreign-worker tax choice, use the separate limited comparison and confirm eligibility with payroll or NTS.</p>
          </div>
        </details>
        <nav aria-label="Salary calculation reference" className="mt-4 flex flex-wrap gap-x-5 gap-y-2">
          <Link href="/en/help#salary" className="inline-flex min-h-11 items-center text-primary underline">Sources and method</Link>
        </nav>
      </div>
    </section>
  );
}
