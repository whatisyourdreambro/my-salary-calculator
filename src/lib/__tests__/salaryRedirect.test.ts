// /salary/* 격자 밖·구형 URL 308 정규화 게이트 (2026-09-11)
import { describe, expect, it } from "vitest";
import { NextRequest } from "next/server";
import { middleware } from "@/middleware";
import { getStaticSalaryAmounts } from "@/lib/salaryStaticParams";
import { SALARY_STATIC_AMOUNTS } from "@/lib/salaryStaticAmounts.generated";
import { nearestStaticSalaryAmount, parseSalaryPathAmount, resolveSalaryRedirect } from "@/lib/salaryRedirect";

const UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0 Safari/537.36";
const request = (path: string) => new NextRequest(`https://www.moneysalary.com${path}`, { headers: { "user-agent": UA, host: "www.moneysalary.com" } });

describe("salaryStaticAmounts.generated", () => {
  it("matches getStaticSalaryAmounts() (no drift) and is sorted unique", () => {
    const expected = [...new Set(getStaticSalaryAmounts())].sort((a, b) => a - b);
    expect(SALARY_STATIC_AMOUNTS).toEqual(expected);
    expect(SALARY_STATIC_AMOUNTS.length).toBeGreaterThan(200);
  });
});

describe("parseSalaryPathAmount", () => {
  it("reads numeric, manwon and eok forms", () => {
    expect(parseSalaryPathAmount("62500000")).toBe(62_500_000);
    expect(parseSalaryPathAmount("13400-manwon")).toBe(134_000_000);
    expect(parseSalaryPathAmount("6980-manwon")).toBe(69_800_000);
    expect(parseSalaryPathAmount("1-eok")).toBe(100_000_000);
    expect(parseSalaryPathAmount("1-5-eok")).toBe(150_000_000);
  });
  it("rejects other shapes", () => {
    for (const s of ["abc", "50000000abc", "-5000000", "5,000", "eok", "1-eok-2", "99999999999"]) expect(parseSalaryPathAmount(s), s).toBeNull();
  });
});

describe("nearestStaticSalaryAmount", () => {
  it("returns members unchanged and snaps others to the closest member", () => {
    for (const a of [50_000_000, 62_500_000, SALARY_STATIC_AMOUNTS[0], SALARY_STATIC_AMOUNTS.at(-1)!]) expect(nearestStaticSalaryAmount(a)).toBe(a);
    expect(nearestStaticSalaryAmount(69_800_000)).toBe(70_000_000);
    expect(nearestStaticSalaryAmount(210_000_000)).toBe(SALARY_STATIC_AMOUNTS.filter((x) => x <= 210_000_000).at(-1)! >= 200_000_000 ? nearestStaticSalaryAmount(210_000_000) : 200_000_000);
    expect(nearestStaticSalaryAmount(1)).toBe(SALARY_STATIC_AMOUNTS[0]);
    expect(nearestStaticSalaryAmount(10_000_000_000)).toBe(SALARY_STATIC_AMOUNTS.at(-1));
    // 항상 집합의 원소여야 한다
    for (const probe of [1234567, 33_333_333, 99_999_999, 123_456_789, 555_555_555]) expect(SALARY_STATIC_AMOUNTS).toContain(nearestStaticSalaryAmount(probe));
  });
});

describe("resolveSalaryRedirect", () => {
  it("passes static pages through and redirects off-grid or legacy forms", () => {
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

describe("middleware /salary normalization", () => {
  it("308s off-grid and legacy salary URLs to the nearest static page, keeps static pages", () => {
    const r1 = middleware(request("/salary/6980-manwon"));
    expect(r1.status).toBe(308);
    expect(new URL(r1.headers.get("location")!).pathname).toBe("/salary/70000000");
    const r2 = middleware(request("/salary/13400-manwon"));
    expect(r2.status).toBe(308);
    expect(SALARY_STATIC_AMOUNTS).toContain(Number(new URL(r2.headers.get("location")!).pathname.replace("/salary/", "")));
    const ok = middleware(request("/salary/50000000"));
    expect(ok.status).toBe(200);
    expect(ok.headers.get("x-middleware-next")).toBe("1");
    const unrelated = middleware(request("/calc/samsung-bonus"));
    expect(unrelated.headers.get("x-middleware-next")).toBe("1");
  });
  it("preserves the query string on redirect", () => {
    const r = middleware(request("/salary/6980-manwon?utm_source=naver"));
    expect(r.status).toBe(308);
    const loc = new URL(r.headers.get("location")!);
    expect(loc.pathname).toBe("/salary/70000000");
    expect(loc.searchParams.get("utm_source")).toBe("naver");
  });
});
