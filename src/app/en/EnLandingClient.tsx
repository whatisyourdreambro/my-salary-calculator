"use client";

import Link from "@/components/AppLink";
import type { GuideCardMeta } from "@/lib/guidesData";
import { formatGuideDate, getGuideModifiedDate } from "@/lib/guideDates";
import { EN_SECTIONS } from "@/lib/englishSite";
import { HomeTopAd, GuideMidAd } from "@/components/AdPlacement";
import FavoritesButton from "@/components/FavoritesButton";
import { ArrowRight, Calculator } from "lucide-react";
import EnglishTaskLinks from "@/components/english/EnglishTaskLinks";
import EnglishSalaryCalculator from "./EnglishSalaryCalculator";

export default function EnLandingClient({ guides }: { guides: GuideCardMeta[] }) {
  return <div lang="en" data-english-page className="bg-background pb-12 pt-28 text-foreground sm:pt-36">
    <div className="page-width min-w-0">
      <header className="mb-8 max-w-4xl">
        <p className="ms-eyebrow mb-5">Working in Korea · 2026 estimate</p>
        <h1 className="text-[clamp(2.125rem,5.4vw,4rem)] font-bold leading-[1.15] tracking-[-0.045em]">Korea Salary Calculator 2026</h1>
        <p className="ms-description mt-5 max-w-2xl">Understand your pay. Plan your next step. Estimate monthly take-home pay in KRW, then compare the assumptions behind your choices.</p>
      </header>
      <div className="min-w-0 space-y-10">
    <nav aria-label="Start here" className="flex flex-wrap gap-3">
      <Link href="#calculator" className="ms-button ms-button-primary"><Calculator className="h-[18px] w-[18px]" aria-hidden="true" />Estimate take-home pay</Link>
      <Link href="/en/calculators" className="ms-button ms-button-secondary">Choose a calculator<ArrowRight className="h-4 w-4" aria-hidden="true" /></Link>
    </nav>
    <div className="flex flex-wrap items-start justify-between gap-4 border-b border-border pb-6">
      <p className="max-w-2xl text-sm leading-6 text-muted-foreground">This is an estimate, not a payslip. Check insurance, residency and tax assumptions in the <Link href="/en/help#salary" className="font-medium text-link underline underline-offset-4">calculation method and sources</Link>.</p>
      <div className="flex flex-wrap items-center gap-3"><FavoritesButton locale="en" className="min-h-11" /><Link href="/en/dashboard" className="inline-flex min-h-11 items-center text-sm font-medium text-link underline underline-offset-4">My saved estimates</Link></div>
    </div>
    <EnglishSalaryCalculator />
    <HomeTopAd />
    <section aria-labelledby="english-next-tasks">
      <h2 id="english-next-tasks" className="mb-3 text-2xl font-semibold tracking-tight sm:text-3xl">Put the result to work</h2>
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
      <h2 id="english-discovery" className="mb-3 text-2xl font-semibold tracking-tight sm:text-3xl">Explore by topic</h2>
      <p className="mb-6 text-muted-foreground">Find bonus, salary, tax, saving and everyday money resources in one place.</p>
      <EnglishTaskLinks label="Seven English sections" items={EN_SECTIONS} />
    </section>
    <section aria-labelledby="english-featured-guides">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div><h2 id="english-featured-guides" className="text-2xl font-semibold tracking-tight sm:text-3xl">Understand your pay and choices</h2><p className="mt-3 text-muted-foreground">Start with payroll, insurance and tax questions before making a financial commitment.</p></div>
        <Link href="/en/guides" className="inline-flex min-h-11 items-center font-semibold text-link underline underline-offset-4">All English guides →</Link>
      </div>
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{guides.map(guide => <Link key={guide.slug} href={`/en/guides/${guide.slug}`} className="ms-surface ms-interactive min-w-0 p-6">
        <h3 className="text-lg font-semibold leading-snug">{guide.title}</h3><p className="mt-3 text-sm leading-6 text-muted-foreground">{guide.description}</p>
        <p className="mt-4 text-xs text-muted-foreground">{guide.modifiedDate ? "Updated" : "Published"} <time dateTime={getGuideModifiedDate(guide)}>{formatGuideDate(getGuideModifiedDate(guide), "en")}</time></p>
      </Link>)}</div>
    </section>
    <GuideMidAd />
    <section aria-labelledby="english-method" className="ms-panel">
      <h2 id="english-method" className="text-2xl font-semibold tracking-tight sm:text-3xl">What the salary estimate includes</h2>
      <p className="mt-4 max-w-3xl leading-7 text-muted-foreground">The form divides annual gross pay into twelve equal months and models standard employee insurance, national tax and local tax. It assumes ordinary resident taxation; nationality, visa, treaties and foreign-worker insurance exceptions need separate checks. The result is an estimate, not a payslip or refund.</p>
      <Link href="/en/help#salary" className="mt-4 inline-flex min-h-11 items-center font-semibold text-link underline underline-offset-4">Calculation method and official sources →</Link>
      <div className="mt-6 space-y-3">
        <details className="rounded-xl border border-border bg-background p-4"><summary className="ms-interactive min-h-11 cursor-pointer rounded-md py-2 font-semibold">How do I enter a Korean job offer?</summary><p className="mt-3 text-sm leading-6 text-muted-foreground">Start with the written annual gross amount and check which bonuses and allowances it includes. KRW 60 million divided by twelve is KRW 5 million per month before deductions; it is not KRW 5 million of take-home pay. Keep a one-time signing payment separate when comparing recurring offers. <Link href="/en/guides/samsung-vs-hynix-employee-comparison" className="font-semibold text-link underline underline-offset-4">Use the job-offer comparison checklist.</Link></p></details>
        <details className="rounded-xl border border-border bg-background p-4"><summary className="ms-interactive min-h-11 cursor-pointer rounded-md py-2 font-semibold">Is the result my actual monthly payslip?</summary><p className="mt-3 text-sm leading-6 text-muted-foreground">No. Irregular bonuses, premium assessments and the official monthly withholding table can change individual months. This simplified annual model is divided by twelve.</p></details>
        <details className="rounded-xl border border-border bg-background p-4"><summary className="ms-interactive min-h-11 cursor-pointer rounded-md py-2 font-semibold">Does being a foreign employee automatically mean 19% tax?</summary><p className="mt-3 text-sm leading-6 text-muted-foreground">No. The flat method has eligibility, remuneration and election conditions. The separate comparison includes local income tax and explains what its progressive model omits.</p></details>
        <details className="rounded-xl border border-border bg-background p-4"><summary className="ms-interactive min-h-11 cursor-pointer rounded-md py-2 font-semibold">Are saved and shared results private?</summary><p className="mt-3 text-sm leading-6 text-muted-foreground">Saving is optional and keeps a snapshot in this browser. A normal page link contains no salary inputs. To share a result, first review the text and explicitly choose it. People receiving it can copy or forward it.</p></details>
        <details className="rounded-xl border border-border bg-background p-4"><summary className="ms-interactive min-h-11 cursor-pointer rounded-md py-2 font-semibold">Can I use these tools outside Korea?</summary><p className="mt-3 text-sm leading-6 text-muted-foreground">The general money tools use your chosen currency and assumptions. Selecting a currency changes display and rounding, not exchange rates or a country&apos;s tax rules. The Korean payroll and income-tax tools remain Korea-specific. Use the separate gross converter when you need an explicit exchange-rate calculation.</p></details>
      </div>
    </section>
  </div></div></div>;
}
