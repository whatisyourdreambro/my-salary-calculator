import type { Guide } from "@/lib/guidesData";

const investmentNote = `<p class="text-sm"><strong>Scope:</strong> This is an explanation and planning checklist, not a recommendation to buy, sell or allocate a specified share of your assets. Examples exclude costs and taxes unless stated. Market outcomes and individual employment terms can differ.</p>`;
const samsungHbm = "https://news.samsung.com/global/samsung-ships-industry-first-commercial-hbm4-with-ultimate-performance-for-ai-computing";
const samsungReturn = "https://news.samsung.com/global/samsung-electronics-to-implement-largest-ever-shareholder-return-in-2026-estimated-at-krw-90-to-110-trillion";
const hynixHbm = "https://news.skhynix.com/en/sk-hynix-completes-worlds-first-hbm4-development-and-readies-mass-production/";
const ntsShares = "https://www.nts.go.kr/nts/na/ntt/selectNttInfo.do?mi=&amp;nttSn=1348384";
const isaSource = "https://www.samsungpop.com/ux/kor/finance/isa/isainfo/intro.do";

const samsungStock2026 = `
<p class="lead">A product milestone, a company's profit and its share price are three different things. Read Samsung's 2026 announcements by date and scope before applying them to an investment or compensation decision.</p>
<h2>Start with dated company facts</h2>
<p>Samsung announced commercial HBM4 shipments and the start of mass production on 12 February 2026. Its 21 August 2026 shareholder-return announcement also described a board-approved share buyback for employee compensation. These are company announcements, not proof that a particular employee will receive a grant or that the share price will rise.</p>
<p>A headline about production does not by itself establish a customer's purchase volume, a future market share or a quarterly profit contribution. Keep those unreported quantities out of a factual summary.</p>
<h2>A checklist for the next results release</h2>
<div class="overflow-x-auto"><table><thead><tr><th scope="col">Question</th><th scope="col">What to record</th><th scope="col">What it does not prove</th></tr></thead><tbody>
<tr><td>What was announced?</td><td>Development, qualification, production readiness or commercial shipments; announcement date</td><td>That all stages or customer orders are complete</td></tr>
<tr><td>What was earned?</td><td>Reporting period, segment revenue and operating profit, where disclosed</td><td>That a product's revenue equals its profit</td></tr>
<tr><td>What is planned?</td><td>Management's forecast, conditions and intended timing</td><td>That the forecast is an achieved result</td></tr>
<tr><td>What reaches an employee?</td><td>Actual award notice, eligibility, vesting and tax information</td><td>That a corporate buyback is an individual entitlement</td></tr>
</tbody></table></div>
<h2>Use scenarios without inventing a target price</h2>
<p>Instead of attaching an unsupported stock-return percentage to HBM market share, list which assumptions would need to be true. Compare how those assumptions affect your own cash needs and employer-stock concentration. A price scenario is a hypothesis; it is not market consensus unless a dated, identifiable source actually reports that consensus.</p>
<h2>If your income and savings depend on the same employer</h2>
<p>Keep guaranteed cash pay, variable bonus and tradable shares separate. Check whether a cash need could arrive before an award vests or a holding restriction ends. No single portfolio percentage is appropriate merely because two people have the same salary.</p>
<h2>Sources and a useful next step</h2>
<ul><li><a href="${samsungHbm}">Samsung: commercial HBM4 announcement, 12 February 2026</a></li><li><a href="${samsungReturn}">Samsung: shareholder-return and employee-compensation buyback announcement, 21 August 2026</a></li><li><a href="/en/guides/samsung-employee-rsu-stock">How to read an employee stock-award notice</a></li><li><a href="/en/tools/offer-compare">Compare the documented cash components of two offers</a></li></ul>
${investmentNote}`;

