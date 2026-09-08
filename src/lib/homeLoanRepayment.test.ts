import { describe, expect, it } from 'vitest';
import { calculateHomeLoanRepayment } from './homeLoanRepayment';

describe('home loan repayment illustration', () => {
  it('matches the 200m, 4%, 30-year repayment example', () => {
    const result = calculateHomeLoanRepayment(200_000_000, 4, 30, 'equalPrincipalAndInterest');
    expect(result.monthlyPayment).toBe(954_831);
    expect(result.totalInterest).toBe(143_739_013);
    expect(result.totalPayment - result.totalInterest).toBe(200_000_000);
  });

  it('uses a declining balance for equal-principal total interest', () => {
    const result = calculateHomeLoanRepayment(120_000_000, 12, 1, 'equalPrincipal');
    // 10m principal each month; interest is 1.2m, 1.1m, ... 0.1m.
    expect(result).toEqual({ monthlyPayment: 11_200_000, totalInterest: 7_800_000, totalPayment: 127_800_000 });
  });

  it.each(['equalPrincipal', 'equalPrincipalAndInterest'] as const)('supports a zero loan rate for %s', type => {
    expect(calculateHomeLoanRepayment(120_000_000, 0, 10, type)).toEqual({
      monthlyPayment: 1_000_000, totalInterest: 0, totalPayment: 120_000_000,
    });
  });

  it.each(['equalPrincipal', 'equalPrincipalAndInterest'] as const)('keeps zero interest exact with a recurring monthly decimal for %s', type => {
    const result = calculateHomeLoanRepayment(380_000_000, 0, 30, type);
    expect(Object.is(result.totalInterest, 0)).toBe(true);
    expect(result.totalPayment).toBe(380_000_000);
  });

  it.each([[0, 4, 30], [-1, 4, 30], [100, -1, 30], [100, 4, 0], [NaN, 4, 30]])(
    'does not return an invalid repayment for %s / %s / %s', (principal, rate, years) => {
      expect(calculateHomeLoanRepayment(principal, rate, years, 'equalPrincipalAndInterest').monthlyPayment).toBe(0);
    },
  );
});
