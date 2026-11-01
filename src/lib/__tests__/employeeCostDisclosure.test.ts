// 직원 1명 인건비 간이 계산 — 4대보험 회사부담 10.5% 의 산재 몫 안내 (2026-10-05 감사 code56-04)
// 국민연금 4.75% + 건강 약 4.07% + 고용 약 1.15% = 약 9.97% → 10.5% 에는 산재가 0.5%p 안팎만 들어 있다.
import { describe, expect, it } from "vitest";
import { allCalculators } from "@/lib/simpleCalculators";

const calc = allCalculators.find((c) => c.slug === "employee-cost-quick")!;

describe("employee-cost-quick 안내", () => {
  it("FAQ 가 10.5% 의 산재 몫이 작다는 점을 밝힌다", () => {
    const faq = calc.faqs?.find((f) => f.q.includes("10.5%"))?.a ?? "";
    expect(faq).toContain("0.5%p 안팎만 들어 있는 어림값");
    expect(faq).not.toContain("10.5%는 일반적인 어림값입니다");
  });
  it("유의사항 문구는 원문보다 글자가 늘지 않는다 (광고 위)", () => {
    const before = "4대보험 회사부담 10.5%는 어림값이며 산재보험 요율 등은 업종·연도별로 다릅니다.";
    const after = "4대보험 회사부담 10.5%는 산재보험(업종별)을 낮게 잡은 어림값입니다.";
    expect(calc.caveats).toContain(after);
    const count = (s: string) => [[...s].filter((c) => /[가-힣]/.test(c)).length, [...s].filter((c) => !/[가-힣]/.test(c)).length];
    expect(count(after)[0]).toBeLessThanOrEqual(count(before)[0]);
    expect(count(after)[1]).toBeLessThanOrEqual(count(before)[1]);
  });
});
