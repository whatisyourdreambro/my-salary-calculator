"use client";

// Kakao JS SDK 조건부 로더 — NEXT_PUBLIC_KAKAO_JS_KEY 가 있을 때만 로드+초기화.
// 키 미설정 시 null 렌더 = 현행과 완전 동일 (카카오 버튼은 링크 복사 폴백).
// 키 등록 절차: Kakao Developers 앱 생성 → JavaScript 키 → 플랫폼 Web에 도메인 등록
// → Cloudflare Pages 환경변수(Production+Preview) → 재배포 (빌드타임 인라인).

import Script from "next/script";

const KAKAO_JS_KEY = process.env.NEXT_PUBLIC_KAKAO_JS_KEY;
const SDK_URL = "https://t1.kakaocdn.net/kakao_js_sdk/2.7.6/kakao.min.js";

interface KakaoGlobal {
  isInitialized: () => boolean;
  init: (key: string) => void;
}

export default function KakaoScript() {
  if (!KAKAO_JS_KEY) return null;

  return (
    <Script
      src={SDK_URL}
      strategy="lazyOnload"
      onLoad={() => {
        try {
          const kakao = (window as unknown as { Kakao?: KakaoGlobal }).Kakao;
          if (kakao && !kakao.isInitialized()) kakao.init(KAKAO_JS_KEY);
        } catch {
          // SDK 초기화 실패 시 ShareButtons가 링크 복사로 폴백하므로 무해
        }
      }}
    />
  );
}
