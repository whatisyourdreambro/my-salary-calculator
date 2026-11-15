// 회사 상세(/salary-db/[id]) Dataset JSON-LD 의 temporalCoverage·variableMeasured (2026-11-15 SEASONC, app-data-pages ideas[7]).
// JSON-LD 만 바뀌고 화면은 그대로다. 값은 화면에 실제로 있는 것만:
// - 직급별 값(신입~임원 연봉·평균 인센티브·직급별 실수령액)은 H1 '{회사} 연봉 2026' 과 같은 2026 기준 추정치
// - 공시 평균연봉(CompanyDisclosedSalary)은 그 사업연도(대개 2025) — 공시가 있으면 '{사업연도}/2026' 구간
// H1 의 연도 라벨을 바꾸는 날(회사 title 불변 원칙 — 런북 P-4)에 COMPANY_DATA_YEAR 도 함께 본다.

export const COMPANY_DATA_YEAR = 2026;

/** schema.org temporalCoverage — 공시 사업연도가 데이터 연도보다 이르면 ISO 8601 구간 "YYYY/2026", 아니면 "2026" */
export function companyDatasetCoverage(disclosed: { fiscalYear: string } | undefined): string {
  const match = /(\d{4})/.exec(disclosed?.fiscalYear ?? "");
  const fy = match ? Number(match[1]) : NaN;
  return Number.isFinite(fy) && fy < COMPANY_DATA_YEAR ? `${fy}/${COMPANY_DATA_YEAR}` : String(COMPANY_DATA_YEAR);
}

/** schema.org variableMeasured (Text[]) — 회사 쪽 화면의 직급별 연봉표·인센티브·실수령액, 공시가 있으면 공시 평균연봉 */
export function companyDatasetVariables(hasDisclosed: boolean): string[] {
  return [
    "신입 연봉",
    "주니어 연봉",
    "시니어 연봉",
    "리드 연봉",
    "임원 연봉",
    "평균 인센티브",
    "직급별 실수령액",
    ...(hasDisclosed ? ["공시 평균연봉"] : []),
  ];
}