const samsungEmployeeRsu = `
<p class="lead">A company announcement about employee compensation is not your personal award notice. Start with your own grant, purchase or option documents, then separate the stages that change ownership, cash flow and tax.</p>
<h2>Company fact versus your contract</h2>
<p>On 21 August 2026, Samsung announced a board-approved share buyback for employee compensation. The announcement does not by itself establish an individual's award quantity, eligible role, vesting date or sale restrictions. Obtain those terms from the employer before valuing a package.</p>
<h2>Purchase, RSU and option are different arrangements</h2>
<div class="overflow-x-auto"><table><thead><tr><th scope="col">Arrangement</th><th scope="col">Information needed</th></tr></thead><tbody>
<tr><td>Employee share purchase</td><td>Subscription price, employee contribution, eligibility, restrictions and custody rules</td></tr>
<tr><td>Purchase financed by a loan</td><td>Rate, subsidy if any, repayment schedule and what happens when employment ends</td></tr>
<tr><td>Restricted stock unit or similar award</td><td>Grant, vesting or delivery conditions, share count and applicable valuation date</td></tr>
<tr><td>Stock option</td><td>Exercise price, exercise window, vesting and tax treatment of an exercise</td></tr>
</tbody></table></div>
<p>A discount, subsidized loan or one-year holding period is not universal. Do not treat an RSU and an option as the same contract.</p>
<h2>Separate compensation tax from a later sale</h2>
<p>Employment-related value may be earned income when the right becomes taxable or an option is exercised. A later share sale is a separate event. The NTS RSU interpretation linked below explains one classification context; grant terms, retirement timing, residence and special relief can change the applicable treatment. Ask payroll which event and value were reported.</p>
<h2>A transparent valuation example</h2>
<p>For illustration only, 100 delivered shares at an assumed price of KRW 60,000 have a gross market value of KRW 6 million. At KRW 48,000 the same shares are worth KRW 4.8 million. This arithmetic is not a grant forecast or spendable cash: restrictions, compensation tax, sale taxes and fees can change the amount available.</p>
<h2>Before comparing or selling</h2>
<ul><li>Keep the award outside guaranteed salary until you understand its conditions.</li><li>Record vesting, restriction-release and tax-payment dates separately.</li><li>Consider the combined exposure of your employment income and savings without relying on a universal allocation rule.</li><li>For a cash-offer comparison, identify share value separately rather than counting it twice as both bonus and salary.</li></ul>
<h2>Sources and tools</h2>
<ul><li><a href="${samsungReturn}">Samsung compensation-related buyback announcement, 21 August 2026</a></li><li><a href="https://taxlaw.nts.go.kr/qt/USEQTA002P.do?ntstDcmId=200000000000011075">NTS RSU income classification (Korean)</a></li><li><a href="/en/guides/chip-stock-tax-guide">Share-sale tax scope and account limits</a></li><li><a href="/en/tools/offer-compare">Gross cash-offer comparison</a></li></ul>
${investmentNote}`;

const skHynixStock2026 = `
<p class="lead">An HBM roadmap explains a product milestone. It does not directly predict SK hynix's share price, a customer's orders or your future bonus. Use a dated evidence checklist to keep those questions separate.</p>
<h2>What the company actually announced</h2>
<p>On 12 September 2025, SK hynix announced completion of HBM4 development and preparation for mass production. Readiness and actual customer shipments are different milestones. Use later dated company releases to determine what changed; do not relabel this announcement as evidence that every planned shipment already occurred.</p>
<h2>Compare the same stage and period</h2>
<div class="overflow-x-auto"><table><thead><tr><th scope="col">Item</th><th scope="col">Comparison check</th></tr></thead><tbody>
<tr><td>Product generation</td><td>Compare the same HBM generation and a specified development or shipment stage.</td></tr>
<tr><td>Financial performance</td><td>Distinguish quarterly from annual results and revenue from operating profit.</td></tr>
<tr><td>Capacity</td><td>Separate announced investment, installed equipment and actual output; they are not interchangeable.</td></tr>
<tr><td>Market-share claim</td><td>Find the source, period, product definition and whether measured by units or revenue.</td></tr>
</tbody></table></div>
<h2>Questions for a future results release</h2>
<ul><li>Which statements describe completed events, and which describe management plans?</li><li>Does the cited metric concern the whole company, memory business or a particular product?</li><li>Does an investment plan specify timing and conditions, or only a planned total?</li><li>What information is still undisclosed? Leave it unknown instead of filling it with a precise scenario return.</li></ul>
<h2>Connect business uncertainty to your own plan</h2>
<p>If your salary, bonus and savings depend on one company, consider a cash-flow case with a lower variable bonus and delayed access to shares. This is a household planning scenario, not a forecast of SK hynix's performance. Do not infer a personal PS or PI rate from a press release about HBM demand.</p>
<h2>Sources and related reading</h2>
<ul><li><a href="${hynixHbm}">SK hynix HBM4 development and production-readiness announcement, 12 September 2025</a></li><li><a href="/en/guides/semiconductor-cycle-2026">Read semiconductor cycles without assuming a fixed peak date</a></li><li><a href="/en/guides/sk-hynix-employee-bonus-stock">Separate company performance from a bonus notice</a></li></ul>
${investmentNote}`;

