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

// lens-meta-M01: 간이 계산기는 화면에 날짜가 없고 사이트맵 lastmod 는 CalculatorDef.publishedAt 하나만 읽는다(sitemap.ts).
// RL-10 이 사실을 고친 다섯 계산기는 실제로 고친 날(2026-11-15 KST)을 단다 — /calc 의 신규(2026-09-10) 필터에는 들지 않는다.
describe("RL-10 날짜 손잡이 — 고친 다섯 계산기의 publishedAt", () => {
  it("실제 수정일 2026-11-15, 미래 날짜 아님", () => {
    for (const slug of ["registration-tax-quick", "employee-cost-quick", "property-tax-quick", "yearly-to-hourly", "weekly-pay"]) {
      const c = calc(slug);
      expect(c.publishedAt, slug).toBe("2026-11-15");
      expect(new Date(`${c.publishedAt}T00:00:00+09:00`).getTime(), slug).toBeLessThanOrEqual(Date.now());
    }
  });
});

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

describe("CS-23 재산세 설명문(meta 스니펫) 납기 — 지방세법 제115조: 주택 1/2씩 7·9월, 건축물 7월, 토지 9월", () => {
  const was = "주택은 7월·9월 두 차례, 토지·건물은 7월/9월에 분납됩니다.";
  const now = "주택은 7월·9월 반씩, 건물은 7월, 토지는 9월 부과됩니다.";
  it("토지·건물 7월/9월 분납 오기가 없고 납기별로 적는다", () => {
    const e = calc("property-tax-quick").explanation ?? "";
    expect(e).toContain(now);
    expect(e).not.toContain("7월/9월에 분납");
    expect(e).toContain("매년 6월 1일 기준"); // 과세기준일(제114조)
    expect(calculatorSeoDescription(calc("property-tax-quick"))).toContain(now);
  });
  it("광고(GuideMidAd) 위 문장이 종전보다 넓지 않다 — 10월 문구의 절반씩 대신 반씩", () => {
    const a = kinds(now);
    const b = kinds(was);
    expect(a.hangul).toBeLessThan(b.hangul);
    expect(a.digit).toBeLessThanOrEqual(b.digit);
    expect(a.space + a.other).toBeLessThanOrEqual(b.space + b.other);
  });
});

describe("CS-23 연봉→시급·주급 설명문(meta 스니펫) — compute 와 같은 209 ÷ 48 ≈ 4.354 (최저임금법 시행령 제5조, 월 209시간)", () => {
  it("209시간 기준 4.354 — 한 달은 평균 4.354주라고 쓰지 않는다", () => {
    const y = calc("yearly-to-hourly").explanation ?? "";
    const w = calc("weekly-pay").explanation ?? "";
    expect(y).toContain("4.354주(월 209시간 ÷ 48)");
    expect(w).toContain("월 209시간을 주휴 포함 48시간으로 나눈 약 4.354로 월급을 나눕니다.");
    for (const e of [y, w]) {
      expect(e).not.toContain("4.345주(연 52주 ÷ 12개월)");
      expect(e).not.toContain("평균 4.354주");
    }
  });
  it("209 ÷ 48 은 4.354 로 반올림된다 (compute 의 MONTHLY_HOURS ÷ 48)", () => {
    expect(Math.round((209 / 48) * 1000) / 1000).toBe(4.354);
    expect(calc("weekly-pay").compute({ monthly: 3_000_000 }).primary.value).toBe(Math.round(3_000_000 / (209 / 48)));
  });
  it("광고(GuideMidAd) 위 바뀐 문장이 종전보다 좁다 — 한글이 늘어도 숫자·괄호·나눗셈 기호가 더 많이 빠진다", () => {
    const yWas = "월급을 4.345주(연 52주 ÷ 12개월)로 나눠 주급을,";
    const yNow = "월급을 4.354주(월 209시간 ÷ 48)로 나눠 주급을,";
    const a = kinds(yNow);
    const b = kinds(yWas);
    // 한글 1자(약 1em)가 빠지고 숫자 1자(약 0.6em)가 늘었다
    expect(a.hangul).toBe(b.hangul - 1);
    expect(a.digit).toBe(b.digit + 1);
    expect(a.space + a.other).toBe(b.space + b.other);
    const wWas = "한 달은 평균 4.345주(연 52주 ÷ 12개월)이므로 월급을 4.345로 나눕니다.";
    const wNow = "월 209시간을 주휴 포함 48시간으로 나눈 약 4.354로 월급을 나눕니다.";
    const c = kinds(wNow);
    const d = kinds(wWas);
    // 한글 +2(약 2em) 대신 숫자 -3·괄호 2·나눗셈 기호·마침표 1 이 빠진다(약 -3em)
    expect(c.hangul).toBe(d.hangul + 2);
    expect(c.digit).toBe(d.digit - 3);
    expect(c.other).toBe(d.other - 4);
    expect(c.space).toBe(d.space);
  });
});

