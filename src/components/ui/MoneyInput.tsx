// src/components/ui/MoneyInput.tsx

"use client";

import React, { useState, useRef } from "react";
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
 <label className="text-xs font-black text-[#0F4C81] uppercase tracking-[0.2em] mb-4 opacity-60">
 {label}
 </label>
 
 <motion.div 
 animate={{ scale: isFocused ? 1.05 : 1 }}
 transition={{ type: "spring", stiffness: 400, damping: 25 }}
 className="relative group w-full"
 >
 <input
 ref={inputRef}
 type="text"
 value={value}
 onChange={handleChange}
 onFocus={() => setIsFocused(true)}
 onBlur={() => setIsFocused(false)}
 className="w-full bg-transparent text-5xl sm:text-7xl font-black text-center text-[#0F4C81] focus:outline-none placeholder-blue-100 font-mono-tabular"
 placeholder="0"
 inputMode="numeric"
 />
 
 {/* Premium Pulse Underline Animation */}
 <motion.div 
 animate={{ 
 width: isFocused ? "100%" : "3rem",
 opacity: isFocused ? 1 : 0.3,
 boxShadow: isFocused ? "0 0 12px 1px rgba(255,215,0,0.6)" : "none"
 }}
 transition={{ type: "spring", stiffness: 300, damping: 30 }}
 className="absolute -bottom-2 left-1/2 -translate-x-1/2 h-1.5 bg-[#FFD700] rounded-full"
 />
 </motion.div>

 <div className="mt-8 flex gap-2">
 {[100, 500, 1000].map((amt) => (
 <button
 key={amt}
 onClick={() => {
 const current = parseNumber(value);
 onValueChange(formatNumber(current + amt * 10000));
 }}
 className="px-4 py-2 bg-canvas-dark hover:bg-[#FFD700] hover:text-[#381f15] text-faint-blue text-xs font-bold rounded-full transition-all active:scale-90"
 >
 +{amt}만
 </button>
 ))}
 <button
 onClick={() => onValueChange("0")}
 className="px-4 py-2 bg-canvas-deeper text-electric text-xs font-bold rounded-full hover:bg-canvas-deeper active:scale-90 transition-all"
 >
 초기화
 </button>
 </div>
 </div>
 );
}
