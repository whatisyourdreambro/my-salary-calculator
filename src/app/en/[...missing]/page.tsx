import type { Metadata } from "next";
import { notFound } from "next/navigation";

// Keep unmatched English URLs inside the English layout and recovery links.
//
// 2026-09-23 CPU 한도(1102) 대응: edge 캐치올 → 빌드 타임 정적 404. 미들웨어가 존재하지 않는
// /en/guides|tools/<slug> 를 /en/page-unavailable 로 rewrite 하므로(src/middleware.ts) 그 경로
// 하나만 프리렌더한다 — notFound() 가 en/not-found.tsx 를 404 상태로 정적 출력한다.
// 그 외 /en/<unknown> 직접 요청은 전역 404(dynamicParams=false). 종전에는 이 캐치올이 매 요청
// 루트 레이아웃까지 edge 렌더해 33KB 404 응답도 1/8 이 503(1102) 이었다.
export const dynamicParams = false;
export const metadata: Metadata = { robots: { index: false, follow: false } };

export function generateStaticParams(): { missing: string[] }[] {
  return [{ missing: ["page-unavailable"] }];
}

export default function MissingEnglishPage(): never {
  notFound();
}
