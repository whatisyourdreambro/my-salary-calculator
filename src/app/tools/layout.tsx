// src/app/tools/layout.tsx
//
// 모든 /tools/* 페이지 하단에 RelatedCalculators 자동 노출.
// usePathname()으로 현재 페이지 인식 → 카테고리별 cross-link.

import RelatedCalculators from "@/components/RelatedCalculators";

export default function ToolsLayout({ children }: { children: React.ReactNode }) {
 return (
 <>
 {children}
 <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
 <RelatedCalculators />
 </div>
 </>
 );
}
