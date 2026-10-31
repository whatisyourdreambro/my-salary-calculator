// 2026-11-01 간단 계산기 사실 정정 포팅 (PKG-15 — STR-02-d · STR-02-f · NEW-v07-content-facts-1)
//
// - BMI 판정: 질병관리청 국가건강정보포털 '비만'(cntnts_sn=6694) — 1단계 비만 25.0~29.9, 2단계 비만 30.0~34.9,
//   3단계 비만(고도 비만) 35.0 이상. 종전에는 30 이상을 모두 '고도비만'으로 표시했다.
// - DSR 해설: 스트레스 금리는 하한 1.5%(2025-10-15 방안 수도권·규제지역 주담대 3%)라 '1~1.5%p 상향'은 낡은 범위다.
//   해설은 광고(GuideMid) 위라 숫자 없는 더 짧은 문구로만 바꾼다(현행 수치는 같은 쪽 FAQ·유의사항에 이미 있음).
// - 아동수당: 아동수당법 제4조 제1항(개정 2026.3.20) + 부칙(법률 제21489호) 제2조 — 2026년 지급 대상은 9세 미만.
//
// 광고 위 문구 원칙: 공식(계산 공식 블록)은 같은 자릿수 숫자 교체만, DSR 해설은 원문보다 짧은 문구만.
// bmi-quick 계산 방식 설명(explanation)의 '25~29.9 비만, 30 이상 고도비만'은 이번에 고치지 않았다 —
// 2026-09-29 1,123폭 스윕에서 같은 숫자 교체가 442·493·555px 에서 GuideMid 이하 광고 3개를 한 줄(28px) 밀었다(941cfad86).
// 그 문장은 운영자 결정(광고 아래로 옮기기 또는 스윕 통과 후 교체) 대상이다.
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { allCalculators } from "@/lib/simpleCalculators";

const calc = (slug: string) => {
  const found = allCalculators.find((c) => c.slug === slug);
  if (!found) throw new Error(`missing calculator: ${slug}`);
  return found;
};

/** [한글 글자 수, 그 밖의 글자 수] — 광고 위 문구는 둘 다 원문보다 늘면 안 된다. */
const glyphCounts = (s: string): [number, number] => {
  const chars = [...s];
  const hangul = chars.filter((c) => /[가-힣]/.test(c)).length;
  return [hangul, chars.length - hangul];
};

describe("STR-02-d bmi-quick 판정 — 질병관리청 비만 단계(1단계 25~29.9, 2단계 30~34.9, 고도 35 이상)", () => {
  const run = (weight: number, height: number) => calc("bmi-quick").compute({ weight, height });
  const verdict = (weight: number, height: number) => run(weight, height).secondary?.[0]?.label ?? "";

  it("BMI 31.8 은 고도비만이 아니라 2단계 비만", () => {
    // 170cm · 91.9kg → 91.9 ÷ 2.89 ≈ 31.8
    expect(verdict(91.9, 170)).toContain("2단계 비만");
    expect(verdict(91.9, 170)).not.toContain("고도");
  });

  it("BMI 27.7 은 1단계 비만, 36.3 은 고도비만", () => {
    // 170cm · 80kg ≈ 27.7, 170cm · 104.9kg ≈ 36.3
    expect(verdict(80, 170)).toContain("1단계 비만");
    expect(verdict(104.9, 170)).toContain("고도비만");
  });

  it("경계값 — 25 · 30 · 35 (키 100cm 이면 BMI = 체중)", () => {
    expect(verdict(24.9, 100)).toContain("과체중");
    expect(verdict(25, 100)).toContain("1단계 비만");
    expect(verdict(29.9, 100)).toContain("1단계 비만");
    expect(verdict(30, 100)).toContain("2단계 비만");
    expect(verdict(34.9, 100)).toContain("2단계 비만");
    expect(verdict(35, 100)).toContain("고도비만");
  });

  it("기본값(70kg · 170cm) 판정은 종전과 같은 과체중", () => {
    expect(verdict(70, 170)).toContain("과체중");
  });

  it("계산 공식 3행 — 35 이상 고도비만, '30 이상 고도비만' 없음", () => {
    const formula = calc("bmi-quick").formula ?? "";
    expect(formula).toContain("23~24.9 과체중 / 25~34.9 비만 / 35 이상 고도비만");
    expect(formula).not.toContain("30 이상 고도비만");
  });

  it("공식 3행 교체는 같은 자릿수 숫자만 바꾼다 (광고 위 고정폭 공식 블록)", () => {
    const before = "25~29.9 비만 / 30 이상 고도비만";
    const after = "25~34.9 비만 / 35 이상 고도비만";
    expect([...after].length).toBe([...before].length);
    expect(after.replace(/\d/g, "0")).toBe(before.replace(/\d/g, "0"));
  });
});

