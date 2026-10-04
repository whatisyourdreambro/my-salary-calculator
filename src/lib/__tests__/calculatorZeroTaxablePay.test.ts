import { describe, expect, it } from 'vitest';
import { calculateNetSalary2026 } from '@/lib/calculator';

const settings = { isSmeYouth: false, disabledDependents: 0, seniorDependents: 0 };

describe('salary estimate with no taxable pay', () => {
  it.each([120_000, 1_200_000])('does not charge minimum pension on fully exempt annual pay %i', annual => {
    const result = calculateNetSalary2026(annual, annual, 1, 0, settings);
    expect(result.pension).toBe(0);
    expect(result.totalDeduction).toBe(0);
    expect(result.monthlyNet).toBe(annual / 12);
  });

  it('preserves the pension floor when positive taxable pay remains', () => {
    const result = calculateNetSalary2026(3_000_000, 2_400_000, 1, 0, settings);
    expect(result.pension).toBe(19_475);
    expect(result.monthlyNet).toBeGreaterThan(0);
  });
});
