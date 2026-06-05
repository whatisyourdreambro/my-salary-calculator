// src/lib/guides/hot-keywords-deepdive-en.ts
//
// English-language guides for high-traffic Korean keywords.
// Slugs match the Korean versions in hot-keywords-deepdive.ts and company-realestate-deepdive.ts
// so that hreflang pairs are 1:1 (restores /en/guides/* GSC 404 routes).

import type { Guide } from "@/lib/guidesData";

const earnedIncomeCredit = `
<p class="lead">
  Korea's Earned Income Tax Credit (EITC, 근로장려금) is a refundable tax credit that pays up to KRW 3.3 million annually to working households with modest income.
  For 2026, the regular application window is May 1–31, with a half-year option available in September. Many eligible households miss out simply because they don't apply.
</p>

<h2 class="mt-12 text-2xl font-bold text-primary">Who Qualifies in 2026</h2>
<ul class="space-y-2 mt-4">
  <li><strong>Single household:</strong> annual income under KRW 22 million, assets under KRW 240 million</li>
  <li><strong>Single-earner household:</strong> annual income under KRW 32 million, assets under KRW 240 million</li>
  <li><strong>Dual-earner household:</strong> annual income under KRW 38 million, assets under KRW 240 million</li>
</ul>
<p>
  Income includes wages, business income, and other taxable receipts. Assets count real estate, vehicles, deposits, and securities at fair market value as of June 1.
  Tenant-owned housing is excluded but jeonse deposits count partially.
</p>

<h2 class="mt-12 text-2xl font-bold text-primary">Maximum Payouts</h2>
<p>
  Single households can receive up to KRW 1.65 million, single-earner households up to KRW 2.85 million, and dual-earner households up to KRW 3.3 million per year.
  Payments scale by income, peaking in the middle income band, then taper to zero as income approaches the cap.
</p>

<h2 class="mt-12 text-2xl font-bold text-primary">Application Methods</h2>
<ol class="space-y-2 mt-4">
  <li><strong>Regular application (May 1–31):</strong> Files with NTS Hometax or the mobile Sontax app. Payment in late August.</li>
  <li><strong>Half-year application (Sep 1–15):</strong> Wage earners only. First half paid in late December, balance settled the following June.</li>
  <li><strong>By phone (1544-9944):</strong> Automated voice service for previously qualified households.</li>
</ol>

<h2 class="mt-12 text-2xl font-bold text-primary">Common Mistakes That Disqualify You</h2>
<ul class="space-y-2 mt-4">
  <li>Failing to report a co-resident family member's income (counts toward household income)</li>
  <li>Assets exceeding KRW 240 million on June 1 (even temporarily, e.g., real estate sale proceeds sitting in bank)</li>
  <li>Missing the application window — there is no automatic enrollment</li>
  <li>Not filing comprehensive income tax in May (required prerequisite for self-employed)</li>
</ul>

<div class="mt-8 p-6 bg-primary/5 rounded-2xl border border-primary/20">
  <p class="font-bold text-primary mb-2">📌 Related Tools</p>
  <ul class="space-y-1 text-sm">
    <li>· <a href="/calc" class="text-primary underline">All 200+ financial calculators</a></li>
    <li>· <a href="/en/salary-converter" class="text-primary underline">Korean salary converter (KRW)</a></li>
  </ul>
</div>
`;

