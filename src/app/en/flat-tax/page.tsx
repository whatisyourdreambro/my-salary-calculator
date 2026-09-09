"use client";

import { useState } from "react";
import Link from "@/components/AppLink";
import { CalcResultAd } from "@/components/AdPlacement";
import { useCalculatorMeasurement } from "@/hooks/useCalculatorMeasurement";
import { compareKoreanIncomeTax, parseWholeKRW, MAX_ANNUAL_KRW } from "@/lib/englishCalculators";

const money = (value: number) => Math.round(value).toLocaleString("en-US");
const fieldClass = "w-full rounded-xl border border-border bg-background px-4 py-3 text-lg focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary";

export default function FlatTaxPage() {
  const [salary, setSalary] = useState("60000000");
  const [exempt, setExempt] = useState("0");
  const [contributions, setContributions] = useState("0");
  const gross = parseWholeKRW(salary);
  const exemptAmount = parseWholeKRW(exempt);
  const paid = parseWholeKRW(contributions);
  const result = gross !== null && exemptAmount !== null && paid !== null
    ? compareKoreanIncomeTax(gross, exemptAmount, paid) : null;
  const { inputProps, resultRef } = useCalculatorMeasurement({ calcType: "en-flat-tax", valid: result !== null, resultKey: result });

  return (
    <main className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
      <Link href="/en" className="inline-flex min-h-11 items-center text-primary underline">English tools</Link>
      <header className="mb-8 mt-4">
        <h1 className="text-3xl font-black sm:text-5xl">Korea flat tax vs progressive tax</h1>
        <p className="mt-4 text-lg text-muted-foreground">Compare annual income tax in a limited resident-employee model. The 19% national flat rate becomes 20.9% when local income tax is included.</p>
      </header>
      <section aria-labelledby="eligibility" className="mb-8 rounded-2xl border border-border bg-secondary/30 p-5">
        <h2 id="eligibility" className="text-xl font-bold">Check eligibility before comparing</h2>
        <p className="mt-2">The election is for qualifying foreign employees, excluding daily workers and certain related-enterprise employment. Under the law reviewed on 9 September 2026, first work in Korea must start by 31 December 2026; the applicable period is up to 20 years from that first date. An application is required.</p>
        <p className="mt-2 text-sm text-muted-foreground">Residence status, employment history and remuneration rules need separate confirmation. This tool does not determine eligibility.</p>
        <Link href="/en/help#flat-tax" className="mt-3 inline-flex min-h-11 items-center text-primary underline">Eligibility checklist and official sources</Link>
      </section>
      <section aria-labelledby="inputs" className="rounded-2xl border border-border p-5 sm:p-8">
        <h2 id="inputs" className="mb-5 text-xl font-bold">Enter annual amounts in KRW</h2>
        <div {...inputProps} className="space-y-5">
          <div>
            <label htmlFor="flat-remuneration" className="mb-2 block font-semibold">Remuneration subject to the flat-tax comparison</label>
            <input id="flat-remuneration" type="text" inputMode="numeric" value={salary} onChange={(event) => setSalary(event.target.value)} aria-describedby="remuneration-help flat-input-error" aria-invalid={gross === null} className={fieldClass} />
            <p id="remuneration-help" className="mt-2 text-sm text-muted-foreground">Cash pay and relevant benefits for the year, including items exempt only under the progressive method. Confirm the flat-tax base with payroll; statutory exceptions can apply. Whole KRW, 0–{money(MAX_ANNUAL_KRW)}; omit commas.</p>
          </div>
          <div>
            <label htmlFor="flat-exempt" className="mb-2 block font-semibold">Amount exempt under the progressive method</label>
            <input id="flat-exempt" type="text" inputMode="numeric" value={exempt} onChange={(event) => setExempt(event.target.value)} aria-describedby="exempt-help flat-input-error" aria-invalid={exemptAmount === null || (gross !== null && exemptAmount > gross)} className={fieldClass} />
            <p id="exempt-help" className="mt-2 text-sm text-muted-foreground">Only the qualifying exempt amount included above. Enter 0 if none; do not subtract the same amount twice.</p>
          </div>
          <div>
            <label htmlFor="flat-contributions" className="mb-2 block font-semibold">Deductible pension and employee insurance paid</label>
            <input id="flat-contributions" type="text" inputMode="numeric" value={contributions} onChange={(event) => setContributions(event.target.value)} aria-describedby="contributions-help flat-input-error" aria-invalid={paid === null || (gross !== null && exemptAmount !== null && paid > gross - exemptAmount)} className={fieldClass} />
            <p id="contributions-help" className="mt-2 text-sm text-muted-foreground">Actual annual contributions eligible for an income deduction. Coverage varies by nationality, visa and agreements; the tool does not assume you pay all four Korean insurances.</p>
          </div>
        </div>
        <p id="flat-input-error" role="status" className="mt-4 text-sm text-muted-foreground">{result ? "Results update below. Review the model assumptions before using the comparison." : "Enter valid non-negative whole KRW amounts. Exemptions cannot exceed remuneration; contributions cannot exceed the remaining salary."}</p>
        {result && (
          <div className="mt-8">
            <div ref={resultRef} className="rounded-2xl bg-secondary/40 p-5" aria-live="polite" aria-atomic="true">
              <h2 className="text-xl font-bold">Annual income tax in this model</h2>
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                {[{ label: "Progressive method", values: result.progressive }, { label: "Flat-tax method", values: result.flat }].map(({ label, values }) => (
                  <section key={label} className="min-w-0 rounded-xl border border-border bg-background p-4">
                    <h3 className="font-bold">{label}</h3>
                    <dl className="mt-3 space-y-2 text-sm">
                      <div><dt>National income tax</dt><dd className="font-semibold">{money(values.national)} KRW</dd></div>
                      <div><dt>Local income tax</dt><dd className="font-semibold">{money(values.local)} KRW</dd></div>
                      <div className="border-t border-border pt-2"><dt>Combined annual tax</dt><dd className="break-words text-xl font-black">{money(values.total)} KRW</dd></div>
                    </dl>
                  </section>
                ))}
              </div>
              <p className="mt-4 font-semibold">{result.difference === 0 ? "The modeled tax amounts are equal." : `The ${result.difference > 0 ? "progressive" : "flat-tax"} amount is ${money(Math.abs(result.difference))} KRW lower in this model.`}</p>
              <p className="mt-2 text-sm">This is not take-home pay, a refund estimate or a recommendation to elect a method.</p>
            </div>
            <details className="mt-4 rounded-xl border border-border p-4">
              <summary className="cursor-pointer py-2 font-semibold">How the progressive amount is calculated</summary>
              <dl className="mt-3 space-y-2 text-sm">
                <div><dt>Salary after entered exemptions</dt><dd>{money(result.progressive.gross)} KRW</dd></div>
                <div><dt>Earned-income deduction</dt><dd>{money(result.progressive.earnedDeduction)} KRW</dd></div>
                <div><dt>Basic personal deduction</dt><dd>1,500,000 KRW for the employee only</dd></div>
                <div><dt>Taxable income after these and entered contributions</dt><dd>{money(result.progressive.taxableIncome)} KRW</dd></div>
                <div><dt>Earned-income tax credit applied</dt><dd>{money(result.progressive.earnedCredit)} KRW</dd></div>
              </dl>
              <p className="mt-3 text-sm">National progressive brackets are 6–45%. Other deductions, standard and special credits, dependants, rent, treaty relief and non-resident rules are omitted. Local tax is modeled as 10% of national tax; displayed amounts are rounded to KRW and are not payroll withholding instructions.</p>
            </details>
          </div>
        )}
      </section>
      <CalcResultAd />
      <nav aria-label="Related English tasks" className="mt-8 flex flex-wrap gap-4">
        <Link href="/en/salary-converter" className="inline-flex min-h-11 items-center text-primary underline">Convert a gross salary</Link>
        <Link href="/en/guides/year-end-tax-deductions-guide" className="inline-flex min-h-11 items-center text-primary underline">Understand year-end deductions</Link>
      </nav>
    </main>
  );
}
