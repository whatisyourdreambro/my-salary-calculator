// src/components/ui/MoneyInput.tsx

"use client";

import React, { useRef, useId } from "react";
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
 <div className={cn("w-full flex flex-col gap-3 py-5", className)}>
 <label htmlFor={inputId} className="text-sm font-semibold text-foreground">
 {label}
 </label>

 <div className="w-full">
 <input
 id={inputId}
 ref={inputRef}
 type="text"
 value={value}
 onChange={handleChange}
 className="ms-field w-full text-[clamp(1.75rem,6vw,3.25rem)] font-bold tabular-nums"
 placeholder="0"
 inputMode="numeric"
 aria-label={label}
 />

 </div>

 <div className="flex gap-2 flex-wrap">
 {[100, 500, 1000].map((amt) => (
 <button
 key={amt}
 type="button"
 onClick={() => {
 const current = parseNumber(value);
 onValueChange(formatNumber(current + amt * 10000));
 }}
 className="ms-button ms-button-secondary text-sm"
 aria-label={`${amt}만원 추가`}
 >
 +{amt}만
 </button>
 ))}
 <button
 type="button"
 onClick={() => onValueChange("0")}
 className="ms-button ms-button-ghost text-sm"
 aria-label="입력값 초기화"
 >
 초기화
 </button>
 </div>
 </div>
 );
}
