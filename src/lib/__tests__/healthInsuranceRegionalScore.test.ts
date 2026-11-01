// 지역가입자 재산보험료부과점수 회귀 가드 (2026-10-05 감사 code12-02, 2026-11-01 STR-02-g)
// 출처: 국민건강보험법 시행령 [별표 4] <개정 2024. 5. 7.> (law.go.kr flDownload flSeq=156177245) — 60등급 22~2,341점
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import {
  MAX_PROPERTY_GRADE,
  PROPERTY_SCORE_GRADES,
  propertyGradeOfAmount,
  propertyGradeRangeText,
  propertyScoreOfGrade,
} from "@/lib/healthInsuranceRegionalScore";

// 별표 4 제3호 재산등급별 점수 60행 — https://www.law.go.kr/LSW/flDownload.do?flSeq=156177245 원문 PDF 텍스트를
// 2026-11-01 기계 추출한 그대로 (등급, 재산금액(만원), 점수). 등급표를 바꿀 때는 개정된 원문으로 이 목록도 함께 바꿀 것.
const BYEOLPYO4_ROWS = [
  "1 450 이하 22", "2 450 초과 ~ 900 이하 44",
  "3 900 초과 ~ 1,350 이하 66", "4 1,350 초과 ~ 1,800 이하 97",
  "5 1,800 초과 ~ 2,250 이하 122", "6 2,250 초과 ~ 2,700 이하 146",
  "7 2,700 초과 ~ 3,150 이하 171", "8 3,150 초과 ~ 3,600 이하 195",
  "9 3,600 초과 ~ 4,050 이하 219", "10 4,050 초과 ~ 4,500 이하 244",
  "11 4,500 초과 ~ 5,020 이하 268", "12 5,020 초과 ~ 5,590 이하 294",
  "13 5,590 초과 ~ 6,220 이하 320", "14 6,220 초과 ~ 6,930 이하 344",
  "15 6,930 초과 ~ 7,710 이하 365", "16 7,710 초과 ~ 8,590 이하 386",
  "17 8,590 초과 ~ 9,570 이하 412", "18 9,570 초과 ~ 10,700 이하 439",
  "19 10,700 초과 ~ 11,900 이하 465", "20 11,900 초과 ~ 13,300 이하 490",
  "21 13,300 초과 ~ 14,800 이하 516", "22 14,800 초과 ~ 16,400 이하 535",
  "23 16,400 초과 ~ 18,300 이하 559", "24 18,300 초과 ~ 20,400 이하 586",
  "25 20,400 초과 ~ 22,700 이하 611", "26 22,700 초과 ~ 25,300 이하 637",
  "27 25,300 초과 ~ 28,100 이하 659", "28 28,100 초과 ~ 31,300 이하 681",
  "29 31,300 초과 ~ 34,900 이하 706", "30 34,900 초과 ~ 38,800 이하 731",
  "31 38,800 초과 ~ 43,200 이하 757", "32 43,200 초과 ~ 48,100 이하 785",
  "33 48,100 초과 ~ 53,600 이하 812", "34 53,600 초과 ~ 59,700 이하 841",
  "35 59,700 초과 ~ 66,500 이하 881", "36 66,500 초과 ~ 74,000 이하 921",
  "37 74,000 초과 ~ 82,400 이하 961", "38 82,400 초과 ~ 91,800 이하 1,001",
  "39 91,800 초과 ~ 103,000 이하 1,041", "40 103,000 초과 ~ 114,000 이하 1,091",
  "41 114,000 초과 ~ 127,000 이하 1,141", "42 127,000 초과 ~ 142,000 이하 1,191",
  "43 142,000 초과 ~ 158,000 이하 1,241", "44 158,000 초과 ~ 176,000 이하 1,291",
  "45 176,000 초과 ~ 196,000 이하 1,341", "46 196,000 초과 ~ 218,000 이하 1,391",
  "47 218,000 초과 ~ 242,000 이하 1,451", "48 242,000 초과 ~ 270,000 이하 1,511",
  "49 270,000 초과 ~ 300,000 이하 1,571", "50 300,000 초과 ~ 330,000 이하 1,641",
  "51 330,000 초과 ~ 363,000 이하 1,711", "52 363,000 초과 ~ 399,300 이하 1,781",
  "53 399,300 초과 ~ 439,230 이하 1,851", "54 439,230 초과 ~ 483,153 이하 1,921",
  "55 483,153 초과 ~ 531,468 이하 1,991", "56 531,468 초과 ~ 584,615 이하 2,061",
  "57 584,615 초과 ~ 643,077 이하 2,131", "58 643,077 초과 ~ 707,385 이하 2,201",
  "59 707,385 초과 ~ 778,124 이하 2,271", "60 778,124 초과 2,341",
];

