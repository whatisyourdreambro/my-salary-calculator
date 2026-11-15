// 가이드 '내 조건으로 계산하기' 카드 이름 — 광고 위 카드라 폭이 같거나 좁아야 한다 (2026-11-15 SEASONA, 감사 lib ideas[0])
// 카드는 데스크톱 사이드바 SidebarAd 위, 모바일에서는 guides/[slug]/page.tsx 의 CalcResultAd 위에 있다(GuidePageClient.tsx 끝 aside).
// 사이트 서브셋 글꼴(MoneySalaryText, Pretendard 파생)에서 한글 음절은 모두 같은 advance 폭이라(굵게 1음절 = 0.864em, 2026-11-15
// fontTools 측정 — '주식 수익률 계산기'·'삼성 성과급 계산기' 둘 다 7.376em) 이름 폭은 한글 음절 수·공백 수로 비교할 수 있다.
// 라틴 글자가 섞인 이름은 이 비교가 맞지 않으므로 실측 없이 넣지 않는다.
import { describe, expect, it } from "vitest";
import { koGuides } from "@/lib/guidesContent";
import { getGuidePrimaryCalculator } from "@/lib/guidePrimaryCalculator";

const shape = (s: string) => ({
  hangul: [...s].filter((ch) => /[\uAC00-\uD7A3]/.test(ch)).length,
  spaces: [...s].filter((ch) => ch === " ").length,
  other: [...s].filter((ch) => !/[\uAC00-\uD7A3 ]/.test(ch)).length,
});

// 바꾸기 전 이름 = 카테고리 기본 카드 (주식 → 주식 수익률 계산기, 연봉 → 연봉 실수령액 계산기)
const BEFORE: Record<string, string> = {
  "samsung-wage-negotiation-2026": "주식 수익률 계산기",
  "samsung-opi-tai-complete-2026": "연봉 실수령액 계산기",
};

describe("삼성 성과급 글 2편의 대표 계산기 카드 (SEASONA lib ideas[0])", () => {
  it.each(Object.entries(BEFORE))("%s: 삼성전자 성과급 계산기로 가고 이름 폭은 바꾸기 전보다 넓지 않다", (slug, before) => {
    const guide = koGuides.find((g) => g.slug === slug)!;
    expect(guide).toBeDefined();
    const link = getGuidePrimaryCalculator(guide);
    expect(link).toEqual({ name: "삼성 성과급 계산기", href: "/calc/samsung-bonus" });
    const now = shape(link.name);
    const old = shape(before);
    expect(now.other).toBe(0);
    expect(old.other).toBe(0);
    expect(now.spaces).toBe(old.spaces);
    expect(now.hangul).toBeLessThanOrEqual(old.hangul);
  });

  it("바꾸기 전 이름은 실제로 그 글의 카테고리 기본 카드였다", () => {
    expect(koGuides.find((g) => g.slug === "samsung-wage-negotiation-2026")!.category).toBe("주식");
    expect(koGuides.find((g) => g.slug === "samsung-opi-tai-complete-2026")!.category).toBe("연봉");
    expect(getGuidePrimaryCalculator({ slug: "unmapped", category: "주식" }).name).toBe(BEFORE["samsung-wage-negotiation-2026"]);
    expect(getGuidePrimaryCalculator({ slug: "unmapped", category: "연봉" }).name).toBe(BEFORE["samsung-opi-tai-complete-2026"]);
  });
});

// 라틴 글자가 섞인 이름은 실측값으로만 — fontTools 로 잰 서브셋 글꼴 advance 폭(2026-11-15, wght 700 / 400):
//   '연봉 실수령액 계산기' 8.2402em / 8.2803em  →  '하이닉스 PS 계산기' 7.7646em / 7.7637em ('PS' 1.2529em < 한글 2음절 1.7285em)
describe("SK하이닉스 PS 이력 글의 대표 계산기 카드 (SEASONA lib ideas[0])", () => {
  it("하이닉스 PS 계산기로 가고, 바꾸기 전 이름보다 한글 2음절이 줄고 라틴 대문자 2자(PS)만 더해진다", () => {
    const guide = koGuides.find((g) => g.slug === "sk-hynix-ps-history-2026-prospect")!;
    expect(guide.category).toBe("연봉");
    const link = getGuidePrimaryCalculator(guide);
    expect(link).toEqual({ name: "하이닉스 PS 계산기", href: "/calc/sk-hynix-bonus" });
    const now = shape(link.name);
    const old = shape("연봉 실수령액 계산기");
    expect(now.spaces).toBe(old.spaces);
    expect(old.hangul - now.hangul).toBe(2);
    expect(link.name.replace(/[\uAC00-\uD7A3 ]/g, "")).toBe("PS");
  });

  it("SK하이닉스 임금협상 글은 같은 폭 안에 정확한 이름이 없어 카테고리 기본 카드 그대로", () => {
    const guide = koGuides.find((g) => g.slug === "sk-hynix-wage-2026")!;
    expect(getGuidePrimaryCalculator(guide)).toEqual({ name: "주식 수익률 계산기", href: "/calc/stock-pl-quick" });
  });
});
