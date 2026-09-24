// src/lib/ogUrlVersion.ts
//
// 공개 og:image 주소의 버전과 연봉 카드(type=salary) 주소 빌더.
// 네이버·카카오 같은 외부 스크래퍼는 og:image "주소" 단위로 썸네일을 오래 붙잡는다.
// ogImageCache.ts 의 IMAGE_VERSION 은 내부 Cache API 키에만 들어가 외부 캐시를 바꾸지 못해,
// 9/23 이전의 ASCII 'MoneySalary' 대체 이미지가 네이버 썸네일에 남아 있었다 (OG-03, 2026-09-24 실측).
// 이 모듈은 클라이언트(SalaryCalculator)에서도 import 하므로 서버 캐시 로직(ogImageCache.ts)을 끌어오지 않는다.
//
// 연봉 카드 디자인을 바꿀 때: ogImageCache.ts 의 IMAGE_VERSION 과 함께 이 값도 올린 뒤 카카오 재스크랩.
// 범위는 연봉 계열 주소만 — buildPageMetadata 기본값·가이드·회사 카드는 네이버 CTR 실험 판정 창
// (/home-loan 10/5, /calc/hyundai-bonus 10/17) 뒤에 따로 적용한다. samsung-bonus 는 동결로 제외.
export const OG_URL_VERSION = "20260924";

/**
 * OG 카드는 금액을 만원 단위로만 그린다(route.tsx renderSalaryOg). 주소·캐시 키도 1만원 단위로 모아
 * 같은 카드가 원 단위 차이로 매번 새로 렌더되지 않게 한다 (OG-09). 표시값은 수학적으로 같다:
 * round(round(x/1e4)*1e4/1e4) = round(x/1e4).
 */
export function roundOgWon(value: number): number {
  return Math.round(value / 10_000) * 10_000;
}

/** type=salary 카드 경로(origin 없음). monthlyNet 이 없거나 0 이면 net 을 생략한다(종전과 같음). */
export function salaryOgImagePath(amount: number, monthlyNet?: number): string {
  const net = monthlyNet ? `&net=${roundOgWon(monthlyNet)}` : "";
  return `/api/og?type=salary&amount=${roundOgWon(amount)}${net}&v=${OG_URL_VERSION}`;
}
