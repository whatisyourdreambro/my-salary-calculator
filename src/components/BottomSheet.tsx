"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence, PanInfo } from "framer-motion";
import { BOTTOM_AD_CHECK_INTERVAL_MS, getBottomAdHeight } from "@/lib/bottomAdDetect";

interface BottomSheetProps {
 isOpen: boolean;
 onClose: () => void;
 children: React.ReactNode;
 title?: string;
}

export default function BottomSheet({ isOpen, onClose, children, title }: BottomSheetProps) {
 // Prevent body scroll when open
 useEffect(() => {
 if (isOpen) {
 document.body.style.overflow = "hidden";
 } else {
 document.body.style.overflow = "unset";
 }
 return () => {
 document.body.style.overflow = "unset";
 };
 }, [isOpen]);

 // 하단 앵커 광고 양보(2026-09-05, §12-2 ⑪): 시트가 fixed bottom-0 라 앵커 광고가 시트 하단을 덮는다.
 // 열려 있는 동안 1초마다 하단 광고 높이를 재서 그만큼 시트 하단 여백을 준다(광고 가림·우발 클릭 회피).
 const [bottomAdPad, setBottomAdPad] = useState(0);
 useEffect(() => {
 if (!isOpen) {
 setBottomAdPad(0);
 return;
 }
 const evaluate = () => {
 try {
 setBottomAdPad(getBottomAdHeight());
 } catch {
 setBottomAdPad(0);
 }
 };
 evaluate();
 const interval = setInterval(evaluate, BOTTOM_AD_CHECK_INTERVAL_MS);
 return () => clearInterval(interval);
 }, [isOpen]);

 const handleDragEnd = (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
 if (info.offset.y > 100) {
 onClose();
 }
 };

 return (
 <AnimatePresence>
 {isOpen && (
 <>
 {/* Backdrop */}
 <motion.div
 initial={{ opacity: 0 }}
 animate={{ opacity: 1 }}
 exit={{ opacity: 0 }}
 onClick={onClose}
 className="fixed inset-0 z-50 bg-electric/60 backdrop-blur-sm"
 />

 {/* Sheet */}
 <motion.div
 initial={{ y: "100%" }}
 animate={{ y: 0 }}
 exit={{ y: "100%" }}
 transition={{ type: "spring", damping: 25, stiffness: 300 }}
 drag="y"
 dragConstraints={{ top: 0 }}
 dragElastic={0.2}
 onDragEnd={handleDragEnd}
 className="fixed bottom-0 left-0 right-0 z-50 bg-card rounded-t-[20px] shadow-2xl border-t border-white/10 max-h-[85vh] flex flex-col"
 style={{ paddingBottom: bottomAdPad }}
 >
 {/* Handle */}
 <div className="w-full flex justify-center pt-4 pb-2 cursor-grab active:cursor-grabbing">
 <div className="w-12 h-1.5 bg-muted-foreground/30 rounded-full" />
 </div>

 {/* Title */}
 {title && (
 <div className="px-6 pb-4 border-b border-border">
 <h3 className="text-lg font-bold text-center">{title}</h3>
 </div>
 )}

 {/* Content */}
 <div className="p-6 overflow-y-auto overscroll-contain pb-safe">
 {children}
 </div>
 </motion.div>
 </>
 )}
 </AnimatePresence>
 );
}