const fourMajorInsurance = `
<p class="lead">
  Korea's "Four Major Insurances" — National Pension, Health Insurance, Employment Insurance, and Industrial Accident Insurance — are mandatory for almost all wage earners.
  In 2026, the combined employee contribution is approximately 9.7% of gross salary, with the employer matching most components.
</p>

<h2 class="mt-12 text-2xl font-bold text-primary">2026 Contribution Rates</h2>
<div class="overflow-x-auto my-6">
  <table class="w-full text-sm border border-border">
    <thead class="bg-secondary">
      <tr>
        <th class="p-3 text-left">Insurance</th>
        <th class="p-3 text-left">Employee</th>
        <th class="p-3 text-left">Employer</th>
        <th class="p-3 text-left">Total</th>
      </tr>
    </thead>
    <tbody>
      <tr class="border-t border-border"><td class="p-3">National Pension</td><td class="p-3">4.75%</td><td class="p-3">4.75%</td><td class="p-3">9.5%</td></tr>
      <tr class="border-t border-border"><td class="p-3">Health Insurance</td><td class="p-3">3.595%</td><td class="p-3">3.595%</td><td class="p-3">7.19%</td></tr>
      <tr class="border-t border-border"><td class="p-3">Long-term Care (13.14% of health)</td><td class="p-3">0.472%</td><td class="p-3">0.472%</td><td class="p-3">0.945%</td></tr>
      <tr class="border-t border-border"><td class="p-3">Employment Insurance</td><td class="p-3">0.9%</td><td class="p-3">0.9%+α</td><td class="p-3">1.8%+α</td></tr>
      <tr class="border-t border-border"><td class="p-3">Industrial Accident</td><td class="p-3">—</td><td class="p-3">~0.7%</td><td class="p-3">~0.7%</td></tr>
    </tbody>
  </table>
</div>

<h2 class="mt-12 text-2xl font-bold text-primary">What Each Covers</h2>
<ul class="space-y-3 mt-4">
  <li><strong>National Pension:</strong> Retirement pension after age 65 (10-year minimum contribution). Disability pension also available.</li>
  <li><strong>Health Insurance:</strong> Hospital visits, prescriptions, dental, and major surgeries. Out-of-pocket caps via the Annual Out-of-Pocket Limit System.</li>
  <li><strong>Employment Insurance:</strong> Unemployment benefits for 120–270 days based on age and tenure. Also covers parental leave allowance and vocational training.</li>
  <li><strong>Industrial Accident:</strong> Medical care and disability compensation for work-related injuries. Fully employer-funded.</li>
</ul>

<h2 class="mt-12 text-2xl font-bold text-primary">After Leaving Employment</h2>
<p>
  When you leave a job, National Pension and Employment Insurance status update automatically through NPS and the Ministry of Employment.
  Health Insurance, however, requires action: either become a dependent under a family member's policy or convert to "voluntary continued enrollment" within 2 months to avoid steep regional rates.
</p>

<div class="mt-8 p-6 bg-primary/5 rounded-2xl border border-primary/20">
  <p class="font-bold text-primary mb-2">📌 Related Tools</p>
  <ul class="space-y-1 text-sm">
    <li>· <a href="/" class="text-primary underline">Net salary calculator (KRW)</a></li>
    <li>· <a href="/en/flat-tax" class="text-primary underline">Foreign worker 19% flat tax option</a></li>
  </ul>
</div>
`;

