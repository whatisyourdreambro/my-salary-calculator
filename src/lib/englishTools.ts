export type EnglishToolCategory = 'bonus' | 'calculators' | 'salary' | 'season' | 'guides' | 'money' | 'fun';
export const ENGLISH_TOOLS = [
  { slug: 'loan', title: 'Loan Payment Calculator', description: 'Estimate fixed monthly payments and total interest using your own loan amount, rate and term.', category: 'money', relatedSlugs: ['savings-goal', 'work-time-cost'] },
  { slug: 'compound-interest', title: 'Compound Interest Calculator', description: 'Explore an initial investment and monthly contributions under a constant return assumption.', category: 'money', relatedSlugs: ['savings-goal', 'fire'] },
  { slug: 'savings-goal', title: 'Savings Goal Calculator', description: 'Find the monthly contribution needed to reach a target by a chosen date.', category: 'money', relatedSlugs: ['compound-interest', 'work-time-cost'] },
  { slug: 'hourly-to-salary', title: 'Hourly to Annual Salary Calculator', description: 'Convert an hourly rate and your paid work schedule into weekly, monthly and annual gross pay.', category: 'salary', relatedSlugs: ['salary-raise', 'offer-compare'] },
  { slug: 'salary-raise', title: 'Salary Raise Calculator', description: 'Compare current and proposed gross pay, including an optional inflation assumption.', category: 'salary', relatedSlugs: ['offer-compare', 'bonus'] },
  { slug: 'bonus', title: 'Gross Bonus Calculator', description: 'Add a percentage of annual base salary and a fixed bonus without assuming a country’s tax rules.', category: 'bonus', relatedSlugs: ['salary-raise', 'offer-compare'] },
  { slug: 'offer-compare', title: 'Gross Job Offer Comparison', description: 'Compare two offers by annual cash compensation and pay per scheduled work hour.', category: 'salary', relatedSlugs: ['hourly-to-salary', 'salary-raise'] },
  { slug: 'work-time-cost', title: 'Work Time Cost Calculator', description: 'Translate a purchase price into work hours using the spendable hourly pay you enter.', category: 'fun', relatedSlugs: ['hourly-to-salary', 'savings-goal'] },
  { slug: 'split-bill', title: 'Split Bill Calculator', description: 'Divide a bill, optional tip and added charge while reconciling currency rounding.', category: 'fun', relatedSlugs: ['work-time-cost', 'savings-goal'] },
  { slug: 'fire', title: 'Financial Independence Target Calculator', description: 'Explore a spending-based investment target and an annual savings scenario with explicit assumptions.', category: 'money', relatedSlugs: ['compound-interest', 'savings-goal'] },
] as const satisfies ReadonlyArray<{ slug: string; title: string; description: string; category: EnglishToolCategory; relatedSlugs: readonly string[] }>;

export type EnglishToolSlug = typeof ENGLISH_TOOLS[number]['slug'];
export function getEnglishTool(slug: string) { return ENGLISH_TOOLS.find(tool => tool.slug === slug); }

export const ENGLISH_CURRENCIES = ['USD', 'EUR', 'GBP', 'KRW', 'JPY'] as const;
export type EnglishCurrency = typeof ENGLISH_CURRENCIES[number];
export function isEnglishCurrency(value: unknown): value is EnglishCurrency {
  return typeof value === 'string' && (ENGLISH_CURRENCIES as readonly string[]).includes(value);
}
export function englishCurrencyDigits(currency: EnglishCurrency) { return currency === 'KRW' || currency === 'JPY' ? 0 : 2; }
export function formatEnglishMoney(value: number, currency: EnglishCurrency) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency, currencyDisplay: 'code', minimumFractionDigits: englishCurrencyDigits(currency), maximumFractionDigits: englishCurrencyDigits(currency) }).format(value);
}
