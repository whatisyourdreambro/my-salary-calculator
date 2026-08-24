import { Suspense } from "react";
import { enGuideCards, categoriesEn } from "@/lib/guidesData";
import EnglishGuidesClient from "./EnglishGuidesClient";
import type { Metadata } from "next";
import { buildPageMetadata } from "@/lib/seo";

// en 로케일 수렴 (2026-08-24): buildPageMetadata locale:"en"으로
// 접미사·og:locale·og:image(자동)·hreflang(ko-KR/x-default=/guides) 표준화.
export const metadata: Metadata = buildPageMetadata({
 title: "Finance Guides for Working in Korea",
 description:
  "In-depth English guides on Korean salary, semiconductor stocks, employee stock plans, taxes, and personal finance for professionals working in Korea.",
 path: "/en/guides",
 locale: "en",
 koPath: "/guides",
});

export default function EnglishGuidesIndex() {
 // useSearchParams(q 검색 초기값)를 쓰는 클라이언트 컴포넌트라 Suspense 경계 필요
 return (
  <Suspense>
   <EnglishGuidesClient guides={enGuideCards} categoriesEn={categoriesEn} />
  </Suspense>
 );
}
