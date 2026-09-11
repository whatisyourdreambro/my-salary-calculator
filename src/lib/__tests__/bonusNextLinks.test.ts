// 성과급 계산기 결과 직하 "다음 단계" pill 회귀 가드 (2026-09-11, next-upgrade-plan S1-2)
//
// 두 축을 지킨다:
//   1) 해석기(src/lib/bonusNextLinks.ts): 전 slug 에 대해 정확히 3건·자기 제외·중복 없음·
//      회사 href 가 실제 회사 DB id·형제 slug 가 BONUS_CALCS 에 존재·동일 섹터·결정적 순서.
//   2) 배치(소스 스캔, jsdom 없음 — internalLinkModules.test.ts 와 같은 방식): 22쪽 page.tsx 에서
//      <BonusNextLinks> 가 <CalcResultAd /> **아래** 에만 있고 광고는 여전히 정확히 1회.
//      (2026-08-16 규칙: 새 UI 는 광고 아래 — 광고 위로 올라가면 여기서 잡힌다)
//   삼성 4파일(page·shared·Client·taiData)은 9/21 이후 배치에서만 접촉 — 여기선 미삽입을 확인만 한다.

import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { BONUS_CALCS, type BonusCalcEntry } from "@/data/bonusCalcHub";
import { allCompanies } from "@/data/companies";
import {
  BONUS_HUB_PATH,
  BONUS_NEXT_LINK_COUNT,
  resolveBonusNextLinks,
  resolveBonusNextLinksFrom,
} from "@/lib/bonusNextLinks";

const read = (p: string) => readFileSync(resolve(process.cwd(), p), "utf8");
const lines = (p: string) => read(p).split(/\r?\n/);

const SAMSUNG = "samsung-bonus";
const PAGE_SLUGS = BONUS_CALCS.map((c) => c.slug).filter((s) => s !== SAMSUNG);
const companyIds = new Set(allCompanies.map((c) => c.id));
const calcSlugs = new Set(BONUS_CALCS.map((c) => c.slug));

const AD = "<CalcResultAd />";
const PILL_OPEN = "<BonusNextLinks";
const IMPORT_LINE = 'import BonusNextLinks from "@/components/BonusNextLinks";';

describe("bonusNextLinks 해석기", () => {
  it("BONUS_CALCS 에 회사 계산기 23종(삼성 포함), 페이지 대상은 22종", () => {
    expect(BONUS_CALCS.length).toBe(23);
    expect(PAGE_SLUGS.length).toBe(22);
  });

  it.each(BONUS_CALCS.map((c) => [c.slug, c] as const))(
    "%s → 3건·자기 제외·중복 없음·회사 DB id 실존·형제는 동일 섹터 실존 slug",
    (slug, entry) => {
      const links = resolveBonusNextLinks(slug);
      expect(links).toHaveLength(BONUS_NEXT_LINK_COUNT);

      const hrefs = links.map((l) => l.href);
      expect(new Set(hrefs).size).toBe(hrefs.length);
      expect(hrefs).not.toContain(`/calc/${slug}`);

      // (a) 회사 페이지 — primary, 실제 회사 데이터에 id 존재
      expect(links[0]).toEqual({
        href: `/salary-db/${entry.companyId}`,
        label: `${entry.company} 연봉·직급별 실수령 보기`,
        primary: true,
      });
      expect(companyIds.has(entry.companyId), `회사 id 없음: ${entry.companyId}`).toBe(true);

      // (b) 형제 2건 — 현재 데이터는 섹터마다 4종 이상이라 허브 보충 없이 형제로 채워진다
      for (const l of links.slice(1)) {
        expect(l.primary).toBeUndefined();
        const m = l.href.match(/^\/calc\/([a-z0-9-]+)$/);
        expect(m, `형제 href 형식 아님: ${l.href}`).not.toBeNull();
        const sib = BONUS_CALCS.find((c) => c.slug === m![1]);
        expect(calcSlugs.has(m![1]), `형제 slug 없음: ${m![1]}`).toBe(true);
        expect(sib?.sector).toBe(entry.sector);
        expect(l.label).toBe(`${sib?.company} 성과급 계산기`);
      }
      expect(hrefs).not.toContain(BONUS_HUB_PATH);
    },
  );

  it("형제는 BONUS_CALCS 섹터 내 순서에서 '다음 2개'(순환) — 결정적", () => {
    const sib = (slug: string) => resolveBonusNextLinks(slug).slice(1).map((l) => l.href);
    expect(sib("hyundai-bonus")).toEqual(["/calc/kia-bonus", "/calc/hyundai-mobis-bonus"]);
    // 섹터 마지막 항목은 처음으로 감는다(삼성 포함 — 링크 대상으로는 허용)
    expect(sib("lg-display-bonus")).toEqual(["/calc/samsung-bonus", "/calc/sk-hynix-bonus"]);
    expect(sib("kepco-bonus")).toEqual(["/calc/naver-bonus", "/calc/kakao-bonus"]);
    expect(sib("posco-bonus")).toEqual(["/calc/hyundai-bonus", "/calc/kia-bonus"]);
  });

  it("섹터가 3종 미만이면 허브로 보충하되 여전히 정확히 3건", () => {
    const mini: BonusCalcEntry[] = [
      { slug: "a-bonus", company: "A", companyId: "a", sector: "IT·바이오·공기업", hook: "", seasonLabel: "" },
      { slug: "b-bonus", company: "B", companyId: "b", sector: "IT·바이오·공기업", hook: "", seasonLabel: "" },
      { slug: "c-bonus", company: "C", companyId: "c", sector: "자동차·중공업·철강", hook: "", seasonLabel: "" },
    ];
    const two = resolveBonusNextLinksFrom(mini, "a-bonus");
    expect(two.map((l) => l.href)).toEqual(["/salary-db/a", "/calc/b-bonus", BONUS_HUB_PATH]);
    expect(two[2].label).toMatch(/^성과급 계산기 \d+종 모음$/);

    // 섹터에 자기 혼자면 허브 + 전체 순서 보충(방어 경로)
    const solo = resolveBonusNextLinksFrom(mini, "c-bonus");
    expect(solo).toHaveLength(3);
    expect(solo.map((l) => l.href)).toEqual(["/salary-db/c", BONUS_HUB_PATH, "/calc/a-bonus"]);
  });

  it("알 수 없는 slug 는 빈 배열 (컴포넌트 무렌더)", () => {
    expect(resolveBonusNextLinks("holiday-bonus")).toEqual([]);
    expect(resolveBonusNextLinks("nope")).toEqual([]);
  });
});

