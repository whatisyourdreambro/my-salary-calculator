// 연말정산 계산기 '절세 최적화 시뮬레이터' 문구 회귀 가드 (2026-10-05 감사 code26-08)
// 기본값(카드 1,500만원)만으로 첫 화면부터 '환급액 N원 증가!' 가 떠 사용자가 바꾸지 않은 증가를 주장했다.
// 높이를 바꾸지 않도록 같은 자리·같은 글자 구성의 '공제로 환급 +N원' 으로 바꾸고, 기준은 두 슬라이더만 0 으로 둔다.
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

describe("YearEndTaxCalculator 시뮬레이터 문구", () => {
  const src = readFileSync(resolve(process.cwd(), "src/components/YearEndTaxCalculator.tsx"), "utf8");
  it("증가를 주장하지 않고 두 공제의 효과를 표시한다", () => {
    expect(src).not.toContain("initialRefund)}원 증가!");
    expect(src).toContain("공제로 환급 +{formatNumber(result.finalRefund - initialRefund)}원");
  });
  it("문구 글자 구성이 원문과 같다 (한글 6자·기호 1자·어절 3개)", () => {
    const shape = (s: string) => ({
      hangul: [...s].filter((c) => /[가-힣]/.test(c)).length,
      words: s.split(" ").length,
      other: [...s].filter((c) => !/[가-힣\s0-9,]/.test(c)).length,
    });
    expect(shape("공제로 환급 +380,250원")).toEqual(shape("환급액 380,250원 증가!"));
  });
  it("기준 환급액은 슬라이더 두 항목(연금저축/IRP·카드)만 0", () => {
    const block = src.slice(src.indexOf("const initialRefund = useMemo("), src.indexOf("const handleInputChange"));
    expect(block).toContain("pensionSavings: 0,");
    // 연금 슬라이더는 연금저축·IRP 중 하나를 고르는 선택형이라 IRP 도 기준에서 0 이다 (main 의 계좌 선택 슬라이더)
    expect(block).toContain("irp: 0,");
    expect(block).toContain("creditCard: 0,");
    expect(block).not.toContain("donation: 0,");
  });
});
