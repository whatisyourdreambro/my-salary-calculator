'use client';

import { useState, useRef, useEffect } from 'react';

const formatNumber = (num: number) => num.toLocaleString();
const parseNumber = (str: string) => Number(str.replace(/,/g, ''));

interface CurrencyInputProps {
  label: string;
  value: string;
  onValueChange: (value: string) => void;
  quickAmounts: number[];
}

export default function CurrencyInput({ label, value, onValueChange, quickAmounts }: CurrencyInputProps) {
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
    const numericValue = originalValue.replace(/[^0-9]/g, '');
    const formattedValue = numericValue ? formatNumber(Number(numericValue)) : '';
    const newCursor = originalCursor + (formattedValue.length - originalValue.length);
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
      <label className="text-sm font-medium text-gray-700 dark:text-gray-300">{label}</label>
      <div className="relative mt-1">
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={handleChange}
          className="w-full p-4 pr-12 text-2xl font-bold border-2 border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          inputMode="numeric"
        />
        <span className="absolute inset-y-0 right-4 flex items-center text-gray-500 dark:text-gray-400">원</span>
      </div>
      <div className="mt-2 space-y-2">
        <div className="flex flex-wrap gap-2">
          {quickAmounts.map(amount => (
            <button 
              key={`add-${amount}`} 
              onClick={() => handleAmountChange(amount)} 
              className="px-3 py-1 text-xs bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300 font-semibold rounded-full hover:bg-blue-200 dark:hover:bg-blue-900/80 transition"
            >
              + {formatNumber(amount)}
            </button>
          ))}
        </div>
        <div className="flex flex-wrap gap-2">
          {quickAmounts.map(amount => (
            <button 
              key={`sub-${amount}`} 
              onClick={() => handleAmountChange(-amount)} 
              className="px-3 py-1 text-xs bg-red-50 text-red-600 dark:bg-red-900/50 dark:text-red-300 font-semibold rounded-full hover:bg-red-100 dark:hover:bg-red-900/80 transition"
            >
              - {formatNumber(amount)}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}