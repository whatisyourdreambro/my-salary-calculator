// src/app/company/[id]/page.tsx
// Server component — generateMetadata로 회사별 동적 SEO + JSON-LD 생성.
// 클라이언트 인터랙션은 CompanyProfileContent.tsx에 분리.

import type { Metadata } from "next";
import Link from "next/link";
import dynamic from "next/dynamic";
import { ArrowRight, BookOpen, TrendingUp } from "lucide-react";
import JsonLd from "@/components/JsonLd";
import { HomeTopAd, InArticleAd } from "@/components/AdPlacement";
import CoupangBanner from "@/components/CoupangBanner";
import { companies } from "@/lib/companyData";
import { koGuides } from "@/lib/guidesData";
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

 // 회사에 매핑된 관련 가이드 찾기 (slug → koGuides 매칭)
 const relatedGuides = (company.relatedGuides ?? [])
 .map((slug) => koGuides.find((g) => g.slug === slug))
 .filter((g): g is NonNullable<typeof g> => Boolean(g))
 .slice(0, 6);

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

 <section className="page-width pb-16">
 <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
 <div className="lg:col-span-2 space-y-6">
 {company.seasonalLandingPath && (
 <Link
 href={company.seasonalLandingPath}
 className="block p-6 bg-electric rounded-3xl text-white hover:bg-blue-600 transition-colors"
 >
 <div className="flex items-center gap-2 mb-3">
 <TrendingUp className="w-5 h-5" />
 <span className="text-xs font-black uppercase tracking-widest opacity-90">
 시즌 이슈
 </span>
 </div>
 <h3 className="text-lg font-black mb-2">
 {company.name} 2026 임금협상 통합 페이지
 </h3>
 <p className="text-sm opacity-90 flex items-center gap-1">
 5월 12일 본격 협상 시작 - 핵심 쟁점·인상폭·관련 가이드 7편
 <ArrowRight className="w-4 h-4" />
 </p>
 </Link>
 )}

 {relatedGuides.length > 0 && (
 <div>
 <div className="flex items-center gap-2 mb-4">
 <BookOpen className="w-5 h-5 text-electric" />
 <h2 className="text-lg font-black text-navy">
 {company.name} 관련 심층 가이드
 </h2>
 </div>
 <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
 {relatedGuides.map((guide) => (
 <Link
 key={guide.slug}
 href={`/guides/${guide.slug}`}
 className="group flex flex-col p-4 bg-white rounded-2xl border border-canvas-200 hover:border-electric transition-colors"
 >
 <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-black bg-electric-10 text-electric uppercase tracking-widest mb-2 self-start">
 {guide.category}
 </span>
 <h3 className="font-bold text-navy text-sm mb-2 leading-tight group-hover:text-electric transition-colors line-clamp-2">
 {guide.title}
 </h3>
 <p className="text-xs text-muted-blue line-clamp-2 leading-relaxed">
 {guide.description}
 </p>
 </Link>
 ))}
 </div>
 </div>
 )}

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
