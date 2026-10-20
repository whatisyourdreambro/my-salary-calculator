"use client";

import { useEffect, useId, useLayoutEffect, useRef, useState } from "react";
import { motion, AnimatePresence, PanInfo, useReducedMotion } from "framer-motion";
import { observeBottomSheetSpace, type BottomSheetSpace } from "@/lib/bottomSheetLayout";
import { activateModalFocus } from "@/lib/modalFocus";

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
 const backdropRef = useRef<HTMLDivElement>(null);
 const openerRef = useRef<Element | null>(null);
 const titleId = useId();
 const reduceMotion = useReducedMotion();
 useEffect(() => { closeRef.current = onClose; }, [onClose]);
 useLayoutEffect(() => {
 if (isOpen && !sheetRef.current?.contains(document.activeElement)) {
 openerRef.current = document.activeElement;
 }
 }, [isOpen]);

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
 if (!visible || !sheetRef.current) return;
 // Passive cleanup runs after React restores focus to any retained exit DOM.
 return activateModalFocus(sheetRef.current, { onEscape: () => closeRef.current(), opener: openerRef.current, focusRoot: true, backdrop: backdropRef.current });
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
  ref={backdropRef}
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
