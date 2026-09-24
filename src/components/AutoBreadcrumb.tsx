"use client";

// 클라이언트 사이드 자동 BreadcrumbList JSON-LD 주입.
// layout 안에 한 번만 박아두면 하위 모든 페이지가 현재 path 기반 빵부스러기 SEO 신호를 자동 노출.
// (서버 컴포넌트 layout은 child path를 직접 모르므로 client훅이 가장 깔끔 — Google은 JS 렌더 후 JSON-LD를 인식)

import { usePathname } from "next/navigation";
import { autoBreadcrumbLd } from "@/lib/structuredData";
import JsonLd from "@/components/JsonLd";

interface Props {
  /**
   * 마지막(현재) 페이지의 한글 라벨. 미지정 시 structuredData 의 경로별 라벨 맵
   * (LEAF_LABELS — /fun/* 등)을 쓰고, 거기에도 없으면 영문 슬러그를 싣지 않고 마지막 단계를
   * 생략한다 (2026-09-25 B14 META-09). 페이지 없는 중간 경로(/pro 등)도 자동으로 건너뛴다.
   */
  leafName?: string;
}

export default function AutoBreadcrumb({ leafName }: Props) {
  const pathname = usePathname();
  if (!pathname || pathname === "/") return null;
  const data = autoBreadcrumbLd(pathname, leafName ? { leafName } : {});
  return <JsonLd data={data} />;
}
