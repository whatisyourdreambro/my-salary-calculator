"use client";

// 친근한 헤딩 + ShareButtons 묶음 카드 — 신규 공유 UI 삽입의 표준.
// 기존 74곳 인라인 ShareButtons는 자체 헤딩을 갖고 있으므로 건드리지 않고,
// 새로 공유 버튼이 들어가는 자리에는 이 컴포넌트를 쓴다.

import ShareButtons from "./ShareButtons";

const HEADINGS: Record<string, { ko: string; en: string }> = {
  calc_result: {
    ko: "이 결과, 친구에게 자랑해 보세요",
    en: "Share this result with a friend",
  },
  salary_result: {
    ko: "이 결과, 친구에게 자랑해 보세요",
    en: "Share this result with a friend",
  },
  guide: { ko: "도움이 됐다면 공유해 주세요", en: "Found this helpful? Share it" },
  company: {
    ko: "이 회사 연봉, 동료에게도 알려주세요",
    en: "Share this company's salary info",
  },
  tool: {
    ko: "필요한 사람에게 이 계산기를 보내주세요",
    en: "Send this calculator to someone who needs it",
  },
  fun: { ko: "친구랑 같이 해봐요", en: "Try it with your friends" },
  page: { ko: "이 페이지 공유하기", en: "Share this page" },
};

interface ShareSectionProps {
  /** GA4 content_type + 헤딩 문구 선택 (calc_result/guide/company/tool/fun/page…) */
  contentType?: string;
  /** 헤딩 직접 지정 시 contentType 매핑보다 우선 */
  heading?: string;
  title?: string;
  description?: string;
  url?: string;
  imageUrl?: string;
  getShareImage?: () => Promise<Blob | null>;
  locale?: "ko" | "en";
  register?: boolean;
  className?: string;
}

export default function ShareSection({
  contentType = "page",
  heading,
  locale = "ko",
  className = "",
  ...rest
}: ShareSectionProps) {
  const resolvedHeading =
    heading ?? (HEADINGS[contentType] ?? HEADINGS.page)[locale];

  return (
    <section
      className={`p-5 sm:p-6 bg-white dark:bg-canvas-900 rounded-2xl border border-canvas-200 dark:border-canvas-800 ${className}`}
    >
      <p className="text-sm font-black text-navy dark:text-canvas-50 mb-4">
        {resolvedHeading}
      </p>
      <ShareButtons contentType={contentType} locale={locale} {...rest} />
    </section>
  );
}
