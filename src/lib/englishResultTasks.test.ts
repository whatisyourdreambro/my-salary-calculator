import { describe, expect, it } from 'vitest';
import { ENGLISH_TOOLS, getEnglishTool, type EnglishToolSlug } from './englishTools';
import { ENGLISH_TOOL_DETAILS, calculateEnglishTool, parseEnglishToolInputs, type EnglishToolValues } from './englishToolModels';
import { getEnglishSalaryNextTasks, getEnglishToolNextTasks } from './englishResultTasks';
import { calculateEnglishTakeHome } from './englishTakeHome';

function model(slug: EnglishToolSlug, overrides: EnglishToolValues = {}) {
  const raw = Object.fromEntries(ENGLISH_TOOL_DETAILS[slug].fields.map(field => [field.key, field.defaultValue]));
  return calculateEnglishTool(slug, { ...parseEnglishToolInputs(slug, raw, 'USD')!, ...overrides }, 'USD');
}

describe('English result follow-up tasks', () => {
  it.each(ENGLISH_TOOLS)('$slug offers at most two real, distinct next tasks and no source-page loop', ({ slug }) => {
    const plan = getEnglishToolNextTasks(slug, model(slug), 'USD');
    expect(plan).not.toBeNull();
    expect(plan!.items.length).toBeGreaterThan(0);
    expect(plan!.items.length).toBeLessThanOrEqual(2);
    expect(new Set(plan!.items.map(item => item.href)).size).toBe(plan!.items.length);
    for (const item of plan!.items) {
      expect(item.href).not.toContain('?');
      expect(item.href).not.toBe(`/en/tools/${slug}`);
      expect(getEnglishTool(item.href.replace('/en/tools/', ''))).toBeDefined();
    }
  });

  it.each(ENGLISH_TOOLS)('$slug does not retain result guidance after invalid input', ({ slug }) => {
    const invalid = model(slug, { [ENGLISH_TOOL_DETAILS[slug].fields[0].key]: Number.NaN });
    expect(invalid).toBeNull();
    expect(getEnglishToolNextTasks(slug, invalid, 'USD')).toBeNull();
  });

  it('changes loan guidance when the current rate reaches zero without changing destination URLs', () => {
    const withInterest = getEnglishToolNextTasks('loan', model('loan'), 'USD')!;
    const noInterest = getEnglishToolNextTasks('loan', model('loan', { annualRate: 0 }), 'USD')!;
    expect(withInterest.context).toContain('principal and interest');
    expect(noInterest.context).toContain('no displayed interest');
    expect(noInterest.items).toEqual(withInterest.items);
  });

  it('removes the unnecessary contribution-cost task once the savings target is met', () => {
    const missing = getEnglishToolNextTasks('savings-goal', model('savings-goal'), 'USD')!;
    const reached = getEnglishToolNextTasks('savings-goal', model('savings-goal', { current: 10000 }), 'USD')!;
    expect(missing.items).toHaveLength(2);
    expect(reached.items).toHaveLength(1);
    expect(reached.context).toContain('No extra monthly contribution');
    expect(reached.items[0].href).toBe('/en/tools/compound-interest');
  });

  it('distinguishes opposing annual/hourly offer rankings from aligned rankings and changes back', () => {
    const opposite = model('offer-compare');
    const same = model('offer-compare', { hoursB: 40 });
    expect(getEnglishToolNextTasks('offer-compare', opposite, 'USD')!.context).toContain('higher annual-cash offer has lower pay');
    expect(getEnglishToolNextTasks('offer-compare', same, 'USD')!.context).not.toContain('higher annual-cash offer has lower pay');
    expect(getEnglishToolNextTasks('offer-compare', opposite, 'USD')!.context).toContain('higher annual-cash offer has lower pay');
  });

  it('does not describe a cash ranking reversal hidden by the chosen currency rounding', () => {
    const close = model('offer-compare', { hoursB: 44.31 })!;
    const synthetic = { ...close, metrics: close.metrics.map(item => item.key === 'hourlyDifference' ? { ...item, value: -0.01 } : item) };
    expect(getEnglishToolNextTasks('offer-compare', synthetic, 'USD')!.context).toContain('higher annual-cash offer has lower pay');
    expect(getEnglishToolNextTasks('offer-compare', synthetic, 'JPY')!.context).not.toContain('higher annual-cash offer has lower pay');
  });

  it('treats a negative return and a below-inflation raise as assumptions, not an investment forecast', () => {
    expect(getEnglishToolNextTasks('compound-interest', model('compound-interest', { annualRate: -5 }), 'USD')!.context).toContain('balance ends below total contributions');
    expect(getEnglishToolNextTasks('salary-raise', model('salary-raise', { raise: 1, inflation: 2 }), 'USD')!.context).toContain('does not keep up with the inflation assumption');
  });

  it('does not invent a spending or paid-work next task when the starting amount is zero', () => {
    expect(getEnglishToolNextTasks('work-time-cost', model('work-time-cost', { price: 0 }), 'USD')).toBeNull();
    expect(getEnglishToolNextTasks('split-bill', model('split-bill', { bill: 0 }), 'USD')).toBeNull();
    expect(getEnglishToolNextTasks('hourly-to-salary', model('hourly-to-salary', { hourly: 0 }), 'USD')).toBeNull();
  });

  it('narrows FIRE tasks after reaching the ratio target without implying safe retirement', () => {
    const plan = getEnglishToolNextTasks('fire', model('fire', { current: 800000 }), 'USD')!;
    expect(plan.items).toHaveLength(1);
    expect(plan.context).toContain('does not establish that retiring is safe');
  });

  it('never inserts input amounts or currency into destination URLs or task text', () => {
    const first = getEnglishToolNextTasks('loan', model('loan', { principal: 123456.78 }), 'USD')!;
    const second = getEnglishToolNextTasks('loan', model('loan', { principal: 876543.21 }), 'EUR')!;
    expect(first).toEqual(second);
    expect(JSON.stringify(first)).not.toMatch(/123456|876543|USD|EUR/);
  });

  it('accepts current valid Korean salary results and removes budgeting guidance for zero or invalid pay', () => {
    const valid = calculateEnglishTakeHome({ annualSalary: 60000000, nonTaxableMonthly: 200000, dependents: 1, children: 0 });
    expect(getEnglishSalaryNextTasks(valid)!.items.map(item => item.href)).toEqual(['/en/guides/four-major-insurance-complete', '/en/tools/savings-goal']);
    expect(getEnglishSalaryNextTasks({ netPay: 0, totalDeductions: 0 })!.items).toHaveLength(1);
    expect(getEnglishSalaryNextTasks(calculateEnglishTakeHome({ annualSalary: 60000000, nonTaxableMonthly: 200000, dependents: 1, children: 1 }))).toBeNull();
    expect(getEnglishSalaryNextTasks({ netPay: Infinity, totalDeductions: 0 })).toBeNull();
  });
});
