"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { usePathname } from "next/navigation";
import {
 buildCoupangSubId,
 inferCoupangCategory,
 type CoupangCategory,
} from "@/lib/coupangContextMap";
import { trackCoupangClick } from "@/lib/analytics";
import { canRequestLiveAds } from "@/lib/liveAds";

/**
 * 쿠팡 파트너스 배너 — 9가지 사이즈 자동 분배 시스템 (AffiliateSlot 의 폴백 코어)
 *
 * 사이즈별 배너 ID/링크는 쿠팡 파트너스 대시보드에서 발급받은 값.
 * 각 traceId는 광고 추적용으로 발급된 고유값이라 그대로 사용해야
 * 클릭 데이터가 정확히 집계됨.
 *
 * ⚠️ 직접 import 금지 — 반드시 @/components/CoupangBanner(= AffiliateSlot 심)를
 *    통해 렌더한다. 오퍼(offers.json) 활성 시 이 배너 대신 제휴 오퍼가 노출되는
 *    구조라, 코어를 직접 쓰면 오퍼 전환이 누락된다. (유일한 소비처: AffiliateSlot)
 *    본문 동작(subId·dedup 캡·고지·/en null)은 2026-08 오퍼 인프라 도입 때
 *    src/components/CoupangBanner.tsx 에서 그대로 이동 — 변경 없음.
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

export interface CoupangBannerProps {
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

// 대기 중인 기존 슬롯도 등록 순서를 유지한다. 화면 크기 변경 때 모든 후보의
// 실제 크기를 함께 판정해 최대 2개·같은 크기 1개·고지 소유자 1개를 유지한다.
const MAX_BANNERS_PER_PAGE = 2;
type BannerCandidate = {
 id: symbol;
 desktop: CoupangBannerSize;
 mobile: CoupangBannerSize | undefined;
};
type BannerSelection = Omit<BannerCandidate, "id"> & {
 pathname: string;
 size: CoupangBannerSize;
 disclosureOwner: boolean;
};
const candidatesByPath = new Map<string, BannerCandidate[]>();
const selections = new Map<symbol, BannerSelection>();
const selectionSubscribers = new Set<() => void>();
function subscribeSelections(callback: () => void) {
 selectionSubscribers.add(callback);
 return () => { selectionSubscribers.delete(callback); };
}
const serverSelection = () => null;

function reconcileSelections() {
 let changed = false;
 for (const [pathname, candidates] of candidatesByPath) {
 const sizes = new Set<CoupangBannerSize>();
 for (const candidate of candidates) {
 const size = candidate.mobile && window.innerWidth < 768 ? candidate.mobile : candidate.desktop;
 const previous = selections.get(candidate.id);
 if (sizes.size >= MAX_BANNERS_PER_PAGE || sizes.has(size)) {
 changed = selections.delete(candidate.id) || changed;
 continue;
 }
 const disclosureOwner = sizes.size === 0;
 sizes.add(size);
 if (!previous || previous.pathname !== pathname || previous.desktop !== candidate.desktop ||
 previous.mobile !== candidate.mobile || previous.size !== size || previous.disclosureOwner !== disclosureOwner) {
 selections.set(candidate.id, { pathname, desktop: candidate.desktop, mobile: candidate.mobile, size, disclosureOwner });
 changed = true;
 }
 }
 }
 // Publish after the whole arbitration, so subscribers cannot read half-updated
 // effective sizes. React also rechecks these snapshots before committing.
 if (changed) selectionSubscribers.forEach(callback => callback());
}

function registerCandidate(pathname: string, candidate: BannerCandidate) {
 if (candidatesByPath.size === 0) window.addEventListener("resize", reconcileSelections);
 const candidates = candidatesByPath.get(pathname) ?? [];
 candidates.push(candidate);
 candidatesByPath.set(pathname, candidates);
 reconcileSelections();
 return () => {
 const remaining = (candidatesByPath.get(pathname) ?? []).filter(item => item.id !== candidate.id);
 if (remaining.length) candidatesByPath.set(pathname, remaining);
 else candidatesByPath.delete(pathname);
 const removedSelection = selections.delete(candidate.id);
 reconcileSelections();
 if (removedSelection) selectionSubscribers.forEach(callback => callback());
 if (candidatesByPath.size === 0) window.removeEventListener("resize", reconcileSelections);
 };
}

export default function CoupangBannerCore({
 size = "leaderboard",
 responsive,
 className = "",
 showDisclosure = true,
 style,
 category,
}: CoupangBannerProps) {
 const pathname = usePathname();
 const [candidateId] = useState(() => Symbol("coupang-banner"));
 const desktopKey = responsive ? responsive.desktop : size;
 const mobileKey = responsive?.mobile;
 const selection = useSyncExternalStore(subscribeSelections, () => selections.get(candidateId) ?? null, serverSelection);
 // Primitive dependencies preserve registration order across ordinary rerenders
 // with fresh responsive object literals. No candidate renders before admission.
 useEffect(() => {
 if (!pathname || pathname.startsWith("/en") || !canRequestLiveAds()) return;
 return registerCandidate(pathname, { id: candidateId, desktop: desktopKey, mobile: mobileKey });
 }, [pathname, candidateId, desktopKey, mobileKey]);

 // A previous route/prop snapshot cannot authorize the next document's image.
 if (!selection || selection.pathname !== pathname || selection.desktop !== desktopKey ||
 selection.mobile !== mobileKey || pathname?.startsWith("/en") || !canRequestLiveAds()) return null;
 const resolvedSize = selection.size;
 const isDisclosureOwner = selection.disclosureOwner;

 const banner = BANNERS[resolvedSize];
 // subId: 카테고리 접두사 + path → 쿠팡 대시보드에서 카테고리/페이지 단위 분리 측정.
 const resolvedCategory = category ?? inferCoupangCategory(pathname);
 const subId = buildCoupangSubId(resolvedCategory, pathname);
 const imgSrc = `https://ads-partners.coupang.com/banners/${banner.id}?subId=${encodeURIComponent(subId)}&traceId=${banner.trace}&w=${banner.w}&h=${banner.h}`;
 const linkHref = `https://link.coupang.com/a/${banner.link}`;

 return (
 <div
 data-html2canvas-ignore="true"
 className={`coupang-banner-wrapper ${className}`}
 data-coupang-banner-size={resolvedSize}
 data-coupang-category={resolvedCategory}
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
 // 개인 페이로드가 경로에 실리는 /share/[data] 에서는 전체 URL 을 리퍼러로
 // 보내지 않는다(연봉 base64 가 쿠팡에 그대로 전달됐다). 그 외에는 기존대로
 // 전체 URL 을 보내 쿠팡 어트리뷰션을 유지한다.
 referrerPolicy={pathname?.startsWith("/share/") ? "origin" : "unsafe-url"}
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
 {/* 고지문은 페이지에 쿠팡 배너가 하나라도 있으면 반드시 하나는 나와야 한다
     (공정위 추천·보증 심사지침 + 쿠팡 파트너스 약관). 인덱스 0 에만 붙이면
     등록 순서가 흔들리거나 0번 배너가 오퍼로 승격돼 언마운트될 때 고지문이
     통째로 사라진다 — 아래 disclosureOwner 로 소유권을 재할당한다. */}
 {showDisclosure && isDisclosureOwner && (
 <p
 style={{
 fontSize: "11px",
 // A fixed surface keeps the disclosure readable inside both themed cards
 // and legacy sections that retain an inline white background in dark mode.
 color: "#3D5E78",
 backgroundColor: "#FFFFFF",
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
