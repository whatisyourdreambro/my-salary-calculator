// src/lib/dependentEligibility.ts
//
// 연말정산 부양가족 인적공제(기본공제 150만원) 자격 판정 룰 — 소득세법 50~53조.
// 2026년 귀속분(정산은 2027년 1~2월) 기준. 계산 엔진이 아니라 법정 요건
// yes/no 판정 모듈이며, /calc/dependent-check 페이지가 소비한다.
//
// ★수치 정합: 기본공제 150만·경로우대 100만·장애인 200만은
//   yearEndTaxCalculator.ts 의 personalDeduction 인라인 값(1,500,000 /
//   1,000,000 / 2,000,000)과 동일 — 드리프트 시 두 곳을 함께 수정할 것.
//
// ★소득요건 안내(정본): 2026년 귀속분은 연간 소득금액 100만원 이하
//   (근로소득만 있으면 총급여 500만원 이하)가 정답. 2026-08-03 발표
//   세제개편안의 "100만→300만원 완화"는 국회 통과 시 2027년 귀속분부터
//   적용되므로 이번 정산(2027년 1월)과는 무관하다.
// 갱신 슬롯: 2026-12 말 — 소득요건 완화(100만→300만) 개편안 국회 통과 여부 확인
// 갱신 슬롯: 2027-01 — TAX_YEAR 를 2027로 올리고 출생연도 컷 재검증

/** 귀속연도 — 나이 요건 출생연도 컷 산출 기준 */
export const TAX_YEAR = 2026;

/** 기본공제 1명당 (소득세법 50조) */
export const BASIC_DEDUCTION = 1_500_000;
/** 경로우대 추가공제 — 기본공제 대상자 중 만 70세 이상 (소득세법 51조 1항 1호) */
export const EXTRA_SENIOR_70 = 1_000_000;
/** 장애인 추가공제 (소득세법 51조 1항 2호) */
export const EXTRA_DISABLED = 2_000_000;
/** 부녀자 공제 — 근로자 본인 요건(종합소득금액 3천만원 이하 여성 등). 판정기에선 안내용 */
export const EXTRA_WOMAN = 500_000;
/** 한부모 공제 — 근로자 본인 요건(배우자 없음 + 기본공제 직계비속). 부녀자와 중복 시 한부모 적용 */
export const EXTRA_SINGLE_PARENT = 1_000_000;

/** 소득요건: 연간 소득금액 한도 (소득세법 50조 1항) */
export const INCOME_LIMIT = 1_000_000;
/** 소득요건 특례: 근로소득만 있는 경우 총급여 한도 */
export const WORK_INCOME_GROSS_LIMIT = 5_000_000;

// 나이 요건 출생연도 컷 (귀속연도 중 하루라도 해당 나이면 충족 — 국세청 안내 기준)
/** 직계존속 만 60세 이상 = 이 연도 이전(포함) 출생 → 2026 귀속: 1966년 */
export const SENIOR_60_BIRTH_YEAR_MAX = TAX_YEAR - 60; // 1966
/** 직계비속·형제자매 만 20세 이하 = 이 연도 이후(포함) 출생 → 2026 귀속: 2006년 */
export const JUNIOR_20_BIRTH_YEAR_MIN = TAX_YEAR - 20; // 2006
/** 경로우대 만 70세 이상 → 2026 귀속: 1956년 이전 출생 */
export const ELDER_70_BIRTH_YEAR_MAX = TAX_YEAR - 70; // 1956

export type DependentRelation =
  | "ascendant" // 부모·조부모 등 직계존속 (배우자의 직계존속 포함)
  | "spouse" // 배우자
  | "descendant" // 자녀·손자녀 등 직계비속·입양자
  | "sibling"; // 형제자매

export type IncomeType =
  | "none" // 소득 없음
  | "workOnly" // 근로소득만 있음 → 총급여 기준
  | "other"; // 그 외 소득 있음 → 연간 소득금액 기준

