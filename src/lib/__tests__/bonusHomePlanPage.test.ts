// /calc/bonus-home-plan 페이지·클라이언트 회귀 (2026-09-27)
//  1) 광고 순서가 /calc/pension-hike-2027 과 같다(Client: 결과 → CalcResultAd, page: 본문 → InArticle → FAQ → GuideMid → 관련).
//  2) 광고 위(입력·결과 카드)는 회사 3종 × 시나리오 4종 × 극단 입력에서 마크업 기하 구조가 같고, 글자 줄은 전부
//     고정 높이 + truncate/line-clamp 다 → 어떤 상태에서도 CalcResultAd 의 y 가 같다(전 폭 측정은 배포 전 브라우저로 따로).
//  3) 문구 가드: '시나리오(가정)' 필수, 컨센서스·목표주가·전망치 금지(면책 문구 '증권사 컨센서스·전망이 아닙니다' 한 번만 예외).
//  4) SSR 기본값·NaN/undefined 미노출·브라우저 외부 요청·저장소 접근 없음.
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

vi.mock("next/navigation", () => ({ usePathname: () => "/calc/bonus-home-plan" }));
vi.mock("@/components/AdPlacement", () => ({
  CalcResultAd: () => createElement("div", { "data-test-ad": "calc-result" }),
  InArticleAd: () => createElement("div", { "data-test-ad": "in-article" }),
  GuideMidAd: () => createElement("div", { "data-test-ad": "guide-mid" }),
}));
import BonusHomePlanClient from "@/app/calc/bonus-home-plan/Client";

const read = (p: string) => readFileSync(resolve(process.cwd(), p), "utf8");
const PAGE = "src/app/calc/bonus-home-plan/page.tsx";
const CLIENT = "src/app/calc/bonus-home-plan/Client.tsx";
const AD_MARK = '<div data-test-ad="calc-result"></div>';

const render = (initial: Record<string, unknown> = {}) =>
  renderToStaticMarkup(createElement(BonusHomePlanClient as never, { initial } as never)).replace(/<!-- -->/g, "");
const aboveAd = (html: string) => {
  const i = html.indexOf(AD_MARK);
  expect(i).toBeGreaterThan(0);
  return html.slice(0, i);
};

// 기하(높이·줄 수)에 영향을 주는 클래스만 남긴다 — 색·테두리 색·커서는 무시
const GEOMETRY = /^(?:(?:sm|md|lg|xl):)?(?:h-|min-h-|max-h-|mt-|mb-|my-|pt-|pb-|py-|p-|space-y-|gap-|grid|grid-cols-|flex|block|inline|truncate|line-clamp-|text-(?:xs|sm|base|lg|xl|2xl|3xl|\[)|leading-|overflow-|rounded-)/;
function geometry(html: string): string[] {
  const out: string[] = [];
  for (const m of html.matchAll(/<(\w+)([^>]*)>/g)) {
    const [, tag, attrs] = m;
    if (tag === "option") continue;
    const cls = /class="([^"]*)"/.exec(attrs)?.[1] ?? "";
    if (/\babsolute\b/.test(cls)) continue; // 절대 위치 요소는 흐름 높이에 영향 없음
    const kind = tag === "select" || tag === "input" ? "control" : tag;
    out.push(`${kind}:${cls.split(/\s+/).filter((c) => GEOMETRY.test(c)).sort().join(" ")}`);
  }
  // select 는 wrapper 없이, input 은 relative wrapper 안 — wrapper(div.relative, 기하 클래스 없음)는 높이를 더하지 않는다
  return out.filter((e) => e !== "div:");
}

const STATES: Record<string, unknown>[] = [];
for (const company of ["samsung", "sk", "custom"]) {
  for (const scenario of ["conservative", "base", "optimistic", "custom"]) STATES.push({ company, scenario });
}
STATES.push(
  { company: "samsung", regionId: "seongnam-bundang", salary: "99999999999", startAssets: "999999999999" },
  { company: "sk", regionId: "icheon", salary: "", savingsRate: "", startAssets: "" },
  { company: "custom", customBonusPct: "999", salary: "1", regionId: "cheongju" },
  { company: "samsung", priceOverride: "99999999999999", division: "foundry" },
  { company: "samsung", salary: "0", savingsRate: "0" },
);

