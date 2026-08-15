"use client";

// 본문 복사 시 출처 자동 첨부 — 블로그·카페에 펌글 될 때 링크가 함께 실려
// 자연 유입·백링크를 만든다 (한국 콘텐츠 사이트 표준 관행).
// - 100자 이상 선택 복사에만 동작 (짧은 숫자·단어 복사는 건드리지 않음)
// - 입력창(input/textarea/contenteditable) 안의 복사는 제외
// - ShareButtons의 clipboard.writeText는 copy 이벤트를 발생시키지 않아 무영향

import { useEffect } from "react";
import { trackEvent } from "@/lib/analytics";

const MIN_LENGTH = 100;

export default function CopyAttribution() {
  useEffect(() => {
    const onCopy = (e: ClipboardEvent) => {
      try {
        const text = window.getSelection()?.toString() ?? "";
        if (text.length < MIN_LENGTH) return;

        const el = e.target instanceof Element ? e.target : null;
        if (el?.closest("input, textarea, [contenteditable='true'], [contenteditable='']")) {
          return;
        }
        if (!e.clipboardData) return;

        e.clipboardData.setData(
          "text/plain",
          `${text}\n\n출처: 머니샐러리 ${window.location.href}`
        );
        e.preventDefault();
        trackEvent("copy_with_source", {
          page_path: window.location.pathname,
          text_length: text.length,
        });
      } catch {
        // 실패 시 브라우저 기본 복사 동작 유지
      }
    };
    document.addEventListener("copy", onCopy);
    return () => document.removeEventListener("copy", onCopy);
  }, []);

  return null;
}
