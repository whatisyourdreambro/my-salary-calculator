// src/app/calc/[slug]/page.tsx
// Registry calculator routes, statically generated with visible explanations.

import { Metadata } from "next";
import { permanentRedirect } from "next/navigation";
import SimpleCalculatorView from "@/components/SimpleCalculatorView";
import RelatedCalculators from "@/components/RelatedCalculators";
import RelatedGuides from "@/components/RelatedGuides";
import { getRelatedGuides } from "@/lib/relatedGuides";
import RelatedCompanies from "@/components/RelatedCompanies";
import JsonLd from "@/components/JsonLd";
import { HomeTopAd, SidebarAd } from "@/components/AdPlacement";
import NextActions, { type NextActionCategory } from "@/components/NextActions";
import CoupangBanner from "@/components/CoupangBanner";
import { buildPageMetadata } from "@/lib/seo";
import {
 autoBreadcrumbLd,
 softwareApplicationLd,
 howToLd,
 speakableLd,
} from "@/lib/structuredData";
import {
 getCalculatorBySlug,
 getAllSlugs,
 getCalculatorBatch,
 toClientCalculator,
 defaultInputsOf,
 type CalculatorDef,
} from "@/lib/simpleCalculators";
import { getCalcRelatedGuideSlugs } from "@/lib/crossLink";
import { calculatorSeoDescription, calculatorSeoTitle } from "@/lib/simpleCalculators/seoText";

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

 // GSC "발견됨-색인 안 됨" 358개 차단(7차): 콘텐츠 풍부도 기준으로 차등 색인.
 // explanation + faqs 3개+ 있어야 색인 허용. enrichments 없는 thin page는 noindex,follow.
 // 사이트 전체 평가 보호(thin page 도미노 차단).
 const isContentRich = !!(
 calc.explanation &&
 calc.faqs &&
 calc.faqs.length >= 3
 );

 // 2026-09-11 SEO 감사: '계산기' 키워드 보장 + 9~34자 공식 조각 description 을 60~160자 스니펫으로 (seoText.ts)
 return buildPageMetadata({
 title: calculatorSeoTitle(calc),
 description: calculatorSeoDescription(calc),
 path: `/calc/${calc.slug}`,
 keywords: calc.keywords,
 noIndex: !isContentRich,
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
 // GSC 404 출혈 차단(7차): 옛 계산기 슬러그 → /calc 메인 308
 if (!calc) permanentRedirect("/calc");

 const ldData: object[] = [
 autoBreadcrumbLd(`/calc/${calc.slug}`, { leafName: calc.title }),
 softwareApplicationLd({
 name: calc.title,
 description: calc.description,
 url: `/calc/${calc.slug}`,
 }),
 ];

 // FAQPage 스키마는 가시 FAQ 섹션과 같은 SimpleCalculatorView 에서 단일 출력(중복 제거).

 // Describe the visible calculation flow; search appearance is determined by the engine.
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
 {/* 텍스트·필드는 props 로, compute 는 클라이언트가 배치 단위 지연 로드 (번들 분리 2026-09-11).
     initialResult 는 기본값 입력의 서버 계산 결과 — 프리렌더 HTML 과 하이드레이션이 같은 값을 쓴다. */}
 <SimpleCalculatorView
 slug={calc.slug}
 calc={toClientCalculator(calc)}
 batch={getCalculatorBatch(calc.slug) ?? "batch1"}
 initialResult={calc.compute(defaultInputsOf(calc))}
 />

 <div className="page-width lg:grid lg:grid-cols-[minmax(0,1fr)_320px] lg:gap-10 xl:gap-14 pb-16">
 <div>
 <div className="max-w-3xl mx-auto">
 {/* 카테고리 매핑이 없는 생활·사업·가족·커리어·환율 86종에는 범용 급여 CTA(주담대·회사연봉·연말정산)가 나가던 것을
     중단 — 결과 직후 '다음 계산기' 핀(SimpleCalculatorView)과 아래 관련 계산기가 대신한다 (2026-09-11). */}
 {nextActionCategory && <NextActions category={nextActionCategory} currentPath={`/calc/${calc.slug}`} />}

 <CoupangBanner
 responsive={{ mobile: "mobile-banner", desktop: "leaderboard" }}
 />

 <RelatedCalculators
 currentPath={`/calc/${calc.slug}`}
 calcCategory={calc.category}
 />

 <RelatedGuides
 items={getRelatedGuides({
 currentSlug: `__calc-${calc.slug}`,
 explicitSlugs: getCalcRelatedGuideSlugs(calc.slug),
 limit: 3,
 })}
 title="이 계산기와 함께 보면 좋은 가이드"
 />

 {/* 회사 블록은 급여·커리어 계산기에서만 — 그 외 카테고리에서는 문맥 없는 고정 6개사였다 (2026-09-11) */}
 {(calc.category === "salary" || calc.category === "career") && (
 <RelatedCompanies
 currentId="__calc"
 limit={6}
 title="회사별 연봉 비교"
 />
 )}

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
