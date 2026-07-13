// src/components/CompanyFaq.tsx
//
// 회사 페이지 — 자주 묻는 질문(FAQ)을 화면에 노출하는 섹션.
// 기존에 buildCompanyFaq의 Q&A는 JSON-LD(faqLd)에만 들어가 사용자에게 보이지
// 않았다. 같은 Q&A를 본문으로 함께 렌더링해 검색 노출(콘텐츠 깊이)과
// 체류시간을 동시에 강화하고, JSON-LD와 본문 내용을 일치시킨다.

import { Fragment } from "react";
import Link from "next/link";
import { ChevronDown } from "lucide-react";

interface FaqItem {
  question: string;
  answer: string;
}

// FAQ 답변 속 계산기 언급을 실제 링크로 — 본문 렌더에서만 치환하고
// JSON-LD(faqLd)는 plain text 유지해 구조화데이터 규격을 보존한다.
const FAQ_LINK_MAP: Array<{ phrase: string; href: string }> = [
  { phrase: "연봉 실수령액 계산기", href: "/" },
  { phrase: "DSR 계산기", href: "/tools/real-estate/dsr" },
  { phrase: "퇴직금 계산기", href: "/tools/finance/severance" },
];

const FAQ_LINK_PATTERN = new RegExp(
  `(${FAQ_LINK_MAP.map((m) => m.phrase).join("|")})`,
  "g"
);

function linkifyAnswer(answer: string) {
  return answer.split(FAQ_LINK_PATTERN).map((part, i) => {
    const match = FAQ_LINK_MAP.find((m) => m.phrase === part);
    return match ? (
      <Link
        key={i}
        href={match.href}
        className="font-bold text-electric underline underline-offset-2"
      >
        {part}
      </Link>
    ) : (
      <Fragment key={i}>{part}</Fragment>
    );
  });
}

export default function CompanyFaq({
  companyName,
  items,
}: {
  companyName: string;
  items: FaqItem[];
}) {
  if (items.length === 0) return null;

  return (
    <section
      className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10"
      aria-label={`${companyName} 연봉 자주 묻는 질문`}
    >
      <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-navy dark:text-canvas-50 mb-2">
        {companyName} 연봉 자주 묻는 질문
      </h2>
      <p className="text-sm text-muted-blue dark:text-canvas-300 mb-6">
        {companyName} 초봉·직급별 연봉·실수령액에 대해 가장 많이 찾는 질문을 모았습니다.
      </p>

      <div className="space-y-3">
        {items.map((item) => (
          <details
            key={item.question}
            className="group rounded-2xl border border-canvas-200 dark:border-canvas-800 bg-white dark:bg-canvas-900 p-5"
          >
            <summary className="flex items-center justify-between gap-3 cursor-pointer list-none text-[15px] font-bold text-navy dark:text-canvas-50">
              {item.question}
              <ChevronDown className="w-4 h-4 flex-shrink-0 text-electric transition-transform group-open:rotate-180" />
            </summary>
            <p className="faq-answer mt-3 text-sm leading-7 text-muted-blue dark:text-canvas-300">
              {linkifyAnswer(item.answer)}
            </p>
          </details>
        ))}
      </div>
    </section>
  );
}
