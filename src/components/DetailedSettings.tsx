// src/components/DetailedSettings.tsx

"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Minus, Plus } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import type { AdvancedSettings } from "@/app/types";

const formatNumber = (num: number) => num.toLocaleString();
const parseNumber = (str: string) => Number(String(str).replace(/,/g, ""));

interface DetailedSettingsProps {
  dependents: number;
  children: number;
  advancedSettings: AdvancedSettings;
  nonTaxableAmount: string;
  monthlyExpenses: string;
  handleDependentChange: (
    field:
      | "dependents"
      | "children"
      | "disabledDependents"
      | "seniorDependents",
    delta: number
  ) => void;
  setNonTaxableAmount: (value: string) => void;
  setAdvancedSettings: React.Dispatch<React.SetStateAction<AdvancedSettings>>;
  setMonthlyExpenses: (value: string) => void;
}

const NumberControl: React.FC<{
  label: string;
  value: number;
  onIncrement: () => void;
  onDecrement: () => void;
}> = ({ label, value, onIncrement, onDecrement }) => {
  return (
    <div className="flex items-center justify-between p-2 rounded-md bg-muted">
      <Label className="text-sm text-muted-foreground">{label}</Label>
      <div className="flex items-center gap-2">
        <Button variant="outline" size="icon" onClick={onDecrement}>
          <Minus className="h-4 w-4" />
        </Button>
        <span className="font-bold w-8 text-center text-foreground">
          {value}
        </span>
        <Button variant="outline" size="icon" onClick={onIncrement}>
          <Plus className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

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
}: DetailedSettingsProps) {
  return (
    <Accordion type="single" collapsible className="w-full">
      <AccordionItem value="item-1">
        <AccordionTrigger>상세 설정 (비과세액, 부양가족 등)</AccordionTrigger>
        <AccordionContent className="space-y-4 pt-4">
          <div className="space-y-2">
            <Label htmlFor="non-taxable">월 비과세액 (식대 등)</Label>
            <Input
              id="non-taxable"
              type="text"
              value={formatNumber(parseNumber(nonTaxableAmount))}
              onChange={(e) =>
                setNonTaxableAmount(e.target.value.replace(/,/g, ""))
              }
              className="text-right"
            />
          </div>
          <NumberControl
            label="본인 포함 부양 가족 수"
            value={dependents}
            onIncrement={() => handleDependentChange("dependents", 1)}
            onDecrement={() => handleDependentChange("dependents", -1)}
          />
          <NumberControl
            label="8세 이상 20세 이하 자녀 수"
            value={children}
            onIncrement={() => handleDependentChange("children", 1)}
            onDecrement={() => handleDependentChange("children", -1)}
          />
          <NumberControl
            label="장애인 부양가족"
            value={advancedSettings.disabledDependents}
            onIncrement={() => handleDependentChange("disabledDependents", 1)}
            onDecrement={() => handleDependentChange("disabledDependents", -1)}
          />
          <NumberControl
            label="70세 이상 경로우대"
            value={advancedSettings.seniorDependents}
            onIncrement={() => handleDependentChange("seniorDependents", 1)}
            onDecrement={() => handleDependentChange("seniorDependents", -1)}
          />
          <div className="flex items-center space-x-2">
            <Checkbox
              id="sme-youth"
              checked={advancedSettings.isSmeYouth}
              onCheckedChange={(checked) =>
                setAdvancedSettings((prev) => ({
                  ...prev,
                  isSmeYouth: !!checked,
                }))
              }
            />
            <Label htmlFor="sme-youth">중소기업 취업 청년 감면 대상</Label>
          </div>
          <div className="space-y-2">
            <Label htmlFor="monthly-expenses">월 고정 지출 (선택)</Label>
            <Input
              id="monthly-expenses"
              type="text"
              value={formatNumber(parseNumber(monthlyExpenses))}
              onChange={(e) =>
                setMonthlyExpenses(e.target.value.replace(/,/g, ""))
              }
              placeholder="예: 월세, 통신비 등"
              className="text-right"
            />
          </div>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}
