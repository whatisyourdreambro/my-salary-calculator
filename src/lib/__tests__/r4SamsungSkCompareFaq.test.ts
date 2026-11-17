// /calc/samsung-bonus 접힌 FAQ 'SK하이닉스 성과급과 어떻게 다른가요?' — 9/16 가결 뒤 지급 구조 (R4 SAMSUNG, RL-16 CB-11 = 10월 6645524b1 재이식, 2026-11-18)
//
// 종전 답 '80%는 즉시, 20%는 2년에 걸쳐 이연 지급됩니다'는 2026-09-16 가결안으로 틀렸다: 2025년분 이연분 20%는 2026년 안에
// 한꺼번에 앞당겨 지급하고(세계일보 2026-09-16 '성과급 이연분 선지급'), 2026년분(2027년 초 지급)부터는 당해 현금 50% + 자사주 30%,
// 1년·2년 뒤 자사주 10%씩이다(같은 기사, psData AGREEMENT_2026). 닫힌 FAQ 라 첫 화면 높이 0.
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { AGREEMENT_2026 } from "@/app/calc/sk-hynix-bonus/psData";

const page = readFileSync(resolve(process.cwd(), "src/app/calc/samsung-bonus/page.tsx"), "utf8");
const faq = page.slice(page.indexOf("const FAQ_ITEMS = ["), page.indexOf("export const metadata"));

describe("삼성 성과급 SK 비교 FAQ — 9/16 가결안 지급 구조 (CB-11)", () => {
  it("이연분 조기 지급과 2026년분 새 구조를 말하고, 종전 '2년에 걸쳐 이연 지급됩니다'는 없다", () => {
    const i = faq.indexOf('question: "SK하이닉스 성과급과 어떻게 다른가요?"');
    const answer = faq.slice(i, faq.indexOf("},", i));
    expect(answer).toContain("이연분 20%도 2026년 안에 앞당겨 지급하기로 했고");
    expect(answer).toContain("당해 현금 50%+자사주 30%, 1·2년 후 자사주 10%씩");
    expect(answer).not.toContain("20%는 2년에 걸쳐 이연 지급됩니다");
  });

  it("새 구조 숫자는 SK하이닉스 계산기 정본(psData AGREEMENT_2026)과 같다", () => {
    expect(AGREEMENT_2026.status).toBe("ratified");
    expect(AGREEMENT_2026.newSplit).toEqual({ cashNowPct: 50, stockNowPct: 30, stockYear1Pct: 10, stockYear2Pct: 10 });
  });
});