describe("CS-05 등록면허세 설명문(meta 스니펫) — 등기 원인별 표준세율, 취득 원인 등기는 취득세에 통합 (질문 1 후보: 광고 위 줄 수는 실측 스윕)", () => {
  it("주택 유상 매매 0.8% 오기가 없고 보존·상속 0.8%·무상 1.5%·유상 2%(주택은 취득세율의 50%)·저당권 0.2%", () => {
    const e = calc("registration-tax-quick").explanation ?? "";
    for (const s of ["소유권 보존·상속 0.8%", "무상 이전 1.5%", "유상 이전 2%(주택은 취득세율의 50%)", "저당권 설정 0.2%", "취득세에 통합되어 따로 내지 않고", "20%가 지방교육세"]) expect(e).toContain(s);
    expect(e).not.toContain("주택 유상 매매는 취득가액의 0.8%");
    expect(e).not.toContain("증여(무상 취득)는 1.5%");
  });
  it("meta 스니펫(155자) 안에 취득 원인 등기는 따로 내지 않는다는 문장이 들어가고 세율 나열은 스니펫 밖이다", () => {
    const meta = calculatorSeoDescription(calc("registration-tax-quick"));
    expect(meta).toContain("매매·증여·상속처럼 취득을 원인으로 한 등기는 취득세에 통합되어 따로 내지 않고");
    expect(meta).not.toContain("유상 이전 2%");
    expect(meta).not.toContain("주택 유상 매매");
  });
  it("설명문 전체 글자 폭 추정은 종전보다 좁다(한글 157->150) — 그래도 줄바꿈 위치가 달라 몇 폭에서 한 줄 늘 수 있어 질문 1 로 실측한다", () => {
    const was = "등록면허세는 부동산 등기·등록을 할 때 내는 지방세로, 소유권 이전의 원인에 따라 세율이 다릅니다. 주택 유상 매매는 취득가액의 0.8%, 증여(무상 취득)는 1.5%, 상속은 0.8%가 기본이며 등록면허세액의 20%가 지방교육세로 함께 붙습니다. 유상 매매로 주택을 취득할 때는 취득세에 등록분이 통합돼 부과되므로, 이 계산기는 등기 원인별 등록분을 따로 확인하거나 취득세 통합 고지 내역을 검산할 때 쓰는 값입니다.";
    const a = kinds(calc("registration-tax-quick").explanation ?? "");
    const b = kinds(was);
    expect(a.hangul).toBe(b.hangul - 7);
    expect(a.digit).toBe(b.digit + 3);
    // 좁은 글자(공백·가운뎃점·%·마침표 등)는 6개 늘었다 — 한글 7자(약 6.6em)가 빠진 것보다 작다(약 +1.6em, 숫자 +3 은 약 +1.7em)
    expect(a.space + a.other).toBe(b.space + b.other + 6);
  });
});
