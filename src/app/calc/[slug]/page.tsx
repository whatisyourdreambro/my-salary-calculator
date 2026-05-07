// src/app/calc/[slug]/page.tsx
// 100개 계산기 동적 라우트 — generateStaticParams로 모두 정적 생성

import { Metadata } from "next";
import { notFound } from "next/navigation";
import SimpleCalculatorView from "@/components/SimpleCalculatorView";
import RelatedCalculators from "@/components/RelatedCalculators";
import JsonLd from "@/components/JsonLd";
import { HomeTopAd } from "@/components/AdPlacement";
import NextActions, { type NextActionCategory } from "@/components/NextActions";
import PartnerSlot from "@/components/PartnerSlot";
import CoupangBanner from "@/components/CoupangBanner";
import SidebarStack from "@/components/SidebarStack";
import { buildPageMetadata } from "@/lib/seo";
import {
 autoBreadcrumbLd,
 softwareApplicationLd,
 faqLd,
 howToLd,
 speakableLd,
} from "@/lib/structuredData";
import { getCalculatorBySlug, getAllSlugs, type CalculatorDef } from "@/lib/simpleCalculators";
import { getPartnerForCalcCategory } from "@/lib/partnerConfig";

export const dynamic = "force-static";

export async function generateStaticParams() {
 return getAllSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({
 params,
}: {
 params: { slug: string };
}): Promise<Metadata> {
 const calc = getCalculatorBySlug(params.slug);
 if (!calc) return { title: "Not Found" };

 return buildPageMetadata({
 title: `${calc.title} 2026 - ${calc.description.slice(0, 30)}`,
 description: calc.description,
 path: `/calc/${calc.slug}`,
 keywords: calc.keywords,
 });
}

// 계산기 카테고리 → NextActions 카테고리 매핑
function mapToNextActionCategory(
 cat: CalculatorDef["category"]
): NextActionCategory | undefined {
 switch (cat) {
 case "loan":
 case "real-estate":
 return cat;
 case "tax":
 return "tax";
 case "insurance":
 case "health":
 return "insurance";
 case "investment":
 return "investment";
 case "salary":
 return "salary";
 default:
 return undefined;
 }
}

export default function CalcPage({ params }: { params: { slug: string } }) {
 const calc = getCalculatorBySlug(params.slug);
 if (!calc) notFound();

 // JSON-LD 데이터
 const ldData: object[] = [
 autoBreadcrumbLd(`/calc/${calc.slug}`, { leafName: calc.title }),
 softwareApplicationLd({
 name: calc.title,
 description: calc.description,
 url: `/calc/${calc.slug}`,
 }),
 ];

 if (calc.faqs && calc.faqs.length > 0) {
 ldData.push(
 faqLd(
 calc.faqs.map((f) => ({ question: f.q, answer: f.a }))
 )
 );
 }

 // HowTo LD: explanation/formula가 있으면 4단계로 노출
 if (calc.explanation || calc.formula) {
 const steps = [
 {
 name: "필요한 값 준비",
 text:
 calc.fields
 .map((f) => f.label)
 .join(", ") + " 을(를) 미리 확인합니다.",
 },
 {
 name: "값 입력",
 text: "상단 입력 박스에 본인의 실제 값을 입력합니다. (단위 표기 확인)",
 },
 {
 name: "결과 확인",
 text:
 calc.explanation?.split("\n")[0] ||
 `${calc.title}의 결과는 입력값에 따라 자동으로 계산됩니다.`,
 },
 {
 name: "응용",
 text:
 "결과를 바탕으로 관련 계산기·가이드를 통해 다음 단계 의사결정을 진행합니다.",
 },
 ];
 ldData.push(
 howToLd({
 name: `${calc.title} 사용법`,
 description: calc.description,
 totalTime: "PT1M",
 steps,
 })
 );
 }

 ldData.push(
 speakableLd({
 url: `/calc/${calc.slug}`,
 cssSelectors: [".faq-answer", ".calc-explanation"],
 })
 );

 const partnerId = getPartnerForCalcCategory(calc.category);
 const nextActionCategory = mapToNextActionCategory(calc.category);

 return (
 <>
 <JsonLd data={ldData} />
 <SimpleCalculatorView slug={calc.slug} />

 {/* 결과 페이지 후속: NextActions + PartnerSlot + 사이드바 */}
 <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 lg:grid lg:grid-cols-[minmax(0,1fr)_300px] lg:gap-8 pb-16">
 <div>
 <div className="max-w-3xl mx-auto">
 <NextActions category={nextActionCategory} />

 {partnerId ? (
 <PartnerSlot
 id={partnerId}
 fallback={
 <CoupangBanner
 responsive={{ mobile: "mobile-banner", desktop: "leaderboard" }}
 />
 }
 />
 ) : (
 <CoupangBanner
 responsive={{ mobile: "mobile-banner", desktop: "leaderboard" }}
 />
 )}

 <RelatedCalculators currentPath={`/calc/${calc.slug}`} />

 <div className="mt-8">
 <HomeTopAd />
 </div>
 </div>
 </div>

 <SidebarStack
 context="calc"
 partnerId={partnerId ?? "finda-loan-calc"}
 />
 </div>
 </>
 );
}
