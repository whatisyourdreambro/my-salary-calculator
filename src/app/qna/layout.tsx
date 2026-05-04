import type { Metadata } from "next";
import { buildPageMetadata } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
 title: "연봉·세금 자주 묻는 질문 - 4대보험·연말정산 Q&A",
 description:
 "연봉 실수령액, 4대보험 공제, 연말정산 환급, 퇴직금, 성과급 세금 등 직장인이 가장 많이 묻는 질문에 2026년 세법 기준으로 명쾌하게 답합니다.",
 path: "/qna",
 keywords: ["연봉 FAQ", "세금 자주 묻는 질문", "4대보험 Q&A", "연말정산 질문"],
});

export default function QnaLayout({ children }: { children: React.ReactNode }) {
 return <>{children}</>;
}
