// src/lib/guides/hot-keywords-deepdive-en.ts
//
// English-language guides for high-traffic Korean keywords.
// Slugs match the Korean versions in hot-keywords-deepdive.ts and company-realestate-deepdive.ts
// so that hreflang pairs are 1:1 (restores /en/guides/* GSC 404 routes).

import type { Guide } from "@/lib/guidesData";

const earnedIncomeCredit = `
<p class="lead">Korea's Earned Income Tax Credit (EITC, 근로장려금) supports eligible working households. The application year and income year are different: the regular application held in 2026 covers 2025 income. This guide was reviewed on 9 September 2026.</p>
<h2>First check the income year and your eligibility</h2>
<p>For 2025 income, the annual couple-combined income limits are below KRW 22 million for a single household, KRW 32 million for a single-earner household and KRW 44 million for a dual-earner household. Household definitions and qualifying income types matter; gross business sales are not the same as assessed business income.</p>
<p>Household assets must total less than KRW 240 million at the applicable 1 June assessment date. For the 2025-income regular application, that date is 1 June 2025. Debt is not simply deducted from assets. Use NTS rules for property and rental-deposit valuation rather than market-value guesses.</p>
<p><strong>English readers:</strong> living or working in Korea alone does not establish eligibility. Nationality, residence and family-status conditions also apply. Ask NTS to check those conditions before relying on the income limits.</p>
<h2>Which 2026 application applies to you?</h2>
<div class="overflow-x-auto"><table class="w-full text-sm border border-border"><thead><tr><th scope="col" class="p-3 text-left">Application</th><th scope="col" class="p-3 text-left">Income covered</th><th scope="col" class="p-3 text-left">Window</th></tr></thead><tbody>
<tr><td class="p-3">Regular</td><td class="p-3">2025 income</td><td class="p-3">1 May–1 June 2026; closed</td></tr>
<tr><td class="p-3">Late regular</td><td class="p-3">2025 income</td><td class="p-3">2 June–1 December 2026; 95% of the assessed amount</td></tr>
<tr><td class="p-3">First-half application</td><td class="p-3">2026 earned income</td><td class="p-3">1–15 September 2026; eligible wage-only households</td></tr>
</tbody></table></div>
<p>Maximum annual EITC amounts are KRW 1.65 million, KRW 2.85 million and KRW 3.3 million respectively. These are ceilings, not a quote. Income, assets and review results determine the actual amount. Proposed increases for 2027 in the September announcement are not the current 2026 limits.</p>
<h2>Prepare the application without double-counting</h2>
<ol><li>Choose the income year and regular or half-year route before collecting figures.</li><li>Check the household classification, spouse income and asset assessment date in Hometax.</li><li>Check whether a prior automatic-application consent has already resulted in an application. Consent is available across age groups, but eligibility must still be met.</li><li>Verify the receipt and review status. An invitation or application does not guarantee payment.</li></ol>
<p>Use Hometax or Sontax; NTS also provides ARS 1544-9944 and an incentive help line, 1566-3636. Use official channels instead of sending identity or bank documents through this site's contact form.</p>
<h2>Sources and next steps</h2>
<ul><li><a href="https://s.nts.go.kr/nts/na/ntt/selectNttInfo.do?mi=2201&amp;nttSn=1350768">NTS regular application announcement, 30 April 2026 (Korean)</a></li><li><a href="https://www.nts.go.kr/nts/na/ntt/selectNttInfo.do?bbsId=1028&amp;mi=2201&amp;nttSn=1354576">NTS September 2026 first-half application and proposed future changes (Korean)</a></li><li><a href="/en/help#tax-resources">English tax resources and support</a></li></ul>
`;

