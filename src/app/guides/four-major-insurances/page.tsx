"use client"; // 미니 계산기를 위해 클라이언트 컴포넌트로 전환

import { useState, useMemo } from "react";
import { calculateNetSalary } from "@/lib/calculator";
import CurrencyInput from "@/components/CurrencyInput";

// Mini Calculator Component
const MiniInsuranceCalculator = () => {
  const [monthlySalary, setMonthlySalary] = useState("3000000");
  const result = useMemo(() => {
    const salary = Number(monthlySalary.replace(/,/g, ""));
    if (salary <= 0) return { pension: 0, health: 0, employment: 0 };
    return calculateNetSalary(salary * 12, 0, 1, 0, 0, {
      isSmeYouth: false,
      disabledDependents: 0,
      seniorDependents: 0,
    });
  }, [monthlySalary]);

  return (
    <div className="my-6 p-6 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-200 dark:border-blue-800">
      <h3 className="text-xl font-bold !mt-0">내 4대 보험료 간편 계산기</h3>
      <div className="my-4">
        <CurrencyInput
          label="월급 (세전)"
          value={monthlySalary}
          onValueChange={setMonthlySalary}
          quickAmounts={[100000, 50000]}
        />
      </div>
      <div className="space-y-2 text-sm">
        <div className="flex justify-between">
          <span>국민연금:</span>{" "}
          <strong>{result.pension.toLocaleString()}원</strong>
        </div>
        <div className="flex justify-between">
          <span>건강보험:</span>{" "}
          <strong>{result.health.toLocaleString()}원</strong>
        </div>
        <div className="flex justify-between">
          <span>고용보험:</span>{" "}
          <strong>{result.employment.toLocaleString()}원</strong>
        </div>
      </div>
    </div>
  );
};

export default function FourMajorInsurancesPage() {
  return (
    <>
      <main className="w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <div className="text-center mb-12">
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
            4대 보험, 월급에서 왜 떼는 걸까?
          </h1>
          <p className="mt-4 text-lg text-gray-600 dark:text-gray-400">
            국민연금, 건강보험, 고용보험, 산재보험. 직장인의 든든한 사회안전망
            4대 보험의 모든 것을 알려드립니다.
          </p>
        </div>

        <article className="prose dark:prose-invert lg:prose-xl max-w-none space-y-8">
          <section className="bg-light-card dark:bg-dark-card p-6 rounded-2xl shadow-lg border">
            <h2 className="!mt-0 text-2xl font-bold">
              1. 국민연금: 나의 노후를 위한 최소한의 준비
            </h2>
            <p>
              소득이 있을 때 꾸준히 보험료를 납부하여 모아두었다가, 나이가 들어
              생업에 종사하지 못하거나 예기치 못한 사고나 질병으로 장애를 입거나
              사망했을 때 본인 또는 유족에게 연금을 지급하여 기본적인 생활을
              유지할 수 있도록 돕는 제도입니다.
            </p>
          </section>

          {/* 여기에 미니 계산기 삽입 */}
          <MiniInsuranceCalculator />

          <section className="bg-light-card dark:bg-dark-card p-6 rounded-2xl shadow-lg border">
            <h2 className="!mt-0 text-2xl font-bold">
              2. 건강보험: 아플 때 든든한 버팀목
            </h2>
            <p>
              질병이나 부상으로 인해 발생하는 고액의 진료비 부담을 방지하기 위한
              제도로, 평소에 보험료를 내고 필요시 보험급여를 제공받습니다.
            </p>
          </section>

          <section className="bg-light-card dark:bg-dark-card p-6 rounded-2xl shadow-lg border">
            <h2 className="!mt-0 text-2xl font-bold">
              3. 고용보험: 실직과 재취업의 다리
            </h2>
            <p>
              실직한 근로자에게 실업급여를 지급하여 재취업을 준비하는 기간
              동안의 생계를 지원하고, 재취업을 위한 각종 교육 훈련 프로그램 등을
              제공하는 사회보험입니다.
            </p>
          </section>
        </article>
      </main>
    </>
  );
}
