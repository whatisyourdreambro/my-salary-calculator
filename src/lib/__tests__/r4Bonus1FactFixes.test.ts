// R4 BONUS1 (2026-11-18) — 성과급 사실 정정 1부 고정 테스트.
// 10월 재착지 묶음 RL-16(CB-03~CB-07)과 감사 묶음 N2-calc-10·11·12·23 의 사실 문구를 고정한다.
// 10월 원본 테스트(bonusFactFixes20260929)는 저장소에 없어서 이 단위 전용 파일로 새로 만들었다(공유 테스트 파일 무접촉).
// 모든 숫자·날짜는 2026-11-18 보도 원문으로 다시 확인했다(커밋 본문에 출처).
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const read = (p: string) => readFileSync(resolve(process.cwd(), p), "utf8");
/** page.tsx 의 FAQ_ITEMS 블록(접힌 details·FAQPage JSON-LD 로만 나가는 글) */
const faqBlock = (p: string) => {
  const src = read(p);
  const start = src.indexOf("const FAQ_ITEMS");
  const end = src.indexOf("export const metadata");
  expect(start, p).toBeGreaterThanOrEqual(0);
  expect(end, p).toBeGreaterThan(start);
  return src.slice(start, end);
};

describe("CB-03 삼성SDI — 2026년 1월 OPI 전 사업부 0%, 상반기 TAI 75%, OPI 재원 변경 (접힌 FAQ)", () => {
  const faq = faqBlock("src/app/calc/samsung-sdi-bonus/page.tsx");

  it("2026년 1월(2025년 실적분)은 전 사업부 0%, 전자재료 한 자릿수는 2025년 초(2024년 실적분)", () => {
    expect(faq).toContain("2026년 1월(2025년 실적분)에는 전기차 캐즘에 따른 영업손실로 전 사업부 0%였습니다(뉴스핌·CEO스코어데일리 2026-01-28 보도)");
    expect(faq).toContain("2025년 초(2024년 실적분)에는 전자재료만 한 자릿수(보도상 3~5%)였고");
    expect(faq).not.toContain("배터리·본사 OPI 0%, 전자재료만 3~5%");
    expect(faq).not.toContain("복구 전망");
    expect(faq).not.toContain("다만 SDI는 전자재료 사업부가 일부 OPI 받음");
  });

  it("2026년 상반기 TAI 전 사업부 75%(7월 8일 지급 예정 보도), OPI 재원 EVA 20% → 영업이익 10%", () => {
    expect(faq).toContain("2026년 상반기 TAI는 전 사업부 공통 월 기본급의 75%로 책정돼 7월 8일 지급 예정으로 보도됐습니다(뉴스핌 2026-07-06)");
    expect(faq).toContain("OPI 재원은 2027년 초 지급분부터 EVA의 20%에서 영업이익의 10%로 바뀝니다(이투데이 2026-09-10 보도, 참여 직원의 93.4%가 선택)");
    expect(faq).not.toContain("TAI는 6·12월에 연 2회 지급됩니다");
  });

  it("LG엔솔 비교 FAQ 는 실적 연도를 밝힌다", () => {
    expect(faq).toContain("캐즘기 LG엔솔은 2024년 실적분 50%·2025년 실적분 75%였고, 삼성SDI는 2025년 실적분 OPI가 전 사업부 0%였습니다.");
  });
});

describe("CB-03 삼성SDI — 광고 위 같은 폭 교체 (배지)", () => {
  const page = read("src/app/calc/samsung-sdi-bonus/page.tsx");
  it("배지: 2026 캐즘 0%(전자재료 포함 0%) — 10월 1,123폭 스윕 통과 문구", () => {
    expect(page).toContain("2024 배터리 32% / 2026 캐즘 0% (전자재료 포함 0%)");
    expect(page).not.toContain("(전자재료만 3-5%)");
  });
  it("지급 이력 표: 배터리 0%·전자재료 3~5%·본사 0% 행은 2025년 초(2024 실적분) 지급분", () => {
    expect(page).toContain("2025년 (2024 실적 · 캐즘)");
    expect(page).not.toContain("2026년 (2025 실적 · 캐즘)");
  });
});

describe("CB-04 삼성디스플레이 — TAI FAQ(접힌 details)에 2026 상반기 확정치", () => {
  const faq = faqBlock("src/app/calc/samsung-display-bonus/page.tsx");
  it("2026 상반기 대형 75%·중소형 100%, 직전 2025 하반기 50%", () => {
    expect(faq).toContain("2026년 상반기 TAI는 대형사업부 월 기본급의 75%, 중·소형사업부 100%로 확정돼 7월 8일 지급 예정으로 보도됐습니다(뉴스핌·헤럴드경제 2026-07-06).");
    expect(faq).toContain("직전 2025년 하반기 TAI는 대형·중소형 모두 50%였습니다(더팩트 2025-12-22).");
    expect(faq).not.toContain("2025년 상반기 확정치는 보도로 확인되지 않았으며");
  });
});

describe("CB-05 LG에너지솔루션 — 75%는 2026-02-06 이미 지급, '1분기 결산 후 결정' 삭제 (접힌 FAQ)", () => {
  const faq = faqBlock("src/app/calc/lg-energy-bonus/page.tsx");
  it("2025년 실적분 최대 75% 2026-02-06 지급(전년 50%), 2026년 실적분은 2027년 초 결정", () => {
    expect(faq).toContain("2026년 2월 6일에는 2025년 실적분으로 기본급의 최대 75%가 지급됐습니다(뉴스웨이 2026-02-04 보도, 전년 50%).");
    expect(faq).toContain("2026년 실적분은 2027년 초 결정되며");
    expect(faq).not.toContain("정확한 결정은 1분기 결산 후");
    expect(faq).not.toContain("2025년(75%)보다 더 낮거나 비슷할 가능성");
    // 정률 단정 금지(10월 605fdc4ae 리뷰): '기본급의 75%' 단정 대신 '최대 75%'
    expect(faq).not.toMatch(/기본급의 75%/);
  });
});

describe("CB-05 리포트 행(bonusData) — LG에너지솔루션 50%·75%는 지급 연도 2025·2026", () => {
  it("2024년 실적분 50%는 2025년 행, 2025년 실적분 75%는 2026년 행(note 는 실적분)", async () => {
    const { BONUS_PROFILES } = await import("@/data/bonusData");
    const lges = BONUS_PROFILES.find((p) => p.calcSlug === "lg-energy-bonus")!;
    expect(lges.payouts.map((p) => [p.year, p.percentOfBase, p.note])).toEqual([
      [2025, 50, "2024년 실적분 — 적자기"],
      [2026, 75, "2025년 실적분"],
    ]);
  });
});

describe("CB-03 리포트 행(bonusData) — 삼성SDI 전자재료 5%는 2025년 지급(2024년 실적분)", () => {
  it("year 는 지급 연도: 전자재료 5% 행은 2025, 2026년 행에는 전자재료 지급이 없다", async () => {
    const { BONUS_PROFILES } = await import("@/data/bonusData");
    const sdi = BONUS_PROFILES.find((p) => p.calcSlug === "samsung-sdi-bonus")!;
    const em5 = sdi.payouts.find((p) => p.division === "전자재료" && p.percentOfSalary === 5)!;
    expect(em5.year).toBe(2025);
    expect(em5.note).toBe("2024년 실적분 — 폴더블 OLED 수혜 사업부 (보도상 3~5% 중 상단값)");
    expect(sdi.payouts.filter((p) => p.year === 2026 && p.division === "전자재료")).toEqual([]);
  });
});
