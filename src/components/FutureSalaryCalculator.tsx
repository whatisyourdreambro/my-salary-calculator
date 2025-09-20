"use client";

import { useState, useMemo } from "react";
import {
  calculateFutureSalary,
  calculatePathToGoal,
  SalaryEvent,
} from "@/lib/futureCalculator";
import { salaryData } from "@/lib/salaryData"; // [추가] salaryData import
import CurrencyInput from "./CurrencyInput";
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

const formatNumber = (num: number) => num.toLocaleString();

type CalculatorMode = "predict" | "goal";

export default function FutureSalaryCalculator() {
  const [mode, setMode] = useState<CalculatorMode>("predict");

  const [currentSalary, setCurrentSalary] = useState("50000000");
  const [years, setYears] = useState(10);

  const [baseRate, setBaseRate] = useState(5);
  const [events, setEvents] = useState<SalaryEvent[]>([]);

  const [targetSalary, setTargetSalary] = useState("100000000");

  // [추가] 시장 데이터 비교를 위한 상태
  const [jobCategory, setJobCategory] = useState("it_dev");
  const [experienceLevel, setExperienceLevel] = useState("3-6");

  const futureSalaries = useMemo(() => {
    if (mode === "predict") {
      const salary = Number(currentSalary.replace(/,/g, ""));
      // [수정] marketData를 찾아서 계산 함수에 전달
      const marketDataKey = `${jobCategory}-${experienceLevel}-all-all`;
      const marketData =
        salaryData[marketDataKey] ?? salaryData["all-all-all-all"];
      return calculateFutureSalary(salary, years, baseRate, events, marketData);
    }
    return [];
  }, [
    mode,
    currentSalary,
    years,
    baseRate,
    events,
    jobCategory,
    experienceLevel,
  ]);

  const careerPaths = useMemo(() => {
    if (mode === "goal") {
      const current = Number(currentSalary.replace(/,/g, ""));
      const target = Number(targetSalary.replace(/,/g, ""));
      return calculatePathToGoal(current, target, years);
    }
    return [];
  }, [mode, currentSalary, targetSalary, years]);

  const handleYearsChange = (newYearValue: number) => {
    const newYears = Math.max(1, Math.min(30, newYearValue));
    setYears(newYears);
    setEvents(events.filter((e) => e.yearIndex < newYears));
  };

  const addEvent = () => {
    const existingYears = new Set(events.map((e) => e.yearIndex));
    if (events.length >= years) {
      alert("예상 기간보다 많은 이벤트를 추가할 수 없습니다.");
      return;
    }

    let newYearIndex = 0;
    while (existingYears.has(newYearIndex)) {
      newYearIndex++;
      if (newYearIndex >= years) {
        alert("더 이상 이벤트를 추가할 연차가 없습니다.");
        return;
      }
    }

    setEvents([
      ...events,
      { yearIndex: newYearIndex, type: "promotion", value: 10 },
    ]);
  };

  const updateEvent = (
    index: number,
    field: keyof SalaryEvent,
    value: string | number
  ) => {
    const newEvents = [...events];
    const targetEvent = { ...newEvents[index] };

    if (field === "yearIndex") {
      const newYearIndex = Number(value);
      const isYearTaken = events.some(
        (event, i) => i !== index && event.yearIndex === newYearIndex
      );
      if (isYearTaken) {
        alert("이미 해당 연차에 이벤트가 존재합니다.");
        return;
      }
      targetEvent.yearIndex = newYearIndex;
    } else if (field === "type") {
      targetEvent.type = value as "promotion" | "job_change";
    } else if (field === "value") {
      targetEvent.value = Number(value);
    }

    newEvents[index] = targetEvent;
    setEvents(newEvents);
  };

  const removeEvent = (index: number) => {
    const newEvents = events.filter((_, i) => i !== index);
    setEvents(newEvents);
  };

  return (
    <div className="bg-light-card dark:bg-dark-card p-6 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-800 mt-8">
      <div className="flex justify-center mb-8">
        <div className="flex bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
          <button
            onClick={() => setMode("predict")}
            className={`flex-1 px-4 py-2 rounded-md text-sm font-semibold transition ${
              mode === "predict"
                ? "bg-white dark:bg-gray-700 shadow-sm"
                : "text-gray-500 dark:text-gray-400"
            }`}
          >
            미래 연봉 예측
          </button>
          <button
            onClick={() => setMode("goal")}
            className={`flex-1 px-4 py-2 rounded-md text-sm font-semibold transition ${
              mode === "goal"
                ? "bg-white dark:bg-gray-700 shadow-sm"
                : "text-gray-500 dark:text-gray-400"
            }`}
          >
            목표 달성 경로 찾기
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="p-4 border dark:border-gray-700 rounded-lg">
            <h2 className="text-lg font-bold text-light-text dark:text-dark-text mb-4">
              공통 정보
            </h2>
            <div className="space-y-4">
              <CurrencyInput
                label="현재 연봉"
                value={currentSalary}
                onValueChange={setCurrentSalary}
                quickAmounts={[10000000, 1000000]}
              />
              <div>
                <label className="text-sm font-medium text-light-text-secondary dark:text-dark-text-secondary">
                  기간 (년)
                </label>
                <div className="flex items-center justify-between p-2 mt-1 border dark:border-gray-700 rounded-lg">
                  <button
                    onClick={() => handleYearsChange(years - 1)}
                    className="w-8 h-8 text-xl text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full"
                  >
                    -
                  </button>
                  <span className="font-bold text-lg">{years} 년</span>
                  <button
                    onClick={() => handleYearsChange(years + 1)}
                    className="w-8 h-8 text-xl text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>
          </div>

          {mode === "predict" && (
            <div className="p-4 border dark:border-gray-700 rounded-lg">
              <h3 className="text-lg font-bold mb-4">예측 조건</h3>
              {/* [추가] 직군 및 경력 선택 UI */}
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="text-sm font-medium">직군</label>
                  <select
                    value={jobCategory}
                    onChange={(e) => setJobCategory(e.target.value)}
                    className="w-full mt-1 p-2 border rounded-lg dark:bg-dark-card"
                  >
                    <option value="it_dev">IT/개발</option>
                    <option value="marketing">마케팅/영업</option>
                    <option value="professional">전문직</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium">경력</label>
                  <select
                    value={experienceLevel}
                    onChange={(e) => setExperienceLevel(e.target.value)}
                    className="w-full mt-1 p-2 border rounded-lg dark:bg-dark-card"
                  >
                    <option value="1-2">1~2년</option>
                    <option value="3-6">3~6년</option>
                    <option value="7-10">7~10년</option>
                    <option value="11-14">11~14년</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-light-text-secondary dark:text-dark-text-secondary">
                  기본 연봉 상승률 (%)
                </label>
                <input
                  type="number"
                  value={baseRate}
                  onChange={(e) => setBaseRate(Number(e.target.value))}
                  className="w-full p-3 mt-1 border border-gray-200 dark:border-gray-700 rounded-lg"
                />
              </div>
              <h3 className="text-lg font-bold mt-4 mb-2">커리어 이벤트</h3>
              <div className="space-y-3 max-h-40 overflow-y-auto pr-2">
                {events.map((event, index) => (
                  <div
                    key={index}
                    className="p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg space-y-2"
                  >
                    <div className="flex justify-between items-center">
                      <select
                        value={event.yearIndex}
                        onChange={(e) =>
                          updateEvent(
                            index,
                            "yearIndex",
                            Number(e.target.value)
                          )
                        }
                        className="p-2 border rounded-md dark:bg-dark-card dark:border-gray-700 font-semibold"
                      >
                        {Array.from({ length: years }, (_, i) => (
                          <option key={i} value={i}>
                            {" "}
                            {i + 1}년차{" "}
                          </option>
                        ))}
                      </select>
                      <button
                        onClick={() => removeEvent(index)}
                        className="text-red-500 hover:text-red-700 font-bold p-1"
                      >
                        ×
                      </button>
                    </div>
                    <div className="flex gap-2">
                      <select
                        value={event.type}
                        onChange={(e) =>
                          updateEvent(index, "type", e.target.value)
                        }
                        className="w-1/2 p-2 border rounded-md dark:bg-dark-card dark:border-gray-700"
                      >
                        <option value="promotion">승진</option>
                        <option value="job_change">이직</option>
                      </select>
                      <div className="w-1/2 relative">
                        <input
                          type="number"
                          value={event.value}
                          onChange={(e) =>
                            updateEvent(index, "value", e.target.value)
                          }
                          className="w-full h-full p-2 pr-6 border rounded-md dark:bg-dark-card dark:border-gray-700"
                        />
                        <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-gray-400">
                          {event.type === "promotion" ? "%" : "원"}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <button
                onClick={addEvent}
                className="w-full mt-4 p-2 bg-signature-blue/10 text-signature-blue font-semibold rounded-lg hover:bg-signature-blue/20 transition"
              >
                + 이벤트 추가
              </button>
            </div>
          )}

          {mode === "goal" && (
            <div className="p-4 border dark:border-gray-700 rounded-lg">
              <h2 className="text-lg font-bold text-light-text dark:text-dark-text mb-4">
                목표 정보
              </h2>
              <CurrencyInput
                label="목표 연봉"
                value={targetSalary}
                onValueChange={setTargetSalary}
                quickAmounts={[100000000, 50000000]}
              />
            </div>
          )}
        </div>

        <div className="lg:col-span-3">
          <h2 className="text-2xl font-bold text-light-text dark:text-dark-text mb-4">
            {mode === "predict"
              ? "커리어 로드맵 시뮬레이션"
              : `연봉 ${formatNumber(
                  Number(targetSalary.replace(/,/g, ""))
                )}원 달성 경로`}
          </h2>

          {mode === "predict" && (
            <>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart
                  data={futureSalaries}
                  margin={{ top: 5, right: 20, left: 10, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.2} />
                  <XAxis dataKey="year" />
                  <YAxis
                    tickFormatter={(value) =>
                      `${(value / 10000).toLocaleString()}만`
                    }
                  />
                  <Tooltip
                    formatter={(value: number, name: string) => [
                      `${formatNumber(value)} 원`,
                      name,
                    ]}
                  />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="salary"
                    name="나의 예상 연봉"
                    stroke="#007FFF"
                    strokeWidth={3}
                    dot={{ r: 4 }}
                    activeDot={{ r: 8 }}
                  />
                  {/* [추가] 시장 데이터 라인 */}
                  <Line
                    type="monotone"
                    dataKey="marketAverage"
                    name="시장 평균"
                    stroke="#FFBB28"
                    strokeWidth={2}
                    strokeDasharray="5 5"
                    dot={false}
                  />
                  <Line
                    type="monotone"
                    dataKey="marketTop10"
                    name="시장 상위 10%"
                    stroke="#00C49F"
                    strokeWidth={2}
                    strokeDasharray="5 5"
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
              <div className="max-h-[25vh] overflow-y-auto mt-6">
                <table className="min-w-full text-sm">
                  <thead className="sticky top-0 bg-light-card dark:bg-dark-card">
                    <tr className="border-b dark:border-gray-700">
                      <th className="p-2 text-left font-semibold">연도</th>
                      <th className="p-2 text-right font-semibold">
                        나의 예상 연봉
                      </th>
                      <th className="p-2 text-right font-semibold">상승액</th>
                    </tr>
                  </thead>
                  <tbody>
                    {futureSalaries.map((item) => (
                      <tr
                        key={item.year}
                        className="border-t dark:border-gray-700"
                      >
                        <td className="p-2 font-semibold">{item.year}년</td>
                        <td className="p-2 text-right text-signature-blue font-bold">
                          {formatNumber(item.salary)} 원
                        </td>
                        <td className="p-2 text-right text-green-600">
                          + {formatNumber(item.increaseAmount)} 원
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}

          {mode === "goal" && (
            <div className="space-y-6">
              {careerPaths.length > 0 ? (
                careerPaths.map((path) => (
                  <div
                    key={path.scenario}
                    className="p-6 bg-gray-50 dark:bg-gray-800/50 rounded-lg border dark:border-gray-700"
                  >
                    <h3 className="text-xl font-bold text-signature-blue">
                      {path.scenario}
                    </h3>
                    <p className="mt-2 text-light-text-secondary dark:text-dark-text-secondary">
                      {path.description}
                    </p>
                    <div className="mt-4 space-y-2">
                      {path.events.map((event) => (
                        <div
                          key={event.yearIndex}
                          className="p-3 bg-white dark:bg-dark-card rounded"
                        >
                          <p className="font-semibold">
                            {event.yearIndex + 1}년차:{" "}
                            {event.type === "promotion" ? "승진" : "이직"}
                          </p>
                          <p>
                            {event.type === "promotion"
                              ? `연봉 ${event.value}% 추가 상승`
                              : `연봉 ${formatNumber(event.value)}원으로 점프`}
                          </p>
                        </div>
                      ))}
                      <div className="p-3 bg-white dark:bg-dark-card rounded">
                        <p className="font-semibold">이후 기간</p>
                        <p>
                          연 평균{" "}
                          <span className="font-bold text-green-600">
                            {path.avgIncreaseRate}%
                          </span>
                          의 연봉 상승 필요
                        </p>
                      </div>
                    </div>
                    <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/30 rounded-lg">
                      <h4 className="font-bold">⭐ 역량 제안</h4>
                      <p className="text-sm mt-1">
                        {path.scenario === "안정 성장형"
                          ? "성공적인 승진을 위해 프로젝트 관리, 팀 리더십 역량을 키워보세요."
                          : "성공적인 이직을 위해 최신 기술 스택(AI, 클라우드)을 학습하고 포트폴리오를 준비하세요."}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-center text-gray-500 py-10">
                  현실적인 경로를 찾을 수 없습니다. 목표를 재설정해주세요.
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
