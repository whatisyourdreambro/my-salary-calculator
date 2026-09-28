"use client";

// /calc/* 페이지별 '마지막 광고 아래' 정적 링크 한 줄 (2026-09-28, S18 — 첫 항목: 성과급 허브 → 성과급 내 집 마련 계산기).
// ★ 배치 규칙: calc/layout.tsx 의 **맨 끝**(광고 블록 InArticleAd·쿠팡·HomeTopAd, 공유 fallback, FloatingShareBar 뒤)에만.
//   /calc 페이지는 본문 전부가 calc/layout 하단 광고 위에 있어서 page.tsx 에 두면 어디에 두든 그 광고를 밀어낸다
//   (2026-08-16 "광고 위 UI 삽입" 규칙 — bonusDealStatusR4.test.ts 5번, GuideSupplement 의 9/12 이관 선례).
//   맨 끝이라 기존 형제 요소의 자동광고 CSS 경로(nth-child)도 바뀌지 않는다.
// - layout 에는 params 가 없어 usePathname 으로 경로를 고른다(GuideSupplement·CompanyRelatedJobs 와 같은 패턴).
//   usePathname 은 서버 렌더에서도 동작하므로 프리렌더 HTML 에 <a href> 가 들어간다 → 크롤러가 따라갈 수 있다.
// - 항목이 없는 경로는 null — 다른 /calc 페이지의 DOM 은 그대로다.
// - data-msy-module="calc-after-ads": 루트 InternalLinkTracker 의 클릭 위임 계측(guide_cta_click, position=calc-after-ads —
//   목적지는 dest_tpl 로 구분). 모듈 id 는 internalLinkModules.test.ts 에 등재돼 있다.
// - 항목을 늘릴 때는 광고 위치 규칙과 대상 URL 의 등재 범위(예: bonusHomeRegistration.test.ts)를 먼저 확인한다.
import { usePathname } from "next/navigation";
import Link from "@/components/AppLink";

export interface CalcAfterAdsLinkItem {
  before: string;
  href: string;
  label: string;
  after: string;
}

/** 현재 경로(끝 슬래시 없음) → 링크 한 줄 */
export const CALC_AFTER_ADS_LINKS: ReadonlyMap<string, CalcAfterAdsLinkItem> = new Map([
  // 성과급 허브의 회사별 레지스트리(BONUS_CALCS — 사이트 전역 '23종' 문구)에는 넣지 않고, 광고 아래 이 한 줄만 둔다.
  [
    "/calc/bonus-calculators",
    {
      before: "성과급을 몇 년 모으면 동탄·평택·이천 아파트를 살 수 있을지는 ",
      href: "/calc/bonus-home-plan",
      label: "성과급 내 집 마련 계산기",
      after: "에서 영업이익 시나리오(가정)와 DSR 한도로 계산해 볼 수 있습니다.",
    },
  ],
]);

export function calcAfterAdsLinkFor(pathname: string | null | undefined): CalcAfterAdsLinkItem | null {
  if (!pathname) return null;
  const key = pathname.length > 1 ? pathname.replace(/\/+$/, "") : pathname;
  return CALC_AFTER_ADS_LINKS.get(key) ?? null;
}

export default function CalcAfterAdsLink() {
  const item = calcAfterAdsLinkFor(usePathname());
  if (!item) return null;

  // 폭은 calc/layout 광고 블록(max-w-4xl·같은 좌우 여백)과 맞춘다. 클래스는 모두 기존 사용분(CSS 번들 불변).
  return (
    <p
      data-msy-module="calc-after-ads"
      className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-10 text-sm leading-relaxed text-faint"
    >
      {item.before}
      <Link href={item.href} className="font-bold text-primary hover:underline">
        {item.label}
      </Link>
      {item.after}
    </p>
  );
}
