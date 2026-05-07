// src/app/company/[id]/page.tsx
// Server component — generateMetadata로 회사별 동적 SEO + JSON-LD 생성.
// 클라이언트 인터랙션은 CompanyProfileContent.tsx에 분리.

import type { Metadata } from "next";
import Link from "next/link";
import CompanyProfileContent from "@/components/CompanyProfileContent";
import JsonLd from "@/components/JsonLd";
import { HomeTopAd, InArticleAd } from "@/components/AdPlacement";
import PartnerSlot from "@/components/PartnerSlot";
import CoupangBanner from "@/components/CoupangBanner";
import { companies } from "@/lib/companyData";
import { buildCompanyMetadata } from "@/lib/seo";
import {
 breadcrumbLd,
 companyOrganizationLd,
} from "@/lib/structuredData";

export const runtime = "edge";

interface PageProps {
 params: { id: string };
}

export async function generateStaticParams() {
 return companies.map((c) => ({ id: c.id }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
 const company = companies.find((c) => c.id === params.id);
 if (!company) {
 return {
 title: "회사를 찾을 수 없습니다",
 robots: { index: false, follow: false },
 };
 }

 return buildCompanyMetadata({
 id: company.id,
 name: company.name,
 industry: company.industry,
 averageSalary: company.averageSalary * 10000, // companyData는 만원 단위
 });
}

export default function CompanyProfilePage({ params }: PageProps) {
 const company = companies.find((c) => c.id === params.id);

 if (!company) {
 return (
 <div className="min-h-screen flex items-center justify-center">
 <div className="text-center">
 <h1 className="text-2xl font-bold mb-4">기업을 찾을 수 없습니다.</h1>
 <Link href="/company" className="text-primary hover:underline">
 목록으로 돌아가기
 </Link>
 </div>
 </div>
 );
 }

 // entryLevelSalary는 만원 단위 → 원 단위로 변환 (PartnerSlot용)
 const entryAnnualSalary = company.entryLevelSalary * 10000;

 return (
 <>
 <JsonLd
 data={[
 breadcrumbLd([
 { name: "홈", path: "/" },
 { name: "회사 연봉 DB", path: "/company" },
 { name: company.name, path: `/company/${company.id}` },
 ]),
 companyOrganizationLd({
 name: company.name,
 industry: company.industry,
 description: company.description,
 }),
 ]}
 />

 <CompanyProfileContent id={params.id} />

 {/* CompanyProfileContent 다음에 광고 + PartnerSlot + Coupang */}
 <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
 <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
 <div className="lg:col-span-2 space-y-6">
 <InArticleAd />

 <PartnerSlot
 id="finda-company"
 context={{ annualSalary: entryAnnualSalary }}
 fallback={
 <CoupangBanner
 responsive={{ mobile: "mobile-banner", desktop: "leaderboard" }}
 />
 }
 />

 <HomeTopAd />
 </div>
 <div className="lg:col-span-1">
 <CoupangBanner size="rectangle" />
 </div>
 </div>
 </section>
 </>
 );
}
