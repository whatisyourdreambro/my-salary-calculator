// src/lib/__tests__/salaryRaiseParity.test.ts
//
// /salary-raise-2026 가 홈 연봉 계산기와 같은 정본 엔진을 쓰는지, 본문에 적힌
// 수치가 그 엔진 값과 맞는지 고정한다 (2026-09-25 감사 CALC-06).
// 종전에는 구간표·근로소득공제를 페이지에 따로 두고 "세액공제 20% 가정"으로 계산해
// 연 실수령이 3,000만 −69만 ~ 1.5억 +516만 어긋났고, 본문 수치도 그 모델에서 나왔다.
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

import { calculateSalary2026 } from "@/lib/TaxLogic";
import { calcAnnualNet } from "@/app/salary-raise-2026/Client";

const read = (rel: string) => readFileSync(join(process.cwd(), rel), "utf8");
const engineAnnualNet = (salary: number) => calculateSalary2026(salary, 200_000, 1, 0).netPay * 12;
const man = (won: number) => Math.round(won / 10_000);

describe("연봉 인상 시뮬레이터 — 정본 엔진 일치", () => {
  it("연 실수령이 홈 기본값(비과세 식대 월 20만원·본인 1인)의 calculateSalary2026 × 12 와 같다", () => {
    for (const salary of [24_000_000, 30_000_000, 50_000_000, 55_000_000, 80_000_000, 100_000_000, 150_000_000, 300_000_000]) {
      expect(calcAnnualNet(salary)).toBe(engineAnnualNet(salary));
    }
    expect(calcAnnualNet(0)).toBe(0);
    expect(calcAnnualNet(-1)).toBe(0);
  });

  it("페이지 로컬 세율표·요율 리터럴이 남아 있지 않다", () => {
    const src = read("src/app/salary-raise-2026/Client.tsx");
    expect(src).toContain('from "@/lib/TaxLogic"');
    expect(src).not.toMatch(/TAX_BRACKETS|0\.0475|0\.03595|0\.1314|79_080_000|\* 0\.8\b/);
  });
});

describe("본문 수치 — 엔진 재계산값과 동기화", () => {
  const page = read("src/app/salary-raise-2026/page.tsx");

  it("FAQ: 5,000만 → 5,500만(+10%) 세후 연·월 증가액", () => {
    const diff = engineAnnualNet(55_000_000) - engineAnnualNet(50_000_000);
    expect(page).toContain(`세후 연 실수령은 약 ${man(diff)}만원 증가, 월 약 ${man(diff / 12)}만원 늘어납니다`);
  });

  it("본문: 5년 누적 5% vs 10% 인상 세후 차이 (Client 의 5년 누적 산식과 동일)", () => {
    const cum5 = (pct: number) => {
      let sum = 0;
      let salary = 50_000_000;
      for (let i = 0; i < 5; i++) {
        salary *= 1 + pct / 100;
        sum += calcAnnualNet(salary) - calcAnnualNet(50_000_000);
      }
      return sum;
    };
    const gap = Math.round((cum5(10) - cum5(5)) / 1_000_000) * 100; // 100만원 단위 반올림
    expect(page).toContain(`차이가 약 ${gap.toLocaleString("ko-KR")}만원에 달합니다`);
  });

  it("본문: 24%·35% 구간 실수령 유지율 범위", () => {
    // 과세표준 24% 구간(엔진 기준 연봉 약 7,400만~1억 800만) · 35% 구간(약 1억 1,200만~1억 7,000만)
    const kept = (salary: number) =>
      ((engineAnnualNet(salary * 1.1) - engineAnnualNet(salary)) / (salary * 0.1)) * 100;
    for (let s = 74_000_000; s <= 100_000_000; s += 2_000_000) {
      expect(kept(s)).toBeGreaterThanOrEqual(65); // 통합(2026-09-25): TAX A17 간이세액표 엔진으로 7,400만 65.2%
      expect(kept(s)).toBeLessThanOrEqual(70.5);
    }
    for (let s = 112_000_000; s <= 150_000_000; s += 2_000_000) {
      expect(kept(s)).toBeGreaterThanOrEqual(54);
      expect(kept(s)).toBeLessThanOrEqual(57.5);
    }
    expect(page).toContain("24% 구간 내 인상은 유지율 65~70%");
    expect(page).toContain("인상은 54~57% 수준입니다");
  });

  it("종전 모델의 '세액공제 20% 가정' 문구가 남아 있지 않다", () => {
    expect(page).not.toContain("세액공제 20% 가정");
    expect(page).not.toContain("세액공제율 20% 가정");
  });
});
