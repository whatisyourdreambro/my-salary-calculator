"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Play,
    RotateCcw,
    Share2,
    Trophy,
    Wallet,
    Zap,
    ShieldAlert,
    TrendingUp,
    Home,
    Banknote,
    Gamepad2
} from "lucide-react";
import AdUnit from "@/components/AdUnit";
import confetti from "canvas-confetti";

// --- Game Constants & Config ---

const GAME_DURATION = 60;
const SPAWN_RATE = 400; // Faster spawn for arcade feel
const BASKET_WIDTH = 100;
const BASKET_HEIGHT = 20;

type ItemType = "gold" | "cash" | "stock" | "house" | "tax" | "scam" | "crypto";

interface GameItem {
    id: number;
    x: number;
    y: number;
    type: ItemType;
    vy: number;
    rotation: number;
    rotationSpeed: number;
}

const ITEMS: Record<ItemType, { emoji: string; value: number; speed: number; weight: number; color: string; label: string }> = {
    gold: { emoji: "🥇", value: 100, speed: 3.5, weight: 25, color: "#fbbf24", label: "GOLD" },
    cash: { emoji: "💵", value: 50, speed: 4.5, weight: 35, color: "#4ade80", label: "CASH" },
    stock: { emoji: "📈", value: 150, speed: 5.5, weight: 20, color: "#f472b6", label: "STOCK" },
    house: { emoji: "🏠", value: 500, speed: 7, weight: 5, color: "#60a5fa", label: "REAL ESTATE" },
    crypto: { emoji: "🚀", value: 300, speed: 8, weight: 5, color: "#a78bfa", label: "CRYPTO" },
    tax: { emoji: "📉", value: -100, speed: 5, weight: 15, color: "#ef4444", label: "TAX" },
    scam: { emoji: "💣", value: -300, speed: 6, weight: 8, color: "#dc2626", label: "SCAM" },
};

// --- Utils ---
const formatScore = (num: number) => num.toLocaleString();

