import { readFileSync } from 'node:fs';
import ts from 'typescript';
import { describe, expect, it } from 'vitest';

// Execute the actual route's private calculation. No Next page export is added,
// and no alternate implementation is maintained by this regression test.
const source = readFileSync(new URL('../app/fire-calculator/page.tsx', import.meta.url), 'utf8');
const ast = ts.createSourceFile('page.tsx', source, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
const required = new Set(['parseNumber', 'strategyReturns', 'calculateFireDate']);
const statements = ast.statements.filter((statement) => ts.isVariableStatement(statement) &&
  statement.declarationList.declarations.some((declaration) =>
    ts.isIdentifier(declaration.name) && required.has(declaration.name.text)));
if (statements.length !== required.size) throw new Error('Actual FIRE calculation declarations changed');
const code = ts.transpileModule(statements.map((statement) => statement.getText(ast)).join('\n'), {
  compilerOptions: { target: ts.ScriptTarget.ES2020, module: ts.ModuleKind.None },
}).outputText;
type Event = { year: number; type: 'oneTimeExpense' | 'oneTimeIncome'; amount: string; description: string };
const calculate = new Function(code + '\nreturn calculateFireDate;')() as
  (inputs: Record<string, string>, events: Event[]) => Record<string, number>;
const inputs = {
  currentAge: '30', currentSavings: '100,000,000', monthlySavings: '0', salaryGrowthRate: '0',
  investmentStrategy: 'conservative', customReturn: '', monthlySpending: '1,000,000',
  retirementIncome: '0', withdrawalRate: '4',
};
const event = (type: Event['type'], amount: number): Event => ({ year: 1, type, amount: String(amount), description: 'test' });

describe('FIRE same-year life events from the actual route calculation', () => {
  it('includes every same-year expense in the projected assets', () => {
    const combined = calculate(inputs, [event('oneTimeExpense', 10_000_000), event('oneTimeExpense', 20_000_000)]);
    expect(combined).toEqual(calculate(inputs, [event('oneTimeExpense', 30_000_000)]));
    expect(combined.yearsToFire).toBeGreaterThan(calculate(inputs, [event('oneTimeExpense', 10_000_000)]).yearsToFire);
  });

  it('includes every same-year income and contributed amount', () => {
    const combined = calculate(inputs, [event('oneTimeIncome', 10_000_000), event('oneTimeIncome', 20_000_000)]);
    expect(combined).toEqual(calculate(inputs, [event('oneTimeIncome', 30_000_000)]));
    expect(combined.totalContributions).toBe(130_000_000);
    expect(combined.yearsToFire).toBeLessThan(calculate(inputs, [event('oneTimeIncome', 10_000_000)]).yearsToFire);
  });

  it('applies mixed income and expense to assets while keeping gross income as contributions', () => {
    const combined = calculate(inputs, [event('oneTimeExpense', 10_000_000), event('oneTimeIncome', 20_000_000)]);
    const netIncome = calculate(inputs, [event('oneTimeIncome', 10_000_000)]);
    expect(combined.yearsToFire).toBe(netIncome.yearsToFire);
    expect(combined.finalTargetAmount).toBe(netIncome.finalTargetAmount);
    expect(combined.totalContributions).toBe(120_000_000);
    expect(combined).toEqual(calculate(inputs, [event('oneTimeIncome', 20_000_000), event('oneTimeExpense', 10_000_000)]));
  });

  it('preserves single-event results and keeps a future event out of the wrong year', () => {
    const oldCode = code.replace('lifeEvents.filter((e) => e.year === years)', 'lifeEvents.find((e) => e.year === years)')
      .replace('for (const eventForYear of eventsForYear)', 'if (eventsForYear)')
      .replace('if (eventsForYear) {', 'if (eventsForYear) { const eventForYear = eventsForYear;');
    const previous = new Function(oldCode + '\nreturn calculateFireDate;')() as typeof calculate;
    for (const events of [[], [event('oneTimeExpense', 10_000_000)], [event('oneTimeIncome', 20_000_000)],
      [{ ...event('oneTimeExpense', 10_000_000), year: 3 }]]) {
      expect(calculate(inputs, events)).toEqual(previous(inputs, events));
    }
  });
});
