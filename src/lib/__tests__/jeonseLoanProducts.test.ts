// /calc/jeonse-loan 회귀 가드 (2026-10-05 감사 code3-03)
// 출처: 주택도시기금 상품 안내(nhuf.molit.go.kr) 2026-10-05 확인 — 버팀목전세자금 FP05020101, 신혼부부전용 전세자금
// FP05020401, 청년전용 버팀목전세자금 FP05020301
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { calcJeonseLoans, cheapestEligible, JEONSE_LOAN_PRODUCTS } from "@/lib/jeonseLoanProducts";

const byName = (deposit: number, income: number) =>
  Object.fromEntries(calcJeonseLoans(deposit, income).map((r) => [r.name, r]));

describe("정책상품 한도·소득 요건", () => {
  it("기본값(보증금 3억·합산 6천만) — 버팀목·청년은 소득 요건 초과로 대상 아님 (종전 2.4억)", () => {
    const r = byName(300_000_000, 60_000_000);
    expect(r["버팀목 전세대출"].eligible).toBe(false);
    expect(r["버팀목 전세대출"].limit).toBe(0);
    expect(r["청년 전세 (만 19~34)"].eligible).toBe(false);
    expect(r["신혼부부 버팀목"].limit).toBe(240_000_000); // min(3억 x 80%, 2.5억)
    expect(r["일반 전세대출"].limit).toBe(240_000_000); // 사이트 가정값 min(80%, 연소득 x 4) 그대로
  });
  it("소득 요건 안이면 호당 한도·보증금 비율 적용", () => {
    const r = byName(300_000_000, 45_000_000);
    expect(r["버팀목 전세대출"].limit).toBe(120_000_000); // min(3억 x 70%, 1.2억)
    expect(r["청년 전세 (만 19~34)"].limit).toBe(150_000_000); // min(3억 x 80%, 1.5억)
    const small = byName(100_000_000, 45_000_000);
    expect(small["버팀목 전세대출"].limit).toBe(70_000_000); // 1억 x 70%
    expect(small["청년 전세 (만 19~34)"].limit).toBe(80_000_000); // 1억 x 80%
  });
  it("금리는 공시 범위의 최저값 — 버팀목 2.5 / 신혼 1.9 / 청년 2.2", () => {
    const rates = Object.fromEntries(JEONSE_LOAN_PRODUCTS.map((p) => [p.name, p.rate]));
    expect(rates["버팀목 전세대출"]).toBe(2.5);
    expect(rates["신혼부부 버팀목"]).toBe(1.9);
    expect(rates["청년 전세 (만 19~34)"]).toBe(2.2);
  });
  it("최저 비용 배지는 대상 상품 중에서만", () => {
    const best = cheapestEligible(calcJeonseLoans(300_000_000, 60_000_000));
    expect(best?.name).toBe("신혼부부 버팀목");
    expect(cheapestEligible(calcJeonseLoans(0, 60_000_000))).toBeNull();
  });
});

describe("문구", () => {
  const client = readFileSync(resolve(process.cwd(), "src/app/calc/jeonse-loan/Client.tsx"), "utf8");
  const page = readFileSync(resolve(process.cwd(), "src/app/calc/jeonse-loan/page.tsx"), "utf8");
  it("입력 라벨은 합산 연소득 (글자 수 그대로)", () => {
    expect(client).toContain(">합산 연소득</label>");
    expect(client).not.toContain("salary * 4");
  });
  it("본문 정책상품 목록 — 공시 금리·한도", () => {
    expect(page).toContain("부부합산 5천만원 이하, 연 2.5~3.5%, 최대 1.2억");
    expect(page).toContain("부부합산 7,500만원 이하, 연 1.9~3.3%, 최대 2.5억");
    expect(page).toContain("만 19~34세 세대주, 연 2.2~3.3%, 최대 1.5억");
    expect(page).not.toContain("본 계산기로 두 시나리오 비교 가능");
    expect(page).not.toContain("8,500만원 이하(맞벌이 1억)");
  });
});