const skHynixEmployeeBonus = `
<p class="lead">PS and PI figures are useful only when the pay base, performance period and employment conditions are known. This guide provides a way to read a bonus notice; it does not publish a current SK hynix payout rate or predict one.</p>
<h2>Read the notice before choosing a percentage</h2>
<p>Check how the employer defines each payment. A percentage of annual salary, a percentage of monthly basic pay and a fixed cash amount are different bases. Ask which divisions, service periods and employee categories qualify and whether an announced figure is final, proposed or conditional.</p>
<ul><li>Write the performance year separately from the actual payment date.</li><li>Record the gross base and any cap, floor or prorating rule from the notice.</li><li>Separate an ordinary cash payment from share delivery or a deferred award.</li><li>Check withholding on the payslip; gross arithmetic is not a net-payment quote.</li></ul>
<h2>A gross example with all assumptions visible</h2>
<p>Assume annual base pay of KRW 60 million and a hypothetical bonus equal to 10% of that annual base. The resulting KRW 6 million is gross. If a different notice instead says 100% of monthly base pay, the result depends on that monthly base; it is not automatically KRW 60 million. Neither example is an actual PS or PI announcement.</p>
<h2>Compare uses of the money</h2>
<p>Before committing a bonus, note near-term cash needs, loan repayment conditions and any purchase restrictions on employer shares. A share purchase can lose value and a loan may have an early-repayment fee. There is no universal salary percentage that must go into ESOP, bonds or any other investment.</p>
<h2>ISA figures have different meanings</h2>
<p>KRW 20 million annually and KRW 100 million in total are ISA contribution limits, not tax-free profit limits. Qualifying net-profit exemptions are KRW 2 million for the general category or KRW 4 million for eligible special categories; excess taxable profit is subject to 9.9% separate tax including local tax. Check residence, account eligibility, the three-year requirement and permitted investments. A Korean-listed overseas-index ETF is not the same as directly purchasing foreign shares.</p>
<h2>Sources and next steps</h2>
<p>The authoritative source for an individual's bonus is the current employer notice and employment terms. A general company product announcement does not establish the payment. For the account figures, use the provider's current rules below.</p>
<ul><li><a href="${isaSource}">Samsung Securities ISA account rules (Korean)</a></li><li><a href="/en/tools/bonus">Calculate your own gross bonus scenario</a></li><li><a href="/en/tools/offer-compare">Compare recurring and one-time cash separately</a></li></ul>
${investmentNote}`;

