// /salary/* 격자 밖·구형 URL 308 정규화 게이트 (2026-09-11)
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { NextRequest } from "next/server";
import { middleware } from "@/middleware";
import { getStaticSalaryAmounts } from "@/lib/salaryStaticParams";
import { SALARY_STATIC_AMOUNTS } from "@/lib/salaryStaticAmounts.generated";
import {
  SALARY_HREF_MAX_GAP,
  nearestStaticSalaryAmount,
  parseSalaryPathAmount,
  resolveSalaryRedirect,
  salaryReportHref,
  salaryReportHrefOrNearest,
} from "@/lib/salaryRedirect";

const UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0 Safari/537.36";
const request = (path: string) => new NextRequest(`https://www.moneysalary.com${path}`, { headers: { "user-agent": UA, host: "www.moneysalary.com" } });

describe("salaryStaticAmounts.generated", () => {
  it("matches getStaticSalaryAmounts() (no drift) and is sorted unique", async () => {
    const expected = [...new Set(getStaticSalaryAmounts())].sort((a, b) => a - b);
    expect(SALARY_STATIC_AMOUNTS).toEqual(expected);
    expect(SALARY_STATIC_AMOUNTS.length).toBeGreaterThan(200);
  });
});

describe("parseSalaryPathAmount", () => {
  it("reads numeric, manwon and eok forms", async () => {
    expect(parseSalaryPathAmount("62500000")).toBe(62_500_000);
    expect(parseSalaryPathAmount("13400-manwon")).toBe(134_000_000);
    expect(parseSalaryPathAmount("6980-manwon")).toBe(69_800_000);
    expect(parseSalaryPathAmount("1-eok")).toBe(100_000_000);
    expect(parseSalaryPathAmount("1-5-eok")).toBe(150_000_000);
  });
  it("rejects other shapes", async () => {
    for (const s of ["abc", "50000000abc", "-5000000", "5,000", "eok", "1-eok-2", "99999999999"]) expect(parseSalaryPathAmount(s), s).toBeNull();
  });
});

describe("nearestStaticSalaryAmount", () => {
  it("returns members unchanged and snaps others to the closest member", async () => {
    for (const a of [50_000_000, 62_500_000, SALARY_STATIC_AMOUNTS[0], SALARY_STATIC_AMOUNTS.at(-1)!]) expect(nearestStaticSalaryAmount(a)).toBe(a);
    expect(nearestStaticSalaryAmount(69_800_000)).toBe(70_000_000);
    expect(nearestStaticSalaryAmount(210_000_000)).toBe(SALARY_STATIC_AMOUNTS.filter((x) => x <= 210_000_000).at(-1)! >= 200_000_000 ? nearestStaticSalaryAmount(210_000_000) : 200_000_000);
    expect(nearestStaticSalaryAmount(1)).toBe(SALARY_STATIC_AMOUNTS[0]);
    expect(nearestStaticSalaryAmount(10_000_000_000)).toBe(SALARY_STATIC_AMOUNTS.at(-1));
    // 항상 집합의 원소여야 한다
    for (const probe of [1234567, 33_333_333, 99_999_999, 123_456_789, 555_555_555]) expect(SALARY_STATIC_AMOUNTS).toContain(nearestStaticSalaryAmount(probe));
  });
});

describe("salaryReportHref (내부 링크 — 클램프 금지·오차 2% 게이트, 2026-09-12 S2-2)", () => {
  it("returns members as-is and snaps within SALARY_HREF_MAX_GAP", async () => {
    expect(SALARY_HREF_MAX_GAP).toBe(0.02);
    expect(salaryReportHref(50_000_000)).toBe("/salary/50000000");
    expect(salaryReportHref(SALARY_STATIC_AMOUNTS[0])).toBe(`/salary/${SALARY_STATIC_AMOUNTS[0]}`);
    expect(salaryReportHref(SALARY_STATIC_AMOUNTS.at(-1)!)).toBe(`/salary/${SALARY_STATIC_AMOUNTS.at(-1)}`);
    expect(salaryReportHref(69_800_000)).toBe("/salary/70000000"); // 0.29%
    expect(salaryReportHref(204_000_000)).toBe("/salary/207000000"); // 1.47%
    expect(salaryReportHref(345_000_000)).toBe("/salary/350000000"); // 1.45%
  });
  it("never clamps: below the first or above the last static amount is null", async () => {
    expect(salaryReportHref(SALARY_STATIC_AMOUNTS[0] - 1)).toBeNull();
    expect(salaryReportHref(SALARY_STATIC_AMOUNTS.at(-1)! + 1)).toBeNull();
    for (const a of [360_000_000, 410_000_000, 450_000_000, 900_000_000, 1_500_000_000]) expect(salaryReportHref(a), String(a)).toBeNull();
    for (const a of [0, -5_000_000, Number.NaN, Number.POSITIVE_INFINITY, 1, 4_000_000]) expect(salaryReportHref(a), String(a)).toBeNull();
  });
  it("gap boundary: exactly 2% links, just over 2% is null", async () => {
    // 비율을 정확히 만들기 위한 소형 격자
    const g1 = [98, 300];
    expect(salaryReportHref(100, g1)).toBe("/salary/98"); // 2/100 = 2.00% (경계 포함)
    expect(salaryReportHref(101, g1)).toBeNull(); // 3/101 = 2.97%
    const g2 = [100, 200];
    expect(salaryReportHref(102, g2)).toBe("/salary/100"); // 1.96%
    expect(salaryReportHref(104, g2)).toBeNull(); // 3.85%
    expect(salaryReportHref(198, g2)).toBe("/salary/200"); // 1.01%
    // 실제 집합의 성긴 구간(2억~3.5억): 최근접이 있어도 오차가 크면 링크 없음
    expect(salaryReportHref(228_000_000)).toBeNull(); // 최근접 2.2억, 3.5%
    expect(salaryReportHref(275_000_000)).toBeNull(); // 최근접 2.5억/3억, 9.1%
  });
  it("every non-null result is a member of the static set", async () => {
    for (let a = 5_000_000; a <= 360_000_000; a += 1_234_567) {
      const h = salaryReportHref(a);
      if (h !== null) expect(SALARY_STATIC_AMOUNTS).toContain(Number(h.replace("/salary/", "")));
    }
  });
});

