// Shared explanatory copy only. Importing this module does not load a tax engine.
export const SALARY_MODEL_2026 = {
  defaultConditions: "연봉에 포함된 비과세 월 20만원·본인 포함 부양가족 1명·공제 대상 자녀 0명",
  incomeTaxMethod: "소득세는 연간 세액을 추정해 12개월로 나눈 값입니다.",
  limitation: "실제 월별 간이세액표 조회 결과나 급여명세서·연말정산 확정 세액과 다를 수 있습니다.",
} as const;

export const SALARY_CALCULATION_METHOD_HREF = "/about#salary-calculation-method";
