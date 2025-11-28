"use client";

import { useState, useEffect } from "react";
import { Share2, Link as LinkIcon, Facebook, Twitter, MessageCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface ShareButtonsProps {
    url?: string;
    title?: string;
    description?: string;
    imageUrl?: string;
    className?: string;
}

export default function ShareButtons({
    url,
    title = "Moneysalary - 2025년 연봉 실수령액 계산기",
    description = "내 연봉의 실제 수령액을 확인해보세요!",
    imageUrl = "https://www.moneysalary.com/logo-full.png",
    className = "",
}: ShareButtonsProps) {
    const [currentUrl, setCurrentUrl] = useState("");
    const [showCopied, setShowCopied] = useState(false);

    useEffect(() => {
        if (typeof window !== "undefined") {
            setCurrentUrl(url || window.location.href);
        }
    }, [url]);

    const handleCopyLink = async () => {
        try {
            await navigator.clipboard.writeText(currentUrl);
            setShowCopied(true);
            setTimeout(() => setShowCopied(false), 2000);
        } catch (err) {
            console.error("Failed to copy link:", err);
        }
    };

    const handleKakaoShare = () => {
        if (typeof window !== "undefined" && window.Kakao) {
            if (!window.Kakao.isInitialized()) {
                window.Kakao.init(process.env.NEXT_PUBLIC_KAKAO_JS_KEY);
            }

            window.Kakao.Share.sendDefault({
                objectType: "feed",
                content: {
                    title: title,
                    description: description,
                    imageUrl: imageUrl,
                    link: {
                        mobileWebUrl: currentUrl,
                        webUrl: currentUrl,
                    },
                },
                buttons: [
                    {
                        title: "자세히 보기",
                        link: {
                            mobileWebUrl: currentUrl,
                            webUrl: currentUrl,
                        },
                    },
                ],
            });
        } else {
            alert("카카오톡 공유 기능을 불러오는 중입니다. 잠시 후 다시 시도해주세요.");
        }
    };

    const handleFacebookShare = () => {
        window.open(
            `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(currentUrl)}`,
            "_blank"
        );
    };

    const handleTwitterShare = () => {
        window.open(
            `https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(currentUrl)}`,
            "_blank"
        );
    };

    const handleLineShare = () => {
        window.open(
            `https://social-plugins.line.me/lineit/share?url=${encodeURIComponent(currentUrl)}`,
            "_blank"
        );
    };

    return (
        <div className={`flex flex-wrap gap-2 items-center justify-center ${className}`}>
            {/* Kakao Share */}
            <button
                onClick={handleKakaoShare}
                className="w-10 h-10 rounded-full bg-[#FEE500] flex items-center justify-center hover:scale-110 transition-transform shadow-sm"
                aria-label="카카오톡 공유"
            >
                <MessageCircle className="w-5 h-5 text-[#000000]" fill="currentColor" />
            </button>

            {/* Facebook Share */}
            <button
                onClick={handleFacebookShare}
                className="w-10 h-10 rounded-full bg-[#1877F2] flex items-center justify-center hover:scale-110 transition-transform shadow-sm"
                aria-label="페이스북 공유"
            >
                <Facebook className="w-5 h-5 text-white" fill="currentColor" />
            </button>

            {/* Twitter/X Share */}
            <button
                onClick={handleTwitterShare}
                className="w-10 h-10 rounded-full bg-black flex items-center justify-center hover:scale-110 transition-transform shadow-sm"
                aria-label="트위터 공유"
            >
                <Twitter className="w-5 h-5 text-white" fill="currentColor" />
            </button>

            {/* Line Share */}
            <button
                onClick={handleLineShare}
                className="w-10 h-10 rounded-full bg-[#06C755] flex items-center justify-center hover:scale-110 transition-transform shadow-sm"
                aria-label="라인 공유"
            >
                <span className="text-white font-bold text-xs">LINE</span>
            </button>

            {/* Copy Link */}
            <div className="relative">
                <button
                    onClick={handleCopyLink}
                    className="w-10 h-10 rounded-full bg-gray-100 dark:bg-zinc-800 flex items-center justify-center hover:scale-110 transition-transform shadow-sm border border-gray-200 dark:border-zinc-700"
                    aria-label="링크 복사"
                >
                    <LinkIcon className="w-4 h-4 text-gray-600 dark:text-gray-300" />
                </button>
                <AnimatePresence>
                    {showCopied && (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: -40 }}
                            exit={{ opacity: 0 }}
                            className="absolute left-1/2 -translate-x-1/2 bg-black text-white text-xs py-1 px-2 rounded whitespace-nowrap"
                        >
                            복사됨!
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