const semiconductorCycle2026 = `
<p class="lead">A semiconductor cycle is a way to describe changing demand, supply and financial results. It is not a calendar that proves a 2026 peak or a 2027 correction. For an employee, the practical question is how a changing bonus or share value affects cash commitments.</p>
<h2>Use indicators, not a predetermined peak date</h2>
<p>Read inventory, pricing commentary, capital investment and financial results for a defined period. Product-specific developments can differ from the wider memory market. A production-readiness announcement is not the same as an order or profit figure. The dated HBM4 announcements below illustrate why stage and date matter.</p>
<div class="overflow-x-auto"><table><thead><tr><th scope="col">Observation</th><th scope="col">Question before interpreting it</th></tr></thead><tbody>
<tr><td>Planned capacity growth</td><td>When can capacity become usable output, and what conditions remain?</td></tr>
<tr><td>Improved quarterly profit</td><td>Which segment and comparison period? Is the improvement recurring?</td></tr>
<tr><td>Management outlook</td><td>What assumptions and risks does management state?</td></tr>
<tr><td>Higher employer bonus</td><td>Which performance period and pay base does the actual notice use?</td></tr>
</tbody></table></div>
<h2>Make a household stress test</h2>
<p>List fixed salary, essential spending and committed debt payments. Then calculate a case with a lower or zero discretionary bonus. If shares are restricted, do not treat their full displayed value as cash available for a bill. This tests your plan's sensitivity; it does not predict a company's next payout.</p>
<h2>Keep market history and hypothetical examples separate</h2>
<p>A historical comparison needs the companies, dates, price series, dividends, fees and methodology. Without them, a statement such as a typical 30–50% drawdown is not a measured result. Likewise, an assumed savings return should be labeled as an input, not presented as an inevitable next-cycle recovery.</p>
<h2>Questions to revisit</h2>
<ul><li>Could an essential expense arise before an award vests or a restriction ends?</li><li>How much of your future spending relies on an unconfirmed bonus?</li><li>Are employment income and investments exposed to the same company?</li><li>Which new evidence would change your plan, rather than merely confirm a preferred story?</li></ul>
<h2>Sources and tools</h2>
<ul><li><a href="${hynixHbm}">SK hynix: HBM4 readiness, 12 September 2025</a></li><li><a href="${samsungHbm}">Samsung: commercial HBM4, 12 February 2026</a></li><li><a href="/en/tools/savings-goal">Test a savings contribution scenario</a></li><li><a href="/en/bonus">Bonus notice checklist</a></li></ul>
${investmentNote}`;

const samsungVsHynix = `
<p class="lead">Comparing Samsung and SK hynix means comparing the particular role and written offer, not assigning one salary or benefits package to every employee. A company employee-average disclosure cannot establish a new-hire salary, signing bonus or foreign-worker eligibility.</p>
<h2>Build a documented offer table</h2>
<div class="overflow-x-auto"><table><thead><tr><th scope="col">Item</th><th scope="col">What to request for each offer</th></tr></thead><tbody>
<tr><td>Fixed gross salary</td><td>Currency, annual amount, pay periods and included allowances</td></tr>
<tr><td>Variable compensation</td><td>Pay base, target versus guarantee, performance period and eligibility</td></tr>
<tr><td>One-time amount</td><td>Payment date, service requirement and any repayment clause</td></tr>
<tr><td>Shares or options</td><td>Grant value, vesting, exercise or delivery conditions, restrictions and tax reporting</td></tr>
<tr><td>Benefits</td><td>Actual role/site eligibility, employee cost and conditions; not an assumed company-wide entitlement</td></tr>
<tr><td>Working pattern</td><td>Scheduled hours, shifts, on-call obligations, leave and work location</td></tr>
</tbody></table></div>
<h2>Compare recurring and first-year cash separately</h2>
<p>For a hypothetical offer with 60,000 annual fixed pay and 5,000 one-time cash, the first-year total is 65,000 before variable bonus and tax. The next year's recurring fixed amount remains 60,000 unless the contract changes. Keep both offers in the same currency; do not compare one gross amount with another net amount.</p>
<h2 id="worked-offer-example">Worked example: equal annual cash, different hours</h2>
<p>The following two fictional offers illustrate the arithmetic. They are not Samsung or SK hynix pay figures, a bonus forecast or a recommendation to choose either employer. The bonus is an assumption, not guaranteed salary. Both use KRW and 52 scheduled weeks.</p>
<p class="text-sm text-muted-foreground sm:hidden">Scroll the table sideways to compare both offers.</p>
<div class="overflow-x-auto focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary" tabindex="0" role="region" aria-label="Illustrative job-offer comparison"><table class="min-w-[30rem]"><caption class="pb-3 text-left font-semibold text-foreground">Illustrative offers in KRW, before tax and insurance</caption><thead><tr><th scope="col">Component</th><th scope="col">Offer A</th><th scope="col">Offer B</th></tr></thead><tbody>
<tr><th scope="row">Annual fixed pay</th><td>60,000,000</td><td>63,000,000</td></tr>
<tr><th scope="row">Assumed annual bonus</th><td>6,000,000</td><td>3,000,000</td></tr>
<tr><th scope="row">Recurring cash under that assumption</th><td>66,000,000</td><td>66,000,000</td></tr>
<tr><th scope="row">One-time signing payment</th><td>0</td><td>3,000,000</td></tr>
<tr><th scope="row">First-year cash including signing payment</th><td>66,000,000</td><td>69,000,000</td></tr>
<tr><th scope="row">Scheduled hours per week</th><td>40</td><td>45</td></tr>
<tr><th scope="row">Recurring cash per scheduled hour</th><td>31,730.77</td><td>28,205.13</td></tr>
</tbody></table></div>
<p>Recurring hourly cash is annual fixed pay plus the assumed annual bonus, divided by weekly hours and 52 weeks. The one-time payment is excluded from that hourly comparison. Offer B has more first-year cash, while Offer A has more recurring cash per scheduled hour under these assumptions. Neither measure captures commute, actual overtime, benefits, career development or uncertainty in the bonus.</p>
<p>In the <a href="/en/tools/offer-compare">gross job-offer calculator</a>, select KRW and enter the fixed pay, assumed annual bonus, hours and weeks separately. Keep the signing payment outside recurring inputs. To check a lower-bonus case, change only the bonus assumptions and compare again. The calculator opens with its own examples; this article does not transfer these amounts automatically.</p>
<h2 id="gross-pay-monthly-budget">Before turning gross pay into a monthly budget</h2>
<p>Dividing annual fixed pay by twelve gives a gross monthly amount, not spendable pay. For a Korea-based role, use the <a href="/en#calculator">Korean take-home salary estimate</a> with its stated coverage and tax assumptions, then confirm exceptions with payroll. The <a href="/en/salary-converter">gross salary converter</a> helps compare currencies using a rate you choose; it does not compare taxes or living costs between countries.</p>
<h2>Read company announcements within their scope</h2>
<p>Samsung's 21 August 2026 announcement described a buyback for employee compensation, but did not by itself establish your personal grant. SK hynix's 12 September 2025 HBM4 announcement concerned product development and production readiness, not an employee salary schedule. Business news can explain context without replacing employment terms.</p>
<h2>Questions beyond the headline pay</h2>
<ul><li>Which team, legal employer and work site appear in the contract?</li><li>Are housing, relocation or medical benefits actually included for this role?</li><li>What happens to a bonus, grant or signing payment if employment ends?</li><li>Which foreign-worker tax and insurance conditions need payroll confirmation?</li><li>Does the scheduled-hours comparison omit unpaid travel or an unpredictable shift pattern?</li></ul>
<h2>Sources and comparison tools</h2>
<ul><li><a href="${samsungReturn}">Samsung company announcement, 21 August 2026</a></li><li><a href="${hynixHbm}">SK hynix company announcement, 12 September 2025</a></li><li><a href="/en/tools/offer-compare">Compare the gross cash components of your offers</a></li><li><a href="/en/salary-db">How to interpret salary data</a></li><li><a href="/salary-db">Company salary database (Korean; check each profile's source and scope)</a></li></ul>
${investmentNote}`;

