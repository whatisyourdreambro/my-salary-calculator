import Link from "@/components/AppLink";
import EnglishPageShell from "@/components/english/EnglishPageShell";
import { buildEnglishMetadata } from "@/lib/englishSeo";

export const metadata = buildEnglishMetadata({
  title: "English Salary Tools: Methods, Sources and Help",
  description: "Understand the Korean take-home salary estimate, income-tax comparison, gross currency conversion, eligibility checks and data handling.",
  path: "/en/help",
});

export default function EnglishHelpPage() {
  return (
    <EnglishPageShell title="Methods, sources and help" description="Choose a tool by the question you need to answer: Korean take-home pay, a limited income-tax comparison or a planning scenario. These tools do not establish eligibility, an actual payslip or an investment return." breadcrumbs={[{ name: "Methods and help", href: "/en/help" }]}>
      <p className="mt-3 text-sm text-muted-foreground">Method review: 9 September 2026. Check the applicable tax year in the official source before filing.</p>
      <nav aria-label="Help topics" className="my-8 flex flex-wrap gap-4">
        {[["#salary", "Take-home pay"], ["#flat-tax", "Income tax"], ["#currency", "Currency"], ["#planning", "Planning tools"], ["#insurance", "Insurance"], ["#privacy", "Data and support"]].map(([href, label]) => <a key={href} href={href} className="inline-flex min-h-11 items-center text-primary underline">{label}</a>)}
      </nav>
      <div className="space-y-10">
        <section id="salary" className="scroll-mt-28 rounded-2xl border border-border p-5 sm:p-7">
          <h2 className="text-2xl font-bold">Estimate Korean monthly take-home pay</h2>
          <p className="mt-4">The English home form uses the same 2026 simplified regular-employee calculation as the Korean home page. Gross annual salary is divided by twelve, then modeled employee insurance and national/local income tax are subtracted. Non-taxable pay is already included in the gross amount.</p>
          <p className="mt-3">The model uses the current July 2026 pension income limits for each modeled month. A real full-year pension statement can use different limits in January–June. It includes the earned-income deduction, basic deductions, pension deduction, earned-income tax credit and eligible child credits; other deductions and credits are omitted.</p>
          <p className="mt-3">It assumes standard insurance coverage and ordinary resident progressive taxation. Nationality, visa, age, treaties, non-resident rules and foreign-worker flat-tax eligibility are not inferred from these four inputs. The displayed national tax is an annual approximation divided by twelve, not the official monthly withholding-table result or a refund.</p>
          <ul className="mt-4 list-disc space-y-2 pl-5">
            <li><a href="https://www.nps.or.kr/pnsinfo/ntpsklg/getOHAF0095M0.do" className="text-primary underline">NPS contribution rates (Korean)</a></li>
            <li><a href="https://www.nts.go.kr/english/main.do" className="text-primary underline">NTS English tax-year guides</a> — confirm the income year and personal eligibility.</li>
            <li><Link href="/en/guides/four-major-insurance-complete" className="text-primary underline">English insurance guide with rate sources</Link></li>
          </ul>
          <Link href="/en#calculator" className="mt-4 inline-flex min-h-11 items-center text-primary underline">Open the Korean take-home estimate</Link>
        </section>
        <section id="flat-tax" className="scroll-mt-28 rounded-2xl border border-border p-5 sm:p-7">
          <h2 className="text-2xl font-bold">Compare Korean income-tax methods</h2>
          <p className="mt-4">The foreign-employee flat rate is 19% national income tax. Adding local income tax at 10% of national tax gives a combined 20.9% model. The progressive comparison uses the 2026 national brackets, the earned-income deduction, the employee&apos;s KRW 1.5 million basic deduction, entered deductible contributions and the earned-income tax credit.</p>
          <ul className="mt-4 list-disc space-y-2 pl-5">
            <li>Confirm your first date of work in Korea. Current law requires that first work to start by 31 December 2026 and limits the applicable period to 20 years from that date.</li>
            <li>Confirm eligible foreign-employee status and related-enterprise restrictions. Daily workers are excluded; certain headquarters exceptions exist.</li>
            <li>Check the remuneration base with payroll. Generally, exemptions, deductions and credits used under the progressive method do not apply to the flat method, but the statute contains an exception for specified benefits.</li>
            <li>The calculator assumes a resident employee for its limited progressive model. It omits non-resident and treaty rules, dependent deductions, rent, standard and other special credits. Their effect can change the comparison.</li>
            <li>Social insurance is separate from income tax. Use your actual eligible contributions, not an assumed universal percentage. A final refund also needs withholding and the complete tax calculation.</li>
          </ul>
          <p className="mt-4">An election requires the prescribed application; the tool does not submit one. Do not infer eligibility or choose a method from the displayed difference alone.</p>
          <div id="tax-resources" className="mt-5 scroll-mt-28">
            <h3 className="font-bold">Official references</h3>
            <ul className="mt-2 list-disc space-y-2 pl-5">
              <li><a className="text-primary underline" href="https://law.go.kr/lsLinkCommonInfo.do?lsJoLnkSeq=1018018445">Restriction of Special Taxation Act, Article 18-2 (Korean)</a> — current law, including eligibility and exceptions.</li>
              <li><a className="text-primary underline" href="https://www.nts.go.kr/english/main.do">National Tax Service English resources</a> — use the guide matching your income year. English tax assistance: 1588-0560.</li>
              <li><a className="text-primary underline" href="https://www.investkorea.org/upload/kotraexpress/2024/07/images/2407_full.pdf">KOTRA July 2024 tax overview (English, PDF)</a> — explanation of national and local rates; historical publication, read together with current law.</li>
            </ul>
          </div>
          <Link href="/en/flat-tax" className="mt-5 inline-flex min-h-11 items-center text-primary underline">Open the income-tax comparison</Link>
        </section>
        <section id="currency" className="scroll-mt-28 rounded-2xl border border-border p-5 sm:p-7">
          <h2 className="text-2xl font-bold">Convert gross salary, not living standards</h2>
          <p className="mt-4">Annual foreign-currency amount = annual KRW salary divided by the entered KRW-per-unit rate. Monthly amount = annual amount divided by twelve. For example, KRW 60,000,000 at an assumed KRW 1,250 per USD gives USD 48,000 annually and USD 4,000 monthly.</p>
          <p className="mt-3">Example rates are editable and are not live market data. Use one yen, not 100 yen, for JPY. The results exclude taxes, insurance, conversion fees and bank spreads. They do not compare city housing costs, purchasing power, benefits or overseas tax systems.</p>
          <Link href="/en/salary-converter" className="mt-4 inline-flex min-h-11 items-center text-primary underline">Open gross salary conversion</Link>
        </section>
        <section id="insurance" className="scroll-mt-28 rounded-2xl border border-border p-5 sm:p-7">
          <h2 className="text-2xl font-bold">Check payroll and insurance separately</h2>
          <p className="mt-4">Ask payroll for gross salary, exempt items, employee contributions, withheld national tax and local tax as separate lines. Foreign-worker insurance coverage can depend on nationality, visa and social-security agreements. An income-tax election does not itself settle insurance coverage.</p>
          <ul className="mt-4 list-disc space-y-2 pl-5">
            <li><a href="https://www.nps.or.kr/eng/main.do" className="text-primary underline">National Pension Service (English)</a></li>
            <li><a href="https://www.nhis.or.kr/english/index.do" className="text-primary underline">National Health Insurance Service (English)</a></li>
            <li><Link href="/en/guides/four-major-insurance-complete" className="text-primary underline">Read the English insurance overview</Link></li>
          </ul>
        </section>
        <section id="planning" className="scroll-mt-28 rounded-2xl border border-border p-5 sm:p-7">
          <h2 className="text-2xl font-bold">General planning tools and currency labels</h2>
          <p className="mt-4">Loan, savings, gross pay, offer and everyday-cost tools use the values and assumptions you enter. Their currency selector changes display and rounding; it does not fetch exchange rates, calculate foreign tax or convert existing inputs. Use one currency throughout a scenario.</p>
          <p className="mt-3">Each tool states its formula, contribution or payment timing, exclusions and worked example. Constant returns and withdrawal rates are assumptions, not forecasts. A scheduled loan payment is not lender approval. The work-time tool uses the spendable hourly pay you supply rather than deriving a country&apos;s take-home wage.</p>
          <Link href="/en/tools" className="mt-4 inline-flex min-h-11 items-center text-primary underline">Choose a money planning tool</Link>
        </section>
        <section id="privacy" className="scroll-mt-28 rounded-2xl border border-border p-5 sm:p-7">
          <h2 className="text-2xl font-bold">Your inputs and support</h2>
          <p className="mt-4">These English calculators run their arithmetic in your browser. Our calculator interaction events identify the tool and interaction stage; they do not include the salary, family counts, exchange rate or tax result you enter here. Site advertising, analytics and hosting services can still process browser, page and connection information.</p>
          <p className="mt-3">If you choose to share a result elsewhere on the site, review the shared text, link or image for personal details. Do not include salary details, account numbers or identity documents in a support message.</p>
          <p className="mt-3">Saving a Korean take-home estimate is optional and stores its inputs and results in this browser. English saved estimates use a separate model and currency namespace from Korean dashboard data. Review and delete saved estimates on My dashboard; browser storage is not a cloud backup.</p>
          <nav aria-label="English policies and support" className="mt-3 flex flex-wrap gap-4">
            <Link href="/en/privacy" className="inline-flex min-h-11 items-center text-primary underline">Privacy policy</Link>
            <Link href="/en/terms" className="inline-flex min-h-11 items-center text-primary underline">Terms</Link>
            <Link href="/en/contact" className="inline-flex min-h-11 items-center text-primary underline">Private contact</Link>
            <Link href="/en/dashboard" className="inline-flex min-h-11 items-center text-primary underline">My dashboard</Link>
          </nav>
        </section>
      </div>
    </EnglishPageShell>
  );
}
