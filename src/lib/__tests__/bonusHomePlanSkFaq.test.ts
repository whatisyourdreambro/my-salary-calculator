// /calc/bonus-home-plan 접힌 FAQ 'SK하이닉스 PS 이연분' 마지막 문장 (2026-11-15 N2-calc-14 calc-01-F01 FAQ)
//
// 2026-09-16 가결안: 2025년 실적분 PS 중 2년에 걸쳐 주기로 했던 이연분 20%를 올해 한꺼번에 선지급(세계일보 2026-09-16).
// 엔진(compEngines.computeSk)은 같은 날 커밋에서 2027·2028년 옛 이연 현금을 뺐다. FAQ 는 InArticleAd 아래·GuideMidAd
// 위의 닫힌 details 이고, 새 문장은 더 짧으며(14px 538.3px -> 513.5px) 펼친 상태 줄 수 모의(320~1920px)에서도
// 줄이 늘어나는 폭이 없다.
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const page = readFileSync(resolve(process.cwd(), "src/app/calc/bonus-home-plan/page.tsx"), "utf8");

describe("bonus-home-plan SK 이연분 FAQ (calc-01-F01)", () => {
  it("2025년분 이연 20%는 2026년에 받아 2027년 이후 더하지 않는다", () => {
    expect(page).toContain("2025년분 PS 이연분 20%는 가결안에 따라 2026년에 받아 2027년 이후엔 더하지 않습니다.");
    expect(page).not.toContain("2027·2028년에 이연 현금 10%씩");
    expect(page).not.toContain("옛 방식이라");
  });
});
