"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bell, TrendingUp, Users } from "lucide-react";

const MESSAGES = [
    "방금 누군가가 연봉 1억 실수령액을 계산했습니다.",
    "서울 거주 30대 직장인이 연봉 순위를 확인했습니다.",
    "판교 개발자가 이직 연봉을 시뮬레이션 중입니다.",
    "방금 누군가가 부자 DNA 테스트를 완료했습니다.",
    "삼성전자 신입사원 예상 월급이 조회되었습니다.",
    "연봉 5,000만원 실수령액 계산이 완료되었습니다.",
    "누군가가 자동차 구매 가능 여부를 확인했습니다.",
    "FIRE족 달성 가능성 시뮬레이션이 실행되었습니다.",
];

export default function LiveTicker() {
    const [index, setIndex] = useState(0);
    const [isVisible, setIsVisible] = useState(true);

    useEffect(() => {
        const interval = setInterval(() => {
            setIndex((prev) => (prev + 1) % MESSAGES.length);
        }, 5000);

        return () => clearInterval(interval);
    }, []);

    if (!isVisible) return null;

    return (
        <div className="fixed bottom-4 left-4 right-4 z-50 pointer-events-none flex justify-center sm:justify-start">
            <AnimatePresence mode="wait">
                <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="bg-slate-900/90 backdrop-blur-md text-white px-4 py-3 rounded-full shadow-2xl border border-white/10 flex items-center gap-3 pointer-events-auto max-w-sm w-full sm:w-auto"
                >
                    <div className="relative">
                        <div className="absolute inset-0 bg-green-500 rounded-full animate-ping opacity-75" />
                        <div className="relative bg-green-500 rounded-full p-1">
                            <Bell className="w-3 h-3 text-white" />
                        </div>
                    </div>
                    <span className="text-sm font-medium truncate flex-1">
                        {MESSAGES[index]}
                    </span>
                    <button
                        onClick={() => setIsVisible(false)}
                        className="text-slate-400 hover:text-white transition-colors text-xs"
                    >
                        닫기
                    </button>
                </motion.div>
            </AnimatePresence>
        </div>
    );
}
