// 자산 성장 차트(WealthChart) 문구 — /salary/[amount] 416쪽·홈과 /calc/2026-year 결과 (N2-components-03, 2026-11-15)
//
// components-b05-F01: 1억 미만 금액이 '월 19.322만원씩'·'2,142.928만' 처럼 소수 셋째 자리 만원으로 찍혔다
// (천 단위 만원으로 잘못 읽힘). 만원 정수로 반올림하고, 문턱은 반올림 값으로 본다 ('10,000만' 대신 '1.0억').
// components-b05-M01: 팁·툴팁이 숨은 출발 나이 30세로 계산한 나이('50세에 목표액 … 달성')를 모든 방문자에게 말했다.
// 차트 기준선과 같은 '{n}년 뒤'·'{n}년 후' 로 바꾼다.
// 차트는 HomeTopAd·GuideMidAd·SidebarAd 위라 문구는 종전 폭 이하로만 바뀐다.
import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

import { formatKRW } from "@/components/WealthChart";

describe("WealthChart formatKRW — 1억 미만은 만원 정수", () => {
  it("패키지 고정값", () => {
    expect(formatKRW(1_728_394)).toBe("173만");
    expect(formatKRW(35_000_000)).toBe("3,500만");
    expect(formatKRW(99_995_000)).toBe("1.0억");
    expect(formatKRW(100_000_000)).toBe("1.0억");
  });

  it("억 단위 값과 0 은 종전과 같다", () => {
    expect(formatKRW(1_000_000_000)).toBe("10.0억");
    expect(formatKRW(150_000_000)).toBe("1.5억");
    expect(formatKRW(0)).toBe("0만");
    expect(formatKRW(25_000_000)).toBe("2,500만");
  });

  it("1억 미만 결과에는 소수점이 없고 종전 문자열보다 길지 않다", () => {
    const old = (value: number) =>
      value >= 100000000 ? `${(value / 100000000).toFixed(1)}억` : `${(value / 10000).toLocaleString("ko-KR")}만`;
    for (const value of [1_932_200, 1_728_394, 21_429_280, 22_346_960, 99_994_999, 3_294_800, 12_345, 99_999_999]) {
      const now = formatKRW(value);
      expect(now).not.toMatch(/\d\.\d+만/);
      expect(now.length).toBeLessThanOrEqual(old(value).length);
    }
  });
});

describe("WealthChart 팁·툴팁 — 숨은 나이 가정 없음", () => {
  const src = readFileSync("src/components/WealthChart.tsx", "utf8");
  const TIP_BEFORE =
    "현재 저축과 수익률을 유지하면 ${fireYear.age}세에 목표액 ${formatKRW(fireGoal)}원을 달성합니다. 복리의 힘은 시간이 지날수록 거대해집니다!";
  const TIP_AFTER =
    "현재 저축과 수익률을 유지하면 ${fireYear.year}년 뒤 ${formatKRW(fireGoal)}원을 달성합니다. 복리의 힘은 시간이 지날수록 커집니다!";

  it("팁은 '{n}년 뒤', 툴팁 머리는 '{n}년 후' 만 쓰고 나이를 말하지 않는다", () => {
    expect(src).toContain(TIP_AFTER);
    expect(src).not.toContain("${fireYear.age}세에");
    expect(src).not.toContain("(나이:");
    expect(src).toContain('<p className="font-bold text-navy mb-2">{label}년 후</p>');
    // 계산 함수와 인자는 그대로 (출발 나이 인자는 화면에 쓰지 않을 뿐)
    expect(src).toContain("calculateWealthProjection(monthlySavings, annualReturn / 100, 30, 30)");
  });

  // 팁 <p> 는 globals.css 의 word-break: keep-all 이라 띄어쓰기에서만 줄이 바뀐다. 전체 폭이 줄어도 낱말 하나를
  // 둘로 나누면(공백 추가) 앞줄 끝 낱말이 밀려 특정 폭에서 한 줄이 늘 수 있다 — 그래서 낱말 수를 같게 두고
  // 낱말마다 한글·숫자·기타 글자 수가 종전 이하인지 본다 (그러면 어느 폭에서도 줄 수가 늘지 않는다).
  it("새 팁은 낱말 수가 같고 낱말마다 종전 이하다 — keep-all 줄바꿈에서도 줄이 늘지 않는다", () => {
    const count = (s: string, re: RegExp) => [...s].filter((ch) => re.test(ch)).length;
    // 나이는 31~60세(2자리) = 30 + 경과 연수 1~30년(1~2자리)
    for (const goal of ["5.0억", "10.0억", "100.0억"]) {
      for (let year = 1; year <= 30; year++) {
        const before = TIP_BEFORE.replace("${fireYear.age}", String(year + 30)).replace("${formatKRW(fireGoal)}", goal).split(" ");
        const after = TIP_AFTER.replace("${fireYear.year}", String(year)).replace("${formatKRW(fireGoal)}", goal).split(" ");
        expect(after.length).toBe(before.length);
        after.forEach((word, i) => {
          expect(count(word, /[가-힣]/), word).toBeLessThanOrEqual(count(before[i], /[가-힣]/));
          expect(count(word, /[0-9]/), word).toBeLessThanOrEqual(count(before[i], /[0-9]/));
          expect(count(word, /[^가-힣0-9]/), word).toBeLessThanOrEqual(count(before[i], /[^가-힣0-9]/));
        });
      }
    }
  });
});

// n2 수리: 부제가 짧아진 뒤 md 이상 가로 머리줄에서 제목 '자산 성장 시뮬레이션'이 두 줄로 접혀(홈 1010~1033px·/calc/2026-year
// 1013px 이상 결과 화면, 아래 광고 +32px, n2 스윕 B) 제목만 md 이상에서 한 줄로 고정한다. md 미만(세로 쌓기)은 그대로.
describe("WealthChart 머리줄 제목 — md 이상 한 줄", () => {
  const src = readFileSync("src/components/WealthChart.tsx", "utf8");
  it("제목 h2 에 md:whitespace-nowrap 만 더하고 md 미만 줄바꿈은 그대로", () => {
    const h2 = /<h2 className="([^"]+)">\s*<TrendingUp \/> 자산 성장 시뮬레이션/.exec(src);
    expect(h2).not.toBeNull();
    const classes = h2![1].split(/\s+/);
    expect(classes).toContain("md:whitespace-nowrap");
    expect(classes).not.toContain("whitespace-nowrap");
    expect(classes.filter((c) => c !== "md:whitespace-nowrap").join(" ")).toBe("text-2xl font-bold text-foreground flex items-center gap-2");
  });
});
