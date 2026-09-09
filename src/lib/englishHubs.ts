import { ENGLISH_TOOLS, type EnglishToolSlug } from "./englishTools";

type Task = { title: string; description: string; href: string };
type Hub = { path: string; title: string; description: string; tasks: Task[]; sections: { title: string; text: string; points?: string[] }[]; reading: Task[] };
const tool = (slug: EnglishToolSlug): Task => {
  const entry = ENGLISH_TOOLS.find(item => item.slug === slug)!;
  return { title: entry.title, description: entry.description, href: `/en/tools/${slug}` };
};
const guide = (slug: string, title: string, description: string): Task => ({ href: `/en/guides/${slug}`, title, description });
const salary: Task = { href: "/en#calculator", title: "Korea take-home salary estimate", description: "A simplified 2026 regular-employee estimate in KRW, including modeled insurance and national/local tax." };
const flat: Task = { href: "/en/flat-tax", title: "Korean income-tax comparison", description: "Compare a limited progressive model with the foreign-employee flat method; eligibility is separate." };
const currency: Task = { href: "/en/salary-converter", title: "Gross salary currency converter", description: "Convert annual KRW pay using editable exchange rates; no overseas tax or cost-of-living model." };

export const ENGLISH_HUBS = {
  bonus: {
    path: "/en/bonus", title: "Bonuses and stock awards", description: "Work out what a bonus notice actually promises before turning it into a spending plan. Separate the employer's rules, your assumptions and the gross arithmetic.",
    tasks: [tool("bonus"), tool("offer-compare"), flat],
    sections: [
      { title: "Start with the pay base", text: "A percentage of annual base salary is different from the same percentage of monthly basic pay. The gross bonus tool uses annual base salary. Convert the amount in your notice to that basis before entering a percentage; do not substitute total compensation if the employer uses a narrower definition.", points: ["Record the relevant performance year, payment date and eligible employment period.", "Separate guaranteed cash from a discretionary or performance-dependent amount.", "Check whether a quoted amount is before tax, after withholding or a share valuation."] },
      { title: "An example, not a company payout forecast", text: "An assumed 10% bonus on annual base pay of 60,000 is 6,000 in the same currency. An additional fixed 1,000 produces 7,000 gross. Neither the percentage nor the fixed amount establishes employer eligibility. Tax, insurance, vesting and payment timing are separate questions." },
      { title: "Shares are not the same as cash", text: "For an award, collect the grant notice, vesting conditions, share count and valuation date. An illustrative market value can change before shares are available to sell. Keep employment-related tax treatment separate from any later share-sale treatment. The English tools do not predict a stock price or decide grant eligibility." },
    ],
    reading: [guide("samsung-employee-rsu-stock", "Read a Samsung stock-award notice", "Distinguish grant, vesting, sale and company-specific conditions."), guide("sk-hynix-employee-bonus-stock", "Read PS and PI bonus information", "Identify the base, period and documents behind a bonus figure."), guide("year-end-tax-deductions-guide", "Understand year-end reconciliation", "A withheld amount and final annual tax are different.")],
  },
  calculators: {
    path: "/en/calculators", title: "English calculators", description: "Choose by the result you need: Korean take-home pay, a limited tax comparison, currency conversion or a planning calculation in one currency.",
    tasks: [salary, flat, currency, ...ENGLISH_TOOLS.map(entry => tool(entry.slug))],
    sections: [
      { title: "Three different calculation boundaries", text: "The Korea salary form models regular-employee deductions in KRW. The flat-tax tool compares two limited annual income-tax methods. The general planning tools use your amounts and assumptions without choosing a country's tax or benefit rules. A familiar currency symbol does not turn a gross model into a local payroll engine." },
      { title: "Keep inputs comparable", text: "Use one currency, one period and a consistent gross or spendable basis within a calculation. For an hourly conversion, use paid hours and paid weeks. For an offer, separate annual recurring pay from a one-time amount. For loan or savings scenarios, check payment timing and whether fees or tax are included.", points: ["Start from a written offer, payslip, bill or dated product quotation.", "Read the formula and exclusions beside the result.", "Try a changed assumption and compare the outcome; a single scenario is not a forecast."] },
      { title: "Saving, sharing and checking a result", text: "The Korean take-home form can save an estimate in this browser when you explicitly choose Save. A normal page share contains no calculator inputs. Where a result preview is offered, review the amounts before approving the text for sharing. Recheck the inputs after any edit; a calculator result does not replace a payroll statement, contract or lender decision." },
    ],
    reading: [{ href: "/en/help", title: "Methods and official sources", description: "Review assumptions, tax-year boundaries and insurance coverage." }, { href: "/en/dashboard", title: "My dashboard", description: "Review or delete English salary estimates saved in this browser." }],
  },
  salary: {
    path: "/en/salary-db", title: "Understand salary data and compare offers", description: "Read Korean compensation figures in English: what an employee average includes, what a new-hire offer says and why neither is automatically your take-home pay.",
    tasks: [salary, tool("offer-compare"), tool("hourly-to-salary"), tool("salary-raise"), currency],
    sections: [
      { title: "An employee average is not an offer", text: "A company's disclosed employee average can combine different roles, tenure levels, sites and bonus outcomes for the reporting period. It does not identify a new graduate's base salary or a particular foreign employee's package. Check the entity, year, employee scope, unit and source before comparing two figures.", points: ["Public employee average: preserve its reporting period and population.", "Advertised range: check role, location and whether variable pay is included.", "Your offer: use the written fixed salary and separate conditional components."] },
      { title: "Build a like-for-like comparison", text: "List annual fixed gross pay, expected variable bonus, one-time cash and scheduled working hours for each offer. Keep both offers in one currency; use an explicit exchange-rate assumption first if needed. Then record benefits, unpaid time, relocation, vesting and repayment clauses outside the simple cash comparison. A higher modeled hourly figure does not settle those trade-offs." },
      { title: "Coverage of this English section", text: "This is an English interpretation and offer-planning hub, not a complete translated company database. Individual company profiles and the underlying Korean listings remain in Korean unless explicitly marked otherwise. This page does not publish invented English salary rankings or transform a disclosed average into a guaranteed entry salary." },
    ],
    reading: [guide("samsung-vs-hynix-employee-comparison", "Samsung vs SK hynix: compare the offer", "Use a documented package and role-specific questions rather than a headline salary."), { href: "/salary-db", title: "Company salary database (Korean)", description: "Read the profile's source, reporting year and disclosed-versus-estimated labels. Opens Korean content." }, { href: "/en/bonus", title: "Bonus and stock-award checklist", description: "Separate guaranteed salary from variable compensation." }],
  },
  season: {
    path: "/en/season", title: "Seasonal pay and tax checklists", description: "Prepare when your job, pay or filing stage changes. A calendar month alone does not establish a tax deadline, bonus entitlement or benefit eligibility.",
    tasks: [salary, tool("bonus"), tool("offer-compare"), flat],
    sections: [
      { title: "Starting a job or receiving a new offer", text: "Before the first payslip, confirm annual gross salary, exempt pay items, standard working hours and the insurance schemes that cover you. A foreign employee may need nationality, visa or social-security-agreement checks. Save the employer's written explanation of deductions rather than assuming every standard percentage applies." },
      { title: "When a bonus is announced", text: "Record the performance period and intended payment date separately. Read the eligible-pay base and whether the amount is fixed, conditional or a share award. Run a gross scenario and ask payroll how withholding will be handled; do not use a speculative bonus as guaranteed income for a loan commitment." },
      { title: "At year-end or when leaving a job", text: "Identify the income year before collecting deduction documents. An early-year settlement normally reconciles the preceding year's employment income, while a departure may create its own payroll process. Ask for the withholding statement, insurance-coverage end date and any later settlement responsibilities. A refund needs final tax and prior withholding, not just a credit rate." },
      { title: "Find the actual application window", text: "The EITC guide distinguishes application year from income year and links the relevant NTS notices. Benefit and filing dates can depend on the application route and official extensions. Use the current notice and verify a submitted receipt; this hub does not create a new deadline or guarantee an application will qualify." },
    ],
    reading: [guide("earned-income-credit-2026", "EITC application and income years", "Read the dated NTS windows and household eligibility conditions."), guide("year-end-tax-deductions-guide", "Year-end deduction checklist", "Separate income deductions, tax credits and a refund."), guide("health-insurance-2026-guide", "Health insurance after leaving a job", "Check the first regional bill and continuation conditions.")],
  },
  money: {
    path: "/en/tools", title: "Money planning tools", description: "Compare borrowing, saving and everyday spending with transparent assumptions. Choose a currency for display and keep all amounts in that same currency.",
    tasks: ENGLISH_TOOLS.map(entry => tool(entry.slug)),
    sections: [
      { title: "Borrowing: compare the schedule", text: "For a loan, enter the principal, annual rate and term from the same quotation. A fixed monthly-payment model is different from an interest-only facility or a changing-rate agreement. Review fees, rate resets and early-repayment conditions separately. An affordable-looking payment does not establish regulatory eligibility or approval." },
      { title: "Saving: separate contributions from returns", text: "A savings goal starts with the amount and time you need. Compound-interest and financial-independence scenarios add an assumed return or withdrawal rate. Those are inputs, not promised market outcomes. Try a lower-return case and allow for tax, fees, inflation and unexpected spending outside the simple model." },
      { title: "Currency labels are not automatic conversion", text: "USD, EUR, GBP, KRW and JPY labels in these planning tools select display and rounding conventions. They do not fetch an exchange rate or convert existing inputs. If your source amounts use different currencies, convert them consistently first. The separate gross salary converter makes its rate assumption explicit." },
      { title: "Use a result as a question to check", text: "A practical next step is to compare the model with a written loan offer, an actual spending record or a savings account statement. Note what differs—fees, timing, taxes or variable returns—before deciding. Keep emergency needs and contract commitments visible rather than treating one projected total as the whole decision." },
    ],
    reading: [guide("loan-types-comparison-2026", "Loan types and renewal risks", "Mortgage, instalment loan and credit line are different obligations."), currency, { href: "/en/help", title: "Methods and limitations", description: "What the English tools do and what they leave out." }],
  },
  fun: {
    path: "/en/fun", title: "Everyday money, in perspective", description: "Turn a price into work time or divide a shared bill. These small tools make the arithmetic visible without scoring your worth or prescribing how you should spend.",
    tasks: [tool("work-time-cost"), tool("split-bill"), tool("savings-goal")],
    sections: [
      { title: "What does a purchase cost in work time?", text: "Use the spendable hourly pay you actually want to budget against. A purchase of 120 at spendable pay of 20 per hour represents six hours in the same currency. Gross hourly wage can overstate money available to spend because it comes before deductions; the work-time tool does not estimate those deductions for you." },
      { title: "Split a bill without losing the remainder", text: "Check the bill total, number of people and any optional tip or extra charge before dividing. Different currencies use different minor units, so an equal mathematical split may need a small rounding adjustment. Compare the displayed payer amounts with the total rather than independently rounding every share and assuming they will add up.", points: ["Use one currency for the full bill and every payer.", "Set the tip or additional percentage yourself; zero is not a claim about local custom.", "Confirm who actually pays each amount before transferring money."] },
      { title: "A lens, not a personal score", text: "Work time does not capture enjoyment, necessity, unpaid care or the value of rest. A shared bill can also reflect an agreement other than equal shares. Use the numbers to support a conversation, not to judge another person's income. These tools do not rank users, predict luck or promise a financial outcome." },
    ],
    reading: [{ href: "/en/tools/hourly-to-salary", title: "Convert an hourly pay schedule", description: "Check gross weekly, monthly and annual amounts from paid hours and weeks." }, { href: "/en/tools", title: "More money planning tools", description: "Explore borrowing and saving assumptions." }],
  },
} satisfies Record<string, Hub>;

export type EnglishHubId = keyof typeof ENGLISH_HUBS;
