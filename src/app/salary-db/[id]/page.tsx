import { Metadata } from "next";
import type { CompanyProfile } from "@/types/company";
import { companyRepository } from "@/lib/salary-data/CompanyRepository";
import { permanentRedirect } from "next/navigation";
import CompanyDetailClient from "./CompanyDetailClient";
import SamsungCompanySummary, { SamsungSectionAnchor } from "./SamsungCompanySummary";
import CompanyInsights from "@/components/CompanyInsights";
import CompanySalaryTable from "@/components/CompanySalaryTable";
import CompanySalaryGroupNotice from "@/components/CompanySalaryGroupNotice";
import CompanyUniqueStats from "@/components/CompanyUniqueStats";
import CompanyDisclosedSalary from "@/components/CompanyDisclosedSalary";
// 서버 전용 DART 집계 — 클라이언트 컴포넌트에서 import 금지 (dartReport.ts 헤더 참조)
import { dartTop100, dartReportStats, dartCompanyStatsById } from "@/lib/salary-data/dartReport";
// R2 W1 (2026-08-31) — 공시 카드→업종 랭킹 도선 (서버 전용)
import { industryRankingByCompanyId } from "@/lib/salary-data/dartRanking";
import CompanyCareerLevels from "@/components/CompanyCareerLevels";
import CompanyBonusCalculatorLink from "@/components/CompanyBonusCalculatorLink";
import CompanyNarrative from "@/components/CompanyNarrative";
import PrivateFeedback from "@/components/PrivateFeedback";
import CompanyFaq from "@/components/CompanyFaq";
import CompanyIndustryRank from "@/components/CompanyIndustryRank";
import RelatedCompanies from "@/components/RelatedCompanies";
import RelatedCalculators from "@/components/RelatedCalculators";
import CompanyConnections from "@/components/CompanyConnections";
import JsonLd from "@/components/JsonLd";
import { Display2Ad, GuideMidAd, InArticleAd, HomeTopAd, SidebarAd } from "@/components/AdPlacement";
import CoupangBanner from "@/components/CoupangBanner";
import Breadcrumbs from "@/components/Breadcrumbs";
import UpdatedBadge from "@/components/UpdatedBadge";
import SalaryLookupTracker from "@/components/SalaryLookupTracker";
import { buildCompanyMetadata } from "@/lib/seo";
import { companyMetadataInput } from "@/lib/companyPageMetadata";
// 회사 FAQ 문항(JSON-LD·본문 공용) — 회귀 테스트를 위해 lib 로 분리 (2026-09-25 B14)
import { buildCompanyFaq } from "@/lib/companyFaqItems";
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

 // 인자 조립은 rss-companies.xml 과 공유(src/lib/companyPageMetadata.ts) — RSS item 제목이
 // 이 페이지 <title> 과 문자열 그대로 같게 유지된다 (2026-09-25 B7, 출력 불변 이동).
 return buildCompanyMetadata(companyMetadataInput(company));
}

/** Dataset JSON-LD citation/isBasedOn 재료 — 공시 출처 URL 이 실재하는 회사만
 *  (수기 disclosed 우선·없으면 DART 주입분: CompanyRepository.enrich 우선순위 그대로).
 *  출처명은 URL 호스트로 판정 — DART·알리오 외(언론 보도 등)는 데이터 파일의 source 문구. */
