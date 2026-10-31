// /calc/january-bonus 본문 사실 정정 회귀 가드 (2026-11-01 PKG-20 — NEW-v05-calc-engines-3, YE-04 b)
//
// 6aeadf49b(2라운드 WP-03, SE-03 잔여)의 고정 테스트를 현재 main 문구에 맞춰 옮겼다.
// 1) 광고(GuideMidAd) 위 '기부금 공제' 목록 문장 — 10만원까지 100%를 모든 기부금에 적용하던 오류를
//    정치·고향사랑 10만원까지 전액 / 종교·비영리단체 15~30% 로 정정. 원문보다 짧은 NEW-v05-calc-engines-3 문장이
//    6aeadf49b 문장보다 우선한다(광고 위 줄 수가 늘지 않게).
//    근거: 조세특례제한법 제76조(정치자금 10만원 이하 100/110)·제58조(고향사랑 10만원 이하 100/110),
//    소득세법 제59조의4 제4항(기부금 15%, 1천만원 초과분 30%).
// 2) 접힌 FAQ — (3) 기부 항목도 같은 범위(고향사랑·정치자금만 10만원까지 전액), 의료비 한도 600만원 -> 700만원
//    (taxConstants2026 MEDICAL_CREDIT_2026.DEPENDENT_CAP 연 700만원과 같은 값).
// 3) 광고 사이 H2 연말정산 일정표 연도 2026년 -> 2027년(2026년 귀속 정산이 2027년 1~3월에 열린다).
// 4) 면책 문단 링크 목적지 /year-end-tax-2026 -> /year-end-tax-2027(2026년 귀속 연말정산 허브). 라벨 '2026 가이드'는 유지.
// 6aeadf49b 의 엔진 산식 테스트(januaryBonus2026.ts)는 그 모듈이 main 에 없어 옮기지 않았다.
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { MEDICAL_CREDIT_2026 } from "@/lib/taxConstants2026";

const src = readFileSync(resolve(process.cwd(), "src/app/calc/january-bonus/page.tsx"), "utf8");
/** JSX 텍스트처럼 줄바꿈+들여쓰기를 공백 하나로 접는다 */
const flat = src.replace(/\s*\r?\n\s*/g, " ");

describe("january-bonus 본문 사실 정정 (NEW-v05-calc-engines-3, YE-04 b)", () => {
  it("기부금 공제 목록 — 정치·고향사랑 10만원까지 전액, 종교·비영리단체 15~30%", () => {
    expect(flat).toContain("정치·고향사랑 기부는 10만원까지 전액, 종교·비영리단체 기부는 15~30% 세액공제.");
    expect(flat).not.toContain("기부금 10만원까지 100% 세액공제");
    expect(flat).not.toContain("종교단체·정당· 인증 비영리단체 모두 가능");
  });

  it("접힌 FAQ — (3) 기부는 고향사랑·정치자금만 10만원까지 전액, 의료비 한도는 700만원", () => {
    expect(src).toContain("(3) 고향사랑·정치자금 기부(10만원까지 전액 세액공제)");
    expect(src).not.toContain("(3) 기부금(10만원까지 100% 세액공제)");
    expect(MEDICAL_CREDIT_2026.DEPENDENT_CAP).toBe(7_000_000);
    expect(src).toContain("공제 임계값(3%, 700만원 한도 등)");
    expect(src).not.toContain("600만원 한도");
  });

  it("일정표 제목은 2027년(2026년 귀속 정산)", () => {
    expect(flat).toContain("연말정산 일정표 (2027년)");
    expect(flat).not.toContain("연말정산 일정표 (2026년)");
  });

  it("면책 문단 링크는 2026년 귀속 허브 /year-end-tax-2027 로", () => {
    expect(src).toContain('<Link href="/year-end-tax-2027" className="text-electric font-bold underline">2026 가이드</Link>');
    expect(src).not.toContain('href="/year-end-tax-2026"');
  });
});
