import { calcSamsungBonusNet, REFERENCE_SALARY } from "./model";

/** Shared by the current result and locally saved comparisons. Amounts are won. */
export function computePersonalBonus(
  salary: number,
  selected: { buPart: number; saPart: number },
  opi1Rate: number,
  creditRate: number,
  applyInsurance: boolean,
) {
  const ratio = salary / REFERENCE_SALARY;
  const opi2BuManwon = selected.buPart * ratio;
  const opi2SaManwon = selected.saPart * ratio;
  const opi2Manwon = opi2BuManwon + opi2SaManwon;
  const opi2Won = opi2Manwon * 10000;
  const opi1Won = salary * (opi1Rate / 100);
  const opi1Manwon = opi1Won / 10000;
  const totalGrossWon = opi1Won + opi2Won;
  const tax = calcSamsungBonusNet(salary, totalGrossWon, creditRate, applyInsurance);
  return {
    opi1Won, opi1Manwon, opi2Won, opi2Manwon, opi2BuManwon, opi2SaManwon,
    totalGrossWon,
    totalGrossManwon: opi1Manwon + opi2Manwon,
    netWon: tax.net, netManwon: tax.net / 10000, deductWon: tax.deduct,
    effRate: tax.effRate, breakdown: tax.breakdown,
    grossPct: salary > 0 ? (totalGrossWon / salary) * 100 : 0,
    netPct: salary > 0 ? (tax.net / salary) * 100 : 0,
    grossMultiplier: salary > 0 ? totalGrossWon / salary : 0,
    opi2Multiplier: salary > 0 ? opi2Won / salary : 0,
  };
}
