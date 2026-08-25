"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

// 최초 페이지 로드(SSR 직후)에는 페이드인을 생략해 LCP 지연을 막는다.
// 모듈 스코프 플래그 — 클라이언트 라우트 전환부터만 짧은 전환 애니메이션 적용.
// 2026-08-26 Phase 4 배포 2: framer-motion 셸 제거 — 루트 template 이 framer 를
// import 하면 전 페이지 First Load JS 에 실린다. 페이드는 globals.css 의
// .page-fade 키프레임(동일 duration·easing)으로 대체. Next.js template 은
// 라우트 전환마다 리마운트되므로 CSS 애니메이션이 매 전환 재생된다.
let hasLoadedOnce = false;

export default function Template({ children }: { children: React.ReactNode }) {
 const pathname = usePathname();

 // 라우트 변경 시 페이지 최상단 스크롤 — mobile/desktop 모두 안정적 UX
 useEffect(() => {
 if (typeof window !== "undefined") {
 window.scrollTo({ top: 0, behavior: "instant" });
 }
 }, [pathname]);

 const isFirstLoad = !hasLoadedOnce;
 useEffect(() => {
 hasLoadedOnce = true;
 }, []);

 return (
 <div className={isFirstLoad ? "w-full h-full" : "w-full h-full page-fade"}>
 {children}
 </div>
 );
}
