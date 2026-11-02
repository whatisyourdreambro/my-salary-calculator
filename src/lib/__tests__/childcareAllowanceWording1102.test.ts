// 출산지원금·보육수당 비과세 구분 회귀 가드 (2026-11-02 OF1 T2 — 검증자·반박자가 공식 근거로 확인)
//
// 소득세법 제12조제3호머목(시행 2026.1.1, 법률 제21221호): 1) 출산 관련 급여는 자녀 출생일 이후 2년 이내 최대 두 차례
// '전액' 비과세(2025.1.1 도입), 2) 6세 이하 자녀 보육 관련 급여만 '해당 자녀 1명당 월 20만원 이내'. 따라서
// '출산·보육수당 비과세 … 월 20만원' 묶음 표현(근로소득 지급명세서 Q01, 2023년 귀속분까지)은 출산지원금도 월 20만원
// 한도처럼 읽힌다. 5개 화면 8곳을 고친다.
// - 광고 위에 보이는 5곳은 '출산·'만 지운다(글자 삭제 — 광고 위 높이 증가 없음).
// - 접힌 FAQ 3곳(닫힌 details, 기본 화면 높이 0)은 '보육수당 비과세 자녀 1인당 월 20만원'.
// - /year-end-tax 광고 위(접힌 FAQ 4 포함)에는 '출산지원금' 설명을 넣지 않는다(yearEndLimits2026.test.ts) —
//   출산지원금 전액 비과세 설명은 마지막 광고 아래 한도표(yearEndLimits2026.ts)에 이미 있다.
// - 같은 문장의 '자녀학자금'(enrichments.ts earned-income-tax-quick)은 2026-11-02 FF-4 에서 따로 검증해 지웠다(글자 삭제만):
//   회사가 주는 자녀 학자금은 과세 근로소득이다(소득세법 시행령 제38조①2). 간이세액표(시행령 별표 2) 비고 5 는 근로소득인 학자금을
//   빼고 월 원천징수를 계산할 '수 있다'고만 정해 선택일 뿐이고 연말정산에서는 합산된다 — 비과세 항목 사이에 두면 비과세로 읽힌다.
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const readSrc = (rel: string) => readFileSync(resolve(process.cwd(), rel), "utf8");
const FILES = {
  yearEnd: "src/app/year-end-tax/page.tsx",
  reform: "src/app/tax-reform-2026/page.tsx",
  settlement: "src/app/year-end-tax-settlement-2026/page.tsx",
  hub: "src/data/yearEndTaxHub.ts",
  quick: "src/lib/simpleCalculators/enrichments.ts",
} as const;

describe("출산지원금 전액 비과세와 보육수당 월 20만원 한도 구분 (소득세법 §12(3)머목)", () => {
  it("5개 파일 어디에도 '출산·보육수당' 묶음 표현이 없다", () => {
    for (const rel of Object.values(FILES)) {
      expect({ rel, found: readSrc(rel).includes("출산·보육수당") }).toEqual({ rel, found: false });
    }
  });

  it("광고 위 5곳은 '출산·'만 지운 문구다", () => {
    expect(readSrc(FILES.yearEnd)).toContain("<strong>보육수당 비과세</strong> — 자녀 1인당 월 20만원까지");
    expect(readSrc(FILES.reform)).toContain('title: "보육수당 비과세",');
    expect(readSrc(FILES.reform)).toContain('detail: "자녀 1인당 월 20만원까지 비과세 적용됩니다.",');
    expect(readSrc(FILES.hub)).toContain('{ date: "2026-01", text: "보육수당 비과세 한도 자녀 1인당 월 20만원 적용" },');
    expect(readSrc(FILES.settlement)).toContain('title: "보육수당 비과세 월 20만원",');
    expect(readSrc(FILES.settlement)).toContain('body: "자녀 1인당 월 20만원까지 비과세. 급여명세서에서 적용 여부 확인.",');
    expect(readSrc(FILES.quick)).toContain("비과세 식대(월 20만원), 보육수당(월 20만원) 등은 원천징수 대상에서 제외됩니다.");
  });

  it("근로소득세 간편 계산 설명에 과세 근로소득인 자녀학자금을 비과세 항목과 묶지 않는다 (FF-4)", () => {
    expect(readSrc(FILES.quick)).not.toContain("자녀학자금");
    // 대신 같은 자리에 출산지원금을 넣지 않는다 — 광고 위에 조건 없는 출산지원금 비과세 문장이 생긴다(T2 가 피한 것).
    expect(readSrc(FILES.quick)).not.toContain("출산지원금");
  });

  it("접힌 FAQ 3곳은 '보육수당 비과세 자녀 1인당 월 20만원'이고 출산지원금 설명은 넣지 않는다", () => {
    expect(readSrc(FILES.yearEnd)).toContain("+100만원), 보육수당 비과세 자녀 1인당 월 20만원, 교육비 세액공제 확대, 월세");
    expect(readSrc(FILES.settlement)).toContain("+100만원), 보육수당 비과세 자녀 1인당 월 20만원, 교육비 세액공제 확대(자녀");
    expect(readSrc(FILES.reform)).toContain("(신용카드 자녀 추가 한도, 보육수당 비과세 자녀 1인당 월 20만원 등)이 적용됩니다.");
    expect(readSrc(FILES.yearEnd)).not.toContain("출산지원금");
  });
});
