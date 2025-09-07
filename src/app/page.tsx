'use client';

import { useState } from 'react';
import SalaryCalculator from '@/components/SalaryCalculator';
import SeveranceCalculator from '@/components/SeveranceCalculator';

export default function HomePage() {
  const [activeTab, setActiveTab] = useState<'salary' | 'severance'>('salary');

  return (
    <main className="w-full max-w-6xl mx-auto p-4 sm:p-6 lg:p-8">
      <div className="text-center mb-8">
        <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
          연봉 / 퇴직금 계산기
        </h1>
        <p className="mt-4 text-lg text-gray-600 dark:text-gray-400">
          가장 쉽고 빠르게 급여와 퇴직금을 확인하세요.
        </p>
      </div>

      <div className="flex justify-center mb-8 border-b border-gray-200 dark:border-gray-800">
        <button
          onClick={() => setActiveTab('salary')}
          className={`px-6 py-3 font-semibold text-lg transition-colors duration-200 ${
            activeTab === 'salary' 
              ? 'border-b-2 border-signature-blue text-signature-blue' 
              : 'text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200'
          }`}
        >
          연봉 계산기
        </button>
        <button
          onClick={() => setActiveTab('severance')}
          className={`px-6 py-3 font-semibold text-lg transition-colors duration-200 ${
            activeTab === 'severance' 
              ? 'border-b-2 border-signature-blue text-signature-blue' 
              : 'text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200'
          }`}
        >
          퇴직금 계산기
        </button>
      </div>

      <div>
        {activeTab === 'salary' && <SalaryCalculator />}
        {activeTab === 'severance' && <SeveranceCalculator />}
      </div>
    </main>
  );
}