export type LivingStatus =
  | "together" // 동거 (생계를 같이 함)
  | "apartQualified" // 직계존속: 주거형편상 별거+실제 부양 / 형제자매: 취학·요양·근무·사업상 일시 퇴거
  | "apart"; // 별거하며 부양·일시퇴거 사유 없음

export interface DependentInput {
  relation: DependentRelation;
  /** 출생연도 (예: 1958) */
  birthYear: number;
  incomeType: IncomeType;
  /** workOnly: 연간 총급여(세전), other: 연간 소득금액(수입-필요경비). 원 단위 */
  incomeAmount: number;
  /** 소득세법상 장애인 (장애인복지법 등록·상이자·항시 치료를 요하는 중증환자 등) */
  isDisabled: boolean;
  /** 동거·생계 상태 — spouse/descendant 는 판정에 미사용 */
  living: LivingStatus;
}

export interface RequirementCheck {
  key: "age" | "income" | "livelihood";
  title: string;
  ok: boolean;
  detail: string;
}

export interface DependentVerdict {
  eligible: boolean;
  checks: RequirementCheck[];
  /** 기본공제 (불가 시 0) */
  basicDeduction: number;
  /** 경로우대 추가공제 (기본공제 가능 + 만 70세 이상) */
  extraSenior: number;
  /** 장애인 추가공제 (기본공제 가능 + 장애인) */
  extraDisabled: number;
  /** 기본 + 추가 합계 */
  totalDeduction: number;
}

export const RELATION_LABEL: Record<DependentRelation, string> = {
  ascendant: "부모·조부모 (직계존속)",
  spouse: "배우자",
  descendant: "자녀·손자녀 (직계비속·입양자)",
  sibling: "형제자매",
};

/** 귀속연도 기준 나이 (연 나이 — 국세청 출생연도 컷과 동일한 판정 결과) */
export function ageInTaxYear(birthYear: number): number {
  return TAX_YEAR - birthYear;
}

function checkAge(input: DependentInput): RequirementCheck {
  const age = ageInTaxYear(input.birthYear);
  const base = { key: "age" as const, title: "나이 요건" };

  if (input.relation === "spouse") {
    return {
      ...base,
      ok: true,
      detail: "배우자는 나이 요건이 없습니다 (소득세법 50조 1항 2호).",
    };
  }
  if (input.isDisabled) {
    return {
      ...base,
      ok: true,
      detail: "장애인은 나이 요건을 적용하지 않습니다 (소득세법 50조 3항).",
    };
  }
  if (input.relation === "ascendant") {
    const ok = input.birthYear <= SENIOR_60_BIRTH_YEAR_MAX;
    return {
      ...base,
      ok,
      detail: ok
        ? `만 ${age}세 — 직계존속 요건(만 60세 이상, ${SENIOR_60_BIRTH_YEAR_MAX}년 12월 31일 이전 출생)을 충족합니다.`
        : `만 ${age}세 — 직계존속은 만 60세 이상(${SENIOR_60_BIRTH_YEAR_MAX}년 이전 출생)이어야 합니다.`,
    };
  }
  if (input.relation === "descendant") {
    const ok = input.birthYear >= JUNIOR_20_BIRTH_YEAR_MIN;
    return {
      ...base,
      ok,
      detail: ok
        ? `만 ${age}세 — 직계비속 요건(만 20세 이하, ${JUNIOR_20_BIRTH_YEAR_MIN}년 1월 1일 이후 출생)을 충족합니다.`
        : `만 ${age}세 — 자녀·손자녀는 만 20세 이하(${JUNIOR_20_BIRTH_YEAR_MIN}년 이후 출생)여야 합니다. 장애인이면 나이 요건이 면제됩니다.`,
    };
  }
  // sibling
  const ok =
    input.birthYear >= JUNIOR_20_BIRTH_YEAR_MIN ||
    input.birthYear <= SENIOR_60_BIRTH_YEAR_MAX;
  return {
    ...base,
    ok,
    detail: ok
      ? `만 ${age}세 — 형제자매 요건(만 20세 이하 또는 만 60세 이상)을 충족합니다.`
      : `만 ${age}세 — 형제자매는 만 20세 이하 또는 만 60세 이상이어야 합니다. 장애인이면 나이 요건이 면제됩니다.`,
  };
}

