// 두 업종 분류 교차 링크 (2026-11-15 SEASONC, app-data-pages ideas[3]) — 정적 표가 두 데이터와 맞고, /industry 쪽은 마지막 광고 아래.
import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

import { INDUSTRY_LISTED_PAIRS, industryLinkForListed, listedRankingLinksForIndustry } from "@/lib/industryCrossLinks";
import { industriesData } from "@/data/industriesData";
import { industryRankings } from "@/lib/salary-data/dartRanking";

const code = (file: string) =>
  readFileSync(file, "utf8").replace(/\r\n/g, "\n").replace(/\{\/\*[\s\S]*?\*\/\}/g, "").replace(/^\s*\/\/.*$/gm, "");
const AD_TAG = /<(?:[A-Z][A-Za-z0-9]*Ad|PageFooterAds|CoupangBanner|AffiliateSlot|OfferSlot)\b/g;
const industryIdsOf = (i: unknown) => (i as { industryIds?: string[] }).industryIds ?? [];

describe("정적 짝 표 = 사이트 분류(industryIds)와 공시 업종의 정확한 일치", () => {
  const listed = new Map(industryRankings.map((r) => [r.industryId, r]));

  it("모든 짝이 실재하고 이름이 두 데이터와 같다", () => {
    for (const p of INDUSTRY_LISTED_PAIRS) {
      const ind = industriesData.find((i) => i.id === p.industry);
      expect(ind, p.industry).toBeDefined();
      expect(ind!.name, p.industry).toBe(p.industryName);
      expect(industryIdsOf(ind), p.industry).toContain(p.listed);
      expect(listed.get(p.listed)?.industryKo, p.listed).toBe(p.listedName);
    }
  });

  it("빠진 짝이 없고 공시 업종은 한 업계에만 속한다", () => {
    const expected = industriesData.flatMap((i) =>
      industryIdsOf(i).filter((id) => listed.has(id)).map((id) => `${i.id}>${id}`),
    );
    expect(INDUSTRY_LISTED_PAIRS.map((p) => `${p.industry}>${p.listed}`).sort()).toEqual(expected.sort());
    const listedIds = INDUSTRY_LISTED_PAIRS.map((p) => p.listed);
    expect(new Set(listedIds).size).toBe(listedIds.length);
  });

  it("도우미", () => {
    expect(listedRankingLinksForIndustry("semiconductor")).toEqual([
      { href: "/salary-db/listed/industry/semiconductor", name: "반도체·디스플레이" },
      { href: "/salary-db/listed/industry/electronics", name: "전자·전기" },
    ]);
    expect(listedRankingLinksForIndustry("public-enterprise")).toEqual([]);
    expect(industryLinkForListed("bank")).toEqual({ href: "/industry/finance-banking", name: "금융·은행" });
    expect(industryLinkForListed("consumer-goods")).toBeNull();
  });
});

describe("/industry 쪽 블록은 마지막 광고 아래", () => {
  it("/industry/[slug]: 공시 순위 블록은 MultiplexAd 뒤, 그 뒤 광고 없음", () => {
    const src = code("src/app/industry/[slug]/page.tsx");
    const body = src.slice(src.search(/export default (?:async )?function/));
    const block = body.indexOf("listedRankingLinks.length > 0");
    const ads = [...body.matchAll(AD_TAG)];
    expect(block).toBeGreaterThan(-1);
    expect(ads.at(-1)?.[0]).toBe("<MultiplexAd");
    for (const ad of ads) expect(ad.index!, ad[0]).toBeLessThan(block);
  });
});
