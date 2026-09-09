import type { EnglishToolResult } from './englishToolModels';
import { englishCurrencyDigits, type EnglishCurrency, type EnglishToolSlug } from './englishTools';

export type EnglishResultTaskSource = EnglishToolSlug | 'salary';
export interface EnglishResultTask { href: string; title: string; description: string; }
export interface EnglishResultTaskPlan { context: string; items: readonly EnglishResultTask[]; }

const task = (slug: EnglishToolSlug, title: string, description: string): EnglishResultTask => ({ href: `/en/tools/${slug}`, title, description });
const savings = task('savings-goal', 'Plan a monthly saving amount', 'Choose a target and deadline, then check the contribution against money left after essential spending. Start with a 0% return if you do not want to rely on growth.');
const contribution = task('compound-interest', 'Test a different saving path', 'Compare your own monthly contribution and a lower or zero return. Keep contribution timing, currency and the time horizon consistent.');
const offers = task('offer-compare', 'Compare total cash and working hours', 'Separate base pay from a cash bonus, then compare annual cash and pay per scheduled hour. Benefits and take-home pay still need a separate check.');

/** Only on-screen guidance changes with results. No result values enter link URLs or telemetry. */
export function getEnglishToolNextTasks(slug: EnglishToolSlug, result: EnglishToolResult | null, currency: EnglishCurrency): EnglishResultTaskPlan | null {
  if (!result || result.metrics.length === 0 || result.metrics.some(item => typeof item.value === 'number' && !Number.isFinite(item.value))) return null;
  const value = (key: string) => { const number = result.metrics.find(item => item.key === key)?.value; return typeof number === 'number' && Number.isFinite(number) ? number : null; };
  // Use displayed precision for cash comparisons so the explanation does not
  // claim a visible difference when both amounts round to the same figure.
  const cashSign = (number: number) => Math.sign(number) * Math.sign(Math.round(Math.abs(number) * 10 ** englishCurrencyDigits(currency)));
  switch (slug) {
    case 'loan': {
      const interest = value('interest'); if (interest === null) return null;
      return { context: cashSign(interest) > 0 ? 'Your payment includes principal and interest. A useful next check is how it fits around other spending.' : 'The scenario has no displayed interest. The principal payments still need room in your budget.', items: [
        task('savings-goal', 'Plan a repayment buffer', 'Set aside a cash target for scheduled payments. Compare the required saving amount with money left after your other essentials.'),
        task('work-time-cost', 'Express a payment in working hours', 'Enter one monthly payment as the cost and your own spendable hourly pay. Gross hourly pay is not the same as money available to spend.'),
      ] };
    }
    case 'compound-interest': {
      const gain = value('gain'); if (gain === null) return null;
      return { context: cashSign(gain) < 0 ? 'Under this return assumption, the balance ends below total contributions. Check a target without assuming investment gains.' : 'This balance depends on the contribution and return assumptions. Turn it into a concrete target before treating it as a plan.', items: [savings,
        task('fire', 'Explore a spending-based long-term target', 'Start from the annual spending you want assets to fund. The withdrawal rate is your assumption, not a safe-retirement guarantee.'),
      ] };
    }
    case 'savings-goal': {
      const monthly = value('monthly'); if (monthly === null) return null;
      return { context: monthly === 0 ? 'No extra monthly contribution is needed under this scenario. Check how much that conclusion depends on the return assumption.' : 'The required contribution is a target, not a check that your budget can afford it.', items: monthly === 0 ? [contribution] : [contribution,
        task('work-time-cost', 'Put the saving amount in working hours', 'Use one monthly contribution as the cost and enter your own after-deduction hourly pay. This adds perspective without assuming a tax rate.'),
      ] };
    }
    case 'hourly-to-salary': {
      const annual = value('annual'); if (annual === null || annual <= 0) return null;
      return { context: 'You now have an annual gross-pay basis. Keep paid weeks and hours explicit when comparing a change in pay.', items: [
        task('salary-raise', 'Check a proposed raise', 'Use the annual gross figure as the starting salary, then enter a raise and your own inflation assumption.'), offers,
      ] };
    }
    case 'salary-raise': {
      const real = value('real'); if (real === null) return null;
      return { context: real < -0.0005 ? 'The raise does not keep up with the inflation assumption in this scenario. Compare the whole compensation package as well as the headline percentage.' : 'The gross raise does not tell you the take-home change or the value of the whole package.', items: [offers,
        task('bonus', 'Separate base pay from a bonus', 'Model a cash bonus on an annual-base basis. Keep a target bonus separate from guaranteed salary and avoid counting the same payment twice.'),
      ] };
    }
    case 'bonus': {
      const bonus = value('bonus'); if (bonus === null) return null;
      return { context: cashSign(bonus) > 0 ? 'The bonus is a gross cash scenario, not guaranteed spendable income. Compare it separately from base pay.' : 'This scenario adds no displayed bonus. You can still compare the base-pay package and working hours.', items: [offers,
        task('salary-raise', 'Compare a change in guaranteed base pay', 'Use annual base salary without the bonus. This keeps a recurring pay change separate from a one-off or uncertain payout.'),
      ] };
    }
    case 'offer-compare': {
      const annual = value('difference'); const hourly = value('hourlyDifference'); if (annual === null || hourly === null) return null;
      const opposed = cashSign(annual) * cashSign(hourly) < 0;
      return { context: opposed ? 'The higher annual-cash offer has lower pay per scheduled hour. Review the working-time trade-off before choosing.' : 'Annual cash and hourly cash cover only part of an offer. Check the work schedule and guaranteed base-pay change separately.', items: [
        task('hourly-to-salary', 'Check a different work schedule', 'Rebuild a gross-pay scenario from a rate, paid hours and paid weeks. Do not substitute gross hourly cash for spendable hourly pay.'),
        task('salary-raise', 'Compare the base-salary change', 'Compare the two annual base salaries separately from bonuses. The raise tool does not estimate either offer’s take-home pay.'),
      ] };
    }
    case 'work-time-cost': {
      const price = value('price'); if (price === null || price <= 0) return null;
      return { context: 'Working-time cost puts the purchase in perspective. A saving schedule can help you check when to pay for it without assuming borrowing.', items: [savings] };
    }
    case 'split-bill': {
      const total = value('total'); if (total === null || total <= 0) return null;
      return { context: 'Assign the displayed rounding amounts before paying. If useful, put your own assigned share in a work-time context.', items: [
        task('work-time-cost', 'Check the working-time cost of your share', 'Enter only the share you will pay, not the whole bill, together with your own spendable hourly pay.'),
      ] };
    }
    case 'fire': {
      const gap = value('gap'); if (gap === null) return null;
      return { context: gap === 0 ? 'Current assets meet this selected ratio target. That does not establish that retiring is safe; test a less favorable accumulation scenario too.' : 'This long-term target is an illustration. A nearer cash milestone is easier to check against your current budget.', items: gap === 0 ? [contribution] : [
        task('savings-goal', 'Set a nearer saving milestone', 'Choose a manageable portion of the long-term target and a deadline. A required contribution is not a guarantee that it fits your budget.'), contribution,
      ] };
    }
  }
}

export function getEnglishSalaryNextTasks(result: { netPay: number; totalDeductions: number } | null): EnglishResultTaskPlan | null {
  if (!result || !Number.isFinite(result.netPay) || !Number.isFinite(result.totalDeductions) || result.netPay < 0 || result.totalDeductions < 0) return null;
  return { context: result.netPay > 0 ? 'Use estimated take-home pay as a starting point, then check the deductions and a saving target against your actual payslip and essential spending.' : 'This scenario has no estimated take-home pay. Review the inputs and model before using it for a budget.', items: [
    { href: '/en/guides/four-major-insurance-complete', title: 'Understand the insurance deductions', description: 'Check what the four employee insurance amounts cover. Nationality, age, visa and coverage exceptions are not decided by this salary estimate.' },
    ...(result.netPay > 0 ? [savings] : []),
  ] };
}