const chipStockTax = `
<p class="lead">Start with tax residence, the share type, the sale venue and your shareholder status. The same sale amount can fall under different Korean tax rules; a familiar company name or a foreign passport alone does not decide the treatment.</p>
<h2>Define the taxable event</h2>
<p>Employment-related stock compensation and a later sale of those shares are separate events. For a sale, use the NTS guidance dated 3 February 2026 below and check the rules for the relevant income year.</p>
<ul><li>Qualifying small shareholders' sales of domestically listed shares on a Korean exchange are generally outside capital gains tax. This does not cover every off-exchange or unlisted sale, and does not remove dividend or transaction taxes.</li><li>Large-shareholder status can depend on value or ownership-ratio tests. Check the applicable testing date, related-party rules and stock category rather than using only today's account value.</li><li>A commonly applicable Korean-resident foreign-stock calculation is 22% including local tax after the applicable KRW 2.5 million annual basic deduction. Residence history, taxable scope and eligible annual netting must be checked; this is not universal for every foreign resident.</li></ul>
<h2>ISA contribution limits are not profit exemptions</h2>
<p>The KRW 20 million annual and KRW 100 million total limits concern contributions. Qualifying net-profit exemptions are KRW 2 million for general accounts or KRW 4 million for eligible special categories; excess taxable profit is separately taxed at 9.9% including local tax. Residence, account eligibility, permitted products and the three-year requirement matter.</p>
<p>Small shareholders' qualifying exchange-traded domestic listed-share gains are generally already outside capital gains tax in an ordinary account. An ISA is not automatically an extra exemption for those gains. Compare the account's actual mix of taxable income, costs and restrictions.</p>
<h2>Pension accounts and foreign-stock losses need their own checks</h2>
<p>Pension withdrawal treatment depends on the source of funds, age, qualifying pension conditions and withdrawal method. Do not compare a single pension tax rate with an ordinary account without those conditions. Permitted investments also differ.</p>
<p>Where a Korean-resident foreign-stock sale is within the applicable taxable scope, eligible gains and losses in the same tax year may be netted. Confirm the scope, transaction costs, other gains and applicable deduction before considering a sale. A potential tax reduction is not a guaranteed investment gain, and it does not justify assuming a future repurchase price.</p>
<h2>Prepare a pre-sale file</h2>
<ol><li>Identify residence history and the relevant tax year.</li><li>Separate compensation income from acquisition cost and later sale proceeds.</li><li>Record exchange or off-exchange venue, dates, fees and share type.</li><li>Check shareholder status and the applicable account rules.</li><li>Reconcile eligible annual gains and losses and ask a qualified adviser about any unresolved treatment.</li></ol>
<h2>Sources</h2>
<ul><li><a href="${ntsShares}">NTS share-sale tax guidance, 3 February 2026 (Korean)</a></li><li><a href="${isaSource}">Samsung Securities ISA rules (Korean)</a></li><li><a href="/en/help#tax-resources">English tax resources and model limitations</a></li></ul>
${investmentNote}`;

