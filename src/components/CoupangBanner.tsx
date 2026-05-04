"use client";

import { useEffect, useState } from "react";

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
}

const DISCLOSURE_TEXT =
 "이 포스팅은 쿠팡 파트너스 활동의 일환으로, 이에 따른 일정액의 수수료를 제공받습니다.";

export default function CoupangBanner({
 size = "leaderboard",
 responsive,
 className = "",
 showDisclosure = true,
 style,
}: CoupangBannerProps) {
 const [resolvedSize, setResolvedSize] = useState<CoupangBannerSize>(
 responsive ? responsive.desktop : size
 );

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

 const banner = BANNERS[resolvedSize];
 const imgSrc = `https://ads-partners.coupang.com/banners/${banner.id}?subId=&traceId=${banner.trace}&w=${banner.w}&h=${banner.h}`;
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
 rel="noopener noreferrer"
 referrerPolicy="unsafe-url"
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
 {showDisclosure && (
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
