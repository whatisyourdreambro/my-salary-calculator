// src/lib/bonusNextLinks.ts
//
// 성과급 계산기 결과 직하(광고 아래) "다음 단계" pill 링크 해석기 — 순수 함수 (React 무관).
// BonusNextLinks 서버 컴포넌트가 사용하며, vitest 가 이 함수만으로 전 slug 를 검증한다.
//
// 규칙(2026-09-11 S1-2, docs/next-upgrade-plan-2026-09-11.md §2):
//   (a) 회사 연봉 DB 1건: /salary-db/{companyId} — primary
//   (b) 동일 섹터 형제 계산기 2건: BONUS_CALCS 순서에서 현재 항목 "다음" 2개(섹터 내 순환) — 결정적
//   (c) 섹터가 3개 미만이라 형제가 모자라면 허브 /calc/bonus-calculators 1건으로 보충
//       (그래도 3개 미만이면 전체 순서에서 보충 — 현재 데이터로는 도달하지 않는 방어 경로)
// 항상 자기 자신 제외·중복 없음·정확히 3건. 알 수 없는 slug 는 빈 배열(컴포넌트는 무렌더).
// 제휴·OfferSlot 은 여기에 없다 — 제휴 표면 불변.

import { BONUS_CALCS, type BonusCalcEntry } from "@/data/bonusCalcHub";
import { bonusCalcCountKo } from "@/config/site";

export interface BonusNextLink {
  href: string;
  label: string;
  primary?: boolean;
}

export const BONUS_HUB_PATH = "/calc/bonus-calculators";
export const BONUS_NEXT_LINK_COUNT = 3;

/** 회사 계산기 slug → 링크 3건 (entries 주입형 — 테스트에서 합성 섹터 검증용) */
export function resolveBonusNextLinksFrom(
  entries: readonly BonusCalcEntry[],
  slug: string,
): BonusNextLink[] {
  const current = entries.find((c) => c.slug === slug);
  if (!current) return [];

  const links: BonusNextLink[] = [
    {
      href: `/salary-db/${current.companyId}`,
      label: `${current.company} 연봉·직급별 실수령 보기`,
      primary: true,
    },
  ];
  const used = new Set<string>([`/calc/${slug}`, links[0].href]);
  const push = (href: string, label: string) => {
    if (links.length >= BONUS_NEXT_LINK_COUNT || used.has(href)) return;
    used.add(href);
    links.push({ href, label });
  };

  // (b) 동일 섹터 — 현재 항목 다음부터 순환
  const peers = entries.filter((c) => c.sector === current.sector);
  const idx = peers.findIndex((c) => c.slug === slug);
  for (let step = 1; step < peers.length; step++) {
    const peer = peers[(idx + step) % peers.length];
    push(`/calc/${peer.slug}`, `${peer.company} 성과급 계산기`);
  }

  // (c) 허브 보충
  push(BONUS_HUB_PATH, `성과급 계산기 ${bonusCalcCountKo} 모음`);

  // 방어: 전체 순서에서 보충 (현재 데이터로는 미도달)
  const gIdx = entries.findIndex((c) => c.slug === slug);
  for (let step = 1; step < entries.length; step++) {
    const e = entries[(gIdx + step) % entries.length];
    push(`/calc/${e.slug}`, `${e.company} 성과급 계산기`);
  }

  return links;
}

/** 실데이터(BONUS_CALCS) 기준 해석 */
export function resolveBonusNextLinks(slug: string): BonusNextLink[] {
  return resolveBonusNextLinksFrom(BONUS_CALCS, slug);
}
