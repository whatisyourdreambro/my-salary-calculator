"use client";

import { useState, useEffect } from "react";
import { Link as LinkIcon, Facebook, Twitter, Instagram } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { trackShare } from "@/lib/analytics";

interface ShareButtonsProps {
  url?: string;
  title?: string;
  description?: string;
  /** 카카오 공유 카드 썸네일 */
  imageUrl?: string;
  /** 공유 콘텐츠 종류 (예: salary_result, company, guide, fun) — GA4에서 어떤 결과가 가장 많이 공유되는지 측정 */
  contentType?: string;
  /**
   * 결과 이미지를 가진 페이지(FUN 결과 카드 등)는 이 캡처 함수를 넘긴다.
   * 넘기면 인스타그램 버튼이 모바일 Web Share API 로 이미지 파일을 직접 공유한다.
   * (인스타그램은 웹 링크 공유 API 가 없어 이미지 공유가 유일한 정식 경로)
   */
  getShareImage?: () => Promise<Blob | null>;
  className?: string;
}

export default function ShareButtons({
  url,
  title = "머니샐러리 - 2026년 연봉 실수령액 계산기",
  description = "내 연봉의 실제 수령액을 확인해보세요!",
  imageUrl = "https://www.moneysalary.com/logo-full.png",
  getShareImage,
  contentType = "page",
  className = "",
}: ShareButtonsProps) {
  const [currentUrl, setCurrentUrl] = useState("");
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setCurrentUrl(url || window.location.href);
    }
  }, [url]);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2800);
  };

  const handleKakaoShare = async () => {
    trackShare("kakao", contentType);
    // Kakao JS SDK 가 초기화돼 있으면 인앱 공유, 아니면 링크 복사로 폴백.
    const kakao = (window as any).Kakao;
    if (kakao?.isInitialized?.()) {
      try {
        kakao.Share.sendDefault({
          objectType: "feed",
          content: {
            title,
            description,
            imageUrl,
            link: { mobileWebUrl: currentUrl, webUrl: currentUrl },
          },
          buttons: [
            {
              title: "자세히 보기",
              link: { mobileWebUrl: currentUrl, webUrl: currentUrl },
            },
          ],
        });
        return;
      } catch {}
    }
    try {
      await navigator.clipboard.writeText(`${title}\n${currentUrl}`);
      showToast("💬 링크 복사 완료! 카카오톡에 붙여넣기 하세요");
    } catch {
      showToast("링크를 복사해 카카오톡으로 공유하세요");
    }
  };

  const handleInstagramShare = async () => {
    trackShare("instagram", contentType);
    // 결과 이미지가 있으면 모바일 Web Share API 로 이미지 파일을 직접 공유
    // (사용자가 공유 시트에서 인스타그램 스토리/피드 선택 가능).
    if (getShareImage) {
      try {
        const blob = await getShareImage();
        if (blob) {
          const file = new File([blob], "moneysalary.png", {
            type: "image/png",
          });
          const nav = navigator as any;
          if (nav.canShare?.({ files: [file] })) {
            await nav.share({ files: [file], title, text: description });
            return;
          }
        }
      } catch {}
    }
    // 인스타그램은 웹 링크 공유 URL 이 없어 링크 복사 + 인스타 열기로 안내.
    try {
      await navigator.clipboard.writeText(currentUrl);
      showToast("📷 링크 복사 완료! 인스타그램 프로필·스토리에 붙여넣으세요");
    } catch {
      showToast("링크를 복사해 인스타그램에 공유하세요");
    }
    window.open("https://www.instagram.com/", "_blank");
  };

  const handleCopyLink = async () => {
    trackShare("copy", contentType);
    try {
      await navigator.clipboard.writeText(currentUrl);
      showToast("🔗 링크가 복사됐어요!");
    } catch {
      showToast("복사에 실패했습니다.");
    }
  };

  const handleFacebookShare = () => {
    trackShare("facebook", contentType);
    window.open(
      `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
        currentUrl
      )}`,
      "_blank"
    );
  };

  const handleTwitterShare = () => {
    trackShare("twitter", contentType);
    window.open(
      `https://twitter.com/intent/tweet?text=${encodeURIComponent(
        title
      )}&url=${encodeURIComponent(currentUrl)}`,
      "_blank"
    );
  };

  return (
    <>
      <div className={`flex flex-wrap gap-3 items-center ${className}`}>
        {/* Kakao */}
        <motion.button
          whileHover={{ scale: 1.1, y: -2 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleKakaoShare}
          className="w-10 h-10 rounded-full bg-[#FEE500] flex items-center justify-center shadow-lg shadow-[#FEE500]/30 transition-all"
          aria-label="카카오톡 공유"
          title="카카오톡 공유"
        >
          {/* KakaoTalk speech bubble icon */}
          <svg viewBox="0 0 24 24" className="w-5 h-5" fill="#371D1E">
            <path d="M12 3C6.477 3 2 6.477 2 10.5c0 2.394 1.36 4.514 3.445 5.882L4.5 20l4.094-2.182A11.3 11.3 0 0 0 12 18c5.523 0 10-3.477 10-7.5S17.523 3 12 3Z" />
          </svg>
        </motion.button>

        {/* Instagram */}
        <motion.button
          whileHover={{ scale: 1.1, y: -2 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleInstagramShare}
          className="w-10 h-10 rounded-full flex items-center justify-center shadow-lg transition-all"
          style={{
            background:
              "linear-gradient(45deg,#F58529,#DD2A7B,#8134AF,#515BD4)",
            boxShadow: "0 10px 15px -3px rgba(221,42,123,0.3)",
          }}
          aria-label="인스타그램 공유"
          title="인스타그램 공유"
        >
          <Instagram className="w-5 h-5 text-white" />
        </motion.button>

        {/* Facebook */}
        <motion.button
          whileHover={{ scale: 1.1, y: -2 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleFacebookShare}
          className="w-10 h-10 rounded-full bg-[#1877F2] flex items-center justify-center shadow-lg shadow-[#1877F2]/30 transition-all"
          aria-label="페이스북 공유"
          title="페이스북 공유"
        >
          <Facebook className="w-5 h-5 text-white" fill="white" />
        </motion.button>

        {/* X (Twitter) */}
        <motion.button
          whileHover={{ scale: 1.1, y: -2 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleTwitterShare}
          className="w-10 h-10 rounded-full bg-black flex items-center justify-center shadow-lg shadow-black/30 transition-all"
          aria-label="X(트위터) 공유"
          title="X 공유"
        >
          <Twitter className="w-4 h-4 text-white" fill="white" />
        </motion.button>

        {/* Copy Link */}
        <motion.button
          whileHover={{ scale: 1.1, y: -2 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleCopyLink}
          className="w-10 h-10 rounded-full bg-canvas-dark border border-canvas flex items-center justify-center shadow-lg transition-all hover:bg-primary/10 hover:border-primary/30"
          aria-label="링크 복사"
          title="링크 복사"
        >
          <LinkIcon className="w-4 h-4 text-faint-blue" />
        </motion.button>
      </div>

      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-8 left-1/2 -translate-x-1/2 bg-navy text-white px-6 py-3 rounded-full text-sm font-bold shadow-xl z-[100] whitespace-nowrap"
          >
            {toast}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
