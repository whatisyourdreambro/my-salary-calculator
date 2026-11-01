// /calc/jeonse-loan 회귀 가드 (2026-10-05 감사 code3-03, 2026-11-01 STR-02-k 재대조)
// 출처: 주택도시기금 상품 안내(nhuf.molit.go.kr) 2026-10-05 확인, 2026-11-01 재대조 — 버팀목전세자금 FP05020101,
// 신혼부부전용 전세자금 FP05020401, 청년전용 버팀목전세자금 FP05020301
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
  it("합산 연소득 0원(입력란을 비운 순간)에도 NaN 없음 — 정책상품은 보증금 비율·호당 한도로", () => {
    const results = calcJeonseLoans(300_000_000, 0);
    for (const x of results) {
      expect(Number.isFinite(x.limit), x.name).toBe(true);
      expect(Number.isFinite(x.monthlyInterest), x.name).toBe(true);
      expect(Number.isFinite(x.annualInterest), x.name).toBe(true);
    }
    const r = byName(300_000_000, 0);
    expect(r["버팀목 전세대출"].limit).toBe(120_000_000);
    expect(r["신혼부부 버팀목"].limit).toBe(240_000_000);
    expect(r["청년 전세 (만 19~34)"].limit).toBe(150_000_000);
    expect(r["일반 전세대출"].limit).toBe(0); // 사이트 가정값 연소득 x 4
  });
});

describe("정책상품 네 값 — 주택도시기금 상품 페이지 2026-11-01 재대조 (6.27 대책 한도 축소 뒤 현행)", () => {
  const pick = (name: string) => {
    const p = JEONSE_LOAN_PRODUCTS.find((x) => x.name === name);
    return p && { incomeLimit: p.incomeLimit, rate: p.rate, depositRatio: p.depositRatio, cap: p.cap };
  };
  it("소득 요건·금리 하한·보증금 비율·수도권 호당 한도", () => {
    // FP05020101 버팀목: 5천만원 이하, 연 2.5~3.5%, 전세금액 70%, 일반가구 수도권 1.2억
    expect(pick("버팀목 전세대출")).toEqual({ incomeLimit: 50_000_000, rate: 2.5, depositRatio: 0.7, cap: 120_000_000 });
    // FP05020401 신혼부부전용: 7.5천만원 이하, 연 1.9~3.3%, 전세금액 80%, 수도권 2.5억 (2025.6.27. 이전 계약분 3억은 쓰지 않음)
    expect(pick("신혼부부 버팀목")).toEqual({ incomeLimit: 75_000_000, rate: 1.9, depositRatio: 0.8, cap: 250_000_000 });
    // FP05020301 청년전용: 5천만원 이하, 연 2.2~3.3%, 전세금액 80%, 1.5억 (2025.6.27. 이전 계약분 2억은 쓰지 않음)
    expect(pick("청년 전세 (만 19~34)")).toEqual({ incomeLimit: 50_000_000, rate: 2.2, depositRatio: 0.8, cap: 150_000_000 });
  });
  it("신혼 호당 한도 2.5억이 보증금 80% 보다 작으면 2.5억 (보증금 4억)", () => {
    const r = byName(400_000_000, 70_000_000);
    expect(r["신혼부부 버팀목"].eligible).toBe(true);
    expect(r["신혼부부 버팀목"].limit).toBe(250_000_000);
  });
  it("소득 요건 경계 — 요건 금액까지는 대상, 1원 넘으면 대상 아님", () => {
    expect(byName(300_000_000, 50_000_000)["버팀목 전세대출"].eligible).toBe(true);
    expect(byName(300_000_000, 50_000_001)["버팀목 전세대출"].eligible).toBe(false);
    expect(byName(300_000_000, 75_000_000)["신혼부부 버팀목"].eligible).toBe(true);
    expect(byName(300_000_000, 75_000_001)["신혼부부 버팀목"].eligible).toBe(false);
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

describe("결과 카드 폭 — 결과 광고 위 (기본값 상태)", () => {
  // 한글 1em, 숫자·기호 약 0.55em, 공백 0.25em
  const em = (s: string) => [...s].reduce((w, c) => w + (/[가-힣]/.test(c) ? 1 : c === " " ? 0.25 : 0.55), 0);
  it("대상 아님·소득 초과 문구는 종전 금액·금리 문구보다 좁다", () => {
    expect(em("대상 아님")).toBeLessThan(em("240,000,000원"));
    expect(em("5천만 초과")).toBeLessThan(em("금리 연 2.4%"));
    expect(em("—")).toBeLessThan(em("1,000,000원"));
    const client = readFileSync(resolve(process.cwd(), "src/app/calc/jeonse-loan/Client.tsx"), "utf8");
    expect(client).toContain("천만` : `${fmt(r.incomeLimit / 10_000)}만`} 초과`");
  });
});

describe("금리 줄 — 정책상품은 '최저 연 x%' (종전 '금리 연 x%' 와 같은 글자 구성)", () => {
  it("범위 하한임을 같은 폭으로 표시", () => {
    const client = readFileSync(resolve(process.cwd(), "src/app/calc/jeonse-loan/Client.tsx"), "utf8");
    expect(client).toContain('`${r.rateIsFloor ? "최저" : "금리"} 연 ${r.rate.toFixed(1)}%`');
    const shape = (s: string) => s.split(" ").map((w) => [...w].filter((c) => /[가-힣]/.test(c)).length + "|" + w.replace(/[가-힣]/g, "").length);
    expect(shape("최저 연 1.9%")).toEqual(shape("금리 연 2.4%"));
  });
});
