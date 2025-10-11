import { calculateNetSalary } from './calculator';

describe('calculateNetSalary', () => {
  it('should calculate net salary for a standard case', () => {
    const annualSalary = 50000000;
    const nonTaxableAmount = 2400000;
    const dependents = 1;
    const children = 0;
    const advancedSettings = {
      isSmeYouth: false,
      disabledDependents: 0,
      seniorDependents: 0,
    };

    const result = calculateNetSalary(
      annualSalary,
      nonTaxableAmount,
      dependents,
      children,
      advancedSettings
    );

    // Check if the main results are numbers
    expect(typeof result.monthlyNet).toBe('number');
    expect(typeof result.totalDeduction).toBe('number');

    // Check for logical values
    expect(result.monthlyNet).toBeGreaterThan(0);
    expect(result.totalDeduction).toBeGreaterThan(0);
    
    // Net salary should be less than gross salary
    const grossMonthly = annualSalary / 12;
    expect(result.monthlyNet).toBeLessThan(grossMonthly);
  });
});
