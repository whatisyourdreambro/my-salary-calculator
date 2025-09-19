"use client";

// [수정] useMemo를 import합니다.
import { useState, useRef, useEffect, useMemo } from "react";

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

  // [추가] 덧셈/뺄셈 버튼을 위한 하나의 통합된 배열을 생성합니다.
  // 이 방식은 렌더링 오류를 원천적으로 방지하는 가장 안정적인 구조입니다.
  const quickButtons = useMemo(() => {
    const buttons: {
      key: string;
      amount: number;
      label: string;
      className: string;
    }[] = [];

    quickAmounts.forEach((amount) => {
      buttons.push({
        key: `add-${amount}`,
        amount: amount,
        label: `+ ${formatNumber(amount)}`,
        className:
          "bg-signature-blue/10 text-signature-blue hover:bg-signature-blue/20",
      });
    });

    quickAmounts.forEach((amount) => {
      buttons.push({
        key: `sub-${amount}`,
        amount: -amount,
        label: `- ${formatNumber(amount)}`,
        className: "bg-brand-red/10 text-brand-red hover:bg-brand-red/20",
      });
    });

    return buttons;
  }, [quickAmounts]);

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

      {/* [수정] 통합된 버튼 배열을 단 한번의 map으로 렌더링하여 안정성을 확보합니다. */}
      <div className="mt-2 grid grid-cols-3 sm:grid-cols-6 gap-2">
        {quickButtons.map((btn) => (
          <button
            key={btn.key}
            onClick={() => handleAmountChange(btn.amount)}
            className={`px-2 py-1.5 text-xs sm:text-sm font-semibold rounded-lg transition whitespace-nowrap ${btn.className}`}
          >
            {btn.label}
          </button>
        ))}
      </div>
    </div>
  );
}
