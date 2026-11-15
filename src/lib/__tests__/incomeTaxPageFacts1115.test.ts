// N2-app-pages-12 F06 (app-pages-b04-F06, 2026-11-15): /income-tax-2026 '누가 종합소득세를 신고해야 하나요?' 목록의
// 기타소득자 기준은 받은 돈(수입)이 아니라 기타소득금액(필요경비 뺀 금액) 300만원 — 300만원 이하이면 분리과세 선택
// (소득세법 제14조 제3항 제8호). 강연료·원고료는 필요경비 60%라 수입 약 750만원이 소득금액 300만원이다.
// 목록은 CalcResultAd 와 InArticleAd 사이(광고 위)라 옛 줄보다 좁아야 한다 — 사이트 글꼴 advance 폭으로
// 269.6 → 266.0px, 0.25px 간격 모든 폭에서 줄 수가 옛 줄 이하(실측은 통합 단계 1px 스윕).
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const src = readFileSync(resolve(process.cwd(), "src/app/income-tax-2026/page.tsx"), "utf8");
const hangul = (s: string) => [...s].filter((c) => /[가-힣]/.test(c)).length;

describe("/income-tax-2026 기타소득자 신고 기준", () => {
  it("기타소득금액 300만원 초과로 적고 '연 300만원 초과'(수입처럼 읽힘)는 없다", () => {
    expect(src).toContain("<li><strong>기타소득자</strong>: 강연료 등 소득금액 300만원 초과</li>");
    expect(src).not.toContain("연 300만원 초과");
    expect(src).not.toContain("강연료·원고료 등");
  });

  it("새 줄은 옛 줄과 한글 음절 수가 같고 가운뎃점 하나가 빠진다(폭 하한 가드)", () => {
    const before = "강연료·원고료 등 연 300만원 초과";
    const after = "강연료 등 소득금액 300만원 초과";
    expect(hangul(after)).toBe(hangul(before));
    expect([...after].length).toBe([...before].length - 1);
    expect(after.split(" ").length).toBe(before.split(" ").length);
  });

  it("옆 줄(중소기업 취업자 감면 — careerBreakWorker1102 고정)은 그대로", () => {
    expect(src).toContain("<li><strong>중소기업 취업자 감면</strong>: 청년 5년 90%, 60세 이상·장애인·경력단절자 3년 70%</li>");
  });
});
