// /calc/jeonse-loan — 전세대출 한도/이자 계산기

import type { Metadata } from "next";
import { buildToolMetadata } from "@/lib/seo";
import { softwareApplicationLd, autoBreadcrumbLd, faqLd } from "@/lib/structuredData";
import JsonLd from "@/components/JsonLd";
import RelatedCalculators from "@/components/RelatedCalculators";
import { Sparkles, Info, Home } from "lucide-react";
import JeonseLoanClient from "./Client";

const FAQ_ITEMS = [
  {
    question: "전세대출 한도는 어떻게 결정되나요?",
    answer:
      "일반적으로 전세보증금의 80% 이내, 그리고 본인 연소득의 일정 비율 이내에서 결정됩니다. HUG·HF 보증서가 있으면 보증금의 90%까지도 가능합니다. 무주택자, 신혼부부, 청년 등은 정책상품(버팀목·디딤돌·청년전세 등)으로 우대 금리·한도가 적용됩니다.",
  },
  {
    question: "전세대출 이자도 소득공제 받을 수 있나요?",
    answer:
      "네, '주택임차차입금 원리금상환액 공제'로 연 400만원 한도(원리금의 40% 공제)가 적용됩니다. 단 무주택 세대주이면서 국민주택규모(전용 85㎡) 이하 주택에 대한 임차여야 합니다. 월세는 별도로 월세 세액공제 대상이 됩니다.",
  },
  {
    question: "전세 vs 월세, 어느 쪽이 유리한가요?",
    answer:
      "(1) 월세 7천만원 이하 무주택자는 월세 세액공제 15~17%(연 750만원 한도) 가능. (2) 전세는 보증금 회수 가능하지만 자금이 묶임. (3) 금리가 낮으면 전세 자금 운용 수익보다 비용이 적어 전세 유리, 금리 높으면 월세도 합리적. 본 계산기로 두 시나리오 비교 가능.",
  },
  {
    question: "전세보증보험은 꼭 가입해야 하나요?",
    answer:
      "법적 의무는 아니지만 강력 권장됩니다. 임대인 신용·등기부 위험을 보장해주며, 보증료(보증금의 0.122~0.154%/년)를 지불해야 하지만 사고 시 보증금 회수 가능. 깡통전세 우려 지역이라면 필수입니다. HUG·SGI·HF 등이 운영합니다.",
  },
  {
    question: "신혼부부 전세대출 우대 조건은?",
    answer:
      "혼인 7년 이내 신혼부부는 디딤돌·버팀목 정책상품 우대 가능. 부부 합산소득 8,500만원 이하(맞벌이 1억) 기준이며 우대 금리(최대 0.7%p 인하), 한도 확대(2.4~4억) 등이 적용됩니다. 만 19~34세 청년도 청년전세 자격이 있을 수 있습니다.",
  },
];

export const metadata: Metadata = buildToolMetadata({
  name: "전세대출 한도·이자 계산기",
  tagline: "버팀목·신혼부부 우대 금리 — 한도와 월 이자 비교",
  description:
    "전세보증금과 연소득으로 전세대출 한도, 월 이자, 연간 총비용을 즉시 계산합니다. 정책상품(버팀목·신혼부부) 우대 금리 비교까지.",
  path: "/calc/jeonse-loan",
  keywords: ["전세대출 계산기", "전세 한도", "버팀목 전세", "신혼부부 전세", "전세 이자 계산", "전세보증보험"],
});

export default function JeonseLoanPage() {
  return (
    <>
      <JsonLd
        data={[
          softwareApplicationLd({ name: "전세대출 한도·이자 계산기", description: "전세대출 한도와 월 이자, 정책상품 우대 금리를 비교 계산합니다.", url: "/calc/jeonse-loan" }),
          autoBreadcrumbLd("/calc/jeonse-loan", { leafName: "전세대출 한도·이자 계산기" }),
          faqLd(FAQ_ITEMS),
        ]}
      />
      <main className="min-h-screen pb-32 pt-24 px-4 font-sans bg-canvas dark:bg-canvas-950">
        <div className="max-w-3xl mx-auto">
          <header className="text-center mb-10">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-black uppercase tracking-widest mb-5 bg-electric-10 text-electric border border-electric-30">
              <Home size={12} /> 전세 시즌 (3·9월)
            </div>
            <h1 className="text-4xl sm:text-5xl font-black tracking-tight mb-3 text-navy dark:text-canvas-50" style={{ letterSpacing: "-0.04em" }}>
              전세대출 계산기
            </h1>
            <p className="text-lg font-medium text-muted-blue dark:text-canvas-300">
              <strong className="text-electric">한도·월 이자·연 비용</strong> 즉시 비교
            </p>
          </header>

          <JeonseLoanClient />

          <article className="prose prose-sm sm:prose-base dark:prose-invert max-w-none mb-10 mt-10">
            <h2 className="text-2xl font-black text-navy dark:text-canvas-50 mt-8 mb-4">전세대출 핵심 정책상품</h2>
            <ul className="space-y-2 text-muted-blue dark:text-canvas-300">
              <li><strong>버팀목 전세자금 대출</strong>: 무주택 세대주, 부부합산 5천만원 이하, 연 1.5~2.7%, 최대 1.2억</li>
              <li><strong>신혼부부 버팀목</strong>: 혼인 7년 이내, 부부합산 8,500만원 이하, 우대 금리 -0.7%p, 최대 2.4억</li>
              <li><strong>청년전세</strong>: 만 19~34세, 단독세대주, 연 2~3%, 최대 1.2억</li>
              <li><strong>일반 전세대출</strong>: 시중은행 변동금리 4~6%, HUG/HF 보증서 첨부</li>
            </ul>
          </article>

          <section className="mb-10">
            <h2 className="text-2xl font-black text-navy dark:text-canvas-50 mb-5">자주 묻는 질문</h2>
            <div className="space-y-3">
              {FAQ_ITEMS.map((item, idx) => (
                <details key={idx} className="rounded-2xl bg-white dark:bg-canvas-900 border border-canvas-200 dark:border-canvas-800 p-5 group">
                  <summary className="cursor-pointer font-bold text-navy dark:text-canvas-50 flex items-center justify-between">
                    {item.question}<span className="text-electric group-open:rotate-180 transition-transform">▾</span>
                  </summary>
                  <p className="mt-3 text-muted-blue dark:text-canvas-300 leading-relaxed text-sm">{item.answer}</p>
                </details>
              ))}
            </div>
          </section>

          <div className="rounded-2xl p-5 mb-8 flex gap-3 bg-electric-5 border border-electric-20">
            <Info size={18} className="text-electric flex-shrink-0 mt-1" />
            <p className="text-xs text-muted-blue dark:text-canvas-300 leading-relaxed">
              본 계산기는 표시 금리·한도 기준 추정치입니다. 실제 한도는 신용도, 부채, 보증서 발급 여부 등에 따라 달라지므로 은행·HUG·HF 상담을 권합니다.
            </p>
          </div>

          <RelatedCalculators currentPath="/calc/jeonse-loan" />
        </div>
      </main>
    </>
  );
}
