// 홈 연봉 계산기 '결과 확인하기' 뒤 자동 스크롤 가드 (IVT-07 / ADS-07)
//
// 2026-10-19 이후: 결과 요약만 포커스하고, 화면 밖일 때만 block "nearest" 로 최소 이동한다.
// 예전 방식(전면 로딩 오버레이 + block "center" 스크롤)은 탭 직후 결과 광고를 엄지 위치에 세웠다.
// 운영자 결정 전까지 center/start 스크롤과 전면 오버레이를 계산기 흐름에 되살리지 않는다.
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const read = (file: string) => readFileSync(resolve(process.cwd(), file), "utf8").replace(/\r\n/g, "\n");

describe("결과 확인 뒤 광고 쪽 자동 스크롤 금지", () => {
  const calculator = read("src/components/SalaryCalculator.tsx");
  const focus = read("src/lib/calculationResultFocus.ts");

  it("SalaryCalculator 는 결과 포커스 도우미만 쓰고 직접 scrollIntoView 하지 않는다", () => {
    expect(calculator).toContain("focusCalculationResult(");
    expect(calculator).not.toMatch(/scrollIntoView\s*\(/);
    expect(calculator).not.toMatch(/scrollTo\s*\(/);
  });

  it("전면 로딩 오버레이(LoadingInterstitial)와 축하 효과를 계산기에 다시 넣지 않는다", () => {
    expect(calculator).not.toMatch(/LoadingInterstitial|confetti/i);
  });

  it("결과 포커스는 화면 밖일 때만 nearest 로 이동한다(center/start 금지)", () => {
    expect(focus).toMatch(/preventScroll:\s*true/);
    expect(focus).toMatch(/block:\s*"nearest"/);
    expect(focus).not.toMatch(/block:\s*"(center|start)"/);
  });
});