const fourMajorInsurance = `
<p class="lead">Read a Korean payslip as separate lines: gross salary, social insurance, national income tax and local income tax. The four insurance systems have different coverage rules; a foreign employee should not assume that every rate applies automatically.</p>
<h2>2026 workplace rates at a glance</h2>
<div class="overflow-x-auto"><table class="w-full text-sm border border-border"><thead><tr><th scope="col" class="p-3 text-left">Insurance</th><th scope="col" class="p-3 text-left">Employee share</th><th scope="col" class="p-3 text-left">What to check</th></tr></thead><tbody>
<tr><td class="p-3">National Pension</td><td class="p-3">4.75% of the applicable standard monthly income</td><td class="p-3">Coverage, caps and social-security agreement</td></tr>
<tr><td class="p-3">Health Insurance</td><td class="p-3">3.595% of remuneration basis</td><td class="p-3">Registered remuneration and separate non-salary assessments</td></tr>
<tr><td class="p-3">Long-term Care</td><td class="p-3">13.14% of health-insurance premium</td><td class="p-3">About 0.472% of remuneration for a covered employee; rounding and exemptions matter</td></tr>
<tr><td class="p-3">Employment Insurance</td><td class="p-3">0.9% where applicable</td><td class="p-3">Visa, coverage and benefits eligibility</td></tr>
<tr><td class="p-3">Industrial Accident Insurance</td><td class="p-3">No employee premium</td><td class="p-3">Employer-funded; industry rates vary</td></tr>
</tbody></table></div>
<p>Adding the uncapped employee percentages gives roughly 9.7%, but that is not a universal payroll deduction. Each scheme has its own base, coverage and rounding. Income tax is additional and is not part of that sum.</p>
<h2>Questions to ask before your first payslip</h2>
<ul><li>Which schemes cover my employment and nationality or visa category?</li><li>Does a social-security agreement or certificate change pension coverage?</li><li>Which pay items and monthly caps are used for each premium?</li><li>Are national and local income tax shown separately from insurance?</li></ul>
<p>National Pension provides old-age, disability and survivor benefits subject to conditions; the old-age commencement age depends on birth year. Health insurance covers eligible treatment with patient payments and exclusions. Employment insurance benefits require their own contribution and claim conditions. Industrial accident cover concerns work-related injury or illness.</p>
<h2>When you leave a job</h2>
<p>Ask for your workplace-coverage end date, dependent-coverage options and the first regional health-insurance bill. Qualifying former employees can compare voluntary continuation with regional premiums. The application deadline is tied to the first regional bill's payment due date plus two months, not simply the resignation date. See the detailed guide before choosing.</p>
<h2>Official references and related help</h2>
<ul><li><a href="https://www.nps.or.kr/pnsinfo/ntpsklg/getOHAF0095M0.do">NPS 2026 contribution-rate explanation (Korean)</a></li><li><a href="https://mohw.go.kr/gallery.es?act=view&amp;bid=0003&amp;list_no=379625&amp;mid=a10605040000">MOHW 2026 health rate decision (Korean)</a></li><li><a href="https://mohw.go.kr/gallery.es?act=view&amp;bid=0003&amp;list_no=379715&amp;mid=a10605040000">MOHW 2026 long-term-care rate decision (Korean)</a></li><li><a href="https://www.nps.or.kr/eng/main.do">National Pension Service (English)</a> — coverage and agreements.</li><li><a href="https://www.nhis.or.kr/english/index.do">NHIS (English)</a> — membership and premium enquiries.</li><li><a href="/en/guides/health-insurance-2026-guide">Health insurance after leaving employment</a></li><li><a href="/en/flat-tax">Compare income-tax methods separately</a></li><li><a href="/">Korean net-salary calculator (Korean; standard coverage assumptions)</a></li></ul>
`;

