// /calc/samsung-bonus 결과 카드·다년도 누적 카드 — 금액이 숫자 중간에서 끊기지 않게 (R4 SAMSUNG, N2-calc-07 calc-03-F06, 2026-11-18)
//
// 기본 결과 세후 '39,608만원'(30px·900)이 360~375px 에서 '39,60' / '8만원'으로 끊겼다(keep-all + overflow-wrap:anywhere).
// 숫자는 whitespace-nowrap span, '만원' 앞에만 <wbr> — 줄 수는 종전 이하(결과 직하 광고는 그대로이거나 위로만).
// 세후 칸은 카드 오른쪽 끝이고 카드가 overflow-hidden 이라, 줄바꿈 금지 숫자가 칸 안쪽 여백(20px)을 넘으면 잘린다:
// 사이트 글꼴 900·tnum 실측 '39,608' 30px 109.47px — 여백 포함 허용폭 (vw−84)/2−21 은 345px 미만에서 모자란다.
// 그래서 360px 미만은 한 단계 작은 글씨(24px 87.58px), 10억 이상(6자리 만원)은 한 단계 더 작게(20px '123,456' 86.41px).
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const read = (rel: string) => readFileSync(resolve(process.cwd(), rel), "utf8");
const client = read("src/app/calc/samsung-bonus/Client.tsx");
const multi = read("src/app/calc/samsung-bonus/MultiYearBonusSimulator.tsx");

describe("삼성 성과급 결과 금액 줄바꿈 (N2-calc-07 calc-03-F06)", () => {
  it("Client 세전·세후: 숫자 nowrap + '만원' 앞 <wbr>", () => {
    expect(client).toContain('<span className="whitespace-nowrap">{fmtManwonInt(animGross)}</span><wbr />만원');
    expect(client).toContain('<span className="whitespace-nowrap">{fmtManwonInt(animNet)}</span><wbr />만원');
    expect(client).not.toContain("{fmtManwon(animGross)}");
    expect(client).not.toContain("{fmtManwon(animNet)}");
  });

  it("다년도 누적 세전·세후: 같은 규칙", () => {
    expect(multi).toContain('<span className="whitespace-nowrap">{fmtManwonInt(animCumGross)}</span><wbr />만원');
    expect(multi).toContain('<span className="whitespace-nowrap">{fmtManwonInt(animCumNet)}</span><wbr />만원');
    expect(multi).not.toContain("{fmtManwon(animCumGross)}");
    expect(multi).not.toContain("{fmtManwon(animCumNet)}");
  });

  it("세후 칸 글씨: 360px 미만 한 단계 작게, 10억 이상 한 단계 더, 640px 이상 종전(text-4xl)", () => {
    const rule = (v: string) => `\${${v} >= 100000 ? "text-xl min-[360px]:text-2xl" : "text-2xl min-[360px]:text-3xl"} sm:text-4xl font-black tabular-nums`;
    expect(client).toContain(rule("personal.netManwon"));
    expect(multi).toContain(rule("computed.cumNet"));
  });
});
