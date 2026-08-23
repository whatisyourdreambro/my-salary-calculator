// src/components/BonusClusterLinks.tsx
//
// 성과급 계산기 클러스터 상호링크 — 각 회사 계산기 페이지 최하단(모든 광고
// 아래, RelatedCalculators 직전)에 4카드: 허브 + 삼성 + SK하이닉스 + 동일
// 섹터 형제 1종. 서버 컴포넌트 — 데이터는 src/data/bonusCalcHub.ts 단일 소스.
// 삼성 페이지는 자체 수제 그리드가 있어 이 컴포넌트를 쓰지 않는다.

import Link from "@/components/AppLink";
import { ArrowRight, Gift } from "lucide-react";
import { BONUS_CALCS } from "@/data/bonusCalcHub";

interface Props {
  /** 현재 페이지의 계산기 slug (자기 자신 제외용) */
  currentSlug: string;
}

export default function BonusClusterLinks({ currentSlug }: Props) {
  const current = BONUS_CALCS.find((c) => c.slug === currentSlug);

  const cards: Array<{ href: string; title: string; desc: string; hot?: boolean }> = [
    {
      href: "/calc/bonus-calculators",
      title: "성과급 계산기 23종 전체 보기",
      desc: "회사별 최신 지급률·2026 시즌 캘린더 허브",
      hot: true,
    },
  ];

  // 삼성·SK하이닉스 앵커 (자기 자신이면 제외)
  for (const anchor of ["samsung-bonus", "sk-hynix-bonus"]) {
    if (anchor === currentSlug) continue;
    const c = BONUS_CALCS.find((x) => x.slug === anchor);
    if (c) {
      cards.push({
        href: `/calc/${c.slug}`,
        title: `${c.company} 성과급 계산기`,
        desc: c.hook,
      });
    }
  }

  // 동일 섹터 형제 1종 (자기 자신·이미 포함된 앵커 제외)
  if (current) {
    const sibling = BONUS_CALCS.find(
      (c) =>
        c.sector === current.sector &&
        c.slug !== currentSlug &&
        !cards.some((k) => k.href === `/calc/${c.slug}`)
    );
    if (sibling) {
      cards.push({
        href: `/calc/${sibling.slug}`,
        title: `${sibling.company} 성과급 계산기`,
        desc: sibling.hook,
      });
    }
  }

  return (
    <section className="mt-10" aria-labelledby="bonus-cluster-heading">
      <h2
        id="bonus-cluster-heading"
        className="text-lg font-black mb-3 flex items-center gap-2"
      >
        <Gift className="w-5 h-5 text-primary" aria-hidden />
        다른 회사 성과급도 계산해 보세요
      </h2>
      <div className="grid sm:grid-cols-2 gap-3">
        {cards.slice(0, 4).map((card) => (
          <Link
            key={card.href}
            href={card.href}
            className={`group block rounded-xl border p-4 transition hover:shadow-md ${
              card.hot
                ? "border-2 border-primary/40 bg-primary/5 hover:bg-primary/10"
                : "border-canvas-deep bg-white hover:border-primary/40"
            }`}
          >
            <p className="font-black flex items-center gap-1.5">
              {card.title}
              <ArrowRight className="w-4 h-4 text-faint group-hover:text-primary group-hover:translate-x-0.5 transition-all" />
            </p>
            <p className="text-xs text-faint mt-1 leading-relaxed">{card.desc}</p>
          </Link>
        ))}
      </div>
    </section>
  );
}
