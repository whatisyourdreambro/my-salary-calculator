// src/app/mbti-salary/page.tsx
"use client";

import { useState, useRef, useEffect } from "react";
import type { ElementType } from "react";
import {
  questions,
  getResultType,
  type SalaryMBTIType,
} from "@/lib/salaryMBTI";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Legend,
} from "recharts";
import html2canvas from "html2canvas";
import Link from "next/link";
import {
  Share2,
  Download,
  RefreshCw,
  ArrowRight,
  BarChart2,
  BrainCircuit,
  Target,
} from "lucide-react";

// 타이핑 효과를 위한 커스텀 훅
const useTypingEffect = (text: string, speed = 50) => {
  const [displayedText, setDisplayedText] = useState("");

  useEffect(() => {
    setDisplayedText("");
    if (text) {
      let i = 0;
      const intervalId = setInterval(() => {
        setDisplayedText((prev) => prev + text.charAt(i));
        i++;
        if (i >= text.length) {
          clearInterval(intervalId);
        }
      }, speed);
      return () => clearInterval(intervalId);
    }
  }, [text, speed]);

  return displayedText;
};

export default function MbtiSalaryPage() {
  const [step, setStep] = useState<"intro" | "quiz" | "loading" | "result">(
    "intro"
  );
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<string[]>([]);
  const [result, setResult] = useState<SalaryMBTIType | null>(null);
  const resultRef = useRef<HTMLDivElement>(null);

  const displayedQuestion = useTypingEffect(
    step === "quiz" ? questions[currentQuestionIndex].question : ""
  );

  const handleStart = () => {
    setStep("quiz");
  };

  const handleAnswer = (answer: string) => {
    const newAnswers = [...answers, answer];
    setAnswers(newAnswers);

    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      setStep("loading");
      setTimeout(() => {
        const resultType = getResultType(newAnswers);
        setResult(resultType);
        setStep("result");
      }, 2000); // 2초간 로딩 애니메이션
    }
  };

  const handleReset = () => {
    setCurrentQuestionIndex(0);
    setAnswers([]);
    setResult(null);
    setStep("intro");
  };

  const handleShare = async () => {
    if (!result) return;
    const shareText = `💸 내 인생 연봉 그래프는 '${result.title}'! 과연 당신의 재물운은? 지금 바로 확인해보세요! 👇`;
    const shareUrl = window.location.href;

    try {
      if (navigator.share) {
        await navigator.share({
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
    } catch (error) {
      console.error("Sharing failed:", error);
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

  const iconMap: { [key: number]: ElementType } = {
    1: Target,
    2: BrainCircuit,
    3: BarChart2,
  };

  return (
    <main className="w-full min-h-screen bg-light-bg dark:bg-gray-900 text-light-text dark:text-white overflow-hidden relative">
      {/* Animated Background */}
      <div className="absolute inset-0 z-0 opacity-10 dark:opacity-40">
        {[...Array(50)].map((_, i) => (
          <div
            key={i}
            className="absolute bg-gray-500 rounded-full animate-pulse"
            style={{
              width: `${Math.random() * 2 + 1}px`,
              height: `${Math.random() * 2 + 1}px`,
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 5}s`,
              animationDuration: `${Math.random() * 3 + 2}s`,
            }}
          />
        ))}
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-t from-light-bg dark:from-gray-900 via-transparent to-transparent" />
        <div className="absolute top-1/2 left-1/2 w-[200%] h-[200%] -translate-x-1/2 -translate-y-1/2 bg-gradient-radial from-violet-500/10 via-transparent to-transparent animate-spin-slow" />
      </div>

      <div className="relative z-10 flex items-center justify-center min-h-screen p-4">
        {step === "intro" && (
          <div className="text-center animate-fade-in-up">
            <h1 className="text-4xl sm:text-6xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-violet-500 to-indigo-500 dark:from-violet-300 dark:to-indigo-300">
              당신의 부(富)는
              <br />
              어떤 모습일까요?
            </h1>
            <p className="mt-6 max-w-2xl mx-auto text-lg sm:text-xl text-light-text-secondary dark:text-indigo-100">
              몇 가지 질문에 답하고, 당신의 숨겨진 재물운과
              <br />
              미래를 지배할 인생 연봉 그래프를 확인해보세요.
            </p>
            <button
              onClick={handleStart}
              className="mt-10 px-12 py-4 bg-gray-800 text-white dark:bg-white dark:text-black font-bold rounded-full text-lg hover:bg-gray-700 dark:hover:bg-gray-200 transition-transform transform hover:scale-105 shadow-lg shadow-violet-500/30"
            >
              운명 확인하기
            </button>
          </div>
        )}

        {step === "quiz" && (
          <div className="w-full max-w-2xl bg-light-card/80 dark:bg-black/30 backdrop-blur-md p-6 sm:p-10 rounded-2xl shadow-2xl border border-gray-200 dark:border-white/20 animate-fade-in-up">
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5 mb-8">
              <div
                className="bg-gradient-to-r from-violet-500 to-indigo-500 dark:from-violet-400 dark:to-indigo-400 h-2.5 rounded-full transition-all duration-500"
                style={{
                  width: `${
                    ((currentQuestionIndex + 1) / questions.length) * 100
                  }%`,
                }}
              ></div>
            </div>
            {/* [수정] min-h-[100px] 클래스를 제거하여 내용에 따라 높이가 유연하게 변경되도록 수정했습니다. */}
            <div className="text-center py-4">
              <p className="text-sm font-semibold text-gray-500 dark:text-gray-400">
                Q{currentQuestionIndex + 1}.
              </p>
              <h2 className="text-2xl sm:text-3xl font-bold my-4 min-h-[3rem] sm:min-h-[4.5rem]">
                {displayedQuestion}
              </h2>
            </div>
            <div className="mt-8 space-y-4 max-w-md mx-auto">
              {questions[currentQuestionIndex].options.map((option, index) => (
                <button
                  key={index}
                  onClick={() => handleAnswer(option.type)}
                  className="w-full text-left p-5 border-2 border-gray-300 dark:border-gray-700 rounded-lg bg-gray-100/50 dark:bg-gray-800/50 hover:border-violet-500 dark:hover:border-violet-400 hover:bg-violet-50 dark:hover:bg-violet-900/30 transition-all transform hover:scale-105"
                >
                  <p className="text-lg font-semibold">{option.text}</p>
                </button>
              ))}
            </div>
          </div>
        )}

        {step === "loading" && (
          <div className="text-center animate-fade-in-up">
            <div className="w-16 h-16 border-4 border-dashed rounded-full animate-spin border-violet-500 dark:border-violet-400 mx-auto"></div>
            <h2 className="mt-8 text-2xl font-bold">
              당신의 미래를 분석하는 중...
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              운명의 그래프가 그려지고 있습니다.
            </p>
          </div>
        )}

        {step === "result" && result && (
          <div className="w-full max-w-4xl animate-fade-in-up">
            <div
              ref={resultRef}
              className="bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-900 dark:to-slate-800 p-8 rounded-2xl shadow-2xl border border-gray-200 dark:border-white/20"
            >
              <p className="text-center font-semibold text-primary dark:text-indigo-300">
                당신의 인생 연봉 그래프는...
              </p>
              <h2 className="text-4xl font-bold text-center my-2 bg-clip-text text-transparent bg-gradient-to-r from-violet-500 to-indigo-500 dark:from-violet-300 dark:to-indigo-300">
                {result.title} <span className="text-3xl">{result.icon}</span>
              </h2>
              <p className="text-center text-light-text-secondary dark:text-gray-300 max-w-md mx-auto">
                {result.description}
              </p>
              <div className="flex justify-center gap-2 my-4">
                {result.keywords.map((tag) => (
                  <span
                    key={tag}
                    className="bg-gray-200 dark:bg-white/10 text-xs px-2 py-1 rounded-full"
                  >
                    {tag}
                  </span>
                ))}
              </div>

              <div className="h-72 w-full my-6">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={result.data}
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="currentColor"
                      strokeOpacity={0.2}
                    />
                    <XAxis dataKey="age" stroke="currentColor" />
                    <YAxis
                      tickFormatter={(value) => `${value}억`}
                      stroke="currentColor"
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "rgba(30,30,30,0.8)",
                        border: "1px solid rgba(255,255,255,0.3)",
                      }}
                    />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="salary"
                      name="예상 연봉(억)"
                      stroke="#8884d8"
                      strokeWidth={3}
                      dot={{ r: 4 }}
                      activeDot={{ r: 8 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
                <div className="bg-gray-200/50 dark:bg-white/5 p-4 rounded-lg">
                  <h4 className="font-bold text-lg text-green-600 dark:text-green-400">
                    Financial DNA: 강점
                  </h4>
                  <p className="text-sm mt-2">{result.dna.strength}</p>
                </div>
                <div className="bg-gray-200/50 dark:bg-white/5 p-4 rounded-lg">
                  <h4 className="font-bold text-lg text-red-600 dark:text-red-400">
                    Financial DNA: 약점
                  </h4>
                  <p className="text-sm mt-2">{result.dna.weakness}</p>
                </div>
              </div>
            </div>

            <div className="mt-8">
              <h3 className="text-2xl font-bold text-center mb-6">
                🚀 당신을 위한 성장 플랜
              </h3>
              <div className="space-y-4">
                {result.growthPlan.map((plan) => {
                  const Icon =
                    iconMap[plan.step as keyof typeof iconMap] || Target;
                  return (
                    <div
                      key={plan.step}
                      className="p-4 border border-gray-200 dark:border-white/20 rounded-xl bg-light-card dark:bg-white/5 hover:bg-gray-100 dark:hover:bg-white/10 transition-colors"
                    >
                      <div className="flex items-start gap-4">
                        <div className="bg-violet-200 dark:bg-violet-500/20 text-violet-600 dark:text-violet-300 p-3 rounded-full">
                          <Icon className="w-6 h-6" />
                        </div>
                        <div>
                          <p className="font-semibold text-gray-500 dark:text-gray-400">
                            STEP {plan.step}
                          </p>
                          <h4 className="font-bold text-lg mt-1">
                            {plan.title}
                          </h4>
                          <p className="text-sm text-light-text-secondary dark:text-gray-300 mt-2">
                            {plan.description}
                          </p>
                          <Link
                            href={plan.link}
                            className="inline-flex items-center gap-2 mt-3 text-sm font-bold text-primary dark:text-violet-300 hover:underline"
                          >
                            {plan.linkText} <ArrowRight size={16} />
                          </Link>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4">
              <button
                onClick={handleDownload}
                className="w-full py-3 bg-gray-200 dark:bg-gray-700 font-semibold rounded-lg flex items-center justify-center gap-2 hover:bg-gray-300 dark:hover:bg-gray-600 transition"
              >
                <Download size={18} />
                이미지 저장
              </button>
              <button
                onClick={handleShare}
                className="w-full py-3 bg-yellow-400 text-black dark:bg-yellow-500 font-bold rounded-lg flex items-center justify-center gap-2 hover:bg-yellow-500 dark:hover:bg-yellow-600 transition"
              >
                <Share2 size={18} />
                결과 공유
              </button>
              <button
                onClick={handleReset}
                className="w-full py-3 bg-gray-200 dark:bg-gray-700 font-semibold rounded-lg flex items-center justify-center gap-2 hover:bg-gray-300 dark:hover:bg-gray-600 transition"
              >
                <RefreshCw size={18} />
                다시하기
              </button>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
