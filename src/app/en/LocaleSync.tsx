"use client";

import { useEffect } from "react";

/**
 * /en/* 라우트에서 <html lang>를 'en'으로 동기화.
 * Root layout의 <html lang="ko"> 기본값을 클라이언트 사이드에서 덮어쓴다.
 *
 * 한국어 페이지로 이동 시 자동으로 'ko'로 복원해야 하므로, /en/* 페이지에서만 'en'으로 변경하고
 * 다른 라우트로 이동하면 그 라우트의 layout이 다시 처리.
 */
export default function EnglishLocaleSync() {
 useEffect(() => {
 const prev = document.documentElement.lang;
 document.documentElement.lang = "en";
 return () => {
 document.documentElement.lang = prev || "ko";
 };
 }, []);
 return null;
}
