// /property-holding-tax-2026 화면 렌더 가드 (2026-11-01 R2-HOLD)
// 1) 위 계산기(HomeTopAd~CalcResultAd 사이): 결과 줄 수 4개 그대로, 종부세·농특세 줄 = 종부세(세액공제 뒤) +
//    농어촌특별세, 총액도 농특세 포함. 나이·보유기간 입력은 없다.
// 2) 맨 아래 상세(마지막 광고 MultiplexAd 아래): 산출세액·세액공제(80% 한도)·납부할 종부세·농특세·총액 내역.
// 3) page.tsx: 상세는 모든 광고 뒤, 결과와 CalcResultAd 사이는 비어 있다.
// 입력 공유 스토어는 서버 렌더에서 항상 기본값이므로, 여기서는 스토어를 목으로 바꿔 입력별 화면을 그린다.
import { createElement, type AnchorHTMLAttributes } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { afterEach, describe, expect, it, vi } from "vitest";
import { DEFAULT_HOLDING_TAX_INPUTS, type HoldingTaxInputs } from "@/app/property-holding-tax-2026/holdingTaxInputs";

const store = vi.hoisted(() => ({ inputs: null as HoldingTaxInputs | null }));

vi.mock("@/components/AppLink", () => ({
  default: (props: AnchorHTMLAttributes<HTMLAnchorElement>) => createElement("a", props),
}));
vi.mock("@/app/property-holding-tax-2026/holdingTaxInputs", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/app/property-holding-tax-2026/holdingTaxInputs")>();
  const { calcHoldingTax2026 } = await import("@/lib/propertyHoldingTax2026");
  return {
    ...actual,
    setHoldingTaxInputs: () => {},
    useHoldingTax: () => {
      const inputs = store.inputs ?? actual.DEFAULT_HOLDING_TAX_INPUTS;
      const { publishedValue, numHomes, isOnlyOneHome, age, holdingYears } = inputs;
      return { inputs, result: calcHoldingTax2026(publishedValue, numHomes, isOnlyOneHome, { age, holdingYears }) };
    },
  };
});
vi.mock("@/components/AdPlacement", () => ({
  HomeTopAd: () => createElement("div", { "data-test-ad": "home-top" }),
  InArticleAd: () => createElement("div", { "data-test-ad": "in-article" }),
  CalcResultAd: () => createElement("div", { "data-test-ad": "result" }),
  GuideMidAd: () => createElement("div", { "data-test-ad": "guide" }),
  MultiplexAd: () => createElement("div", { "data-test-ad": "multiplex" }),
}));
vi.mock("@/components/CoupangBanner", () => ({ default: () => createElement("div", { "data-test-ad": "coupang" }) }));
vi.mock("@/components/RelatedCalculators", () => ({ default: () => null }));
vi.mock("@/components/ShareButtons", () => ({ default: () => null }));
vi.mock("@/components/Breadcrumbs", () => ({ default: () => null }));

