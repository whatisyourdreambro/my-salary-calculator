// 삼성디스플레이·삼성SDI 성과급 계산기 — 접힌 FAQ 용어·입력 이름·입력 칸 폭·버튼 표기 (2026-11-18 R4 N2-calc-12 calc-04-F03·F08·F19·F21·F22)
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const read = (p: string) => readFileSync(resolve(process.cwd(), p), "utf8");
const display = { page: read("src/app/calc/samsung-display-bonus/page.tsx"), client: read("src/app/calc/samsung-display-bonus/Client.tsx") };
const sdi = { page: read("src/app/calc/samsung-sdi-bonus/page.tsx"), client: read("src/app/calc/samsung-sdi-bonus/Client.tsx") };

describe("국민연금 상한 용어 — 기준소득월액 (calc-04-F21, 접힌 FAQ)", () => {
  for (const [name, f] of Object.entries({ display, sdi })) {
    it(name, () => {
      expect(f.page).toContain("국민연금은 기준소득월액 상한(2026.7~2027.6 연 7,908만원) 적용.");
      expect(f.page).not.toContain("보수월액 상한");
    });
  }
});

describe("입력 이름 (calc-04-F22, 속성만)", () => {
  for (const [name, f] of Object.entries({ display, sdi })) {
    it(name, () => {
      expect(f.client).toContain('<input aria-label="추가 세액공제 가정 (%)" type="range"');
      expect(f.client).toContain('aria-label="OPI 직접 입력 (연봉 대비 %)"');
    });
  }
});

describe("입력 칸이 카드 밖으로 넘치지 않는다 — min-w-0 (calc-04-F03, 높이 불변)", () => {
  it("삼성디스플레이 TAI 입력 2칸(기본 화면)·OPI 직접 입력, 삼성SDI OPI 직접 입력", () => {
    expect(display.client).toContain('className="min-w-0 flex-1 p-2 rounded border border-canvas-deep tabular-nums text-lg font-bold focus:outline-none focus:border-primary"');
    expect(display.client).toContain('className="min-w-0 flex-1 p-2 rounded border border-canvas-deep tabular-nums text-lg font-bold"');
    expect(sdi.client).toContain('className="min-w-0 flex-1 p-2 rounded border border-canvas-deep tabular-nums text-lg font-bold"');
    for (const src of [display.client, sdi.client]) expect(src).not.toMatch(/className="flex-1 p-2 rounded/);
  });
});

describe("삼성디스플레이 상반기 TAI 입력 칸 안내 — 2026 상반기 확정치 (calc-04-F08, 더 짧은 글)", () => {
  it("2025 전망 대신 2026 상반기 대형 75%·중소형 100%, 기본값 50% 는 그대로", () => {
    expect(display.client).toContain('note="2026 상반기: 대형 75%·중소형 100% 확정 (뉴스핌·헤럴드경제 2026-07-06)"');
    expect(display.client).not.toContain("2025 상반기 확정치 보도 미확보");
    expect(display.client).toContain("const [taiH1Percent, setTaiH1Percent] = useState(50);");
  });
});

describe("삼성SDI 빠른 연봉 버튼 표기 (calc-04-F19, naverBonusLabels 와 같은 방식)", () => {
  const label = (m: number) => `${(m / 10000).toFixed(2).replace(/\.?0+$/, "")}억`;
  it("5,500만원 버튼은 0.55억(종전 toFixed(1) 로 '0.6억')", () => {
    expect([5500, 7000, 9000, 12000, 15000].map(label)).toEqual(["0.55억", "0.7억", "0.9억", "1.2억", "1.5억"]);
    expect(sdi.client).toContain('{(m / 10000).toFixed(2).replace(/\\.?0+$/, "")}억');
    expect(sdi.client).toContain("{[5500, 7000, 9000, 12000, 15000].map((m) => (");
  });
});

describe("삼성SDI TAI = 상반기 75%(보도) + 하반기 100%(가정) (N2-calc-23, 운영자 승인 2026-11-17)", () => {
  it("기본 결과(캐즘 0%·연봉 8,000만원): OPI 0 + TAI 700만원(종전 800만원)", async () => {
    const { DEFAULT_SALARY_MANWON, BASIC_RATIO, TAI_H1, TAI_H2, SCENARIOS } = await import("@/app/calc/samsung-sdi-bonus/data");
    const salaryWon = DEFAULT_SALARY_MANWON * 10_000;
    const opi = salaryWon * (SCENARIOS[0].percent / 100);
    const tai = (salaryWon / BASIC_RATIO) * (TAI_H1 + TAI_H2);
    expect(SCENARIOS[0].id).toBe("chasm");
    expect(opi + tai).toBe(7_000_000);
  });
  it("체크 상자·결과 카드·안내 금액은 같은 상수를 쓴다", () => {
    const src = sdi.client;
    expect(src).toContain("const taiWon = includeTai ? monthlyBasicWon * (TAI_H1 + TAI_H2) : 0;");
    expect(src).toContain('<p className="font-bold">TAI 포함 (월 기본급 75%+100%)</p>');
    expect(src).toContain("포함 시 {fmtManwon(calc.monthlyBasicWon * (TAI_H1 + TAI_H2))} 추가.");
    expect(src).toContain('sub={includeTai ? "월 기본 × (75+100)%" : "포함 안 함"}');
    expect(src).not.toContain("100% × 연 2회");
    expect(src).not.toContain("monthlyBasicWon * 2)");
  });
  it("메타 설명·접힌 FAQ 예시도 75% + 100% 가정", () => {
    expect(sdi.page).toContain("TAI(월 기본급 상반기 75% + 하반기 100% 가정) 합산.");
    expect(sdi.page).toContain("TAI는 2026년 상반기 보도값 75%와 하반기 가정 100%를 더해 875만원입니다");
    expect(sdi.page).not.toContain("TAI 100% × 2회 = 1,000만원");
  });
});
