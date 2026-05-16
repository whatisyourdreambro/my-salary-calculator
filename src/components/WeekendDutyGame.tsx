"use client";

import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Calendar, Users, Play, RotateCcw, Settings,
  X, Heart, Frown, Meh, Download, Zap,
} from "lucide-react";
import ShareButtons from "@/components/ShareButtons";

type Preference = "HOPE" | "NEUTRAL" | "NON_HOPE" | "UNAVAILABLE";

interface Person {
  id: string;
  name: string;
  maxShifts: number;
  preferences: Record<string, Preference>;
  assignedShifts: string[];
}

interface GameState {
  step: "setup" | "matrix" | "gaming" | "result";
  dates: string[];
  people: Person[];
  shiftsPerDay: number;
  currentDateIndex: number;
  isSpinning: boolean;
  logs: string[];
}

const PREF_CONFIG: Record<Preference, { icon: any; color: string; bg: string; label: string; weight: number }> = {
  HOPE:       { icon: Heart,  color: "text-emerald-400", bg: "bg-emerald-500/20 border-emerald-500/40", label: "희망",   weight: 100 },
  NEUTRAL:    { icon: Meh,    color: "text-sky-400",     bg: "bg-sky-500/20 border-sky-500/40",         label: "가능",   weight: 10 },
  NON_HOPE:   { icon: Frown,  color: "text-amber-400",   bg: "bg-amber-500/20 border-amber-500/40",     label: "비희망", weight: 1 },
  UNAVAILABLE:{ icon: X,      color: "text-red-400",     bg: "bg-red-500/20 border-red-500/40",         label: "불가",   weight: 0 },
};

