// 직원 1명 인건비 간이 계산 — 4대보험 회사부담 안내 (2026-10-05 감사 code56-04, 2026-11-15 RL-10 CS-21 로 갱신)
// 종전: 10.5% 어림값(국민연금 4.75% + 건강 약 4.07% + 고용 약 1.15% = 약 9.97% 에 산재 0.5%p 안팎)이라 산재 몫이 작다고 밝혔다.
// RL-10(10월 승인 CS-21): 계산을 2026년 요율 합계 약 11.44%(산재 평균 1.47% 포함)로 바꿨으므로 기대값을 새 사실로 고쳤다.
import { describe, expect, it } from "vitest";
import { allCalculators } from "@/lib/simpleCalculators";

const calc = allCalculators.find((c) => c.slug === "employee-cost-quick")!;

describe("employee-cost-quick 안내", () => {
  it("FAQ 가 11.44% 의 구성(산재 2026년 평균 1.47%·고용안정 0.25%)을 밝힌다", () => {
    const faq = calc.faqs?.find((f) => f.q.includes("11.4%"))?.a ?? "";
    expect(faq).toContain("산재보험(2026년 평균 1.47%, 업종별 요율)을 더하면 약 11.44%");
    expect(faq).toContain("150인 미만 기업의 고용안정·직능개발 0.25%");
    expect(faq).not.toContain("0.5%p 안팎만 들어 있는 어림값");
    expect(faq).not.toContain("10.5%");
  });
  it("유의사항 문구는 바로 앞 운영 문구보다 글자가 늘지 않는다 (광고 위)", () => {
    // before = 2026-10-05 code56-04 이후 운영 문구(bda78b0da), after = RL-10 정정 문구
    const before = "4대보험 회사부담 10.5%는 산재보험(업종별)을 낮게 잡은 어림값입니다.";
    const after = "4대보험 회사부담 11.4%는 산재보험을 평균 요율로 잡은 어림값입니다.";
    expect(calc.caveats).toContain(after);
    const count = (s: string) => [[...s].filter((c) => /[가-힣]/.test(c)).length, [...s].filter((c) => !/[가-힣]/.test(c)).length];
    expect(count(after)[0]).toBeLessThanOrEqual(count(before)[0]);
    expect(count(after)[1]).toBeLessThanOrEqual(count(before)[1]);
  });
});