describe("광고 순서 = /calc/pension-hike-2027", () => {
  it("page: Client → 본문 → InArticleAd → FAQ → GuideMidAd → 안내 → RelatedCalculators", () => {
    const src = read(PAGE);
    const idx = ["<BonusHomePlanClient", "<article", "<InArticleAd", "자주 묻는 질문", "<GuideMidAd", "<RelatedCalculators"].map((t) => src.indexOf(t));
    for (const i of idx) expect(i).toBeGreaterThan(-1);
    expect([...idx].sort((a, b) => a - b)).toEqual(idx);
    expect(src.match(/<(InArticleAd|GuideMidAd|CalcResultAd|HomeTopAd|MultiplexAd|Display2Ad|SidebarAd)\b/g)).toEqual(["<InArticleAd", "<GuideMidAd"]);
  });
  it("Client: 입력 → 결과 카드 → CalcResultAd 1개 → 상세", () => {
    const src = read(CLIENT);
    expect(src.match(/<(InArticleAd|GuideMidAd|CalcResultAd|HomeTopAd|MultiplexAd|Display2Ad|SidebarAd|CoupangBanner)\b/g)).toEqual(["<CalcResultAd"]);
    const order = ['aria-label="내 조건"', "ref={measurement.resultRef}", "<CalcResultAd />", 'id="bhp-op-title"', 'id="bhp-year-title"', 'id="bhp-scn-title"', 'id="bhp-region-title"'];
    const idx = order.map((t) => src.indexOf(t));
    for (const i of idx) expect(i).toBeGreaterThan(-1);
    expect([...idx].sort((a, b) => a - b)).toEqual(idx);
    const html = render();
    const pos = ["bhp-company", "구매 가능 시점", AD_MARK, "bhp-op-title", "bhp-region-title"].map((t) => html.indexOf(t));
    expect([...pos].sort((a, b) => a - b)).toEqual(pos);
  });
});

describe("광고 위 고정 높이", () => {
  const base = geometry(aboveAd(render()));
  for (const st of STATES) {
    it(`기하 구조 동일 — ${JSON.stringify(st)}`, () => {
      const html = aboveAd(render(st));
      expect(geometry(html)).toEqual(base);
      expect(html).not.toMatch(/NaN|undefined|Infinity|null/);
    });
  }
  it("광고 위의 글자 요소는 모두 고정 높이 + truncate/line-clamp", () => {
    for (const st of STATES) {
      const html = aboveAd(render(st));
      for (const m of html.matchAll(/<(p|label|div|span|button|h\d)([^>]*)>([^<]+)</g)) {
        const [, tag, attrs, text] = m;
        if (!text.trim()) continue;
        const cls = /class="([^"]*)"/.exec(attrs)?.[1] ?? "";
        if (/\babsolute\b/.test(cls)) continue;
        expect(cls, `${tag} "${text}"`).toMatch(/(?:^|\s)h-\d/);
        expect(cls, `${tag} "${text}"`).toMatch(/(?:^|\s)(?:truncate|line-clamp-\d)/);
      }
    }
  });
  it("입력 6칸·시나리오 4칸은 회사가 바뀌어도 그대로(직접 입력 회사는 시나리오 비활성)", () => {
    for (const company of ["samsung", "sk", "custom"]) {
      const html = aboveAd(render({ company }));
      expect(html.match(/<(select|input)\b/g)?.length, company).toBe(6);
      expect(html.match(/<button\b/g)?.length, company).toBe(4);
      const disabledButtons = html.match(/<button[^>]*\sdisabled=""/g)?.length ?? 0;
      expect(disabledButtons, company).toBe(company === "custom" ? 4 : 0);
    }
  });
});

