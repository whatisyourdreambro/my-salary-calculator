// /calc/[slug] 메타 동결 게이트 (2026-09-12 리뷰 — SI-04 cdf3176 이 설명문을 고치며 description 2쪽이 바뀐 사건)
//
// 배경: calculatorSeoDescription(seoText.ts)은 description 이 60자 미만이면 '제목 — description. explanation' 을
// 155자로 잘라 meta description 으로 쓴다. 그래서 explanation 의 앞부분을 고치면 메타가 바뀐다 — 2026-10-09 까지의
// 메타 동결 기간에는 202쪽 전부가 동결 시점(01ce9fe)의 스냅샷과 byte 단위로 같아야 한다.
// 스냅샷(fixtures/calcDescriptions-2026-09-11.json)은 01ce9fe 의 src/ + tsconfig.json 을 격리 디렉터리에 풀어
// 같은 두 함수(calculatorSeoTitle·calculatorSeoDescription)로 뽑은 값이다. 동결 해제 후 메타를 의도적으로 바꿀 때는
// 스냅샷을 재생성해 함께 커밋한다(그 커밋 메시지에 바뀐 슬러그를 적을 것).
import { describe, expect, it } from "vitest";
import { allCalculators } from "@/lib/simpleCalculators";
import { calculatorSeoDescription, calculatorSeoTitle, SEO_DESCRIPTION_MIN } from "@/lib/simpleCalculators/seoText";
import snapshotJson from "./fixtures/calcDescriptions-2026-09-11.json";

const snapshot = snapshotJson as Record<string, { title: string; description: string }>;

describe("/calc 메타 동결 — 01ce9fe 스냅샷과 일치 (~2026-10-09)", () => {
  it("스냅샷과 레지스트리가 같은 202개 슬러그", () => {
    expect(allCalculators.length).toBe(202);
    expect(Object.keys(snapshot).sort()).toEqual(allCalculators.map((c) => c.slug).sort());
  });

  it("202쪽 전부 title·description 이 스냅샷과 byte 단위로 같다", () => {
    const diffs: string[] = [];
    for (const calc of allCalculators) {
      const s = snapshot[calc.slug];
      if (calculatorSeoTitle(calc) !== s.title) diffs.push(`${calc.slug} title`);
      if (calculatorSeoDescription(calc) !== s.description) {
        diffs.push(`${calc.slug} description: ${calculatorSeoDescription(calc)} !== ${s.description}`);
      }
    }
    expect(diffs).toEqual([]);
  });

  it("동결 사건의 2쪽(yearly-to-hourly·weekly-pay)은 explanation 이 description 에 이어 붙는 경우다 (테스트가 공허하지 않음)", () => {
    for (const slug of ["yearly-to-hourly", "weekly-pay"]) {
      const calc = allCalculators.find((c) => c.slug === slug)!;
      expect(calc.description.length, slug).toBeLessThan(SEO_DESCRIPTION_MIN);
      expect(snapshot[slug].description, slug).toContain("4.345주(연 52주 ÷ 12개월)");
      // 잘려 들어가는 앞부분 — 여기를 고치면 메타가 바뀐다
      expect(calculatorSeoDescription(calc), slug).toContain((calc.explanation ?? "").slice(0, 40));
    }
  });
});
