import { Metadata } from "next";
import { companyRepository } from "@/lib/salary-data/CompanyRepository";
import { permanentRedirect } from "next/navigation";
import CompanyDetailClient from "./CompanyDetailClient";
import CompanyInsights from "@/components/CompanyInsights";
import CompanySalaryTable from "@/components/CompanySalaryTable";
import CompanyCareerLevels from "@/components/CompanyCareerLevels";
import CompanyBonusCalculatorLink from "@/components/CompanyBonusCalculatorLink";
import CompanyNarrative from "@/components/CompanyNarrative";
import CompanyFaq from "@/components/CompanyFaq";
import CompanyIndustryRank from "@/components/CompanyIndustryRank";
import RelatedCompanies from "@/components/RelatedCompanies";
import RelatedCalculators from "@/components/RelatedCalculators";
import CompanyConnections from "@/components/CompanyConnections";
import JsonLd from "@/components/JsonLd";
import { InArticleAd, HomeTopAd, SidebarAd } from "@/components/AdPlacement";
import CoupangBanner from "@/components/CoupangBanner";
import Breadcrumbs from "@/components/Breadcrumbs";
import UpdatedBadge from "@/components/UpdatedBadge";
import SalaryLookupTracker from "@/components/SalaryLookupTracker";
import { industryLabelKo } from "@/lib/companyContentBuilder";
import { buildCompanyMetadata } from "@/lib/seo";
import {
 autoBreadcrumbLd,
 companyOrganizationLd,
 datasetLd,
 faqLd,
} from "@/lib/structuredData";

export const dynamic = "force-static";

export async function generateStaticParams() {
 const companies = companyRepository.getAll();
 return companies.map((company) => ({
 id: company.id,
 }));
}

export async function generateMetadata({
 params,
}: {
 params: { id: string };
}): Promise<Metadata> {
 const company = companyRepository.getById(params.id);
 if (!company) return { title: "Company Not Found" };

 const entryTotal =
 company.salary.entry.base + (company.salary.entry.incentive.avgAmount || 0);
 const seniorTotal =
 company.salary.senior.base + (company.salary.senior.incentive.avgAmount || 0);
 const juniorTotal =
 company.salary.junior.base + (company.salary.junior.incentive.avgAmount || 0);
 const leadTotal =
 company.salary.lead.base + (company.salary.lead.incentive.avgAmount || 0);

 return buildCompanyMetadata({
 id: company.id,
 name: company.name.ko,
 industry: company.industry,
 averageSalary: entryTotal,
 seniorSalary: seniorTotal,
 juniorSalary: juniorTotal,
 leadSalary: leadTotal,
 aliases: company.aliases,
 hasCareerLevels: !!company.careerLevels?.length,
 lastUpdated: company.lastUpdated,
 });
}