describe("salaryReportHrefOrNearest (월급 리포트·공유 결과용 느슨한 판)", () => {
  it("agrees with salaryReportHref when it links, falls back to the nearest member in range, null outside", async () => {
    expect(salaryReportHrefOrNearest(69_800_000)).toBe(salaryReportHref(69_800_000));
    expect(salaryReportHrefOrNearest(50_000_000)).toBe("/salary/50000000");
    expect(salaryReportHrefOrNearest(228_000_000)).toBe("/salary/220000000");
    expect(salaryReportHrefOrNearest(275_000_000)).toBe("/salary/300000000"); // 동률 → 큰 쪽
    expect(salaryReportHrefOrNearest(400_000_000)).toBeNull();
    expect(salaryReportHrefOrNearest(4_000_000)).toBeNull();
    expect(salaryReportHrefOrNearest(Number.NaN)).toBeNull();
  });
});

describe("resolveSalaryRedirect", () => {
  it("passes static pages through and redirects off-grid or legacy forms", async () => {
    expect(resolveSalaryRedirect("/salary/50000000")).toBeNull();
    expect(resolveSalaryRedirect("/salary/62500000")).toBeNull();
    expect(resolveSalaryRedirect("/salary/6980-manwon")).toBe("/salary/70000000");
    expect(resolveSalaryRedirect("/salary/5000-manwon")).toBe("/salary/50000000");
    expect(resolveSalaryRedirect("/salary/1-eok")).toBe("/salary/100000000");
    const off = resolveSalaryRedirect("/salary/210000000");
    expect(off).not.toBeNull();
    expect(SALARY_STATIC_AMOUNTS).toContain(Number(off!.replace("/salary/", "")));
    expect(resolveSalaryRedirect("/salary/50000000/")).toBeNull();
    expect(resolveSalaryRedirect("/salary/abc")).toBeNull();
    expect(resolveSalaryRedirect("/salary")).toBeNull();
    expect(resolveSalaryRedirect("/salary-db/samsung-electronics")).toBeNull();
    expect(resolveSalaryRedirect("/monthly/3000000")).toBeNull();
  });
});