const kospiLeaderStrategy = `
<p class="lead">Dollar-cost averaging and a lump-sum purchase describe when available cash is invested. Neither approach makes a concentrated Samsung or SK hynix position safe. This guide uses transparent arithmetic, not an undocumented historical backtest.</p>
<h2>Compare an equal cash budget</h2>
<p>For a fair timing comparison, specify the same total starting cash, the purchase dates and what happens to uninvested cash. Someone investing new salary each month is not in the same starting position as someone who already has the full amount available.</p>
<h2>A two-purchase illustration</h2>
<p>Assume 1,200 currency units are available, share prices are 100 for the first purchase and 50 for the second, fractional shares are allowed, and fees, dividends, taxes and interest on cash are all zero. This invented path illustrates sensitivity, not a prediction.</p>
<div class="overflow-x-auto"><table><thead><tr><th scope="col">Method</th><th scope="col">Shares after both dates</th><th scope="col">Value at the assumed final price of 50</th></tr></thead><tbody>
<tr><td>All 1,200 invested at 100</td><td>12</td><td>600</td></tr>
<tr><td>600 at 100, then 600 at 50</td><td>6 + 12 = 18</td><td>900</td></tr>
</tbody></table></div>
<p>If the second price were 200 instead, the lump sum would buy 12 shares worth 2,400, while the split purchases would buy 6 + 3 shares worth 1,800. Changing the price path changes the comparison. Both examples omit real-world costs and do not identify a superior method for the future.</p>
<h2>What a real backtest would need</h2>
<ul><li>Specific securities, price source and start/end dates.</li><li>Adjusted prices or a stated treatment of dividends, splits and other corporate actions.</li><li>Equal cash budgets, contribution timing and uninvested-cash treatment.</li><li>Fees, taxes, currency and assumptions about fractional shares.</li><li>A consistent return measure and several starting dates, including unfavorable periods.</li></ul>
<p>No measured 2015–2025 performance result is provided here. General labels such as "solid in most periods" cannot substitute for that evidence.</p>
<h2>Use salary as a cash-flow input, not a portfolio rule</h2>
<p>Two people earning the same salary can have different debt, essential spending and near-term needs. Avoid selecting an employer-stock allocation solely from a salary band or an unconfirmed cycle peak. The savings-goal tool can test contributions under your own assumptions without forecasting a stock's return.</p>
<h2>Related methods and tax context</h2>
<ul><li><a href="/en/tools/savings-goal">Monthly savings-goal arithmetic</a></li><li><a href="/en/tools/compound-interest">A constant-return contribution scenario</a></li><li><a href="${ntsShares}">NTS share-sale scope, 3 February 2026 (Korean)</a> — relevant tax context, not evidence for the hypothetical investment returns above.</li></ul>
${investmentNote}`;

