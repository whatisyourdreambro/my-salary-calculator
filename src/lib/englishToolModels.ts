import { englishCurrencyDigits, isEnglishCurrency, type EnglishCurrency, type EnglishToolSlug } from './englishTools';

export interface EnglishToolField {
  key: string; label: string; defaultValue: string; kind: 'money' | 'percent' | 'number'; min: number; max: number; precision: number; help: string;
}
export interface EnglishToolDetails {
  fields: EnglishToolField[]; formula: string; assumptions: string[]; example: string; faq: { question: string; answer: string }[];
}
const money = (key: string, label: string, value: number, help: string, min = 0): EnglishToolField => ({ key, label, defaultValue: String(value), kind: 'money', min, max: 1e12, precision: 2, help });
const number = (key: string, label: string, value: number, min: number, max: number, help: string, precision = 0): EnglishToolField => ({ key, label, defaultValue: String(value), kind: 'number', min, max, precision, help });
const percent = (key: string, label: string, value: number, min: number, max: number, help: string): EnglishToolField => ({ key, label, defaultValue: String(value), kind: 'percent', min, max, precision: 2, help });
const genericFaq = { question: 'Does changing the currency convert my amounts?', answer: 'No. Currency selects the unit and rounding used to display the numbers you enter. Enter every amount in that same currency. No exchange rate, local tax rule or benefit entitlement is inferred.' };
export const ENGLISH_TOOL_DETAILS: Record<EnglishToolSlug, EnglishToolDetails> = {
  loan: {
    fields: [money('principal', 'Loan amount', 20000, 'The amount borrowed, excluding fees.', 1), percent('annualRate', 'Annual nominal interest rate (%)', 5, 0, 100, 'Fixed rate divided by 12. This is not an APR comparison including fees.'), number('months', 'Repayment term (months)', 60, 1, 600, 'Monthly payments start one month after borrowing.')],
    formula: 'Monthly payment = P × r ÷ (1 − (1 + r)^−n), where r = annual rate ÷ 1,200. At 0%: payment = P ÷ n.',
    assumptions: ['Fixed rate and equal end-of-month payments; no grace period, fees, insurance or early repayments.', 'Displayed amounts are rounded. A lender’s installment and final payment rounding may differ.'],
    example: 'Example: a 12,000 loan at 0% repaid over 12 months has a monthly payment of 1,000 and no interest, in any single selected currency.',
    faq: [{ question: 'Is this my lender’s final quote?', answer: 'No. It is a payment illustration from your inputs. Check the actual rate definition, charges, payment dates and contract with the lender.' }, genericFaq],
  },
  'compound-interest': {
    fields: [money('principal', 'Initial investment', 10000, 'Starting balance before investment returns.'), money('monthly', 'Monthly contribution', 200, 'Added at the end of each month.'), percent('annualRate', 'Assumed annual nominal return (%)', 6, -50, 50, 'An editable constant assumption, not a forecast or guaranteed return.'), number('years', 'Time horizon (years)', 10, 1, 50, 'Whole years, with monthly compounding.')],
    formula: 'Future value = P × (1 + r)^n + C × ((1 + r)^n − 1) ÷ r. Here r = annual assumption ÷ 1,200; n = years × 12. At 0%: P + C × n.',
    assumptions: ['End-of-month contributions and a constant nominal return compounded monthly.', 'Taxes, fees and inflation are excluded. Negative returns are allowed; actual investment paths fluctuate.'],
    example: 'Example: 1,000 initially plus 100 each month for one year at 0% becomes 2,200, all from contributions.',
    faq: [{ question: 'Is the assumed return a prediction?', answer: 'No. Change it to compare scenarios, including negative returns. The model does not estimate market probabilities or investment suitability.' }, genericFaq],
  },
  'savings-goal': {
    fields: [money('current', 'Current savings', 1000, 'Already available for this goal.'), money('target', 'Target amount', 10000, 'The amount you want at the end of the term.', 1), percent('annualRate', 'Assumed annual nominal return (%)', 0, 0, 30, 'Use 0% to exclude return assumptions.'), number('months', 'Months until the target', 24, 1, 600, 'Contributions occur at the end of each month.')],
    formula: 'Required monthly contribution = max(0, (target − current × (1 + r)^n) ÷ annuity factor). The factor is ((1 + r)^n − 1) ÷ r, or n at 0%.',
    assumptions: ['The required contribution is rounded up to the selected currency’s smallest displayed unit.', 'Constant return; no taxes, fees, withdrawals or inflation. Having enough under the assumption does not guarantee a future balance.'],
    example: 'Example: current savings of 1,000, a target of 2,200 and 12 months at 0% require 100 per month.',
    faq: [{ question: 'Why can the required contribution be zero?', answer: 'Your existing savings already reach the target under the selected return assumption. Use 0% to check the target without relying on growth.' }, genericFaq],
  },
  'hourly-to-salary': {
    fields: [money('hourly', 'Gross hourly rate', 25, 'Before taxes and employee contributions.'), number('hours', 'Paid hours per week', 40, 0.25, 168, 'Include only hours paid at this rate.', 2), number('weeks', 'Paid weeks per year', 52, 1, 52, 'Account for unpaid weeks yourself.', 2)],
    formula: 'Annual gross pay = hourly rate × paid hours per week × paid weeks per year. Monthly average = annual pay ÷ 12.',
    assumptions: ['One hourly rate for all entered paid hours; no automatic overtime premium, paid-leave entitlement or bonus.', 'Monthly pay is an annual average, not the amount on a particular payslip.'],
    example: 'Example: 25 per hour × 40 paid hours × 52 paid weeks = 52,000 a year, or 4,333.33 per month before deductions.',
    faq: [{ question: 'Does this apply my country’s overtime law?', answer: 'No. Overtime rules depend on the jurisdiction and contract. Enter a schedule paid at one rate, or calculate separate rates independently.' }, genericFaq],
  },
  'salary-raise': {
    fields: [money('annual', 'Current annual gross salary', 60000, 'Exclude any bonus you are calculating separately.'), percent('raise', 'Proposed raise (%)', 5, -100, 200, 'Negative values represent a pay cut.'), percent('inflation', 'Assumed annual inflation (%)', 2, -50, 100, 'Used only for the purchasing-power comparison; not a forecast.')],
    formula: 'New salary = current salary × (1 + raise ÷ 100). Inflation-adjusted change = ((1 + raise ÷ 100) ÷ (1 + inflation ÷ 100) − 1) × 100%.',
    assumptions: ['A single full-year pay change with no change in hours, bonus or employment period.', 'Gross pay only. Personal spending patterns may differ from the inflation assumption.'],
    example: 'Example: a 5% raise on 60,000 adds 3,000 a year or 250 per month. With 2% inflation, the relative purchasing-power change is about 2.94%.',
    faq: [{ question: 'Is my take-home increase the same as the gross increase?', answer: 'Usually it need not be. This tool does not calculate tax, insurance or benefit deductions. Use a jurisdiction-specific model or your payslip for take-home pay.' }, genericFaq],
  },
  bonus: {
    fields: [money('annual', 'Annual base salary', 60000, 'The percentage below applies to this annual base, not monthly basic pay.'), percent('bonusPercent', 'Bonus as a percentage of annual base (%)', 10, 0, 500, 'Enter the percentage specified by your own plan.'), money('fixed', 'Additional fixed bonus', 0, 'An amount in addition to the percentage bonus.')],
    formula: 'Gross bonus = annual base salary × bonus percentage ÷ 100 + additional fixed bonus. Total annual cash = annual base + gross bonus.',
    assumptions: ['This is a user-defined cash bonus, not a company payout policy or an entitlement.', 'Taxes, social insurance, stock awards and vesting are excluded.'],
    example: 'Example: 60,000 annual base × 10% plus a 1,000 fixed bonus gives a 7,000 gross bonus and 67,000 total annual cash.',
    faq: [{ question: 'My company quotes a percentage of monthly basic pay. Can I use that percentage here?', answer: 'Not directly. This tool’s percentage is explicitly based on annual base salary. Convert the plan to the same basis first, or enter the known cash amount as the fixed bonus with a 0% percentage.' }, genericFaq],
  },
  'offer-compare': {
    fields: [money('salaryA', 'Offer A annual base salary', 60000, 'Gross annual amount in the common selected currency.'), money('bonusA', 'Offer A annual cash bonus', 5000, 'Use a scenario amount; a target bonus may not be guaranteed.'), number('hoursA', 'Offer A work hours per week', 40, 0.25, 168, 'Your scheduled work-hours assumption.', 2), money('salaryB', 'Offer B annual base salary', 70000, 'Use the same currency and annual basis as offer A.'), money('bonusB', 'Offer B annual cash bonus', 2000, 'Exclude stock, benefits and employer contributions.'), number('hoursB', 'Offer B work hours per week', 45, 0.25, 168, 'Your scheduled work-hours assumption.', 2), number('weeks', 'Working weeks per year (both offers)', 52, 1, 52, 'Use the same work-year assumption to compare the two offers.', 2)],
    formula: 'Annual cash = base + cash bonus. Cash per scheduled work hour = annual cash ÷ (weekly work hours × working weeks). Differences below are B minus A.',
    assumptions: ['Two gross cash scenarios in the same currency. Ranking by cash is not a recommendation to accept a job.', 'No local taxes, benefits, equity, commuting, job security or bonus probabilities are estimated.'],
    example: 'Example: offer A totals 65,000 at 40 × 52 hours (31.25/hour); offer B totals 72,000 at 45 × 52 hours (30.77/hour). B has higher annual cash while A has higher cash per scheduled hour.',
    faq: [{ question: 'Can the higher annual offer have lower hourly compensation?', answer: 'Yes. More scheduled hours can outweigh the annual cash difference. Compare the two measures separately, then evaluate benefits, taxes and working conditions yourself.' }, genericFaq],
  },
  'work-time-cost': {
    fields: [money('price', 'Purchase price', 300, 'Total price you expect to pay.'), money('hourly', 'Your spendable hourly pay', 20, 'Enter your own after-deduction hourly amount. This tool does not calculate it.', 0.01), number('hoursPerDay', 'Work hours per day', 8, 0.25, 24, 'Only for expressing the answer in equivalent working days.', 2)],
    formula: 'Equivalent work hours = price ÷ your spendable hourly pay. Equivalent work days = hours ÷ work hours per day.',
    assumptions: ['Uses the after-deduction pay you provide. It does not infer taxes or the value of your free time.', 'No interest, purchase financing or future wage change. This is an arithmetic comparison, not an affordability recommendation.'],
    example: 'Example: a 300 purchase with spendable pay of 20 per hour equals 15 work hours, or 1.875 eight-hour work days.',
    faq: [{ question: 'What if I only know my gross hourly wage?', answer: 'You can explore a gross-pay comparison, but it will not represent spendable pay. For a spending comparison, first obtain an after-deduction figure from your own pay records.' }, genericFaq],
  },
  'split-bill': {
    fields: [money('bill', 'Bill subtotal', 100, 'Before the optional percentages below.'), number('people', 'Number of people', 3, 1, 1000, 'Whole people, with an equal split.'), percent('tip', 'Optional tip (%)', 0, 0, 100, 'Applied to the subtotal only.'), percent('charge', 'Optional added charge (%)', 0, 0, 100, 'A charge you supply, applied to the subtotal. Use 0 if already included.')],
    formula: 'Total = subtotal × (1 + tip ÷ 100 + added charge ÷ 100). Round the total to minor currency units; divide the units equally and distribute the remainder one unit at a time.',
    assumptions: ['No default local tax or tip rate. Tip and added charge both use the subtotal, without compounding.', 'USD/EUR/GBP use cents; KRW/JPY use whole units. This does not apply special local cash-rounding rules.'],
    example: 'Example: USD 100 split three ways with no extras is USD 33.34 for one person and USD 33.33 for two. The shares add back to USD 100.00.',
    faq: [{ question: 'Why are there two payment amounts?', answer: 'The rounded bill may not divide evenly. Assigning the one-unit remainder to a few people makes the individual payments reconcile exactly with the total.' }, genericFaq],
  },
  fire: {
    fields: [money('spending', 'Annual spending to fund', 30000, 'Include the spending and taxes your plan needs to cover.', 1), percent('withdrawal', 'Assumed annual withdrawal rate (%)', 4, 1, 20, 'An editable planning ratio, not a guaranteed safe rate.'), money('current', 'Current invested assets', 100000, 'Assets allocated to this plan, not gross property value.'), money('contribution', 'Annual investment contribution', 12000, 'Added at the end of each year.'), percent('annualRate', 'Assumed annual return (%)', 5, -20, 30, 'A constant annual assumption. Use a consistent nominal or inflation-adjusted basis.')],
    formula: 'Target = annual spending ÷ (withdrawal rate ÷ 100). Each year: assets = previous assets × (1 + return ÷ 100) + annual contribution. Check at most 80 years.',
    assumptions: ['The target is a withdrawal-ratio illustration, not retirement advice or a guarantee that money will last.', 'Spending and contributions remain constant in your chosen basis. No tax, fee, inflation, return volatility or sequence-risk model is added.', 'The years shown use your constant accumulation assumptions and exclude withdrawals before reaching the target.'],
    example: 'Example: annual spending of 30,000 divided by a 4% withdrawal assumption gives a 750,000 target. Changing the assumption to 3% raises that target to 1,000,000.',
    faq: [{ question: 'Is 4% safe for everyone?', answer: 'No. It is only the editable default in this illustration. Retirement length, market path, taxes and spending flexibility affect outcomes. The tool does not establish a safe withdrawal rate.' }, genericFaq],
  },
};

