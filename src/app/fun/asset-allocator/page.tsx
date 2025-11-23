"use client";

import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Play, RotateCcw, Share2, Trophy, Wallet } from "lucide-react";
import AdUnit from "@/components/AdUnit";

// Game Constants
const GAME_DURATION = 60;
const SPAWN_RATE = 500; // ms
const GRAVITY = 0.2;
const BASKET_WIDTH = 80;
const BASKET_HEIGHT = 80;

type ItemType = "gold" | "cash" | "stock" | "house" | "tax" | "scam";

const ITEMS: Record<ItemType, { emoji: string; value: number; speed: number; weight: number }> = {
    gold: { emoji: "🥇", value: 100, speed: 3, weight: 30 },
    cash: { emoji: "💵", value: 50, speed: 4, weight: 40 },
    stock: { emoji: "📈", value: 150, speed: 5, weight: 20 },
    house: { emoji: "🏠", value: 500, speed: 6, weight: 5 },
    tax: { emoji: "📉", value: -100, speed: 4, weight: 20 },
    scam: { emoji: "💣", value: -300, speed: 5, weight: 10 },
};

export default function AssetAllocatorGame() {
    const [gameState, setGameState] = useState<"start" | "playing" | "gameover">("start");
    const [score, setScore] = useState(0);
    const [timeLeft, setTimeLeft] = useState(GAME_DURATION);
    const [highScore, setHighScore] = useState(0);

    const canvasRef = useRef<HTMLCanvasElement>(null);
    const requestRef = useRef<number>();
    const gameStateRef = useRef<"start" | "playing" | "gameover">("start");
    const basketRef = useRef({ x: 0 });
    const itemsRef = useRef<{ x: number; y: number; type: ItemType; vy: number }[]>([]);
    const lastSpawnTime = useRef(0);
    const scoreRef = useRef(0);

    // Sync ref
    useEffect(() => {
        gameStateRef.current = gameState;
    }, [gameState]);

    // Load high score
    useEffect(() => {
        const saved = localStorage.getItem("assetAllocatorHighScore");
        if (saved) setHighScore(parseInt(saved));
    }, []);

    // Timer
    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (gameState === "playing") {
            interval = setInterval(() => {
                setTimeLeft((prev) => {
                    if (prev <= 1) {
                        gameOver();
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [gameState]);

    // Mouse/Touch Move
    const handleMove = (clientX: number) => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const rect = canvas.getBoundingClientRect();
        const x = clientX - rect.left;
        basketRef.current.x = Math.max(BASKET_WIDTH / 2, Math.min(canvas.width - BASKET_WIDTH / 2, x));
    };

    const update = (time: number) => {
        if (gameStateRef.current !== "playing") return;

        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        // Clear
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Spawn Items
        if (time - lastSpawnTime.current > SPAWN_RATE) {
            const random = Math.random() * 100;
            let cumulativeWeight = 0;
            let selectedType: ItemType = "cash";

            // Weighted random selection
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
                x: Math.random() * (canvas.width - 40) + 20,
                y: -50,
                type: selectedType,
                vy: ITEMS[selectedType].speed
            });
            lastSpawnTime.current = time;
        }

        // Update Items
        itemsRef.current.forEach((item, index) => {
            item.y += item.vy;

            // Draw Item
            ctx.font = "30px Arial";
            ctx.textAlign = "center";
            ctx.fillText(ITEMS[item.type].emoji, item.x, item.y);

            // Collision with Basket
            const basketY = canvas.height - BASKET_HEIGHT;
            const basketX = basketRef.current.x;

            // Simple box collision
            if (
                item.y > basketY &&
                item.y < canvas.height &&
                item.x > basketX - BASKET_WIDTH / 2 &&
                item.x < basketX + BASKET_WIDTH / 2
            ) {
                // Caught!
                scoreRef.current += ITEMS[item.type].value;
                setScore(scoreRef.current);

                // Show floating text (visual only, simplified)
                ctx.fillStyle = ITEMS[item.type].value > 0 ? "#22c55e" : "#ef4444";
                ctx.font = "bold 20px Arial";
                ctx.fillText(ITEMS[item.type].value > 0 ? `+${ITEMS[item.type].value}` : `${ITEMS[item.type].value}`, item.x, item.y - 20);

                itemsRef.current.splice(index, 1);
            }
        });

        // Remove off-screen
        itemsRef.current = itemsRef.current.filter(item => item.y < canvas.height + 50);

        // Draw Basket
        const basketX = basketRef.current.x;
        const basketY = canvas.height - BASKET_HEIGHT;

        ctx.font = "60px Arial";
        ctx.textAlign = "center";
        ctx.fillText("🧺", basketX, basketY + 50);

        if (gameStateRef.current === "playing") {
            requestRef.current = requestAnimationFrame(update);
        }
    };

    const startGame = () => {
        setGameState("playing");
        gameStateRef.current = "playing";
        setScore(0);
        scoreRef.current = 0;
        setTimeLeft(GAME_DURATION);
        itemsRef.current = [];
        lastSpawnTime.current = performance.now();
        requestRef.current = requestAnimationFrame(update);
    };

    const gameOver = () => {
        setGameState("gameover");
        gameStateRef.current = "gameover";
        if (requestRef.current) cancelAnimationFrame(requestRef.current);

        if (scoreRef.current > highScore) {
            setHighScore(scoreRef.current);
            localStorage.setItem("assetAllocatorHighScore", scoreRef.current.toString());
        }
    };

    return (
        <main className="w-full min-h-screen bg-slate-900 flex flex-col items-center justify-center p-4 overflow-hidden touch-none">
            <div className="max-w-md w-full space-y-6">
                <div className="text-center">
                    <h1 className="text-4xl font-black text-white mb-2 tracking-tight">
                        ASSET <span className="text-green-500">ALLOCATOR</span>
                    </h1>
                    <p className="text-slate-400">떨어지는 자산을 바구니에 담으세요!</p>
                </div>

                <div className="relative bg-slate-800 rounded-2xl overflow-hidden shadow-2xl border-4 border-slate-700">
                    {/* Header Info */}
                    <div className="absolute top-0 left-0 w-full p-4 flex justify-between items-center z-10 bg-gradient-to-b from-black/50 to-transparent">
                        <div className="text-white font-bold text-xl">
                            💰 {score.toLocaleString()}
                        </div>
                        <div className={`font-black text-2xl ${timeLeft < 10 ? 'text-red-500 animate-pulse' : 'text-white'}`}>
                            ⏳ {timeLeft}s
                        </div>
                    </div>

                    <canvas
                        ref={canvasRef}
                        width={400}
                        height={600}
                        onMouseMove={(e) => handleMove(e.clientX)}
                        onTouchMove={(e) => handleMove(e.touches[0].clientX)}
                        className="w-full h-auto bg-slate-900 cursor-none"
                    />

                    {/* Start Screen */}
                    {gameState === "start" && (
                        <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center text-white p-8 text-center backdrop-blur-sm">
                            <Wallet className="w-16 h-16 text-green-400 mb-4" />
                            <h2 className="text-2xl font-bold mb-2">자산 배분 게임</h2>
                            <p className="text-slate-300 mb-8">
                                마우스를 움직여 좋은 자산을 담고<br />
                                세금과 폭탄은 피하세요!
                            </p>
                            <div className="grid grid-cols-2 gap-4 text-sm mb-8 text-left bg-slate-800/80 p-4 rounded-xl">
                                <div>🥇 금: +100</div>
                                <div>💵 현금: +50</div>
                                <div>📈 주식: +150</div>
                                <div>🏠 부동산: +500</div>
                                <div className="text-red-400">📉 세금: -100</div>
                                <div className="text-red-400">💣 사기: -300</div>
                            </div>
                            <button
                                onClick={startGame}
                                className="px-8 py-4 bg-green-500 hover:bg-green-600 text-white rounded-xl font-bold text-xl transition-colors flex items-center gap-2"
                            >
                                <Play className="w-6 h-6 fill-current" />
                                게임 시작
                            </button>
                        </div>
                    )}

                    {/* Game Over Screen */}
                    {gameState === "gameover" && (
                        <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center text-white p-8 text-center backdrop-blur-sm">
                            <h2 className="text-4xl font-black text-white mb-2">GAME OVER</h2>
                            <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 mb-6 w-full">
                                <div className="flex justify-between items-center mb-2">
                                    <span className="text-slate-400">최종 자산</span>
                                    <span className="text-2xl font-bold text-green-400">{score.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-slate-400">최고 기록</span>
                                    <span className="text-2xl font-bold text-yellow-400">{highScore.toLocaleString()}</span>
                                </div>
                            </div>

                            <div className="flex gap-3 w-full">
                                <button
                                    onClick={startGame}
                                    className="flex-1 py-3 bg-green-500 hover:bg-green-600 rounded-xl font-bold transition-colors flex items-center justify-center gap-2"
                                >
                                    <RotateCcw className="w-5 h-5" />
                                    다시하기
                                </button>
                                <button
                                    className="flex-1 py-3 bg-slate-700 hover:bg-slate-600 rounded-xl font-bold transition-colors flex items-center justify-center gap-2"
                                    onClick={() => {
                                        if (navigator.share) {
                                            navigator.share({
                                                title: 'Asset Allocator',
                                                text: `나는 60초 동안 ${score.toLocaleString()}원을 벌었습니다! 당신의 실력은?`,
                                                url: window.location.href
                                            });
                                        } else {
                                            alert("공유하기를 지원하지 않는 브라우저입니다.");
                                        }
                                    }}
                                >
                                    <Share2 className="w-5 h-5" />
                                    공유하기
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {/* Ad Unit */}
                <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700">
                    <AdUnit slotId="9988776655" format="rectangle" label="Game Bottom Ad" />
                </div>
            </div>
        </main>
    );
}
