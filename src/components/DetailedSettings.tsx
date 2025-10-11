// src/components/DetailedSettings.tsx
"use client";

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
    <div className="mt-6 pt-6 border-t dark:border-gray-700">
      <h2 className="text-lg font-bold">상세 설정</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
        <div>
          <label className="text-sm font-medium text-light-text-secondary dark:text-dark-text-secondary">
            부양 가족 수 (본인포함)
          </label>
          <div className="flex items-center justify-between p-2 mt-1 border dark:border-gray-700 rounded-lg">
            <button
              onClick={() => handleDependentChange("dependents", -1)}
              className="w-8 h-8 text-xl rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              -
            </button>
            <span className="font-bold text-lg">{dependents} 명</span>
            <button
              onClick={() => handleDependentChange("dependents", 1)}
              className="w-8 h-8 text-xl rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              +
            </button>
          </div>
        </div>
        <div>
          <label className="text-sm font-medium text-light-text-secondary dark:text-dark-text-secondary">
            20세 이하 자녀 수
          </label>
          <div className="flex items-center justify-between p-2 mt-1 border dark:border-gray-700 rounded-lg">
            <button
              onClick={() => handleDependentChange("children", -1)}
              className="w-8 h-8 text-xl rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              -
            </button>
            <span className="font-bold text-lg">{children} 명</span>
            <button
              onClick={() => handleDependentChange("children", 1)}
              className="w-8 h-8 text-xl rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              +
            </button>
          </div>
        </div>
        <div>
          <label className="text-sm font-medium text-light-text-secondary dark:text-dark-text-secondary">
            70세 이상 (경로우대)
          </label>
          <div className="flex items-center justify-between p-2 mt-1 border dark:border-gray-700 rounded-lg">
            <button
              onClick={() => handleDependentChange("seniorDependents", -1)}
              className="w-8 h-8 text-xl rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              -
            </button>
            <span className="font-bold text-lg">
              {advancedSettings.seniorDependents} 명
            </span>
            <button
              onClick={() => handleDependentChange("seniorDependents", 1)}
              className="w-8 h-8 text-xl rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              +
            </button>
          </div>
        </div>
        <div>
          <label className="text-sm font-medium text-light-text-secondary dark:text-dark-text-secondary">
            장애인
          </label>
          <div className="flex items-center justify-between p-2 mt-1 border dark:border-gray-700 rounded-lg">
            <button
              onClick={() => handleDependentChange("disabledDependents", -1)}
              className="w-8 h-8 text-xl rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              -
            </button>
            <span className="font-bold text-lg">
              {advancedSettings.disabledDependents} 명
            </span>
            <button
              onClick={() => handleDependentChange("disabledDependents", 1)}
              className="w-8 h-8 text-xl rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              +
            </button>
          </div>
        </div>
      </div>
      <div className="mt-4">
        <label className="text-sm font-medium text-light-text-secondary dark:text-dark-text-secondary">
          비과세액 (월 기준)
        </label>
        <div className="relative mt-1">
          <input
            type="text"
            value={nonTaxableAmount}
            onChange={(e) => {
              const v = e.target.value.replace(/[^0-9]/g, "");
              setNonTaxableAmount(v ? formatNumber(Number(v)) : "0");
            }}
            className="w-full p-3 pr-12 border rounded-lg dark:bg-dark-card dark:border-gray-700"
          />
          <span className="absolute inset-y-0 right-4 flex items-center text-gray-500 dark:text-gray-400">
            원
          </span>
        </div>
      </div>
      <div className="mt-4">
        <div className="flex items-center">
          <input
            type="checkbox"
            id="isSmeYouth"
            checked={advancedSettings.isSmeYouth}
            onChange={(e) =>
              setAdvancedSettings((prev) => ({
                ...prev,
                isSmeYouth: e.target.checked,
              }))
            }
            className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
          />
          <label
            htmlFor="isSmeYouth"
            className="ml-2 block text-sm text-gray-900 dark:text-gray-300"
          >
            중소기업 취업 청년 소득세 감면 대상
          </label>
        </div>
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
