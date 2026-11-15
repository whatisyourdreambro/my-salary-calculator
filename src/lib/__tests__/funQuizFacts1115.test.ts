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

// - rich-dna-test: '빚을 내서 추가 매수'를 워렌 버핏(가치 투자의 현인) 답으로 채점했다. 같은 퀴즈의 버핏 답은
//   '잃지 않는 투자' 원금 보존이고, 버핏은 2017년 주주서한(2018-02)에서 4번의 큰 주가 하락을 들어 빌린 돈으로 주식을
//   사는 데 반대했다(보도). 역발상 매수와 버핏 채점은 그대로 두고 자금원만 여유 현금으로 바꾼다(글자 수는 더 짧음).
describe("/fun/rich-dna-test Buffett answer", () => {
  const src = read("src/app/fun/rich-dna-test/RichDNAClient.tsx");

  it("does not score debt-financed crash buying as the Buffett answer", () => {
    expect(src).not.toContain("빚을 내서");
    expect(src).toContain(`{ text: "'지금이 기회다' 여유 현금으로 추가 매수한다", type: "buffett" },`);
  });

  it("keeps the Buffett principle answer and the option order", () => {
    expect(src).toContain(`{ text: "'잃지 않는 투자' 원금 보존이 최우선이다", type: "buffett" },`);
    const crash = /question: "시장이 50% 폭락했을 때, 당신의 행동은\?",\s*answers: \[([\s\S]*?)\]/.exec(src)?.[1] ?? "";
    expect([...crash.matchAll(/type: "(\w+)"/g)].map((m) => m[1])).toEqual(["buffett", "musk", "rockefeller", "templeton"]);
  });
});