describe("SSR 기본값과 결과 문구", () => {
  const html = render();
  it("삼성전자 DS·메모리·8천만·동탄·0원·30%·기본", () => {
    expect(html).toContain('<option value="samsung" selected="">삼성전자 DS</option>');
    expect(html).toContain('<option value="memory" selected="">메모리</option>');
    expect(html).toContain('<option value="hwaseong-dongtan" selected="">화성시 동탄구</option>');
    expect(html).toContain('value="80,000,000"');
    expect(html).toContain("화성시 동탄구 아파트 중위가격 8.53억 (2026년 8월, 한국부동산원)");
    expect(html).toContain("기본 시나리오(가정) 기준 구매 가능 시점");
    expect(html).toContain("2029년 말");
    expect(html).toContain('aria-pressed="true"');
  });
  it("NaN·undefined·Infinity 가 화면에 없다 (기본·극단 입력)", () => {
    for (const st of STATES) expect(render(st), JSON.stringify(st)).not.toMatch(/NaN|undefined|Infinity/);
  });
  it("계측: calc_type bonus_home_plan, 입력 영역 3곳·결과 ref 1곳", () => {
    const src = read(CLIENT);
    expect(src).toContain('import { useCalculatorMeasurement } from "@/hooks/useCalculatorMeasurement";');
    expect(src).toContain('calcType: "bonus_home_plan"');
    expect(src.match(/\{\.\.\.measurement\.inputProps\}/g)?.length).toBe(3);
    expect(src.match(/ref=\{measurement\.resultRef\}/g)?.length).toBe(1);
    expect(src).toMatch(/valid: inputsValid && \[[^\]]+\]\.every\(Number\.isFinite\)/);
  });
});

describe("문구 가드", () => {
  for (const file of [PAGE, CLIENT]) {
    it(`${file}: '시나리오(가정)' 포함, 컨센서스는 면책 문구 한 번만, 목표주가·전망치 없음`, () => {
      const src = read(file);
      expect(src).toContain("시나리오(가정)");
      const consensus = src.match(/컨센서스/g)?.length ?? 0;
      const phrase = src.match(/증권사 컨센서스·전망이 아닙니다/g)?.length ?? 0;
      expect(consensus).toBe(phrase);
      expect(phrase).toBeLessThanOrEqual(1);
      expect(src).not.toMatch(/목표주가|전망치/);
    });
  }
  it("렌더된 클라이언트에도 금지어가 없고 면책 문구는 한 번", () => {
    const html = render();
    expect(html.match(/컨센서스/g)?.length).toBe(1);
    expect(html).toContain("증권사 컨센서스·전망이 아닙니다");
    expect(html).not.toMatch(/목표주가|전망치/);
  });
});

describe("표기", () => {
  it("0·비유한·억 경계", async () => {
    const { fmtEokShort, fmtManwon, fmtTril } = await import("@/lib/bonusHome/plan");
    expect(fmtEokShort(0)).toBe("0원");
    expect(fmtEokShort(4_000)).toBe("0원");
    expect(fmtEokShort(34_100_000)).toBe("3,410만");
    expect(fmtEokShort(576_000_000)).toBe("5.76억");
    expect(fmtEokShort(Number.NaN)).toBe("—");
    expect(fmtManwon(189_730_000)).toBe("1억 8,973만원");
    expect(fmtManwon(22_590_000)).toBe("2,259만원");
    expect(fmtTril(293.4)).toBe("293.4조");
    expect(fmtTril(-7.7)).toBe("-7.7조");
  });
});

describe("런타임 외부 요청·저장소 없음", () => {
  const files = [
    CLIENT,
    PAGE,
    "src/lib/bonusHome/plan.ts",
    "src/lib/bonusHome/compEngines.ts",
    "src/lib/bonusHome/affordability.ts",
    "src/lib/bonusHome/loanRules.ts",
    "src/lib/bonusHome/scenarios.ts",
    "src/lib/bonusHome/opActuals.ts",
    "src/lib/bonusHome/marketSnapshotRules.ts",
    "src/data/homePriceRegions.ts",
  ];
  it("fetch·XHR·localStorage·sessionStorage 를 쓰지 않고, API 엔드포인트 주소도 없다", () => {
    for (const f of files) {
      const src = read(f);
      expect(src, f).not.toMatch(/\bfetch\(|XMLHttpRequest|localStorage|sessionStorage|indexedDB/);
      expect(src, f).not.toMatch(/SttsApiTblData|ecos\.bok\.or\.kr\/api/);
    }
  });
  it("페이지는 정적 — dynamic·revalidate·runtime 설정 없음", () => {
    const src = read(PAGE);
    expect(src).not.toMatch(/export const (dynamic|revalidate|runtime)\b/);
    expect(read(CLIENT).startsWith('"use client";')).toBe(true);
  });
});
