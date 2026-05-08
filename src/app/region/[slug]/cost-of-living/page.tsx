// src/app/region/[slug]/cost-of-living/page.tsx
// 27개 지역 1인 가구 생활비 페이지.

import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Home, ArrowRight, Calculator, MapPin } from "lucide-react";
import { REGIONS, REGION_SLUGS, getRegion } from "@/data/regionData";
import { calculateSalary2026 } from "@/lib/TaxLogic";
import { buildRegionMetadata } from "@/lib/seo";
import JsonLd from "@/components/JsonLd";
import { autoBreadcrumbLd, faqLd, articleLd, howToLd } from "@/lib/structuredData";
import RelatedCalculators from "@/components/RelatedCalculators";

export const dynamic = "force-static";
export const dynamicParams = false;

type Props = { params: { slug: string } };

export function generateStaticParams() {
 return REGION_SLUGS.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
 const region = getRegion(params.slug);
 if (!region) return {};
 return buildRegionMetadata(region);
}

const fmt = (n: number) => Math.round(n).toLocaleString("ko-KR");

export default function RegionCostOfLivingPage({ params }: Props) {
 const region = getRegion(params.slug);
 if (!region) notFound();

 const totalMonthly =
 region.avgRent + region.avgFood + region.avgTransport + region.avgUtility + region.avgEntertainment;
 const yearlyTotal = totalMonthly * 12;
 // 권장 최소 연봉 = 월소득 × 12 / 0.85 (세후 → 세전)
 const recommendedYearlyGross = Math.round((region.minIncomeRecommended / 0.85) * 12);
 const taxResult = calculateSalary2026(recommendedYearlyGross);

 // 동급 지역 비교 (월세 ±20% 이내)
 const peers = REGIONS.filter(
 (r) =>
 r.slug !== region.slug &&
 Math.abs(r.avgRent - region.avgRent) / region.avgRent < 0.2
 ).slice(0, 5);

 const FAQ_ITEMS = [
 {
 question: `${region.name}에서 1인 가구로 살려면 월 얼마 필요한가요?`,
 answer: `${region.name} 1인 가구 평균 월 생활비는 약 ${fmt(totalMonthly)}원 (월세 ${fmt(region.avgRent)}원 + 식비 ${fmt(region.avgFood)}원 + 교통 ${fmt(region.avgTransport)}원 + 공과금·통신 ${fmt(region.avgUtility)}원 + 여가 ${fmt(region.avgEntertainment)}원). 세후 월소득 ${fmt(region.minIncomeRecommended)}원 이상 권장.`,
 },
 {
 question: `${region.name}에서 권장 연봉은 얼마인가요?`,
 answer: `세후 월 ${fmt(region.minIncomeRecommended)}원을 받으려면 세전 연봉 약 ${fmt(recommendedYearlyGross / 10000)}만원 (4대보험·소득세 차감 약 15%). 실수령액 ${fmt(taxResult.netPay)}원.`,
 },
 {
 question: `${region.name} 월세는 어디가 비싼가요?`,
 answer: region.note,
 },
 {
 question: `${region.name} 다른 지역과 비교해서 어때요?`,
 answer:
 peers.length > 0
 ? `${region.name}과 비슷한 월세 수준의 지역: ${peers.map((p) => p.name).join(", ")}. 식비·교통비도 비슷한 수준.`
 : `${region.name}은 전국에서 ${region.type === "metro" ? "광역시" : region.type === "city" ? "주요 시" : "도 단위"}로 분류되며 본 페이지의 ${REGIONS.length}개 지역 중 비교 가능.`,
 },
 {
 question: `${region.name}에서 자취 시 보증금은?`,
 answer: `평균 보증금 ${fmt(region.avgRentDeposit)}원 + 월세 ${fmt(region.avgRent)}원이 일반적. 보증금 0~500만 + 월세 약간 상승 협상 가능. 전세 환산 시 약 ${fmt(Math.round(region.avgRent * 12 / 0.055))}원 (전월세 전환율 5.5% 기준).`,
 },
 ];

 return (
 <main className="min-h-screen bg-canvas pb-20 pt-28">
 <JsonLd
 data={[
 autoBreadcrumbLd(`/region/${region.slug}/cost-of-living`, {
 leafName: `${region.name} 생활비`,
 overrides: { region: "지역별", "cost-of-living": "생활비" },
 }),
 faqLd(FAQ_ITEMS),
 howToLd({
 name: `${region.name}에서 1인 가구로 살기 위한 자금 계획 4단계`,
 description: "월세·식비·교통·공과금 등 카테고리별 비용 + 권장 연봉 산정",
 totalTime: "PT30M",
 steps: [
 { name: "Step 1. 월세 + 보증금 확인", text: `${region.name} 평균 월세 ${fmt(region.avgRent)}원, 보증금 ${fmt(region.avgRentDeposit)}원.` },
 { name: "Step 2. 고정비 합산", text: `식비 + 교통 + 공과금·통신 + 여가 = 약 ${fmt(totalMonthly - region.avgRent)}원/월.` },
 { name: "Step 3. 권장 월소득 산정", text: `생활비의 1.2배 권장 (저축·비상금 여유). 세후 월 ${fmt(region.minIncomeRecommended)}원 이상.` },
 { name: "Step 4. 권장 연봉으로 환산", text: `세후 → 세전 약 1.18배. 권장 연봉 약 ${fmt(recommendedYearlyGross / 10000)}만원.` },
 ],
 }),
 articleLd({
 title: `${region.name} 생활비 가이드`,
 description: "1인 가구 월 생활비 + 권장 연봉",
 slug: `region-${region.slug}`,
 publishedDate: "2026-04-30",
 }),
 ]}
 />

 <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
 <div className="mb-6">
 <Link href="/" className="text-sm text-muted-blue hover:text-primary inline-flex items-center gap-1">← 홈으로</Link>
 </div>

 <div className="text-center mb-10">
 <p className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-electric-10 text-electric font-bold text-sm mb-4">
 <MapPin className="w-4 h-4" />
 지역별 생활비
 </p>
 <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-navy mb-3">
 <span className="text-electric">{region.name}</span> 생활비
 </h1>
 <p className="text-base sm:text-lg text-muted-blue">
 1인 가구 월 약 {fmt(totalMonthly / 10000)}만원 + 권장 연봉 시뮬
 </p>
 </div>

 {/* 카테고리별 월 비용 */}
 <section className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-10">
 {[
 { label: "월세", value: region.avgRent, icon: "🏠" },
 { label: "식비", value: region.avgFood, icon: "🍽️" },
 { label: "교통", value: region.avgTransport, icon: "🚇" },
 { label: "공과금·통신", value: region.avgUtility, icon: "💡" },
 { label: "여가", value: region.avgEntertainment, icon: "🎬" },
 ].map((c) => (
 <div key={c.label} className="bg-white rounded-2xl p-4 border border-canvas text-center">
 <p className="text-2xl mb-1">{c.icon}</p>
 <p className="text-xs text-muted-blue mb-1">{c.label}</p>
 <p className="text-base font-black text-navy tabular-nums">{fmt(c.value / 10000)}만</p>
 </div>
 ))}
 </section>

 {/* 합계 */}
 <section className="bg-primary p-8 rounded-3xl text-center mb-10">
 <p className="text-navy/70 text-xs font-black uppercase tracking-widest mb-2">월 평균 생활비</p>
 <p className="text-5xl font-black text-navy tracking-tight mb-3">{fmt(totalMonthly)}<span className="text-2xl">원</span></p>
 <div className="flex justify-center gap-6 pt-4 border-t border-white/20">
 <div><p className="text-navy/60 text-xs">연 환산</p><p className="text-navy font-black">{fmt(yearlyTotal / 10000)}만원</p></div>
 <div className="w-px bg-white/20" />
 <div><p className="text-navy/60 text-xs">권장 연봉</p><p className="text-navy font-black">{fmt(recommendedYearlyGross / 10000)}만+</p></div>
 </div>
 </section>

 {/* 권장 연봉 시뮬 */}
 <section className="bg-white border border-canvas rounded-2xl p-6 mb-10">
 <h2 className="text-lg font-black text-navy mb-3 flex items-center gap-2">
 <Calculator className="w-5 h-5 text-electric" />
 권장 연봉 분석
 </h2>
 <p className="text-sm text-muted-blue leading-relaxed mb-3">
 {region.name}에서 1인 가구로 안정적으로 살려면 <strong className="text-navy">세전 연봉 {fmt(recommendedYearlyGross / 10000)}만원 +</strong>가 권장됩니다.
 4대보험·소득세 차감 후 월 실수령 약 <strong className="text-electric">{fmt(taxResult.netPay)}원</strong>이며, 생활비 {fmt(totalMonthly)}원을 제외하면 월 약 {fmt(taxResult.netPay - totalMonthly)}원이 저축·비상금으로 남습니다.
 </p>
 <Link href="/" className="inline-flex items-center gap-2 text-primary font-black text-sm">
 본인 연봉 입력 → 정확한 실수령액 보기
 <ArrowRight className="w-4 h-4" />
 </Link>
 </section>

 {/* 동급 지역 비교 */}
 {peers.length > 0 && (
 <section className="mb-10">
 <h2 className="text-xl font-black text-navy mb-4">📊 비슷한 생활비 지역</h2>
 <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
 {peers.map((p) => (
 <Link
 key={p.slug}
 href={`/region/${p.slug}/cost-of-living`}
 className="bg-white p-4 rounded-2xl border border-canvas hover:border-electric transition group text-center"
 >
 <p className="text-sm font-black text-navy">{p.name}</p>
 <p className="text-xs text-muted-blue mt-1">월 {fmt((p.avgRent + p.avgFood + p.avgTransport + p.avgUtility + p.avgEntertainment) / 10000)}만</p>
 </Link>
 ))}
 </div>
 </section>
 )}

 {/* 지역 메모 */}
 <section className="bg-electric/5 border border-electric/20 rounded-2xl p-6 mb-10">
 <h2 className="text-lg font-black text-navy mb-2 flex items-center gap-2">
 <Home className="w-5 h-5 text-electric" />
 {region.name} 지역 정보
 </h2>
 <p className="text-sm text-muted-blue leading-relaxed">{region.note}</p>
 </section>

 {/* FAQ */}
 <section className="mb-10">
 <h2 className="text-2xl font-black text-navy mb-5">자주 묻는 질문</h2>
 <div className="space-y-3">
 {FAQ_ITEMS.map((item) => (
 <details key={item.question} className="bg-white rounded-2xl p-5 border border-canvas group">
 <summary className="font-black text-navy cursor-pointer list-none flex justify-between items-start">
 <span>{item.question}</span>
 <ArrowRight className="w-5 h-5 text-electric flex-shrink-0 ml-3 transition-transform group-open:rotate-90" />
 </summary>
 <p className="faq-answer mt-3 text-sm text-muted-blue leading-relaxed">{item.answer}</p>
 </details>
 ))}
 </div>
 </section>

 <RelatedCalculators currentPath={`/region/${region.slug}/cost-of-living`} />
 </div>
 </main>
 );
}
