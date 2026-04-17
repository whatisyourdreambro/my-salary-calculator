// src/components/CurrencyInput.tsx
"use client";

import { useRef } from "react";
import { cn } from "@/lib/utils";

/** 숫자에 천 단위 콤마를 붙임 (ko-KR) */
const formatNumber = (num: number) => num.toLocaleString("ko-KR");
const parseNumber = (str: string) => Number(str.replace(/,/g, "").replace(/[^0-9]/g, "")) || 0;

interface Currency {
  id: string;
  name: string;
  flag: string;
  symbol: string;
}

interface CurrencyInputProps {
  label: string;
  value: string;
  onValueChange: (value: string) => void;
  quickAmounts: number[];
  selectedCurrency?: string;
  onCurrencyChange?: (value: string) => void;
  currencies?: Currency[];
  className?: string;
}

export default function CurrencyInput({
  label,
  value,
  onValueChange,
  quickAmounts,
  selectedCurrency,
  onCurrencyChange,
  currencies,
  className,
}: CurrencyInputProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const symbol =
    currencies?.find((c) => c.id === selectedCurrency)?.symbol || "원";

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/[^0-9]/g, "");
    if (!raw) { onValueChange("0"); return; }
    onValueChange(formatNumber(Number(raw)));
  };

  const handleAmountChange = (amount: number) => {
    const current = parseNumber(value);
    const next = Math.max(0, current + amount);
    onValueChange(formatNumber(next));
  };

  return (
    <div>
      <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-3">
        {label}
      </label>
      <div className="relative group">
        {currencies && onCurrencyChange && selectedCurrency && (
          <div className="absolute left-0 top-0 bottom-0 flex items-center pl-3 z-10">
            <select
              value={selectedCurrency}
              onChange={(e) => onCurrencyChange(e.target.value)}
              className="bg-transparent font-sans font-bold text-foreground focus:outline-none cursor-pointer appearance-none pr-8"
            />
            <span className="pointer-events-none absolute right-2 text-slate-500">▼</span>
          </div>
        )}

        <input
          {...(!currencies ? { ref: inputRef } : {})}
          type="text"
          inputMode="numeric"
          value={value}
          onChange={handleChange}
          className={cn(
            "w-full py-4 bg-transparent border-b-2 border-slate-200 text-3xl font-sans font-bold text-slate-900 placeholder-slate-300 focus:border-primary focus:outline-none transition-all duration-300",
            className,
            currencies ? "pl-24" : ""
          )}
          placeholder="0"
        />
        <span className="absolute inset-y-0 right-0 flex items-center text-slate-500 font-sans text-xl pointer-events-none group-hover:text-primary transition-colors">
          {symbol}
        </span>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {quickAmounts.map((amount) => (
          <button
            key={`add-${amount}`}
            onClick={() => handleAmountChange(amount)}
            className="px-4 py-2 text-xs font-bold uppercase tracking-wider rounded-full bg-slate-100 text-slate-600 hover:bg-primary/10 hover:text-primary transition-colors duration-300"
          >
            +{formatNumber(amount / 10000)}만
          </button>
        ))}
      </div>
    </div>
  );
}