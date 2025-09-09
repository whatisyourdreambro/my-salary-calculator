'use client';

import { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import html2canvas from 'html2canvas';
import { calculateNetSalary } from '@/lib/calculator';
import CurrencyInput from './CurrencyInput';
import DeductionPieChart from './DeductionPieChart';

const formatNumber = (num: number) => num.toLocaleString();
const parseNumber = (str: string) => Number(str.replace(/,/g, ''));

export default function SalaryCalculator() {
  const resultCardRef = useRef<HTMLDivElement>(null);
  const searchParams = useSearchParams();
  const [payBasis, setPayBasis] = useState<'annual' | 'monthly'>('annual');
  const [severanceType, setSeveranceType] = useState<'separate' | 'included'>('separate');
  const [salaryInput, setSalaryInput] = useState('');
  const [nonTaxableAmount, setNonTaxableAmount] = useState('200,000');
  const [dependents, setDependents] = useState(1);
  const [children, setChildren] = useState(0);
  const [overtimePay, setOvertimePay] = useState('');
  const [result, setResult] = useState({
    monthlyNet: 0, totalDeduction: 0, pension: 0, health: 0,
    longTermCare: 0, employment: 0, incomeTax: 0, localTax: 0,
  });

  useEffect(() => {
    const data = searchParams.get('data');
    if (data) {
      try {
        const decodedState = JSON.parse(atob(data));
        setPayBasis(decodedState.payBasis || 'annual');
        setSeveranceType(decodedState.severanceType || 'separate');
        setSalaryInput(decodedState.salaryInput || '');
        setNonTaxableAmount(decodedState.nonTaxableAmount || '200,000');
        setDependents(decodedState.dependents || 1);
        setChildren(decodedState.children || 0);
      } catch (error) {
        console.error("Failed to parse shared data:", error);
      }
    }
  }, [searchParams]);

  useEffect(() => {
    const salary = parseNumber(salaryInput);
    const nonTaxable = parseNumber(nonTaxableAmount) * 12;
    let annualSalary = payBasis === 'annual' ? salary : salary * 12;
    if (severanceType === 'included' && annualSalary > 0) {
      annualSalary = (annualSalary / 13) * 12;
    }
    const annualOvertime = parseNumber(overtimePay);
    const newResult = calculateNetSalary(annualSalary, nonTaxable, dependents, children, annualOvertime);
    setResult(newResult);
  }, [payBasis, severanceType, salaryInput, nonTaxableAmount, dependents, children, overtimePay]);
  
  const handleReset = () => {
    setPayBasis('annual');
    setSeveranceType('separate');
    setSalaryInput('');
    setNonTaxableAmount('200,000');
    setDependents(1);
    setChildren(0);
    setOvertimePay('');
  };

  const handleCapture = async () => {
    const element = resultCardRef.current;
    if (!element) return;

    const watermark = document.createElement('div');
    watermark.innerText = 'https://www.moneysalary.com';
    watermark.style.position = 'absolute';
    watermark.style.bottom = '10px';
    watermark.style.right = '10px';
    watermark.style.color = 'rgba(255, 255, 255, 0.5)';
    watermark.style.fontSize = '12px';
    watermark.style.fontFamily = 'sans-serif';
    element.appendChild(watermark);

    const canvas = await html2canvas(element, { backgroundColor: null, useCORS: true });
    element.removeChild(watermark);

    const link = document.createElement('a');
    link.download = 'salary_result.png';
    link.href = canvas.toDataURL('image/png');
    link.click();
  };

  const handleShareLink = () => {
    const stateToShare = { payBasis, severanceType, salaryInput, nonTaxableAmount, dependents, children };
    const encodedState = btoa(JSON.stringify(stateToShare));
    const shareUrl = `${window.location.origin}${window.location.pathname}?data=${encodedState}`;
    navigator.clipboard.writeText(shareUrl).then(() => {
      alert('결과가 포함된 링크가 클립보드에 복사되었습니다.');
    }, () => {
      alert('링크 복사에 실패했습니다.');
    });
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
        <div className="space-y-8">
          <div className="bg-light-card dark:bg-dark-card p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800">
            <h2 className="text-lg font-bold text-light-text dark:text-dark-text mb-4">필수 입력</h2>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="text-sm font-medium text-light-text-secondary dark:text-dark-text-secondary mb-1 block">급여 기준</label>
                <div className="flex bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
                  <button onClick={() => setPayBasis('annual')} className={`flex-1 p-2 rounded-md text-sm font-semibold ${payBasis === 'annual' ? 'bg-white dark:bg-gray-700 shadow-sm' : 'text-gray-500 dark:text-gray-400'}`}>연봉</button>
                  <button onClick={() => setPayBasis('monthly')} className={`flex-1 p-2 rounded-md text-sm font-semibold ${payBasis === 'monthly' ? 'bg-white dark:bg-gray-700 shadow-sm' : 'text-gray-500 dark:text-gray-400'}`}>월급</button>
                </div>
              </div>
              <div>
                <label