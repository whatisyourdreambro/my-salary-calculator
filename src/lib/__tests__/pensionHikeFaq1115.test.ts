// 국민연금 인상 계산기 접힌 FAQ 의 연도별 요율·월 보험료 예시 고정 (2026-11-15 SEASONA, 감사 calc ideas[1])
// 요율: 국민연금공단 연금보험료 안내 — 2026년 9.5% 에서 매년 0.5%p 씩 8년, 2033년부터 13% (직장가입자는 근로자·사용자 절반씩).
// 예시 금액은 기준소득월액 × 근로자 요율(천 원 미만 절사 뒤 원 단위, 계산기 엔진 pensionHike.ts 와 같은 방식)이다.
import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { calculatePensionHike } from "@/lib/pensionHike";

const src = readFileSync("src/app/calc/pension-hike-2027/page.tsx", "utf8");
const answers = [...src.matchAll(/answer:\s*\n?\s*"([^"]+)"/g)].map((m) => m[1]);
/** 법정 스케줄 — 총 보험료율(%) */
const TOTAL: Record<number, number> = { 2026: 9.5, 2027: 10, 2028: 10.5, 2029: 11, 2030: 11.5, 2031: 12, 2032: 12.5, 2033: 13 };
const won = (n: number) => `${Math.round(n).toLocaleString("en-US")}원`;
const employee = (base: number, year: number) => (base * TOTAL[year]) / 2 / 100;

describe("국민연금 인상 계산기 FAQ — 연도별 요율·월 보험료 (SEASONA calc ideas[1])", () => {
  it("FAQ 는 5개 그대로이고 모두 기본 닫힘 details 다 (광고 위 닫힌 높이 불변)", () => {
    expect(answers).toHaveLength(5);
    expect(src).toMatch(/<details key=\{idx\} className=/);
    expect(src).not.toMatch(/<details[^>]*\bopen\b/);
  });

  it("첫 답: 2026~2033 연도별 총 요율과 근로자 몫이 법정 스케줄과 같다", () => {
    for (const [year, total] of Object.entries(TOTAL)) {
      const t = total.toFixed(1);
      const half = Number.isInteger(total / 2) ? (total / 2).toFixed(1) : String(total / 2);
      const label = year === "2033" ? "2033년 이후" : `${year}년`;
      expect(answers[0], year).toContain(`${label} ${t}%(${half}%)`);
    }
    expect(answers[0]).toContain("국민연금공단 연금보험료 안내 기준");
  });

  it("둘째 답: 300만·500만·상한 659만원 예시 금액 = 기준소득월액 × 근로자 요율", () => {
    for (const [base, years] of [[3_000_000, [2026, 2027, 2030, 2033]], [5_000_000, [2026, 2027, 2030, 2033]]] as const) {
      for (const y of years) expect(answers[1], `${base} ${y}`).toContain(won(employee(base, y)));
    }
    expect(answers[1]).toContain(`2026년 ${won(employee(6_590_000, 2026))}, 2027년 상반기 ${won(employee(6_590_000, 2027))}`);
    // 2026·2027 값은 계산기 엔진(같은 기준소득월액·상한)과도 같다
    const capped = calculatePensionHike("6,590,000")!;
    expect(won(capped.p2026)).toBe("313,025원");
    expect(won(capped.p2027)).toBe("329,500원");
    const r300 = calculatePensionHike("3,000,000")!;
    expect([won(r300.p2026), won(r300.p2027)]).toEqual(["142,500원", "150,000원"]);
  });

  it("상한은 매년 7월 다시 정해진다는 단서를 함께 둔다 (2028년 이후 상한 금액은 쓰지 않는다)", () => {
    expect(answers[1]).toContain("상한은 매년 7월 다시 정해집니다");
    expect(answers[1]).not.toMatch(/20(?:28|29|3\d)년 3\d\d,\d{3}원/);
  });
});
