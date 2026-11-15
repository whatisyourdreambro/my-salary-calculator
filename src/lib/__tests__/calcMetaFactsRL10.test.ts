// RL-10 (2026-11-15 재착지) — 10월에 운영자가 승인한 간이 계산기 사실 정정(등록면허세·직원 인건비·재산세 납기·209시간)을 고정한다.
// 10월 원본 테스트(calcFactFixes20260929·metaFactFixes20261102)는 지금 기준 트리에 없어, 이 묶음의 단언만 이 파일로 다시 옮겼다.
// 광고 위 문구는 같은 폭이나 더 짧게 쓰는 것이 원칙이라, 바뀐 문구는 글자 종류(한글·숫자·공백·그 밖)별로 종전과 견준다.
import { describe, expect, it } from "vitest";
import { allCalculators } from "@/lib/simpleCalculators";
import path from "node:path";
import fs from "node:fs";
import { EMPLOYER_ONLY_RATES_2026 } from "@/lib/taxConstants2026";
import { calculatorSeoDescription } from "@/lib/simpleCalculators/seoText";
import { hubs } from "@/lib/hubs";

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

describe("F7 /hub/tax-saving 등록면허세 카드 — '추가 세금' 오기 정정, 종전보다 넓지 않게", () => {
  it("카드 문구", () => {
    const link = hubs.find((h) => h.id === "tax-saving")!.sections.flatMap((s) => s.links).find((l) => l.href === "/calc/registration-tax-quick")!;
    expect(link.desc).toBe("저당·전세권 등기 세금");
    notWider(link.desc, "매매·증여 시 추가 세금");
    const elsewhere = hubs.flatMap((h) => h.sections.flatMap((s) => s.links)).filter((l) => l.href === "/calc/registration-tax-quick");
    for (const l of elsewhere) expect(l.desc).not.toContain("추가");
  });
});

const read = (rel: string) => fs.readFileSync(path.resolve(process.cwd(), rel), "utf8");

describe("CS-21 직원 인건비 — 2026년 회사부담 약 11.44% (국민연금 4.75% + 건강 3.595%×(1+13.14%) + 고용 0.9% + 고용안정 0.25% + 산재 평균 1.47%)", () => {
  it("사업주 전용 요율 정본과 기본값 계산", () => {
    expect(EMPLOYER_ONLY_RATES_2026.EMPLOYMENT_STABILITY_UNDER_150).toBe(0.0025);
    expect(EMPLOYER_ONLY_RATES_2026.INDUSTRIAL_ACCIDENT_AVG).toBe(0.0147);
    const r = calc("employee-cost-quick").compute({ monthly: 3_000_000 });
    expect(r.primary.value).toBe(3_593_121);
    expect(r.secondary?.find((s) => s.label === "4대보험 회사부담")?.value).toBe(343_121);
    // 결과 숫자(CalcResultAd 위)는 종전 315,000·3,565,000원과 자릿수가 같다
    expect(String(343_121).length).toBe(String(315_000).length);
    expect(String(3_593_121).length).toBe(String(3_565_000).length);
  });
  it("compute 는 2026 요율 상수를 명시한다 — 1/1 포인터 전환에도 설명·공식의 2026 값과 어긋나지 않게(RL-44 가 한 번에 바꿈)", () => {
    const src = read("src/lib/simpleCalculators/batch2.ts");
    const start = src.indexOf('slug: "employee-cost-quick"');
    const block = src.slice(start, src.indexOf("slug:", start + 10));
    expect(start).toBeGreaterThan(0);
    expect(block).toContain("const R = INSURANCE_RATES_2026;");
    expect(block).not.toContain("CURRENT_INSURANCE_RATES");
    expect(block).not.toContain("0.105");
  });
  it("설명문·공식·FAQ 질문·유의사항이 10.5% 를 쓰지 않고, 광고 위 문구는 종전보다 넓지 않다", () => {
    const c = calc("employee-cost-quick");
    expect(c.explanation).toContain("(약 11.4%)");
    expect(c.explanation).toContain("약 20% 더 드는 셈");
    expect(c.formula).toContain("×11.44%");
    expect(c.faqs?.[0].q).toBe("4대보험 회사 부담분 11.4%는 어떻게 구성되나요?");
    expect(c.caveats?.[0]).toBe("4대보험 회사부담 11.4%는 산재보험을 평균 요율로 잡은 어림값입니다.");
    const all = [c.explanation, c.formula, ...(c.faqs ?? []).flatMap((f) => [f.q, f.a]), ...(c.caveats ?? [])].join("\n");
    expect(all).not.toContain("10.5%");
    expect(all).not.toContain("약 18%");
    notWider("즉 같은 급여라도 회사 입장에서는 약 20% 더 드는 셈이며", "즉 같은 급여라도 회사 입장에서는 약 18% 더 드는 셈이며");
    // 공식 1행: 고정폭 블록에서 글자 수가 같다(× 뒤 공백 대신 숫자 한 자리)
    const line1 = (c.formula ?? "").split("\n")[0];
    expect(line1).toBe("4대보험 회사부담 = 월 급여 ×11.44%");
    expect([...line1].length).toBe([..."4대보험 회사부담 = 월 급여 × 10.5%"].length);
    // 유의사항: 한글 26 그대로, 괄호 2개가 빠지고 공백 1개가 늘어 좁은 글자 합계가 15 -> 14 (employeeCostDisclosure.test.ts 와 같은 기준)
    const was = kinds("4대보험 회사부담 10.5%는 산재보험(업종별)을 낮게 잡은 어림값입니다.");
    const now = kinds(c.caveats?.[0] ?? "");
    expect(now.hangul).toBeLessThanOrEqual(was.hangul);
    expect(now.digit).toBeLessThanOrEqual(was.digit);
    expect(now.space + now.other).toBeLessThan(was.space + was.other);
  });
  it("공식 요율 11.44% 는 compute 의 요율을 소수 둘째 자리로 반올림한 값이다", () => {
    const r = calc("employee-cost-quick").compute({ monthly: 100_000_000 });
    const rate = (r.secondary?.find((s) => s.label === "4대보험 회사부담")?.value ?? 0) / 100_000_000;
    expect(Math.round(rate * 10000) / 100).toBe(11.44);
  });
});
