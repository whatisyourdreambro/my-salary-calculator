"use client";

import { useEffect, useId, useRef, useState } from "react";
import { motion, AnimatePresence, PanInfo, useReducedMotion } from "framer-motion";
import { observeBottomSheetSpace, type BottomSheetSpace } from "@/lib/bottomSheetLayout";

interface BottomSheetProps {
 isOpen: boolean;
 onClose: () => void;
 children: React.ReactNode;
 title?: string;
}

export default function BottomSheet({ isOpen, onClose, children, title }: BottomSheetProps) {
 const [space, setSpace] = useState<BottomSheetSpace | null>(null);
 const closeRef = useRef(onClose);
 const sheetRef = useRef<HTMLDivElement>(null);
 const titleId = useId();
 const reduceMotion = useReducedMotion();
 useEffect(() => { closeRef.current = onClose; }, [onClose]);

 useEffect(() => {
 if (!isOpen) { setSpace(null); return; }
 return observeBottomSheetSpace((next) => {
 setSpace((old) => old && old.bottom === next.bottom && old.maxHeight === next.maxHeight &&
 old.paddingBottom === next.paddingBottom ? old : next);
 }, () => {
 setSpace(null);
 closeRef.current();
 });
 }, [isOpen]);

 const visible = isOpen && space !== null;
 useEffect(() => {
 if (!visible) return;
 const overflow = document.body.style.overflow;
 const previousFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null;
 document.body.style.overflow = "hidden";
 sheetRef.current?.focus({ preventScroll: true });
 const onKeyDown = (event: KeyboardEvent) => {
 if (event.key === "Escape") { event.preventDefault(); closeRef.current(); return; }
 if (event.key !== "Tab") return;
 const controls = Array.from(sheetRef.current?.querySelectorAll<HTMLElement>(
 'button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), a[href], [tabindex="0"]',
 ) ?? []).filter((element) => element.getClientRects().length > 0);
 const first = controls[0], last = controls.at(-1);
 if (!first) { event.preventDefault(); sheetRef.current?.focus(); return; }
 if (event.shiftKey && (document.activeElement === first || document.activeElement === sheetRef.current)) {
 event.preventDefault(); last?.focus();
 } else if (!event.shiftKey && document.activeElement === last) {
 event.preventDefault(); first.focus();
 }
 };
 document.addEventListener("keydown", onKeyDown);
 return () => {
 document.body.style.overflow = overflow;
 document.removeEventListener("keydown", onKeyDown);
 if (previousFocus?.isConnected) previousFocus.focus({ preventScroll: true });
 };
 }, [visible]);

 const handleDragEnd = (_event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
 if (info.offset.y > 100) {
 onClose();
 }
 };

 // On unsafe geometry remove controls immediately, without an exit animation
 // leaving a clickable layer over an anchor. The parent closes the sheet too.
 if (space === null) return null;
 return (
 <AnimatePresence>
 {visible && (
 <>
 {/* Backdrop */}
 <motion.div
 initial={{ opacity: 0 }}
 animate={{ opacity: 1 }}
 exit={{ opacity: 0 }}
 onClick={onClose}
 aria-hidden="true"
 className="fixed inset-0 z-50 bg-electric/60 backdrop-blur-sm"
 />

 {/* Sheet */}
 <motion.div
 ref={sheetRef}
 role="dialog"
 aria-modal="true"
 aria-labelledby={title ? titleId : undefined}
 aria-label={title ? undefined : "입력 설정"}
 tabIndex={-1}
 initial={reduceMotion ? false : { y: "100%" }}
 animate={{ y: 0 }}
 exit={reduceMotion ? undefined : { y: "100%" }}
 transition={{ type: "spring", damping: 25, stiffness: 300 }}
 drag="y"
 dragConstraints={{ top: 0 }}
 dragElastic={0.2}
 onDragEnd={handleDragEnd}
 className="fixed bottom-0 left-0 right-0 z-50 bg-card rounded-t-[20px] shadow-2xl border-t border-white/10 flex flex-col"
 style={space ?? undefined}
 >
 {/* Handle */}
 <div className="w-full flex justify-center pt-4 pb-2 cursor-grab active:cursor-grabbing shrink-0">
 <div className="w-12 h-1.5 bg-muted-foreground/30 rounded-full" />
 </div>

 {/* Title */}
 <div className="px-6 pb-4 border-b border-border flex items-center gap-3 shrink-0">
 {title && <h3 id={titleId} className="text-lg font-bold flex-1">{title}</h3>}
 <button type="button" onClick={onClose} className="ml-auto rounded-lg px-3 py-2 text-sm font-semibold">닫기</button>
 </div>

 {/* Content */}
 <div className="p-6 min-h-0 overflow-y-auto overscroll-contain pb-safe">
 {children}
 </div>
 </motion.div>
 </>
 )}
 </AnimatePresence>
 );
}
