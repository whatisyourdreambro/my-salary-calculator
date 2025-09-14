"use client";

import { useState, useMemo } from "react";
import { calculateFutureSalary, SalaryEvent } from "@/lib/futureCalculator";
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

export default function FutureSalaryCalculator() {
  const [currentSalary, setCurrentSalary] = useState("50000000");
  const [years, setYears] = useState(10);
  const [baseRate, setBaseRate] = useState(5);
  const [events, setEvents] = useState<SalaryEvent[]>([]);

  const futureSalaries = useMemo(() => {
    const salary = Number(currentSalary.replace(/,/g, ""));
    return calculateFutureSalary(salary, years, baseRate, events);
  }, [currentSalary, years, baseRate, events]);

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

  // --- 수정된 부분: value의 타입을 명확히 지정하여 'any' 오류 해결 ---
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

  const handleYearsChange = (num: number) => {
    const newYears = Math.max(1, Math.min(30, num));
    setYears(newYears);
    setEvents(events.filter((e) => e.yearIndex < newYears));
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 mt-8">
      <div className="lg:col-span-2 space-y-6">
        <div className="bg-light-card dark:bg-dark-card p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800">
          <h2 className="text-lg font-bold text-light-text dark:text-dark-text mb-4">
            기본 정보 입력
          </h2>
          <div className="space-y-4">
            <CurrencyInput
              label="현재 연봉"
              value={currentSalary}
              onValueChange={setCurrentSalary}
              quickAmounts={[10000000, 1000000, 100000]}
            />
            <div>
              <label className="text-sm font-medium text-light-text-secondary dark:text-dark-text-secondary">
                예상 기간 (년)
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
          </div>
        </div>

        <div className="bg-light-card dark:bg-dark-card p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800">
          <h3 className="text-lg font-bold mb-4">커리어 이벤트 관리</h3>
          <div className="space-y-3 max-h-60 overflow-y-auto pr-2">
            {events.map((event, index) => (
              <div
                key={index}
                className="p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg space-y-2"
              >
                <div className="flex justify-between items-center">
                  <select
                    value={event.yearIndex}
                    onChange={(e) =>
                      updateEvent(index, "yearIndex", Number(e.target.value))
                    }
                    className="p-2 border rounded-md dark:bg-dark-card dark:border-gray-700 font-semibold"
                  >
                    {Array.from({ length: years }, (_, i) => (
                      <option key={i} value={i}>
                        {i + 1}년차
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
                    onChange={(e) => updateEvent(index, "type", e.target.value)}
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
      </div>

      <div className="lg:col-span-3 bg-light-card dark:bg-dark-card p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800">
        <h2 className="text-lg font-bold text-light-text dark:text-dark-text mb-4">
          미래 연봉 예상 결과
        </h2>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart
            data={futureSalaries}
            margin={{ top: 5, right: 20, left: 10, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.2} />
            <XAxis dataKey="year" />
            <YAxis
              tickFormatter={(value) => `${(value / 10000).toLocaleString()}만`}
            />
            <Tooltip
              formatter={(value: number) => [
                `${formatNumber(value)} 원`,
                "예상 연봉",
              ]}
            />
            <Legend />
            <Line
              type="monotone"
              dataKey="salary"
              name="예상 연봉"
              stroke="#007FFF"
              strokeWidth={3}
              dot={{ r: 4 }}
              activeDot={{ r: 8 }}
            />
          </LineChart>
        </ResponsiveContainer>
        <div className="max-h-[25vh] overflow-y-auto mt-6">
          <table className="min-w-full text-sm">
            <thead className="sticky top-0 bg-light-card dark:bg-dark-card">
              <tr className="border-b dark:border-gray-700">
                <th className="p-2 text-left font-semibold">연도</th>
                <th className="p-2 text-right font-semibold">예상 연봉</th>
                <th className="p-2 text-right font-semibold">상승액</th>
              </tr>
            </thead>
            <tbody>
              {futureSalaries.map((item) => (
                <tr key={item.year} className="border-t dark:border-gray-700">
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
      </div>
    </div>
  );
}