const yearEndTaxDeductions = `
<p class="lead">
  Year-end tax settlement (연말정산) is Korea's annual income tax reconciliation for wage earners.
  Run by employers in January–February, it determines whether you receive a refund or owe additional tax for the prior calendar year.
  Knowing which deductions to claim can move the needle by several hundred thousand KRW.
</p>

<h2 class="mt-12 text-2xl font-bold text-primary">Income Deductions (소득공제)</h2>
<p>These reduce the taxable base before tax brackets are applied. High-bracket earners benefit more.</p>
<ul class="space-y-2 mt-4">
  <li><strong>Basic deduction:</strong> KRW 1.5 million per dependent including yourself</li>
  <li><strong>Credit card / debit card / cash receipts:</strong> 15–40% of spending above 25% of total income</li>
  <li><strong>Housing fund deduction:</strong> Up to KRW 4 million for jeonse loan principal repayment (homeowners excluded)</li>
  <li><strong>Personal pension premium:</strong> National Pension and other social insurance fully deductible</li>
</ul>

<h2 class="mt-12 text-2xl font-bold text-primary">Tax Credits (세액공제)</h2>
<p>These reduce the final tax bill directly, dollar-for-dollar. Generally more powerful for low-to-mid income earners.</p>
<ul class="space-y-2 mt-4">
  <li><strong>Personal pension / IRP:</strong> Up to KRW 9 million combined gets 13.2–16.5% credit (annual limit varies by age)</li>
  <li><strong>Medical expenses:</strong> 15% credit on spending exceeding 3% of total income</li>
  <li><strong>Education expenses:</strong> 15% credit, varying caps by recipient (yourself, dependents)</li>
  <li><strong>Donations:</strong> 15% credit (20% for amounts over KRW 10 million)</li>
  <li><strong>Monthly rent (월세):</strong> 17% credit on rent paid, up to KRW 7.5 million annual rent</li>
</ul>

<h2 class="mt-12 text-2xl font-bold text-primary">Tactics That Move the Needle</h2>
<ul class="space-y-2 mt-4">
  <li><strong>Spousal strategy:</strong> Concentrate credit card spending on the higher-income spouse if both work</li>
  <li><strong>Pension max-out:</strong> Fully use the KRW 9 million pension cap — guaranteed 13.2%+ return via the tax credit alone</li>
  <li><strong>December timing:</strong> Push medical and education spending to December if you're below the threshold for the year</li>
  <li><strong>Rent receipts:</strong> File with rent paid even if you forgot earlier — claim within 5 years via amended return</li>
</ul>

<div class="mt-8 p-6 bg-primary/5 rounded-2xl border border-primary/20">
  <p class="font-bold text-primary mb-2">📌 Related Tools</p>
  <ul class="space-y-1 text-sm">
    <li>· <a href="/year-end-tax-2026" class="text-primary underline">2026 year-end tax estimator</a></li>
    <li>· <a href="/calc" class="text-primary underline">All financial calculators</a></li>
  </ul>
</div>
`;

const healthInsuranceGuide = `
<p class="lead">
  Korea's National Health Insurance is a single-payer system covering essentially everyone living in the country.
  Premiums depend on whether you are a workplace member, regional member, or dependent. For 2026, the basic rate is 7.19% of monthly salary, split evenly between employer and employee.
</p>

<h2 class="mt-12 text-2xl font-bold text-primary">Workplace vs Regional Subscribers</h2>
<p>
  <strong>Workplace subscribers (직장가입자)</strong> pay 3.595% of monthly income plus 0.472% long-term care, with employers matching. Coverage extends to dependents at no extra cost.
</p>
<p>
  <strong>Regional subscribers (지역가입자)</strong> — typically self-employed, freelancers, and the unemployed — pay based on a formula that includes income, property, and vehicle value. The single household contribution can be substantially higher than workplace subscribers earning the same amount.
</p>

<h2 class="mt-12 text-2xl font-bold text-primary">Becoming a Dependent (피부양자)</h2>
<p>
  Joining a working family member's policy as a dependent eliminates your own premium entirely. Eligibility requires:
</p>
<ul class="space-y-2 mt-4">
  <li>Annual income under KRW 20 million (effective from late 2022 reform)</li>
  <li>Property value under KRW 540 million (lower if income exists)</li>
  <li>Business income essentially zero, or under KRW 5 million if from passive sources</li>
</ul>
<p>
  These thresholds were tightened in 2022 — many former dependents were converted to regional subscribers, often at premiums of KRW 200–400k per month.
</p>

<h2 class="mt-12 text-2xl font-bold text-primary">Voluntary Continued Enrollment (임의계속가입)</h2>
<p>
  When you leave employment, regional premiums can spike. The voluntary continued enrollment program lets you keep your workplace rate for up to 36 months, paying both the employee and employer portions.
  Apply within 2 months of leaving employment via NHIS. For long-tenured employees facing high regional rates, this is almost always the right choice.
</p>

<h2 class="mt-12 text-2xl font-bold text-primary">Out-of-Pocket Maximum (본인부담상한제)</h2>
<p>
  Even with insurance, copays can accumulate. The annual out-of-pocket cap ranges from KRW 870k (lowest income decile) to KRW 8.08 million (top decile).
  Any amount paid beyond your bracket cap is refunded automatically the following August. Keep your NHIS records updated to ensure correct refund routing.
</p>

<div class="mt-8 p-6 bg-primary/5 rounded-2xl border border-primary/20">
  <p class="font-bold text-primary mb-2">📌 Related Tools</p>
  <ul class="space-y-1 text-sm">
    <li>· <a href="/health-insurance-2026" class="text-primary underline">2026 health insurance season page</a></li>
    <li>· <a href="/" class="text-primary underline">Net salary calculator</a></li>
  </ul>
</div>
`;

