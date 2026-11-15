// /fun/rich-dna-test 버핏 답 사실 가드 (2026-11-15 감사 app-tools-fun-b02-F09, N2-app-tools-fun-10)
//
// '빚을 내서 추가 매수'를 워렌 버핏(가치 투자의 현인) 답으로 채점했다. 같은 퀴즈의 버핏 답은
// '잃지 않는 투자' 원금 보존이고, 버핏은 2017년 주주서한(2018-02)에서 4번의 큰 주가 하락을 들어 빌린 돈으로 주식을
// 사는 데 반대했다(보도). 역발상 매수와 버핏 채점은 그대로 두고 자금원만 여유 현금으로 바꾼다(글자 수는 더 짧음).
// 광고 위 글자 변경이라 이 가드는 문구 커밋과 같은 커밋에만 둔다(스윕에서 그 커밋 하나만 되돌릴 수 있게).
// 소스 문자열만 읽는다(렌더·광고 요청 없음).
import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const src = readFileSync("src/app/fun/rich-dna-test/RichDNAClient.tsx", "utf8").replace(/\r\n/g, "\n");

describe("/fun/rich-dna-test Buffett answer", () => {
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
