// src/components/CurrencyInput.tsx
"use client";

import { useState, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";

const formatNumber = (num: number) => num.toLocaleString();
const parseNumber = (str: string) => Number(str.replace(/,/g, ""));

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
  // Remove cursor state complexity for now to simplify and reduce bugs with formatting
  // const [cursor, setCursor] = useState<number | null>(null);

  const symbol =
    currencies?.find((c) => c.id === selectedCurrency)?.symbol || "원";

  // Simplified change handler
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value.replace(/[^0-9]/g, "");
    if (!inputValue) {
      onValueChange("0");
      return;
    }
    const numValue = Number(inputValue);
    onValueChange(formatNumber(numValue));
  };

  const handleAmountChange = (amount: number) => {
    const currentAmount = parseNumber(value) || 0;
    const newAmount = Math.max(0, currentAmount + amount);
    onValueChange(formatNumber(newAmount));
  };

  return (
    <div>
      <label className="block text-xs font-bold text-stone-400 uppercase tracking-widest mb-3">
        {label}
      </label>
      <div className="relative group">
        {currencies && onCurrencyChange && selectedCurrency && (
          <div className="absolute left-0 top-0 bottom-0 flex items-center pl-3 z-10">
            <select
              value={selectedCurrency}
              onChange={(e) => onCurrencyChange(e.target.value)}
              className="bg-transparent font-serif font-bold text-foreground focus:outline-none cursor-pointer appearance-none pr-8"
            />
            <span className="pointer-events-none absolute right-2 text-stone-400">▼</span>
          </div>
        )}

        <input
          {...(!currencies ? { ref: inputRef } : {})}
          type="text"
          value={value}
          onChange={handleChange}
          className={cn(
            "w-full py-4 bg-transparent border-b-2 border-stone-200 dark:border-stone-800 text-3xl font-serif font-bold text-foreground placeholder-stone-300 focus:border-primary focus:outline-none transition-all duration-300",
            className,
            currencies ? "pl-24" : ""
          )}
          placeholder="0"
          inputMode="numeric"
        />
        <span className="absolute inset-y-0 right-0 flex items-center text-stone-400 font-serif text-xl pointer-events-none group-hover:text-primary transition-colors">
          {symbol}
        </span>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {quickAmounts.map((amount) => (
          <button
            key={`add-${amount}`}
            onClick={() => handleAmountChange(amount)}
            className="px-4 py-2 text-xs font-bold uppercase tracking-wider rounded-full bg-stone-100 dark:bg-stone-900 text-stone-500 hover:bg-stone-200 dark:hover:bg-stone-800 hover:text-primary transition-colors duration-300"
          >
            +{formatNumber(amount / 10000)}만
          </button>
        ))}
      </div>
    </div>
  );
}