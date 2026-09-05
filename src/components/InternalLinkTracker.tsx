"use client";

// 서버 컴포넌트 링크 모듈 클릭 계측 (2026-09-05, 10배 계획 retention-pv-6)
//
// RelatedCompanies·CompanyIndustryRank·CompanyConnections·BonusClusterLinks 등
// 회사·직업 페이지의 링크 모듈은 서버 컴포넌트라 onClick 을 붙일 수 없다.
// 클라이언트 전환(번들 증가) 대신 루트 레이아웃에 무렌더 컴포넌트 1개를 두고
// document 클릭 위임으로 a[href^='/'] 가 [data-msy-module] 안에 있으면
// 기존 guide_cta_click(position=모듈 id) 이벤트를 재사용해 보낸다.
//
// - 새 이벤트명을 만들지 않는다: 9/7 등록 예정인 'position' 측정기준으로 바로 분해되고
//   GA4 이벤트 종류·측정기준 한도도 소모하지 않는다.
// - RelatedCalculators/NextActions/RelatedGuides/samsung-bonus 는 이미 onClick 으로
//   guide_cta_click 을 보내므로 data-msy-module 을 주지 않아 2중 집계가 없다.
// - 광고 iframe 내부 클릭은 cross-origin 이라 document 위임에 잡히지 않는다(ad_unit_click 무관).
// - 외부 링크(http…)·앵커(#)·쿠팡/제휴 링크는 href^='/' 필터로 제외된다.
import { useEffect } from "react";
import { trackInternalLinkClick } from "@/lib/analytics";

export const MODULE_ATTR = "data-msy-module";

export default function InternalLinkTracker() {
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      const target = e.target;
      if (!(target instanceof Element)) return;
      const anchor = target.closest("a[href]");
      if (!anchor) return;
      const href = anchor.getAttribute("href") ?? "";
      // 사이트 내부 경로만 (protocol-relative '//' 제외)
      if (!href.startsWith("/") || href.startsWith("//")) return;
      const holder = anchor.closest(`[${MODULE_ATTR}]`);
      if (!holder) return;
      const moduleId = holder.getAttribute(MODULE_ATTR);
      if (!moduleId) return;
      trackInternalLinkClick(href, moduleId);
    };
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, []);

  return null;
}
