// /calc/samsung-biologics-bonus 입력 위생·접근성 — 속성만 (R4 SAMSUNG, N2-calc-13 calc-03-F16·F17, 2026-11-18)
//
// NumberInput 은 type="number" 이면 min 과 상관없이 빼기 기호를 받는다(NumberInput.tsx allowNegative 기본값) — 두 칸 모두
// allowNegative={false}, 직접 OPI % 칸은 최대 50 으로 자른다(OPI 상한 연봉 50%). 직접 입력 칸에는 aria-label, 시나리오 칩과
// 직접 입력 토글에는 aria-pressed, '세금 계산 가정 조정' 버튼에는 aria-expanded. 화면 글자·배치는 그대로다.
// (공유 테스트 bonusInputHygiene.test.ts 의 SLUGS 에 넣는 대신 이 단위 파일에 둔다 — 단위 가지 병합 충돌 방지.)
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const src = readFileSync(resolve(process.cwd(), "src/app/calc/samsung-biologics-bonus/Client.tsx"), "utf8");
const tags = (tag: string) => {
  const out: string[] = [];
  const re = new RegExp(`<${tag}\\b`, "g");
  let m: RegExpExecArray | null;
  while ((m = re.exec(src))) out.push(src.slice(m.index, src.indexOf("/>", m.index) + 2));
  return out;
};

describe("삼성바이오로직스 입력 위생 (N2-calc-13 calc-03-F16·F17)", () => {
  it("모든 NumberInput 에 allowNegative={false}, 직접 OPI 칸은 이름·50 상한", () => {
    const inputs = tags("NumberInput");
    expect(inputs).toHaveLength(2);
    for (const body of inputs) expect(body).toContain("allowNegative={false}");
    const opi = inputs.find((b) => b.includes("customOpiPercent"))!;
    expect(opi).toContain('aria-label="OPI 지급률 (연봉 대비 %)"');
    expect(opi).toContain("setCustomOpiPercent(Math.min(50, Number(e.target.value) || 0))");
  });

  it("칩·토글은 aria-pressed, 가정 조정 버튼은 aria-expanded", () => {
    expect(src).toContain("aria-pressed={scenarioId === s.id && !customMode}");
    expect(src).toContain("aria-pressed={customMode}");
    expect(src).toContain("aria-expanded={showAdvanced}");
  });
});
