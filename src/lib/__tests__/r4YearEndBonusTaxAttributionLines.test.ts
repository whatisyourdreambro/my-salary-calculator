// /calc/year-end-bonus-tax 광고 위 목록 두 줄 — '다음해로 이연·분산'이 아니라 귀속연도 기준 (R4 SAMSUNG, N2-calc-01 5단계, 2026-11-18)
//
// 근로소득 귀속연도는 지급일이 아니라 근로제공일(급여)·개인별 지급액 확정 연도(성과급)다(국세청 근로소득 수입시기 안내,
// 사전-2025-법규소득-1070). 접힌 FAQ·메타는 N2-calc-01(9536cffea)이 고쳤고, GuideMidAd 위 목록 두 줄은 더 짧은 문구로
// 여기서 고친다(verify calc-b01-M01 의 허용 문구). 사이트 글꼴 14px 폭: 138.30px -> 114.38px, 138.30px -> 126.34px.
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const flat = readFileSync(resolve(process.cwd(), "src/app/calc/year-end-bonus-tax/page.tsx"), "utf8").replace(/\s*\r?\n\s*/g, " ");

describe("year-end-bonus-tax 광고 위 목록 — 귀속연도 기준 (N2-calc-01 5단계)", () => {
  it("다음해 소득 감소 예상 줄", () => {
    expect(flat).toContain("대폭 줄어들 때 다음해 귀속 소득이면 낮은 세율 구간 적용 가능");
    expect(flat).not.toContain("일부를 다음해로 이연하면");
  });
  it("한계세율 구간 진입 회피 줄", () => {
    expect(flat).toContain("진입할 때, 일부가 다음해 귀속이면 24% 구간 유지 가능");
    expect(flat).not.toContain("일부를 다음해로 분산하면");
  });
  it("두 줄 모두 GuideMidAd 위에 있다(광고 위 같은 자리 교체)", () => {
    const ad = flat.indexOf("<GuideMidAd />");
    expect(flat.indexOf("다음해 귀속 소득이면")).toBeLessThan(ad);
    expect(flat.indexOf("일부가 다음해 귀속이면")).toBeLessThan(ad);
  });
});
