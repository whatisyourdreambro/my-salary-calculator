'use client';

import { useState, useMemo } from 'react';
import SalaryTable from '@/components/SalaryTable';
import { generateAnnualSalaryTableData } from '@/lib/generateData';

const tableHeaders = [
  { key: 'preTax', label: '세전 금액(원)' }, { key: 'monthlyNet', label: '월 실수령액(원)' },
  { key: 'health', label: '건강보험(원)' }, { key: 'employment', label: '고용보험(원)' },
  { key: 'longTermCare', label: '장기요양(원)' }, { key: 'pension', label: '국민연금(원)' },
  { key: 'incomeTax', label: '소득세(원)' }, { key: 'localTax', label: '지방소득세(원)' },
  { key: 'totalDeduction', label: '공제액 합계(원)' },
];

export default function AnnualTablePage() {
  const [searchTerm, setSearchTerm] = useState('');
  const allData = useMemo(() => generateAnnualSalaryTableData(), []);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    const numericValue = value.replace(/[^0-9]/g, '');
    if (numericValue) {
      setSearchTerm(parseInt(numericValue, 10).toLocaleString());
    } else {
      setSearchTerm('');
    }
  };
  
  const filteredData = useMemo(() => {
    if (!searchTerm) return allData;
    const cleanSearchTerm = searchTerm.replace(/,/g, '');
    return allData.filter(row => row.preTax.toString().includes(cleanSearchTerm));
  }, [searchTerm, allData]);

  const dynamicHeaders = tableHeaders.map(h => 
    h.key === 'preTax' ? { ...h, label: '연봉(원)' } : h
  );

  return (
    <main className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
      <div className="text-center mb-10">
        <h1 className="text-4xl font-bold tracking-tight text-signature-blue dark:text-gray-100 sm:text-5xl">
          연봉 실수령액 표
        </h1>
        <p className="mt-4 text-lg leading-8 text-gray-600 dark:text-gray-400">
          연봉 구간별 월 예상 실수령액과 상세 공제 내역을 확인하세요.
        </p>
      </div>
      
      <div className="mb-6 max-w-sm mx-auto">
        <input
          type="text"
          value={searchTerm}
          onChange={handleSearchChange}
          placeholder="연봉으로 검색 (예: 50,000,000)"
          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-signature-blue focus:border-signature-blue bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-200"
        />
      </div>

      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl shadow-sm overflow-hidden">
        <SalaryTable headers={dynamicHeaders} data={filteredData} />
      </div>
    </main>
  );
}