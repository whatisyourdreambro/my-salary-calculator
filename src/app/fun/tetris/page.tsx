"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, ArrowRight, ArrowDown, RotateCw, RefreshCw, Play, Pause, Trophy, Share2 } from "lucide-react";
import AdUnit from "@/components/AdUnit";

// --- Game Constants & Types ---
const ROWS = 20;
const COLS = 10;
const BLOCK_SIZE = 30; // Base size, responsive via CSS
const TICK_RATE_MS = 800; // Initial speed
const SPEED_INCREMENT = 0.95; // Speed multiplier per level

type TetrominoType = 'I' | 'O' | 'T' | 'S' | 'Z' | 'J' | 'L';
type Cell = { type: TetrominoType | null; locked: boolean };
type Grid = Cell[][];

const TETROMINOS: Record<TetrominoType, { shape: number[][]; color: string }> = {
    I: { shape: [[1, 1, 1, 1]], color: "bg-cyan-400 shadow-[0_0_10px_rgba(34,211,238,0.8)]" },
    O: { shape: [[1, 1], [1, 1]], color: "bg-yellow-400 shadow-[0_0_10px_rgba(250,204,21,0.8)]" },
    T: { shape: [[0, 1, 0], [1, 1, 1]], color: "bg-purple-500 shadow-[0_0_10px_rgba(168,85,247,0.8)]" },
    S: { shape: [[0, 1, 1], [1, 1, 0]], color: "bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.8)]" },
    Z: { shape: [[1, 1, 0], [0, 1, 1]], color: "bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.8)]" },
    J: { shape: [[1, 0, 0], [1, 1, 1]], color: "bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.8)]" },
    L: { shape: [[0, 0, 1], [1, 1, 1]], color: "bg-orange-500 shadow-[0_0_10px_rgba(249,115,22,0.8)]" },
};

const createEmptyGrid = (): Grid =>
    Array.from({ length: ROWS }, () => Array(COLS).fill({ type: null, locked: false }));

// --- Helper Functions ---
const getRandomTetromino = (): { type: TetrominoType; shape: number[][] } => {
    const types: TetrominoType[] = ['I', 'O', 'T', 'S', 'Z', 'J', 'L'];
    const type = types[Math.floor(Math.random() * types.length)];
    return { type, shape: TETROMINOS[type].shape };
};

