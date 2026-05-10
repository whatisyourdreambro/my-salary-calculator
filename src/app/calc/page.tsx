// src/app/calc/page.tsx
// 100개 계산기 인덱스 — Server Component (메타데이터 + JsonLd) + Client (검색·필터)

import { Suspense } from "react";
import type { Metadata } from "next";
import { buildPageMetadata } from "@/lib/seo";
import JsonLd from "@/components/JsonLd";
import { breadcrumbLd } from "@/lib/structuredData";
import CalcIndexClient from "@/components/calc/CalcIndexClient";

export const metadata: Metadata = buildPageMetadata({
  title: "100가지 금융·생활 계산기 — 한 페이지에서 한눈에",
  description:
    "세금·연봉·대출·투자·부동산·보험·사업자·건강·생활까지 100가지 단순 계산기. 한 번에 입력하면 즉시 결과.",
  path: "/calc",
  keywords: ["100가지 계산기", "금융 계산기 모음", "생활 계산기"],
});

export default function CalcIndexPage() {
  return (
    <main className="min-h-screen bg-canvas dark:bg-canvas-950 pb-20 pt-24 sm:pt-28">
      <JsonLd
        data={breadcrumbLd([
          { name: "홈", path: "/" },
          { name: "계산기 100", path: "/calc" },
        ])}
      />
      <Suspense fallback={<div className="max-w-5xl mx-auto px-4 h-screen" />}>
        <CalcIndexClient />
      </Suspense>
    </main>
  );
}