const text = (html: string) => html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
// 결과 상자의 내역 줄 수 — 종전과 같이 4줄(재산세·지방교육세·재산세 합계·12월 줄). 주택 수 눈금 줄은 결과 상자 밖.
const resultRows = (html: string) => {
  const box = html.slice(html.indexOf("연 보유세 총액"));
  return box.match(/class="flex justify-between/g)?.length ?? 0;
};

async function renderWith(inputs: Partial<HoldingTaxInputs>) {
  store.inputs = { ...DEFAULT_HOLDING_TAX_INPUTS, ...inputs };
  const { default: Client } = await import("@/app/property-holding-tax-2026/PropertyHoldingTaxClient");
  const { default: Detail } = await import("@/app/property-holding-tax-2026/PropertyHoldingTaxDetail");
  return { client: renderToStaticMarkup(createElement(Client)), detail: renderToStaticMarkup(createElement(Detail)) };
}

afterEach(() => {
  store.inputs = null;
});

describe("위 계산기 — 결과 광고 위 블록", () => {
  it("기본값(10억·1세대 1주택): 결과 줄 4개, 종부세·농특세 줄은 —, 총액 1,404,000원 그대로", async () => {
    const { client } = await renderWith({});
    expect(resultRows(client)).toBe(4);
    expect(text(client)).toContain("연 보유세 총액 1,404,000원");
    expect(text(client)).toContain("종부세·농특세 —");
    expect(client).not.toContain("<select");
    expect(client).not.toContain("농어촌특별세");
  });
  it("공시 15억·1세대 1주택·세액공제 없음: 종부세·농특세 줄 1,080,000원(종부세 900,000 + 농특세 180,000), 총액 3,564,000원", async () => {
    const { client } = await renderWith({ publishedValue: 1_500_000_000 });
    expect(text(client)).toContain("종부세·농특세 1,080,000원");
    expect(text(client)).toContain("연 보유세 총액 3,564,000원");
  });
  it("상세에서 고른 70세·15년은 위 총액에도 반영(공제 80% 한도): 종부세·농특세 줄 216,000원, 총액 2,700,000원", async () => {
    const { client } = await renderWith({ publishedValue: 1_500_000_000, age: 70, holdingYears: 15 });
    expect(text(client)).toContain("종부세·농특세 216,000원");
    expect(text(client)).toContain("연 보유세 총액 2,700,000원");
    expect(resultRows(client)).toBe(4);
  });
  it("3주택 합계 10억(기본 입력 + 슬라이더 3): 종부세·농특세 줄 360,000원 — 종전 300,000원과 자릿수 같음", async () => {
    const { client } = await renderWith({ numHomes: 3 });
    expect(text(client)).toContain("종부세·농특세 360,000원");
    expect(text(client)).toContain("연 보유세 총액 1,512,000원");
  });
});

describe("맨 아래 상세 — 세액공제·농어촌특별세 내역", () => {
  it("기본값: 나이·보유기간 선택칸(사용 가능), 공제 해당 없음, 종부세 줄은 —", async () => {
    const { detail } = await renderWith({});
    const t = text(detail);
    expect(detail).toContain('id="holding-tax-detail"');
    expect(detail.match(/<select/g)?.length).toBe(2);
    expect(detail).not.toContain('disabled=""');
    expect(t).toContain("12월 종부세 상세 — 세액공제·농어촌특별세");
    expect(t).toContain("1세대 1주택 세액공제 (해당 없음) —");
    expect(t).toContain("재산세 합계 (7·9월) 1,404,000원");
    expect(t).toContain("농어촌특별세 (납부할 종부세의 20%) —");
    expect(t).toContain("연 보유세 총액 1,404,000원");
  });
  it("공시 15억·70세·15년: 40% + 50% → 한도 80%, 공제 −720,000원, 종부세 180,000원, 농특세 36,000원", async () => {
    const { detail } = await renderWith({ publishedValue: 1_500_000_000, age: 70, holdingYears: 15 });
    const t = text(detail);
    expect(t).toContain("종부세 산출세액 900,000원");
    expect(t).toContain("1세대 1주택 세액공제 (고령자 40% + 장기보유 50% → 한도 80%) −720,000원");
    expect(t).toContain("납부할 종부세 180,000원");
    expect(t).toContain("농어촌특별세 (납부할 종부세의 20%) 36,000원");
    expect(t).toContain("12월 종부세·농특세 합계 216,000원");
    expect(t).toContain("연 보유세 총액 2,700,000원");
  });
  it("공시 15억·65세·10년: 30% + 40% = 70% (한도 표시 없음)", async () => {
    const { detail } = await renderWith({ publishedValue: 1_500_000_000, age: 65, holdingYears: 10 });
    const t = text(detail);
    expect(t).toContain("1세대 1주택 세액공제 (고령자 30% + 장기보유 40%) −630,000원");
    expect(t).toContain("납부할 종부세 270,000원");
    expect(t).toContain("농어촌특별세 (납부할 종부세의 20%) 54,000원");
  });
  it("2주택 합계 20억: 세액공제 줄 없이 종부세 4,200,000원·농특세 840,000원, 선택칸은 비활성 + 안내", async () => {
    const { detail } = await renderWith({ publishedValue: 2_000_000_000, numHomes: 2, age: 70, holdingYears: 15 });
    const t = text(detail);
    expect(t).not.toContain("1세대 1주택 세액공제 (");
    expect(t).toContain("종부세 4,200,000원");
    expect(t).toContain("농어촌특별세 (납부할 종부세의 20%) 840,000원");
    expect(t).toContain("연 보유세 총액 9,288,000원");
    expect(t).toContain("고령자·장기보유 세액공제는 1세대 1주택자만 받습니다.");
    expect(detail.match(/disabled=""/g)?.length).toBe(2);
  });
});

describe("page.tsx — 상세는 모든 광고 뒤", () => {
  it("렌더 순서: … MultiplexAd → 12월 종부세 상세, 그 뒤 광고 없음", async () => {
    store.inputs = null;
    const { default: Page } = await import("@/app/property-holding-tax-2026/page");
    const html = renderToStaticMarkup(createElement(Page));
    const detailAt = html.indexOf('id="holding-tax-detail"');
    const ads = [...html.matchAll(/data-test-ad="([a-z-]+)"/g)];
    expect(detailAt).toBeGreaterThan(-1);
    expect(ads.map((m) => m[1])).toEqual(["home-top", "result", "guide", "in-article", "coupang", "multiplex"]);
    for (const ad of ads) expect(ad.index ?? Infinity).toBeLessThan(detailAt);
    // FAQ(접힌 details·FAQPage JSON-LD) — 15억 예시에 농특세 포함 금액, 세액공제 안내
    expect(html).toContain("농어촌특별세 18만원(종부세의 20%)이 더해져 108만원입니다(재산세 중복분 공제·세액공제 전).");
    expect(html).toContain("12월 종부세 고지서에는 납부할 종부세의 20%인 농어촌특별세가 함께 부과됩니다.");
  });
});
