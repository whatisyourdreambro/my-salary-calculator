import { getEnglishTool, type EnglishToolSlug } from './englishTools';
import type { EnglishHubId } from './englishHubs';

export type EnglishContentLink = { href: string; title: string; reason: string };
const tool = (slug: EnglishToolSlug, reason: string): EnglishContentLink => ({
  href: `/en/tools/${slug}`, title: getEnglishTool(slug)!.title, reason,
});
const page = (href: string, title: string, reason: string): EnglishContentLink => ({ href, title, reason });

/** These are adjacent calculation questions, independent of the current result. */
export const ENGLISH_TOOL_READING: Record<EnglishToolSlug, { context: EnglishContentLink; tools: EnglishContentLink[] }> = {
  loan: {
    context: page('/en/tools', 'Money planning methods', 'Check borrowing and saving assumptions before comparing the two.'),
    tools: [tool('savings-goal', 'Compare a purchase funded by monthly saving with the repayment schedule.'), tool('work-time-cost', 'Translate a payment into work time using spendable hourly pay.'), tool('compound-interest', 'Model the saving alternative separately; an assumed return is not a guaranteed loan-rate offset.')],
  },
  'compound-interest': {
    context: page('/en/tools', 'Money planning methods', 'Keep contributions, returns and borrowing costs separate.'),
    tools: [tool('savings-goal', 'Start from a target and date instead of an assumed monthly contribution.'), tool('fire', 'Relate an investment target to spending and an explicit withdrawal-rate assumption.'), tool('loan', 'Compare a fixed debt payment with the money available to invest, without assuming investment returns will cover it.')],
  },
  'savings-goal': {
    context: page('/en/tools', 'Money planning methods', 'Check timing, tax and fee exclusions before committing to a savings plan.'),
    tools: [tool('compound-interest', 'See how a different contribution changes the modeled final amount.'), tool('fire', 'Build a longer-term target from annual spending assumptions.'), tool('loan', 'Compare saving first with a fixed-payment borrowing scenario.')],
  },
  'hourly-to-salary': {
    context: page('/en/salary-db', 'Read salary figures and offers', 'Check paid weeks and working hours before comparing annual figures.'),
    tools: [tool('salary-raise', 'Compare current and proposed pay on the same annual basis.'), tool('offer-compare', 'Keep bonus and one-time pay separate when comparing jobs.'), tool('work-time-cost', 'Use your own spendable hourly pay to budget a purchase; gross conversion does not supply net pay.')],
  },
  'salary-raise': {
    context: page('/en/salary-db', 'Read salary figures and offers', 'A raise in recurring base pay is different from a one-time payment.'),
    tools: [tool('offer-compare', 'Compare the complete recurring and one-time offer components.'), tool('bonus', 'Calculate variable pay separately from a permanent salary increase.'), tool('hourly-to-salary', 'Check whether changed hours account for part of the pay difference.')],
  },
  bonus: {
    context: page('/en/bonus', 'Bonus and stock-award checklist', 'Verify the employer’s pay base, eligibility and payment timing before using the gross amount.'),
    tools: [tool('salary-raise', 'Compare a permanent base-pay increase with a one-time bonus.'), tool('offer-compare', 'Keep guaranteed salary and uncertain bonus assumptions in separate fields.'), tool('savings-goal', 'Plan a contribution only after allowing for withholding and other commitments.')],
  },
  'offer-compare': {
    context: page('/en/salary-db', 'Read salary figures and offers', 'Use the written package rather than treating a company average as your offer.'),
    tools: [tool('hourly-to-salary', 'Put paid hours and weeks on a comparable annual basis.'), tool('salary-raise', 'Calculate the change in recurring pay separately.'), tool('bonus', 'Check an assumed bonus against its stated base before adding it to compensation.')],
  },
  'work-time-cost': {
    context: page('/en/fun', 'Everyday money in perspective', 'Work hours are one way to discuss a purchase, not a measure of personal worth.'),
    tools: [tool('hourly-to-salary', 'Check a gross pay schedule; deductions still need separate treatment.'), tool('split-bill', 'Work out your agreed share before translating a shared purchase into work time.'), tool('savings-goal', 'Spread a planned purchase across a saving period.')],
  },
  'split-bill': {
    context: page('/en/fun', 'Everyday money in perspective', 'Agree on who pays each share before transferring money.'),
    tools: [tool('work-time-cost', 'Compare your share with spendable work hours if that helps your budget.'), tool('savings-goal', 'Set aside your portion of a future shared purchase over time.')],
  },
  fire: {
    context: page('/en/tools', 'Money planning methods', 'A withdrawal rate and return are assumptions, not a guarantee of independence.'),
    tools: [tool('compound-interest', 'Explore the contribution and return assumptions behind accumulation.'), tool('savings-goal', 'Translate an intermediate target into a monthly contribution.'), tool('work-time-cost', 'Review spending assumptions using the hourly budget you choose.')],
  },
};

/** Attach references to the paragraph they explain, preserving hub navigation. */
export const ENGLISH_HUB_SECTION_LINKS: Partial<Record<EnglishHubId, Record<string, EnglishContentLink[]>>> = {
  bonus: {
    'Start with the pay base': [tool('bonus', 'Use the annual-base percentage and fixed amount after checking the notice.')],
    'An example, not a company payout forecast': [page('/en/season', 'Pay and tax checklists', 'Keep payment dates, withholding and the relevant income year separate.')],
    'Shares are not the same as cash': [page('/en/guides/sk-hynix-employee-bonus-stock', 'Read an SK hynix bonus notice', 'Work through PS, PI and award conditions before treating a headline figure as cash.')],
  },
  salary: {
    'Build a like-for-like comparison': [tool('hourly-to-salary', 'Normalize paid hours and weeks before comparing annual figures.'), tool('salary-raise', 'Measure the recurring base-pay change separately from benefits.')],
    'Coverage of this English section': [page('/en/bonus', 'Bonus and stock-award checklist', 'Use the employer’s terms to distinguish fixed and variable compensation.')],
  },
  season: {
    'Starting a job or receiving a new offer': [page('/en/salary-db', 'Salary data and offers', 'Distinguish an employee average from your written package.')],
    'When a bonus is announced': [page('/en/bonus', 'Bonus and stock-award checklist', 'Identify the eligible pay base before modeling a payment.'), tool('bonus', 'Calculate a gross scenario with the confirmed pay base.')],
  },
  money: {
    'Borrowing: compare the schedule': [tool('loan', 'Calculate a fixed-payment schedule from one quotation.'), page('/en/guides/loan-types-comparison-2026', 'Loan types and renewal risks', 'Check when a mortgage, instalment loan or credit line needs a different model.')],
    'Saving: separate contributions from returns': [tool('savings-goal', 'Start with the amount and date you need.'), tool('compound-interest', 'Change contributions and the assumed return independently.'), tool('fire', 'Relate a longer-term target to spending and a withdrawal-rate assumption.')],
    'Use a result as a question to check': [page('/en/fun', 'Everyday money in perspective', 'Discuss work-time costs and shared spending without turning a result into a personal score.'), tool('split-bill', 'Reconcile each payer’s amount with the actual shared bill.')],
  },
  fun: {
    'What does a purchase cost in work time?': [tool('work-time-cost', 'Use a purchase price and the spendable hourly amount you choose.')],
    'Split a bill without losing the remainder': [tool('split-bill', 'Check the rounded payer amounts against the full bill.')],
  },
};
