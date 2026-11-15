// 성과급 계산기 입력 위생 — 소스 고정 (2026-11-15 N2-calc-04: calc-01-F08·F09, calc-02-F19, calc-03-F16·F17)
//
// NumberInput 은 type="number" 이면 min 과 상관없이 빼기 기호를 받아(NumberInput.tsx allowNegative 기본값)
// '-5000' 이 '-2,500만원' 으로 찍혔다. 금액·비율·주식 수 칸은 모두 allowNegative={false}.
// '추가 세액공제' 슬라이더와 직접 입력 칸은 화면 읽기 프로그램이 이름을 읽을 수 있어야 한다(id+htmlFor 또는 aria-label).
// 속성만 바꾸는 묶음이라 첫 화면 글자·배치는 그대로다.
// 이 묶음이 맡은 11개 파일만 본다 — 다른 성과급 계산기는 그 파일을 맡은 묶음(N2-calc-09~13·16)이 들어온 뒤 목록을 넓힌다.
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const SLUGS = [
  "celltrion-bonus", "hd-hyundai-bonus", "hyundai-bonus", "hyundai-mobis-bonus", "hyundai-rotem-bonus",
  "kakao-bonus", "kepco-bonus", "kia-bonus", "lg-display-bonus", "lg-energy-bonus", "posco-bonus",
] as const;

const read = (slug: string) => readFileSync(resolve(process.cwd(), `src/app/calc/${slug}/Client.tsx`), "utf8");

/** `<Tag` 부터 그 태그를 닫는 `/>` 까지(자식 없는 입력 요소) */
function selfClosingTags(src: string, tag: string): { start: number; body: string }[] {
  const out: { start: number; body: string }[] = [];
  const re = new RegExp(`<${tag}\\b`, "g");
  let m: RegExpExecArray | null;
  while ((m = re.exec(src))) {
    const end = src.indexOf("/>", m.index);
    out.push({ start: m.index, body: src.slice(m.index, end + 2) });
  }
  return out;
}

/** 입력 요소가 <label> 안에 들어 있으면 그 label 이 이름이 된다 */
function insideLabel(src: string, at: number): boolean {
  const before = src.slice(0, at);
  const open = before.lastIndexOf("<label");
  const close = before.lastIndexOf("</label>");
  return open > close && !/^<label htmlFor=/.test(before.slice(open));
}

describe("성과급 계산기 11종 입력 위생 (N2-calc-04)", () => {
  for (const slug of SLUGS) {
    const src = read(slug);

    it(`${slug}: 모든 NumberInput 에 allowNegative={false}`, () => {
      const inputs = selfClosingTags(src, "NumberInput");
      expect(inputs.length).toBeGreaterThan(0);
      for (const { body } of inputs) expect(body, body).toContain("allowNegative={false}");
    });

    it(`${slug}: label 밖의 NumberInput 은 aria-label 이 있다`, () => {
      for (const { start, body } of selfClosingTags(src, "NumberInput")) {
        if (insideLabel(src, start)) continue;
        expect(body, body).toMatch(/aria-label="[^"]+"/);
      }
    });

    it(`${slug}: 슬라이더(type=range)는 id+htmlFor 짝 또는 aria-label`, () => {
      const ranges = selfClosingTags(src, "input").filter((t) => t.body.includes('type="range"'));
      expect(ranges.length).toBeGreaterThan(0);
      for (const { body } of ranges) {
        if (/aria-label="[^"]+"/.test(body)) continue;
        const id = body.match(/\bid="([^"]+)"/)?.[1];
        expect(id, body).toBeTruthy();
        expect(src).toContain(`htmlFor="${id}"`);
      }
    });
  }

  it("포스코: 시나리오 칩·직접 입력 버튼은 aria-pressed, 세금 가정 버튼은 aria-expanded (빠른 값 버튼에는 없음)", () => {
    const src = read("posco-bonus");
    expect(src).toContain("aria-pressed={scenarioId === s.id && !customMode}");
    expect(src).toContain("aria-pressed={customMode}");
    expect(src).toContain("aria-expanded={showAdvanced}");
    expect(src.match(/aria-pressed=/g)?.length).toBe(2);
  });
});

// 주가 표시(calc-02-F17): 만원 단위를 정수로 반올림하면 '47주 × 12만원' 옆에 573만원(121,900원 기준)이 찍혀
// 곱셈이 맞지 않았다. 소수 첫째 자리까지(끝 .0 은 지움) — 기본 주가(12만·28만·5만)와 빠른 값 버튼 글자는 그대로.
describe("주식 가치 카드의 주가 표시 (calc-02-F17)", () => {
  const fmt = (stockPrice: number) => (stockPrice / 10000).toFixed(1).replace(/\.0$/, "");
  it("기아·모비스·카카오 가치 식은 소수 첫째 자리, 빠른 값 버튼 라벨은 정수 그대로", () => {
    for (const slug of ["kia-bonus", "hyundai-mobis-bonus", "kakao-bonus"]) {
      const src = read(slug);
      expect(src, slug).not.toContain("(stockPrice / 10000).toFixed(0)");
      expect(src, slug).toContain(String.raw`(stockPrice / 10000).toFixed(1).replace(/\.0$/, "")`);
      expect(src, slug).toContain("{(p / 10000).toFixed(0)}만");
    }
    expect(read("kakao-bonus").match(/\(stockPrice \/ 10000\)\.toFixed\(1\)/g)?.length).toBe(2);
  });
  it("기본 주가는 같은 글자, 반올림이 곱셈을 틀리게 하던 값은 소수로", () => {
    expect([fmt(120_000), fmt(280_000), fmt(50_000)]).toEqual(["12", "28", "5"]);
    expect(fmt(121_900)).toBe("12.2");
    expect(fmt(99_999)).toBe("10");
  });
});
