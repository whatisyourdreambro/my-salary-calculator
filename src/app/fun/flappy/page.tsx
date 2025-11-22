"use client";

import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Play, RotateCcw, Share2, Trophy } from "lucide-react";
import AdUnit from "@/components/AdUnit";

// Game Constants
const GRAVITY = 0.6;
const JUMP_STRENGTH = -10;
const OBSTACLE_SPEED = 3;
const OBSTACLE_SPAWN_RATE = 2000; // ms
const GAP_SIZE = 150;

export default function FlappyGamePage() {
    const [gameState, setGameState] = useState<"start" | "playing" | "gameover">("start");
    const [score, setScore] = useState(0);
    const [highScore, setHighScore] = useState(0);

    const canvasRef = useRef<HTMLCanvasElement>(null);
    const requestRef = useRef<number>();
    const gameStateRef = useRef<"start" | "playing" | "gameover">("start"); // Ref for loop access
    const birdRef = useRef({ x: 50, y: 300, velocity: 0, size: 30 });
    const obstaclesRef = useRef<{ x: number; topHeight: number; passed: boolean }[]>([]);
    const lastSpawnTime = useRef(0);
    const scoreRef = useRef(0); // Ref for score to avoid closure issues in loop if needed

    // Sync ref with state
    useEffect(() => {
        gameStateRef.current = gameState;
    }, [gameState]);

    // Load high score
    useEffect(() => {
        const saved = localStorage.getItem("flappyHighScore");
        if (saved) setHighScore(parseInt(saved));
    }, []);

    // Game Loop
    const update = (time: number) => {
        if (gameStateRef.current !== "playing") return; // Stop if not playing

        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        // Clear canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Update Bird
        birdRef.current.velocity += GRAVITY;
        birdRef.current.y += birdRef.current.velocity;

        // Spawn Obstacles
        if (time - lastSpawnTime.current > OBSTACLE_SPAWN_RATE) {
            const minHeight = 50;
            const maxHeight = canvas.height - GAP_SIZE - minHeight;
            const topHeight = Math.random() * (maxHeight - minHeight) + minHeight;

            obstaclesRef.current.push({
                x: canvas.width,
                topHeight,
                passed: false
            });
            lastSpawnTime.current = time;
        }

        // Update & Draw Obstacles
        obstaclesRef.current.forEach((obs) => {
            obs.x -= OBSTACLE_SPEED;

            // Draw Top Obstacle (Tax Bill)
            ctx.fillStyle = "#ef4444"; // Red-500
            ctx.fillRect(obs.x, 0, 50, obs.topHeight);

            // Draw Bottom Obstacle (Inflation)
            ctx.fillStyle = "#f97316"; // Orange-500
            ctx.fillRect(obs.x, obs.topHeight + GAP_SIZE, 50, canvas.height - (obs.topHeight + GAP_SIZE));

            // Collision Detection
            const bird = birdRef.current;
            if (
                bird.y < obs.topHeight ||
                bird.y + bird.size > obs.topHeight + GAP_SIZE
            ) {
                if (bird.x + bird.size > obs.x && bird.x < obs.x + 50) {
                    gameOver();
                }
            }

            // Score Update
            if (!obs.passed && obs.x + 50 < 50) { // Bird x is fixed at 50
                obs.passed = true;
                scoreRef.current += 1;
                setScore(scoreRef.current);
            }
        });

        // Remove off-screen obstacles
        obstaclesRef.current = obstaclesRef.current.filter(obs => obs.x > -50);

        // Draw Bird (Salaryman)
        ctx.fillStyle = "#3b82f6"; // Blue-500
        ctx.beginPath();
        ctx.arc(50 + birdRef.current.size / 2, birdRef.current.y + birdRef.current.size / 2, birdRef.current.size / 2, 0, Math.PI * 2);
        ctx.fill();

        // Floor/Ceiling Collision
        if (birdRef.current.y > canvas.height || birdRef.current.y < 0) {
            gameOver();
        }

        if (gameStateRef.current === "playing") {
            requestRef.current = requestAnimationFrame(update);
        }
    };

    const startGame = () => {
        setGameState("playing");
        gameStateRef.current = "playing"; // Immediate update for loop
        setScore(0);
        scoreRef.current = 0;
        birdRef.current = { x: 50, y: 300, velocity: 0, size: 30 };
        obstaclesRef.current = [];
        lastSpawnTime.current = performance.now();
        requestRef.current = requestAnimationFrame(update);
    };

    const gameOver = () => {
        setGameState("gameover");
        gameStateRef.current = "gameover";
        if (requestRef.current) cancelAnimationFrame(requestRef.current);

        if (scoreRef.current > highScore) {
            setHighScore(scoreRef.current);
            localStorage.setItem("flappyHighScore", scoreRef.current.toString());
        }
    };

    const jump = () => {
        if (gameStateRef.current === "playing") {
            birdRef.current.velocity = JUMP_STRENGTH;
        }
    };

    useEffect(() => {
        const handleKeyPress = (e: KeyboardEvent) => {
            if (e.code === "Space") {
                e.preventDefault();
                if (gameStateRef.current === "playing") {
                    jump();
                } else {
                    startGame();
                }
            }
        };
        window.addEventListener("keydown", handleKeyPress);
        return () => window.removeEventListener("keydown", handleKeyPress);
    }, []);

    return (
        <main className="w-full min-h-screen bg-slate-900 flex flex-col items-center justify-center p-4 overflow-hidden">
            <div className="max-w-md w-full space-y-6">
                <div className="text-center">
                    <h1 className="text-4xl font-black text-white mb-2 tracking-tight">
                        FLAPPY <span className="text-blue-500">SALARYMAN</span>
                    </h1>
                    <p className="text-slate-400">세금과 물가를 피해 월급을 지켜라!</p>
                </div>

                <div className="relative bg-slate-800 rounded-2xl overflow-hidden shadow-2xl border-4 border-slate-700">
                    <canvas
                        ref={canvasRef}
                        width={400}
                        height={600}
                        onClick={jump}
                        className="w-full h-auto cursor-pointer bg-slate-900 touch-none"
                    />

                    {/* Score Overlay */}
                    {gameState === "playing" && (
                        <div className="absolute top-8 left-1/2 -translate-x-1/2 text-6xl font-black text-white/20 pointer-events-none select-none">
                            {score}
                        </div>
                    )}

                    {/* Start Screen */}
                    {gameState === "start" && (
                        <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center text-white p-8 text-center">
                            <Trophy className="w-16 h-16 text-yellow-400 mb-4" />
                            <h2 className="text-2xl font-bold mb-2">준비되셨나요?</h2>
                            <p className="text-slate-300 mb-8">화면을 터치하거나 스페이스바를 눌러 점프하세요.</p>
                            <button
                                onClick={startGame}
                                className="px-8 py-4 bg-blue-500 hover:bg-blue-600 text-white rounded-xl font-bold text-xl transition-colors flex items-center gap-2"
                            >
                                <Play className="w-6 h-6 fill-current" />
                                게임 시작
                            </button>
                        </div>
                    )}

                    {/* Game Over Screen */}
                    {gameState === "gameover" && (
                        <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center text-white p-8 text-center backdrop-blur-sm">
                            <h2 className="text-4xl font-black text-red-500 mb-2">GAME OVER</h2>
                            <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 mb-6 w-full">
                                <div className="flex justify-between items-center mb-2">
                                    <span className="text-slate-400">이번 기록</span>
                                    <span className="text-2xl font-bold">{score}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-slate-400">최고 기록</span>
                                    <span className="text-2xl font-bold text-yellow-400">{highScore}</span>
                                </div>
                            </div>

                            <div className="flex gap-3 w-full">
                                <button
                                    onClick={startGame}
                                    className="flex-1 py-3 bg-blue-500 hover:bg-blue-600 rounded-xl font-bold transition-colors flex items-center justify-center gap-2"
                                >
                                    <RotateCcw className="w-5 h-5" />
                                    다시하기
                                </button>
                                <button
                                    className="flex-1 py-3 bg-slate-700 hover:bg-slate-600 rounded-xl font-bold transition-colors flex items-center justify-center gap-2"
                                    onClick={() => {
                                        if (navigator.share) {
                                            navigator.share({
                                                title: 'Flappy Salaryman',
                                                text: `내 점수는 ${score}점! 세금을 피해 월급을 지켰습니다.`,
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