export default function TetrisPage() {
    // --- State ---
    const [grid, setGrid] = useState<Grid>(createEmptyGrid());
    const [activePiece, setActivePiece] = useState<{ type: TetrominoType; shape: number[][]; x: number; y: number } | null>(null);
    const [score, setScore] = useState(0);
    const [level, setLevel] = useState(1);
    const [gameOver, setGameOver] = useState(false);
    const [isPlaying, setIsPlaying] = useState(false);
    const [highScore, setHighScore] = useState(0);

    const gameLoopRef = useRef<NodeJS.Timeout | null>(null);

    // --- Initialization ---
    useEffect(() => {
        const savedHighScore = localStorage.getItem("tetris_highscore");
        if (savedHighScore) setHighScore(parseInt(savedHighScore, 10));
    }, []);

    useEffect(() => {
        if (score > highScore) {
            setHighScore(score);
            localStorage.setItem("tetris_highscore", score.toString());
        }
    }, [score, highScore]);

    // --- Game Logic ---
    const spawnPiece = useCallback(() => {
        const { type, shape } = getRandomTetromino();
        setActivePiece({
            type,
            shape,
            x: Math.floor(COLS / 2) - Math.floor(shape[0].length / 2),
            y: 0,
        });
    }, []);

    const checkCollision = (piece: typeof activePiece, moveX = 0, moveY = 0, rotatedShape?: number[][]) => {
        if (!piece) return false;
        const shape = rotatedShape || piece.shape;

        for (let r = 0; r < shape.length; r++) {
            for (let c = 0; c < shape[r].length; c++) {
                if (shape[r][c]) {
                    const newX = piece.x + c + moveX;
                    const newY = piece.y + r + moveY;

                    if (newX < 0 || newX >= COLS || newY >= ROWS) return true; // Wall/Floor collision
                    if (newY >= 0 && grid[newY][newX].locked) return true; // Block collision
                }
            }
        }
        return false;
    };

    const lockPiece = useCallback(() => {
        if (!activePiece) return;

        const newGrid = [...grid];
        activePiece.shape.forEach((row, r) => {
            row.forEach((cell, c) => {
                if (cell) {
                    const y = activePiece.y + r;
                    const x = activePiece.x + c;
                    if (y >= 0 && y < ROWS && x >= 0 && x < COLS) {
                        newGrid[y][x] = { type: activePiece.type, locked: true };
                    }
                }
            });
        });

        // Clear Lines
        let linesCleared = 0;
        for (let r = ROWS - 1; r >= 0; r--) {
            if (newGrid[r].every(cell => cell.locked)) {
                newGrid.splice(r, 1);
                newGrid.unshift(Array(COLS).fill({ type: null, locked: false }));
                linesCleared++;
                r++; // Check same row index again
            }
        }

        if (linesCleared > 0) {
            setScore(prev => prev + (linesCleared * 100 * level));
            setLevel(prev => Math.floor((prev * 10 + linesCleared) / 10) || 1);
        }

        setGrid(newGrid);
        setActivePiece(null); // Trigger spawn next tick

        // Check Game Over
        if (activePiece.y <= 0) {
            setGameOver(true);
            setIsPlaying(false);
        }
    }, [activePiece, grid, level]);

    const move = useCallback((dirX: number, dirY: number) => {
        if (!activePiece || gameOver || !isPlaying) return;

        if (!checkCollision(activePiece, dirX, dirY)) {
            setActivePiece(prev => prev ? { ...prev, x: prev.x + dirX, y: prev.y + dirY } : null);
        } else if (dirY > 0) {
            lockPiece(); // Lock if hitting bottom
        }
    }, [activePiece, gameOver, isPlaying, checkCollision, lockPiece]);

    const rotate = useCallback(() => {
        if (!activePiece || gameOver || !isPlaying) return;

        const rotatedShape = activePiece.shape[0].map((_, index) =>
            activePiece.shape.map(row => row[index]).reverse()
        );

        if (!checkCollision(activePiece, 0, 0, rotatedShape)) {
            setActivePiece(prev => prev ? { ...prev, shape: rotatedShape } : null);
        }
    }, [activePiece, gameOver, isPlaying, checkCollision]);

    // --- Game Loop ---
    useEffect(() => {
        if (!isPlaying || gameOver) {
            if (gameLoopRef.current) clearInterval(gameLoopRef.current);
            return;
        }

        if (!activePiece) {
            spawnPiece();
            return;
        }

        const speed = Math.max(100, TICK_RATE_MS * Math.pow(SPEED_INCREMENT, level - 1));
        gameLoopRef.current = setInterval(() => {
            move(0, 1);
        }, speed);

        return () => {
            if (gameLoopRef.current) clearInterval(gameLoopRef.current);
        };
    }, [isPlaying, gameOver, activePiece, level, move, spawnPiece]);

    // --- Controls ---
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (!isPlaying || gameOver) return;

            switch (e.key) {
                case "ArrowLeft": move(-1, 0); break;
                case "ArrowRight": move(1, 0); break;
                case "ArrowDown": move(0, 1); break;
                case "ArrowUp": rotate(); break;
                case " ": rotate(); break; // Space to rotate
            }
        };

        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [isPlaying, gameOver, move, rotate]);

    const startGame = () => {
        setGrid(createEmptyGrid());
        setScore(0);
        setLevel(1);
        setGameOver(false);
        setIsPlaying(true);
        setActivePiece(null);
    };

    const handleShare = () => {
        const text = `직장인 테트리스! 내 야근 점수는 ${score}점! 🏢 #Moneysalary #Tetris`;
        if (navigator.share) {
            navigator.share({ title: "Salaryman Tetris", text, url: window.location.href });
        } else {
            navigator.clipboard.writeText(`${text}\n${window.location.href}`);
            alert("점수가 복사되었습니다!");
        }
    };

    // --- Rendering ---
    // Merge active piece into grid for rendering
    const displayGrid = grid.map(row => [...row]);
    if (activePiece) {
        activePiece.shape.forEach((row, r) => {
            row.forEach((cell, c) => {
                if (cell) {
                    const y = activePiece.y + r;
                    const x = activePiece.x + c;
                    if (y >= 0 && y < ROWS && x >= 0 && x < COLS) {
                        displayGrid[y][x] = { type: activePiece.type, locked: false };
                    }
                }
            });
        });
    }

    return (
        <main className="w-full min-h-screen bg-slate-950 text-white overflow-hidden relative font-mono">
            {/* Cyberpunk Background */}
            <div className="absolute inset-0 z-0 pointer-events-none">
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#4f4f4f2e_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f2e_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />
                <div className="absolute top-0 left-0 right-0 h-[500px] bg-gradient-to-b from-purple-500/10 via-blue-500/5 to-transparent blur-3xl" />
            </div>

            <div className="relative z-10 max-w-5xl mx-auto px-4 py-8 flex flex-col lg:flex-row gap-8 items-center lg:items-start justify-center h-full">

                {/* Left Panel: Stats & Info */}
                <div className="w-full lg:w-64 flex flex-col gap-4 order-2 lg:order-1">
                    <div className="bg-slate-900/80 backdrop-blur-md border border-slate-700 p-6 rounded-2xl shadow-xl">
                        <h1 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-400 mb-6 tracking-tighter">
                            SALARYMAN<br />BLOCKS
                        </h1>

                        <div className="space-y-4">
                            <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700/50">
                                <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">Score</p>
                                <p className="text-3xl font-bold text-cyan-400">{score.toLocaleString()}</p>
                            </div>
                            <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700/50">
                                <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">Level</p>
                                <p className="text-2xl font-bold text-purple-400">{level}</p>
                            </div>
                            <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700/50 flex items-center gap-3">
                                <Trophy className="w-5 h-5 text-yellow-500" />
                                <div>
                                    <p className="text-xs text-slate-400 uppercase tracking-wider">Best</p>
                                    <p className="text-xl font-bold text-yellow-500">{highScore.toLocaleString()}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Desktop Controls Hint */}
                    <div className="hidden lg:block bg-slate-900/50 p-4 rounded-xl border border-slate-800 text-xs text-slate-400 space-y-2">
                        <p className="flex justify-between"><span>Move</span> <span>⬅️ ➡️</span></p>
                        <p className="flex justify-between"><span>Rotate</span> <span>⬆️ / Space</span></p>
                        <p className="flex justify-between"><span>Drop</span> <span>⬇️</span></p>
                    </div>
                </div>

                {/* Center: Game Board */}
                <div className="relative order-1 lg:order-2">
                    <div className="relative bg-slate-900 border-4 border-slate-700 rounded-lg shadow-2xl overflow-hidden">
                        {/* Grid */}
                        <div
                            className="grid grid-cols-10 grid-rows-20 gap-[1px] bg-slate-800/50"
                            style={{ width: '300px', height: '600px' }}
                        >
                            {displayGrid.map((row, r) =>
                                row.map((cell, c) => (
                                    <div
                                        key={`${r}-${c}`}
                                        className={`w-full h-full transition-colors duration-75 ${cell.type ? TETROMINOS[cell.type].color : 'bg-slate-900/90'
                                            } ${cell.locked ? 'brightness-90' : ''}`}
                                    />
                                ))
                            )}
                        </div>

                        {/* Overlay: Start / Game Over */}
                        <AnimatePresence>
                            {(!isPlaying || gameOver) && (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm flex flex-col items-center justify-center z-20 p-6 text-center"
                                >
                                    {gameOver ? (
                                        <>
                                            <h2 className="text-4xl font-black text-red-500 mb-2">GAME OVER</h2>
                                            <p className="text-slate-300 mb-6">야근 확정! 다시 도전하세요.</p>
                                            <p className="text-2xl font-bold text-white mb-8">Score: {score}</p>

                                            <div className="w-full max-w-[280px] mb-6">
                                                <AdUnit slotId="9988776655" format="rectangle" label="Tetris Game Over" />
                                            </div>

                                            <div className="flex gap-4">
                                                <button
                                                    onClick={startGame}
                                                    className="p-4 bg-cyan-500 hover:bg-cyan-400 text-slate-900 rounded-full font-bold shadow-lg shadow-cyan-500/20 transition-all hover:scale-110"
                                                >
                                                    <RefreshCw size={24} />
                                                </button>
                                                <button
                                                    onClick={handleShare}
                                                    className="p-4 bg-slate-700 hover:bg-slate-600 text-white rounded-full font-bold shadow-lg transition-all hover:scale-110"
                                                >
                                                    <Share2 size={24} />
                                                </button>
                                            </div>
                                        </>
                                    ) : (
                                        <>
                                            <h2 className="text-3xl font-black text-white mb-8">READY?</h2>
                                            <button
                                                onClick={startGame}
                                                className="group relative px-8 py-4 bg-cyan-500 hover:bg-cyan-400 text-slate-900 rounded-xl font-black text-xl shadow-[0_0_20px_rgba(34,211,238,0.5)] transition-all hover:scale-105 overflow-hidden"
                                            >
                                                <span className="relative z-10 flex items-center gap-2">
                                                    <Play fill="currentColor" /> START GAME
                                                </span>
                                                <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                                            </button>
                                        </>
                                    )}
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>

                {/* Right Panel: Mobile Controls (Visible on Mobile/Tablet) */}
                <div className="w-full max-w-[300px] lg:hidden order-3 grid grid-cols-3 gap-4 p-4">
                    <div className="col-start-2">
                        <button
                            className="w-full aspect-square bg-slate-800/80 border border-slate-600 rounded-2xl flex items-center justify-center active:bg-cyan-500/20 active:border-cyan-500 transition-all"
                            onClick={() => rotate()}
                        >
                            <RotateCw className="w-8 h-8" />
                        </button>
                    </div>
                    <div className="col-start-1 row-start-2">
                        <button
                            className="w-full aspect-square bg-slate-800/80 border border-slate-600 rounded-2xl flex items-center justify-center active:bg-cyan-500/20 active:border-cyan-500 transition-all"
                            onClick={() => move(-1, 0)}
                        >
                            <ArrowLeft className="w-8 h-8" />
                        </button>
                    </div>
                    <div className="col-start-2 row-start-2">
                        <button
                            className="w-full aspect-square bg-slate-800/80 border border-slate-600 rounded-2xl flex items-center justify-center active:bg-cyan-500/20 active:border-cyan-500 transition-all"
                            onClick={() => move(0, 1)}
                        >
                            <ArrowDown className="w-8 h-8" />
                        </button>
                    </div>
                    <div className="col-start-3 row-start-2">
                        <button
                            className="w-full aspect-square bg-slate-800/80 border border-slate-600 rounded-2xl flex items-center justify-center active:bg-cyan-500/20 active:border-cyan-500 transition-all"
                            onClick={() => move(1, 0)}
                        >
                            <ArrowRight className="w-8 h-8" />
                        </button>
                    </div>
                </div>

                {/* Right Panel: Ad (Desktop) */}
                <div className="hidden lg:block w-64 order-3">
                    <AdUnit slotId="1122334455" format="vertical" label="Tetris Side Ad" />
                </div>

            </div>
        </main>
    );
}
