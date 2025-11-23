"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Trophy, Play, RotateCcw, Users, Settings, Sparkles, Gift, Plus, Trash2 } from "lucide-react";

// --- Types ---
interface Ball {
    id: number;
    name: string;
    x: number;
    y: number;
    vx: number;
    vy: number;
    color: string;
    radius: number;
    finished: boolean;
    rank: number;
    // Avatar Props
    hasGlasses: boolean;
    hasTie: boolean;
    tieColor: string;
    isSweating: boolean;
}

interface Peg {
    x: number;
    y: number;
    radius: number;
    type: "normal" | "bumper";
}

interface Particle {
    x: number;
    y: number;
    vx: number;
    vy: number;
    life: number;
    color: string;
    type: "spark" | "text";
    text?: string;
    size: number;
}

interface SpecialPrize {
    rank: number;
    name: string;
}

const COLORS = [
    "#ef4444", "#f97316", "#f59e0b", "#84cc16", "#10b981",
    "#06b6d4", "#3b82f6", "#6366f1", "#8b5cf6", "#d946ef", "#f43f5e"
];

const IMPACT_WORDS = ["POW!", "BAM!", "CRASH!", "BOOM!", "OUCH!"];

export default function RandomDrawGame() {
    // --- Setup State ---
    const [title, setTitle] = useState("");
    const [candidatesText, setCandidatesText] = useState("");
    const [winnerCount, setWinnerCount] = useState(1);
    const [specialPrizes, setSpecialPrizes] = useState<SpecialPrize[]>([]);
    const [gameState, setGameState] = useState<"setup" | "racing" | "finished">("setup");

    // --- Game State ---
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [winners, setWinners] = useState<Ball[]>([]);
    const requestRef = useRef<number>();
    const ballsRef = useRef<Ball[]>([]);
    const pegsRef = useRef<Peg[]>([]);
    const particlesRef = useRef<Particle[]>([]);
    const cameraYRef = useRef(0);
    const shakeRef = useRef(0); // Screen shake intensity

    // --- Helpers ---
    const addSpecialPrize = () => {
        setSpecialPrizes([...specialPrizes, { rank: 1, name: "" }]);
    };

    const removeSpecialPrize = (index: number) => {
        setSpecialPrizes(specialPrizes.filter((_, i) => i !== index));
    };

    const updateSpecialPrize = (index: number, field: keyof SpecialPrize, value: string | number) => {
        const newPrizes = [...specialPrizes];
        newPrizes[index] = { ...newPrizes[index], [field]: value };
        setSpecialPrizes(newPrizes);
    };

    // --- Game Logic ---
    const startGame = () => {
        const names = candidatesText.split("\n").filter(n => n.trim() !== "");
        if (names.length === 0) return alert("참가자를 입력해주세요!");
        if (winnerCount > names.length) return alert("당첨자 수가 참가자 수보다 많습니다!");

        // Create Balls with Avatars
        ballsRef.current = names.map((name, i) => ({
            id: i,
            name: name.trim(),
            x: 50 + Math.random() * (window.innerWidth < 600 ? 300 : 700),
            y: -50 - Math.random() * 300, // More staggered start
            vx: (Math.random() - 0.5) * 8, // High chaotic energy
            vy: 0,
            color: COLORS[i % COLORS.length],
            radius: 14, // Slightly larger for details
            finished: false,
            rank: 0,
            hasGlasses: Math.random() > 0.5,
            hasTie: true,
            tieColor: COLORS[(i + 2) % COLORS.length],
            isSweating: false
        }));

        // Create Pegs & Bumpers
        const pegs: Peg[] = [];
        const rows = 25;
        const cols = 10;
        const width = window.innerWidth < 600 ? 350 : 800;
        const startX = 50;
        const startY = 100;
        const gapX = width / cols;
        const gapY = 60;

        for (let r = 0; r < rows; r++) {
            for (let c = 0; c < cols + (r % 2); c++) {
                const isBumper = Math.random() < 0.1; // 10% chance for bumper
                pegs.push({
                    x: startX + c * gapX + (r % 2 === 0 ? 0 : gapX / 2),
                    y: startY + r * gapY,
                    radius: isBumper ? 12 : 4,
                    type: isBumper ? "bumper" : "normal"
                });
            }
        }
        pegsRef.current = pegs;
        particlesRef.current = [];
        cameraYRef.current = 0;
        shakeRef.current = 0;

        setWinners([]);
        setGameState("racing");
        requestRef.current = requestAnimationFrame(gameLoop);
    };

    const createParticles = (x: number, y: number, color: string, type: "spark" | "text" = "spark") => {
        if (type === "text") {
            particlesRef.current.push({
                x, y, vx: 0, vy: -1, life: 1.0, color: "#fff", type: "text",
                text: IMPACT_WORDS[Math.floor(Math.random() * IMPACT_WORDS.length)],
                size: 20
            });
        } else {
            for (let i = 0; i < 8; i++) {
                particlesRef.current.push({
                    x, y,
                    vx: (Math.random() - 0.5) * 8,
                    vy: (Math.random() - 0.5) * 8,
                    life: 1.0,
                    color,
                    type: "spark",
                    size: Math.random() * 3 + 1
                });
            }
        }
    };

    const gameLoop = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        // High-DPI Rendering
        const dpr = window.devicePixelRatio || 1;
        const width = window.innerWidth < 600 ? 400 : 900;
        const height = 800;

        if (canvas.width !== width * dpr) {
            canvas.width = width * dpr;
            canvas.height = height * dpr;
            canvas.style.width = `${width}px`;
            canvas.style.height = `${height}px`;
            ctx.scale(dpr, dpr);
        }

        // Camera Logic
        let leaderY = 0;
        ballsRef.current.forEach(b => {
            if (!b.finished && b.y > leaderY) leaderY = b.y;
        });
        const targetCameraY = Math.max(0, leaderY - height / 2);
        cameraYRef.current += (targetCameraY - cameraYRef.current) * 0.1;

        // Screen Shake Decay
        if (shakeRef.current > 0) shakeRef.current *= 0.9;

        // Clear Canvas
        ctx.save();
        // Apply Camera + Shake
        const shakeX = (Math.random() - 0.5) * shakeRef.current;
        const shakeY = (Math.random() - 0.5) * shakeRef.current;
        ctx.translate(shakeX, -cameraYRef.current + shakeY);

        ctx.fillStyle = "#0a0a0a";
        ctx.fillRect(-shakeX, cameraYRef.current - shakeY, width, height);

        // Draw Pegs
        pegsRef.current.forEach(peg => {
            ctx.beginPath();
            ctx.arc(peg.x, peg.y, peg.radius, 0, Math.PI * 2);
            if (peg.type === "bumper") {
                ctx.shadowBlur = 20;
                ctx.shadowColor = "#f472b6"; // Pink glow
                ctx.fillStyle = "#ec4899";
                ctx.fill();
                // Inner ring
                ctx.beginPath();
                ctx.arc(peg.x, peg.y, peg.radius * 0.6, 0, Math.PI * 2);
                ctx.fillStyle = "#fbcfe8";
                ctx.fill();
            } else {
                ctx.shadowBlur = 5;
                ctx.shadowColor = "#0ea5e9"; // Blue glow
                ctx.fillStyle = "#0ea5e9";
                ctx.fill();
            }
            ctx.shadowBlur = 0;
        });

        // Update & Draw Particles
        particlesRef.current.forEach((p, i) => {
            p.x += p.vx;
            p.y += p.vy;
            p.life -= 0.02;
            if (p.life <= 0) particlesRef.current.splice(i, 1);

            ctx.globalAlpha = p.life;
            if (p.type === "text") {
                ctx.font = `900 ${p.size}px sans-serif`;
                ctx.fillStyle = "white";
                ctx.strokeStyle = "black";
                ctx.lineWidth = 3;
                ctx.strokeText(p.text!, p.x, p.y);
                ctx.fillText(p.text!, p.x, p.y);
            } else {
                ctx.fillStyle = p.color;
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
                ctx.fill();
            }
        });
        ctx.globalAlpha = 1;

        // Update & Draw Balls
        let activeBalls = 0;
        ballsRef.current.forEach(ball => {
            if (!ball.finished) {
                activeBalls++;
                // Physics
                ball.vy += 0.25; // Gravity
                ball.vx *= 0.99; // Air resistance
                ball.x += ball.vx;
                ball.y += ball.vy;

                // Wall Collisions
                if (ball.x < ball.radius) {
                    ball.x = ball.radius;
                    ball.vx *= -0.6;
                }
                if (ball.x > width - ball.radius) {
                    ball.x = width - ball.radius;
                    ball.vx *= -0.6;
                }

                // Peg Collisions
                pegsRef.current.forEach(peg => {
                    const dx = ball.x - peg.x;
                    const dy = ball.y - peg.y;
                    const dist = Math.sqrt(dx * dx + dy * dy);
                    const minDist = ball.radius + peg.radius;

                    if (dist < minDist) {
                        // Collision!
                        const angle = Math.atan2(dy, dx);

                        // Bumper Boost
                        const boost = peg.type === "bumper" ? 1.5 : 0.6;
                        const speed = Math.sqrt(ball.vx * ball.vx + ball.vy * ball.vy);

                        ball.vx = Math.cos(angle) * speed * boost + (Math.random() - 0.5);
                        ball.vy = Math.sin(angle) * speed * boost;

                        // Push out
                        const overlap = minDist - dist;
                        ball.x += Math.cos(angle) * overlap;
                        ball.y += Math.sin(angle) * overlap;

                        // Effects
                        if (peg.type === "bumper") {
                            shakeRef.current = 5; // Screen shake
                            createParticles(peg.x, peg.y, "#ec4899", "spark");
                            createParticles(peg.x, peg.y, "", "text"); // POW!
                            ball.isSweating = true; // Scared salaryman
                        } else if (speed > 5) {
                            createParticles(peg.x, peg.y, ball.color, "spark");
                        }
                    }
                });

                // Finish Line
                const finishLineY = 1600; // Longer track
                if (ball.y > finishLineY) {
                    ball.finished = true;
                    ball.y = finishLineY;
                    const currentRank = ballsRef.current.filter(b => b.finished).length;
                    ball.rank = currentRank;

                    if (currentRank <= winnerCount || specialPrizes.some(p => p.rank === currentRank)) {
                        setWinners(prev => [...prev, ball].sort((a, b) => a.rank - b.rank));
                        createParticles(ball.x, ball.y, "#ffd700", "spark");
                    }
                }
            }

            // --- Draw Salaryman Avatar ---
            ctx.save();
            ctx.translate(ball.x, ball.y);

            // Body (Ball)
            ctx.beginPath();
            ctx.arc(0, 0, ball.radius, 0, Math.PI * 2);
            ctx.fillStyle = ball.color;
            ctx.shadowBlur = 10;
            ctx.shadowColor = ball.color;
            ctx.fill();
            ctx.shadowBlur = 0;

            // Eyes (Glasses or Dots)
            ctx.fillStyle = "white";
            if (ball.hasGlasses) {
                // Glasses Frame
                ctx.strokeStyle = "black";
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.arc(-4, -2, 4, 0, Math.PI * 2); // Left lens
                ctx.arc(4, -2, 4, 0, Math.PI * 2); // Right lens
                ctx.stroke();
                ctx.fillStyle = "rgba(255,255,255,0.5)";
                ctx.fill();
                // Bridge
                ctx.beginPath();
                ctx.moveTo(-1, -2);
                ctx.lineTo(1, -2);
                ctx.stroke();
            } else {
                // Simple Eyes
                ctx.beginPath();
                ctx.arc(-4, -2, 2, 0, Math.PI * 2);
                ctx.arc(4, -2, 2, 0, Math.PI * 2);
                ctx.fill();
            }

            // Tie
            if (ball.hasTie) {
                ctx.fillStyle = ball.tieColor;
                ctx.beginPath();
                ctx.moveTo(0, 2);
                ctx.lineTo(-3, 10);
                ctx.lineTo(0, 12);
                ctx.lineTo(3, 10);
                ctx.closePath();
                ctx.fill();
            }

            // Sweat (if hit bumper)
            if (ball.isSweating) {
                ctx.fillStyle = "#bae6fd";
                ctx.beginPath();
                ctx.arc(8, -8, 2, 0, Math.PI * 2);
                ctx.fill();
                // Reset sweat occasionally
                if (Math.random() < 0.05) ball.isSweating = false;
            }

            ctx.restore();

            // Name Tag
            ctx.fillStyle = "white";
            ctx.font = "bold 12px sans-serif";
            ctx.textAlign = "center";
            ctx.fillText(ball.name, ball.x, ball.y - 20);
        });

        // Draw Finish Line
        const finishLineY = 1600;
        ctx.beginPath();
        ctx.moveTo(0, finishLineY);
        ctx.lineTo(width, finishLineY);
        ctx.strokeStyle = "#ef4444";
        ctx.lineWidth = 5;
        ctx.setLineDash([20, 20]);
        ctx.stroke();
        ctx.setLineDash([]);

        ctx.fillStyle = "#ef4444";
        ctx.font = "bold 60px sans-serif";
        ctx.textAlign = "center";
        ctx.fillText("FINISH LINE", width / 2, finishLineY + 80);

        ctx.restore();

        // Check Game Over
        if (activeBalls === 0) {
            setGameState("finished");
            cancelAnimationFrame(requestRef.current!);
        } else {
            requestRef.current = requestAnimationFrame(gameLoop);
        }
    };

    useEffect(() => {
        return () => cancelAnimationFrame(requestRef.current!);
    }, []);

    return (
        <div className="w-full max-w-6xl mx-auto">
            {/* Setup Screen */}
            {gameState === "setup" && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl relative overflow-hidden"
                >
                    {/* Background Glow */}
                    <div className="absolute -top-20 -left-20 w-64 h-64 bg-purple-600/30 rounded-full blur-3xl pointer-events-none" />
                    <div className="absolute -bottom-20 -right-20 w-64 h-64 bg-blue-600/30 rounded-full blur-3xl pointer-events-none" />

                    <div className="text-center mb-10 relative z-10">
                        <h2 className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400 mb-4 tracking-tight">
                            NEON MARBLE RACE
                            <span className="block text-lg font-bold text-white mt-2 tracking-widest opacity-80">GOD MODE EDITION</span>
                        </h2>
                        <p className="text-zinc-400 text-lg">
                            운명을 건 한판 승부! 참가자를 입력하고 레이스를 시작하세요.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 relative z-10">
                        {/* Left Column: Inputs */}
                        <div className="space-y-6">
                            <div>
                                <label className="block text-sm font-bold text-zinc-400 mb-2">추첨 제목</label>
                                <input
                                    type="text"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    placeholder="예: 오늘 점심 쏘기"
                                    className="w-full bg-zinc-900/50 border border-zinc-700 rounded-xl p-4 text-white focus:ring-2 focus:ring-purple-500 outline-none transition-all"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-zinc-400 mb-2">참가자 명단</label>
                                <textarea
                                    value={candidatesText}
                                    onChange={(e) => setCandidatesText(e.target.value)}
                                    placeholder="김철수&#13;&#10;이영희&#13;&#10;박지성&#13;&#10;..."
                                    className="w-full h-60 bg-zinc-900/50 border border-zinc-700 rounded-xl p-4 text-white focus:ring-2 focus:ring-purple-500 outline-none resize-none font-mono leading-relaxed"
                                />
                                <div className="flex justify-between text-xs text-zinc-500 mt-2 px-1">
                                    <span>엔터로 구분해주세요</span>
                                    <span>총 {candidatesText.split("\n").filter(n => n.trim()).length}명</span>
                                </div>
                            </div>
                        </div>

                        {/* Right Column: Settings */}
                        <div className="space-y-8">
                            {/* Winner Count */}
                            <div>
                                <label className="block text-sm font-bold text-zinc-400 mb-2">당첨자 수</label>
                                <div className="flex items-center gap-4 bg-zinc-900/50 border border-zinc-700 rounded-xl p-4">
                                    <Users className="text-zinc-500" />
                                    <input
                                        type="number"
                                        min="1"
                                        max={candidatesText.split("\n").filter(n => n.trim()).length || 1}
                                        value={winnerCount}
                                        onChange={(e) => setWinnerCount(Number(e.target.value))}
                                        className="bg-transparent text-white text-2xl font-bold outline-none w-full"
                                    />
                                    <span className="text-zinc-500 font-bold">명</span>
                                </div>
                            </div>

                            {/* Special Prizes */}
                            <div className="bg-zinc-900/30 border border-zinc-700 rounded-xl p-5">
                                <div className="flex items-center justify-between mb-4">
                                    <label className="text-sm font-bold text-yellow-400 flex items-center gap-2">
                                        <Gift className="w-4 h-4" /> 특별상 설정
                                    </label>
                                    <button
                                        onClick={addSpecialPrize}
                                        className="text-xs bg-zinc-800 hover:bg-zinc-700 text-white px-3 py-1 rounded-lg flex items-center gap-1 transition-colors"
                                    >
                                        <Plus className="w-3 h-3" /> 추가
                                    </button>
                                </div>
                                <div className="space-y-3 max-h-40 overflow-y-auto pr-2 custom-scrollbar">
                                    {specialPrizes.map((prize, idx) => (
                                        <div key={idx} className="flex items-center gap-2">
                                            <div className="flex items-center gap-1 bg-zinc-950 rounded-lg px-3 py-2 border border-zinc-800 w-24">
                                                <span className="text-zinc-500 text-xs">No.</span>
                                                <input
                                                    type="number"
                                                    value={prize.rank}
                                                    onChange={(e) => updateSpecialPrize(idx, "rank", Number(e.target.value))}
                                                    className="bg-transparent text-white font-bold w-full outline-none text-center"
                                                />
                                            </div>
                                            <input
                                                type="text"
                                                value={prize.name}
                                                onChange={(e) => updateSpecialPrize(idx, "name", e.target.value)}
                                                placeholder="상품명 (예: 치킨)"
                                                className="flex-1 bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-white text-sm outline-none focus:border-yellow-500/50 transition-colors"
                                            />
                                            <button
                                                onClick={() => removeSpecialPrize(idx)}
                                                className="p-2 text-zinc-500 hover:text-red-400 transition-colors"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    ))}
                                    {specialPrizes.length === 0 && (
                                        <p className="text-xs text-zinc-600 text-center py-2">
                                            특정 등수에게 줄 특별한 선물이 있나요?
                                        </p>
                                    )}
                                </div>
                            </div>

                            <button
                                onClick={startGame}
                                className="w-full py-5 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-black text-2xl rounded-xl hover:scale-[1.02] active:scale-[0.98] transition-all shadow-[0_0_30px_rgba(168,85,247,0.4)] flex items-center justify-center gap-3 group"
                            >
                                <Play className="fill-current group-hover:animate-pulse" /> RACE START
                            </button>
                        </div>
                    </div>
                </motion.div>
            )}

            {/* Game Screen */}
            <div className={`relative ${gameState === "setup" ? "hidden" : "block"}`}>
                {/* Header Overlay */}
                <div className="absolute top-6 left-0 right-0 text-center z-10 pointer-events-none">
                    <h1 className="text-5xl font-black text-white drop-shadow-[0_0_20px_rgba(255,255,255,0.8)] tracking-tight">
                        {title || "NEON MARBLE RACE"}
                    </h1>
                    {gameState === "finished" && (
                        <motion.div
                            initial={{ scale: 0, rotate: -10 }}
                            animate={{ scale: 1, rotate: 0 }}
                            className="mt-4 inline-block px-8 py-3 bg-gradient-to-r from-red-600 to-orange-600 text-white font-black text-xl rounded-full shadow-[0_0_30px_rgba(220,38,38,0.6)]"
                        >
                            RACE FINISHED!
                        </motion.div>
                    )}
                </div>

                {/* Canvas */}
                <canvas
                    ref={canvasRef}
                    className="w-full h-[600px] md:h-[800px] bg-[#0a0a0a] rounded-3xl border-4 border-zinc-800 shadow-2xl cursor-crosshair"
                />

                {/* Live Leaderboard */}
                <div className="absolute top-24 right-6 w-80 bg-black/80 backdrop-blur-xl border border-white/10 rounded-2xl p-6 pointer-events-none shadow-2xl">
                    <h3 className="text-white font-black mb-4 flex items-center gap-2 text-lg">
                        <Trophy className="w-5 h-5 text-yellow-500" /> LIVE RANKING
                    </h3>
                    <div className="space-y-2 max-h-[500px] overflow-hidden">
                        <AnimatePresence>
                            {winners.map((ball, i) => {
                                const specialPrize = specialPrizes.find(p => p.rank === ball.rank);
                                return (
                                    <motion.div
                                        key={ball.id}
                                        initial={{ x: 50, opacity: 0 }}
                                        animate={{ x: 0, opacity: 1 }}
                                        className={`flex items-center gap-3 rounded-xl p-3 border ${specialPrize
                                                ? "bg-yellow-500/20 border-yellow-500/50"
                                                : "bg-white/5 border-white/5"
                                            }`}
                                    >
                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-black shadow-lg ${ball.rank === 1 ? "bg-gradient-to-br from-yellow-400 to-yellow-600 text-black" :
                                                ball.rank === 2 ? "bg-gradient-to-br from-gray-300 to-gray-500 text-black" :
                                                    ball.rank === 3 ? "bg-gradient-to-br from-amber-600 to-amber-800 text-white" :
                                                        "bg-zinc-800 text-zinc-400"
                                            }`}>
                                            {ball.rank}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2">
                                                <span className="text-white font-bold text-lg truncate">{ball.name}</span>
                                                {specialPrize && (
                                                    <span className="text-[10px] font-bold bg-yellow-500 text-black px-1.5 py-0.5 rounded-full animate-pulse">
                                                        {specialPrize.name}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                        {ball.rank === 1 && <Sparkles className="w-4 h-4 text-yellow-400 ml-auto animate-pulse" />}
                                    </motion.div>
                                );
                            })}
                        </AnimatePresence>
                        {winners.length === 0 && (
                            <div className="text-zinc-500 text-sm text-center py-8 italic">
                                Racing in progress...
                            </div>
                        )}
                    </div>
                </div>

                {/* Controls */}
                {gameState === "finished" && (
                    <div className="absolute bottom-12 left-1/2 -translate-x-1/2 flex gap-4 z-20">
                        <button
                            onClick={() => setGameState("setup")}
                            className="px-10 py-4 bg-white text-black font-black text-xl rounded-full hover:scale-110 transition-transform shadow-[0_0_30px_rgba(255,255,255,0.4)] flex items-center gap-2"
                        >
                            <RotateCcw className="w-5 h-5" /> RESTART
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
