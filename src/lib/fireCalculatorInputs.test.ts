import { readFileSync } from 'node:fs';
import ts from 'typescript';
import { describe, expect, it } from 'vitest';

// /fire-calculator 회귀 가드 (2026-10-05 감사 code10-05, 08c4dd7ec 중 1년차 저축 부분) — fireLifeEvents.test.ts 와 같은
// 방식으로 실제 라우트의 계산 함수(calculateFireDate)를 추출해 실행한다(별도 구현을 두지 않는다).
// 빈칸·잘못된 입력(code10-06)은 main 의 입력 검증(null + 안내문)이 대신하므로 옮기지 않았다 — calculationBoundaries.test.ts.
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
const calculate = new Function(code + '\nreturn calculateFireDate;')() as
  (inputs: Record<string, string>, events: unknown[]) => Record<string, number> | null;

// 페이지 기본값 (page.tsx useState<FireInputs>)
const DEFAULTS = {
  currentAge: '30', monthlySpending: '3,000,000', currentSavings: '50,000,000', monthlySavings: '1,500,000',
  salaryGrowthRate: '5', investmentStrategy: 'balanced', customReturn: '', retirementIncome: '0', withdrawalRate: '4',
};

describe('FIRE — 1년차 저축은 입력값 그대로 (code10-05)', () => {
  it('기본값은 21년(51세) — 종전 1년차부터 상승분을 곱해 20년', () => {
    const r = calculate(DEFAULTS, []);
    expect(r?.yearsToFire).toBe(21);
    expect(r?.finalAge).toBe(51);
  });
  it('1년 뒤 목표 달성이면 기여액은 입력 월 저축 x 12 그대로', () => {
    const r = calculate({ ...DEFAULTS, currentSavings: '890,000,000', monthlySavings: '1,000,000' }, []);
    expect(r?.yearsToFire).toBe(1);
    expect(r?.totalContributions).toBe(890_000_000 + 12_000_000);
  });
  it('연봉 상승률은 2년차 저축부터 한 번씩 반영된다', () => {
    const r = calculate({ ...DEFAULTS, currentSavings: '800,000,000', monthlySavings: '1,000,000' }, []);
    expect(r?.yearsToFire).toBe(2);
    // 1년차 100만 x 12 + 2년차 105만 x 12 (종전: 105만 x 12 + 110.25만 x 12 = 825,830,000)
    expect(r?.totalContributions).toBe(800_000_000 + 12_000_000 + 12_600_000);
  });
  it('빈칸 입력은 main 의 입력 검증대로 결과 없음(null) — 08c4dd7ec 의 기본값 대체는 옮기지 않음', () => {
    expect(calculate({ ...DEFAULTS, withdrawalRate: '' }, [])).toBeNull();
    expect(calculate({ ...DEFAULTS, currentAge: '' }, [])).toBeNull();
  });
});