export interface EnglishToolMetric { key: string; label: string; value: number | string; kind: 'money' | 'number' | 'percent'; }
export interface EnglishToolResult { metrics: EnglishToolMetric[]; explanations: string[]; }
export type EnglishToolValues = Record<string, number>;

function validFieldNumber(field: EnglishToolField, value: number, currency: EnglishCurrency) {
  const precision = field.kind === 'money' ? englishCurrencyDigits(currency) : field.precision;
  return Number.isFinite(value) && value >= field.min && value <= field.max && Number(value.toFixed(precision)) === value;
}

export function englishToolFieldError(field: EnglishToolField, text: string, currency: EnglishCurrency): string | null {
  const precision = field.kind === 'money' ? englishCurrencyDigits(currency) : field.precision;
  if (!text) return 'Enter a value. An empty field is not treated as zero.';
  if (text.length > 24 || !/^-?\d+(?:\.\d+)?$/.test(text)) return 'Use digits and a decimal point only; no commas, symbols or scientific notation.';
  if ((text.split('.')[1]?.length ?? 0) > precision) return precision === 0 ? 'Enter a whole number for this field and currency.' : `Use at most ${precision} decimal places.`;
  if (!validFieldNumber(field, Number(text), currency)) return `Enter a value from ${field.min.toLocaleString('en-US')} to ${field.max.toLocaleString('en-US')}.`;
  return null;
}

