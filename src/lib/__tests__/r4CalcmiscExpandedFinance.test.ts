// N2-simple-calc-05 (R4, 2026-11-18) — expandedFinance 51종 입력 범위 안내와 /calc/variable-rate-stress 스트레스 금리 문장.
//  · simple-calc-b05a-F01: 안내는 결과 카드 안(CalcResultAd 위)에 보인다. 라벨 끝 음절에 받침이 없으면 '는', 있으면 '은'
//    (종전 늘 '은' — '무급 처리 일수은'), 1조 상한은 '1조'(종전 '1000000000000'). 어떤 안내도 종전 문장보다 길지 않다.
import { describe, expect, it } from "vitest";
import { expandedFinanceCalculators } from "@/lib/simpleCalculators/expandedFinance";

const hasFinalConsonant = (word: string) => {
  const c = word.charCodeAt(word.length - 1);
  return !(c >= 0xac00 && c <= 0xd7a3 && (c - 0xac00) % 28 === 0);
};
const oldRange = (f: { label: string; min?: number; max?: number; suffix?: string }) =>
  `${f.label}은 ${f.min ?? 0}~${f.max ?? 1e12}${f.suffix ?? ""} 범위로 입력하세요.`;

describe("simple-calc-b05a-F01 입력 범위 안내 — 조사·상한 표기", () => {
  it("51종 전부 같은 검사기를 쓴다", () => {
    expect(expandedFinanceCalculators).toHaveLength(51);
  });

  it.each(expandedFinanceCalculators.map((c) => [c.slug, c] as const))("%s: 범위 밖 입력 안내는 받침에 맞는 조사, 1조 표기, 종전보다 짧거나 같음", (_slug, calc) => {
    const defaults = Object.fromEntries(calc.fields.map((field) => [field.name, field.defaultValue]));
    for (const field of calc.fields) {
      const bads = [(field.max ?? 1e12) + 1, ...((field.min ?? 0) >= 1 ? [(field.min ?? 0) - 1] : [])];
      for (const bad of bads) {
        const out = calc.compute({ ...defaults, [field.name]: bad });
        expect(out.status, `${field.label} ${bad}`).toBe("invalid");
        const note = String(out.note);
        const particle = hasFinalConsonant(field.label) ? "은 " : "는 ";
        expect(note.startsWith(field.label + particle), `${field.label}: ${note}`).toBe(true);
        expect(note).not.toContain("1000000000000");
        expect(note).toMatch(/ 범위로 입력하세요\.$/);
        expect(note.length, note).toBeLessThanOrEqual(oldRange(field).length);
      }
    }
  });

  it("정수 칸에 소수를 넣으면 같은 조사 규칙으로 '정수로 입력하세요'", () => {
    let checked = 0;
    for (const calc of expandedFinanceCalculators) {
      const defaults = Object.fromEntries(calc.fields.map((field) => [field.name, field.defaultValue]));
      for (const field of calc.fields) {
        if (field.step !== 1 || field.suffix === "원") continue;
        const value = Math.min((field.max ?? 600) - 0.5, (field.min ?? 0) + 0.5);
        if (value < (field.min ?? 0)) continue;
        const out = calc.compute({ ...defaults, [field.name]: value });
        expect(out.status).toBe("invalid");
        expect(out.note).toBe(`${field.label}${hasFinalConsonant(field.label) ? "은" : "는"} 정수로 입력하세요.`);
        checked++;
      }
    }
    expect(checked).toBeGreaterThan(20);
  });

  it("예: 무급 처리 일수 32 · 현재 월 통근비 1조 초과 · 전체 만기 빈칸", () => {
    const byslug = (slug: string) => expandedFinanceCalculators.find((c) => c.slug === slug)!;
    const run = (slug: string, over: Record<string, number>) => {
      const c = byslug(slug);
      return c.compute({ ...Object.fromEntries(c.fields.map((f) => [f.name, f.defaultValue])), ...over });
    };
    const field = (slug: string, label: string) => byslug(slug).fields.find((f) => f.label === label)!.name;
    expect(run("unpaid-leave-budget", { [field("unpaid-leave-budget", "무급 처리 일수")]: 32 }).note).toBe("무급 처리 일수는 0~31일 범위로 입력하세요.");
    expect(run("commute-adjusted-offer", { [field("commute-adjusted-offer", "현재 월 통근비")]: 1e12 + 1 }).note).toBe("현재 월 통근비는 0~1조원 범위로 입력하세요.");
    expect(run("loan-balance-after-payments", { [field("loan-balance-after-payments", "전체 만기")]: 0 }).note).toBe("전체 만기는 1~600개월 범위로 입력하세요.");
  });
});

// simple-calc-b05a-F02: /calc/variable-rate-stress 의 낡은 스트레스 금리 수치(1.50%, 지방 0.75% 2025년 12월 말까지)를 지우기만 한다.
// 2025-10-16 부터 수도권·규제지역 주담대 3%, 지방 0.75% 는 2026-12-31 까지 연장(사이트 loanRules.ts 와 같은 사실).
describe("simple-calc-b05a-F02 /calc/variable-rate-stress — 낡은 스트레스 금리 문장 삭제(지우기만)", () => {
  const calc = expandedFinanceCalculators.find((c) => c.slug === "variable-rate-stress")!;
  const OLD_DETAIL_SNIPPET = "DSR 산정 시 스트레스 금리 1.50%를 가산하되 실제 대출금리에는 부과하지 않는 한도 산정 제도";
  const OLD_CAVEAT = "스트레스 DSR의 스트레스 금리는 지역과 시기에 따라 달라집니다(금융위원회 2025년 5월 20일 보도자료는 수도권 외 지방 주담대에 0.75%를 2025년 12월 말까지 한시 적용하고 연말에 다시 검토할 계획이라고 밝힘). 지금 적용되는 스트레스 금리와 대출 한도는 금융회사 안내로 확인해야 합니다.";
  // 새 문자열이 옛 문자열에서 글자를 지우기만 해서 만들어졌는지(부분 수열) 확인
  const isDeletionOf = (next: string, prev: string) => {
    let i = 0;
    for (const ch of prev) if (i < next.length && next[i] === ch) i++;
    return i === next.length && next.length < prev.length;
  };
  it("details 에 '1.50%를 가산'이 없고 종전 문장에서 ' 1.50%'만 지웠다", () => {
    const details = String(calc.details);
    expect(details).not.toContain("1.50%");
    const now = "DSR 산정 시 스트레스 금리를 가산하되 실제 대출금리에는 부과하지 않는 한도 산정 제도";
    expect(details).toContain(now);
    expect(isDeletionOf(now, OLD_DETAIL_SNIPPET)).toBe(true);
  });
  it("주의사항에 '2025년 12월 말까지 한시'가 없고 괄호 하나만 지웠다", () => {
    const caveats = calc.caveats ?? [];
    expect(caveats.join(" ")).not.toContain("2025년 12월 말까지 한시");
    const now = caveats.find((c) => c.startsWith("스트레스 DSR의 스트레스 금리는"))!;
    expect(now).toBe("스트레스 DSR의 스트레스 금리는 지역과 시기에 따라 달라집니다. 지금 적용되는 스트레스 금리와 대출 한도는 금융회사 안내로 확인해야 합니다.");
    expect(isDeletionOf(now, OLD_CAVEAT)).toBe(true);
    expect(caveats).toHaveLength(4);
  });
  it("publishedAt 은 확장 묶음 표시 그대로(지우기만 한 정정은 날짜 유지)", () => {
    expect(calc.publishedAt).toBe("2026-09-10");
  });
});
