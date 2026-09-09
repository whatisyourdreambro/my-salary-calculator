"use client";

import Link from "@/components/AppLink";
import type { GuideCardMeta } from "@/lib/guidesData";
import { formatGuideDate, getGuideModifiedDate } from "@/lib/guideDates";
import { EN_SECTIONS } from "@/lib/englishSite";
import { HomeTopAd, GuideMidAd } from "@/components/AdPlacement";
import EnglishPageShell from "@/components/english/EnglishPageShell";
import EnglishTaskLinks from "@/components/english/EnglishTaskLinks";
import EnglishSalaryCalculator from "./EnglishSalaryCalculator";

export default function EnLandingClient({ guides }: { guides: GuideCardMeta[] }) {
  return <EnglishPageShell eyebrow="Working in Korea · English tools" title="Korea Salary Calculator 2026" description="Estimate average monthly take-home pay in KRW, understand insurance and tax deductions, then explore tools for bonuses, job offers and everyday money decisions.">
    <nav aria-label="Start here" className="flex flex-wrap gap-3">
      <Link href="#calculator" className="inline-flex min-h-11 items-center rounded-xl bg-primary px-5 py-3 font-bold text-primary-foreground">Estimate take-home pay</Link>
      <Link href="/en/calculators" className="inline-flex min-h-11 items-center rounded-xl border border-border bg-background px-5 py-3 font-bold">Choose a calculator</Link>
      <Link href="/en/dashboard" className="inline-flex min-h-11 items-center rounded-xl border border-border bg-background px-5 py-3 font-bold">My saved estimates</Link>
    </nav>
    <EnglishSalaryCalculator />
    <HomeTopAd />
    <section aria-labelledby="english-next-tasks">
      <h2 id="english-next-tasks" className="mb-3 text-2xl font-black sm:text-3xl">Put the result to work</h2>
      <p className="mb-6 max-w-3xl text-muted-foreground">Take-home pay, a tax comparison and a gross offer answer different questions. Choose the next calculation without treating one as the other.</p>
      <EnglishTaskLinks label="Useful next calculations" items={[
        { href: "/en/flat-tax", title: "Compare income-tax methods", description: "A limited comparison of progressive tax and the foreign-employee flat method; eligibility is checked separately." },
        { href: "/en/tools/offer-compare", title: "Compare two offers", description: "Keep fixed pay, variable bonus and one-time amounts separate in one currency." },
        { href: "/en/salary-converter", title: "Convert gross salary", description: "Annual and monthly foreign-currency amounts using your exchange-rate assumptions." },
        { href: "/en/tools/loan", title: "Plan loan payments", description: "Compare the payment schedule with your budget; a result is not lender approval." },
        { href: "/en/tools/savings-goal", title: "Set a savings goal", description: "See the monthly saving needed under an explicit time and return assumption." },
        { href: "/en/tools/bonus", title: "Estimate a gross bonus", description: "Apply an assumed percentage to the correct pay base; tax and employer eligibility are separate." },
      ]} />
    </section>
    <section aria-labelledby="english-discovery">
      <h2 id="english-discovery" className="mb-3 text-2xl font-black sm:text-3xl">Explore by topic</h2>
      <p className="mb-6 text-muted-foreground">Find bonus, salary, tax, saving and everyday money resources in one place.</p>
      <EnglishTaskLinks label="Seven English sections" items={EN_SECTIONS} />
    </section>
    <section aria-labelledby="english-featured-guides">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div><h2 id="english-featured-guides" className="text-2xl font-black sm:text-3xl">Understand your pay and choices</h2><p className="mt-3 text-muted-foreground">Start with payroll, insurance and tax questions before making a financial commitment.</p></div>
        <Link href="/en/guides" className="inline-flex min-h-11 items-center font-bold text-primary underline">All English guides →</Link>
      </div>
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{guides.map(guide => <Link key={guide.slug} href={`/en/guides/${guide.slug}`} className="min-w-0 rounded-2xl border border-border bg-background p-6 hover:border-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary">
        <h3 className="text-lg font-bold leading-snug">{guide.title}</h3><p className="mt-3 text-sm leading-6 text-muted-foreground">{guide.description}</p>
        <p className="mt-4 text-xs text-muted-foreground">{guide.modifiedDate ? "Updated" : "Published"} <time dateTime={getGuideModifiedDate(guide)}>{formatGuideDate(getGuideModifiedDate(guide), "en")}</time></p>
      </Link>)}</div>
    </section>
    <GuideMidAd />
    <section aria-labelledby="english-method" className="rounded-2xl border border-border bg-background p-6 sm:p-8">
      <h2 id="english-method" className="text-2xl font-black">What the salary estimate includes</h2>
      <p className="mt-4 max-w-3xl leading-7 text-muted-foreground">The form divides annual gross pay into twelve equal months and models standard employee insurance, national tax and local tax. It assumes ordinary resident taxation; nationality, visa, treaties and foreign-worker insurance exceptions need separate checks. The result is an estimate, not a payslip or refund.</p>
      <Link href="/en/help#salary" className="mt-4 inline-flex min-h-11 items-center font-bold text-primary underline">Calculation method and official sources →</Link>
      <div className="mt-6 space-y-3">
        <details className="rounded-xl border border-border p-4"><summary className="cursor-pointer py-2 font-bold">Is the result my actual monthly payslip?</summary><p className="mt-3 text-sm leading-6 text-muted-foreground">No. Irregular bonuses, premium assessments and the official monthly withholding table can change individual months. This simplified annual model is divided by twelve.</p></details>
        <details className="rounded-xl border border-border p-4"><summary className="cursor-pointer py-2 font-bold">Does being a foreign employee automatically mean 19% tax?</summary><p className="mt-3 text-sm leading-6 text-muted-foreground">No. The flat method has eligibility, remuneration and election conditions. The separate comparison includes local income tax and explains what its progressive model omits.</p></details>
        <details className="rounded-xl border border-border p-4"><summary className="cursor-pointer py-2 font-bold">Are saved and shared results private?</summary><p className="mt-3 text-sm leading-6 text-muted-foreground">Saving is optional and keeps a snapshot in this browser. A normal page link contains no salary inputs. To share a result, first review the text and explicitly choose it. People receiving it can copy or forward it.</p></details>
        <details className="rounded-xl border border-border p-4"><summary className="cursor-pointer py-2 font-bold">Can I use these tools outside Korea?</summary><p className="mt-3 text-sm leading-6 text-muted-foreground">The general money tools use your chosen currency and assumptions. Selecting a currency changes display and rounding, not exchange rates or a country&apos;s tax rules. The Korean payroll and income-tax tools remain Korea-specific. Use the separate gross converter when you need an explicit exchange-rate calculation.</p></details>
      </div>
    </section>
  </EnglishPageShell>;
}
