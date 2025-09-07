'use client';

import { useState, useEffect } from 'react';
import { calculateSeverancePay } from '@/lib/severanceCalculator';
import CurrencyInput from './CurrencyInput';

const formatNumber = (num: number) => num.toLocaleString();
const parseNumber = (str: string) => Number(str.replace(/,/g, ''));

export default function SeveranceCalculator() {
  const today = new Date().toISOString().split('T')[0];
  const oneYearAgo = new Date();
  oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

  const [startDate, setStartDate] = useState(oneYearAgo.toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(today);
  const [monthlySalary, setMonthlySalary] = useState('');
  const [annualBonus, setAnnualBonus] = useState('');
  const [annualLeavePay, setAnnualLeavePay] = useState('');
  const [result, setResult] = useState({ averageDailyWage: 0, estimatedSeverancePay: 0 });

  useEffect(() => {
    const newResult = calculateSeverancePay(
      startDate, endDate, parseNumber(monthlySalary),
      parseNumber(annualBonus), parseNumber(annualLeavePay)
    );
    setResult(newResult);
  }, [startDate, endDate, monthlySalary, annualBonus, annualLeavePay]);
  
  const handleReset = () => {
    setStartDate(oneYearAgo.toISOString().split('T')[0]);
    setEndDate(today);
    setMonthlySalary('');
    setAnnualBonus('');
    setAnnualLeavePay('');
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
      <div className="space-y-8">
        <div className="bg-white dark:bg-gray-900 p-6 rounded-xl border border-gray-200 dark:border-gray-800">
          <h2 className="text-lg font-bold text-gray-800 dark:text-gray-200 mb-4">필수 입력</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            <div>
              <label htmlFor="startDate" className="text-sm font-medium text-gray-700 dark:text-gray-300">입사일</label>
              <input type="date" id="startDate" value={startDate} onChange={e => setStartDate(e.target.value)} className="w-full mt-1 p-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-200"/>
            </div>
            <div>
              <label htmlFor="endDate" className="text-sm font-medium text-gray-700 dark:text-gray-300">퇴사일 (마지막 근무일)</label>
              <input type="date" id="endDate" value={endDate} onChange={e => setEndDate(e.target.value)} className="w-full mt-1 p-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-200"/>
            </div>
          </div>
          <CurrencyInput
            label="월급 (세전, 3개월 평균)"
            value={monthlySalary}
            onValueChange={setMonthlySalary}
            quickAmounts={[1000000, 100000, 10000]}
          />
        </div>
        <div className="bg-white dark:bg-gray-900 p-6 rounded-xl border border-gray-200 dark:border-gray-800">
          <h2 className="text-lg font-bold text-gray-800 dark:text-gray-200 mb-4">선택 입력 (1년치 총액)</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">연간 상여금</label>
              <div className="relative mt-1">
                 <input type="text" value={annualBonus} onChange={(e) => {const v=e.target.value.replace(/[^0-9]/g,''); setAnnualBonus(v ? formatNumber(Number(v)):'')}} className="w-full p-3 pr-12 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-200" />
                 <span className="absolute inset-y-0 right-4 flex items-center text-gray-500 dark:text-gray-400">원</span>
              </div>
            </div>
             <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">연차수당</label>
               <div className="relative mt-1">
                 <input type="text" value={annualLeavePay} onChange={(e) => {const v=e.target.value.replace(/[^0-9]/g,''); setAnnualLeavePay(v ? formatNumber(Number(v)):'')}} className="w-full p-3 pr-12 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-200" />
                 <span className="absolute inset-y-0 right-4 flex items-center text-gray-500 dark:text-gray-400">원</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-signature-blue dark:bg-gray-900 text-white p-6 rounded-xl flex flex-col h-full">
          <div className="flex-grow">
            <p className="text-blue-200 dark:text-gray-400 text-sm">예상 퇴직금</p>
            <p className="text-4xl sm:text-5xl font-bold my-2 text-white">{formatNumber(result.estimatedSeverancePay)} 원</p>
            <div className="mt-6 pt-6 border-t border-white/20 dark:border-gray-700 flex justify-between text-sm">
                <span className="text-blue-200 dark:text-gray-400">1일 평균 임금</span>
                <span className="text-white dark:text-gray-200">{formatNumber(result.averageDailyWage)} 원</span>
            </div>
          </div>
          <div className="mt-6 flex space-x-2">
            <button onClick={handleReset} className="w-full py-3 bg-white/20 hover:bg-white/30 dark:bg-gray-800 dark:hover:bg-gray-700 rounded-lg text-sm font-semibold text-white dark:text-gray-300 transition">초기화</button>
          </div>
      </div>
    </div>
  );
}