function buildCompanyFaq(company: ReturnType<typeof companyRepository.getById>) {
 if (!company) return [];
 const koName = company.name.ko;
 const entryTotal =
 company.salary.entry.base + (company.salary.entry.incentive.avgAmount || 0);
 const entryManwon = Math.round(entryTotal / 10000).toLocaleString("ko-KR");
 const entryBaseManwon = Math.round(
 company.salary.entry.base / 10000
 ).toLocaleString("ko-KR");

 const juniorTotal =
 company.salary.junior.base + (company.salary.junior.incentive.avgAmount || 0);
 const juniorManwon = Math.round(juniorTotal / 10000).toLocaleString("ko-KR");

 const seniorTotal =
 company.salary.senior.base + (company.salary.senior.incentive.avgAmount || 0);
 const seniorManwon = Math.round(seniorTotal / 10000).toLocaleString("ko-KR");
 const monthlyEntry = Math.round(entryTotal / 12 / 10000).toLocaleString("ko-KR");
 const realHours = company.workLife.weeklyHours.real;
 const standardHours = 40;
 const overtimeRatio = Math.round(((realHours - standardHours) / standardHours) * 100);
 const dsrCapacity = Math.round((entryTotal * 0.4) / 10000).toLocaleString("ko-KR");

 return [
 {
 question: `${koName} 평균 연봉은 얼마인가요?`,
 answer: `${koName}의 신입 영끌 평균 연봉은 약 ${entryManwon}만원입니다 (기본급 + 평균 인센티브 포함). 직급·연차에 따라 변동되며, 시니어 평균은 약 ${seniorManwon}만원 수준입니다.`,
 },
 {
 question: `${koName} 신입 초봉(첫해 연봉)은 얼마인가요?`,
 answer: `${koName} 신입 초봉은 기본급 기준 약 ${entryBaseManwon}만원이며, 평균 인센티브를 더한 영끌 초봉은 약 ${entryManwon}만원 수준입니다. 초봉은 직무·학력·입사 연도에 따라 달라질 수 있으며, 위 직급별 연봉표의 신입 행에서 세금 공제 후 실수령액까지 확인할 수 있습니다.`,
 },
 {
 question: `${koName} 신입 첫 달 실수령액은 대략 얼마인가요?`,
 answer: `신입 영끌 ${entryManwon}만원 기준 세전 월 평균은 약 ${monthlyEntry}만원입니다. 4대보험·소득세 공제 후 실수령액은 머니샐러리 연봉 실수령액 계산기로 ${entryManwon}만원을 입력해 확인할 수 있습니다.`,
 },
 {
 question: `${koName} 시니어 연봉은 신입 대비 얼마나 오르나요?`,
 answer: `${koName}의 시니어 평균 영끌 연봉은 약 ${seniorManwon}만원으로, 신입 대비 약 ${Math.round(((seniorTotal - entryTotal) / entryTotal) * 100)}% 높습니다. 직급별 추이는 위 표에서 확인할 수 있습니다.`,
 },
 {
 question: `${koName} 대리·과장 직급 연봉은 얼마인가요?`,
 answer: `${koName}의 대리급(주니어, 3~5년차) 평균 영끌 연봉은 약 ${juniorManwon}만원, 과장급(시니어, 6~10년차)은 약 ${seniorManwon}만원 수준입니다. 신입·주니어·시니어·리드·임원 5단계 직급별 세전 연봉과 세후 실수령액은 위 직급별 연봉표에서 한눈에 비교할 수 있습니다.`,
 },
 {
 question: `${koName} 워라밸은 어떤가요?`,
 answer: `${koName}의 평균 주당 근무시간은 약 ${realHours}시간으로, 표준 주 40시간 대비 ${overtimeRatio > 0 ? `약 ${overtimeRatio}% 더 일하는 편` : "오히려 짧거나 비슷"}입니다. 워라밸을 중요시한다면 인근 동종사와 비교해 보는 것을 권장합니다.`,
 },
 {
 question: `${koName} 입사 시 받을 수 있는 대출 한도는?`,
 answer: `신입 영끌 ${entryManwon}만원 기준 DSR 40% 적용 시 연 약 ${dsrCapacity}만원의 원리금 상환 여력이 있습니다. 정확한 한도는 머니샐러리 DSR 계산기 또는 주택담보대출 계산기로 시뮬레이션해 보세요.`,
 },
 {
 question: `${koName} 같은 업종 내 연봉 수준은 어느 정도인가요?`,
 answer: `${koName}은 ${industryLabelKo(company.industry)} 업종 내에서 신입 ${entryManwon}만원 수준이며, 위 본문의 "업종 평균 비교" 섹션에서 동종사 대비 상위/하위 위치를 확인할 수 있습니다.`,
 },
 {
 question: `${koName} 연봉 협상은 어떻게 준비해야 하나요?`,
 answer: `${koName} 수준의 회사에서는 1) 동종사 ${koName} 시니어 평균(${seniorManwon}만원) 자료, 2) 본인 직무의 시장 평균, 3) 본인 성과 수치 3가지를 준비하는 것이 일반적입니다. 자세한 가이드는 머니샐러리 "연봉 협상의 비밀" 글에서 확인 가능합니다.`,
 },
 {
 question: `${koName} 퇴직 시 받을 수 있는 퇴직금은?`,
 answer: `법정 퇴직금은 "최근 3개월 평균 월급 × 근속연수"로 산정됩니다. ${koName} 신입 영끌 기준 1년 근속 시 약 ${Math.round(entryTotal / 12 / 10000).toLocaleString("ko-KR")}만원 수준이며, 머니샐러리 퇴직금 계산기로 본인 근속·급여 기준 정확 산출이 가능합니다.`,
 },
 {
 question: `${koName} 연봉 정보는 2026년 최신 기준인가요?`,
 answer: `네. 본 페이지의 ${koName} 연봉·실수령액은 2026년 세법(소득세율·4대보험 요율)을 반영해 자동 계산됩니다. 기본급·인센티브 수치는 공개 자료 기반 추정치이며, 실제 금액은 부서·성과·연봉 협상 결과에 따라 달라질 수 있습니다.`,
 },
 ];
}

