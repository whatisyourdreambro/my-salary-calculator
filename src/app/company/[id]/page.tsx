// src/app/company/[id]/page.tsx
// Server component — generateMetadata로 회사별 동적 SEO + JSON-LD 생성.
// 클라이언트 인터랙션은 CompanyProfileContent.tsx에 분리.

import type { Metadata } from "next";
import Link from "next/link";
import dynamic from "next/dynamic";
import JsonLd from "@/components/JsonLd";
import { HomeTopAd, InArticleAd } from "@/components/AdPlacement";
import CoupangBanner from "@/components/CoupangBanner";
import { companies } from "@/lib/companyData";
import { buildCompanyMetadata } from "@/lib/seo";
import {
 breadcrumbLd,
 companyOrganizationLd,
} from "@/lib/structuredData";

// framer-motion + recharts 포함 → 클라이언트 전용 렌더로 First Load JS 절감
const CompanyProfileContent = dynamic(
 () => import("@/components/CompanyProfileContent"),
 {
 ssr: false,
 loading: () => (
 <div className="min-h-screen flex items-center justify-center">
 <div className="w-10 h-10 border-4 border-electric-15 border-t-electric rounded-full animate-spin" />
 </div>
 ),
 }
);

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
 averageSalary: company.averageSalary * 10000,
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

 <section className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
 <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
 <div className="lg:col-span-2 space-y-6">
 <InArticleAd />
 <CoupangBanner
 responsive={{ mobile: "mobile-banner", desktop: "leaderboard" }}
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
