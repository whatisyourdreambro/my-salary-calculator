"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Trophy, Play, RotateCcw, Monitor, Smartphone, Gem, Coins, Briefcase } from "lucide-react";
import confetti from "canvas-confetti";

// --- Game Constants & Types ---
const GRAVITY = 0.5;
const BASKET_WIDTH = 100;
const BASKET_HEIGHT = 80;
const ITEM_SIZE = 50;

type GameState = "start" | "playing" | "gameover";

interface GameItem {
    id: number;
    x: number;
    y: number;
    type: "coin" | "diamond" | "bomb" | "goldbar";
    speed: number;
    rotation: number;
}

// --- Assets & Visuals ---
const ASSET_TYPES = {
    coin: { color: "#FFD700", score: 10, icon: "🪙" },
    goldbar: { color: "#CBA577", score: 30, icon: "🧈" },
    diamond: { color: "#5eead4", score: 50, icon: "💎" },
    bomb: { color: "#ef4444", score: -20, icon: "💣" },
};

export default function AssetAllocatorGame() {
    // --- State ---
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [gameState, setGameState] = useState<GameState>("start");
    const [score, setScore] = useState(0);
    const [timeLeft, setTimeLeft] = useState(60);
    const [highScore, setHighScore] = useState(0);

    // Game Loop Refs
    const requestRef = useRef<number>();
    const basketPos = useRef({ x: 0, y: 0 }); // y is fixed at bottom
    const items = useRef<GameItem[]>([]);
    const lastSpawn = useRef(0);
    const scoreRef = useRef(0); // For sync inside loop

    // --- Controls ---
    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            if (gameState !== "playing" || !canvasRef.current) return;
            const rect = canvasRef.current.getBoundingClientRect();
            const x = e.clientX - rect.left - BASKET_WIDTH / 2;
            // Clamp
            basketPos.current.x = Math.max(0, Math.min(x, canvasRef.current.width - BASKET_WIDTH));
        };

        const handleTouchMove = (e: TouchEvent) => {
            if (gameState !== "playing" || !canvasRef.current) return;
            const rect = canvasRef.current.getBoundingClientRect();
            const touch = e.touches[0];
            const x = touch.clientX - rect.left - BASKET_WIDTH / 2;
            basketPos.current.x = Math.max(0, Math.min(x, canvasRef.current.width - BASKET_WIDTH));
        };

        window.addEventListener("mousemove", handleMouseMove);
        window.addEventListener("touchmove", handleTouchMove, { passive: false });
        return () => {
            window.removeEventListener("mousemove", handleMouseMove);
            window.removeEventListener("touchmove", handleTouchMove);
        };
    }, [gameState]);

    // --- Game Loop ---
    const startGame = () => {
        setGameState("playing");
        setScore(0);
        scoreRef.current = 0;
        setTimeLeft(60);
        items.current = [];
        lastSpawn.current = performance.now();

        if (canvasRef.current) {
            basketPos.current = { x: canvasRef.current.width / 2 - BASKET_WIDTH / 2, y: canvasRef.current.height - BASKET_HEIGHT - 20 };
        }

        requestRef.current = requestAnimationFrame(gameLoop);
    };

    const gameOver = () => {
        setGameState("gameover");
        if (requestRef.current) cancelAnimationFrame(requestRef.current);
        if (scoreRef.current > highScore) {
            setHighScore(scoreRef.current);
            localStorage.setItem("asset_allocator_highscore", scoreRef.current.toString());
        }

        // Luxury Confetti
        confetti({
            particleCount: 200,
            spread: 100,
            origin: { y: 0.6 },
            colors: ['#FFD700', '#CBA577', '#ffffff']
        });
    };

    useEffect(() => {
        const saved = localStorage.getItem("asset_allocator_highscore");
        if (saved) setHighScore(parseInt(saved, 10));
    }, []);

    // Timer
    useEffect(() => {
        if (gameState !== "playing") return;
        const timer = setInterval(() => {
            setTimeLeft((prev) => {
                if (prev <= 1) {
                    gameOver();
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
        return () => clearInterval(timer);
    }, [gameState]);

    const gameLoop = (time: number) => {
        if (!canvasRef.current) return;
        const canvas = canvasRef.current;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        // 1. Clear & Background (Luxury Felt)
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // 2. Spawn Items
        if (time - lastSpawn.current > 600) { // Spawn rate
            const width = canvas.width;
            const typeRand = Math.random();
            let type: "coin" | "diamond" | "bomb" | "goldbar" = "coin";

            if (typeRand > 0.9) type = "diamond";
            else if (typeRand > 0.8) type = "goldbar";
            else if (typeRand > 0.6) type = "bomb";

            items.current.push({
                id: Math.random(),
                x: Math.random() * (width - ITEM_SIZE),
                y: -ITEM_SIZE,
                type,
                speed: 3 + Math.random() * 3, // Random speed
                rotation: 0,
            });
            lastSpawn.current = time;
        }

        // 3. Update & Draw Items
        for (let i = items.current.length - 1; i >= 0; i--) {
            const item = items.current[i];
            item.y += item.speed;
            item.rotation += 0.05;

            // Draw Item
            ctx.save();
            ctx.translate(item.x + ITEM_SIZE / 2, item.y + ITEM_SIZE / 2);
            ctx.rotate(item.rotation);
            ctx.font = "40px serif";
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            ctx.fillText(ASSET_TYPES[item.type].icon, 0, 0);

            // Glow effect for premium items
            if (item.type === 'diamond' || item.type === 'goldbar') {
                ctx.shadowColor = ASSET_TYPES[item.type].color;
                ctx.shadowBlur = 20;
            }

            ctx.restore();

            // Collision Detection
            const buffer = 10; // Hitbox forgiveness
            if (
                item.y + ITEM_SIZE - buffer >= basketPos.current.y &&
                item.y + buffer <= basketPos.current.y + BASKET_HEIGHT &&
                item.x + ITEM_SIZE - buffer >= basketPos.current.x &&
                item.x + buffer <= basketPos.current.x + BASKET_WIDTH
            ) {
                // HIT
                scoreRef.current += ASSET_TYPES[item.type].score;
                setScore(scoreRef.current);
                items.current.splice(i, 1);

                // Visual feedback (flash basket) - simplified for canvas
                continue;
            }

            // Missed / Out of bounds
            if (item.y > canvas.height) {
                items.current.splice(i, 1);
            }
        }

        // 4. Draw Basket (Luxury Briefcase)
        ctx.font = "80px serif";
        ctx.textAlign = "center";
        ctx.textBaseline = "top";
        ctx.shadowColor = "rgba(0,0,0,0.5)";
        ctx.shadowBlur = 15;
        ctx.shadowOffsetY = 10;
        ctx.fillText("💼", basketPos.current.x + BASKET_WIDTH / 2, basketPos.current.y);
        ctx.shadowBlur = 0; // Reset

        if (gameState === "playing") {
            requestRef.current = requestAnimationFrame(gameLoop);
        }
    };

    // Resize Handler
    useEffect(() => {
        const handleResize = () => {
            if (canvasRef.current) {
                canvasRef.current.width = window.innerWidth > 600 ? 600 : window.innerWidth - 32;
                canvasRef.current.height = window.innerHeight * 0.7;
                // Reset basket pos if needed
            }
        };
        window.addEventListener("resize", handleResize);
        handleResize();
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    return (
        <main className="min-h-screen bg-[#1c1917] flex flex-col items-center justify-center p-4 relative overflow-hidden">
            {/* Background Texture (Leather/Velvet) */}
            <div className="absolute inset-0 opacity-20 pointer-events-none"
                style={{ backgroundImage: `url("https://www.transparenttextures.com/patterns/dark-leather.png")` }} />

            {/* Gold Trim Border */}
            <div className="absolute inset-4 border-2 border-[#CBA577]/20 rounded-[3rem] pointer-events-none z-0" />

            <div className="relative z-10 w-full max-w-2xl flex flex-col items-center gap-6">

                {/* HUD */}
                <div className="w-full flex justify-between items-center px-6 py-4 bg-[#292524]/80 backdrop-blur-md rounded-2xl border border-[#CBA577]/30 shadow-2xl">
                    <div className="flex flex-col">
                        <span className="text-xs text-[#CBA577] font-bold tracking-widest uppercase">Net Worth</span>
                        <span className="text-3xl font-serif font-black text-white tabular-nums">
                            ${score.toLocaleString()}
                        </span>
                    </div>

                    <div className="flex flex-col items-center">
                        <div className="text-4xl font-black text-white drop-shadow-[0_0_10px_rgba(203,165,119,0.5)]">
                            {timeLeft}
                        </div>
                        <span className="text-[10px] text-stone-500 uppercase font-bold">Seconds Left</span>
                    </div>

                    <div className="flex flex-col items-end">
                        <span className="text-xs text-[#CBA577] font-bold tracking-widest uppercase">High Score</span>
                        <span className="text-lg font-serif font-bold text-stone-400 tabular-nums">
                            ${highScore.toLocaleString()}
                        </span>
                    </div>
                </div>

                {/* Game Canvas Container */}
                <div className="relative rounded-3xl overflow-hidden shadow-2xl border-4 border-[#292524] bg-[#0c0a09]">
                    {/* Canvas Background (Felt Table) */}
                    <div className="absolute inset-0 bg-emerald-900/20 radial-gradient(circle at center, rgba(38, 89, 76, 0.4) 0%, rgba(12, 10, 9, 0.8) 100%)" />

                    <canvas
                        ref={canvasRef}
                        className="block relative z-10 touch-none cursor-none"
                    />

                    {/* Start Overlay */}
                    {gameState === "start" && (
                        <div className="absolute inset-0 z-20 bg-black/60 backdrop-blur-sm flex flex-col items-center justify-center p-8 text-center">
                            <h1 className="text-6xl font-serif font-bold text-transparent bg-clip-text bg-gradient-to-b from-[#FDE68A] to-[#CBA577] mb-2 drop-shadow-sm">
                                ASSET RUN
                            </h1>
                            <p className="text-stone-300 mb-8 font-serif italic text-lg opacity-80">
                                "Catch the Gems, Avoid the Debt"
                            </p>

                            <div className="grid grid-cols-2 gap-4 mb-10 max-w-xs w-full">
                                <div className="flex items-center gap-2 text-sm text-stone-400">
                                    <span className="text-2xl">💎</span> <span className="font-bold text-white">+50</span>
                                </div>
                                <div className="flex items-center gap-2 text-sm text-stone-400">
                                    <span className="text-2xl">🧈</span> <span className="font-bold text-white">+30</span>
                                </div>
                                <div className="flex items-center gap-2 text-sm text-stone-400">
                                    <span className="text-2xl">🪙</span> <span className="font-bold text-white">+10</span>
                                </div>
                                <div className="flex items-center gap-2 text-sm text-stone-400">
                                    <span className="text-2xl">💣</span> <span className="font-bold text-red-400">-20</span>
                                </div>
                            </div>

                            <button
                                onClick={startGame}
                                className="bg-[#CBA577] hover:bg-[#B59164] text-black font-bold text-xl px-12 py-8 rounded-full shadow-[0_0_30px_rgba(203,165,119,0.4)] transition-all hover:scale-105 flex items-center justify-center"
                            >
                                <Play className="fill-black mr-2 w-6 h-6" /> PLAY NOW
                            </button>
                        </div>
                    )}

                    {/* Game Over Overlay */}
                    {gameState === "gameover" && (
                        <div className="absolute inset-0 z-20 bg-black/80 backdrop-blur-md flex flex-col items-center justify-center p-8 text-center">
                            <Trophy className="w-20 h-20 text-[#CBA577] mb-6 drop-shadow-[0_0_20px_rgba(203,165,119,0.5)]" />
                            <h2 className="text-4xl font-serif font-bold text-white mb-2">SESSION CLOSED</h2>
                            <p className="text-stone-400 mb-8 uppercase tracking-widest text-xs font-bold">Final Net Worth</p>

                            <div className="text-7xl font-serif font-black text-transparent bg-clip-text bg-gradient-to-b from-white to-stone-400 mb-12">
                                ${score.toLocaleString()}
                            </div>

                            <div className="flex gap-4">
                                <button
                                    onClick={startGame}
                                    className="bg-[#CBA577] hover:bg-[#B59164] text-black font-bold rounded-full px-8 py-3 flex items-center justify-center transition-all"
                                >
                                    <RotateCcw className="mr-2 h-5 w-5" /> REPLAY
                                </button>
                                <button
                                    onClick={() => window.location.href = '/'}
                                    className="border border-stone-700 text-stone-300 hover:bg-stone-800 rounded-full px-8 py-3 transition-all"
                                >
                                    EXIT
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {/* Controls Hint */}
                {gameState === "playing" && (
                    <div className="flex items-center gap-6 text-stone-500 text-xs font-bold uppercase tracking-widest opacity-50">
                        <div className="flex items-center gap-2">
                            <Monitor className="w-4 h-4" /> Move Mouse
                        </div>
                        <div className="w-px h-4 bg-stone-700" />
                        <div className="flex items-center gap-2">
                            <Smartphone className="w-4 h-4" /> Drag Finger
                        </div>
                    </div>
                )}
            </div>
        </main>
    );
}
