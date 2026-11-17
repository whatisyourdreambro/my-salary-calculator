// SK하이닉스 2026 상반기 PI 지급일 7/30 — 원장 X-06 해소 (2026-11-18 R4 N2-calc-10 calc-04-F01·F11·F12·F21·F22)
//
// 파이낸셜뉴스 2026-07-26(https://www.fnnews.com/news/202607260555359670)·인사이트 2026-07-27 은 '오는 30일' 지급 예정으로 썼다.
// 옛 2026-07-28 은 2025년 상반기 PI 보도(이데일리 2025-07-23)와 같은 날짜였다.
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { PI_2026 } from "@/app/calc/sk-hynix-bonus/psData";

const read = (p: string) => readFileSync(resolve(process.cwd(), p), "utf8");
const page = read("src/app/calc/sk-hynix-bonus/page.tsx");
const client = read("src/app/calc/sk-hynix-bonus/Client.tsx");

describe("SK하이닉스 2026 상반기 PI 지급일 (calc-04-F01)", () => {
  it("PI_2026.h1.paidDate 는 2026-07-30", () => {
    expect(PI_2026.h1.paidDate).toBe("2026-07-30");
    expect(PI_2026.h1.rate).toBe(150);
  });

  it("접힌 FAQ 는 7월 30일 지급 예정 보도로 쓴다(근거 표현 포함)", () => {
    expect(page).toContain("2026년 상반기 PI는 최대치인 월 기본급의 150%로, 7월 30일 지급 예정으로 보도됐습니다(파이낸셜뉴스 2026-07-26 등).");
    expect(page).not.toContain("7월 28일 급여와 함께 지급됐습니다");
  });
});

describe("SK하이닉스 접힌 FAQ·입력 위생 (calc-04-F11·F12·F21·F22)", () => {
  it("2025년분 PS+PI 3,264% 는 연봉 1억 기준 약 1억 6천만원(3,264% × 500만원 = 1억 6,320만원)", () => {
    expect(page).toContain("PS+PI 합계 3,264%로, 연봉 1억원 직원 기준 약 1억 6천만원 수준입니다.");
    expect(page).not.toContain("약 1억 5천만원 수준");
  });

  it("국민연금 상한은 기준소득월액", () => {
    expect(page).toContain("국민연금은 기준소득월액 상한(2026.7~2027.6 기준 연 7,908만원)");
    expect(page).not.toContain("보수월액 상한");
  });

  it("영업손실을 넣어도 PS 재원은 음수가 되지 않는다", () => {
    expect(client).toContain("const psPoolWon = Math.max(0, opiWon) * AGREEMENT_2026.poolRate;");
    expect(client).toMatch(/<NumberInput\s+allowNegative=\{false\}\s+type="number"\s+value=\{opiTrillion\}/);
  });

  it("세액공제 슬라이더 이름, 타결 안내 상자 이름", () => {
    expect(client).toContain('aria-label="추가 세액공제 가정 (%)"');
    expect(page).toContain('aria-label={STATUS === "ratified" ? "2026 임단협 타결 안내" : "2026 임단협 잠정합의 안내"}');
  });
});

describe("SK하이닉스 주가 시뮬레이터 버튼 줄 (calc-04-F02)", () => {
  const sim = read("src/app/calc/sk-hynix-bonus/StockScenarioSimulator.tsx");
  it("슬라이더는 줄어들 수 있고(min-w-0), 버튼 묶음은 줄지 않는다(shrink-0)", () => {
    expect(sim).toContain('className="min-w-0 flex-1 accent-primary"');
    expect(sim).toContain('<div className="flex shrink-0 gap-1">');
  });
  it("휴대폰에서는 -30·-10·+100 만 숨긴다(기본값 +20 과 0·-50·+50 은 보임)", () => {
    expect(sim).toContain("const PHONE_HIDDEN_PRESETS: ReadonlySet<number> = new Set([-30, -10, 100]);");
    expect(sim).toContain('${PHONE_HIDDEN_PRESETS.has(p) ? " hidden sm:inline-block" : ""}');
    expect(sim).toContain("const CHANGE_PRESETS = [-50, -30, -10, 0, 20, 50, 100];");
  });
});

describe("2026 상반기 PI 옛 날짜(7/28)가 코드·데이터에 남지 않는다 (calc-04-F01)", () => {
  /** // 주석은 빼고 본다(옛 날짜를 설명하는 주석은 허용) */
  const code = (p: string) => read(p).replace(/\/\/[^\n]*/g, "");
  for (const p of [
    "src/app/calc/sk-hynix-bonus/page.tsx",
    "src/app/calc/sk-hynix-bonus/Client.tsx",
    "src/app/calc/sk-hynix-bonus/psData.ts",
    "src/app/calc/sk-hynix-bonus/StockScenarioSimulator.tsx",
    "src/app/calc/sk-hynix-bonus/StockScenarioSection.tsx",
    "src/data/bonusData.ts",
    "src/data/bonusCalcHub.ts",
  ]) {
    it(p, () => {
      const src = code(p);
      expect(src).not.toContain("7/28");
      expect(src).not.toContain("2026-07-28");
      expect(src).not.toContain("7월 28일");
    });
  }
  it("화면·리포트·허브 소식은 7/30", () => {
    expect(read("src/app/calc/sk-hynix-bonus/Client.tsx")).toContain("2026 상반기는 150% 확정(7/30 지급)");
    expect(page).toContain("30일 지급됐습니다(상반기 영업이익 98.2조원)");
    expect(page).toContain("(7/30 지급)");
    expect(read("src/app/calc/sk-hynix-bonus/psData.ts")).toContain('fact: "2026 상반기 PI 150% 확정(7/30 지급)"');
    expect(read("src/data/bonusData.ts")).toContain('note: "2026년 상반기 PI 최대치 확정 — 2026-07-30 지급"');
    expect(read("src/data/bonusCalcHub.ts")).toContain('date: "2026-07-30"');
  });
});
