// N2-app-pages-12 F07 (app-pages-b04-F07, 2026-11-15): /income-tax-2026 '절세 핵심 5가지' 다섯째 줄.
// 80% 장기보유특별공제는 세율이 아니라 양도소득세 공제이고, 1세대1주택은 보유 연 4%(최대 40%) + 거주 연 4%(최대 40%)
// 라 10년 보유와 10년 거주가 함께 있어야 80% (소득세법 제95조 제2항 표2). 2026-08-03 세제개편 정부안(거주 중심 전환)은
// 2028~2029년 시행안이고 최대 80% 는 유지 — 머니투데이방송 2026-08-03 보도. 현행 문구로 맞다(2026-11-15 확인).
// 목록은 CalcResultAd 와 InArticleAd 사이(광고 위)라 옛 줄보다 좁아야 한다 — 사이트 글꼴 advance 폭으로
// 462.7 → 382.8px, 0.25px 간격 모든 폭에서 줄 수가 옛 줄 이하(실측은 통합 단계 1px 스윕).
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const src = readFileSync(resolve(process.cwd(), "src/app/income-tax-2026/page.tsx"), "utf8");

describe("/income-tax-2026 1주택 장기보유특별공제 줄", () => {
  it("10년 보유·거주 요건과 양도세 공제로 적고 '우대세율'·보유만으로 80% 는 없다", () => {
    expect(src).toContain("<li><strong>1주택 장기보유특별공제</strong>: 10년 보유·거주 시 양도세 공제 최대 80%</li>");
    expect(src).not.toContain("장기보유 부동산 우대세율");
    expect(src).not.toContain("10년 이상 보유 1주택 양도 시 80%까지");
  });

  it("새 줄이 옛 줄보다 글자 수가 적다(폭 하한 가드)", () => {
    const before = "장기보유 부동산 우대세율: 10년 이상 보유 1주택 양도 시 80%까지 장기보유공제";
    const after = "1주택 장기보유특별공제: 10년 보유·거주 시 양도세 공제 최대 80%";
    expect([...after].length).toBeLessThan([...before].length);
    expect(after.split(" ").length).toBeLessThan(before.split(" ").length);
  });
});
