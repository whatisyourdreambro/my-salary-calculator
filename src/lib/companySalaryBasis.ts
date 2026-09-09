import type { CompanyProfile } from "@/types/company";

type SalaryBasisCompany = Pick<CompanyProfile, "salary" | "disclosed">;

export function getCompanySalaryBasis(
  company: SalaryBasisCompany,
  { dartSalaryManwon = null }: { dartSalaryManwon?: number | null } = {},
) {
  const disclosed = company.disclosed;
  const entryBaseWon = company.salary.entry.base;
  const entryIncentiveWon = company.salary.entry.incentive.avgAmount || 0;

  return {
    disclosed,
    entryBaseWon,
    entryIncentiveWon,
    entryTotalWon: entryBaseWon + entryIncentiveWon,
    dartSalaryManwon,
    hasDartGap: Boolean(
      disclosed &&
      dartSalaryManwon != null &&
      disclosed.avgSalaryManwon > 0 &&
      Math.abs(dartSalaryManwon - disclosed.avgSalaryManwon) / disclosed.avgSalaryManwon > 0.05,
    ),
  };
}

export function buildCompanySalaryFaq(
  company: SalaryBasisCompany & Pick<CompanyProfile, "name">,
) {
  const { disclosed, entryBaseWon, entryTotalWon } = getCompanySalaryBasis(company);
  const name = company.name.ko;
  const baseManwon = Math.round(entryBaseWon / 10000).toLocaleString("ko-KR");
  const totalManwon = Math.round(entryTotalWon / 10000).toLocaleString("ko-KR");

  return [
    {
      question: `${name} 평균 연봉은 얼마인가요?`,
      answer: disclosed
        ? `${name}의 공시 기준 직원 평균연봉은 ${disclosed.fiscalYear} 사업연도 ${disclosed.avgSalaryManwon.toLocaleString("ko-KR")}만원입니다. 공시 인용 출처: ${disclosed.source}. 신입 초봉이나 개인 지급액과는 다르며, 성과급 포함 범위·집계 대상·산정 방식은 공시 카드의 출처와 주의사항을 확인하세요.`
        : `본 DB에서 확인한 ${name}의 직원 전체 평균연봉 공시 자료는 없습니다. 아래 신입·직급별 연봉은 기본급과 평균 인센티브를 바탕으로 한 자체 추정치이며, 직원 전체 평균을 대신하지 않습니다.`,
    },
    {
      question: `${name} 신입 초봉(첫해 연봉)은 얼마인가요?`,
      answer: `본 DB의 ${name} 신입 기본급 추정은 약 ${baseManwon}만원, 평균 인센티브를 더한 세전 총연봉 추정은 약 ${totalManwon}만원입니다. 직원 전체 공시 평균과 다른 기준이며, 직무·학력·입사 시점·성과급 지급 조건에 따라 실제 첫해 금액은 달라집니다. 위 직급별 연봉표의 신입 행은 이 추정 총연봉을 사용합니다.`,
    },
  ];
}