describe("STR-02-d /tools/health/bmi BmiCalculator 판정 단계", () => {
  const src = readFileSync(resolve(process.cwd(), "src/components/calculators/health/BmiCalculator.tsx"), "utf8");

  it("25~29.9 1단계 비만, 30~34.9 2단계 비만, 35 이상 고도비만", () => {
    expect(src).toMatch(/bmi < 30\)\s*\{\s*status = "1단계 비만";/);
    expect(src).toMatch(/bmi < 35\)\s*\{\s*status = "2단계 비만";/);
    expect(src).toMatch(/\}\s*else\s*\{\s*status = "고도비만";/);
    expect(src).not.toMatch(/status = "비만";/);
  });
});

describe("STR-02-f dsr-quick 해설 — 낡은 스트레스 금리 범위(1~1.5%p) 삭제", () => {
  it("해설에 '1~1.5%p'가 없고 숫자 없는 문구로 바뀌었다", () => {
    const explanation = calc("dsr-quick").explanation ?? "";
    expect(explanation).not.toContain("1~1.5%p");
    expect(explanation).toContain("스트레스 DSR(금리 상승 가정 가산금리 적용)이 2024년 도입되어");
  });

  it("광고(GuideMid) 위 문구라 원문보다 짧다 — 한글·그 밖의 글자 수 모두 같거나 적음", () => {
    const before = "(미래 금리 상승 가정 1~1.5%p 상향 적용)";
    const after = "(금리 상승 가정 가산금리 적용)";
    const [hb, ob] = glyphCounts(before);
    const [ha, oa] = glyphCounts(after);
    expect(ha).toBeLessThanOrEqual(hb);
    expect(oa).toBeLessThan(ob);
  });
});

describe("NEW-v07-content-facts-1 baby-yearly-cost FAQ — 아동수당 2026년 만 9세 미만", () => {
  it("아동수당 지급 연령이 만 8세 미만이 아니라 만 9세 미만", () => {
    const answers = (calc("baby-yearly-cost").faqs ?? []).map((f) => f.a).join(" ");
    expect(answers).toContain("아동수당(만 9세 미만 매월)");
    expect(answers).not.toContain("만 8세 미만");
  });
});

// STR-02-q (a) — 10/13 사슬(6d0dd4edb) 문자열 포팅. 접힌 FAQ 답변(<details>)이라 기본 화면 광고 위치와 무관하다.
describe("STR-02-q b5d0048b0 severance-pay-quick 접힌 FAQ — 근로자퇴직급여 보장법 제4조·제8조, 소득세법 제129조", () => {
  it("1년 11개월은 받는다 — 재직일수 비례로 약 1.92년치", () => {
    const first = calc("severance-pay-quick").faqs?.[0];
    expect(first?.q).toBe("1년 11개월 일하고 퇴직하면 퇴직금이 없나요?");
    expect(first?.a.startsWith("받습니다.")).toBe(true);
    expect(first?.a).toContain("근로자퇴직급여 보장법 제4조·제8조");
    expect(first?.a).toContain("약 1.92년치");
  });

  it("IRP 연금 수령 감면은 수령 연차에 따라 30~50% (원천징수세율의 70·60·50%)", () => {
    const answers = (calc("severance-pay-quick").faqs ?? []).map((f) => f.a).join(" ");
    expect(answers).toContain("30~50% 감면");
    expect(answers).not.toContain("추가 30% 감면");
    expect(answers).not.toContain("30% 절세 효과");
  });
});

describe("STR-02-q 84e313f6e loan-affordability 접힌 FAQ2 — 신용대출 연소득 이내(2025-06-28), 규제지역 LTV 40%(2025-10-15)", () => {
  it("연소득 100~200% 한도와 LTV 70% 단일값이 없다", () => {
    const answer = calc("loan-affordability").faqs?.[1]?.a ?? "";
    expect(answer).toContain("2025년 6월 28일부터 전 금융권에서 차주별 연소득 이내");
    expect(answer).toContain("LTV(비규제지역 70%, 규제지역 무주택 일반 40%)");
    expect(answer).not.toContain("100~200%");
    expect(answer).not.toContain("주택가치 대비 70%");
  });
});
