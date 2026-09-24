// src/lib/companyFaqItems.ts
//
// 회사 상세(/salary-db/[id]) FAQ 문항 — FAQPage JSON-LD 와 화면 CompanyFaq 가 같은 배열을 쓴다.
// 2026-09-25 B14: 페이지 파일(page.tsx)은 Next 규약상 임의 export 를 둘 수 없어, 회귀 테스트
// (전 회사 FAQ 에 "12,000만원" 같은 다섯 자리 만원 표기 0건)를 위해 본문 그대로 옮겼다.
// 서버 전용 — companyContentBuilder 가 전체 회사 데이터를 import 하므로 클라이언트에서 import 금지.

import type { CompanyProfile } from "@/types/company";
import { industryLabelKo, getIndustryBenchmark } from "@/lib/companyContentBuilder";
import { buildCompanySalaryFaq, getCompanySalaryBasis } from "@/lib/companySalaryBasis";
import { formatManwonKorean } from "@/lib/manwonFormat";
import { josa } from "@/lib/josa";

export function buildCompanyFaq(company: CompanyProfile | undefined) {
 if (!company) return [];
 const koName = company.name.ko;
 const { entryTotalWon: entryTotal } = getCompanySalaryBasis(company);
 // 금액 표기: 1억 이상은 "1억 2,000만원"(formatManwonKorean), 1억 미만은 종전 "N,NNN만원" 과
 // 바이트 단위로 같다 (2026-09-25 B14 META-06 — 회사 제목·설명의 formatSalaryKorean 과 같은 규칙).
 const entryLabel = formatManwonKorean(Math.round(entryTotal / 10000));

 const juniorTotal =
 company.salary.junior.base + (company.salary.junior.incentive.avgAmount || 0);
 const juniorLabel = formatManwonKorean(Math.round(juniorTotal / 10000));

 const seniorTotal =
 company.salary.senior.base + (company.salary.senior.incentive.avgAmount || 0);
 const seniorLabel = formatManwonKorean(Math.round(seniorTotal / 10000));
 const monthlyEntry = Math.round(entryTotal / 12 / 10000).toLocaleString("ko-KR");
 const realHours = company.workLife.weeklyHours.real;
 const standardHours = 40;
 const overtimeRatio = Math.round(((realHours - standardHours) / standardHours) * 100);
 const dsrCapacity = formatManwonKorean(Math.round((entryTotal * 0.4) / 10000));

 return [
 ...buildCompanySalaryFaq(company),
 {
 question: `${koName} 신입 연봉의 월평균과 실수령액은 어떻게 보나요?`,
 answer: `신입 세전 총연봉 추정 ${entryLabel}을 12개월로 나눈 월평균은 약 ${monthlyEntry}만원입니다. 첫 달 입금액이 아니며, 입사 시점·성과급 지급 시기·공제 조건에 따라 실제 월급은 달라집니다. 머니샐러리 연봉 실수령액 계산기에 연봉과 본인 공제 조건을 입력해 참고용 실수령액을 비교하세요.`,
 },
 {
 question: `${koName} 시니어 연봉은 신입 대비 얼마나 오르나요?`,
 answer: `${koName}의 시니어 평균 영끌 연봉은 약 ${seniorLabel}으로, 신입 대비 약 ${Math.round(((seniorTotal - entryTotal) / entryTotal) * 100)}% 높습니다. 직급별 추이는 위 표에서 확인할 수 있습니다.`,
 },
 {
 question: `${koName} 대리·과장 직급 연봉은 얼마인가요?`,
 answer: `${koName}의 대리급(주니어, 3~5년차) 평균 영끌 연봉은 약 ${juniorLabel}, 과장급(시니어, 6~10년차)은 약 ${seniorLabel} 수준입니다. 신입·주니어·시니어·리드·임원 5단계 직급별 세전 연봉과 세후 실수령액은 위 직급별 연봉표에서 한눈에 비교할 수 있습니다.`,
 },
 {
 question: `${koName} 워라밸은 어떤가요?`,
 // 근무시간은 출처 없는 DB 입력값 — 공식 통계·공시처럼 단정하지 않는다 (COMP-09, 2026-09-25)
 answer: `${koName}의 주당 근무시간은 머니샐러리 DB 입력 참고값 기준 약 ${realHours}시간(공식 통계·회사 공시 아님)으로, 표준 주 40시간 대비 ${overtimeRatio > 0 ? `약 ${overtimeRatio}% 긴 편` : "짧거나 비슷한 편"}입니다. 부서·직무에 따라 실제 근무시간은 다를 수 있으니, 워라밸을 중요시한다면 인근 동종사와 비교해 보는 것을 권장합니다.`,
 },
 {
 question: `${koName} 연봉으로 대출 상환 부담을 어떻게 가늠하나요?`,
 answer: `신입 세전 총연봉 추정 ${entryLabel}의 40%는 연 약 ${dsrCapacity}입니다. 연소득 대비 원리금 상환 비율을 보는 단순 비교이며, 실제 대출 한도나 승인 결과가 아닙니다. 다른 부채·금리·만기·상품별 적용 기준을 확인하고, 머니샐러리 DSR 계산기에 본인 조건을 입력해 참고 비율을 비교하세요.`,
 },
 {
 question: `${koName} 같은 업종 내 연봉 수준은 어느 정도인가요?`,
 // 벤치마크 없는 회사(글로벌 등)는 본문에 "업종 평균 비교" 섹션이 없음 — 유령 섹션 안내 방지
 answer: getIndustryBenchmark(company)
 ? `${josa(koName, "은/는")} ${industryLabelKo(company.industry)} 업종 내에서 신입 ${entryLabel} 수준이며, 위 본문의 "업종 평균 비교" 섹션에서 동종사 대비 상위/하위 위치를 확인할 수 있습니다.`
 : `${josa(koName, "은/는")} ${industryLabelKo(company.industry)} 업종 내에서 신입 ${entryLabel} 수준입니다. 국내 동종사 표본이 부족한 회사는 업종 평균 비교가 제공되지 않으며, 비슷한 연봉대 회사 목록으로 시장 위치를 가늠할 수 있습니다.`,
 },
 {
 question: `${koName} 연봉 협상은 어떻게 준비해야 하나요?`,
 answer: `${koName} 수준의 회사에서는 1) 동종사 ${koName} 시니어 평균(${seniorLabel}) 자료, 2) 본인 직무의 시장 평균, 3) 본인 성과 수치 3가지를 준비하는 것이 일반적입니다. 자세한 가이드는 머니샐러리 "연봉 협상의 비밀" 글에서 확인 가능합니다.`,
 },
 {
 question: `${koName} 퇴직 시 받을 수 있는 퇴직금은?`,
 answer: `신입 추정 총연봉의 월평균에 근속 1년을 곱한 단순 참고값은 약 ${Math.round(entryTotal / 12 / 10000).toLocaleString("ko-KR")}만원입니다. 연봉표만으로 실제 퇴직금을 확정할 수 없습니다. 머니샐러리 퇴직금 계산기에 실제 임금 이력과 재직기간을 입력하고, 적용 요건과 평균임금 산정 범위를 확인하세요.`,
 },
 {
 question: `${koName} 연봉 정보는 2026년 최신 기준인가요?`,
 // '최신' 단정 금지 — 계산 기준(세법)·추정치·공시 사업연도를 구분해 답한다. 페이지별 날짜는 넣지 않는다 (COMP-06, 2026-09-25)
 answer: company.disclosed
 ? "실수령액은 2026년 세법·4대보험 요율(2026-07 반영)로 자동 계산합니다. 직급별 기본급·인센티브는 공개 자료 기반 자체 추정치이며, 공시 평균연봉은 표시된 사업연도 기준입니다."
 : "실수령액은 2026년 세법·4대보험 요율(2026-07 반영)로 자동 계산합니다. 직급별 기본급·인센티브는 공개 자료 기반 자체 추정치이며, 실제 금액은 부서·성과·연봉 협상 결과에 따라 달라질 수 있습니다.",
 },
 ];
}
