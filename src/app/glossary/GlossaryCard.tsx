// 용어 카드 — 서버 컴포넌트.
// 96KB glossaryData를 클라이언트 번들에서 제거하기 위해 카드 마크업은 서버에서 렌더링하고,
// 상호작용(공유 버튼)만 ShareTermButton 클라이언트 아일랜드로 분리한다.
import Link from "next/link";
import { Hash, Sparkles, ArrowRight } from "lucide-react";
import type { GlossaryItem } from "@/data/glossaryData";
import { toGlossarySlug } from "@/data/glossaryData";
import ShareTermButton from "./ShareTermButton";

export default function GlossaryCard({ item }: { item: GlossaryItem }) {
  const Icon = item.icon;
  return (
    <div className="group relative bg-card/50 backdrop-blur-sm border border-border/50 rounded-3xl p-6 hover:shadow-2xl hover:shadow-primary/5 hover:border-primary/30 transition-all duration-300 hover:-translate-y-1 overflow-hidden flex flex-col h-full">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

      <div className="relative z-10 flex-1">
        <div className="flex items-start justify-between mb-5">
          <div className="p-3 bg-secondary/50 rounded-2xl text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-300 shadow-sm">
            <Icon className="w-6 h-6" />
          </div>
          <div className="flex gap-2">
            <ShareTermButton title={item.title} />
          </div>
        </div>

        <div className="mb-4">
          <span className="text-xs font-bold px-3 py-1 rounded-full bg-secondary text-secondary-foreground border border-border/50">
            {item.category}
          </span>
        </div>

        <h3 className="text-2xl font-bold mb-3 text-foreground group-hover:text-primary transition-colors tracking-tight">
          {item.title}
        </h3>

        <p className="text-sm font-medium text-muted-foreground mb-6 italic border-l-2 border-primary/30 pl-3">
          &quot;{item.summary}&quot;
        </p>

        <p className="text-base text-foreground/80 leading-relaxed mb-6 line-clamp-3 group-hover:line-clamp-none transition-all">
          {item.content}
        </p>
      </div>

      <div className="relative z-10 space-y-3 pt-6 border-t border-border/50 mt-auto">
        <div className="bg-secondary/30 p-4 rounded-2xl">
          <p className="text-sm text-foreground/90">
            <span className="font-bold flex items-center gap-2 mb-2 text-foreground">
              <Hash className="w-4 h-4 text-muted-foreground" />
              쉽게 말하면
            </span>
            {item.analogy}
          </p>
        </div>
        <div className="bg-primary/5 p-4 rounded-2xl border border-electric/10">
          <p className="text-sm text-foreground/90">
            <span className="font-bold text-electric flex items-center gap-2 mb-2">
              <Sparkles className="w-4 h-4" />
              Honey Tip
            </span>
            {item.tip}
          </p>
        </div>
        <Link
          href={`/glossary/${toGlossarySlug(item.title)}`}
          className="inline-flex items-center gap-1 text-sm font-bold text-electric hover:gap-2 transition-all"
          aria-label={`${item.title} 자세히 보기`}
        >
          자세히 보기 <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
}
