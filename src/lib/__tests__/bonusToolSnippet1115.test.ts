// /tools/finance/bonus 검색 설명 — 연말·1월 성과급 시즌 (2026-11-15 SEASONC, app-tools-fun ideas[2])
// 페이지가 실제로 보여 주는 것만 말한다: 연봉합산 방식 소득세·지방소득세·4대보험, 총 공제율(%)·한계세율, 절세 팁 카드.
// 연도 '2026' 은 1/1 전환 런북 P-6 ③ 몫이라 그대로 둔다(docs/next-upgrade-plan-2026-09-11.md).
import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("/tools/finance/bonus 검색 설명", () => {
  const layout = readFileSync("src/app/tools/finance/bonus/layout.tsx", "utf8");
  const page = readFileSync("src/app/tools/finance/bonus/page.tsx", "utf8");
  it("성과급 종류와 '몇 %' 질문으로 시작하고 연도 라벨은 런북 몫으로 남긴다", () => {
    expect(layout).toContain("연말·1월 성과급(PS·OPI·인센티브) 세금은 몇 %일까? 2026 연봉합산 방식으로");
    expect(layout).toContain('title: "성과급·인센티브 세금 계산기 - 2026 연봉합산 세율"');
  });
  it("설명이 약속하는 항목은 화면에 있다", () => {
    for (const shown of ["총 공제율", "한계세율", "절세 팁", "지방소득세"]) expect(page, shown).toContain(shown);
  });
});
