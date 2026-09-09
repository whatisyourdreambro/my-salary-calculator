"use client";

import { useState } from "react";
import Link from "@/components/AppLink";
import { CalcResultAd } from "@/components/AdPlacement";
import { useCalculatorMeasurement } from "@/hooks/useCalculatorMeasurement";
import { convertGrossSalary, parseCalculatorAmount, parseWholeKRW } from "@/lib/englishCalculators";
import EnglishPageShell from "@/components/english/EnglishPageShell";

const initialRates = { USD: "1350", JPY: "9", SGD: "1000", GBP: "1800" };
const number = (value: number) => value.toLocaleString("en-US", { maximumFractionDigits: 2 });

export default function SalaryConverterPage() {
  const [salary, setSalary] = useState("60000000");
  const [rates, setRates] = useState(initialRates);
  const annualKRW = parseWholeKRW(salary);
  const entries = Object.entries(rates).map(([currency, rawRate]) => {
    const rate = parseCalculatorAmount(rawRate, 1_000_000);
    return { currency, rate, result: annualKRW !== null && rate !== null ? convertGrossSalary(annualKRW, rate) : null };
  });
  const valid = annualKRW !== null && entries.every(({ result }) => result !== null);
  const { inputProps, resultRef } = useCalculatorMeasurement({ calcType: "en-salary-converter", valid, resultKey: [annualKRW, rates] });

  return (
    <EnglishPageShell eyebrow="Calculators · Gross currency amounts" title="Gross salary currency converter" description="Convert an annual Korean salary into annual and monthly amounts using your exchange-rate assumptions. Taxes, conversion fees and living costs are excluded." breadcrumbs={[{ name: "Calculators", href: "/en/calculators" }, { name: "Gross salary converter", href: "/en/salary-converter" }]}>
      <section className="rounded-2xl border border-border p-5 sm:p-8" aria-labelledby="converter-inputs">
        <h2 id="converter-inputs" className="text-xl font-bold">Your salary and exchange rates</h2>
        <div {...inputProps} className="mt-5 space-y-6">
          <div>
            <label htmlFor="converter-salary" className="mb-2 block font-semibold">Annual gross salary in KRW</label>
            <input id="converter-salary" type="text" inputMode="numeric" value={salary} onChange={(event) => setSalary(event.target.value)} aria-invalid={annualKRW === null} aria-describedby="salary-help converter-error" className="w-full rounded-xl border border-border bg-background px-4 py-3 text-xl" />
            <p id="salary-help" className="mt-2 text-sm text-muted-foreground">Before taxes and employee contributions. Enter whole KRW from 0 to 1,000,000,000 without commas. Include a bonus only if you intend to spread it across all twelve months.</p>
          </div>
          <fieldset>
            <legend className="font-semibold">Assumed KRW paid for 1 unit of foreign currency</legend>
            <p id="rates-help" className="mt-2 text-sm text-muted-foreground">Starting values are examples, not live quotes. Replace them with your bank or provider quote. For JPY, use 1 yen, not 100 yen. Fees and spreads are excluded.</p>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              {entries.map(({ currency, rate }) => (
                <div key={currency}>
                  <label htmlFor={`rate-${currency}`} className="mb-2 block font-medium">KRW per 1 {currency}</label>
                  <input id={`rate-${currency}`} type="text" inputMode="decimal" value={rates[currency as keyof typeof rates]} onChange={(event) => setRates((previous) => ({ ...previous, [currency]: event.target.value }))} aria-describedby="rates-help converter-error" aria-invalid={rate === null || rate < 0.000001} className="w-full rounded-xl border border-border bg-background px-4 py-3" />
                </div>
              ))}
            </div>
          </fieldset>
        </div>
        <p id="converter-error" role="status" className="mt-4 text-sm text-muted-foreground">{valid ? "All amounts below are gross. Monthly amounts are annual amounts divided by 12." : "Enter a valid salary and exchange rates from 0.000001 to 1,000,000 KRW per unit. Empty or invalid inputs do not produce a result."}</p>
        {valid && annualKRW !== null && (
          <section ref={resultRef} aria-live="polite" aria-atomic="true" className="mt-8" aria-labelledby="gross-results">
            <h2 id="gross-results" className="text-xl font-bold">Gross annual and monthly amounts</h2>
            <p className="mt-2 text-sm">KRW: {number(annualKRW)} per year · {number(annualKRW / 12)} per month</p>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              {entries.map(({ currency, result }) => result && (
                <section key={currency} className="min-w-0 rounded-xl border border-border bg-secondary/30 p-4">
                  <h3 className="font-bold">{currency}</h3>
                  <dl className="mt-2 space-y-2">
                    <div><dt className="text-sm">Annual gross</dt><dd className="break-words text-xl font-bold">{number(result.annual)} {currency}</dd></div>
                    <div><dt className="text-sm">Monthly gross ÷ 12</dt><dd className="break-words font-semibold">{number(result.monthly)} {currency}</dd></div>
                  </dl>
                </section>
              ))}
            </div>
          </section>
        )}
      </section>
      <CalcResultAd />
      <section className="mt-8 rounded-2xl border border-border p-5" aria-labelledby="conversion-limits">
        <h2 id="conversion-limits" className="text-xl font-bold">What this comparison tells you</h2>
        <p className="mt-3">This is currency arithmetic, not an overseas job-offer or living-standard comparison. Taxes, social insurance, housing, working hours and benefits differ by location and personal circumstances. A twelve-month average is not a promise of each payslip amount.</p>
        <p className="mt-3">For an actual offer, compare gross salary, bonus conditions, benefits and local deductions separately, then use a quote that includes conversion fees.</p>
        <nav aria-label="Related English tasks" className="mt-4 flex flex-wrap gap-4">
          <Link href="/en#calculator" className="inline-flex min-h-11 items-center text-primary underline">Estimate Korean take-home pay</Link>
          <Link href="/en/tools/offer-compare" className="inline-flex min-h-11 items-center text-primary underline">Compare gross offers in one currency</Link>
          <Link href="/en/flat-tax" className="inline-flex min-h-11 items-center text-primary underline">Compare Korean income-tax methods</Link>
          <Link href="/en/help#currency" className="inline-flex min-h-11 items-center text-primary underline">Conversion method and limitations</Link>
        </nav>
      </section>
    </EnglishPageShell>
  );
}