const yearEndTaxDeductions = `
<p class="lead">Year-end settlement reconciles a wage earner's annual tax with tax already withheld. A tax credit is not a guaranteed cash payment, and an income deduction is not a tax credit. This is an overview of selected current rules reviewed on 9 September 2026, not a completed return.</p>
<h2>Start with your tax status and income year</h2>
<p>Employers normally settle the previous calendar year's employment income early in the following year. A settlement during early 2026 concerns 2025 income. Confirm the applicable year, Korean tax residence and any flat-tax election first. Non-resident restrictions and the foreign-worker flat election can remove deductions available in the ordinary resident method.</p>
<h2>Income deductions reduce the tax base</h2>
<ul><li>The basic personal deduction is KRW 1.5 million for the taxpayer. Additional family members have relationship, income and sometimes age requirements; the same person cannot be claimed twice.</li><li>Eligible national pension and employee insurance payments are deductions. Private pension savings and IRP contributions belong to a different, tax-credit category.</li><li>The card-spending deduction generally begins after eligible spending exceeds 25% of gross salary. Rates, category caps and eligible family spending vary. Do not route all spending to a higher-paid spouse without comparing thresholds and eligibility.</li></ul>
<h2>Selected tax credits: rate is not refund</h2>
<div class="overflow-x-auto"><table class="w-full text-sm border border-border"><thead><tr><th scope="col" class="p-3 text-left">Category</th><th scope="col" class="p-3 text-left">Main rule</th><th scope="col" class="p-3 text-left">Important limit</th></tr></thead><tbody>
<tr><td class="p-3">Pension savings / IRP</td><td class="p-3">National credit: 15% for gross salary up to KRW 55 million, otherwise 12%; other-income conditions also apply</td><td class="p-3">KRW 6 million pension-savings limit; KRW 9 million combined with eligible retirement-account payments</td></tr>
<tr><td class="p-3">Medical expenses</td><td class="p-3">Generally 15% on qualifying costs above 3% of gross salary</td><td class="p-3">Reimbursements, recipient caps and special-category rates require separate checks</td></tr>
<tr><td class="p-3">Education</td><td class="p-3">15% of qualifying expenses</td><td class="p-3">Eligible institutions, recipients and caps differ</td></tr>
<tr><td class="p-3">Ordinary qualifying donations</td><td class="p-3">15%; 30% on the portion above KRW 10 million</td><td class="p-3">Donation type, limits and carry-forward rules matter</td></tr>
<tr><td class="p-3">Monthly rent</td><td class="p-3">15% or 17% of qualifying rent, up to KRW 10 million a year</td><td class="p-3">Housing, residence registration, home-ownership and income conditions apply</td></tr>
</tbody></table></div>
<p>For rent, the gross-salary ceiling is KRW 80 million, with the 17% rate applying up to KRW 55 million; comprehensive-income conditions also apply. Confirm the complete eligibility rules before claiming. The pension figures often quoted as 13.2% or 16.5% include the associated local-tax effect; they are not the national credit rates and are not an investment-return guarantee.</p>
<h2>A practical settlement checklist</h2>
<ol><li>Collect your withholding statement and confirm the tax year.</li><li>Check Hometax records against actual payments and reimbursements.</li><li>Agree which spouse may claim each eligible dependent; avoid duplicate claims.</li><li>Separate income deductions from tax credits and apply the tax calculation in that order.</li><li>Compare final tax with tax already withheld. A smaller tax bill can mean a smaller additional payment, not necessarily a refund.</li></ol>
<p>Do not buy unnecessary services or lock up emergency cash in a pension product just to obtain a credit. Product withdrawal rules, fees and investment loss are separate from tax treatment.</p>
<h2>Sources and tools</h2>
<ul><li><a href="https://b.nts.go.kr/nts/cm/cntnts/cntntsView.do?cntntsId=7875&amp;mi=6596">NTS other tax credits: pension accounts (Korean)</a></li><li><a href="https://b.nts.go.kr/nts/cm/cntnts/cntntsView.do?cntntsId=7874&amp;mi=6438">NTS special tax credits: medical, education and donations (Korean)</a></li><li><a href="https://korea.nabo.go.kr/board/file/down.do?fid=33319156">National Assembly Budget Office, 2026 Taxation in Korea (Korean PDF)</a> — monthly-rent conditions.</li><li><a href="/year-end-tax">Year-end estimator (Korean)</a></li><li><a href="/en/help#flat-tax">English comparison model and its omissions</a></li></ul>
`;

