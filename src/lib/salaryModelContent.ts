// Shared explanatory copy only. Importing this module does not load a tax engine.
export const SALARY_MODEL_2026 = {
  defaultConditions: "연봉에 포함된 비과세 월 20만원·본인 포함 부양가족 1명·공제 대상 자녀 0명",
  incomeTaxMethod: "소득세는 국세청 근로소득 간이세액표(2026년 3월 1일 지급분부터) 기준 월 원천징수액입니다.",
  limitation: "원천징수 비율(80·100·120%) 선택, 비과세 항목, 연말정산 확정 세액에 따라 실제 급여명세서와 다를 수 있습니다.",
} as const;

export const SALARY_CALCULATION_METHOD_HREF = "/about#salary-calculation-method";
