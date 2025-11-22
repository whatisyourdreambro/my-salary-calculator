// src/components/CurrencyInput.tsx
"use client";

import { useState, useRef, useEffect } from "react";

const formatNumber = (num: number) => num.toLocaleString();
const parseNumber = (str: string) => Number(str.replace(/,/g, ""));

interface Currency {
  id: string;
  name: string;
  flag: string;
  symbol: string;
}

import { cn } from "@/lib/utils";

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
  const [cursor, setCursor] = useState<number | null>(null);

  const symbol =
    currencies?.find((c) => c.id === selectedCurrency)?.symbol || "원";

  useEffect(() => {
    const input = inputRef.current;
    if (input && cursor !== null) {
      input.setSelectionRange(cursor, cursor);
    }
  }, [value, cursor]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target;
    const originalValue = input.value;
    const originalCursor = input.selectionStart || 0;
    const numericValue = originalValue.replace(/[^0-9]/g, "");
    const formattedValue = numericValue
      ? formatNumber(Number(numericValue))
      : "";
    const newCursor =
      originalCursor + (formattedValue.length - originalValue.length);
    setCursor(newCursor);
    onValueChange(formattedValue);
  };

  const handleAmountChange = (amount: number) => {
    const currentAmount = parseNumber(value) || 0;
    const newAmount = Math.max(0, currentAmount + amount);
    onValueChange(formatNumber(newAmount));
  };

  return (
    <div>
      <label className="text-sm font-medium text-muted-foreground">
        {label}
      </label>
      <div className="flex gap-2 mt-2">
        {currencies && onCurrencyChange && selectedCurrency && (
          <select
            value={selectedCurrency}
            onChange={(e) => onCurrencyChange(e.target.value)}
            className="p-3 bg-secondary/50 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition basis-1/3 sm:basis-auto"
          >
            {currencies.map((c) => (
              <option key={c.id} value={c.id}>
                {c.flag} {c.id}
              </option>
            ))}
          </select>
        )}
        <div className="relative flex-grow">
          <input
            ref={inputRef}
            type="text"
            value={value}
            onChange={handleChange}
            className={cn(
              "w-full p-3 pr-12 bg-secondary/50 border border-border rounded-lg text-xl font-bold focus:ring-2 focus:ring-primary focus:border-primary transition",
              className
            )}
            inputMode="numeric"
          />
          <span className="absolute inset-y-0 right-4 flex items-center text-muted-foreground text-base">
            {symbol}
          </span>
        </div>
      </div>

      <div className="mt-3 space-y-2">
        <div className="grid grid-cols-3 gap-2">
          {quickAmounts.map((amount) => (
            <button
              key={`add-${amount}`}
              onClick={() => handleAmountChange(amount)}
              className="py-1.5 text-sm bg-primary/10 text-primary font-semibold rounded-lg hover:bg-primary/20 transition whitespace-nowrap"
            >
              + {formatNumber(amount)}
            </button>
          ))}
        </div>
        <div className="grid grid-cols-3 gap-2">
          {quickAmounts.map((amount) => (
            <button
              key={`sub-${amount}`}
              onClick={() => handleAmountChange(-amount)}
              className="py-1.5 text-sm bg-destructive/10 text-destructive font-semibold rounded-lg hover:bg-destructive/20 transition whitespace-nowrap"
            >
              - {formatNumber(amount)}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}