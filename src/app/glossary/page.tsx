// /glossary 인덱스 — 서버 컴포넌트.
// 기존에는 "use client" 페이지가 glossaryData(96KB)를 통째로 import해 번들을 부풀렸다.
// 이제 카드 마크업을 서버에서 렌더링하고, 검색/필터/Today's Pick만
// GlossaryExplorer 클라이언트 아일랜드가 경량 인덱스로 처리한다.
import { BookOpen } from "lucide-react";
import { glossaryData, toGlossarySlug } from "@/data/glossaryData";
import { HomeTopAd, InArticleAd } from "@/components/AdPlacement";
import CoupangBanner from "@/components/CoupangBanner";
import GlossaryCard from "./GlossaryCard";
import GlossaryExplorer, {
  type GlossaryIndexItem,
  type GlossaryPick,
} from "./GlossaryExplorer";

export default function GlossaryPage() {
  // 경량 검색 인덱스 — 제목/카테고리/검색 키워드만 클라이언트로 전달
  const index: GlossaryIndexItem[] = glossaryData.map((item) => ({
    title: item.title,
    category: item.category,
    search: `${item.title} ${item.summary} ${item.content}`.toLowerCase(),
  }));

  // Today's Pick 후보 — 카테고리 고르게 8개 샘플링 (빌드 시 고정)
  const step = Math.max(1, Math.floor(glossaryData.length / 8));
  const picks: GlossaryPick[] = Array.from({ length: 8 }, (_, i) => {
    const item = glossaryData[(i * step) % glossaryData.length];
    return {
      title: item.title,
      summary: item.summary,
      content: item.content,
      slug: toGlossarySlug(item.title),
    };
  });

  const cards = glossaryData.map((item) => (
    <GlossaryCard key={item.title} item={item} />
  ));

  return (
    <main className="w-full bg-canvas min-h-screen pb-20">
      {/* Hero Section — 서버 렌더링 (크롤러에 즉시 노출) */}
      <section className="relative pt-28 pb-16 overflow-hidden text-center">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-50 via-white to-primary/80 dark:from-[#0A1829] dark:via-[#0F2236] dark:to-primary/30 -z-10" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[400px] bg-primary/15 rounded-full blur-[120px] -z-10" />

        <div className="relative z-10 max-w-4xl mx-auto px-4">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-electric/20 text-electric font-bold text-sm mb-6">
            <BookOpen className="w-4 h-4" />
            <span>금융 문맹 탈출 프로젝트</span>
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-[56px] font-black tracking-tight text-navy mb-5 leading-[1.15]">
            금융 용어, <br className="sm:hidden" />
            <span className="text-electric">당신의 돈이 말을 거는 순간</span>
          </h1>
          <p className="text-lg sm:text-xl text-faint-blue leading-relaxed max-w-2xl mx-auto font-medium">
            더 이상 어렵고 복잡한 용어에 주눅 들지 마세요.{" "}
            <br className="hidden sm:block" />
            당신의 월급봉투와 통장, 그리고 미래를 이해하는 가장 확실한 열쇠를
            드립니다.
          </p>
        </div>
      </section>

      <GlossaryExplorer
        index={index}
        picks={picks}
        cards={cards}
        topAd={<HomeTopAd />}
        bottomAd={
          <>
            <InArticleAd />
            <CoupangBanner
              responsive={{ mobile: "mobile-banner", desktop: "leaderboard" }}
            />
          </>
        }
      />
    </main>
  );
}
