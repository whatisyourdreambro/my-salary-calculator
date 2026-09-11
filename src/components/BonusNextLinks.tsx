// src/components/BonusNextLinks.tsx
//
// 성과급 계산기 22쪽의 결과 직하 광고(CalcResultAd) **아래** 다음 단계 pill 1행 —
// 회사 연봉 DB 1 + 동일 섹터 형제 계산기 2 (해석은 src/lib/bonusNextLinks.ts 순수 함수).
//
// - 서버 컴포넌트: onClick 없음. 클릭 계측은 루트 레이아웃 InternalLinkTracker 의 document 위임
//   ([data-msy-module] → 기존 guide_cta_click, position=bonus-next-links)이 맡는다.
// - pill 스타일은 삼성 shared.tsx ResultNextLinks 를 **복제**했다(import·이동 금지 —
//   삼성 4파일은 9/21 이후 배치에서만 접촉).
// - OfferSlot·제휴 없음(제휴 표면 불변), 클라이언트 JS 없음.
// - 배치 규칙(2026-08-16): 항상 광고 아래. 기본 mt-8 이 AdSlot 하단 마진(1.5rem)과 접혀
//   광고 컨테이너와 32px 간격 — 광고 위에 두거나 CalcResultAd 앞에 끼우지 말 것.

import Link from "@/components/AppLink";
import { ArrowRight } from "lucide-react";
import { resolveBonusNextLinks } from "@/lib/bonusNextLinks";

interface Props {
  /** 현재 페이지의 계산기 slug (BONUS_CALCS 기준) */
  slug: string;
  className?: string;
}

const PILL_BASE =
  "group inline-flex items-center gap-1 text-xs font-bold border rounded-full px-3 py-1.5 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-electric";
const PILL_PRIMARY = "min-h-11 text-white bg-electric border-electric hover:bg-electric/90";
const PILL_SECONDARY =
  "text-electric bg-electric-5 border-electric-20 hover:bg-electric hover:text-white";

export default function BonusNextLinks({ slug, className = "mt-8" }: Props) {
  const links = resolveBonusNextLinks(slug);
  if (links.length === 0) return null;

  return (
    <nav
      aria-label="계산 결과 다음 단계"
      data-msy-module="bonus-next-links"
      className={`flex flex-wrap gap-2 ${className}`}
    >
      {links.map((l) => (
        <Link
          key={l.href}
          href={l.href}
          className={`${PILL_BASE} ${l.primary ? PILL_PRIMARY : PILL_SECONDARY}`}
        >
          {l.label}
          <ArrowRight
            size={12}
            className="group-hover:translate-x-0.5 transition-transform"
            aria-hidden
          />
        </Link>
      ))}
    </nav>
  );
}
