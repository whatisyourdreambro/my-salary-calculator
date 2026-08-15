"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import {
 buildCoupangSubId,
 inferCoupangCategory,
 type CoupangCategory,
} from "@/lib/coupangContextMap";
import { trackCoupangClick } from "@/lib/analytics";

/**
 * 쿠팡 파트너스 배너 — 9가지 사이즈 자동 분배 시스템
 *
 * 사이즈별 배너 ID/링크는 쿠팡 파트너스 대시보드에서 발급받은 값.
 * 각 traceId는 광고 추적용으로 발급된 고유값이라 그대로 사용해야
 * 클릭 데이터가 정확히 집계됨.
 */
const BANNERS = {
 leaderboard: {
 id: 986008,
 w: 728,
 h: 90,
 link: "eCfhX9",
 trace: "V0-301-5f9bd61900e673c0-I986008",
 },
 "large-portrait": {
 id: 986011,
 w: 600,
 h: 900,
 link: "eCfJBV",
 trace: "V0-301-bae0f72e5e59e45f-I986011",
 },
 "mobile-portrait": {
 id: 986015,
 w: 320,
 h: 480,
 link: "eCfOq4",
 trace: "V0-301-50c6c2b97fba9aee-I986015",
 },
 "mobile-banner": {
 id: 986017,
 w: 320,
 h: 100,
 link: "eCfO0c",
 trace: "V0-301-371ae01f4226dec2-I986017",
 },
 rectangle: {
 id: 986021,
 w: 300,
 h: 250,
 link: "eCfPJe",
 trace: "V0-301-c1744fa69c93f626-I986021",
 },
 square: {
 id: 986023,
 w: 200,
 h: 200,
 link: "eCfQez",
 trace: "V0-301-5079b8362432a905-I986023",
 },
 skyscraper: {
 id: 986025,
 w: 160,
 h: 600,
 link: "eCfQCI",
 trace: "V0-301-0fd2df58973b32a5-I986025",
 },
 micro: {
 id: 986027,
 w: 150,
 h: 60,
 link: "eCfQ1g",
 trace: "V0-301-efafde73812c2264-I986027",
 },
 button: {
 id: 986029,
 w: 120,
 h: 60,
 link: "eCfRuh",
 trace: "V0-301-8be2627c04ed5569-I986029",
 },
} as const;

export type CoupangBannerSize = keyof typeof BANNERS;

interface CoupangBannerProps {
 /** 단일 사이즈 (responsive 미사용 시) */
 size?: CoupangBannerSize;
 /** 모바일/데스크톱 자동 분기 - 768px 기준 */
 responsive?: { mobile: CoupangBannerSize; desktop: CoupangBannerSize };
 className?: string;
 /** 공정위 고지문구 표시 (페이지당 1번만 노출 권장) */
 showDisclosure?: boolean;
 /** 외부 컨테이너 인라인 스타일 오버라이드 */
 style?: React.CSSProperties;
 /**
  * 쿠팡 subId 카테고리 접두사. 미지정 시 pathname 으로 자동 추론.
  * 쿠팡 대시보드에서 카테고리별 클릭/전환 분리 분석 가능.
  */
 category?: CoupangCategory;
}

const DISCLOSURE_TEXT =
 "이 포스팅은 쿠팡 파트너스 활동의 일환으로, 이에 따른 일정액의 수수료를 제공받습니다.";

// 페이지별 쿠팡 배너 렌더 추적 — "페이지당 최대 2회 + 같은 사이즈 중복 금지" 강제.
// (이전 1회 하드캡은 본문 배너가 사이드바 skyscraper 를 전역에서 죽여 데스크톱
// 쿠팡 인벤토리가 통째로 0이었음 — 2026-08-15 수익 개선 Phase 1 에서 완화.)
// 같은 사이즈 2회는 동일 배너 이미지가 중복 노출되므로 여전히 차단.
// 공정위 고지문은 첫 번째 인스턴스만 표시(중복 고지 방지).
// pathname 변경 시 cleanup 으로 뒤로가기/라우트 전환에도 정상 동작.
const MAX_BANNERS_PER_PAGE = 2;
const renderedBannersByPath = new Map<string, CoupangBannerSize[]>();