const loanTypesComparison = `
<p class="lead">
  Korean borrowers choosing between unsecured personal loans (신용대출), mortgages (주택담보대출), and credit lines (마이너스통장) face very different rate structures.
  For 2026, mortgage rates sit around 3.8–4.5%, unsecured personal loans 5–8%, and credit lines 6–10%.
  Picking the wrong instrument can cost tens of millions over a 30-year horizon.
</p>

<h2 class="mt-12 text-2xl font-bold text-primary">Three Major Loan Types at a Glance</h2>
<div class="overflow-x-auto my-6">
  <table class="w-full text-sm border border-border">
    <thead class="bg-secondary">
      <tr>
        <th class="p-3 text-left">Type</th>
        <th class="p-3 text-left">Rate (2026)</th>
        <th class="p-3 text-left">Limit</th>
        <th class="p-3 text-left">Best Use</th>
      </tr>
    </thead>
    <tbody>
      <tr class="border-t border-border"><td class="p-3 font-semibold">Mortgage (주담대)</td><td class="p-3">3.8–4.5%</td><td class="p-3">LTV up to 70%</td><td class="p-3">Home purchase / refinance</td></tr>
      <tr class="border-t border-border"><td class="p-3 font-semibold">Unsecured Personal (신용대출)</td><td class="p-3">5–8%</td><td class="p-3">1–2× annual income</td><td class="p-3">Lump-sum, fixed need</td></tr>
      <tr class="border-t border-border"><td class="p-3 font-semibold">Credit Line (마이너스통장)</td><td class="p-3">6–10%</td><td class="p-3">~50% of personal loan limit</td><td class="p-3">Flexible short-term cash flow</td></tr>
    </tbody>
  </table>
</div>

<h2 class="mt-12 text-2xl font-bold text-primary">30-Year Cost on a KRW 100 Million Loan</h2>
<ul class="space-y-2 mt-4">
  <li><strong>Mortgage @ 4.2%:</strong> ~KRW 76 million in total interest over 30 years</li>
  <li><strong>Personal loan @ 6.5%:</strong> ~KRW 127 million in total interest over 30 years</li>
  <li><strong>Credit line @ 8% (avg utilization):</strong> ~KRW 160+ million if rolled forward</li>
</ul>
<p>
  Where collateral is possible, the mortgage path saves a major working-age decade of net wealth.
</p>

<h2 class="mt-12 text-2xl font-bold text-primary">When Each Makes Sense</h2>
<ul class="space-y-3 mt-4">
  <li><strong>Mortgage:</strong> Buying a primary residence, refinancing existing high-rate debt secured by property, or HELOC-style cash-out.</li>
  <li><strong>Personal loan:</strong> Wedding, tuition, medical procedure — a clearly defined, time-bounded lump-sum need. Choose level-payment amortization to avoid balloon shocks.</li>
  <li><strong>Credit line:</strong> Business smoothing, emergency reserve. Pay down aggressively when cash flow normalizes — these rates compound mercilessly when balances persist.</li>
</ul>

<h2 class="mt-12 text-2xl font-bold text-primary">DSR — The Regulator's Hard Limit</h2>
<p>
  Korea's Debt Service Ratio (DSR) caps total annual principal-plus-interest repayments at 40% of annual income (50% for second-tier lenders, 70% for some special products).
  Stacking loans on top of an existing mortgage often hits the DSR ceiling before the headline interest rate matters.
  Run your numbers in the DSR calculator before applying.
</p>

<div class="mt-8 p-6 bg-primary/5 rounded-2xl border border-primary/20">
  <p class="font-bold text-primary mb-2">📌 Related Tools</p>
  <ul class="space-y-1 text-sm">
    <li>· <a href="/home-loan" class="text-primary underline">Mortgage calculator (Korean market)</a></li>
    <li>· <a href="/tools/real-estate/dsr" class="text-primary underline">DSR limit calculator</a></li>
    <li>· <a href="/tools/real-estate/ltv" class="text-primary underline">LTV limit calculator</a></li>
  </ul>
</div>
`;

