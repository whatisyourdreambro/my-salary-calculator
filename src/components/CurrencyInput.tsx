"use client";

import { useState, useRef, useEffect } from "react";

const formatNumber = (num: number) => num.toLocaleString();
const parseNumber = (str: string) => Number(str.replace(/,/g, ""));

interface CurrencyInputProps {
  label: string;
  value: string;
  onValueChange: (value: string) => void;
  quickAmounts: number[];
}

export default function CurrencyInput({
  label,
  value,
  onValueChange,
  quickAmounts,
}: CurrencyInputProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [cursor, setCursor] = useState<number | null>(null);

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
      <label className="text-sm font-medium text-light-text-secondary dark:text-dark-text-secondary">
        {label}
      </label>
      <div className="relative mt-1">
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={handleChange}
          className="w-full p-3 sm:p-4 pr-10 sm:pr-12 text-xl sm:text-2xl font-bold border-2 border-gray-200 dark:border-gray-700 rounded-lg bg-light-card dark:bg-dark-card text-light-text dark:text-dark-text focus:ring-2 focus:ring-signature-blue focus:border-signature-blue"
          inputMode="numeric"
        />
        <span className="absolute inset-y-0 right-4 flex items-center text-gray-500 dark:text-gray-400 text-sm sm:text-base">
          원
        </span>
      </div>

      {/* [수정] 버튼 레이아웃을 flex-wrap으로 변경하여 자연스럽게 줄바꿈되도록 합니다. */}
      <div className="mt-2 flex flex-wrap gap-2">
        {quickAmounts.map((amount) => (
          <button
            key={`add-${amount}`}
            onClick={() => handleAmountChange(amount)}
            className="px-2 py-1 text-xs sm:px-3 sm:py-1.5 sm:text-sm bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300 font-semibold rounded-full hover:bg-blue-200 dark:hover:bg-blue-900/80 transition"
          >
            + {formatNumber(amount)}
          </button>
        ))}
        {quickAmounts.map((amount) => (
          <button
            key={`sub-${amount}`}
            onClick={() => handleAmountChange(-amount)}
            className="px-2 py-1 text-xs sm:px-3 sm:py-1.5 sm:text-sm bg-red-50 text-red-600 dark:bg-red-900/50 dark:text-red-300 font-semibold rounded-full hover:bg-red-100 dark:hover:bg-red-900/80 transition"
          >
            - {formatNumber(amount)}
          </button>
        ))}
      </div>
    </div>
  );
}