export default function WeekendDutyGame() {
  const [datesInput,      setDatesInput]      = useState("");
  const [peopleInput,     setPeopleInput]     = useState("");
  const [shiftsPerDay,    setShiftsPerDay]    = useState(2);
  const [defaultMaxShifts,setDefaultMaxShifts]= useState(2);
  const [toast,           setToast]           = useState<string | null>(null);

  const [gameState, setGameState] = useState<GameState>({
    step: "setup",
    dates: [],
    people: [],
    shiftsPerDay: 2,
    currentDateIndex: 0,
    isSpinning: false,
    logs: [],
  });

  const resultRef = useRef<HTMLDivElement>(null);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2800);
  };

  const parseDates  = (s: string) => s.split(/[\n,]/).map(d => d.trim()).filter(Boolean);
  const parsePeople = (s: string) => s.split(/[\n,]/).map(p => p.trim()).filter(Boolean);

  const initializeMatrix = () => {
    const dates = parseDates(datesInput);
    const names = parsePeople(peopleInput);
    if (dates.length === 0 || names.length === 0) {
      showToast("⚠️ 날짜와 인원을 입력해주세요!");
      return;
    }
    const people: Person[] = names.map(name => ({
      id: Math.random().toString(36).substr(2, 9),
      name,
      maxShifts: defaultMaxShifts,
      preferences: dates.reduce((acc, date) => ({ ...acc, [date]: "NEUTRAL" }), {}),
      assignedShifts: [],
    }));
    setGameState(prev => ({ ...prev, step: "matrix", dates, people, shiftsPerDay }));
  };

  const updatePreference = (personId: string, date: string) => {
    setGameState(prev => ({
      ...prev,
      people: prev.people.map(p => {
        if (p.id !== personId) return p;
        const order: Preference[] = ["HOPE", "NEUTRAL", "NON_HOPE", "UNAVAILABLE"];
        const next = order[(order.indexOf(p.preferences[date]) + 1) % 4];
        return { ...p, preferences: { ...p.preferences, [date]: next } };
      }),
    }));
  };

  const updateMaxShifts = (personId: string, delta: number) => {
    setGameState(prev => ({
      ...prev,
      people: prev.people.map(p =>
        p.id === personId ? { ...p, maxShifts: Math.max(0, p.maxShifts + delta) } : p
      ),
    }));
  };

  const startGame = () => {
    setGameState(prev => ({ ...prev, step: "gaming", currentDateIndex: 0, logs: [] }));
  };

  const spinForDate = async () => {
    if (gameState.isSpinning) return;
    const date = gameState.dates[gameState.currentDateIndex];
    setGameState(prev => ({ ...prev, isSpinning: true }));
    await new Promise(r => setTimeout(r, 2000));

    const candidates = gameState.people.filter(p =>
      p.preferences[date] !== "UNAVAILABLE" && p.assignedShifts.length < p.maxShifts
    );

    const weighted = candidates.map(p => ({
      person: p,
      rand: Math.random() * (PREF_CONFIG[p.preferences[date]].weight + (p.maxShifts - p.assignedShifts.length) * 5),
    })).sort((a, b) => b.rand - a.rand);

    const selected = weighted.slice(0, gameState.shiftsPerDay).map(w => w.person);

    setGameState(prev => {
      const newPeople = prev.people.map(p =>
        selected.find(s => s.id === p.id)
          ? { ...p, assignedShifts: [...p.assignedShifts, date] }
          : p
      );
      const log = `${date}: ${selected.length > 0 ? selected.map(s => s.name).join(", ") : "미배정"} 선정`;
      const nextIndex = prev.currentDateIndex + 1;
      const isFinished = nextIndex >= prev.dates.length;
      return {
        ...prev,
        people: newPeople,
        currentDateIndex: isFinished ? prev.currentDateIndex : nextIndex,
        step: isFinished ? "result" : "gaming",
        isSpinning: false,
        logs: [...prev.logs, log],
      };
    });
  };

  const captureResultImage = async (): Promise<Blob | null> => {
    if (!resultRef.current) return null;
    const { default: html2canvas } = await import("html2canvas");
    const canvas = await html2canvas(resultRef.current, {
      backgroundColor: "#0D1117",
      scale: 2,
    });
    return new Promise((resolve) => canvas.toBlob(resolve, "image/png"));
  };

  const handleDownload = async () => {
    if (!resultRef.current) return;
    showToast("📸 이미지 저장 중...");
    const { default: html2canvas } = await import("html2canvas");
    const canvas = await html2canvas(resultRef.current, {
      backgroundColor: "#0D1117",
      scale: 2,
    });
    const link = document.createElement("a");
    link.download = "당직근무표.png";
    link.href = canvas.toDataURL("image/png");
    link.click();
    showToast("✅ 이미지가 저장됐어요!");
  };

  const resetAll = () => {
    setGameState({ step: "setup", dates: [], people: [], shiftsPerDay: 2, currentDateIndex: 0, isSpinning: false, logs: [] });
    setDatesInput("");
    setPeopleInput("");
  };

  return (
    <div className="w-full max-w-6xl mx-auto min-h-screen bg-[#0D1117] text-white p-4 md:p-8 font-sans relative">
      {/* Grid background */}
      <div className="fixed inset-0 pointer-events-none opacity-5"
        style={{ backgroundImage: "linear-gradient(#4ade80 1px, transparent 1px), linear-gradient(90deg, #4ade80 1px, transparent 1px)", backgroundSize: "50px 50px" }}
      />

      {/* Header */}
      <div className="text-center mb-10 relative">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold mb-4"
        >
          <Zap size={12} /> 공정한 당직 배정 시스템
        </motion.div>
        <h1 className="text-4xl md:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-sky-400 mb-3 tracking-tighter">
          주말 당직 추첨기
        </h1>
        <p className="text-gray-400 text-lg">운명의 룰렛으로 공정하게 당직을 배정하세요!</p>
      </div>

      {/* Step 1: Setup */}
      {gameState.step === "setup" && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-1 md:grid-cols-2 gap-6"
        >
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 p-8 rounded-3xl hover:border-emerald-500/30 transition-colors">
            <label className="flex items-center gap-2 text-lg font-bold text-white mb-4">
              <Calendar className="text-emerald-400" size={20} /> 대상 날짜
            </label>
            <textarea
              value={datesInput}
              onChange={e => setDatesInput(e.target.value)}
              placeholder={"11/23\n11/24\n11/30\n12/07"}
              className="w-full h-44 bg-black/30 border border-white/10 rounded-xl p-4 text-white placeholder:text-gray-600 focus:border-emerald-500/50 outline-none resize-none font-mono text-sm"
            />
            <p className="text-xs text-gray-500 mt-2">쉼표(,)나 엔터로 구분</p>
          </div>

          <div className="bg-white/5 backdrop-blur-sm border border-white/10 p-8 rounded-3xl hover:border-emerald-500/30 transition-colors">
            <label className="flex items-center gap-2 text-lg font-bold text-white mb-4">
              <Users className="text-sky-400" size={20} /> 대상 인원
            </label>
            <textarea
              value={peopleInput}
              onChange={e => setPeopleInput(e.target.value)}
              placeholder={"김철수\n이영희\n박지성\n최민준"}
              className="w-full h-44 bg-black/30 border border-white/10 rounded-xl p-4 text-white placeholder:text-gray-600 focus:border-sky-500/50 outline-none resize-none font-mono text-sm"
            />
            <p className="text-xs text-gray-500 mt-2">쉼표(,)나 엔터로 구분</p>
          </div>

          <div className="md:col-span-2 bg-white/5 backdrop-blur-sm border border-white/10 p-8 rounded-3xl flex flex-col md:flex-row gap-8 items-center justify-between">
            <div className="flex gap-8">
              <div className="text-center">
                <label className="block text-sm font-bold text-gray-400 mb-3">일일 근무 인원</label>
                <div className="flex items-center gap-3 bg-black/30 rounded-xl px-4 py-2 border border-white/10">
                  <button onClick={() => setShiftsPerDay(Math.max(1, shiftsPerDay - 1))} className="text-gray-400 hover:text-white font-bold text-xl w-8">-</button>
                  <span className="font-black text-2xl text-emerald-400 w-8 text-center">{shiftsPerDay}</span>
                  <button onClick={() => setShiftsPerDay(shiftsPerDay + 1)} className="text-gray-400 hover:text-white font-bold text-xl w-8">+</button>
                </div>
              </div>
              <div className="text-center">
                <label className="block text-sm font-bold text-gray-400 mb-3">기본 근무 제한</label>
                <div className="flex items-center gap-3 bg-black/30 rounded-xl px-4 py-2 border border-white/10">
                  <button onClick={() => setDefaultMaxShifts(Math.max(1, defaultMaxShifts - 1))} className="text-gray-400 hover:text-white font-bold text-xl w-8">-</button>
                  <span className="font-black text-2xl text-sky-400 w-8 text-center">{defaultMaxShifts}</span>
                  <button onClick={() => setDefaultMaxShifts(defaultMaxShifts + 1)} className="text-gray-400 hover:text-white font-bold text-xl w-8">+</button>
                </div>
              </div>
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.97 }}
              onClick={initializeMatrix}
              className="px-12 py-4 bg-gradient-to-r from-emerald-500 to-sky-500 rounded-2xl font-black text-xl shadow-lg shadow-emerald-500/20 flex items-center gap-2"
            >
              다음 단계 →
            </motion.button>
          </div>
        </motion.div>
      )}

      {/* Step 2: Preference Matrix */}
      {gameState.step === "matrix" && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-3xl overflow-hidden mb-6">
            <div className="p-5 border-b border-white/10 flex flex-wrap justify-between items-center gap-4 bg-white/5">
              <h2 className="text-lg font-bold flex items-center gap-2">
                <Settings className="text-gray-400" size={18} /> 근무 선호도 설정
              </h2>
              <div className="flex gap-3 text-xs font-bold flex-wrap">
                {(Object.entries(PREF_CONFIG) as [Preference, typeof PREF_CONFIG[Preference]][]).map(([key, c]) => (
                  <div key={key} className={`flex items-center gap-1.5 px-2 py-1 rounded-full border ${c.bg} ${c.color}`}>
                    <c.icon size={12} /> {c.label}
                  </div>
                ))}
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="px-5 py-3 font-bold text-gray-400 text-xs uppercase sticky left-0 bg-[#0D1117] z-10">이름 / 제한</th>
                    {gameState.dates.map(date => (
                      <th key={date} className="px-4 py-3 font-bold text-center text-xs text-gray-400 uppercase min-w-[100px]">{date}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {gameState.people.map(person => (
                    <tr key={person.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                      <td className="px-5 py-3 sticky left-0 bg-[#0D1117] z-10">
                        <div className="flex items-center justify-between gap-3">
                          <span className="font-bold text-white">{person.name}</span>
                          <div className="flex items-center gap-1.5 bg-black/30 border border-white/10 rounded-lg px-2 py-1">
                            <button onClick={() => updateMaxShifts(person.id, -1)} className="text-gray-500 hover:text-white w-5 text-center">-</button>
                            <span className="font-mono text-emerald-400 font-bold text-sm w-4 text-center">{person.maxShifts}</span>
                            <button onClick={() => updateMaxShifts(person.id, 1)} className="text-gray-500 hover:text-white w-5 text-center">+</button>
                          </div>
                        </div>
                      </td>
                      {gameState.dates.map(date => {
                        const pref = person.preferences[date];
                        const cfg = PREF_CONFIG[pref];
                        const Icon = cfg.icon;
                        return (
                          <td key={date} className="px-2 py-2 text-center">
                            <button
                              onClick={() => updatePreference(person.id, date)}
                              className={`w-full py-2.5 rounded-xl border flex flex-col items-center justify-center gap-1 transition-all hover:scale-105 ${cfg.bg} ${cfg.color}`}
                            >
                              <Icon size={16} />
                              <span className="text-[10px] font-bold">{cfg.label}</span>
                            </button>
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="flex justify-between items-center">
            <button
              onClick={() => setGameState(prev => ({ ...prev, step: "setup" }))}
              className="px-6 py-3 bg-white/5 border border-white/10 rounded-xl text-gray-400 hover:text-white transition-colors font-bold text-sm"
            >
              ← 뒤로
            </button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.97 }}
              onClick={startGame}
              className="px-12 py-4 bg-gradient-to-r from-emerald-500 to-sky-500 rounded-2xl font-black text-xl shadow-lg shadow-emerald-500/20 flex items-center gap-2"
            >
              <Play className="fill-current" size={20} /> 추첨 시작!
            </motion.button>
          </div>
        </motion.div>
      )}

      {/* Step 3: Gaming */}
      {gameState.step === "gaming" && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-2xl mx-auto text-center"
        >
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-[3rem] p-10 md:p-14 relative overflow-hidden">
            {/* Top progress bar */}
            <div className="absolute top-0 left-0 w-full h-1 bg-white/10 rounded-full">
              <motion.div
                className="h-full bg-gradient-to-r from-emerald-500 to-sky-500 rounded-full"
                animate={{ width: `${((gameState.currentDateIndex) / gameState.dates.length) * 100}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>

            <div className="text-sm text-gray-500 mb-2 font-mono">
              {gameState.currentDateIndex + 1} / {gameState.dates.length}
            </div>
            <h3 className="text-lg font-bold text-gray-400 mb-6">대상 날짜</h3>
            <div className="text-5xl md:text-7xl font-black text-white mb-10 tracking-tighter">
              {gameState.dates[gameState.currentDateIndex]}
            </div>

            <div className="h-32 flex items-center justify-center mb-10">
              {gameState.isSpinning ? (
                <div className="flex gap-4 items-center">
                  {[0, 1, 2].map(i => (
                    <motion.div
                      key={i}
                      animate={{ y: [0, -20, 0] }}
                      transition={{ repeat: Infinity, duration: 0.6, delay: i * 0.15 }}
                      className="w-12 h-12 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center"
                    >
                      <span className="text-emerald-400 font-black text-xl">?</span>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="text-gray-500 text-lg font-mono tracking-wider">
                  추첨 준비 완료 . . .
                </div>
              )}
            </div>

            <motion.button
              whileHover={{ scale: gameState.isSpinning ? 1 : 1.03 }}
              whileTap={{ scale: gameState.isSpinning ? 1 : 0.97 }}
              onClick={spinForDate}
              disabled={gameState.isSpinning}
              className="w-full py-6 bg-gradient-to-r from-emerald-500 to-sky-500 font-black text-2xl rounded-2xl shadow-lg shadow-emerald-500/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {gameState.isSpinning ? "🎲 추첨 중..." : "🎯 추첨!"}
            </motion.button>
          </div>

          {/* Log */}
          {gameState.logs.length > 0 && (
            <div className="mt-6 bg-black/40 border border-white/10 rounded-2xl p-5 text-left max-h-44 overflow-y-auto font-mono text-sm">
              {gameState.logs.map((log, i) => (
                <div key={i} className="text-emerald-400 mb-1">
                  &gt; {log}
                </div>
              ))}
            </div>
          )}
        </motion.div>
      )}

      {/* Step 4: Result */}
      {gameState.step === "result" && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div ref={resultRef} className="bg-[#0D1117] rounded-3xl border border-white/10 p-8 md:p-12 max-w-4xl mx-auto">
            <div className="text-center mb-10">
              <div className="text-4xl mb-3">🎉</div>
              <h2 className="text-3xl font-black text-white mb-2">최종 근무표</h2>
              <p className="text-gray-500">공정한 추첨으로 확정된 결과입니다</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-10">
              {gameState.dates.map(date => {
                const workers = gameState.people.filter(p => p.assignedShifts.includes(date));
                return (
                  <div key={date} className="bg-white/5 border border-white/10 rounded-2xl p-5 hover:border-emerald-500/30 transition-colors">
                    <div className="text-emerald-400 font-black text-lg mb-3 pb-2 border-b border-white/10">{date}</div>
                    <div className="space-y-2">
                      {workers.map(w => (
                        <div key={w.id} className="flex items-center justify-between bg-black/30 rounded-lg px-3 py-2">
                          <span className="font-bold text-white text-sm">{w.name}</span>
                          {w.preferences[date] === "HOPE" && <Heart size={12} className="text-emerald-400" />}
                          {w.preferences[date] === "NON_HOPE" && <Frown size={12} className="text-amber-400" />}
                        </div>
                      ))}
                      {workers.length === 0 && <span className="text-gray-600 italic text-sm">배정 없음</span>}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
              <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4">근무 통계</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {gameState.people.map(p => (
                  <div key={p.id} className="bg-black/30 rounded-xl p-3 flex justify-between items-center border border-white/5">
                    <span className="font-bold text-gray-300 text-sm">{p.name}</span>
                    <span className={`font-black text-lg ${p.assignedShifts.length > p.maxShifts ? "text-red-400" : "text-emerald-400"}`}>
                      {p.assignedShifts.length}
                      <span className="text-xs text-gray-600 font-normal">/{p.maxShifts}</span>
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Share & Actions */}
          <div className="max-w-4xl mx-auto mt-6">
            <motion.button
              whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
              onClick={handleDownload}
              className="w-full flex items-center justify-center gap-2 py-4 bg-emerald-500 hover:bg-emerald-400 rounded-2xl font-bold text-black transition-colors"
            >
              <Download size={18} /> 이미지 저장
            </motion.button>
            <ShareButtons
              title="주말 당직 추첨 완료! 머니샐러리 당직 추첨기로 공정하게 뽑았어요 🎲"
              description="운명의 룰렛으로 공정하게 당직을 배정하는 주말 당직 추첨기"
              getShareImage={captureResultImage}
              className="justify-center mt-4"
            />
          </div>

          <div className="max-w-4xl mx-auto mt-4 flex justify-center">
            <motion.button
              whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
              onClick={resetAll}
              className="flex items-center gap-2 px-8 py-3 bg-white/5 border border-white/10 rounded-xl text-gray-400 hover:text-white transition-colors font-bold"
            >
              <RotateCcw size={16} /> 다시 시작
            </motion.button>
          </div>
        </motion.div>
      )}

      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 30 }}
            className="fixed bottom-8 left-1/2 -translate-x-1/2 bg-gray-900 border border-white/20 text-white px-6 py-3 rounded-full text-sm font-bold shadow-2xl z-[100] whitespace-nowrap"
          >
            {toast}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