export default function CoupangBanner({
 size = "leaderboard",
 responsive,
 className = "",
 showDisclosure = true,
 style,
 category,
}: CoupangBannerProps) {
 const pathname = usePathname();
 const [resolvedSize, setResolvedSize] = useState<CoupangBannerSize>(
 responsive ? responsive.desktop : size
 );
 const [allowed, setAllowed] = useState(true);
 const [bannerIndex, setBannerIndex] = useState(0);

 // 페이지별 dedup — 최대 2회, 같은 사이즈 중복 금지.
 // (effect 가 트리 순서대로 실행되므로 본문 배너가 우선권)
 useEffect(() => {
 if (!pathname) return;
 // 사이즈 키는 마운트 시점 기준(데스크톱 기본값) — resize 로 바뀌어도 등록 키는 고정
 const sizeKey = responsive ? responsive.desktop : size;
 const sizes = renderedBannersByPath.get(pathname) ?? [];
 if (sizes.length >= MAX_BANNERS_PER_PAGE || sizes.includes(sizeKey)) {
 setAllowed(false);
 return;
 }
 sizes.push(sizeKey);
 renderedBannersByPath.set(pathname, sizes);
 setBannerIndex(sizes.length - 1);
 setAllowed(true);
 return () => {
 const current = renderedBannersByPath.get(pathname) ?? [];
 const idx = current.indexOf(sizeKey);
 if (idx >= 0) current.splice(idx, 1);
 if (current.length === 0) renderedBannersByPath.delete(pathname);
 else renderedBannersByPath.set(pathname, current);
 };
 }, [pathname, responsive, size]);

 useEffect(() => {
 if (!responsive) {
 setResolvedSize(size);
 return;
 }
 const update = () => {
 setResolvedSize(
 window.innerWidth < 768 ? responsive.mobile : responsive.desktop
 );
 };
 update();
 window.addEventListener("resize", update);
 return () => window.removeEventListener("resize", update);
 }, [responsive, size]);

 // 영문 페이지(/en/*)에서는 한국 트래픽 전용 쿠팡 배너 숨김
 if (pathname?.startsWith("/en")) return null;

 // 페이지당 1회 dedup — 두 번째 이후 인스턴스는 렌더하지 않음
 if (!allowed) return null;

 const banner = BANNERS[resolvedSize];
 // subId: 카테고리 접두사 + path → 쿠팡 대시보드에서 카테고리/페이지 단위 분리 측정.
 const resolvedCategory = category ?? inferCoupangCategory(pathname);
 const subId = buildCoupangSubId(resolvedCategory, pathname);
 const imgSrc = `https://ads-partners.coupang.com/banners/${banner.id}?subId=${encodeURIComponent(subId)}&traceId=${banner.trace}&w=${banner.w}&h=${banner.h}`;
 const linkHref = `https://link.coupang.com/a/${banner.link}`;

 return (
 <div
 className={`coupang-banner-wrapper ${className}`}
 style={{
 width: "100%",
 display: "flex",
 flexDirection: "column",
 alignItems: "center",
 margin: "1.5rem 0",
 ...style,
 }}
 >
 <a
 href={linkHref}
 target="_blank"
 rel="sponsored nofollow noopener noreferrer"
 referrerPolicy="unsafe-url"
 onClick={() => trackCoupangClick(resolvedSize, resolvedCategory, pathname ?? undefined)}
 style={{
 display: "block",
 lineHeight: 0,
 maxWidth: `${banner.w}px`,
 width: "100%",
 }}
 >
 {/* eslint-disable-next-line @next/next/no-img-element */}
 <img
 src={imgSrc}
 width={banner.w}
 height={banner.h}
 alt="쿠팡 추천 상품"
 loading="lazy"
 style={{
 width: "100%",
 height: "auto",
 display: "block",
 borderRadius: "8px",
 maxWidth: `${banner.w}px`,
 }}
 />
 </a>
 {showDisclosure && bannerIndex === 0 && (
 <p
 style={{
 fontSize: "11px",
 color: "#7A9AB5",
 marginTop: "8px",
 textAlign: "center",
 lineHeight: 1.5,
 fontWeight: 500,
 maxWidth: "640px",
 padding: "0 1rem",
 }}
 >
 {DISCLOSURE_TEXT}
 </p>
 )}
 </div>
 );
}