const healthInsuranceGuide = `
<p class="lead">A health-insurance bill is an assessment of membership and income information, not simply a fixed share of every resident's salary. Foreign residents should confirm their membership category and any exceptions with NHIS.</p>
<h2>Workplace, regional or dependent?</h2>
<p>For covered workplace employees in 2026, the remuneration-based health rate is 7.19% split between employee and employer: 3.595% each. Long-term care is separate, at 13.14% of health premium. Extra income and special membership conditions can affect the actual assessment.</p>
<p>Regional premiums use applicable income and property rules. Vehicle-based regional premiums were abolished from February 2024, so a calculation that still adds a car-value premium is outdated. A regional bill can be higher or lower than workplace contributions; compare the actual assessments.</p>
<p>Dependent status requires relationship, income, business-income, property and sometimes residence conditions. Property tests use the prescribed tax-assessment basis, not an informal home sale price. Ask NHIS to check your documents rather than relying on a single headline income threshold.</p>
<h2>Leaving employment: check the first bill</h2>
<ol><li>Record your last day of work and the workplace-membership end date.</li><li>Ask whether you qualify as a dependent, and what documents are needed.</li><li>Find the payment due date on your first regional premium bill. Confirm the voluntary-continuation application deadline with NHIS before two months have elapsed from that due date.</li><li>Request both the regional assessment and the continuation quotation, including any additional income assessment and long-term care premium.</li></ol>
<p>Continuation requires a total of at least one year of workplace membership in the 18 months before employment ends. It can run up to 36 months from the day after employment ends, subject to membership changes. It is not a new 36-month period beginning whenever you apply.</p>
<p>Do not assume that continuation means paying twice your former employee share, or that it is always cheaper. NHIS applies the continuation calculation and any reductions. Compare its quotation with your regional bill, family circumstances and likely re-employment date.</p>
<h2>Out-of-pocket caps are a separate question</h2>
<p>The annual cap applies to specified covered patient payments, not every hospital expense. The relevant year, income group, excluded services and long hospital stays affect the result. Use the NHIS notice and current annual table; do not treat an old minimum or maximum as a 2026 refund promise.</p>
<h2>Sources and related help</h2>
<ul><li><a href="https://www.nhis.or.kr/static/alim/paper/oldpaper/202212/sub/29.html">NHIS continuation explanation (Korean, 2022 publication)</a> — membership, deadline and period; confirm your current assessment with NHIS.</li><li><a href="https://www.korea.kr/news/policyNewsView.do?newsId=148925627">Ministry of Health and Welfare, 6 February 2024 (Korean)</a> — removal of regional vehicle premiums.</li><li><a href="https://www.nhis.or.kr/english/index.do">NHIS English resources</a></li><li><a href="/en/guides/four-major-insurance-complete">How insurance appears on a payslip</a></li></ul>
`;

