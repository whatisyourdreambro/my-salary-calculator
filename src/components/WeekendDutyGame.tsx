"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Calendar, Users, Play, RotateCcw, Settings, Check, X, Heart, Frown, Meh, AlertCircle, Download } from "lucide-react";
import html2canvas from "html2canvas";

// --- Types ---
type Preference = "HOPE" | "NEUTRAL" | "NON_HOPE" | "UNAVAILABLE";

interface Person {
 id: string;
 name: string;
 maxShifts: number;
 preferences: Record<string, Preference>; // dateKey -> Preference
 assignedShifts: string[]; // dateKeys
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

const PREF_CONFIG: Record<Preference, { icon: any, color: string, label: string, weight: number }> = {
 HOPE: { icon: Heart, color: "text-primary", label: "희망", weight: 100 },
 NEUTRAL: { icon: Meh, color: "text-faint-blue", label: "가능", weight: 10 },
 NON_HOPE: { icon: Frown, color: "text-primary", label: "비희망", weight: 1 },
 UNAVAILABLE: { icon: X, color: "text-electric", label: "불가", weight: 0 },
};

export default function WeekendDutyGame() {
 // --- State ---
 const [datesInput, setDatesInput] = useState("");
 const [peopleInput, setPeopleInput] = useState("");
 const [shiftsPerDay, setShiftsPerDay] = useState(2);
 const [defaultMaxShifts, setDefaultMaxShifts] = useState(2);

 const [gameState, setGameState] = useState<GameState>({
 step: "setup",
 dates: [],
 people: [],
 shiftsPerDay: 2,
 currentDateIndex: 0,
 isSpinning: false,
 logs: []
 });

 const resultRef = useRef<HTMLDivElement>(null);

 // --- Helpers ---
 const parseDates = (input: string) => {
 // Simple parser: splits by comma or newline, trims
 return input.split(/[\n,]/).map(d => d.trim()).filter(d => d !== "");
 };

 const parsePeople = (input: string) => {
 return input.split(/[\n,]/).map(p => p.trim()).filter(p => p !== "");
 };

 const initializeMatrix = () => {
 const dates = parseDates(datesInput);
 const names = parsePeople(peopleInput);

 if (dates.length === 0 || names.length === 0) {
 alert("날짜와 인원을 입력해주세요!");
 return;
 }

 const people: Person[] = names.map(name => ({
 id: Math.random().toString(36).substr(2, 9),
 name,
 maxShifts: defaultMaxShifts,
 preferences: dates.reduce((acc, date) => ({ ...acc, [date]: "NEUTRAL" }), {}),
 assignedShifts: []
 }));

 setGameState(prev => ({
 ...prev,
 step: "matrix",
 dates,
 people,
 shiftsPerDay
 }));
 };

 const updatePreference = (personId: string, date: string) => {
 setGameState(prev => {
 const newPeople = prev.people.map(p => {
 if (p.id !== personId) return p;
 const current = p.preferences[date];
 let next: Preference = "HOPE";
 if (current === "HOPE") next = "NEUTRAL";
 else if (current === "NEUTRAL") next = "NON_HOPE";
 else if (current === "NON_HOPE") next = "UNAVAILABLE";
 else next = "HOPE";

 return {
 ...p,
 preferences: { ...p.preferences, [date]: next }
 };
 });
 return { ...prev, people: newPeople };
 });
 };

 const updateMaxShifts = (personId: string, delta: number) => {
 setGameState(prev => ({
 ...prev,
 people: prev.people.map(p =>
 p.id === personId ? { ...p, maxShifts: Math.max(0, p.maxShifts + delta) } : p
 )
 }));
 };

 const startGame = () => {
 setGameState(prev => ({ ...prev, step: "gaming", currentDateIndex: 0, logs: [] }));
 };

 // --- Logic Engine ---
 const spinForDate = async () => {
 if (gameState.isSpinning) return;

 const date = gameState.dates[gameState.currentDateIndex];
 setGameState(prev => ({ ...prev, isSpinning: true }));

 // Simulation Delay
 await new Promise(resolve => setTimeout(resolve, 2000));

 // Assignment Logic
 const candidates = gameState.people.filter(p => {
 // 1. Check Availability
 if (p.preferences[date] === "UNAVAILABLE") return false;
 // 2. Check Max Shifts
 if (p.assignedShifts.length >= p.maxShifts) return false;
 return true;
 });

 // Sort by Priority: Hope > Neutral > Non-Hope
 // And also try to balance shifts (prefer those with fewer assigned shifts)
 const weightedCandidates = candidates.map(p => {
 let weight = PREF_CONFIG[p.preferences[date]].weight;
 // Boost weight if fewer shifts assigned
 weight += (p.maxShifts - p.assignedShifts.length) * 5;
 return { person: p, weight, rand: Math.random() * weight };
 });

 weightedCandidates.sort((a, b) => b.rand - a.rand);

 const selected = weightedCandidates.slice(0, gameState.shiftsPerDay).map(wc => wc.person);

 // Update State
 setGameState(prev => {
 const newPeople = prev.people.map(p => {
 if (selected.find(s => s.id === p.id)) {
 return { ...p, assignedShifts: [...p.assignedShifts, date] };
 }
 return p;
 });

 const log = `${date}: ${selected.map(s => s.name).join(", ")} (Selected)`;

 const nextIndex = prev.currentDateIndex + 1;
 const isFinished = nextIndex >= prev.dates.length;

 return {
 ...prev,
 people: newPeople,
 currentDateIndex: isFinished ? prev.currentDateIndex : nextIndex,
 step: isFinished ? "result" : "gaming",
 isSpinning: false,
 logs: [...prev.logs, log]
 };
 });
 };

 const handleDownload = async () => {
 if (resultRef.current) {
 const canvas = await html2canvas(resultRef.current, { backgroundColor: "#18181b" });
 const link = document.createElement("a");
 link.download = "Weekend_Duty_Result.png";
 link.href = canvas.toDataURL("image/png");
 link.click();
 }
 };

 return (
 <div className="w-full max-w-6xl mx-auto min-h-screen bg-canvas text-navy p-4 md:p-8 font-sans">
 {/* Header */}
 <div className="text-center mb-12">
 <h1 className="text-4xl md:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-primary to-primary/80 mb-4 tracking-tighter">
 OFFICE SURVIVAL
 </h1>
 <p className="text-faint-blue text-lg">주말 당직, 운명의 룰렛을 돌려라!</p>
 </div>

 {/* Step 1: Setup */}
 {gameState.step === "setup" && (
 <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-fade-in-up">
 <div className="bg-white p-8 rounded-3xl border border-canvas">
 <label className="block text-lg font-bold text-navy mb-4 flex items-center gap-2">
 <Calendar className="text-primary" /> 대상 날짜 입력
 </label>
 <textarea
 value={datesInput}
 onChange={(e) => setDatesInput(e.target.value)}
 placeholder="11/23, 11/24, 11/30..."
 className="w-full h-40 bg-canvas border border-canvas rounded-xl p-4 text-navy focus:border-primary outline-none resize-none"
 />
 <p className="text-xs text-faint-blue mt-2">쉼표(,)나 엔터로 구분</p>
 </div>

 <div className="bg-white p-8 rounded-3xl border border-canvas">
 <label className="block text-lg font-bold text-navy mb-4 flex items-center gap-2">
 <Users className="text-primary" /> 대상 인원 입력
 </label>
 <textarea
 value={peopleInput}
 onChange={(e) => setPeopleInput(e.target.value)}
 placeholder="김철수, 이영희, 박지성..."
 className="w-full h-40 bg-canvas border border-canvas rounded-xl p-4 text-navy focus:border-primary outline-none resize-none"
 />
 </div>

 <div className="md:col-span-2 bg-white p-8 rounded-3xl border border-canvas flex flex-col md:flex-row gap-8 items-center justify-between">
 <div className="flex gap-8">
 <div>
 <label className="block text-sm font-bold text-faint-blue mb-2">일일 근무 인원</label>
 <input
 type="number"
 value={shiftsPerDay}
 onChange={(e) => setShiftsPerDay(Number(e.target.value))}
 className="bg-canvas border border-canvas rounded-xl p-3 w-24 text-center font-bold text-xl"
 />
 </div>
 <div>
 <label className="block text-sm font-bold text-faint-blue mb-2">기본 근무 제한</label>
 <input
 type="number"
 value={defaultMaxShifts}
 onChange={(e) => setDefaultMaxShifts(Number(e.target.value))}
 className="bg-canvas border border-canvas rounded-xl p-3 w-24 text-center font-bold text-xl"
 />
 </div>
 </div>
 <button
 onClick={initializeMatrix}
 className="px-12 py-4 bg-gradient-to-r from-primary to-primary/80 rounded-xl font-black text-xl hover:scale-105 transition-transform shadow-lg shadow-primary/20"
 >
 NEXT STEP
 </button>
 </div>
 </div>
 )}

 {/* Step 2: Preference Matrix */}
 {gameState.step === "matrix" && (
 <div className="animate-fade-in-up">
 <div className="bg-white rounded-3xl border border-canvas overflow-hidden">
 <div className="p-6 border-b border-canvas flex justify-between items-center bg-canvas/50">
 <h2 className="text-xl font-bold text-navy flex items-center gap-2">
 <Settings className="text-faint-blue" /> 근무 선호도 설정
 </h2>
 <div className="flex gap-4 text-xs font-bold">
 {Object.values(PREF_CONFIG).map(c => (
 <div key={c.label} className={`flex items-center gap-1 ${c.color}`}>
 <c.icon size={14} /> {c.label}
 </div>
 ))}
 </div>
 </div>

 <div className="overflow-x-auto">
 <table className="w-full text-sm text-left">
 <thead className="text-xs text-faint-blue uppercase bg-canvas">
 <tr>
 <th className="px-6 py-4 font-bold sticky left-0 bg-canvas z-10">이름 / 제한</th>
 {gameState.dates.map(date => (
 <th key={date} className="px-6 py-4 font-bold text-center min-w-[100px]">{date}</th>
 ))}
 </tr>
 </thead>
 <tbody>
 {gameState.people.map(person => (
 <tr key={person.id} className="border-b border-canvas hover:bg-canvas-dark/30 transition-colors">
 <td className="px-6 py-4 font-medium sticky left-0 bg-white z-10 shadow-[2px_0_5px_rgba(0,0,0,0.2)]">
 <div className="flex items-center justify-between gap-4">
 <span className="text-lg">{person.name}</span>
 <div className="flex items-center gap-2 bg-canvas rounded-lg px-2 py-1">
 <button onClick={() => updateMaxShifts(person.id, -1)} className="text-faint-blue hover:text-navy">-</button>
 <span className="font-mono text-primary font-bold">{person.maxShifts}</span>
 <button onClick={() => updateMaxShifts(person.id, 1)} className="text-faint-blue hover:text-navy">+</button>
 </div>
 </div>
 </td>
 {gameState.dates.map(date => {
 const pref = person.preferences[date];
 const Config = PREF_CONFIG[pref];
 const Icon = Config.icon;
 return (
 <td key={date} className="px-2 py-2 text-center">
 <button
 onClick={() => updatePreference(person.id, date)}
 className={`w-full py-3 rounded-lg flex flex-col items-center justify-center gap-1 transition-all hover:bg-white/5 ${Config.color}`}
 >
 <Icon size={20} />
 <span className="text-[10px] font-bold">{Config.label}</span>
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

 <div className="mt-8 flex justify-end">
 <button
 onClick={startGame}
 className="px-12 py-4 bg-gradient-to-r from-primary to-primary/80 rounded-xl font-black text-xl hover:scale-105 transition-transform shadow-lg shadow-primary/20 flex items-center gap-2"
 >
 <Play className="fill-current" /> GAME START
 </button>
 </div>
 </div>
 )}

 {/* Step 3: Gaming */}
 {gameState.step === "gaming" && (
 <div className="max-w-2xl mx-auto text-center animate-fade-in-up">
 <div className="bg-white rounded-[3rem] p-12 border-4 border-canvas shadow-2xl relative overflow-hidden">
 <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-primary via-primary/50 to-primary/80 animate-pulse" />

 <h3 className="text-2xl font-bold text-faint-blue mb-8">
 TARGET DATE
 </h3>
 <div className="text-6xl font-black text-navy mb-12 tracking-tighter">
 {gameState.dates[gameState.currentDateIndex]}
 </div>

 <div className="h-40 flex items-center justify-center mb-12">
 {gameState.isSpinning ? (
 <div className="flex gap-2">
 <motion.div
 animate={{ y: [-20, 20] }}
 transition={{ repeat: Infinity, duration: 0.3, repeatType: "reverse" }}
 className="text-4xl font-bold text-muted-blue"
 >
 ???
 </motion.div>
 <motion.div
 animate={{ y: [20, -20] }}
 transition={{ repeat: Infinity, duration: 0.3, repeatType: "reverse", delay: 0.1 }}
 className="text-4xl font-bold text-muted-blue"
 >
 ???
 </motion.div>
 </div>
 ) : (
 <div className="text-faint-blue text-xl font-mono">
 READY TO SPIN...
 </div>
 )}
 </div>

 <button
 onClick={spinForDate}
 disabled={gameState.isSpinning}
 className="w-full py-6 bg-white text-black font-black text-3xl rounded-2xl hover:scale-[1.02] active:scale-[0.98] transition-all shadow-[0_0_40px_rgba(255,255,255,0.3)] disabled:opacity-50 disabled:cursor-not-allowed"
 >
 {gameState.isSpinning ? "SPINNING..." : "SPIN!"}
 </button>
 </div>

 <div className="mt-8 text-left bg-white/50 p-6 rounded-2xl border border-canvas h-40 overflow-y-auto font-mono text-sm text-faint-blue">
 {gameState.logs.map((log, i) => (
 <div key={i} className="mb-1 text-primary">
 &gt; {log}
 </div>
 ))}
 </div>
 </div>
 )}

 {/* Step 4: Result */}
 {gameState.step === "result" && (
 <div className="animate-fade-in-up">
 <div ref={resultRef} className="bg-white rounded-3xl border border-canvas p-8 md:p-12 max-w-4xl mx-auto">
 <div className="text-center mb-12">
 <h2 className="text-3xl font-black text-navy mb-2">FINAL SCHEDULE</h2>
 <p className="text-faint-blue">확정된 근무표입니다. 스크린샷을 저장하세요.</p>
 </div>

 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
 {gameState.dates.map(date => {
 const workers = gameState.people.filter(p => p.assignedShifts.includes(date));
 return (
 <div key={date} className="bg-canvas border border-canvas rounded-2xl p-6 flex flex-col items-center text-center">
 <div className="text-primary font-black text-xl mb-4 border-b border-canvas w-full pb-2">
 {date}
 </div>
 <div className="space-y-2 w-full">
 {workers.map(w => (
 <div key={w.id} className="bg-white rounded-lg py-2 px-4 font-bold text-navy flex justify-between items-center">
 <span>{w.name}</span>
 {w.preferences[date] === "HOPE" && <Heart size={12} className="text-primary" />}
 {w.preferences[date] === "NON_HOPE" && <Frown size={12} className="text-primary" />}
 </div>
 ))}
 {workers.length === 0 && <span className="text-muted-blue italic">No workers</span>}
 </div>
 </div>
 );
 })}
 </div>

 <div className="mt-12 pt-8 border-t border-canvas">
 <h3 className="text-lg font-bold text-faint-blue mb-4">근무 통계</h3>
 <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
 {gameState.people.map(p => (
 <div key={p.id} className="bg-canvas rounded-xl p-4 border border-canvas flex justify-between items-center">
 <span className="font-bold text-muted-blue">{p.name}</span>
 <span className={`font-black text-xl ${p.assignedShifts.length > p.maxShifts ? "text-electric" : "text-white"}`}>
 {p.assignedShifts.length} <span className="text-xs text-muted-blue font-normal">/ {p.maxShifts}</span>
 </span>
 </div>
 ))}
 </div>
 </div>
 </div>

 <div className="mt-8 flex justify-center gap-4">
 <button
 onClick={() => setGameState(prev => ({ ...prev, step: "setup" }))}
 className="px-8 py-4 bg-canvas-dark text-navy rounded-xl font-bold hover:bg-canvas-deeper transition-colors flex items-center gap-2"
 >
 <RotateCcw size={20} /> RESTART
 </button>
 <button
 onClick={handleDownload}
 className="px-8 py-4 bg-white text-black rounded-xl font-bold hover:
 transition-colors flex items-center gap-2"
 >
 <Download size={20} /> SAVE IMAGE
 </button>
 </div>
 </div>
 )}
 </div>
 );
}