export function parseEnglishToolInputs(slug: EnglishToolSlug, raw: Record<string, string>, currency: EnglishCurrency): EnglishToolValues | null {
  if (!isEnglishCurrency(currency) || !raw || typeof raw !== 'object') return null;
  const fields = ENGLISH_TOOL_DETAILS[slug]?.fields;
  if (!fields || Object.keys(raw).length !== fields.length) return null;
  const values: EnglishToolValues = {};
  for (const field of fields) {
    const text = raw[field.key];
    if (typeof text !== 'string' || englishToolFieldError(field, text, currency)) return null;
    const value = Number(text);
    if (!Number.isFinite(value) || value < field.min || value > field.max) return null;
    values[field.key] = value;
  }
  return values;
}

const metric = (key: string, label: string, value: number | string, kind: EnglishToolMetric['kind'] = 'money'): EnglishToolMetric => ({ key, label, value, kind });
const annuity = (monthlyRate: number, periods: number) => monthlyRate === 0 ? periods : Math.expm1(periods * Math.log1p(monthlyRate)) / monthlyRate;
const MAX_OUTPUT = Number.MAX_SAFE_INTEGER / 100;

/** Generic arithmetic only. No country, tax, social-insurance or exchange-rate inference. */
export function calculateEnglishTool(slug: EnglishToolSlug, values: EnglishToolValues, currency: EnglishCurrency): EnglishToolResult | null {
  if (!isEnglishCurrency(currency) || !values || typeof values !== 'object') return null;
  const fields = ENGLISH_TOOL_DETAILS[slug]?.fields;
  if (!fields || Object.keys(values).length !== fields.length || fields.some(field => !validFieldNumber(field, values[field.key], currency))) return null;
  const v = values;
  let metrics: EnglishToolMetric[] = [];
  const explanations: string[] = [];
  switch (slug) {
    case 'loan': {
      const r = v.annualRate / 1200;
      const payment = r === 0 ? v.principal / v.months : v.principal * r / -Math.expm1(-v.months * Math.log1p(r));
      const total = payment * v.months;
      metrics = [metric('payment', 'Monthly payment', payment), metric('interest', 'Total interest', Math.max(0, total - v.principal)), metric('total', 'Total repayment', total)];
      explanations.push('The same payment is made each month. Principal plus total interest equals the unrounded total repayment.');
      break;
    }
    case 'compound-interest': {
      const n = v.years * 12; const r = v.annualRate / 1200;
      const balance = v.principal * Math.exp(n * Math.log1p(r)) + v.monthly * annuity(r, n);
      const contributions = v.principal + v.monthly * n;
      metrics = [metric('balance', 'Illustrated future balance', balance), metric('contributions', 'Total amount contributed', contributions), metric('gain', 'Gain or loss under the assumption', balance - contributions)];
      explanations.push('A negative gain means the constant return assumption reduces the contributed balance. All amounts are before taxes and fees.');
      break;
    }
    case 'savings-goal': {
      const r = v.annualRate / 1200; const growth = Math.exp(v.months * Math.log1p(r));
      const required = Math.max(0, (v.target - v.current * growth) / annuity(r, v.months));
      const scale = 10 ** englishCurrencyDigits(currency);
      const monthly = Math.max(0, Math.ceil(required * scale - 1e-8) / scale);
      metrics = [metric('monthly', 'Required monthly contribution', monthly), metric('balance', 'Balance with rounded contributions', v.current * growth + monthly * annuity(r, v.months)), metric('without', 'Existing savings with assumed growth', v.current * growth)];
      explanations.push('The monthly contribution is rounded upward so the illustrated balance does not fall below the target because of display rounding.');
      break;
    }
    case 'hourly-to-salary': {
      const weekly = v.hourly * v.hours; const annual = weekly * v.weeks;
      metrics = [metric('annual', 'Annual gross pay', annual), metric('monthly', 'Average monthly gross pay', annual / 12), metric('weekly', 'Gross pay per paid week', weekly), metric('hours', 'Paid hours per year', v.hours * v.weeks, 'number')];
      break;
    }
    case 'salary-raise': {
      const annual = v.annual * (1 + v.raise / 100);
      metrics = [metric('annual', 'New annual gross salary', annual), metric('increase', 'Annual gross change', annual - v.annual), metric('monthly', 'Average monthly gross change', (annual - v.annual) / 12), metric('real', 'Inflation-adjusted relative change', ((1 + v.raise / 100) / (1 + v.inflation / 100) - 1) * 100, 'percent')];
      explanations.push('The inflation-adjusted percentage compares the two assumptions. It is not an estimate of your after-tax or personal cost-of-living change.');
      break;
    }
    case 'bonus': {
      const percentageBonus = v.annual * v.bonusPercent / 100; const bonus = percentageBonus + v.fixed;
      metrics = [metric('bonus', 'Gross cash bonus', bonus), metric('percentage', 'Percentage-based part', percentageBonus), metric('fixed', 'Additional fixed part', v.fixed), metric('annual', 'Total annual gross cash', v.annual + bonus)];
      explanations.push('The percentage and fixed parts are added once. This tool does not decide whether the bonus will be paid.');
      break;
    }
    case 'offer-compare': {
      const a = v.salaryA + v.bonusA; const b = v.salaryB + v.bonusB;
      const hourlyA = a / (v.hoursA * v.weeks); const hourlyB = b / (v.hoursB * v.weeks);
      metrics = [metric('annualA', 'Offer A annual gross cash', a), metric('annualB', 'Offer B annual gross cash', b), metric('hourlyA', 'Offer A cash per scheduled hour', hourlyA), metric('hourlyB', 'Offer B cash per scheduled hour', hourlyB), metric('difference', 'Annual cash difference (B − A)', b - a), metric('hourlyDifference', 'Hourly cash difference (B − A)', hourlyB - hourlyA)];
      explanations.push(a === b ? 'Annual cash is equal.' : `Offer ${b > a ? 'B' : 'A'} has higher annual gross cash.`, Math.abs(hourlyA - hourlyB) < 1e-9 ? 'Cash per scheduled hour is equal.' : `Offer ${hourlyB > hourlyA ? 'B' : 'A'} has higher cash per scheduled hour.`, 'Neither comparison is an overall job recommendation.');
      break;
    }
    case 'work-time-cost': {
      const hours = v.price / v.hourly;
      metrics = [metric('hours', 'Equivalent work hours', hours, 'number'), metric('days', 'Equivalent working days', hours / v.hoursPerDay, 'number'), metric('price', 'Purchase price', v.price)];
      explanations.push('These are equivalent paid working hours using your entered spendable pay, not elapsed calendar time.');
      break;
    }
    case 'split-bill': {
      const scale = 10 ** englishCurrencyDigits(currency);
      const totalUnits = Math.round(v.bill * (1 + v.tip / 100 + v.charge / 100) * scale);
      if (!Number.isSafeInteger(totalUnits)) return null;
      const lowerUnits = Math.floor(totalUnits / v.people); const remainder = totalUnits % v.people;
      metrics = [metric('total', 'Rounded bill including extras', totalUnits / scale), metric('lower', 'Standard payment per person', lowerUnits / scale), metric('upper', 'Payment for a remainder recipient', (lowerUnits + (remainder > 0 ? 1 : 0)) / scale), metric('remainder', 'People assigned one rounding unit', remainder, 'number')];
      explanations.push(remainder ? `${v.people - remainder} people pay the standard amount; ${remainder} people pay one smallest currency unit more. The individual shares add up to the rounded total.` : `All ${v.people} people pay the same amount. The individual shares add up to the rounded total.`);
      break;
    }
    case 'fire': {
      const target = v.spending / (v.withdrawal / 100); let assets = v.current; let years = 0;
      while (assets < target && years < 80) { assets = assets * (1 + v.annualRate / 100) + v.contribution; years += 1; }
      metrics = [metric('target', 'Investment target under your ratio', target), metric('gap', 'Current gap to target', Math.max(0, target - v.current)), metric('progress', 'Current assets as a share of target', v.current / target * 100, 'percent'), metric('years', 'Whole years under these assumptions', assets >= target ? years : 'Not reached within 80 years', 'number')];
      explanations.push(years === 0 ? 'Current assets already meet the selected target; this does not establish that retiring is safe.' : 'The years estimate assumes constant returns and end-of-year contributions. It does not model uncertain market paths or withdrawals.');
      break;
    }
  }
  if (!metrics.length || metrics.some(item => typeof item.value === 'number' && (!Number.isFinite(item.value) || Math.abs(item.value) > MAX_OUTPUT))) return null;
  return { metrics, explanations };
}