export const stockDeepdiveGuidesEn: Guide[] = [
  { slug: "samsung-electronics-stock-2026", title: "Samsung Electronics in 2026: Read HBM and Compensation Announcements", description: "Separate Samsung's dated product and compensation announcements from profit assumptions, stock-price forecasts and individual awards.", category: "Stocks", tags: ["Samsung Electronics", "HBM", "company disclosures", "2026"], level: "Intermediate", publishedDate: "2026-05-06", modifiedDate: "2026-09-09", views: 0, lang: "en", content: samsungStock2026 },
  { slug: "samsung-employee-rsu-stock", title: "Samsung Employee Shares and RSUs: Read Your Award Terms", description: "Check grant, vesting, purchase restrictions and tax events. Separate a company announcement from your personal entitlement.", category: "Stocks", tags: ["Samsung Electronics", "ESOP", "RSU", "employee compensation"], level: "Intermediate", publishedDate: "2026-05-06", modifiedDate: "2026-09-09", views: 0, lang: "en", content: samsungEmployeeRsu },
  { slug: "sk-hynix-stock-2026", title: "SK hynix HBM in 2026: A Company-Announcement Checklist", description: "Distinguish product readiness, shipments, financial results and personal bonus assumptions when reading SK hynix news.", category: "Stocks", tags: ["SK Hynix", "HBM4", "company disclosures", "memory"], level: "Intermediate", publishedDate: "2026-05-06", modifiedDate: "2026-09-09", views: 0, lang: "en", content: skHynixStock2026 },
  { slug: "sk-hynix-employee-bonus-stock", title: "SK hynix PS and PI: How to Read a Bonus Notice", description: "Identify the pay base, performance period and conditions before calculating a gross bonus or planning a share purchase.", category: "Stocks", tags: ["SK Hynix", "PS", "PI", "bonus", "ESOP"], level: "Intermediate", publishedDate: "2026-05-06", modifiedDate: "2026-09-09", views: 0, lang: "en", content: skHynixEmployeeBonus },
  { slug: "semiconductor-cycle-2026", title: "Semiconductor Cycles: A Cash-Flow Checklist for Employees", description: "Read dated business indicators and test household exposure without assuming a fixed market peak or a guaranteed next-cycle bonus.", category: "Stocks", tags: ["semiconductor cycle", "memory", "employee compensation", "cash flow"], level: "Advanced", publishedDate: "2026-05-06", modifiedDate: "2026-09-09", views: 0, lang: "en", content: semiconductorCycle2026 },
  { slug: "samsung-vs-hynix-employee-comparison", title: "Samsung vs SK hynix: Compare the Actual Job Offer", description: "A documented comparison of fixed pay, variable bonus, one-time cash, stock terms and scheduled hours; no invented company-wide salary promise.", category: "Stocks", tags: ["Samsung Electronics", "SK Hynix", "job offer", "comparison", "career"], level: "Beginner", publishedDate: "2026-05-06", modifiedDate: "2026-09-09", views: 0, lang: "en", content: samsungVsHynix },
  { slug: "chip-stock-tax-guide", title: "Korean Share-Sale Tax: Residence, ISA and Employee Shares", description: "Define the taxable event, account and shareholder scope; separate ISA contribution limits from profit exemptions and compensation from a later sale.", category: "Stocks", tags: ["stock tax", "capital gains", "ISA", "pension", "tax residence"], level: "Intermediate", publishedDate: "2026-05-06", modifiedDate: "2026-09-09", views: 0, lang: "en", content: chipStockTax },
  { slug: "kospi-leader-stock-strategy", title: "DCA vs Lump Sum: A Transparent Share-Purchase Example", description: "Compare equal cash budgets with explicit price assumptions, then identify what a real backtest and a personal savings plan would require.", category: "Stocks", tags: ["DCA", "lump sum", "Samsung Electronics", "SK Hynix", "saving"], level: "Intermediate", publishedDate: "2026-05-06", modifiedDate: "2026-09-09", views: 0, lang: "en", content: kospiLeaderStrategy },
];
