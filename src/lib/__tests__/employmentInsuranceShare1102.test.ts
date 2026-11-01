// 고용보험 회사 부담 정정 회귀 가드 (2026-11-02 OF1 T1 — 검증자·반박자가 공식 근거로 확인)
//
// 고용산재보험료징수법 시행령 제12조①(시행 2025.12.23, 대통령령 제35935호): 실업급여 1천분의 18(법 제13조 — 노사 절반),
// 고용안정·직업능력개발 1만분의 25·45·65·85(사업주 전액) → 회사 0.9% + 0.25~0.85% = 1.15~1.75%, 총 2.05~2.65%.
// 종전 1.05~1.65%(총 1.95~2.7%)는 실업급여 1.6% 시절(2022년 7월 전) 값이었다.
// - /social-insurance-rates-2026 고용보험 카드는 InArticleAd 위다. 총 요율 정확값 2.05~2.65%는 숫자가 1자 늘어
//   320~330px 에서 카드 머리줄이 줄바꿈될 수 있어(정적 글꼴 모델), 반올림한 2.1~2.7%(종전보다 좁음)로 쓴다.
//   회사 부담 칸은 같은 글자 수에 더 좁은 숫자만 바뀐다.
// - /guides/social-insurance-reduction 2026년 요율 상자(GuideMidAd 위 첫 조각)도 숫자만 바뀐다(본문 2,300자 그대로).
//   이 글은 modifiedDate 가 없어 정정일 표(guideContentRevisions)에 넣으면 히어로에 '수정' 칩이 새로 생겨
//   광고 위 UI 가 늘어난다 — 날짜를 달려면 실측 스윕을 먼저 하고 이 테스트를 함께 고칠 것.
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { koGuides } from "@/lib/guidesContent";
import { getGuideContentDate } from "@/lib/guideContentRevisions";

const rates2026 = readFileSync(resolve(process.cwd(), "src/app/social-insurance-rates-2026/page.tsx"), "utf8");

describe("고용보험 회사 부담 1.15~1.75% (시행령 제12조①·법 제13조)", () => {
  it("2026 요율표 고용보험 카드 — 총 요율 2.1~2.7%(2.05~2.65% 반올림), 회사 1.15~1.75%", () => {
    expect(rates2026).toContain('totalRate: "2.1~2.7%"');
    expect(rates2026).toContain('companyRate: "1.15~1.75% (회사 규모별)"');
    expect(rates2026).not.toContain("1.95~2.7%");
    expect(rates2026).not.toContain("1.05~1.65%");
  });

  it("4대보험 절약 가이드 2026년 요율 상자 — 회사 1.15~1.75%, 정정일 칩은 만들지 않는다", () => {
    const guide = koGuides.find((g) => g.slug === "social-insurance-reduction");
    expect(guide).toBeDefined();
    expect(guide!.content).toContain("<li>고용보험 0.9% (회사 1.15~1.75%)</li>");
    expect(guide!.content).not.toContain("1.05~1.65%");
    expect(guide!.modifiedDate).toBeUndefined();
    expect(getGuideContentDate(guide!)).toBe(guide!.publishedDate);
  });
});