describe("별표 4 등급표", () => {
  it("원문 60행과 전부 일치 — 등급 순서, 하한 = 앞 등급 상한, 상한·점수", () => {
    const num = (s: string) => Number(s.replace(/,/g, ""));
    expect(BYEOLPYO4_ROWS).toHaveLength(60);
    expect(PROPERTY_SCORE_GRADES).toHaveLength(BYEOLPYO4_ROWS.length);
    BYEOLPYO4_ROWS.forEach((row, i) => {
      const m = row.match(/^(\d+) (?:([\d,]+) 초과)?(?: ~ )?(?:([\d,]+) 이하)? ([\d,]+)$/);
      expect(m, row).not.toBeNull();
      const [, grade, lower, upper, score] = m as RegExpMatchArray;
      expect(num(grade)).toBe(i + 1);
      expect(lower === undefined ? 0 : num(lower)).toBe(i === 0 ? 0 : PROPERTY_SCORE_GRADES[i - 1][0]);
      expect(PROPERTY_SCORE_GRADES[i]).toEqual([upper === undefined ? Infinity : num(upper), num(score)]);
    });
  });
  it("60등급, 1등급 22점 ~ 60등급 2,341점, 점수·상한 모두 증가", () => {
    expect(MAX_PROPERTY_GRADE).toBe(60);
    expect(propertyScoreOfGrade(1)).toBe(22);
    expect(propertyScoreOfGrade(60)).toBe(2_341);
    expect(propertyScoreOfGrade(0)).toBe(0);
    for (let i = 1; i < PROPERTY_SCORE_GRADES.length; i++) {
      expect(PROPERTY_SCORE_GRADES[i][0]).toBeGreaterThan(PROPERTY_SCORE_GRADES[i - 1][0]);
      expect(PROPERTY_SCORE_GRADES[i][1]).toBeGreaterThan(PROPERTY_SCORE_GRADES[i - 1][1]);
    }
  });
  it("원문 대조 표본 — 22등급 1.48~1.64억 535점, 47등급 1,451점, 48등급 1,511점", () => {
    expect(PROPERTY_SCORE_GRADES[21]).toEqual([16_400, 535]);
    expect(propertyScoreOfGrade(47)).toBe(1_451);
    expect(propertyScoreOfGrade(48)).toBe(1_511);
    expect(propertyGradeOfAmount(150_000_000)).toBe(22);
    expect(propertyGradeOfAmount(164_000_000)).toBe(22);
    expect(propertyGradeOfAmount(164_000_001)).toBe(23);
    expect(propertyGradeOfAmount(0)).toBe(0);
    expect(propertyGradeOfAmount(10_000_000_000)).toBe(60);
  });
  it("구간 문구", () => {
    expect(propertyGradeRangeText(0)).toBe("0원(재산분 없음)");
    expect(propertyGradeRangeText(1)).toBe("450만원 이하");
    expect(propertyGradeRangeText(23)).toBe("1억 6,400만~1억 8,300만원");
    expect(propertyGradeRangeText(60)).toBe("77억 8,124만원 초과");
  });
});

describe("/health-insurance-fee-2026 지역가입자 슬라이더", () => {
  const src = readFileSync(resolve(process.cwd(), "src/app/health-insurance-fee-2026/HealthInsuranceFeeClient.tsx"), "utf8");
  it("법정 범위 밖 점수·평균 1,500~2,500점 문구가 없다", () => {
    expect(src).not.toContain("max={5000}");
    expect(src).not.toContain("1,500~2,500");
    expect(src).toContain("max={MAX_PROPERTY_GRADE}");
    expect(src).toContain("useState(23)");
  });
  it("결과 광고 위 안내문은 짧은 형태 — 공제 후 재산 {구간}.", () => {
    expect(src).toContain("별도). 공제 후 재산 {propertyGradeRangeText(regionalGrade)}. 정확한 점수는 건보공단에서 조회.");
    expect(src).not.toContain("재산 과표 합계에서 1억원을 뺀 금액");
  });
  it("기본 상태(직장가입자)는 그대로", () => {
    expect(src).toContain('useState<Type>("workplace")');
  });
});
