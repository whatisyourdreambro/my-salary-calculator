"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Trophy, Play, RotateCcw, Users, Settings, Sparkles } from "lucide-react";

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
}

interface Peg {
    x: number;
    y: number;
    radius: number;
}

interface Particle {
    x: number;
    y: number;
    vx: number;
    vy: number;
    life: number;
    color: string;
}

const COLORS = [
    "#ef4444", "#f97316", "#f59e0b", "#84cc16", "#10b981",
    "#06b6d4", "#3b82f6", "#6366f1", "#8b5cf6", "#d946ef", "#f43f5e"
];

export default function RandomDrawGame() {
    // Setup State
    const [title, setTitle] = useState("");
    const [candidatesText, setCandidatesText] = useState("");
    const [winnerCount, setWinnerCount] = useState(1);
    const [gameState, setGameState] = useState<"setup" | "racing" | "finished">("setup");

    // Game State
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [winners, setWinners] = useState<Ball[]>([]);
    const requestRef = useRef<number>();
    const ballsRef = useRef<Ball[]>([]);
    const pegsRef = useRef<Peg[]>([]);
    const particlesRef = useRef<Particle[]>([]);
    const cameraYRef = useRef(0);

    // Initialize Game
    const startGame = () => {
        const names = candidatesText.split("\n").filter(n => n.trim() !== "");
        if (names.length === 0) return alert("참가자를 입력해주세요!");
        if (winnerCount > names.length) return alert("당첨자 수가 참가자 수보다 많습니다!");

        // Create Balls
        ballsRef.current = names.map((name, i) => ({
            id: i,
            name: name.trim(),
            x: 50 + Math.random() * (window.innerWidth < 600 ? 300 : 700), // Random start X
            y: -50 - Math.random() * 200, // Staggered start Y
            vx: (Math.random() - 0.5) * 4, // More chaotic start
            vy: 0,
            color: COLORS[i % COLORS.length],
            radius: 10,
            finished: false,
            rank: 0
        }));

        // Create Pegs (Obstacles)
        const pegs: Peg[] = [];
        const rows = 20; // Longer race
        const cols = 12;
        const width = window.innerWidth < 600 ? 350 : 800;
        const startX = 50;
        const startY = 100;
        const gapX = width / cols;
        const gapY = 50;

        for (let r = 0; r < rows; r++) {
            for (let c = 0; c < cols + (r % 2); c++) {
                pegs.push({
                    x: startX + c * gapX + (r % 2 === 0 ? 0 : gapX / 2),
                    y: startY + r * gapY,
                    radius: 3
                });
            }
        }
        pegsRef.current = pegs;
        particlesRef.current = [];
        cameraYRef.current = 0;

        setWinners([]);
        setGameState("racing");
        requestRef.current = requestAnimationFrame(gameLoop);
    };

    const createParticles = (x: number, y: number, color: string) => {
        for (let i = 0; i < 5; i++) {
            particlesRef.current.push({
                x,
                y,
                vx: (Math.random() - 0.5) * 5,
                vy: (Math.random() - 0.5) * 5,
                life: 1.0,
                color
            });
        }
    };

    const gameLoop = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        // Resize Canvas
        const width = window.innerWidth < 600 ? 400 : 900;
        const height = 800;
        canvas.width = width;
        canvas.height = height;

        // Camera Logic (Follow the leader)
        let leaderY = 0;
        ballsRef.current.forEach(b => {
            if (!b.finished && b.y > leaderY) leaderY = b.y;
        });
        // Smooth camera follow
        const targetCameraY = Math.max(0, leaderY - height / 2);
        cameraYRef.current += (targetCameraY - cameraYRef.current) * 0.1;

        // Apply Camera Transform
        ctx.save();
        ctx.translate(0, -cameraYRef.current);

        // Clear with Trail Effect
        ctx.fillStyle = "rgba(0, 0, 0, 0.2)"; // Trail effect
        ctx.fillRect(0, cameraYRef.current, width, height);

        // Draw Pegs (Neon)
        ctx.shadowBlur = 10;
        ctx.shadowColor = "#0ea5e9";
        ctx.fillStyle = "#0ea5e9";
        pegsRef.current.forEach(peg => {
            ctx.beginPath();
            ctx.arc(peg.x, peg.y, peg.radius, 0, Math.PI * 2);
            ctx.fill();
        });
        ctx.shadowBlur = 0;

        // Update & Draw Particles
        particlesRef.current.forEach((p, i) => {
            p.x += p.vx;
            p.y += p.vy;
            p.life -= 0.05;
            if (p.life <= 0) particlesRef.current.splice(i, 1);

            ctx.globalAlpha = p.life;
            ctx.fillStyle = p.color;
            ctx.beginPath();
            ctx.arc(p.x, p.y, 2, 0, Math.PI * 2);
            ctx.fill();
        });
        ctx.globalAlpha = 1;

        // Update & Draw Balls
        let activeBalls = 0;
        ballsRef.current.forEach(ball => {
            if (!ball.finished) {
                activeBalls++;
                // Physics
                ball.vy += 0.2; // Gravity
                ball.vx *= 0.99; // Air resistance
                ball.x += ball.vx;
                ball.y += ball.vy;

                // Wall Collisions
                if (ball.x < ball.radius) {
                    ball.x = ball.radius;
                    ball.vx *= -0.7;
                    createParticles(ball.x, ball.y, ball.color);
                }
                if (ball.x > width - ball.radius) {
                    ball.x = width - ball.radius;
                    ball.vx *= -0.7;
                    createParticles(ball.x, ball.y, ball.color);
                }

                // Peg Collisions
                pegsRef.current.forEach(peg => {
                    const dx = ball.x - peg.x;
                    const dy = ball.y - peg.y;
                    const dist = Math.sqrt(dx * dx + dy * dy);
                    const minDist = ball.radius + peg.radius;

                    if (dist < minDist) {
                        // Bounce
                        const angle = Math.atan2(dy, dx);
                        const speed = Math.sqrt(ball.vx * ball.vx + ball.vy * ball.vy);
                        ball.vx = Math.cos(angle) * speed * 0.8 + (Math.random() - 0.5);
                        ball.vy = Math.sin(angle) * speed * 0.8;

                        // Push out
                        const overlap = minDist - dist;
                        ball.x += Math.cos(angle) * overlap;
                        ball.y += Math.sin(angle) * overlap;

                        // Spark Effect
                        if (speed > 2) createParticles(peg.x, peg.y, ball.color);
                    }
                });

                // Finish Line (Adjusted for long course)
                const finishLineY = 1200; // Longer track
                if (ball.y > finishLineY) {
                    ball.finished = true;
                    ball.y = finishLineY;
                    const currentRank = ballsRef.current.filter(b => b.finished).length;
                    ball.rank = currentRank;

                    if (currentRank <= winnerCount) {
                        setWinners(prev => [...prev, ball]);
                        createParticles(ball.x, ball.y, "#ffd700"); // Gold particles for finishers
                    }
                }
            }

            // Draw Ball (Neon Glow)
            ctx.shadowBlur = 15;
            ctx.shadowColor = ball.color;
            ctx.beginPath();
            ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
            ctx.fillStyle = ball.color;
            ctx.fill();
            ctx.shadowBlur = 0;

            // Draw Name Tag
            ctx.fillStyle = "white";
            ctx.font = "bold 12px sans-serif";
            ctx.textAlign = "center";
            ctx.fillText(ball.name, ball.x, ball.y - 15);
        });

        // Draw Finish Line
        const finishLineY = 1200;
        ctx.beginPath();
        ctx.moveTo(0, finishLineY);
        ctx.lineTo(width, finishLineY);
        ctx.strokeStyle = "#ef4444";
        ctx.lineWidth = 5;
        ctx.setLineDash([10, 10]);
        ctx.stroke();
        ctx.setLineDash([]);

        // Draw "FINISH" Text
        ctx.fillStyle = "#ef4444";
        ctx.font = "bold 40px sans-serif";
        ctx.textAlign = "center";
        ctx.fillText("FINISH LINE", width / 2, finishLineY + 50);

        ctx.restore(); // Restore camera transform

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
                        </h2>
                        <p className="text-zinc-400 text-lg">
                            운명을 건 한판 승부! 참가자를 입력하고 레이스를 시작하세요.
                        </p>
                    </div>

                    <div className="space-y-8 relative z-10">
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

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div>
                                <label className="block text-sm font-bold text-zinc-400 mb-2">참가자 명단</label>
                                <textarea
                                    value={candidatesText}
                                    onChange={(e) => setCandidatesText(e.target.value)}
                                    placeholder="김철수&#13;&#10;이영희&#13;&#10;박지성&#13;&#10;..."
                                    className="w-full h-80 bg-zinc-900/50 border border-zinc-700 rounded-xl p-4 text-white focus:ring-2 focus:ring-purple-500 outline-none resize-none font-mono leading-relaxed"
                                />
                                <div className="flex justify-between text-xs text-zinc-500 mt-2 px-1">
                                    <span>엔터로 구분해주세요</span>
                                    <span>총 {candidatesText.split("\n").filter(n => n.trim()).length}명</span>
                                </div>
                            </div>

                            <div className="space-y-8">
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

                                <div className="bg-gradient-to-br from-purple-900/20 to-blue-900/20 border border-white/10 rounded-xl p-6">
                                    <h3 className="text-white font-bold mb-4 flex items-center gap-2">
                                        <Sparkles className="w-4 h-4 text-yellow-400" /> 게임 특징
                                    </h3>
                                    <ul className="text-sm text-zinc-400 space-y-3">
                                        <li className="flex items-center gap-2">
                                            <span className="w-1.5 h-1.5 rounded-full bg-purple-500" />
                                            물리 엔진 기반의 리얼타임 시뮬레이션
                                        </li>
                                        <li className="flex items-center gap-2">
                                            <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                                            충돌 파티클 및 네온 글로우 효과
                                        </li>
                                        <li className="flex items-center gap-2">
                                            <span className="w-1.5 h-1.5 rounded-full bg-pink-500" />
                                            선두를 따라가는 다이내믹 카메라
                                        </li>
                                    </ul>
                                </div>

                                <button
                                    onClick={startGame}
                                    className="w-full py-5 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-black text-2xl rounded-xl hover:scale-[1.02] active:scale-[0.98] transition-all shadow-[0_0_30px_rgba(168,85,247,0.4)] flex items-center justify-center gap-3 group"
                                >
                                    <Play className="fill-current group-hover:animate-pulse" /> RACE START
                                </button>
                            </div>
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
                <div className="absolute top-24 right-6 w-72 bg-black/80 backdrop-blur-xl border border-white/10 rounded-2xl p-6 pointer-events-none shadow-2xl">
                    <h3 className="text-white font-black mb-4 flex items-center gap-2 text-lg">
                        <Trophy className="w-5 h-5 text-yellow-500" /> LIVE RANKING
                    </h3>
                    <div className="space-y-2 max-h-[400px] overflow-hidden">
                        <AnimatePresence>
                            {winners.map((ball, i) => (
                                <motion.div
                                    key={ball.id}
                                    initial={{ x: 50, opacity: 0 }}
                                    animate={{ x: 0, opacity: 1 }}
                                    className="flex items-center gap-3 bg-white/5 rounded-xl p-3 border border-white/5"
                                >
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-black shadow-lg ${i === 0 ? "bg-gradient-to-br from-yellow-400 to-yellow-600 text-black" :
                                            i === 1 ? "bg-gradient-to-br from-gray-300 to-gray-500 text-black" :
                                                i === 2 ? "bg-gradient-to-br from-amber-600 to-amber-800 text-white" : "bg-zinc-800 text-zinc-400"
                                        }`}>
                                        {i + 1}
                                    </div>
                                    <span className="text-white font-bold text-lg truncate">{ball.name}</span>
                                    {i === 0 && <Sparkles className="w-4 h-4 text-yellow-400 ml-auto animate-pulse" />}
                                </motion.div>
                            ))}
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
