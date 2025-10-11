// src/components/CurrencyInput.tsx

"use client";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

const formatNumber = (num: number) => num.toLocaleString();
const parseNumber = (str: string) => Number(String(str).replace(/,/g, ""));

interface CurrencyInputProps {
  label: string;
  value: string;
  onValueChange: (value: string) => void;
  quickAmounts?: number[];
}

export default function CurrencyInput({
  label,
  value,
  onValueChange,
  quickAmounts = [1000000, 100000, 10000],
}: CurrencyInputProps) {
  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value.replace(/,/g, "");
    if (!isNaN(Number(rawValue))) {
      const numValue = Number(rawValue);
      onValueChange(formatNumber(numValue));
    }
  };

  const handleQuickClick = (amount: number) => {
    const currentVal = parseNumber(value);
    onValueChange(formatNumber(currentVal + amount));
  };

  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <div className="relative">
        <Input
          type="text"
          value={value}
          onChange={handleAmountChange}
          className="pr-10 text-right text-lg h-12"
          inputMode="numeric"
          pattern="[0-9,]*"
        />
        <span className="absolute inset-y-0 right-0 flex items-center pr-3 text-muted-foreground">
          원
        </span>
      </div>
      <div className="grid grid-cols-3 gap-2 pt-1">
        {quickAmounts.map((amount) => (
          <Button
            key={`add-${amount}`}
            type="button"
            variant="outline"
            size="sm"
            onClick={() => handleQuickClick(amount)}
            className="font-mono"
          >
            + {formatNumber(amount)}
          </Button>
        ))}
        {quickAmounts.map((amount) => (
          <Button
            key={`sub-${amount}`}
            type="button"
            variant="outline"
            size="sm"
            onClick={() => handleQuickClick(-amount)}
            className="font-mono text-destructive border-destructive/50 hover:bg-destructive/90 hover:text-destructive-foreground"
          >
            - {formatNumber(amount)}
          </Button>
        ))}
      </div>
    </div>
  );
}
