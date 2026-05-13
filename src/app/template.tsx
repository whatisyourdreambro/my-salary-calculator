"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";

export default function Template({ children }: { children: React.ReactNode }) {
 const pathname = usePathname();

 // 라우트 변경 시 페이지 최상단 스크롤 — mobile/desktop 모두 안정적 UX
 useEffect(() => {
 if (typeof window !== "undefined") {
 window.scrollTo({ top: 0, behavior: "instant" });
 }
 }, [pathname]);

 return (
 <motion.div
 initial={{ opacity: 0, y: 12, filter: "blur(4px)" }}
 animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
 exit={{ opacity: 0, y: 6, filter: "blur(2px)" }}
 transition={{
 duration: 0.5,
 ease: [0.22, 1, 0.36, 1], // iOS style custom spring easing
 staggerChildren: 0.1,
 }}
 className="w-full h-full"
 >
 {children}
 </motion.div>
 );
}
