import { describe, expect, it } from 'vitest';
import { ENGLISH_CURRENCIES, ENGLISH_TOOLS, formatEnglishMoney, getEnglishTool, type EnglishCurrency, type EnglishToolSlug } from './englishTools';
import { ENGLISH_TOOL_DETAILS, calculateEnglishTool, parseEnglishToolInputs, type EnglishToolValues } from './englishToolModels';

const defaults = (slug: EnglishToolSlug) => Object.fromEntries(ENGLISH_TOOL_DETAILS[slug].fields.map(field => [field.key, field.defaultValue]));
function model(slug: EnglishToolSlug, overrides: EnglishToolValues = {}, currency: EnglishCurrency = 'USD') {
  const values = parseEnglishToolInputs(slug, defaults(slug), currency)!;
  const result = calculateEnglishTool(slug, { ...values, ...overrides }, currency);
  expect(result).not.toBeNull();
  return result!;
}
const value = (result: ReturnType<typeof model>, key: string) => result.metrics.find(metric => metric.key === key)!.value as number;

describe('English tool catalog and every supported currency', () => {
  it('has ten unique live slugs, real related tools and complete visible explanations', () => {
    expect(ENGLISH_TOOLS).toHaveLength(10);
    expect(new Set(ENGLISH_TOOLS.map(tool => tool.slug)).size).toBe(10);
    expect(getEnglishTool('unknown')).toBeUndefined();
    for (const tool of ENGLISH_TOOLS) {
      expect(tool.relatedSlugs.every(slug => getEnglishTool(slug))).toBe(true);
      expect(ENGLISH_TOOL_DETAILS[tool.slug].formula.length).toBeGreaterThan(30);
      expect(ENGLISH_TOOL_DETAILS[tool.slug].faq.length).toBeGreaterThanOrEqual(2);
    }
  });
  for (const tool of ENGLISH_TOOLS) for (const currency of ENGLISH_CURRENCIES) it(`${tool.slug} defaults produce finite ${currency} results without applying FX`, () => {
    const result = model(tool.slug, {}, currency);
    expect(result.metrics.every(metric => typeof metric.value === 'string' || Number.isFinite(metric.value))).toBe(true);
    if (tool.slug !== 'savings-goal' && tool.slug !== 'split-bill') expect(result).toEqual(model(tool.slug, {}, 'USD'));
  });
  it('displays explicit currency codes and appropriate minor units', () => {
    expect(formatEnglishMoney(1234.56, 'USD')).toContain('1,234.56');
    expect(formatEnglishMoney(1234.56, 'KRW')).toMatch(/KRW\s+1,235/);
    expect(formatEnglishMoney(1234.56, 'JPY')).toMatch(/JPY\s+1,235/);
  });
});

