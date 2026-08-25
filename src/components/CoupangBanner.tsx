// src/components/CoupangBanner.tsx — re-export 심(shim).
//
// 2026-08 수익화 인프라 도입: 기존 쿠팡 배너 본문은
// src/components/affiliate/CoupangBannerCore.tsx 로 그대로 이동했고,
// 이 경로의 default export 는 AffiliateSlot 이 된다.
//
// 효과: 기존 ~84개 호출부(<CoupangBanner .../>)를 한 줄도 수정하지 않고 전부
// AffiliateSlot 을 경유한다 — offers.json 활성 오퍼가 매칭되면 오퍼 카드,
// 아니면 기존 쿠팡 배너가 픽셀·subId 동일하게 렌더된다(폴백).
// 신규 코드는 vertical/calcResult/offerOnly 등 확장 props 도 그대로 쓸 수 있다.
//
// ⚠️ 이 파일을 CoupangBannerCore 직접 re-export 로 되돌리면 오퍼 전환 경로가
//    통째로 끊긴다 — 변경 금지.
export { default } from "./affiliate/AffiliateSlot";
export type { AffiliateSlotProps } from "./affiliate/AffiliateSlot";
export type {
  CoupangBannerProps,
  CoupangBannerSize,
} from "./affiliate/CoupangBannerCore";
