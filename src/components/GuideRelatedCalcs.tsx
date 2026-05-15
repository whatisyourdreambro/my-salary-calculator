// src/components/GuideRelatedCalcs.tsx
//
// 가이드 글 하단의 "관련 계산기" 블록 (가이드 → 계산기 내부 링크).
// crossLink의 getGuideRelatedCalcs로 슬러그를 받아 100개 계산기 중 매칭되는 것만 카드로 노출.
// 서버 컴포넌트 — 추가 클라이언트 JS 없음.

import Link from "next/link";
import { Calculator, ArrowRight } from "lucide-react";
import { getGuideRelatedCalcs } from "@/lib/crossLink";
import { getCalculatorBySlug } from "@/lib/simpleCalculators";

interface GuideRelatedCalcsProps {
  guideSlug: string;
  limit?: number;
}

export default function GuideRelatedCalcs({
  guideSlug,
  limit = 4,
}: GuideRelatedCalcsProps) {
  const calcs = getGuideRelatedCalcs(guideSlug)
    .map((slug) => getCalculatorBySlug(slug))
    .filter((c): c is NonNullable<typeof c> => Boolean(c))
    .slice(0, limit);

  if (calcs.length === 0) return null;

  return (
    <section className="my-12">
      <h2 className="text-lg font-black text-navy mb-4 px-1">
        이 가이드와 함께 쓰면 좋은 계산기
      </h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {calcs.map((calc) => (
          <Link
            key={calc.slug}
            href={`/calc/${calc.slug}`}
            className="group flex flex-col gap-2 p-4 rounded-2xl bg-white border border-canvas-200 hover:border-electric hover:bg-electric-5 transition-all"
          >
            <div className="w-10 h-10 rounded-xl bg-canvas flex items-center justify-center group-hover:bg-electric-10 transition-colors">
              <Calculator className="w-5 h-5 text-electric" />
            </div>
            <p className="text-sm font-bold text-navy mt-1 leading-tight">
              {calc.title}
            </p>
            <p className="text-xs text-faint-blue line-clamp-2">
              {calc.description}
            </p>
            <div className="flex items-center gap-1 text-xs font-bold text-electric mt-auto pt-1">
              계산하기
              <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
