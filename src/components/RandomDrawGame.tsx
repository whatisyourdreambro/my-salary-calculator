"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Trophy, Play, RotateCcw, Users, Settings } from "lucide-react";

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
            vx: (Math.random() - 0.5) * 2,
            vy: 0,
            color: COLORS[i % COLORS.length],
            radius: 8,
            finished: false,
            rank: 0
        }));

        // Create Pegs (Obstacles)
        const pegs: Peg[] = [];
        const rows = 15;
        const cols = 10;
        const width = window.innerWidth < 600 ? 350 : 800;
        const startX = 50;
        const startY = 100;
        const gapX = width / cols;
        const gapY = 40;

        for (let r = 0; r < rows; r++) {
            for (let c = 0; c < cols + (r % 2); c++) {
                pegs.push({
                    x: startX + c * gapX + (r % 2 === 0 ? 0 : gapX / 2),
                    y: startY + r * gapY,
                    radius: 4
                });
            }
        }
        pegsRef.current = pegs;

        setWinners([]);
        setGameState("racing");
        requestRef.current = requestAnimationFrame(gameLoop);
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

        // Clear
        ctx.clearRect(0, 0, width, height);

        // Draw Pegs
        ctx.fillStyle = "#333";
        pegsRef.current.forEach(peg => {
            ctx.beginPath();
            ctx.arc(peg.x, peg.y, peg.radius, 0, Math.PI * 2);
            ctx.fill();
            // Neon Glow
            ctx.shadowBlur = 5;
            ctx.shadowColor = "#555";
        });
        ctx.shadowBlur = 0;

        // Update & Draw Balls
        let activeBalls = 0;
        ballsRef.current.forEach(ball => {
            if (!ball.finished) {
                activeBalls++;
                // Physics
                ball.vy += 0.15; // Gravity
                ball.vx *= 0.99; // Air resistance
                ball.x += ball.vx;
                ball.y += ball.vy;

                // Wall Collisions
                if (ball.x < ball.radius) { ball.x = ball.radius; ball.vx *= -0.6; }
                if (ball.x > width - ball.radius) { ball.x = width - ball.radius; ball.vx *= -0.6; }

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
                        ball.vx = Math.cos(angle) * speed * 0.7 + (Math.random() - 0.5); // Add randomness
                        ball.vy = Math.sin(angle) * speed * 0.7;

                        // Push out
                        const overlap = minDist - dist;
                        ball.x += Math.cos(angle) * overlap;
                        ball.y += Math.sin(angle) * overlap;
                    }
                });

                // Finish Line
                if (ball.y > height - 50) {
                    ball.finished = true;
                    ball.y = height - 50;
                    const currentRank = ballsRef.current.filter(b => b.finished).length;
                    ball.rank = currentRank;

                    if (currentRank <= winnerCount) {
                        setWinners(prev => [...prev, ball]);
                    }
                }
            }

            // Draw Ball
            ctx.beginPath();
            ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
            ctx.fillStyle = ball.color;
            ctx.fill();

            // Draw Name Tag
            ctx.fillStyle = "white";
            ctx.font = "10px sans-serif";
            ctx.textAlign = "center";
            ctx.fillText(ball.name, ball.x, ball.y - 12);
        });

        // Draw Finish Line
        ctx.beginPath();
        ctx.moveTo(0, height - 50);
        ctx.lineTo(width, height - 50);
        ctx.strokeStyle = "#ef4444";
        ctx.lineWidth = 4;
        ctx.stroke();

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
        <div className="w-full max-w-5xl mx-auto">
            {/* Setup Screen */}
            {gameState === "setup" && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-zinc-900/80 backdrop-blur-xl border border-zinc-800 rounded-3xl p-8 shadow-2xl"
                >
                    <div className="text-center mb-8">
                        <h2 className="text-3xl font-black text-white mb-2">MARBLE RACE SETUP</h2>
                        <p className="text-zinc-400">참가자를 입력하고 레이스를 시작하세요!</p>
                    </div>

                    <div className="space-y-6">
                        <div>
                            <label className="block text-sm font-bold text-zinc-400 mb-2">추첨 제목 (선택)</label>
                            <input
                                type="text"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                placeholder="예: 점심 내기, 당직 뽑기"
                                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-4 text-white focus:ring-2 focus:ring-purple-500 outline-none"
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-bold text-zinc-400 mb-2">참가자 명단 (엔터로 구분)</label>
                                <textarea
                                    value={candidatesText}
                                    onChange={(e) => setCandidatesText(e.target.value)}
                                    placeholder="김철수&#13;&#10;이영희&#13;&#10;박지성&#13;&#10;..."
                                    className="w-full h-64 bg-zinc-950 border border-zinc-800 rounded-xl p-4 text-white focus:ring-2 focus:ring-purple-500 outline-none resize-none"
                                />
                                <div className="text-right text-xs text-zinc-500 mt-2">
                                    총 {candidatesText.split("\n").filter(n => n.trim()).length}명
                                </div>
                            </div>

                            <div className="space-y-6">
                                <div>
                                    <label className="block text-sm font-bold text-zinc-400 mb-2">당첨자 수 (등수)</label>
                                    <div className="flex items-center gap-4 bg-zinc-950 border border-zinc-800 rounded-xl p-4">
                                        <Users className="text-zinc-500" />
                                        <input
                                            type="number"
                                            min="1"
                                            max={candidatesText.split("\n").filter(n => n.trim()).length || 1}
                                            value={winnerCount}
                                            onChange={(e) => setWinnerCount(Number(e.target.value))}
                                            className="bg-transparent text-white text-xl font-bold outline-none w-full"
                                        />
                                        <span className="text-zinc-500 font-bold">명</span>
                                    </div>
                                </div>

                                <div className="bg-purple-900/20 border border-purple-500/30 rounded-xl p-6">
                                    <h3 className="text-purple-400 font-bold mb-2 flex items-center gap-2">
                                        <Settings className="w-4 h-4" /> 게임 설정
                                    </h3>
                                    <ul className="text-sm text-zinc-400 space-y-2 list-disc list-inside">
                                        <li>물리 엔진 기반 리얼타임 레이스</li>
                                        <li>장애물 충돌 시 랜덤 바운스 적용</li>
                                        <li>먼저 도착한 순서대로 순위 결정</li>
                                    </ul>
                                </div>

                                <button
                                    onClick={startGame}
                                    className="w-full py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-black text-xl rounded-xl hover:scale-105 transition-transform shadow-lg shadow-purple-500/30 flex items-center justify-center gap-2"
                                >
                                    <Play className="fill-current" /> RACE START!
                                </button>
                            </div>
                        </div>
                    </div>
                </motion.div>
            )}

            {/* Game Screen */}
            <div className={`relative ${gameState === "setup" ? "hidden" : "block"}`}>
                {/* Header Overlay */}
                <div className="absolute top-4 left-0 right-0 text-center z-10 pointer-events-none">
                    <h1 className="text-4xl font-black text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.5)]">
                        {title || "MARBLE RACE"}
                    </h1>
                    {gameState === "finished" && (
                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="mt-2 inline-block px-6 py-2 bg-red-600 text-white font-bold rounded-full shadow-lg"
                        >
                            RACE FINISHED!
                        </motion.div>
                    )}
                </div>

                {/* Canvas */}
                <canvas
                    ref={canvasRef}
                    className="w-full h-[600px] md:h-[800px] bg-zinc-900 rounded-3xl border-4 border-zinc-800 shadow-2xl cursor-crosshair"
                />

                {/* Live Leaderboard */}
                <div className="absolute top-20 right-4 w-64 bg-black/80 backdrop-blur-md border border-white/10 rounded-xl p-4 pointer-events-none">
                    <h3 className="text-white font-bold mb-3 flex items-center gap-2">
                        <Trophy className="w-4 h-4 text-yellow-500" /> LEADERBOARD
                    </h3>
                    <div className="space-y-2">
                        {winners.map((ball, i) => (
                            <motion.div
                                key={ball.id}
                                initial={{ x: 20, opacity: 0 }}
                                animate={{ x: 0, opacity: 1 }}
                                className="flex items-center gap-3 bg-white/10 rounded-lg p-2"
                            >
                                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${i === 0 ? "bg-yellow-500 text-black" :
                                        i === 1 ? "bg-zinc-400 text-black" :
                                            i === 2 ? "bg-amber-700 text-white" : "bg-zinc-800 text-zinc-400"
                                    }`}>
                                    {i + 1}
                                </div>
                                <span className="text-white font-medium truncate">{ball.name}</span>
                            </motion.div>
                        ))}
                        {winners.length === 0 && (
                            <div className="text-zinc-500 text-sm text-center py-4">Racing...</div>
                        )}
                    </div>
                </div>

                {/* Controls */}
                {gameState === "finished" && (
                    <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-4">
                        <button
                            onClick={() => setGameState("setup")}
                            className="px-8 py-3 bg-white text-black font-bold rounded-full hover:scale-110 transition-transform shadow-lg flex items-center gap-2"
                        >
                            <RotateCcw className="w-4 h-4" /> 다시 하기
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