function disclosedCitation(
 disclosed: CompanyProfile["disclosed"]
): { name: string; url: string } | null {
 const url = disclosed?.sourceUrl;
 if (!url) return null;
 let host = "";
 try {
 host = new URL(url).hostname;
 } catch {
 return null;
 }
 const name =
 host === "dart.fss.or.kr" || host.endsWith(".dart.fss.or.kr")
 ? "금융감독원 DART 사업보고서"
 : host === "alio.go.kr" || host.endsWith(".alio.go.kr")
 ? "알리오 공공기관 경영정보"
 : disclosed.source;
 return { name, url };
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
 const citation = disclosedCitation(company.disclosed);
 // DART ETL 원값(급여총액÷인원, 만원) — 수기 disclosed 와의 괴리 투명 공개용 (data-trust-4).
 // dartStats 의 10% 게이트와 별개로 항상 전달 — 게이트로 걸러진 회사일수록 병기가 필요하다.
 const dartSalaryManwon = dartCompanyStatsById.get(company.id)?.dartSalaryManwon ?? null;

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
 alternateName: company.aliases,
 }),
 faqLd(faqItems),
 datasetLd({
 name: `${company.name.ko} 직급별 연봉·실수령액 데이터`,
 // 신뢰 등급 명시(google-authority-8, 2026-09-05): 직급별 값은 about 페이지대로 자체 집계·추정치 —
 // Dataset 노드가 무표기로 인용되지 않도록 description 에 명시. name/keywords 는 불변.
 description: `${company.name.ko}의 신입·주니어·시니어·리드·임원 직급별 평균 연봉, 인센티브, 복지, 워라밸 데이터 — 공시·보도 종합 자체 집계(추정치 포함).`,
 url: `/salary-db/${company.id}`,
 dateModified: company.lastUpdated,
 keywords: [`${company.name.ko} 연봉`, `${company.name.ko} 초봉`, `${company.name.ko} 신입 연봉`],
 // 공시 출처가 실재하는 회사만 citation/isBasedOn (DART·알리오 원문 링크 → 권위 근거를 기계에 전달)
 ...(citation ? { citation, isBasedOn: citation.url } : {}),
 }),
 ]}
 />
 <div className="page-width pt-24 pb-3 flex items-center justify-between gap-3 flex-wrap">
 <Breadcrumbs
 path={`/salary-db/${company.id}`}
 leafName={company.name.ko}
 />
 {/* lastUpdated 는 CompanyRepository.enrich 파생값(데이터일·DART 주입일·실수령액 재계산일 max) — 접두어와 근거 일치 */}
 <UpdatedBadge date={company.lastUpdated} prefix="연봉·실수령액 데이터" />
 </div>
 {/* 첫 광고(CalcResultAd)는 CompanyDetailClient 내부 Quick Stats 직후에 배치 */}
 <CompanyDetailClient
 company={company}
 summary={company.id === "samsung-electronics" ? <SamsungCompanySummary company={company} dartSalaryManwon={dartSalaryManwon} /> : undefined}
 />

 <SamsungSectionAnchor companyId={company.id} id="samsung-salary-table">
 <CompanySalaryTable company={company} />
 </SamsungSectionAnchor>

 {/* 공시 기준 평균연봉 — 금감원 DART 사업보고서·알리오 등 공식 공시 인용값.
 disclosed 필드가 있는 회사만 렌더 (추정 금지). 추정 기반 연봉표 직후에
 배치해 "공식 수치"로 권위 차별화 + 동일 급여 그룹 페이지에 고유 숫자 부여.
 TOP 100 진입사는 순위 배지로 /insights 리포트 역링크 (준고아 해소 2026-08-23). */}
 <SamsungSectionAnchor companyId={company.id} id="samsung-disclosed-salary">
 <CompanyDisclosedSalary
 company={company}
 dartRank={(() => {
 const row = dartTop100.find((r) => r.companyId === company.id);
 return row
 ? {
 rank: row.rank,
 companyCount: dartReportStats.companyCount,
 rankYear: dartReportStats.rankYear,
 // 순위의 산정 기준값(DART 급여총액÷인원 원값) — 카드 헤드라인(수기 값)과 다를 수 있어 배지에 병기
 salaryManwon: row.avgSalaryManwon,
 }
 : null;
 })()}
 dartSalaryManwon={dartSalaryManwon}
 dartStats={(() => {
 // 증강 팩 ① (2026-08-30): 인상률 배지·3개년 추이 — DART 파생 통계.
 // 수기 disclosed 값과 DART 원값 괴리 10% 초과 시 미전달 (라벨 혼선 방지).
 const stats = dartCompanyStatsById.get(company.id);
 if (!stats || !company.disclosed) return null;
 const gap =
 Math.abs(stats.dartSalaryManwon - company.disclosed.avgSalaryManwon) /
 company.disclosed.avgSalaryManwon;
 return gap <= 0.1 ? stats : null;
 })()}
 industryLink={industryRankingByCompanyId.get(company.id) ?? null}
 />
 </SamsungSectionAnchor>

 {/* 동일 급여 그룹 안내 — 5직급 base 튜플이 동일한 회사(발전 공기업 등)만
 렌더. 표 숫자가 같은 페이지끼리 상호 링크 + "본 DB 수치 기준 동일" 명시로
 near-duplicate 판정 완화 (2026-08-07). 그룹 없으면 null. */}
 <CompanySalaryGroupNotice company={company} />

 {/* 연봉표 직후 중간 광고 — 이 페이지에서 유일하게 GUIDE_MID 슬롯 미사용이었음 (Phase 1) */}
 <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 my-6">
 <GuideMidAd />
 </div>

 {/* 회사 고유 심층 지표 — 전국 순위·실질 시급·복지 가치·15년 누적 소득.
 회사마다 실제 값이 달라지는 카드로 thin content 판정 대응. 데이터 없는
 지표는 카드 자체를 렌더하지 않음 (추정 금지). */}
 <CompanyUniqueStats company={company} />

 {/* 회사 전용 성과급 계산기 역링크 — 매핑 회사는 대형 CTA, 그 외 회사는
     신입 연봉 실수령(/salary/{amount})·일반 성과급 계산기 fallback CTA.
     회사 페이지 방문자를 계산기로 유도해 시즌 트래픽 곱셈 효과. */}
 <CompanyBonusCalculatorLink
   companyId={company.id}
   entryTotalWon={
     company.salary.entry.base + (company.salary.entry.incentive.avgAmount || 0)
   }
 />

 {/* CL 세부 직급 표 — careerLevels 가 있는 회사(삼성전자 등)만 자동 노출.
 5단계 표(CompanySalaryTable) 보다 더 세분화된 호봉/연차별 base+영끌. */}
 <SamsungSectionAnchor companyId={company.id} id="samsung-career-levels">
 <CompanyCareerLevels company={company} />
 </SamsungSectionAnchor>

 {/* 연봉표 직후 광고 ~ 인사이트 직전 광고 사이가 모바일 ~8,500px(10화면) 무광고 구간이었다 — 중간 지점 Display2 (2026-09-11 운영자 승인, 순증 1) */}
 <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 my-6">
 <Display2Ad />
 </div>

 {company.id === "samsung-electronics" && (
 <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
 <PrivateFeedback target="samsung_company" />
 </div>
 )}

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
