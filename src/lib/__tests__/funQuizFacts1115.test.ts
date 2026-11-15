// /fun/what-to-buy·/fun/rich-dna-test 사실 가드 (2026-11-15 감사 app-tools-fun-b02-F03·F09, N2-app-tools-fun-10)
//
// - what-to-buy: ITEMS 가 가격순이 아니라(치킨 20000 이 커피 5000 앞) '살 수 있는 마지막 항목'을 고르는 search() 가
//   2만~14만9,999원 예산에서 늘 커피를 골랐다(기본 10만원 포함). 설명은 '치킨부터 강남 빌딩까지'.
// 소스 문자열만 읽는다(렌더·광고 요청 없음).
import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const read = (file: string) => readFileSync(file, "utf8").replace(/\r\n/g, "\n");

describe("/fun/what-to-buy item order", () => {
  const src = read("src/app/fun/what-to-buy/page.tsx");
  const block = /const ITEMS = \[([\s\S]*?)\n \];/.exec(src)?.[1] ?? "";
  const items = [...block.matchAll(/\{ name: "([^"]+)", price: (\d+),/g)].map((m) => ({ name: m[1], price: Number(m[2]) }));
  // search() 와 같은 규칙: 예산 안에서 살 수 있는 항목 중 마지막
  const pick = (budget: number) => {
    const affordable = items.filter((i) => i.price <= budget);
    return affordable[affordable.length - 1]?.name;
  };

  it("parses the item list", () => {
    expect(items.length).toBeGreaterThanOrEqual(8);
    expect(src).toContain("const item = affordable[affordable.length - 1];");
  });

  it("keeps ITEMS in ascending price order", () => {
    for (let i = 1; i < items.length; i++) expect(items[i].price, items[i].name).toBeGreaterThan(items[i - 1].price);
  });

  it("the default 100,000원 budget buys 치킨, and 치킨 is reachable", () => {
    expect(src).toContain("useState(100000)");
    expect(pick(100_000)).toBe("치킨");
    expect(pick(20_000)).toBe("치킨");
    expect(pick(19_999)).toBe("커피");
    expect(pick(150_000)).toBe("넷플릭스 1년 구독");
  });
});