describe('independent arithmetic examples and accounting identities', () => {
  it('zero-rate loan repays only principal', () => {
    const result = model('loan', { principal: 12000, annualRate: 0, months: 12 });
    expect(value(result, 'payment')).toBe(1000);
    expect(value(result, 'interest')).toBe(0);
    expect(value(result, 'total')).toBe(12000);
  });
  it('fixed loan payments amortize the actual monthly balance to zero', () => {
    const result = model('loan', { principal: 10000, annualRate: 6, months: 24 });
    let balance = 10000;
    let totalInterest = 0;
    for (let month = 0; month < 24; month++) {
      const interest = balance * 0.005;
      totalInterest += interest;
      balance += interest - value(result, 'payment');
    }
    expect(balance).toBeCloseTo(0, 7);
    expect(totalInterest).toBeCloseTo(value(result, 'interest'), 7);
  });
  it('end-of-month compound contributions agree with a month-by-month cash ledger', () => {
    const result = model('compound-interest', { principal: 1000, monthly: 100, annualRate: 12, years: 1 });
    let balance = 1000;
    for (let month = 0; month < 12; month++) balance = balance * 1.01 + 100;
    expect(value(result, 'balance')).toBeCloseTo(balance, 8);
    expect(value(result, 'contributions')).toBe(2200);
  });
  it('zero and negative investment returns do not become NaN or a false positive gain', () => {
    expect(value(model('compound-interest', { principal: 0, monthly: 0, annualRate: 0, years: 1 }), 'balance')).toBe(0);
    expect(value(model('compound-interest', { principal: 1000, monthly: 100, annualRate: 0, years: 1 }), 'balance')).toBe(2200);
    expect(value(model('compound-interest', { principal: 1000, monthly: 0, annualRate: -12, years: 1 }), 'gain')).toBeLessThan(0);
  });
  it('savings contribution reaches the goal after currency rounding', () => {
    expect(value(model('savings-goal', { current: 1000, target: 2200, annualRate: 0, months: 12 }), 'monthly')).toBe(100);
    const usd = model('savings-goal', { current: 0, target: 2000, annualRate: 0, months: 3 }, 'USD');
    const krw = model('savings-goal', { current: 0, target: 2000, annualRate: 0, months: 3 }, 'KRW');
    expect(value(usd, 'monthly')).toBe(666.67);
    expect(value(krw, 'monthly')).toBe(667);
    expect(value(usd, 'balance')).toBeGreaterThanOrEqual(2000);
    expect(value(krw, 'balance')).toBeGreaterThanOrEqual(2000);
    expect(value(model('savings-goal', { current: 3000, target: 2000 }), 'monthly')).toBe(0);
  });
  it('hourly conversion follows paid hours and weeks, including unpaid weeks', () => {
    expect(value(model('hourly-to-salary', { hourly: 25, hours: 40, weeks: 52 }), 'annual')).toBe(52000);
    expect(value(model('hourly-to-salary', { hourly: 25, hours: 40, weeks: 48 }), 'annual')).toBe(48000);
  });
  it('raise distinguishes nominal and inflation-adjusted change', () => {
    const result = model('salary-raise', { annual: 60000, raise: 5, inflation: 2 });
    expect(value(result, 'annual')).toBe(63000);
    expect(value(result, 'monthly')).toBe(250);
    expect(value(result, 'real')).toBeCloseTo(2.94117647, 7);
    expect(value(model('salary-raise', { raise: -100 }), 'annual')).toBe(0);
  });
  it('bonus uses annual base and adds the fixed amount exactly once', () => {
    const result = model('bonus', { annual: 60000, bonusPercent: 10, fixed: 1000 });
    expect(value(result, 'bonus')).toBe(7000);
    expect(value(result, 'annual')).toBe(67000);
  });
  it('offer annual ranking can differ from hourly ranking and changes with current inputs', () => {
    const result = model('offer-compare');
    expect(value(result, 'annualA')).toBe(65000);
    expect(value(result, 'annualB')).toBe(72000);
    expect(value(result, 'hourlyA')).toBe(31.25);
    expect(value(result, 'hourlyA')).toBeGreaterThan(value(result, 'hourlyB'));
    expect(result.explanations).toContain('Offer B has higher annual gross cash.');
    expect(model('offer-compare', { salaryA: 100000 }).explanations).toContain('Offer A has higher annual gross cash.');
  });
  it('work-time uses supplied spendable pay without assuming a tax rate', () => {
    const result = model('work-time-cost', { price: 300, hourly: 20, hoursPerDay: 8 });
    expect(value(result, 'hours')).toBe(15);
    expect(value(result, 'days')).toBe(1.875);
  });
  for (const currency of ENGLISH_CURRENCIES) it(`split-bill shares reconcile in ${currency}`, () => {
    const result = model('split-bill', { bill: 100, people: 3, tip: 10, charge: 5 }, currency);
    const remainder = value(result, 'remainder');
    expect(value(result, 'total')).toBe(115);
    expect(value(result, 'lower') * (3 - remainder) + value(result, 'upper') * remainder).toBeCloseTo(115, 8);
  });
  it('FIRE is a ratio and bounded scenario, including already reached and unreachable cases', () => {
    const result = model('fire', { spending: 30000, withdrawal: 4, current: 0, contribution: 100000, annualRate: 0 });
    expect(value(result, 'target')).toBe(750000);
    expect(value(result, 'years')).toBe(8);
    expect(value(model('fire', { current: 750000 }), 'years')).toBe(0);
    expect(value(model('fire', { current: 0, contribution: 0, annualRate: -20 }), 'years')).toBe('Not reached within 80 years');
  });
});

describe('strict validation preserves unknown and unsupported states', () => {
  for (const tool of ENGLISH_TOOLS) it(`${tool.slug} rejects empty, malformed, extra and non-finite input`, () => {
    const raw = defaults(tool.slug); const first = ENGLISH_TOOL_DETAILS[tool.slug].fields[0].key;
    for (const invalid of ['', ' ', '1,000', '1e3', 'NaN', 'Infinity', '1x', '0x10', '1.123', '9'.repeat(25)]) expect(parseEnglishToolInputs(tool.slug, { ...raw, [first]: invalid }, 'USD')).toBeNull();
    expect(parseEnglishToolInputs(tool.slug, { ...raw, unexpected: '1' }, 'USD')).toBeNull();
    const numeric = parseEnglishToolInputs(tool.slug, raw, 'USD')!;
    expect(calculateEnglishTool(tool.slug, { ...numeric, [first]: Infinity }, 'USD')).toBeNull();
    expect(calculateEnglishTool(tool.slug, { ...numeric, [first]: -1 }, 'USD')).toBeNull();
  });
  it('rejects fractional people and terms, zero denominators and invalid currencies', () => {
    expect(calculateEnglishTool('split-bill', { bill: 10, people: 2.5, tip: 0, charge: 0 }, 'USD')).toBeNull();
    expect(calculateEnglishTool('loan', { principal: 1000, annualRate: 5, months: 1.5 }, 'USD')).toBeNull();
    expect(calculateEnglishTool('work-time-cost', { price: 100, hourly: 0, hoursPerDay: 8 }, 'USD')).toBeNull();
    expect(parseEnglishToolInputs('loan', defaults('loan'), 'INVALID' as EnglishCurrency)).toBeNull();
    expect(parseEnglishToolInputs('loan', { ...defaults('loan'), principal: '10.50' }, 'JPY')).toBeNull();
    expect(calculateEnglishTool('loan', { principal: 10.5, annualRate: 5, months: 12 }, 'JPY')).toBeNull();
  });
  it('does not return enormous imprecise monetary outputs', () => {
    expect(calculateEnglishTool('compound-interest', { principal: 1e12, monthly: 1e12, annualRate: 50, years: 50 }, 'USD')).toBeNull();
  });
});
