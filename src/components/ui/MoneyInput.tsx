// src/components/ui/MoneyInput.tsx

"use client";

import React, { useState, useRef, useId } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface MoneyInputProps {
 label: string;
 value: string;
 onValueChange: (value: string) => void;
 className?: string;
}

const formatNumber = (num: number) => num.toLocaleString('ko-KR');
const parseNumber = (str: string) => Number(str.replace(/,/g, ""));

export default function MoneyInput({
 label,
 value,
 onValueChange,
 className,
}: MoneyInputProps) {
 const [isFocused, setIsFocused] = useState(false);
 const inputRef = useRef<HTMLInputElement>(null);
 const inputId = useId();

 const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
 const inputValue = e.target.value.replace(/[^0-9]/g, "");
 if (!inputValue) {
 onValueChange("0");
 return;
 }
 onValueChange(formatNumber(Number(inputValue)));
 };

 return (
 <div className={cn("w-full flex flex-col items-center py-8", className)}>
 <label htmlFor={inputId} className="text-xs font-black text-muted-blue uppercase tracking-[0.2em] mb-4 opacity-70">
 {label}
 </label>

 <motion.div
 animate={{ scale: isFocused ? 1.03 : 1 }}
 transition={{ type: "spring", stiffness: 400, damping: 25 }}
 className="relative group w-full"
 >
 <input
 id={inputId}
 ref={inputRef}
 type="text"
 value={value}
 onChange={handleChange}
 onFocus={() => setIsFocused(true)}
 onBlur={() => setIsFocused(false)}
 className="w-full bg-transparent text-5xl sm:text-7xl font-black text-center text-navy tracking-tight focus:outline-none tabular-nums"
 placeholder="0"
 inputMode="numeric"
 aria-label={label}
 />

 {/* Electric Blue Underline Animation */}
 <motion.div
 animate={{
 width: isFocused ? "100%" : "3rem",
 opacity: isFocused ? 1 : 0.4,
 boxShadow: isFocused ? "0 0 12px 1px rgba(1,69,242,0.45)" : "none"
 }}
 transition={{ type: "spring", stiffness: 300, damping: 30 }}
 className="absolute -bottom-2 left-1/2 -translate-x-1/2 h-1.5 bg-electric rounded-full"
 />
 </motion.div>

 <div className="mt-8 flex gap-2 flex-wrap justify-center">
 {[100, 500, 1000].map((amt) => (
 <button
 key={amt}
 type="button"
 onClick={() => {
 const current = parseNumber(value);
 onValueChange(formatNumber(current + amt * 10000));
 }}
 className="px-4 py-2 bg-canvas-dark hover:bg-electric hover:text-white text-muted-blue text-xs font-bold rounded-full transition-all active:scale-95"
 aria-label={`${amt}만원 추가`}
 >
 +{amt}만
 </button>
 ))}
 <button
 type="button"
 onClick={() => onValueChange("0")}
 className="px-4 py-2 bg-canvas-deeper text-electric text-xs font-bold rounded-full hover:bg-electric hover:text-white active:scale-95 transition-all"
 aria-label="입력값 초기화"
 >
 초기화
 </button>
 </div>
 </div>
 );
}
