// 2027 확정 봉급표 '빈칸' 데이터 가드 (수익 추천 #2 '2027 빈칸', 2026-09-25 준비)
//
// 고정하는 것:
//  (1) 지금(확정 전)은 PAY_FULL_2027 = null — 2027 페이지 수정일은 봉급표 묶음 배포일 상수를 쓴다
//  (2) 12월에 원문 숫자를 넣으면 이 파일이 바로 그 값을 점검한다 — 모양(호봉·계급 열·빈 칸)이 2026 원문 표와
//      같고, 100원 단위, 2026 이상, 호봉 오름차순, 근거·출처·확인일 형식
//  (3) 점검 함수 validatePayFull2027 가 흔한 입력 실수(열 밀림·빈 칸 어긋남·자릿수·감소·날짜·출처)를 잡는다
import { describe, expect, it } from "vitest";
import {
  PAY_2027_CONFIRMED,
  PAY_2027_PAGES_MODIFIED,
  PAY_FULL_2027,
  raisePct,
  raiseRange,
  ratePct,
  teacherRaiseRange,
  validatePayFull2027,
  type PayFull2027,
} from "@/lib/payTablesFull2027";
import { PAY_TABLES_RELEASE_DATE } from "@/config/siteDates";
import { buildPayFull2027Fixture } from "./payFull2027.fixture";

describe("실제 PAY_FULL_2027 상태", () => {
  it("확정 전(null)이면 수정일 = 봉급표 묶음 배포일, 입력 뒤면 원문 점검 통과·수정일 = 확인일", () => {
    if (PAY_FULL_2027 === null) {
      expect(PAY_2027_CONFIRMED).toBe(false);
      expect(PAY_2027_PAGES_MODIFIED).toBe(PAY_TABLES_RELEASE_DATE);
      return;
    }
    expect(PAY_2027_CONFIRMED).toBe(true);
    expect(validatePayFull2027(PAY_FULL_2027)).toEqual([]);
    expect(PAY_2027_PAGES_MODIFIED).toBe(PAY_FULL_2027.checked);
  });

  it("봉급표 묶음 배포일 상수는 YYYY-MM-DD", () => {
    expect(PAY_TABLES_RELEASE_DATE).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    expect(new Date(PAY_TABLES_RELEASE_DATE).toISOString().slice(0, 10)).toBe(PAY_TABLES_RELEASE_DATE);
  });
});

describe("validatePayFull2027 — 입력 실수 잡기", () => {
  const clone = (d: PayFull2027): PayFull2027 => JSON.parse(JSON.stringify(d)) as PayFull2027;

  it("모양이 맞는 가짜 확정표는 통과", () => {
    expect(validatePayFull2027(buildPayFull2027Fixture())).toEqual([]);
  });

  it("교원 행 수가 다르면 실패", () => {
    const d = clone(buildPayFull2027Fixture());
    d.teacher = d.teacher.slice(0, 39);
    expect(validatePayFull2027(d).join("\n")).toContain("교원: 행 수 39");
  });

  it("경찰·소방 열이 한 칸 밀리면(빈 칸 위치 어긋남) 실패", () => {
    const d = clone(buildPayFull2027Fixture());
    // 32호봉 행: 순경~경위 빈 칸, 경감만 값 — 한 칸 왼쪽으로 밀어 넣은 실수
    const row32 = d.policeFire.find((r) => r[0] === 32)!;
    const shifted = [32, null, null, null, row32[5], null, null, null, null, null, null];
    d.policeFire = d.policeFire.map((r) => (r[0] === 32 ? shifted : r));
    expect(validatePayFull2027(d).join("\n")).toMatch(/경찰·소방 32호봉 \d열: 빈 칸 위치가 2026 표와 다름/);
  });

  it("100원 단위가 아니거나 2026 보다 작거나 호봉이 올라도 줄면 실패", () => {
    const d = clone(buildPayFull2027Fixture());
    const general = d.general.map((r) => [...r]);
    general[0][1] = 2133050; // 9급 1호봉 — 자릿수 실수
    general[4][1] = 1000000; // 9급 5호봉 — 2026 보다 작고 앞 호봉보다 작음
    d.general = general;
    const problems = validatePayFull2027(d).join("\n");
    expect(problems).toContain("일반직 1호봉 1열: 2133050 은 100원 단위 정수가 아님");
    expect(problems).toContain("일반직 5호봉 1열: 1000000 < 2026");
    expect(problems).toContain("일반직 5호봉 1열: 앞 호봉");
  });

  it("인상률·근거·출처·확인일 형식", () => {
    const d = clone(buildPayFull2027Fixture());
    d.commonRate = 3.9; // % 를 비율 자리에 넣은 실수
    d.basis = "";
    d.sourceUrl = "https://news.example.com/2027-pay";
    d.checked = "2026-12-32";
    const problems = validatePayFull2027(d);
    expect(problems).toHaveLength(4);
  });
});

describe("인상률 표기 헬퍼", () => {
  it("ratePct·raisePct 소수 첫째 자리", () => {
    expect(ratePct(0.039)).toBe("3.9");
    expect(raisePct(2133000, 2216187)).toBe("3.9");
  });

  it("raiseRange: 칸별 인상률 최소~최대, 모두 같으면 한 값", () => {
    expect(raiseRange([[1, 100, null]], [[1, 105, null]]).text).toBe("5.0%");
    expect(raiseRange([[1, 100], [2, 200]], [[1, 106], [2, 207]]).text).toBe("3.5~6.0%");
    // 가짜 확정표: 1호봉 4.5%·그 밖 3.9% (100원 반올림 오차 포함)
    const r = teacherRaiseRange(buildPayFull2027Fixture());
    expect(r.max).toBe("4.5");
    expect(Number(r.min)).toBeGreaterThanOrEqual(3.8);
  });
});
