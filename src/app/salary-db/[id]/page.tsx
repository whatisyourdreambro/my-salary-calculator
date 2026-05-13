import { Metadata } from "next";
import { companyRepository } from "@/lib/salary-data/CompanyRepository";
import { notFound } from "next/navigation";
import CompanyDetailClient from "./CompanyDetailClient";
import CompanyInsights from "@/components/CompanyInsights";
import CompanySalaryTable from "@/components/CompanySalaryTable";
import CompanyNarrative from "@/components/CompanyNarrative";
import RelatedCompanies from "@/components/RelatedCompanies";
import JsonLd from "@/components/JsonLd";
import { CalcResultAd, InArticleAd, HomeTopAd, SidebarAd } from "@/components/AdPlacement";
import CoupangBanner from "@/components/CoupangBanner";
import { buildCompanyMetadata } from "@/lib/seo";
import {
 autoBreadcrumbLd,
 companyOrganizationLd,
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

 return buildCompanyMetadata({
 id: company.id,
 name: company.name.ko,
 industry: company.industry,
 averageSalary: entryTotal,
 });
}

function buildCompanyFaq(company: ReturnType<typeof companyRepository.getById>) {
 if (!company) return [];
 const koName = company.name.ko;
 const entryTotal =
 company.salary.entry.base + (company.salary.entry.incentive.avgAmount || 0);
 const entryManwon = Math.round(entryTotal / 10000).toLocaleString("ko-KR");

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
 question: `${koName} 신입 첫 달 실수령액은 대략 얼마인가요?`,
 answer: `신입 영끌 ${entryManwon}만원 기준 세전 월 평균은 약 ${monthlyEntry}만원입니다. 4대보험·소득세 공제 후 실수령액은 머니샐러리 연봉 실수령액 계산기로 ${entryManwon}만원을 입력해 확인할 수 있습니다.`,
 },
 {
 question: `${koName} 시니어 연봉은 신입 대비 얼마나 오르나요?`,
 answer: `${koName}의 시니어 평균 영끌 연봉은 약 ${seniorManwon}만원으로, 신입 대비 약 ${Math.round(((seniorTotal - entryTotal) / entryTotal) * 100)}% 높습니다. 직급별 추이는 위 표에서 확인할 수 있습니다.`,
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
 answer: `${koName}은 ${company.industry} 업종 내에서 신입 ${entryManwon}만원 수준이며, 위 본문의 "업종 평균 비교" 섹션에서 동종사 대비 상위/하위 위치를 확인할 수 있습니다.`,
 },
 {
 question: `${koName} 연봉 협상은 어떻게 준비해야 하나요?`,
 answer: `${koName} 수준의 회사에서는 1) 동종사 ${koName} 시니어 평균(${seniorManwon}만원) 자료, 2) 본인 직무의 시장 평균, 3) 본인 성과 수치 3가지를 준비하는 것이 일반적입니다. 자세한 가이드는 머니샐러리 "연봉 협상의 비밀" 글에서 확인 가능합니다.`,
 },
 {
 question: `${koName} 퇴직 시 받을 수 있는 퇴직금은?`,
 answer: `법정 퇴직금은 "최근 3개월 평균 월급 × 근속연수"로 산정됩니다. ${koName} 신입 영끌 기준 1년 근속 시 약 ${Math.round(entryTotal / 12 / 10000).toLocaleString("ko-KR")}만원 수준이며, 머니샐러리 퇴직금 계산기로 본인 근속·급여 기준 정확 산출이 가능합니다.`,
 },
 ];
}

export default function CompanyDetailPage({
 params,
}: {
 params: { id: string };
}) {
 const company = companyRepository.getById(params.id);
 if (!company) notFound();

 const faqItems = buildCompanyFaq(company);

 return (
 <>
 <JsonLd
 data={[
 autoBreadcrumbLd(`/salary-db/${company.id}`, { leafName: company.name.ko }),
 companyOrganizationLd({
 name: company.name.ko,
 industry: company.industry,
 description: `${company.name.ko} 평균 연봉, 워라밸, 복지 정보`,
 }),
 faqLd(faqItems),
 ]}
 />
 <CompanyDetailClient company={company} />

 {/* 결과 직후 광고 — 회사명 검색 의도 정점 */}
 <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
 <CalcResultAd />
 </div>

 <CompanySalaryTable company={company} />

 {/* 본문 자동 생성 — 업종 평균 비교 + 신/시니어 비교 + DSR 시뮬 */}
 <CompanyNarrative company={company} />

 {/* 인사이트 직전 인아티클 광고 — 스크롤 깊이 정점 */}
 <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 my-6">
 <InArticleAd />
 </div>

 <CompanyInsights company={company} />
 <RelatedCompanies
 currentId={company.id}
 industry={company.industry}
 targetSalary={
 company.salary.entry.base + (company.salary.entry.incentive.avgAmount || 0)
 }
 />

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
