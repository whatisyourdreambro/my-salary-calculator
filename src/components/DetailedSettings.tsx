"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import CurrencyInput from "./CurrencyInput";
import type { AdvancedSettings } from "@/app/types";

interface Props {
  dependents: number;
  children: number;
  advancedSettings: AdvancedSettings;
  nonTaxableAmount: string;
  monthlyExpenses: string;
  handleDependentChange: (
    field: "dependents" | "children" | "disabledDependents" | "seniorDependents",
    delta: number
  ) => void;
  setNonTaxableAmount: (value: string) => void;
  setAdvancedSettings: (value: React.SetStateAction<AdvancedSettings>) => void;
  setMonthlyExpenses: (value: string) => void;
}

const formatNumber = (num: number) => num.toLocaleString();

export default function DetailedSettings({
  dependents,
  children,
  advancedSettings,
  nonTaxableAmount,
  monthlyExpenses,
  handleDependentChange,
  setNonTaxableAmount,
  setAdvancedSettings,
  setMonthlyExpenses,
}: Props) {
  return (
    <div className="mt-6 pt-6 border-t">
      <h2 className="text-lg font-bold mb-4">상세 설정</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label>부양 가족 수 (본인포함)</Label>
          <div className="flex items-center justify-between p-1 border rounded-lg">
            <Button variant="ghost" size="icon" onClick={() => handleDependentChange("dependents", -1)}>-</Button>
            <span className="font-bold text-lg">{dependents} 명</span>
            <Button variant="ghost" size="icon" onClick={() => handleDependentChange("dependents", 1)}>+</Button>
          </div>
        </div>
        <div className="space-y-2">
          <Label>20세 이하 자녀 수</Label>
          <div className="flex items-center justify-between p-1 border rounded-lg">
            <Button variant="ghost" size="icon" onClick={() => handleDependentChange("children", -1)}>-</Button>
            <span className="font-bold text-lg">{children} 명</span>
            <Button variant="ghost" size="icon" onClick={() => handleDependentChange("children", 1)}>+</Button>
          </div>
        </div>
        <div className="space-y-2">
          <Label>70세 이상 (경로우대)</Label>
          <div className="flex items-center justify-between p-1 border rounded-lg">
            <Button variant="ghost" size="icon" onClick={() => handleDependentChange("seniorDependents", -1)}>-</Button>
            <span className="font-bold text-lg">{advancedSettings.seniorDependents} 명</span>
            <Button variant="ghost" size="icon" onClick={() => handleDependentChange("seniorDependents", 1)}>+</Button>
          </div>
        </div>
        <div className="space-y-2">
          <Label>장애인</Label>
          <div className="flex items-center justify-between p-1 border rounded-lg">
            <Button variant="ghost" size="icon" onClick={() => handleDependentChange("disabledDependents", -1)}>-</Button>
            <span className="font-bold text-lg">{advancedSettings.disabledDependents} 명</span>
            <Button variant="ghost" size="icon" onClick={() => handleDependentChange("disabledDependents", 1)}>+</Button>
          </div>
        </div>
      </div>
      <div className="mt-4 space-y-2">
        <Label htmlFor="non-taxable-amount">비과세액 (월 기준)</Label>
        <div className="relative">
          <Input
            id="non-taxable-amount"
            type="text"
            value={nonTaxableAmount}
            onChange={(e) => {
              const v = e.target.value.replace(/[^0-9]/g, "");
              setNonTaxableAmount(v ? formatNumber(Number(v)) : "0");
            }}
            className="pr-12"
          />
          <span className="absolute inset-y-0 right-4 flex items-center text-muted-foreground">원</span>
        </div>
      </div>
      <div className="mt-4 flex items-center space-x-2">
        <Checkbox
          id="isSmeYouth"
          checked={advancedSettings.isSmeYouth}
          onCheckedChange={(checked) =>
            setAdvancedSettings((prev) => ({
              ...prev,
              isSmeYouth: !!checked,
            }))
          }
        />
        <Label htmlFor="isSmeYouth" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
          중소기업 취업 청년 소득세 감면 대상
        </Label>
      </div>
      <div className="mt-4">
        <CurrencyInput
          label="월평균 고정 지출 (주거비, 통신비 등)"
          value={monthlyExpenses}
          onValueChange={setMonthlyExpenses}
          quickAmounts={[500000, 100000, 50000]}
        />
      </div>
    </div>
  );
}