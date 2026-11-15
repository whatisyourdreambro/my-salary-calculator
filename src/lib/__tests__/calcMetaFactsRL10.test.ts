// RL-10 (2026-11-15 재착지) — 10월에 운영자가 승인한 간이 계산기 사실 정정(등록면허세·직원 인건비·재산세 납기·209시간)을 고정한다.
// 10월 원본 테스트(calcFactFixes20260929·metaFactFixes20261102)는 지금 기준 트리에 없어, 이 묶음의 단언만 이 파일로 다시 옮겼다.
// 광고 위 문구는 같은 폭이나 더 짧게 쓰는 것이 원칙이라, 바뀐 문구는 글자 종류(한글·숫자·공백·그 밖)별로 종전과 견준다.
import { describe, expect, it } from "vitest";
import { allCalculators } from "@/lib/simpleCalculators";
import { calculatorSeoDescription } from "@/lib/simpleCalculators/seoText";

const calc = (slug: string) => {
  const c = allCalculators.find((x) => x.slug === slug);
  if (!c) throw new Error(`missing calculator ${slug}`);
  return c;
};

// 광고 위 문구: 글자 종류별로 종전보다 많지 않아야 한다(줄 수는 통합 단계의 실측 스윕이 확인).
const kinds = (s: string) => ({
  hangul: [...s].filter((ch) => /[가-힣]/.test(ch)).length,
  digit: [...s].filter((ch) => /[0-9]/.test(ch)).length,
  space: [...s].filter((ch) => ch === " ").length,
  other: [...s].filter((ch) => !/[가-힣0-9 ]/.test(ch)).length,
});
const notWider = (now: string, was: string) => {
  const a = kinds(now);
  const b = kinds(was);
  for (const k of ["hangul", "digit", "space", "other"] as const) expect(a[k], `${now} ${k}`).toBeLessThanOrEqual(b[k]);
};

describe("CS-04 등록면허세 힌트·공식 (지방세법 제28조 제1항 제1호: 보존·상속 1천분의 8, 무상 15, 저당권 2)", () => {
  it("'주택 매매 0.8%' 오기가 없고 보존·상속·저당 세율을 쓴다", () => {
    const c = calc("registration-tax-quick");
    const hint = c.fields.find((f) => f.name === "rate")?.hint ?? "";
    expect(hint).toBe("보존·상속 0.8%, 저당 0.2%"); // 공식 1행 표기(저당 0.2%)와 같게 — 종전 힌트와 한글 6자 동일
    expect(c.formula).toContain("(보존·상속 0.8% · 무상 1.5% · 저당 0.2%)");
    expect(`${hint} ${c.formula}`).not.toContain("주택 매매 0.8%");
    expect(c.formula).not.toContain("증여 1.5%");
  });
  it("공식 1행은 종전과 글자 수가 같다 (고정폭 공식 블록, 광고 위)", () => {
    const line = (c: string) => c.split("\n")[0];
    const before = "등록면허세 = 취득가액 × 등록세율 (주택 매매 0.8% · 증여 1.5% · 상속 0.8%)";
    expect([...line(calc("registration-tax-quick").formula ?? "")].length).toBe([...before].length);
  });
});

describe("F7 등록면허세 계산기 설명(H1 아래·meta 앞부분) — 매매·증여 등기는 취득세에 통합(지방세법 제23조 제1호)", () => {
  it("'취득세에 추가' 오기가 없고 종전보다 넓지 않다", () => {
    const c = calc("registration-tax-quick");
    expect(c.description).toBe("저당권·전세권 설정 등 등기에 붙는 등록면허세 계산");
    notWider(c.description, "주택 매매·증여 시 취득세에 추가되는 등록면허세 계산");
    const meta = calculatorSeoDescription(c);
    expect(meta).not.toContain("추가되는");
    expect(meta).not.toContain("주택 매매·증여 시");
  });
});