// 2025-09-16 ~ 2025-11-22 의 /salary/[amount] 는 parseInt(amount) * 10000 (만원 단위) 이었다.
// GSC 에 남은 1~5자리 URL 107건(361일 노출 742·평균 순위 9.0)이 전부 500만원 페이지로 가던 사고 (2026-09-26).
describe("resolveSalaryRedirect — 2025 구형 만원 단위 1~5자리 URL", () => {
  const min = SALARY_STATIC_AMOUNTS[0];
  const nearestPath = (won: number) => `/salary/${nearestStaticSalaryAmount(won)}`;

  it("reads 1~5 digit segments as 만원 and snaps to the nearest static page", async () => {
    const t3850 = resolveSalaryRedirect("/salary/3850");
    expect(t3850).toBe(nearestPath(38_500_000));
    const won3850 = Number(t3850!.replace("/salary/", ""));
    expect(Math.abs(won3850 - 38_500_000) / 38_500_000).toBeLessThanOrEqual(0.02);
    expect(resolveSalaryRedirect("/salary/25000")).toBe(nearestPath(250_000_000));
    expect(resolveSalaryRedirect("/salary/4150")).toBe(nearestPath(41_500_000));
    expect(resolveSalaryRedirect("/salary/10300")).toBe(nearestPath(103_000_000));
    expect(resolveSalaryRedirect("/salary/2300")).toBe(nearestPath(23_000_000));
    expect(SALARY_STATIC_AMOUNTS).toContain(50_000_000);
    expect(resolveSalaryRedirect("/salary/5000")).toBe("/salary/50000000");
    expect(resolveSalaryRedirect("/salary/1")).toBe(`/salary/${min}`); // 1만원 → 최소 금액 (종전과 같음)
  });

  it("leaves ambiguous, full-won, legacy-suffix and invalid forms as before", async () => {
    expect(nearestStaticSalaryAmount(1)).toBe(min);
    expect(parseSalaryPathAmount("3850")).toBe(3850); // 파서 계약(숫자 = 원)은 그대로
    expect(resolveSalaryRedirect("/salary/300000")).toBe(`/salary/${min}`); // 6~7자리는 모호 → 종전 클램프
    expect(resolveSalaryRedirect("/salary/4999999")).toBe(`/salary/${min}`);
    expect(resolveSalaryRedirect("/salary/50000000")).toBeNull();
    expect(resolveSalaryRedirect("/salary/9-manwon")).toBe(`/salary/${min}`); // -manwon 은 이미 만원 → 재곱셈 금지
    expect(resolveSalaryRedirect("/salary/5000-manwon")).toBe("/salary/50000000");
    expect(resolveSalaryRedirect("/salary/1-5-eok")).toBe("/salary/150000000");
    expect(resolveSalaryRedirect("/salary/abc")).toBeNull();
    expect(resolveSalaryRedirect("/salary/0")).toBeNull();
    expect(resolveSalaryRedirect("/salary/00000")).toBeNull();
  });

  it("sweep n = 1..99999: every target is a static page and never the request itself", async () => {
    const statics = new Set(SALARY_STATIC_AMOUNTS);
    for (let n = 1; n <= 99_999; n++) {
      const req = `/salary/${n}`;
      const t = resolveSalaryRedirect(req);
      if (t === null || t === req || !statics.has(Number(t.slice(8)))) {
        expect.fail(`${req} -> ${t}`);
      }
    }
  });

  it("middleware 308s /salary/3850 to the 3,850만원 page and keeps the query", async () => {
    const r = await middleware(request("/salary/3850?utm_source=google"));
    expect(r.status).toBe(308);
    const loc = new URL(r.headers.get("location")!);
    expect(loc.pathname).toBe(nearestPath(38_500_000));
    expect(loc.searchParams.get("utm_source")).toBe("google");
  });
});

describe("middleware /salary normalization", () => {
  it("308s off-grid and legacy salary URLs to the nearest static page, keeps static pages", async () => {
    const r1 = await middleware(request("/salary/6980-manwon"));
    expect(r1.status).toBe(308);
    expect(new URL(r1.headers.get("location")!).pathname).toBe("/salary/70000000");
    const r2 = await middleware(request("/salary/13400-manwon"));
    expect(r2.status).toBe(308);
    expect(SALARY_STATIC_AMOUNTS).toContain(Number(new URL(r2.headers.get("location")!).pathname.replace("/salary/", "")));
    const ok = await middleware(request("/salary/50000000"));
    expect(ok.status).toBe(200);
    expect(ok.headers.get("x-middleware-next")).toBe("1");
    const unrelated = await middleware(request("/calc/samsung-bonus"));
    expect(unrelated.headers.get("x-middleware-next")).toBe("1");
  });
  it("preserves the query string on redirect", async () => {
    const r = await middleware(request("/salary/6980-manwon?utm_source=naver"));
    expect(r.status).toBe(308);
    const loc = new URL(r.headers.get("location")!);
    expect(loc.pathname).toBe("/salary/70000000");
    expect(loc.searchParams.get("utm_source")).toBe("naver");
  });
  // 주간 헬스체크(scripts/health-check.mjs)의 격자 밖 프로브가 실제 미들웨어 동작과 같아야 한다 —
  // 종전 기대값 404 가 9/11 308 도입 뒤 매주 FAIL 이던 사고(2026-09-25 B1) 재발 방지.
  it("health-check probe /salary/12345678 expects the same 308 target the middleware returns", async () => {
    const r = await middleware(request("/salary/12345678"));
    expect(r.status).toBe(308);
    const target = new URL(r.headers.get("location")!).pathname;
    expect(target).toBe("/salary/12500000");
    expect(SALARY_STATIC_AMOUNTS).toContain(12_500_000);
    const hc = readFileSync(resolve(process.cwd(), "scripts/health-check.mjs"), "utf8");
    const line = hc.split(/\r?\n/).find((l) => l.includes('"/salary/12345678"'));
    expect(line, "health-check 에 /salary/12345678 프로브가 없음").toBeDefined();
    expect(line).toMatch(/"\/salary\/12345678",\s*308,/);
    expect(line).toContain("/\\/salary\\/12500000$/");
  });
});
