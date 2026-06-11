// src/app/qna/page.tsx
// /qna 인덱스 서버 래퍼 — FAQPage·Breadcrumb JSON-LD는 이 페이지에만 선언.
// (layout.tsx에 두면 /qna/[slug] 전체에 30쌍 FAQ가 중복 주입돼 자체 faqLd와 충돌)

import JsonLd from "@/components/JsonLd";
import { breadcrumbLd, faqLd } from "@/lib/structuredData";
import { qnaData } from "@/data/qnaData";
import QnaPageClient from "./QnaPageClient";

// HTML strip + 길이 제한 (Google FAQPage 권장: 답변 짧을수록 표시 잘 됨)
function stripHtml(html: string): string {
 return html.replace(/<[^>]*>/g, "").trim();
}

function buildAnswerText(item: typeof qnaData[number]): string {
 const conclusion = stripHtml(item.answer.conclusion);
 const details = item.answer.details.slice(0, 3).map(stripHtml).join(" ");
 const tip = item.answer.tip ? ` 팁: ${stripHtml(item.answer.tip)}` : "";
 return `${conclusion} ${details}${tip}`.slice(0, 1500);
}

const faqItems = qnaData.slice(0, 30).map((item) => ({
 question: item.question,
 answer: buildAnswerText(item),
}));

export default function QnaPage() {
 return (
 <>
 <JsonLd
 data={[
 breadcrumbLd([
 { name: "홈", path: "/" },
 { name: "자주 묻는 질문", path: "/qna" },
 ]),
 faqLd(faqItems),
 ]}
 />
 <QnaPageClient />
 </>
 );
}
