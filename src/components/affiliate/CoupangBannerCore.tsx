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

// 페이지별 쿠팡 배너 렌더 추적 — "페이지당 최대 2회 + 같은 사이즈 중복 금지" 강제.
// (이전 1회 하드캡은 본문 배너가 사이드바 skyscraper 를 전역에서 죽여 데스크톱
// 쿠팡 인벤토리가 통째로 0이었음 — 2026-08-15 수익 개선 Phase 1 에서 완화.)
// 같은 사이즈 2회는 동일 배너 이미지가 중복 노출되므로 여전히 차단.
// 공정위 고지문은 첫 번째 인스턴스만 표시(중복 고지 방지).
// pathname 변경 시 cleanup 으로 뒤로가기/라우트 전환에도 정상 동작.
const MAX_BANNERS_PER_PAGE = 2;
const renderedBannersByPath = new Map<string, CoupangBannerSize[]>();

// 고지문 소유권 변경 구독자 — 배너가 등록/해제될 때 같은 경로의 모든 배너에
// 재평가를 알린다. 소유자가 언마운트(오퍼 승격 등)돼도 남은 배너가 즉시
// 고지문을 이어받고, 반대로 두 배너가 동시에 소유권을 주장하는 일도 없다.
const disclosureSubscribers = new Map<string, Set<() => void>>();
function notifyDisclosureOwners(pathname: string) {
  disclosureSubscribers.get(pathname)?.forEach((fn) => fn());
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
 const [resolvedSize, setResolvedSize] = useState<CoupangBannerSize>(
 responsive ? responsive.desktop : size
 );
 const [allowed, setAllowed] = useState(true);
 // bannerIndex 는 고지문 판정에서 제거됐다(isDisclosureOwner 로 대체).
 // 등록 순서는 더 이상 상태로 들고 있지 않는다 — 순서가 바뀌어도 렌더 시점의
 // renderedBannersByPath 를 직접 보므로 stale 값이 생기지 않는다.

 // 페이지별 dedup — 최대 2회, 같은 사이즈 중복 금지.
 // (effect 가 트리 순서대로 실행되므로 본문 배너가 우선권)
 //
 // ★ deps 는 반드시 원시값이어야 한다. 호출부 대부분이
 //   responsive={{ mobile: "...", desktop: "..." }} 인라인 객체를 넘기므로,
 //   deps 에 responsive 를 두면 부모가 한 번만 리렌더돼도(예: 가이드 상세의
 //   setMounted(true)) cleanup→setup 이 재실행되어 등록 순서가 뒤집힌다.
 //   그 결과 두 배너가 모두 bannerIndex!==0 이 되어 공정위 고지문이 페이지에서
 //   통째로 사라졌다 — 가이드 상세 334쪽에서 100% 재현 (2026-09-06 전수검사).
 const registrationKey = responsive ? responsive.desktop : size;
 // 모바일 렌더 사이즈 키 — 등록(dedup)은 실제 렌더될 사이즈로 비교해야 한다. 데스크톱 키만 비교하면
 // large-portrait(본문)+leaderboard(푸터)가 모바일에서 둘 다 mobile-banner 로 렌더돼 같은 크리에이티브가
 // 한 페이지에 2번 나왔다(가이드 상세 ~308쪽, 2026-09-11 감사). 원시값이라 deps 규칙(위 주석)을 지킨다.
 const mobileKey = responsive?.mobile;
 // 등록 배열의 첫 항목이 고지문 소유자다. 첫 렌더에는 아직 등록 전이라
 // 아무도 소유자가 아니고(=false), 등록 이펙트가 끝난 뒤 구독 알림으로
 // 정확히 한 배너만 true 가 된다. 렌더 중에 레지스트리를 읽으면 등록 전
 // 두 배너가 동시에 소유권을 주장해 고지문이 2번 나온다.
 const [isDisclosureOwner, setIsDisclosureOwner] = useState(false);
 useEffect(() => {
 if (!pathname) return;
 // 사이즈 키는 마운트 시점의 실제 렌더 사이즈(뷰포트 768px 기준) — resize 로 바뀌어도 등록 키는 고정
 const sizeKey: CoupangBannerSize =
 mobileKey && window.innerWidth < 768 ? mobileKey : registrationKey;
 const sizes = renderedBannersByPath.get(pathname) ?? [];
 if (sizes.length >= MAX_BANNERS_PER_PAGE || sizes.includes(sizeKey)) {
 setAllowed(false);
 return;
 }
 sizes.push(sizeKey);
 renderedBannersByPath.set(pathname, sizes);
 setAllowed(true);

 // 소유권 재평가 구독 — 이 경로의 배너가 늘거나 줄 때마다 다시 판정한다.
 const reevaluate = () =>
 setIsDisclosureOwner(
 renderedBannersByPath.get(pathname)?.[0] === sizeKey
 );
 const subs = disclosureSubscribers.get(pathname) ?? new Set<() => void>();
 subs.add(reevaluate);
 disclosureSubscribers.set(pathname, subs);
 notifyDisclosureOwners(pathname);

 return () => {
 const current = renderedBannersByPath.get(pathname) ?? [];
 const idx = current.indexOf(sizeKey);
 if (idx >= 0) current.splice(idx, 1);
 if (current.length === 0) renderedBannersByPath.delete(pathname);
 else renderedBannersByPath.set(pathname, current);
 subs.delete(reevaluate);
 if (subs.size === 0) disclosureSubscribers.delete(pathname);
 setIsDisclosureOwner(false);
 notifyDisclosureOwners(pathname);
 };
 }, [pathname, registrationKey, mobileKey]);

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
