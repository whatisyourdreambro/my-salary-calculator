// /tools/finance/irp 검색 설명 — 12월 납입 시즌 (2026-11-15 SEASONC, app-tools-fun ideas[1])
// 연금계좌 세액공제는 그해(과세기간 1/1~12/31) 연금계좌에 납입한 금액이 대상이고, 연금저축 연 600만원·합산 연 900만원까지,
// 공제율 12%(총급여 5,500만원·종합소득 4,500만원 이하 15%) — 소득세법 제59조의3 제1항(법률 제21221호, 2026-07-01 시행).
// 지방소득세 포함 13.2%·16.5%, 900만원이면 118.8만원·148.5만원. 메타만 바꾸므로 화면·광고 위치 불변.
import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("/tools/finance/irp 검색 설명", () => {
  const src = readFileSync("src/app/tools/finance/irp/page.tsx", "utf8");
  it("12월 31일 납입분 규칙으로 시작하고 공제율·예상액은 법정 값 그대로", () => {
    expect(src).toContain("2026년 IRP·연금저축 세액공제는 12월 31일까지 납입한 금액이 대상입니다.");
    expect(src).toContain("총급여 5,500만원 이하 16.5%·초과 13.2%(지방소득세 포함)");
    expect(src).toContain("예상액 148.5만원·118.8만원");
    expect(9_000_000 * 0.165).toBe(1_485_000);
    expect(Math.round(9_000_000 * 0.132)).toBe(1_188_000);
  });
});