export const hotKeywordsGuidesEn: Guide[] = [
  {
    slug: "earned-income-credit-2026",
    title: "2026 Korean Earned Income Tax Credit (EITC) — Complete Guide",
    description:
      "How Korea's EITC works in 2026: who qualifies, payout amounts up to KRW 3.3 million, application windows, and pitfalls that disqualify eligible households.",
    category: "Tax",
    tags: ["EITC", "Korea Tax", "Earned Income Credit", "2026"],
    level: "Intermediate",
    publishedDate: "2026-05-23",
    views: 0,
    content: earnedIncomeCredit,
    lang: "en",
  },
  {
    slug: "four-major-insurance-complete",
    title: "Korea's Four Major Insurances Explained — 2026 Rates and Coverage",
    description:
      "National Pension, Health, Employment, and Industrial Accident insurance — 2026 contribution rates, coverage, and what changes when you leave employment.",
    category: "Tax",
    tags: ["4대보험", "Korea Social Insurance", "Health", "Pension"],
    level: "Beginner",
    publishedDate: "2026-05-23",
    views: 0,
    content: fourMajorInsurance,
    lang: "en",
  },
  {
    slug: "year-end-tax-deductions-guide",
    title: "Korean Year-end Tax Settlement (연말정산) — Top Deductions for 2026",
    description:
      "Income deductions vs tax credits, key categories like personal pension, credit card, medical, education, and rent — what wage earners must claim in 2026.",
    category: "Tax",
    tags: ["연말정산", "Year-end Tax", "Korea Tax Credits", "Deductions"],
    level: "Intermediate",
    publishedDate: "2026-05-23",
    views: 0,
    content: yearEndTaxDeductions,
    lang: "en",
  },
  {
    slug: "health-insurance-2026-guide",
    title: "Korea National Health Insurance 2026 — Premiums, Dependents, and Caps",
    description:
      "Workplace vs regional subscribers, dependent eligibility, voluntary continued enrollment after job loss, and the annual out-of-pocket cap.",
    category: "Tax",
    tags: ["NHIS", "Korea Health Insurance", "Dependents", "Premium"],
    level: "Intermediate",
    publishedDate: "2026-05-23",
    views: 0,
    content: healthInsuranceGuide,
    lang: "en",
  },
  {
    slug: "loan-types-comparison-2026",
    title: "Korean Loans Compared: Mortgage vs Personal Loan vs Credit Line (2026)",
    description:
      "Three major Korean loan instruments, 2026 rates, 30-year cost comparison on KRW 100M, DSR regulatory cap, and when each makes sense.",
    category: "RealEstate",
    tags: ["Korea Loans", "Mortgage", "Personal Loan", "DSR"],
    level: "Intermediate",
    publishedDate: "2026-05-23",
    views: 0,
    content: loanTypesComparison,
    lang: "en",
  },
];
