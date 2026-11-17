// 현대모비스 계산기 '마지막 광고 아래' 보도 요약 (R4 MOBIS, N2-calc-19 — 운영자 승인 2026-11-17)
// - 상자는 calc/layout 맨 끝(모든 광고 아래)에만 렌더된다 — 위치는 samsungDsNews1009.test.ts·nextStepsBelowFooterAds.test.ts 가 고정한다.
// - 공개 출처만: 매체·날짜('… 보도에 따르면')와 DART 공시. URL 은 CalcNewsNote.tsx 주석에 둔다(운영자 규칙 2026-10-08).
// - 날짜를 박은 요약이고 결과 예측·약속 문장은 쓰지 않는다.
import { describe, expect, it } from "vitest";
import { CALC_NEWS_NOTES, calcNewsNoteFor } from "@/components/CalcNewsNote";
import { companyRepository } from "@/lib/salary-data/CompanyRepository";

const ROUTE = "/calc/hyundai-mobis-bonus";
const INTERNAL = /회의록|사내 ?공지|노조 ?공지|합의서 원문|블라인드/;
const PROMISE = /반영할 예정|반영합니다|즉시 반영|될 것입니다|전망됩니다|예상됩니다/;

describe("현대모비스 보도·공시 요약 (더팩트 2026-08-26·09-04, DART 2026-10-30)", () => {
  const item = calcNewsNoteFor(`${ROUTE}/`)!;
  const all = () => [item.title, ...item.points, item.label, item.source].join(" ");

  it("경로에 날짜 박힌 항목이 있다", () => {
    expect(item).not.toBeNull();
    expect(CALC_NEWS_NOTES[ROUTE]).toBe(item);
    expect(item.title).toBe("2026 임단협 타결과 주식 지급 — 2026년 11월 18일 기준 공개 자료 요약");
  });

  it("타결 내용은 매체·날짜를 붙인 보도 문장, 수치는 보도값 그대로", () => {
    expect(item.points[0]).toMatch(/^더팩트 2026년 8월 26일 보도에 따르면/);
    for (const s of ["기본급 10만원 인상", "성과급 400%+1,320만원", "주식 8주", "복지포인트 50만원"]) expect(item.points[0]).toContain(s);
    expect(item.points[0]).toContain("더팩트 2026년 9월 4일 보도에 따르면 현대모비스는 곧바로 올해 임단협을 마무리했습니다.");
  });

  it("주식 지급은 DART 공시값(96,136주·11월 30일·종가 353,000원)과 받는 방식", () => {
    expect(item.points[1]).toMatch(/^현대모비스는 2026년 10월 30일 DART에 낸 주요사항보고서\(자기주식 처분 결정\)에서/);
    for (const s of ["2026년 단체교섭에 따른 회사주식 지급", "96,136주", "2026년 11월 30일 직원에게 처분할 예정이라고 공시했습니다", "4년 동안 의무예탁"]) {
      expect(item.points[1]).toContain(s);
    }
    expect(item.points[2]).toContain("353,000원은 2026년 10월 29일 종가 기준");
  });

  it("공개 출처 표현, 노사 합의 원문이 아님을 밝히고 링크는 실제 회사 연봉 페이지", () => {
    expect(all()).not.toMatch(INTERNAL);
    expect(all()).not.toMatch(PROMISE);
    expect(item.source).toBe("출처: 더팩트 2026년 8월 26일·9월 4일 보도, 현대모비스 2026년 10월 30일 DART 공시. 노사 합의 원문이 아닙니다.");
    expect(item.href).toBe("/salary-db/hyundai-mobis");
    expect(companyRepository.getById("hyundai-mobis")).toBeDefined();
  });
});
