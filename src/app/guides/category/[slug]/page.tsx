// src/app/guides/category/[slug]/page.tsx
//
// 가이드 카테고리 허브 7종 — "연말정산 가이드"류 중간 볼륨 쿼리 흡수 +
// 342편으로의 크롤 주스 재분배 (G9 메쉬, 2026-08-23).
// 기존 /guides 인덱스의 카테고리 필터는 클라이언트 상태라 구글이 카테고리별
// 목록을 크롤하지 못했다 — 이 허브가 SSR 전체 목록을 처음으로 제공한다.
// 설정은 src/lib/guideCategories.ts, 목록은 guidesData(서버)에서 파생.
// 광고는 guides/layout.tsx(PageFooterAds) 상속.

import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "@/components/AppLink";
import JsonLd from "@/components/JsonLd";
import Breadcrumbs from "@/components/Breadcrumbs";
import { buildPageMetadata } from "@/lib/seo";
import { breadcrumbLd, itemListLd } from "@/lib/structuredData";
import { GUIDE_CATEGORY_HUBS } from "@/lib/guideCategories";
import { koGuideCards } from "@/lib/guidesData";
import { BookOpen, ArrowRight, Calculator } from "lucide-react";

export const dynamic = "force-static";
export const dynamicParams = false;

export function generateStaticParams(): { slug: string }[] {
  return GUIDE_CATEGORY_HUBS.map((h) => ({ slug: h.slug }));
}

type Props = { params: { slug: string } };

function getHub(slug: string) {
  return GUIDE_CATEGORY_HUBS.find((h) => h.slug === slug) ?? null;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const hub = getHub(params.slug);
  if (!hub) return { title: "페이지를 찾을 수 없습니다", robots: { index: false, follow: false } };
  const count = koGuideCards.filter((g) => g.category === hub.categoryId).length;
  return buildPageMetadata({
    title: `${hub.title} ${count}편 — 머니샐러리 가이드`,
    description: `${hub.intro.slice(0, 120)}`,
    path: `/guides/category/${hub.slug}`,
    keywords: [`${hub.categoryId} 가이드`, hub.title, "머니샐러리"],
  });
}

export default function GuideCategoryHubPage({ params }: Props) {
  const hub = getHub(params.slug);
  if (!hub) notFound();

  const list = koGuideCards
    .filter((g) => g.category === hub.categoryId)
    .sort((a, b) => (a.publishedDate < b.publishedDate ? 1 : -1));
  if (list.length === 0) notFound();

  const latest = list.slice(0, 5);
  const path = `/guides/category/${hub.slug}`;
  const crumbs = [
    { name: "홈", path: "/" },
    { name: "가이드", path: "/guides" },
    { name: hub.title, path },
  ];

  return (
    <main className="min-h-screen bg-transparent pb-10">
      <JsonLd
        data={[
          breadcrumbLd(crumbs),
          itemListLd({
            name: hub.title,
            items: list.slice(0, 30).map((g, i) => ({
              position: i + 1,
              name: g.title,
              url: `/guides/${g.slug}`,
            })),
          }),
        ]}
      />

      <div className="page-width pt-24 pb-3">
        {/* path 자동생성 모드는 중간 세그먼트(/guides/category — 실페이지 아님)를
            링크로 만들어 404 링크가 됨 → JSON-LD와 같은 crumbs 배열을 명시 전달 */}
        <Breadcrumbs items={crumbs} />
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* 히어로 */}
        <section className="mb-8">
          <p className="inline-flex items-center gap-1.5 rounded-full bg-electric/10 px-3 py-1 text-xs font-bold text-electric mb-3">
            <BookOpen size={13} aria-hidden="true" />
            {hub.categoryId} 카테고리 · {list.length}편
          </p>
          <h1 className="text-2xl sm:text-4xl font-black text-navy leading-tight mb-3">
            {hub.title} <span className="text-primary">{list.length}편</span>
          </h1>
          <p className="text-sm sm:text-[15px] leading-7 text-muted-blue">{hub.intro}</p>
        </section>

        {/* 관련 계산기·허브 */}
        <section className="mb-10" aria-label="관련 계산기">
          <div className="flex flex-wrap gap-2">
            {hub.related.map((r) => (
              <Link
                key={r.href}
                href={r.href}
                className="inline-flex items-center gap-1.5 rounded-full border border-canvas-200 bg-white px-4 py-2 text-sm font-bold text-navy hover:border-primary transition"
              >
                <Calculator size={14} className="text-electric" aria-hidden="true" />
                {r.label}
              </Link>
            ))}
          </div>
        </section>

        {/* 최신 5편 */}
        <section className="mb-10" aria-labelledby="latest-heading">
          <h2 id="latest-heading" className="text-lg font-black text-navy mb-4">
            최신 {hub.categoryId} 가이드
          </h2>
          <div className="space-y-3">
            {latest.map((g) => (
              <Link
                key={g.slug}
                href={`/guides/${g.slug}`}
                className="group block rounded-2xl border border-canvas-200 bg-white p-5 hover:border-primary transition"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h3 className="font-black text-navy leading-snug mb-1 group-hover:text-electric transition-colors">
                      {g.title}
                    </h3>
                    <p className="text-sm leading-6 text-muted-blue line-clamp-2">{g.description}</p>
                  </div>
                  <ArrowRight
                    size={18}
                    className="shrink-0 text-electric mt-1 opacity-60 group-hover:opacity-100 transition"
                    aria-hidden="true"
                  />
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* 전체 목록 (SSR — 크롤 가능) */}
        <section aria-labelledby="all-heading">
          <h2 id="all-heading" className="text-lg font-black text-navy mb-4">
            {hub.title} 전체 목록
          </h2>
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2">
            {list.map((g) => (
              <li key={g.slug} className="min-w-0">
                <Link
                  href={`/guides/${g.slug}`}
                  className="block truncate text-sm font-medium text-muted-blue hover:text-electric hover:underline underline-offset-2 py-1"
                >
                  {g.title}
                </Link>
              </li>
            ))}
          </ul>
          <p className="mt-6 text-sm text-muted-blue">
            다른 주제는{" "}
            <Link href="/guides" className="font-bold text-electric hover:underline">
              가이드 전체 보기
            </Link>
            에서 찾을 수 있습니다.
          </p>
        </section>
      </div>
    </main>
  );
}
