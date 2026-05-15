// src/app/hub/page.tsx
// 주제별 허브 인덱스 — 5개 허브로 가는 진입점.

import { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { hubs } from "@/lib/hubs";
import { buildPageMetadata } from "@/lib/seo";
import { autoBreadcrumbLd } from "@/lib/structuredData";
import JsonLd from "@/components/JsonLd";
import Breadcrumbs from "@/components/Breadcrumbs";

export const dynamic = "force-static";

export const metadata: Metadata = buildPageMetadata({
  title: "주제별 종합 가이드 — FIRE·투자·부동산·절세·커리어",
  description:
    "흩어진 계산기와 가이드를 FIRE·주식투자·부동산·절세·커리어 5개 주제로 묶었습니다. 관심 주제의 핵심 도구와 전략을 한 곳에서 확인하세요.",
  path: "/hub",
  keywords: ["금융 종합 가이드", "재테크 가이드", "FIRE", "부동산", "절세", "커리어"],
});

export default function HubIndexPage() {
  return (
    <main className="min-h-screen bg-canvas dark:bg-canvas-950 pb-20">
      <JsonLd
        data={[autoBreadcrumbLd("/hub", { leafName: "주제별 종합 가이드" })]}
      />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-24">
        <Breadcrumbs path="/hub" leafName="주제별 종합 가이드" className="mb-6" />
        <header className="mb-10">
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-navy dark:text-canvas-50 mb-3">
            주제별 종합 가이드
          </h1>
          <p className="text-lg text-muted-blue dark:text-canvas-300">
            관심 주제를 고르면 핵심 계산기·도구·전략을 한 번에 볼 수 있습니다.
          </p>
        </header>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {hubs.map((hub) => (
            <Link
              key={hub.id}
              href={`/hub/${hub.id}`}
              className="group flex flex-col gap-2 p-6 bg-white dark:bg-canvas-900 rounded-2xl border border-canvas-200 dark:border-canvas-800 hover:border-electric transition-colors"
            >
              <h2 className="text-lg font-black text-navy dark:text-canvas-50 group-hover:text-electric transition-colors">
                {hub.title.split(" — ")[0]}
              </h2>
              <p className="text-sm text-muted-blue dark:text-canvas-300 leading-relaxed flex-grow">
                {hub.tagline}
              </p>
              <span className="flex items-center gap-1 text-sm font-bold text-electric mt-2">
                바로가기
                <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </span>
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}
