import { calculateYearEndTax, deriveAnnualSocialInsurance2026 } from "./yearEndTaxCalculator";

export const DUAL_INCOME_CHILD_LIMIT = 5;
export type AssignmentSide = "me" | "sp";

export interface DualIncomeAssignment {
  kidsToMe: number;
  creditKidsToMe: number;
  childExpTo: AssignmentSide | null;
  coupleMedTo: AssignmentSide | null;
}

export interface DualIncomeScenario {
  taxMe: number;
  taxSp: number;
  total: number;
  assign: DualIncomeAssignment;
}

export interface DualIncomeInput {
  salaryMe: number;
  salarySp: number;
  children: number;
  childTaxCreditEligibleChildren: number;
  childMedical: number;
  childEducation: number;
  childDonation: number;
  coupleMedical: number;
}

/** 기본공제 인원과 그 부분집합인 연간 세액공제 인원을 같은 부모에게 배정한다. */
export function childAssignments2026(children: number, eligibleChildren: number) {
  if (!Number.isInteger(children) || children < 0 || children > DUAL_INCOME_CHILD_LIMIT
    || !Number.isInteger(eligibleChildren) || eligibleChildren < 0 || eligibleChildren > children) {
    throw new RangeError("자녀 인원은 0~5명의 정수이며 세액공제 대상은 기본공제 대상 인원 이내여야 합니다.");
  }
  const assignments: Pick<DualIncomeAssignment, "kidsToMe" | "creditKidsToMe">[] = [];
  for (let kidsToMe = 0; kidsToMe <= children; kidsToMe++) {
    const minimum = Math.max(0, eligibleChildren - (children - kidsToMe));
    const maximum = Math.min(eligibleChildren, kidsToMe);
    for (let creditKidsToMe = minimum; creditKidsToMe <= maximum; creditKidsToMe++) {
      assignments.push({ kidsToMe, creditKidsToMe });
    }
  }
  return assignments;
}

function personDeterminedTax(gross: number, kids: number, creditKids: number, medical: number, education: number, donation: number) {
  return calculateYearEndTax({
    grossSalary: gross, prepaidTax: 0, ...deriveAnnualSocialInsurance2026(gross),
    dependents: 1 + kids, disabledDependents: 0, seniorDependents: 0,
    housingSubscription: 0, mortgageInterest: 0,
    creditCard: 0, debitCardAndCash: 0, traditionalMarket: 0, publicTransport: 0,
    children: kids, // 기존 카드한도 인원; 이 시나리오의 카드 사용액은 0이다.
    childTaxCreditEligibleChildren: creditKids,
    birthsOrAdoptions: 0, pensionSavings: 0, irp: 0, lifeInsurance: 0,
    medicalExpenses: medical, educationExpenses: education, donation, monthlyRent: 0,
  }).determinedTax;
}

/** 기존 단순화된 지출 배분 모델을 유지하며, 연간 자녀세액공제 인원만 독립화한다. */
export function calculateDualIncomeYearEnd2026(input: DualIncomeInput) {
  const { children, childTaxCreditEligibleChildren: eligible } = input;
  const childAssignments = childAssignments2026(children, eligible);
  const childMedical = children > 0 ? input.childMedical : 0;
  const childEducation = children > 0 ? input.childEducation : 0;
  const childDonation = children > 0 ? input.childDonation : 0;
  const run = (assign: DualIncomeAssignment): DualIncomeScenario => {
    const taxMe = personDeterminedTax(input.salaryMe, assign.kidsToMe, assign.creditKidsToMe,
      (assign.childExpTo === "me" ? childMedical : 0) + (assign.coupleMedTo === "me" ? input.coupleMedical : 0),
      assign.childExpTo === "me" ? childEducation : 0, assign.childExpTo === "me" ? childDonation : 0);
    const taxSp = personDeterminedTax(input.salarySp, children - assign.kidsToMe, eligible - assign.creditKidsToMe,
      (assign.childExpTo === "sp" ? childMedical : 0) + (assign.coupleMedTo === "sp" ? input.coupleMedical : 0),
      assign.childExpTo === "sp" ? childEducation : 0, assign.childExpTo === "sp" ? childDonation : 0);
    return { taxMe, taxSp, total: taxMe + taxSp, assign };
  };
  const allMe = run({ kidsToMe: children, creditKidsToMe: eligible,
    childExpTo: children > 0 ? "me" : null, coupleMedTo: input.coupleMedical > 0 ? "me" : null });
  const allSp = run({ kidsToMe: 0, creditKidsToMe: 0,
    childExpTo: children > 0 ? "sp" : null, coupleMedTo: input.coupleMedical > 0 ? "sp" : null });
  const scenarios: DualIncomeScenario[] = [];
  for (const assignment of childAssignments) {
    // 기존 가정: 자녀별 지출을 분리하지 않고, 기본공제를 받는 쪽에 지출 합계를 배정한다.
    const expSides: (AssignmentSide | null)[] = children === 0 ? [null]
      : assignment.kidsToMe === children ? ["me"] : assignment.kidsToMe === 0 ? ["sp"] : ["me", "sp"];
    const medSides: (AssignmentSide | null)[] = input.coupleMedical > 0 ? ["me", "sp"] : [null];
    for (const childExpTo of expSides) for (const coupleMedTo of medSides) {
      scenarios.push(run({ ...assignment, childExpTo, coupleMedTo }));
    }
  }
  const optimal = scenarios.reduce((best, current) => current.total < best.total ? current : best, scenarios[0]);
  return { allMe, allSp, optimal, saving: Math.max(allMe.total, allSp.total) - optimal.total, scenarios };
}
