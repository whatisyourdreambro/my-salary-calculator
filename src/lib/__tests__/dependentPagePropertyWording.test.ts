// /health-insurance-dependent — 연결된 건강보험료 계산기는 지역가입자 재산분만 계산한다는 표기 회귀 가드
// (2026-10-05 감사 code12-02, aee4f4a20 의 피부양자 판정기 문구 3곳을 2026-11-01 PKG-22 로 이식).
// /health-insurance-fee-2026 지역가입자 모드는 재산 점수 × 점당 금액만 계산하고 소득분(정률 7.19%)은 따로다.
// 판정기 FAQ·관련 링크·본문이 그 계산기를 지역가입자 보험료 전체 계산처럼 소개하지 않게 고정한다.
// 계산기 쪽(별표 4 등급 슬라이더·healthInsuranceRegionalScore.test.ts)은 별도 묶음(PKG-27)이다.
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

/** 띄어쓰기 단위 글자 수 목록 — 광고 위 제자리 교체의 단어별 폭 확인용 (한글 advance 균일) */
const syllables = (s: string) => s.split(" ").map((w) => [...w].length);

describe("/health-insurance-dependent — 연결 계산기는 재산분만 계산한다는 표기", () => {
  const src = readFileSync(resolve(process.cwd(), "src/app/health-insurance-dependent/page.tsx"), "utf8");

  it("FAQ·관련 링크·본문", () => {
    expect(src).toContain("재산분 보험료는 건강보험료 계산기(/health-insurance-fee-2026)의 지역가입자 모드로");
    expect(src).toContain('desc: "탈락 시 지역가입자 재산분 예상"');
    expect(src).toContain("탈락 이후의 재산분 보험료 규모는");
  });

  it("지역가입자 보험료 전체를 계산하는 것처럼 읽히는 옛 문구가 없다", () => {
    expect(src).toContain("(소득분 7.19%는 별도)");
    expect(src).not.toContain("예상 보험료 금액은 건강보험료 계산기");
    expect(src).not.toContain('desc: "탈락 시 지역가입자 보험료 예상"');
    expect(src).not.toContain("탈락 이후의 보험료가 얼마나 될지는");
  });

  it("광고 위 문구는 제자리 교체 — 단어 수가 같고 각 단어 글자 수가 옛 문구 이하", () => {
    // 관련 링크 카드(CalcResultAd 아래, GuideMidAd 위): 같은 음절 구조
    expect(syllables("탈락 시 지역가입자 재산분 예상")).toEqual(syllables("탈락 시 지역가입자 보험료 예상"));
    // 본문 구절(GuideMidAd 아래, InArticleAd 위): 단어별 글자 수가 옛 구절 이하(전체 1자 짧음)
    const before = syllables("탈락 이후의 보험료가 얼마나 될지는");
    const after = syllables("탈락 이후의 재산분 보험료 규모는");
    expect(after).toHaveLength(before.length);
    after.forEach((n, i) => expect(n).toBeLessThanOrEqual(before[i]));
  });
});

// HomeTopAd 위 리드 문장 문법 정정(NEW-v07b-seo-meta-dates-1, 2026-11-01): '…까지' 로 끊긴 문장에 '반영.' 을 붙이고
// 별도 확인 문장을 줄였다. 전체 2자 짧지만 keep-all 어절 구성이 바뀌므로(소득·주택임대·사업소득 한 어절) 통합 단계
// 320px 광고 깊이 실측에서 줄 수가 같거나 줄어야 배포한다 — 늘면 이 커밋(문구+이 단언)을 통째로 되돌린다(B 보류).
describe("/health-insurance-dependent — HomeTopAd 위 리드 문장", () => {
  const flat = readFileSync(resolve(process.cwd(), "src/app/health-insurance-dependent/page.tsx"), "utf8").replace(/\s+/g, " ");
  it("끊긴 '…까지' 문장을 '반영.' 으로 맺고 전체 길이는 줄었다", () => {
    const before = "형제자매 예외(1억 8,000만원)까지 동거·부양, 배우자 소득, 주택임대·사업소득 예외는 별도 확인이 필요합니다.";
    const after = "형제자매 예외(1억 8,000만원)까지 반영. 동거·부양·배우자 소득·주택임대·사업소득 예외는 따로 확인하세요.";
    expect(flat).toContain(after);
    expect(flat).not.toContain(before);
    expect([...after].length).toBe([...before].length - 2);
  });
});
