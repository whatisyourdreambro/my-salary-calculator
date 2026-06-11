"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";

// 최초 페이지 로드(SSR 직후)에는 페이드인을 생략해 LCP 지연을 막는다.
// 모듈 스코프 플래그 — 클라이언트 라우트 전환부터만 짧은 전환 애니메이션 적용.
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
 <motion.div
 initial={isFirstLoad ? false : { opacity: 0, y: 8 }}
 animate={{ opacity: 1, y: 0 }}
 exit={{ opacity: 0, y: 4 }}
 transition={{
 duration: 0.25,
 ease: [0.22, 1, 0.36, 1], // iOS style custom spring easing
 }}
 className="w-full h-full"
 >
 {children}
 </motion.div>
 );
}
