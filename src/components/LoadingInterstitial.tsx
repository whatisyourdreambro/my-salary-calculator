"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import AdUnit from "./AdUnit";

interface LoadingInterstitialProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function LoadingInterstitial({ isOpen, onClose }: LoadingInterstitialProps) {
    const [progress, setProgress] = useState(0);

    useEffect(() => {
        if (isOpen) {
            setProgress(0);
            const interval = setInterval(() => {
                setProgress((prev) => {
                    if (prev >= 100) {
                        clearInterval(interval);
                        return 100;
                    }
                    return prev + 2; // 50 steps * 30ms = 1500ms approx
                });
            }, 30);

            const timer = setTimeout(() => {
                onClose();
            }, 1500);

            return () => {
                clearInterval(interval);
                clearTimeout(timer);
            };
        }
    }, [isOpen, onClose]);

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-background/95 backdrop-blur-xl"
                >
                    <div className="w-full max-w-md px-6 text-center space-y-8">
                        <div className="space-y-4">
                            <motion.div
                                animate={{
                                    scale: [1, 1.1, 1],
                                    opacity: [0.5, 1, 0.5],
                                }}
                                transition={{
                                    duration: 1.5,
                                    repeat: Infinity,
                                    ease: "easeInOut",
                                }}
                                className="w-24 h-24 mx-auto bg-primary/20 rounded-full flex items-center justify-center"
                            >
                                <div className="w-16 h-16 bg-primary rounded-full shadow-[0_0_30px_rgba(34,197,94,0.6)]" />
                            </motion.div>
                            <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-emerald-400">
                                AI가 최신 세법을 분석중입니다...
                            </h2>
                            <p className="text-muted-foreground">2025년 소득세율 및 4대보험료 적용 중</p>
                        </div>

                        {/* Progress Bar */}
                        <div className="w-full h-2 bg-secondary rounded-full overflow-hidden">
                            <motion.div
                                className="h-full bg-primary"
                                style={{ width: `${progress}%` }}
                            />
                        </div>

                        {/* Premium Ad Slot (300x250) */}
                        <div className="flex justify-center py-4">
                            <div className="relative">
                                <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-background/80 px-3 py-1 rounded-full border border-border text-[10px] text-muted-foreground">
                                    SPONSORED
                                </div>
                                <AdUnit
                                    slotId="8923471234" // Placeholder for Interstitial Ad
                                    format="rectangle"
                                    className="w-[300px] h-[250px] bg-card/50 rounded-xl border border-border shadow-lg flex items-center justify-center"
                                    label="Loading Ad"
                                />
                            </div>
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
