import type { Metadata } from "next";
import { buildPageMetadata } from "@/lib/seo";
import JsonLd from "@/components/JsonLd";
import { breadcrumbLd, faqLd } from "@/lib/structuredData";
import { qnaData } from "@/data/qnaData";

export const metadata: Metadata = buildPageMetadata({
 title: "연봉·세금 자주 묻는 질문 - 4대보험·연말정산 Q&A",
 description:
 "연봉 실수령액, 4대보험 공제, 연말정산 환급, 퇴직금, 성과급 세금 등 직장인이 가장 많이 묻는 질문에 2026년 세법 기준으로 명쾌하게 답합니다.",
 path: "/qna",
 keywords: ["연봉 FAQ", "세금 자주 묻는 질문", "4대보험 Q&A", "연말정산 질문"],
});

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

export default function QnaLayout({ children }: { children: React.ReactNode }) {
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
 {children}
 </>
 );
}
