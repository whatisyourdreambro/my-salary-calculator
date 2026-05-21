// src/app/calc/[slug]/page.tsx
// 100개 계산기 동적 라우트 — generateStaticParams로 모두 정적 생성

import { Metadata } from "next";
import { notFound } from "next/navigation";
import SimpleCalculatorView from "@/components/SimpleCalculatorView";
import RelatedCalculators from "@/components/RelatedCalculators";
import RelatedGuides from "@/components/RelatedGuides";
import RelatedCompanies from "@/components/RelatedCompanies";
import JsonLd from "@/components/JsonLd";
import { HomeTopAd, SidebarAd } from "@/components/AdPlacement";
import NextActions, { type NextActionCategory } from "@/components/NextActions";
import CoupangBanner from "@/components/CoupangBanner";
import { buildPageMetadata } from "@/lib/seo";
import {
 autoBreadcrumbLd,
 softwareApplicationLd,
 faqLd,
 howToLd,
 speakableLd,
} from "@/lib/structuredData";
import { getCalculatorBySlug, getAllSlugs, type CalculatorDef } from "@/lib/simpleCalculators";
import { getCalcRelatedGuideSlugs } from "@/lib/crossLink";

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

 // SERP CTR: title은 검색 쿼리와 매칭되는 calc.title + 연도만. description은 metadata.description으로 분리.
 // 이전: description.slice(0, 30)으로 자르다가 "...즉시 계산하" 같이 잘려 SERP에서 부자연스러움.
 return buildPageMetadata({
 title: `${calc.title} 2026 — 즉시 계산`,
 description: calc.description,
 path: `/calc/${calc.slug}`,
 keywords: calc.keywords,
 });
}

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

 // HowTo schema — 모든 계산기에 적용해 Google SERP의 How-To 리치 결과 노출 기회 확보.
 // 조건부 적용을 풀어 enrichments 없는 계산기도 step 정보 노출 (calc.fields는 항상 존재).
 ldData.push(
 howToLd({
 name: `${calc.title} 사용법`,
 description: calc.description,
 totalTime: "PT1M",
 steps: [
 {
 name: "필요한 값 준비",
 text:
 calc.fields.map((f) => f.label).join(", ") +
 " 을(를) 미리 확인합니다.",
 },
 {
 name: "값 입력",
 text: "상단 입력 박스에 본인의 실제 값을 입력합니다. (단위 표기 확인)",
 },
 {
 name: "결과 확인",
 text:
 calc.explanation?.split("\n")[0] ||
 calc.formula ||
 `${calc.title}의 결과는 입력값에 따라 자동으로 계산됩니다.`,
 },
 {
 name: "응용",
 text:
 "결과를 바탕으로 관련 계산기·가이드를 통해 다음 단계 의사결정을 진행합니다.",
 },
 ],
 })
 );

 ldData.push(
 speakableLd({
 url: `/calc/${calc.slug}`,
 cssSelectors: [".faq-answer", ".calc-explanation"],
 })
 );

 const nextActionCategory = mapToNextActionCategory(calc.category);

 return (
 <>
 <JsonLd data={ldData} />
 <SimpleCalculatorView slug={calc.slug} />

 <div className="page-width lg:grid lg:grid-cols-[minmax(0,1fr)_320px] lg:gap-10 xl:gap-14 pb-16">
 <div>
 <div className="max-w-3xl mx-auto">
 <NextActions category={nextActionCategory} />

 <CoupangBanner
 responsive={{ mobile: "mobile-banner", desktop: "leaderboard" }}
 />

 <RelatedCalculators currentPath={`/calc/${calc.slug}`} />

 <RelatedGuides
 currentSlug={`__calc-${calc.slug}`}
 explicitSlugs={getCalcRelatedGuideSlugs(calc.slug)}
 limit={3}
 title="이 계산기와 함께 보면 좋은 가이드"
 />

 <RelatedCompanies
 currentId="__calc"
 limit={6}
 title="인기 회사 연봉 비교"
 />

 <div className="mt-8">
 <HomeTopAd />
 </div>
 </div>
 </div>

 {/* Desktop sticky sidebar */}
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
