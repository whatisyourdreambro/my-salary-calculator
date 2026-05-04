// src/app/calc/[slug]/page.tsx
// 100개 계산기 동적 라우트 — generateStaticParams로 모두 정적 생성

import { Metadata } from "next";
import { notFound } from "next/navigation";
import SimpleCalculatorView from "@/components/SimpleCalculatorView";
import RelatedCalculators from "@/components/RelatedCalculators";
import JsonLd from "@/components/JsonLd";
import { buildPageMetadata } from "@/lib/seo";
import { breadcrumbLd, softwareApplicationLd } from "@/lib/structuredData";
import { getCalculatorBySlug, getAllSlugs } from "@/lib/simpleCalculators";

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

export default function CalcPage({ params }: { params: { slug: string } }) {
 const calc = getCalculatorBySlug(params.slug);
 if (!calc) notFound();

 return (
 <>
 <JsonLd
 data={[
 breadcrumbLd([
 { name: "홈", path: "/" },
 { name: "계산기 100", path: "/calc" },
 { name: calc.title, path: `/calc/${calc.slug}` },
 ]),
 softwareApplicationLd({
 name: calc.title,
 description: calc.description,
 url: `/calc/${calc.slug}`,
 }),
 ]}
 />
 <SimpleCalculatorView slug={calc.slug} />
 <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
 <RelatedCalculators currentPath={`/calc/${calc.slug}`} />
 </div>
 </>
 );
}
