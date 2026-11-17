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
});
