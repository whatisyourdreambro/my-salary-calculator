"use client";

// 클라이언트 사이드 자동 BreadcrumbList JSON-LD 주입.
// layout 안에 한 번만 박아두면 하위 모든 페이지가 현재 path 기반 빵부스러기 SEO 신호를 자동 노출.
// (서버 컴포넌트 layout은 child path를 직접 모르므로 client훅이 가장 깔끔 — Google은 JS 렌더 후 JSON-LD를 인식)

import { usePathname } from "next/navigation";
import { autoBreadcrumbLd } from "@/lib/structuredData";

interface Props {
  /** 마지막(현재) 페이지의 한글 라벨. 미지정 시 slug → " " 변환 자동. */
  leafName?: string;
}

export default function AutoBreadcrumb({ leafName }: Props) {
  const pathname = usePathname();
  if (!pathname || pathname === "/") return null;
  const data = autoBreadcrumbLd(pathname, leafName ? { leafName } : {});
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
