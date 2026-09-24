// /api/salary-table 지연 생성 게이트 (2026-09-25 B1).
// 종전에는 모듈 스코프에서 표 4종을 모두 세액 계산해 edge 콜드 isolate 마다 CPU 10ms 한도(1102)에
// 근접했다. 요청된 type 만 첫 요청 때 생성·메모하는지, 응답 계약(형태·page 검증·헤더)이 그대로인지 검사한다.
import { beforeAll, describe, expect, it, vi } from "vitest";

const calls = vi.hoisted(() => ({ annual: 0, monthly: 0, weekly: 0, hourly: 0 }));

vi.mock("@/lib/generateData", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/lib/generateData")>();
  return {
    ...actual,
    generateAnnualSalaryTableData: () => {
      calls.annual++;
      return actual.generateAnnualSalaryTableData();
    },
    generateMonthlySalaryTableData: () => {
      calls.monthly++;
      return actual.generateMonthlySalaryTableData();
    },
    generateWeeklyPayTableData: () => {
      calls.weekly++;
      return actual.generateWeeklyPayTableData();
    },
    generateHourlyWageTableData: () => {
      calls.hourly++;
      return actual.generateHourlyWageTableData();
    },
  };
});

type Body = { data: Array<{ preTax: number; monthlyNet: number }>; totalPages: number };
let GET: (request: Request) => Promise<Response>;
const get = (q: string) => GET(new Request(`https://www.moneysalary.com/api/salary-table${q}`));

beforeAll(async () => {
  ({ GET } = await import("@/app/api/salary-table/route"));
});

describe("/api/salary-table — 요청 type 만 지연 생성", () => {
  it("모듈 로드만으로는 어떤 표도 생성하지 않는다", () => {
    expect(calls).toEqual({ annual: 0, monthly: 0, weekly: 0, hourly: 0 });
  });

  it("weekly 요청은 주급표만 1회 생성하고, 재요청은 메모를 쓴다", async () => {
    expect((await get("?type=weekly")).status).toBe(200);
    await get("?type=weekly&page=1");
    expect(calls).toEqual({ annual: 0, monthly: 0, weekly: 1, hourly: 0 });
  });

  it("알 수 없는 type·프로토타입 키는 연봉표로 대체 (500 없음)", async () => {
    for (const t of ["bogus", "__proto__", "constructor", "toString"]) {
      const res = await get(`?type=${t}`);
      expect(res.status, t).toBe(200);
      const body = (await res.json()) as Body;
      expect(body.data[0].preTax, t).toBe(0);
    }
    expect(calls.annual).toBe(1);
    expect(calls.monthly).toBe(0);
  });
});

describe("/api/salary-table — 응답 계약 유지", () => {
  it("형태 {data,totalPages}·페이지당 100행·엣지 캐시 헤더", async () => {
    const res = await get("?type=annual");
    expect(res.headers.get("cache-control")).toBe("public, s-maxage=86400");
    const body = (await res.json()) as Body;
    expect(Object.keys(body).sort()).toEqual(["data", "totalPages"]);
    expect(body.data).toHaveLength(100);
    expect(body.totalPages).toBe(25); // 2,401행 / 100
  });

  it("page 는 1 이상의 정수만 — 음수·문자는 1페이지, 소수는 내림", async () => {
    const first = JSON.stringify(await (await get("?type=annual")).json());
    for (const p of ["-1", "abc", "0"]) {
      expect(JSON.stringify(await (await get(`?type=annual&page=${p}`)).json()), p).toBe(first);
    }
    const p2 = JSON.stringify(await (await get("?type=annual&page=2")).json());
    expect(JSON.stringify(await (await get("?type=annual&page=2.9")).json())).toBe(p2);
  });

  it("monthlyNet 은 0 미만으로 내려가지 않는다 (API 표면 클램프)", async () => {
    for (const t of ["annual", "monthly", "weekly", "hourly"]) {
      const body = (await (await get(`?type=${t}`)).json()) as Body;
      for (const row of body.data) expect(row.monthlyNet, `${t} ${row.preTax}`).toBeGreaterThanOrEqual(0);
    }
  });
});
