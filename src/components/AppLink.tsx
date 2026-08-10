// 전역 Link 래퍼 — prefetch 기본값을 false로 강제.
//
// 배경(2026-08-10): App Router의 <Link>는 기본값(prefetch 미지정)일 때
// 뷰포트에 들어온 모든 링크의 RSC 페이로드를 미리 요청한다. 이 사이트는
// 페이지당 링크가 많아(표 4종은 행마다 /salary/* 링크 100+개) 1 페이지뷰가
// CF Worker 요청 수십~수백 건으로 증폭 → Workers 무료 플랜 일 10만 요청
// 한도 초과의 최대 원인. prefetch는 클릭 시 온디맨드 로드로 대체된다
// (체감 지연 ~100-300ms, 요청 수 대비 수용).
//
// ★ 새 코드에서 next/link를 직접 import하지 말 것 — 반드시 이 래퍼를 사용.
//   특정 링크만 프리페치가 꼭 필요하면 <Link prefetch> 로 명시 오버라이드.
import NextLink from "next/link";
import type { ComponentProps } from "react";

type AppLinkProps = ComponentProps<typeof NextLink>;

export default function AppLink({ prefetch = false, ...props }: AppLinkProps) {
  return <NextLink prefetch={prefetch} {...props} />;
}