export default function CompanyDetailPage({
 params,
}: {
 params: { id: string };
}) {
 const company = companyRepository.getById(params.id);
 // GSC 404 출혈 차단(7차): 옛 회사 ID 잔재 → /salary-db 메인 308
 if (!company) permanentRedirect("/salary-db");

 const faqItems = buildCompanyFaq(company);

 return (
 <>
 <SalaryLookupTracker
 companyId={company.id}
 companyName={company.name.ko}
 industry={company.industry}
 />
 <JsonLd
 data={[
 autoBreadcrumbLd(`/salary-db/${company.id}`, { leafName: company.name.ko }),
 companyOrganizationLd({
 name: company.name.ko,
 industry: industryLabelKo(company.industry),
 description: `${company.name.ko} 평균 연봉, 워라밸, 복지 정보`,
 alternateName: company.aliases,
 }),
 faqLd(faqItems),
 datasetLd({
 name: `${company.name.ko} 직급별 연봉·실수령액 데이터`,
 description: `${company.name.ko}의 신입·주니어·시니어·리드·임원 직급별 평균 연봉, 인센티브, 복지, 워라밸 데이터.`,
 url: `/salary-db/${company.id}`,
 dateModified: company.lastUpdated,
 keywords: [`${company.name.ko} 연봉`, `${company.name.ko} 초봉`, `${company.name.ko} 신입 연봉`],
 }),
 ]}
 />
 <div className="page-width pt-24 pb-3 flex items-center justify-between gap-3 flex-wrap">
 <Breadcrumbs
 path={`/salary-db/${company.id}`}
 leafName={company.name.ko}
 />
 <UpdatedBadge date={company.lastUpdated} prefix="연봉 데이터" />
 </div>
 {/* 첫 광고(CalcResultAd)는 CompanyDetailClient 내부 Quick Stats 직후에 배치 */}
 <CompanyDetailClient company={company} />

 <CompanySalaryTable company={company} />

 {/* 회사 전용 성과급 계산기 역링크 — 8개 회사(삼성·SK·현대·기아·LG·HD·네이버·카카오)
     만 자동 CTA 노출. GA 분석상 단일 성과급 페이지가 트래픽 90% 견인 → 회사 페이지
     방문자를 해당 계산기로 유도해 시즌 트래픽 곱셈 효과. */}
 <CompanyBonusCalculatorLink companyId={company.id} />

 {/* CL 세부 직급 표 — careerLevels 가 있는 회사(삼성전자 등)만 자동 노출.
 5단계 표(CompanySalaryTable) 보다 더 세분화된 호봉/연차별 base+영끌. */}
 <CompanyCareerLevels company={company} />

 {/* 본문 자동 생성 — 업종 평균 비교 + 신/시니어 비교 + DSR 시뮬 */}
 <CompanyNarrative company={company} />

 {/* 인사이트 직전 인아티클 광고 — 스크롤 깊이 정점 */}
 <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 my-6">
 <InArticleAd />
 </div>

 <CompanyInsights company={company} />

 {/* 같은 업종 연봉 순위 — 동종사 내부 링크 클러스터 강화 */}
 <CompanyIndustryRank company={company} />

 {/* 업종 허브·경쟁사 비교 — 허브-스포크 내부 링크 */}
 <CompanyConnections company={company} />

 {/* 자주 묻는 질문 — JSON-LD faqLd와 동일 Q&A를 본문에도 노출 */}
 <CompanyFaq companyName={company.name.ko} items={faqItems} />

 <RelatedCompanies
 currentId={company.id}
 industry={company.industry}
 targetSalary={
 company.salary.entry.base + (company.salary.entry.incentive.avgAmount || 0)
 }
 />

 {/* 관련 계산기 — 회사 페이지 방문자의 다음 액션 동선 (세션당 PV ↑) */}
 <div className="page-width">
 <RelatedCalculators
 currentPath={`/salary-db/${company.id}`}
 limit={4}
 title="이 회사 연봉으로 시뮬레이션해보세요"
 />
 </div>

 {/* 페이지 끝 광고 + 쿠팡 + 사이드바 — 회사 페이지 매출 즉효 자리 */}
 <div className="page-width lg:grid lg:grid-cols-[minmax(0,1fr)_320px] lg:gap-10 xl:gap-14 pb-16 mt-8">
 <div>
 <div className="max-w-3xl mx-auto">
 <CoupangBanner
 responsive={{ mobile: "mobile-banner", desktop: "leaderboard" }}
 />
 <div className="mt-8">
 <HomeTopAd />
 </div>
 </div>
 </div>
 <aside
 className="hidden lg:block lg:sticky lg:top-24 space-y-6 self-start"
 aria-label="추천·광고"
 >
 <SidebarAd />
 <CoupangBanner size="skyscraper" showDisclosure={false} />
 </aside>
 </div>
 </>
 );
}
