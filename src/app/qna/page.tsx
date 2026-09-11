// src/app/qna/page.tsx
// /qna 인덱스 서버 래퍼 — FAQPage·Breadcrumb JSON-LD는 이 페이지에만 선언.
// (layout.tsx에 두면 /qna/[slug] 전체에 30쌍 FAQ가 중복 주입돼 자체 faqLd와 충돌)
//
// 성능: qnaData(80KB)는 서버에서만 import하고, slug를 미리 계산한 데이터를
// props로 전달한다 → 클라이언트 번들에서 데이터 모듈 제거.
import { MessageCircle } from "lucide-react";
import Link from "@/components/AppLink";
import JsonLd from "@/components/JsonLd";
import { MultiplexAd } from "@/components/AdPlacement";
import { breadcrumbLd, faqLd } from "@/lib/structuredData";
import { qnaData, toQnaSlug } from "@/data/qnaData";
import QnaPageClient, { type QnaListItem } from "./QnaPageClient";

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

// slug를 서버에서 미리 계산 — 클라이언트가 toQnaSlug(=qnaData 모듈)를 import하지 않도록
const listItems: QnaListItem[] = qnaData.map((item) => ({
  ...item,
  slug: toQnaSlug(item.question),
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
      <div className="w-full space-y-12 pb-20">
        {/* Hero Section — 서버 렌더링 */}
        <section className="relative py-20 sm:py-28 overflow-hidden rounded-b-[3rem] bg-gradient-to-br from-[#0145F2] via-[#0950EE] to-[#0D5BFF] text-white text-center shadow-2xl">
          <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-20" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/30 rounded-full blur-[100px] -z-10 animate-pulse-glow" />

          <div className="relative z-10 max-w-3xl mx-auto px-4">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-primary-foreground font-medium text-sm mb-6">
              <MessageCircle className="w-4 h-4" />
              <span>주제별 자주 묻는 질문</span>
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight mb-6 leading-tight">
              연봉·세금 <br className="sm:hidden" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-blue-400 to-primary/80">
                자주 묻는 질문 Q&A
              </span>
            </h1>
            <p className="text-lg sm:text-xl text-faint-blue leading-relaxed font-light">
              금융에 대한 모든 질문과 해답. 급여, 세금, 퇴직금부터 재테크까지.
              <br className="hidden sm:block" />
              알아두면 피가 되고 살이 되는 금융 지식을 명쾌하게 알려드립니다.
            </p>
          </div>
        </section>

        <QnaPageClient items={listItems} />

        <section className="mx-auto my-8 max-w-3xl px-4 sm:px-6 lg:px-8">
          <div className="rounded-2xl border border-canvas-200 bg-white p-6 text-sm leading-7 text-muted-blue">
            <h2 className="mb-2 text-lg font-black text-navy">찾는 답변이 없거나 오류를 발견하셨나요?</h2>
            <p>이 페이지는 미리 정리한 질문과 답변입니다. 새 문의는 운영자에게 비공개로 보낼 수 있습니다.</p>
            <Link href="/contact?source=qna&type=explanation" className="mt-3 inline-block font-bold text-electric underline underline-offset-4">비공개 문의 보내기</Link>
          </div>
        </section>

        {/* 목록 하단 멀티플렉스 — env 미설정 시 렌더 안 함 (layout PageFooterAds 위) */}
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <MultiplexAd />
        </div>
      </div>
    </>
  );
}