/** 주석 제거(// 줄·블록 주석·JSX 주석) — 헤더 주석의 "onClick 없음" 같은 문구가 스캔에 잡히지 않게 */
const stripComments = (s: string) =>
  s
    .replace(/\{\s*\/\*[\s\S]*?\*\/\s*\}/g, "")
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .replace(/^\s*\/\/.*$/gm, "");

describe("BonusNextLinks 컴포넌트 — 서버 컴포넌트·계측 속성·제휴 없음", () => {
  const raw = read("src/components/BonusNextLinks.tsx");
  const src = stripComments(raw);

  it("data-msy-module 로 InternalLinkTracker 위임 계측, onClick·클라이언트 지시어 없음", () => {
    expect(src.trimStart().startsWith('"use client"')).toBe(false);
    expect(raw).not.toContain('"use client"');
    expect(src).toContain('data-msy-module="bonus-next-links"');
    expect(src).toContain('aria-label="계산 결과 다음 단계"');
    expect(src).not.toContain("onClick");
    expect(src).not.toContain("useEffect");
    expect(src).toContain('from "@/components/AppLink"');
    expect(src).not.toContain('"next/link"');
  });

  it("OfferSlot·제휴·광고 컴포넌트를 포함하지 않는다 (제휴 표면 불변)", () => {
    expect(src).not.toMatch(/OfferSlot|AffiliateSlot|CoupangBanner|AdPlacement/);
  });

  it("기본 className 이 mt-8 — AdSlot 하단 마진(1.5rem)과 접혀 32px 간격", () => {
    expect(src).toContain('className = "mt-8"');
  });
});

describe("성과급 22쪽 배치 — CalcResultAd 아래 1회", () => {
  it.each(PAGE_SLUGS)("src/app/calc/%s/page.tsx", (slug) => {
    const file = `src/app/calc/${slug}/page.tsx`;
    const ls = lines(file);

    const adLines = ls.map((l, i) => (l.includes(AD) ? i : -1)).filter((i) => i >= 0);
    expect(adLines, `${file}: ${AD} 는 정확히 1회`).toHaveLength(1);

    const pillLines = ls.map((l, i) => (l.includes(PILL_OPEN) ? i : -1)).filter((i) => i >= 0);
    expect(pillLines, `${file}: <BonusNextLinks 는 정확히 1회`).toHaveLength(1);
    expect(ls[pillLines[0]].trim()).toBe(`<BonusNextLinks slug="${slug}" />`);

    // 광고 아래 — 첫 등장이 광고 줄보다 뒤, 그리고 광고 바로 다음 줄(직하)
    expect(pillLines[0]).toBeGreaterThan(adLines[0]);
    expect(pillLines[0]).toBe(adLines[0] + 1);

    expect(ls).toContain(IMPORT_LINE);
  });

  it("삼성 성과급 page.tsx 는 무접촉 (9/21 이후 배치 전용)", () => {
    const src = read(`src/app/calc/${SAMSUNG}/page.tsx`);
    expect(src).not.toContain(PILL_OPEN);
    expect(src).not.toContain(IMPORT_LINE);
  });

  it("BONUS_CALCS 밖의 일반 상여 계산기 3종에는 삽입하지 않는다", () => {
    for (const slug of ["holiday-bonus", "january-bonus", "year-end-bonus"]) {
      const src = read(`src/app/calc/${slug}/page.tsx`);
      expect(src, slug).not.toContain(PILL_OPEN);
    }
  });
});