const loanTypesComparison = `
<p class="lead">Compare the repayment obligation before comparing a headline interest rate. A mortgage, unsecured instalment loan and revolving credit line do not provide the same repayment schedule or renewal promise. This guide does not quote current offers or guarantee approval.</p>
<h2>What changes between loan types?</h2>
<div class="overflow-x-auto"><table class="w-full text-sm border border-border"><thead><tr><th scope="col" class="p-3 text-left">Type</th><th scope="col" class="p-3 text-left">Main feature</th><th scope="col" class="p-3 text-left">Question to ask</th></tr></thead><tbody>
<tr><td class="p-3">Mortgage</td><td class="p-3">Secured against property; repayment methods vary</td><td class="p-3">Valuation, collateral limit, fixed/variable period and early-repayment fee?</td></tr>
<tr><td class="p-3">Unsecured personal loan</td><td class="p-3">Underwritten on borrower circumstances without property security</td><td class="p-3">Amortising payments or a final lump sum? Actual term and total cost?</td></tr>
<tr><td class="p-3">Credit line</td><td class="p-3">Draw and repay within an approved facility</td><td class="p-3">Interest on drawings, fees, renewal review and facility reduction conditions?</td></tr>
</tbody></table></div>
<p>Use dated quotations from the same comparison day. Advertised minimum rates may require conditions you do not meet. A credit line that needs periodic renewal should not be modeled as a guaranteed 30-year loan.</p>
<h2>Compare like with like</h2>
<p>Keep the borrowed principal, term, repayment method, rate assumption and fees consistent. A smaller monthly payment can reflect a longer term or unpaid principal at maturity rather than a lower cost. If a rate is variable, compare at least one higher-rate scenario and identify when the reset can occur.</p>
<p>For a simple illustration only: interest on a constant KRW 10 million balance at an assumed 6% annual rate is about KRW 50,000 for one twelfth of a year, before fees and day-count differences. Paying interest alone leaves the KRW 10 million principal to repay. This is arithmetic, not a bank offer.</p>
<h2>Affordability is different from regulatory approval</h2>
<p>DSR compares qualifying annual debt service with income under the lender's regulatory calculation. LTV relates lending to collateral value. Applicable limits, stress-rate rules, exemptions and foreign-borrower eligibility depend on the product and current regulation. Neither a household repayment-to-income ratio nor an LTV percentage alone proves approval.</p>
<ul><li>Ask the lender which existing debts, facility limits and stress assumptions it will count.</li><li>Budget essential living costs, irregular income and emergency reserves separately.</li><li>Confirm renewal, acceleration, early-repayment and collateral risks in the agreement.</li><li>Use the lender's written estimate for the final comparison; do not substitute a generic calculator result for an offer.</li></ul>
<h2>Resources and tools</h2>
<ul><li><a href="https://www.fsc.go.kr/eng/index">Financial Services Commission (English)</a> — official policy announcements; consult the applicable current announcement.</li><li><a href="/home-loan">Mortgage repayment calculator (Korean; assumptions stated on the page)</a></li><li><a href="/en/salary-converter">Convert gross salary using an explicit exchange-rate assumption</a></li></ul>
`;

export const hotKeywordsGuidesEn: Guide[] = [
  {
    slug: "earned-income-credit-2026",
    title: "Korean EITC in 2026: Income Year, Eligibility and Application Windows",
    description:
      "How Korea's EITC works in 2026: who qualifies, payout amounts up to KRW 3.3 million, application windows, and pitfalls that disqualify eligible households.",
    category: "Tax",
    tags: ["EITC", "Korea Tax", "Earned Income Credit", "2026"],
    level: "Intermediate",
    publishedDate: "2026-05-23",
    modifiedDate: "2026-09-09",
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
    modifiedDate: "2026-09-09",
    views: 0,
    content: fourMajorInsurance,
    lang: "en",
  },
  {
    slug: "year-end-tax-deductions-guide",
    title: "Korean Year-end Tax Settlement (연말정산) — Top Deductions for 2026",
    description:
      "Separate income deductions from tax credits, check pension and rent conditions, and understand why a credit is not a guaranteed refund.",
    category: "Tax",
    tags: ["연말정산", "Year-end Tax", "Korea Tax Credits", "Deductions"],
    level: "Intermediate",
    publishedDate: "2026-05-23",
    modifiedDate: "2026-09-09",
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
    modifiedDate: "2026-09-09",
    views: 0,
    content: healthInsuranceGuide,
    lang: "en",
  },
  {
    slug: "loan-types-comparison-2026",
    title: "Korean Loans Compared: Mortgage vs Personal Loan vs Credit Line (2026)",
    description:
      "Compare repayment schedules, renewal risks and dated lender quotations for Korean mortgages, personal loans and credit lines.",
    category: "RealEstate",
    tags: ["Korea Loans", "Mortgage", "Personal Loan", "DSR"],
    level: "Intermediate",
    publishedDate: "2026-05-23",
    modifiedDate: "2026-09-09",
    views: 0,
    content: loanTypesComparison,
    lang: "en",
  },
];
