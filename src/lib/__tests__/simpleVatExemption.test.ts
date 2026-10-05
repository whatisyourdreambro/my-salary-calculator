// 간이과세자 vs 일반과세자 — 공급대가 4,800만원 미만 납부의무 면제 (2026-10-05 감사 code56-03, 부가가치세법 제69조 제1항)
import { describe, expect, it } from "vitest";
import { allCalculators } from "@/lib/simpleCalculators";

const calc = allCalculators.find((c) => c.slug === "simple-vs-general-vat")!;

describe("simple-vs-general-vat", () => {
  it("매출 4,000만원 — 간이 부가세 0원, 절감액 = 일반 부가세 전액 (종전 120만·180만)", () => {
    const r = calc.compute({ revenue: 40_000_000, purchase: 10_000_000, simpleRate: 3 });
    expect(r.primary.value).toBe(0);
    expect(r.secondary?.find((x) => x.label === "간이 절감액")?.value).toBe(3_000_000);
    expect(r.note).toContain("납부의무 면제");
  });
  it("기본값(6,000만원)은 종전과 같다", () => {
    const r = calc.compute({ revenue: 60_000_000, purchase: 20_000_000, simpleRate: 3 });
    expect(r.primary.value).toBe(1_800_000);
    expect(r.note).toContain("1억 400만원 미만 간이과세 가능");
  });
  it("접힌 FAQ 에 면제 규정 안내", () => {
    expect(calc.faqs?.map((f) => f.a).join(" ")).toContain("4,800만원 미만이면 부가세 납부의무가 면제");
  });
});