function checkIncome(input: DependentInput): RequirementCheck {
  const base = { key: "income" as const, title: "소득 요건" };
  const won = (n: number) => n.toLocaleString("ko-KR");

  if (input.incomeType === "none") {
    return {
      ...base,
      ok: true,
      detail: "연간 소득금액이 없으므로 소득 요건(100만원 이하)을 충족합니다.",
    };
  }
  if (input.incomeType === "workOnly") {
    const ok = input.incomeAmount <= WORK_INCOME_GROSS_LIMIT;
    return {
      ...base,
      ok,
      detail: ok
        ? `총급여 ${won(input.incomeAmount)}원 — 근로소득만 있는 경우 총급여 500만원 이하 요건을 충족합니다.`
        : `총급여 ${won(input.incomeAmount)}원 — 근로소득만 있는 경우 총급여 500만원을 초과하면 공제 대상이 아닙니다.`,
    };
  }
  const ok = input.incomeAmount <= INCOME_LIMIT;
  return {
    ...base,
    ok,
    detail: ok
      ? `연간 소득금액 ${won(input.incomeAmount)}원 — 100만원 이하 요건을 충족합니다.`
      : `연간 소득금액 ${won(input.incomeAmount)}원 — 100만원을 초과하면 공제 대상이 아닙니다 (2026년 귀속 기준).`,
  };
}

function checkLivelihood(input: DependentInput): RequirementCheck {
  const base = { key: "livelihood" as const, title: "생계·동거 요건" };

  if (input.relation === "spouse" || input.relation === "descendant") {
    return {
      ...base,
      ok: true,
      detail:
        "배우자·직계비속은 주소가 달라도 생계를 같이 하는 것으로 봅니다 (소득세법 53조).",
    };
  }
  if (input.relation === "ascendant") {
    if (input.living === "together") {
      return { ...base, ok: true, detail: "동거하며 생계를 같이 하고 있습니다." };
    }
    if (input.living === "apartQualified") {
      return {
        ...base,
        ok: true,
        detail:
          "직계존속은 주거 형편상 별거해도 실제 부양하고 있으면 생계를 같이 하는 것으로 봅니다 (소득세법 53조 2항).",
      };
    }
    return {
      ...base,
      ok: false,
      detail:
        "따로 거주하면서 실제 부양(생활비 지원 등)도 하지 않으면 직계존속 공제를 받을 수 없습니다.",
    };
  }
  // sibling — 주민등록 동거가 원칙, 취학 등 일시 퇴거만 허용
  if (input.living === "together") {
    return {
      ...base,
      ok: true,
      detail: "주민등록상 동거하며 생계를 같이 하고 있습니다.",
    };
  }
  if (input.living === "apartQualified") {
    return {
      ...base,
      ok: true,
      detail:
        "취학·질병 요양·근무·사업 형편에 따른 일시 퇴거는 생계를 같이 하는 것으로 봅니다 (소득세법 53조 1항).",
    };
  }
  return {
    ...base,
    ok: false,
    detail:
      "형제자매는 동거(주민등록 동거가족)가 원칙이며, 취학 등 일시 퇴거 사유 없이 별거하면 공제 대상이 아닙니다.",
  };
}

/** 부양가족 1인의 기본공제·추가공제 판정 */
export function judgeDependent(input: DependentInput): DependentVerdict {
  const checks = [checkAge(input), checkIncome(input), checkLivelihood(input)];
  const eligible = checks.every((c) => c.ok);

  const basicDeduction = eligible ? BASIC_DEDUCTION : 0;
  const extraSenior =
    eligible && input.birthYear <= ELDER_70_BIRTH_YEAR_MAX ? EXTRA_SENIOR_70 : 0;
  const extraDisabled = eligible && input.isDisabled ? EXTRA_DISABLED : 0;

  return {
    eligible,
    checks,
    basicDeduction,
    extraSenior,
    extraDisabled,
    totalDeduction: basicDeduction + extraSenior + extraDisabled,
  };
}
