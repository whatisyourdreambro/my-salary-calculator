"use client";

import { useState, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

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
}

export default function CurrencyInput({
  label,
  value,
  onValueChange,
  quickAmounts,
  selectedCurrency,
  onCurrencyChange,
  currencies,
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
    <div className="space-y-2">
      <Label htmlFor={label}>{label}</Label>
      <div className="flex gap-2">
        {currencies && onCurrencyChange && selectedCurrency && (
          <Select value={selectedCurrency} onValueChange={onCurrencyChange}>
            <SelectTrigger className="w-[100px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {currencies.map((c) => (
                <SelectItem key={c.id} value={c.id}>
                  {c.flag} {c.id}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
        <div className="relative flex-grow">
          <Input
            ref={inputRef}
            id={label}
            type="text"
            value={value}
            onChange={handleChange}
            className="pr-10 text-xl sm:text-2xl font-bold h-auto py-3"
            inputMode="numeric"
          />
          <span className="absolute inset-y-0 right-4 flex items-center text-muted-foreground text-sm sm:text-base">
            {symbol}
          </span>
        </div>
      </div>

      <div className="mt-2 space-y-2">
        <div className="grid grid-cols-3 gap-2">
          {quickAmounts.map((amount) => (
            <Button
              key={`add-${amount}`}
              onClick={() => handleAmountChange(amount)}
              variant="outline"
              size="sm"
            >
              + {formatNumber(amount)}
            </Button>
          ))}
        </div>
        <div className="grid grid-cols-3 gap-2">
          {quickAmounts.map((amount) => (
            <Button
              key={`sub-${amount}`}
              onClick={() => handleAmountChange(-amount)}
              variant="destructive"
              size="sm"
            >
              - {formatNumber(amount)}
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
}