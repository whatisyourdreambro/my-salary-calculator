// src/components/SalaryMBTICalculator.tsx
"use client";

import { useState, useRef } from "react";
import {
  questions,
  getResultType,
  SalaryMBTIType,
  QuestionOption,
} from "@/lib/salaryMBTI";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import html2canvas from "html2canvas";
import Link from "next/link";
import { Share2, Download, RefreshCw } from "lucide-react";

export default function SalaryMBTICalculator() {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<string[]>([]);
  const [result, setResult] = useState<SalaryMBTIType | null>(null);
  const resultRef = useRef<HTMLDivElement>(null);

  const handleAnswer = (answer: string) => {
    const newAnswers = [...answers, answer];
    setAnswers(newAnswers);

    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      const resultType = getResultType(newAnswers);
      setResult(resultType);
    }
  };

  const handleReset = () => {
    setCurrentQuestionIndex(0);
    setAnswers([]);
    setResult(null);
  };

  const handleShare = async () => {
    if (!result) return;
    // 공유 문구를 더 흥미롭게 수정!
    const shareText = `💸 내 인생 연봉 그래프는 '${result.title}'! 과연 당신의 재물운은? 지금 바로 확인해보세요! 👇`;
    const shareUrl = window.location.href;

    if (navigator.share) {
      navigator.share({
        title: "인생 연봉 그래프 테스트 | Moneysalary",
        text: shareText,
        url: shareUrl,
      });
    } else {
      await navigator.clipboard.writeText(`${shareText} ${shareUrl}`);
      alert(
        "결과가 클립보드에 복사되었습니다. 원하는 곳에 붙여넣어 공유하세요!"
      );
    }
  };

  const handleDownload = () => {
    if (resultRef.current) {
      html2canvas(resultRef.current, {
        backgroundColor: null,
        scale: 2,
      }).then((canvas) => {
        const link = document.createElement("a");
        link.download = `내 인생 연봉 그래프_${result?.title}_Moneysalary.png`;
        link.href = canvas.toDataURL("image/png");
        link.click();
      });
    }
  };

  if (result) {
    return (
      <div className="bg-card p-6 sm:p-10 rounded-2xl shadow-xl border animate-fade-in-up">
        <div ref={resultRef} className="bg-card p-8">
          <p className="text-center font-semibold text-primary">
            당신의 인생 연봉 그래프는...
          </p>
          <h2 className="text-4xl font-bold text-center my-2">
            {result.title}
          </h2>
          <div className="h-64 w-full my-6">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={result.data}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <XAxis dataKey="age" />
                <YAxis tickFormatter={(value) => `${value}억`} />
                <Tooltip
                  formatter={(value: number) => [`${value}억`, "연봉"]}
                />
                <Line
                  type="monotone"
                  dataKey="salary"
                  stroke="hsl(var(--primary))"
                  strokeWidth={3}
                  dot={{ r: 4 }}
                  activeDot={{ r: 8 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <p className="text-center text-lg">{result.description}</p>
        </div>
        <div className="mt-6 space-y-4">
          {/* [수정] result.guide 대신 result.growthPlan[0]을 사용합니다. */}
          <Link
            href={result.growthPlan[0].link}
            className="block p-4 border rounded-lg hover:shadow-lg transition-shadow bg-primary/10 dark:border-border text-center"
          >
            <p className="font-bold text-primary">
              📈 {result.title}을 위한 맞춤 금융 가이드
            </p>
            <p className="text-sm mt-1">{result.growthPlan[0].title}</p>
          </Link>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <button
              onClick={handleDownload}
              className="w-full py-3 bg-secondary font-semibold rounded-lg flex items-center justify-center gap-2"
            >
              {" "}
              <Download size={18} />
              이미지 저장
            </button>
            <button
              onClick={handleShare}
              className="w-full py-3 bg-accent font-bold rounded-lg flex items-center justify-center gap-2"
            >
              <Share2 size={18} />
              결과 공유
            </button>
            <button
              onClick={handleReset}
              className="w-full py-3 bg-secondary font-semibold rounded-lg flex items-center justify-center gap-2"
            >
              <RefreshCw size={18} />
              다시하기
            </button>
          </div>
        </div>
      </div>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / questions.length) * 100;

  return (
    <div className="bg-card p-6 sm:p-10 rounded-2xl shadow-xl border">
      <div className="w-full bg-secondary rounded-full h-2.5 mb-8">
        <div
          className="bg-primary h-2.5 rounded-full transition-all duration-500"
          style={{ width: `${progress}%` }}
        ></div>
      </div>
      <div className="text-center">
        <p className="text-sm font-semibold text-gray-500">
          Q{currentQuestionIndex + 1}.
        </p>
        <h2 className="text-2xl sm:text-3xl font-bold my-4">
          {currentQuestion.question}
        </h2>
      </div>
      <div className="mt-8 space-y-4 max-w-md mx-auto">
        {currentQuestion.options.map(
          (option: QuestionOption, index: number) => (
            <button
              key={index}
              onClick={() => handleAnswer(option.type)}
              className="w-full text-left p-4 border-2 border-border rounded-lg hover:border-primary hover:bg-primary/10 transition-all transform hover:scale-105"
            >
              <p className="text-lg font-semibold">{option.text}</p>
            </button>
          )
        )}
      </div>
    </div>
  );
}