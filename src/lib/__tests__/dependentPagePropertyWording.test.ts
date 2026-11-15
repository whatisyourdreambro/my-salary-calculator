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

// N2-app-pages-07 (2026-11-15 감사 app-pages-b03-F03): 형제자매를 고른 뒤에만 보이는 안내문(CalcResultAd 위)에 미혼 요건.
// 괄호 비교 구절 '(일반 대상자의 5억 4,000만원보다 엄격)' 을 빼서 12px 사이트 글꼴 664.61px -> 625.54px 로 더 짧다.
// 형제자매 선택 상태 가드 스윕에서 CalcResultAd 가 한 폭이라도 내려가면 이 커밋(문구 + 이 단언)만 되돌린다.
describe("/health-insurance-dependent — 형제자매 선택 안내문 미혼 요건(광고 위, 더 짧게)", () => {
  const client = readFileSync(resolve(process.cwd(), "src/app/health-insurance-dependent/Client.tsx"), "utf8").replace(/\s+/g, " ");
  it("미혼(이혼·사별 포함) 요건과 1억 8,000만원 재산요건을 적고 옛 비교 구절이 없다", () => {
    expect(client).toContain(
      "형제자매는 위 예외에 해당하더라도 미혼(이혼·사별 포함)이어야 하고, 재산세 과세표준 1억 8,000만원 이하 요건이 별도로 적용됩니다.",
    );
    expect(client).not.toContain("5억 4,000만원보다 엄격");
  });
});

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

// N2-app-pages-07 (2026-11-15 감사 app-pages-b03-F03): 국민건강보험법 시행규칙 별표 1 제10호 — 형제자매는 나이·장애 예외에
// 더해 미혼(이혼·사별한 경우 포함)이고 부모가 없거나 부모에게 보수·소득이 없는 경우 등 부양요건을 따로 충족해야 한다.
// 접힌 FAQ(InArticleAd 아래 닫힌 details, FAQPage JSON-LD 같은 배열)에 조건을 적었다 — 닫힌 높이 불변.
describe("/health-insurance-dependent — 형제자매 미혼 요건(접힌 FAQ)", () => {
  const flat = readFileSync(resolve(process.cwd(), "src/app/health-insurance-dependent/page.tsx"), "utf8").replace(/\s+/g, " ");
  it("형제자매 FAQ 답이 미혼(이혼·사별 포함)·별표 1 부양요건을 적는다", () => {
    expect(flat).toContain(
      "또한 형제자매는 미혼(이혼·사별 포함)이어야 하고, 부모가 없거나 부모에게 보수·소득이 없는 경우 등 시행규칙 별표 1의 부양요건을 따로 충족해야 합니다.",
    );
  });
});
