"use client";

import { useState, useEffect } from "react";
import { Share2, Link as LinkIcon, MessageCircle, Twitter, Facebook } from "lucide-react";
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

            if (typeof window !== "undefined" && (window as any).Kakao) {

                if (!(window as any).Kakao.isInitialized()) {

                    (window as any).Kakao.init(process.env.NEXT_PUBLIC_KAKAO_JS_KEY);

                }

                (window as any).Kakao.Share.sendDefault({

    
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

    return (
        <div className={`flex flex-wrap gap-3 items-center ${className}`}>
            {/* Kakao Share */}
            <motion.button
                whileHover={{ scale: 1.1, y: -2 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleKakaoShare}
                className="w-10 h-10 rounded-full bg-[#FEE500] flex items-center justify-center shadow-lg shadow-[#FEE500]/30 transition-all border border-[#FEE500]"
                aria-label="카카오톡 공유"
            >
                <MessageCircle className="w-5 h-5 text-[#371D1E]" fill="currentColor" />
            </motion.button>

            {/* Facebook Share */}
            <motion.button
                whileHover={{ scale: 1.1, y: -2 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleFacebookShare}
                className="w-10 h-10 rounded-full bg-[#1877F2] flex items-center justify-center shadow-lg shadow-[#1877F2]/30 transition-all border border-[#1877F2]"
                aria-label="페이스북 공유"
            >
                <Facebook className="w-5 h-5 text-white" fill="currentColor" />
            </motion.button>

            {/* Twitter/X Share */}
            <motion.button
                whileHover={{ scale: 1.1, y: -2 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleTwitterShare}
                className="w-10 h-10 rounded-full bg-black flex items-center justify-center shadow-lg shadow-black/30 transition-all border border-zinc-800"
                aria-label="트위터 공유"
            >
                <Twitter className="w-4 h-4 text-white" fill="currentColor" />
            </motion.button>

            {/* Copy Link */}
            <div className="relative">
                <motion.button
                    whileHover={{ scale: 1.1, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleCopyLink}
                    className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center shadow-lg shadow-secondary/30 transition-all border border-border hover:bg-foreground hover:text-secondary hover:border-foreground"
                    aria-label="링크 복사"
                >
                    <LinkIcon className="w-4 h-4" />
                </motion.button>
                <AnimatePresence>
                    {showCopied && (
                        <motion.div
                            initial={{ opacity: 0, y: 10, scale: 0.8 }}
                            animate={{ opacity: 1, y: -45, scale: 1 }}
                            exit={{ opacity: 0, y: 0, scale: 0.8 }}
                            className="absolute left-1/2 -translate-x-1/2 bg-foreground text-background font-bold text-xs py-1.5 px-3 rounded-full whitespace-nowrap shadow-xl"
                        >
                            복사 완료!
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