export default function AssetAllocatorGame() {
    const [gameState, setGameState] = useState<"start" | "playing" | "gameover">("start");
    const [score, setScore] = useState(0);
    const [timeLeft, setTimeLeft] = useState(GAME_DURATION);
    const [highScore, setHighScore] = useState(0);
    const [combo, setCombo] = useState(0);

    const canvasRef = useRef<HTMLCanvasElement>(null);
    const requestRef = useRef<number>();
    const gameStateRef = useRef<"start" | "playing" | "gameover">("start");
    const basketRef = useRef({ x: 0 });
    const itemsRef = useRef<GameItem[]>([]);
    const lastSpawnTime = useRef(0);
    const scoreRef = useRef(0);
    const comboRef = useRef(0);

    // Sync ref
    useEffect(() => { gameStateRef.current = gameState; }, [gameState]);

    // Load High Score
    useEffect(() => {
        const saved = localStorage.getItem("assetAllocatorHighScore_Neon");
        if (saved) setHighScore(parseInt(saved));
    }, []);

    // Timer Logic
    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (gameState === "playing") {
            interval = setInterval(() => {
                setTimeLeft((prev) => {
                    if (prev <= 1) {
                        endGame();
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [gameState]);

    const endGame = () => {
        setGameState("gameover");
        gameStateRef.current = "gameover";
        if (requestRef.current) cancelAnimationFrame(requestRef.current);

        if (scoreRef.current > highScore) {
            setHighScore(scoreRef.current);
            localStorage.setItem("assetAllocatorHighScore_Neon", scoreRef.current.toString());
            confetti({
                particleCount: 200,
                spread: 100,
                origin: { y: 0.6 },
                colors: ['#0ff', '#f0f', '#ff0']
            });
        }
    };

    const startGame = () => {
        setGameState("playing");
        gameStateRef.current = "playing";
        setScore(0);
        scoreRef.current = 0;
        setCombo(0);
        comboRef.current = 0;
        setTimeLeft(GAME_DURATION);
        itemsRef.current = [];
        lastSpawnTime.current = performance.now();
        requestRef.current = requestAnimationFrame(update);
    };

    // Input Handling
    const handleMove = (clientX: number) => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const rect = canvas.getBoundingClientRect();
        const x = clientX - rect.left;
        // Smooth lerp could be added here, but direct mapping is more responsive for arcade feel
        basketRef.current.x = Math.max(BASKET_WIDTH / 2, Math.min(canvas.width - BASKET_WIDTH / 2, x));
    };

    // Game Loop
    const update = (time: number) => {
        if (gameStateRef.current !== "playing") return;

        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        // --- Render Background ---
        // Semi-transparent clear for trail effect? No, clean clear for crisp neon
        ctx.fillStyle = "#0f172a"; // Slate-900 like
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Draw Grid
        ctx.strokeStyle = "rgba(99, 102, 241, 0.1)"; // Indigo-500 low opacity
        ctx.lineWidth = 1;
        const gridSize = 40;
        const offset = (time / 50) % gridSize; // Moving grid effect

        ctx.beginPath();
        // Vertical lines
        for (let x = 0; x <= canvas.width; x += gridSize) {
            ctx.moveTo(x, 0);
            ctx.lineTo(x, canvas.height);
        }
        // Horizontal lines (moving down)
        for (let y = offset - gridSize; y <= canvas.height; y += gridSize) {
            ctx.moveTo(0, y);
            ctx.lineTo(canvas.width, y);
        }
        ctx.stroke();

        // --- Spawn Logic ---
        if (time - lastSpawnTime.current > SPAWN_RATE) {
            spawnItem(canvas.width);
            lastSpawnTime.current = time;
        }

        // --- Update & Draw Items ---
        itemsRef.current.forEach((item, index) => {
            item.y += item.vy;
            item.rotation += item.rotationSpeed;

            // Draw Glow
            ctx.shadowBlur = 15;
            ctx.shadowColor = ITEMS[item.type].color;
            ctx.fillStyle = "#fff";

            // Draw Emoji
            ctx.save();
            ctx.translate(item.x, item.y);
            ctx.rotate(item.rotation);
            ctx.font = "32px Arial";
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            ctx.fillText(ITEMS[item.type].emoji, 0, 0);
            ctx.restore();

            // Reset Shadow
            ctx.shadowBlur = 0;

            // Collision Detection
            const basketY = canvas.height - BASKET_HEIGHT - 20; // Slightly above bottom
            const basketX = basketRef.current.x;

            if (
                item.y > basketY &&
                item.y < basketY + BASKET_HEIGHT + 20 &&
                item.x > basketX - BASKET_WIDTH / 2 &&
                item.x < basketX + BASKET_WIDTH / 2
            ) {
                // Collision!
                handleCollection(item);
                itemsRef.current.splice(index, 1);
            }
        });

        // Remove off-screen items
        itemsRef.current = itemsRef.current.filter(item => item.y < canvas.height + 50);

        // --- Draw Basket ---
        const basketX = basketRef.current.x;
        const basketY = canvas.height - BASKET_HEIGHT - 20;

        ctx.shadowBlur = 20;
        ctx.shadowColor = "#0ef"; // Cyan glow
        ctx.strokeStyle = "#0ef";
        ctx.lineWidth = 3;

        // Cyberpunk Basket Shape
        ctx.beginPath();
        ctx.moveTo(basketX - BASKET_WIDTH / 2, basketY);
        ctx.lineTo(basketX - BASKET_WIDTH / 2 + 10, basketY + BASKET_HEIGHT);
        ctx.lineTo(basketX + BASKET_WIDTH / 2 - 10, basketY + BASKET_HEIGHT);
        ctx.lineTo(basketX + BASKET_WIDTH / 2, basketY);
        ctx.closePath();
        ctx.stroke();

        // Basket Inner Glow
        ctx.fillStyle = "rgba(0, 238, 255, 0.1)";
        ctx.fill();

        ctx.shadowBlur = 0;

        if (gameStateRef.current === "playing") {
            requestRef.current = requestAnimationFrame(update);
        }
    };

    const spawnItem = (width: number) => {
        let cumulativeWeight = 0;
        let selectedType: ItemType = "cash";
        const totalWeight = Object.values(ITEMS).reduce((acc, item) => acc + item.weight, 0);
        const normalizedRandom = Math.random() * totalWeight;

        for (const [type, data] of Object.entries(ITEMS)) {
            cumulativeWeight += data.weight;
            if (normalizedRandom <= cumulativeWeight) {
                selectedType = type as ItemType;
                break;
            }
        }

        itemsRef.current.push({
            id: Math.random(),
            x: Math.random() * (width - 60) + 30,
            y: -50,
            type: selectedType,
            vy: ITEMS[selectedType].speed * (1 + (GAME_DURATION - timeLeft) / (GAME_DURATION * 2)), // Gets faster over time
            rotation: 0,
            rotationSpeed: (Math.random() - 0.5) * 0.1
        });
    };

    const handleCollection = (item: GameItem) => {
        const value = ITEMS[item.type].value;

        if (value > 0) {
            scoreRef.current += value;
            comboRef.current += 1;
        } else {
            scoreRef.current = Math.max(0, scoreRef.current + value);
            comboRef.current = 0; // Reset combo on bad item

            // Screen shake effect logic could go here
        }

        setScore(scoreRef.current);
        setCombo(comboRef.current);
    };

    return (
        <main className="w-full min-h-screen bg-[#050b14] flex flex-col items-center justify-center p-4 overflow-hidden touch-none selection:bg-cyan-500/30">

            {/* Ambient Background Glows */}
            <div className="fixed top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
                <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-600/20 rounded-full blur-[100px] animate-pulse-slow" />
                <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-fuchsia-600/20 rounded-full blur-[100px] animate-pulse-slow delay-1000" />
            </div>

            <div className="max-w-md w-full relative z-10 flex flex-col items-center gap-6">

                {/* Title */}
                <div className="text-center space-y-2">
                    <h1 className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-white to-fuchsia-400 tracking-tighter drop-shadow-[0_0_15px_rgba(6,182,212,0.5)]">
                        ASSET RUN
                    </h1>
                    <div className="flex items-center justify-center gap-2 text-cyan-300/80 text-sm font-bold tracking-[0.2em] uppercase">
                        <Zap className="w-4 h-4" /> Cyberpunk Edition
                    </div>
                </div>

                {/* Game Container */}
                <div className="relative w-full aspect-[2/3] bg-slate-900/50 rounded-3xl border border-white/10 shadow-2xl backdrop-blur-xl overflow-hidden group">
                    <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none" />

                    {/* HUD */}
                    <div className="absolute top-0 left-0 w-full p-6 flex justify-between items-start z-20 pointer-events-none">
                        <div className="flex flex-col gap-1">
                            <span className="text-xs font-bold text-slate-400 tracking-wider">SCORE</span>
                            <span className="text-3xl font-black text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.5)] font-mono">
                                {formatScore(score)}
                            </span>
                        </div>
                        <div className="flex flex-col items-end gap-1">
                            <span className="text-xs font-bold text-slate-400 tracking-wider">TIME</span>
                            <span className={`text-3xl font-black font-mono tracking-widest ${timeLeft <= 10 ? 'text-red-500 animate-ping' : 'text-white'}`}>
                                {timeLeft}
                            </span>
                        </div>
                    </div>

                    {/* Combo Indicator */}
                    <AnimatePresence>
                        {combo > 1 && (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.5 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 1.5 }}
                                className="absolute top-20 left-1/2 -translate-x-1/2 z-10 pointer-events-none"
                            >
                                <div className="text-center">
                                    <div className="text-4xl font-black italic text-yellow-400 drop-shadow-[0_0_10px_rgba(250,204,21,0.8)]">
                                        {combo}x
                                    </div>
                                    <div className="text-xs font-bold text-yellow-200 tracking-[0.3em]">COMBO</div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <canvas
                        ref={canvasRef}
                        width={400}
                        height={600}
                        onMouseMove={(e) => handleMove(e.clientX)}
                        onTouchMove={(e) => handleMove(e.touches[0].clientX)}
                        className="w-full h-full relative z-10 cursor-none touch-none"
                    />

                    {/* Start Overlay */}
                    <AnimatePresence>
                        {gameState === "start" && (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="absolute inset-0 z-30 bg-slate-950/80 backdrop-blur-md flex flex-col items-center justify-center p-8"
                            >
                                <div className="p-4 bg-white/5 border border-white/10 rounded-2xl mb-8 w-full max-w-xs space-y-4">
                                    <div className="flex items-center justify-between text-sm text-slate-300">
                                        <span className="flex items-center gap-2"><Gamepad2 className="w-4 h-4 text-cyan-400" /> Game Mode</span>
                                        <span className="font-bold text-white">Arcade</span>
                                    </div>
                                    <div className="flex items-center justify-between text-sm text-slate-300">
                                        <span className="flex items-center gap-2"><Trophy className="w-4 h-4 text-yellow-400" /> Best Score</span>
                                        <span className="font-bold text-yellow-400">{formatScore(highScore)}</span>
                                    </div>
                                </div>

                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={startGame}
                                    className="group relative px-8 py-4 bg-white text-black font-black text-xl rounded-full overflow-hidden"
                                >
                                    <span className="relative z-10 flex items-center gap-2">
                                        GAME START <Play className="w-5 h-5 fill-black" />
                                    </span>
                                    <div className="absolute inset-0 bg-gradient-to-r from-cyan-400 to-fuchsia-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                                </motion.button>

                                <div className="mt-8 grid grid-cols-2 gap-x-8 gap-y-2 text-xs font-medium text-slate-500">
                                    <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-green-400" /> Catch Assets</div>
                                    <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-red-400" /> Avoid Bombs</div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Game Over Overlay */}
                    <AnimatePresence>
                        {gameState === "gameover" && (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="absolute inset-0 z-30 bg-slate-950/90 backdrop-blur-md flex flex-col items-center justify-center p-8"
                            >
                                <motion.div
                                    initial={{ scale: 0.8, rotate: -5 }}
                                    animate={{ scale: 1, rotate: 0 }}
                                    className="mb-8 text-center"
                                >
                                    <h2 className="text-5xl font-black text-white italic tracking-tighter mb-2" style={{ textShadow: "0 0 20px rgba(220, 38, 38, 0.5)" }}>
                                        GAME OVER
                                    </h2>
                                    <p className="text-slate-400 font-mono tracking-widest">SESSION ENDED</p>
                                </motion.div>

                                <div className="w-full max-w-sm bg-white/5 border border-white/10 rounded-3xl p-6 mb-8">
                                    <div className="flex justify-between items-center mb-4">
                                        <span className="text-sm font-bold text-slate-500 uppercase">Total Score</span>
                                        <span className="text-3xl font-black text-cyan-400">{formatScore(score)}</span>
                                    </div>
                                    <div className="w-full h-px bg-white/10 mb-4" />
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm font-bold text-slate-500 uppercase">High Score</span>
                                        <span className="text-xl font-bold text-yellow-400">{formatScore(highScore)}</span>
                                    </div>
                                </div>

                                <div className="flex gap-4 w-full max-w-sm">
                                    <button
                                        onClick={startGame}
                                        className="flex-1 py-4 bg-white text-black rounded-2xl font-bold hover:bg-slate-200 transition-colors flex items-center justify-center gap-2"
                                    >
                                        <RotateCcw className="w-5 h-5" /> REPLAY
                                    </button>
                                    <button
                                        onClick={() => {
                                            if (navigator.share) {
                                                navigator.share({
                                                    title: 'Asset Run',
                                                    text: `Score: ${score}! Play Asset Run now.`,
                                                    url: window.location.href
                                                });
                                            }
                                        }}
                                        className="flex-1 py-4 bg-white/10 text-white rounded-2xl font-bold hover:bg-white/20 transition-colors flex items-center justify-center gap-2 border border-white/10"
                                    >
                                        <Share2 className="w-5 h-5" /> SHARE
                                    </button>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* Legend/Info Grid */}
                <div className="w-full max-w-md grid grid-cols-4 gap-2">
                    {[
                        { icon: "🥇", label: "Gold", val: "+100", col: "text-amber-400" },
                        { icon: "💵", label: "Cash", val: "+50", col: "text-green-400" },
                        { icon: "🏠", label: "House", val: "+500", col: "text-blue-400" },
                        { icon: "💣", label: "Scam", val: "-300", col: "text-red-400" },
                    ].map((item, i) => (
                        <div key={i} className="bg-slate-900/50 border border-white/5 rounded-xl p-2 text-center flex flex-col items-center justify-center">
                            <span className="text-xl mb-1 filter drop-shadow-lg">{item.icon}</span>
                            <span className={`text-[10px] font-bold ${item.col}`}>{item.val}</span>
                        </div>
                    ))}
                </div>

                <div className="w-full max-w-md mt-4">
                    <AdUnit slotId="9988776655" format="rectangle" label="Game Ad" />
                </div>
            </div>
        </main>
    );
}
