'use client';

import { useState, useEffect } from 'react';
import { calculateNetSalary } from '@/lib/calculator';
import CurrencyInput from './CurrencyInput';

const formatNumber = (num: number) => num.toLocaleString();
const parseNumber = (str: string) => Number(str.replace(/,/g, ''));

export default function SalaryCalculator() {
  const [payBasis, setPayBasis] = useState<'annual' | 'monthly'>('annual');
  const [severanceType, setSeveranceType] = useState<'separate' | 'included'>('separate');
  const [salaryInput, setSalaryInput] = useState('');
  const [nonTaxableAmount, setNonTaxableAmount] = useState('200,000');
  const [dependents, setDependents] = useState(1);
  const [children, setChildren] = useState(0);
  const [result, setResult] = useState({
    monthlyNet: 0, totalDeduction: 0, pension: 0, health: 0,
    longTermCare: 0, employment: 0, incomeTax: 0, localTax: 0,
  });

  useEffect(() => {
    const salary = parseNumber(salaryInput);
    const nonTaxable = parseNumber(nonTaxableAmount) * 12;
    let annualSalary = payBasis === 'annual' ? salary : salary * 12;
    if (severanceType === 'included' && annualSalary > 0) {
      annualSalary = (annualSalary / 13) * 12;
    }
    const newResult = calculateNetSalary(annualSalary, nonTaxable, dependents, children);
    setResult(newResult);
  }, [payBasis, severanceType, salaryInput, nonTaxableAmount, dependents, children]);
  
  const handleReset = () => {
    setPayBasis('annual');
    setSeveranceType('separate');
    setSalaryInput('');
    setNonTaxableAmount('200,000');
    setDependents(1);
    setChildren(0);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
        <div className="space-y-8">
          <div className="bg-white dark:bg-gray-900 p-6 rounded-xl border border-gray-200 dark:border-gray-800">
            <h2 className="text-lg font-bold text-gray-800 dark:text-gray-200 mb-4">필수 입력</h2>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="flex bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
                <button onClick={() => setPayBasis('annual')} className={`flex-1 p-2 rounded-md text-sm font-semibold transition ${payBasis === 'annual' ? 'bg-white dark:bg-gray-700 shadow' : 'text-gray-500 dark:text-gray-400'}`}>연봉</button>
                <button onClick={() => setPayBasis('monthly')} className={`flex-1 p-2 rounded-md text-sm font-semibold transition ${payBasis === 'monthly' ? 'bg-white dark:bg-gray-700 shadow' : 'text-gray-500 dark:text-gray-400'}`}>월급</button>
              </div>
              <div className="flex bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
                <button onClick={() => setSeveranceType('separate')} className={`flex-1 p-2 rounded-md text-sm font-semibold transition ${severanceType === 'separate' ? 'bg-white dark:bg-gray-700 shadow' : 'text-gray-500 dark:text-gray-400'}`}>별도</button>
                <button onClick={() => setSeveranceType('included')} className={`flex-1 p-2 rounded-md text-sm font-semibold transition ${severanceType === 'included' ? 'bg-white dark:bg-gray-700 shadow' : 'text-gray-500 dark:text-gray-400'}`}>포함</button>
              </div>
            </div>
            <CurrencyInput
              label={payBasis === 'annual' ? '연봉' : '월급'}
              value={salaryInput}
              onValueChange={setSalaryInput}
              quickAmounts={[10000000, 1000000, 100000]}
            />
          </div>
          <div className="bg-white dark:bg-gray-900 p-6 rounded-xl border border-gray-200 dark:border-gray-800">
            <h2 className="text-lg font-bold text-gray-800 dark:text-gray-200 mb-4">선택 입력</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">부양 가족 수 (본인포함)</label>
                <div className="flex items-center justify-between p-2 mt-1 border dark:border-gray-700 rounded-lg">
                  <button onClick={() => setDependents(p => Math.max(1, p - 1))} className="w-8 h-8 text-xl text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full">-</button>
                  <span className="font-bold text-lg text-gray-900 dark:text-gray-100">{dependents} 명</span>
                  <button onClick={() => setDependents(p => p + 1)} className="w-8 h-8 text-xl text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full">+</button>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">20세 이하 자녀 수</label>
                 <div className="flex items-center justify-between p-2 mt-1 border dark:border-gray-700 rounded-lg">
                  <button onClick={() => setChildren(p => Math.max(0, p - 1))} className="w-8 h-8 text-xl text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full">-</button>
                  <span className="font-bold text-lg text-gray-900 dark:text-gray-100">{children} 명</span>
                  <button onClick={() => setChildren(p => p + 1)} className="w-8 h-8 text-xl text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full">+</button>
                </div>
              </div>
            </div>
            <div className="mt-4">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">비과세액 (월 기준)</label>
                <div className="relative mt-1">
                  <input type="text" value={nonTaxableAmount} onChange={(e) => {const v=e.target.value.replace(/[^0-9]/g,''); setNonTaxableAmount(v ? formatNumber(Number(v)):'')}} className="w-full p-3 pr-12 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-200" />
                  <span className="absolute inset-y-0 right-4 flex items-center text-gray-500 dark:text-gray-400">원</span>
                </div>
            </div>
          </div>
        </div>
        
        <div className="bg-signature-blue dark:bg-gray-900 text-white p-6 rounded-xl flex flex-col h-full">
            <div className="flex-grow">
              <p className="text-blue-200 dark:text-gray-400 text-sm">월 예상 실수령액</p>
              <p className="text-4xl sm:text-5xl font-bold my-2 text-white">{formatNumber(result.monthlyNet)} 원</p>
              <div className="mt-6 pt-6 border-t border-white/20 dark:border-gray-700 space-y-3 text-sm">
                {Object.entries({
                  "국민연금": result.pension, "건강보험": result.health, "장기요양": result.longTermCare,
                  "고용보험": result.employment, "소득세": result.incomeTax, "지방소득세": result.localTax
                }).map(([label, value]) => (
                  <div key={label} className="flex justify-between">
                    <span className="text-blue-200 dark:text-gray-400">{label}</span>
                    <span className="text-white dark:text-gray-200">{formatNumber(value)} 원</span>
                  </div>
                ))}
              </div>
               <div className="mt-4 pt-4 border-t border-white/20 dark:border-gray-700 flex justify-between font-bold text-white dark:text-gray-100">
                 <span>총 공제액 합계</span>
                 <span>{formatNumber(result.totalDeduction)} 원</span>
              </div>
            </div>
            <div className="mt-6 flex space-x-2">
              <button onClick={handleReset} className="w-full py-3 bg-white/20 hover:bg-white/30 dark:bg-gray-800 dark:hover:bg-gray-700 rounded-lg text-sm font-semibold text-white dark:text-gray-300 transition">초기화</button>
            </div>
        </div>
    </div>
  );
}