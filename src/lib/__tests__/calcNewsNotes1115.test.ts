// 계산기 '마지막 광고 아래' 보도 요약 상자 — 2026-11-15 SEASONA 로 더한 경로 고정 (감사 calc ideas[4])
// - 공개 출처만: 문장 안에 매체·날짜('… 보도에 따르면')를 적고 URL 은 CalcNewsNote.tsx 주석에 둔다(운영자 규칙 2026-10-08).
// - 시즌 문장은 날짜를 박는다('2026년 11월 15일 기준'). 결과 예측·약속 문장 금지.
// - 상자는 calc/layout 맨 끝(모든 광고 아래)에만 렌더된다 — 위치는 samsungDsNews1009.test.ts 가 이미 고정한다.
import { describe, expect, it } from "vitest";
import { CALC_NEWS_NOTES, calcNewsNoteFor } from "@/components/CalcNewsNote";
import { companyRepository } from "@/lib/salary-data/CompanyRepository";

const INTERNAL = /회의록|사내 ?공지|노조 ?공지|합의서 원문|블라인드/;
const PROMISE = /반영할 예정|반영합니다|즉시 반영|될 것입니다|전망됩니다|예상됩니다/;
const text = (route: string) => {
  const item = CALC_NEWS_NOTES[route];
  return [item.title, ...item.points, item.label, item.source].join(" ");
};

describe("S-OIL 보도 요약 (SBS Biz 2026-11-02)", () => {
  const route = "/calc/s-oil-bonus";
  it("3분기 실적은 매체·날짜를 붙인 보도 문장이고 숫자는 보도값 그대로", () => {
    const item = calcNewsNoteFor(`${route}/`)!;
    expect(item).not.toBeNull();
    expect(item.points[0]).toMatch(/^SBS Biz 2026년 11월 2일 보도에 따르면/);
    expect(item.points[0]).toContain("영업이익은 1조 4,067억원(잠정)");
    expect(item.points[0]).toContain("513.7% 늘었습니다");
    expect(item.points[0]).toContain("11조 9,687억원(42.2% 증가)");
    expect(item.title).toContain("2026년 11월 2일 언론 보도 기준");
  });

  it("2026년 실적분 지급률은 날짜를 박아 '보도 없음'으로만 쓰고, 시나리오가 전망치가 아님을 밝힌다", () => {
    expect(text(route)).toContain("2026년 11월 15일 기준 지급률 보도는 없습니다");
    expect(text(route)).toContain("2026년 실적분 전망치가 아닙니다");
    expect(text(route)).not.toMatch(PROMISE);
  });
});

describe("삼성바이오로직스 보도 요약 (서울경제TV·아시아경제 2026-11-13)", () => {
  const route = "/calc/samsung-biologics-bonus";
  it("교섭·부분파업 일정과 쟁점은 매체·날짜를 붙인 보도 문장", () => {
    const item = calcNewsNoteFor(route)!;
    expect(item.points[0]).toMatch(/^서울경제TV·아시아경제 2026년 11월 13일 보도에 따르면/);
    expect(item.points[0]).toContain("11월 6일부터 부분파업");
    expect(item.points[0]).toContain("11월 17일 교섭을 다시 열기로");
    expect(item.points[1]).toMatch(/^같은 보도 기준 쟁점:/);
    for (const s of ["기본급 9.5% 인상", "연간 세전 영업이익의 15%", "평균 6.2% 인상", "1인당 격려금 600만원"]) {
      expect(item.points[1]).toContain(s);
    }
  });

  it("교섭 결과는 날짜를 박아 '보도 없음'으로만 쓰고 예측하지 않는다", () => {
    expect(text(route)).toContain("2026년 11월 15일 기준 교섭 결과는 보도되지 않았습니다");
    expect(text(route)).not.toMatch(PROMISE);
  });
});

describe("SK하이닉스 보도·발표 요약 (머니투데이·MTN 2026-09-16, 뉴스룸 2026-10-28)", () => {
  const route = "/calc/sk-hynix-bonus";
  it("재원·가결·지급 방식은 매체·날짜를 붙인 보도 문장, 3분기 실적은 회사 뉴스룸 발표", () => {
    const item = calcNewsNoteFor(route)!;
    expect(item.points[0]).toMatch(/^머니투데이 2026년 9월 16일 보도에 따르면/);
    for (const s of ["영업이익의 10%", "상한이 없으며", "찬성 57.08%"]) expect(item.points[0]).toContain(s);
    expect(item.points[1]).toMatch(/^MTN 2026년 9월 16일 보도에 따르면/);
    for (const s of ["2027년 초 지급되는 PS부터", "현금 50%·주식 50%", "10%p 단위"]) expect(item.points[1]).toContain(s);
    expect(item.points[2]).toMatch(/^SK하이닉스 뉴스룸 2026년 10월 28일 발표에 따르면/);
    expect(item.points[2]).toContain("83조 3,338억원");
    expect(item.points[2]).toContain("영업이익 시나리오는 가정입니다");
    expect(text(route)).not.toMatch(PROMISE);
    expect(text(route)).not.toMatch(INTERNAL);
    expect(item.title).toContain("2026년 11월 15일 기준");
  });

  it("링크는 공개된 SK하이닉스 PS 전망 가이드(사이트맵 경로)", async () => {
    const item = CALC_NEWS_NOTES[route];
    expect(item.href).toBe("/guides/sk-hynix-ps-forecast-2027");
    const { guideCards } = await import("@/lib/guidesMeta.generated");
    expect(guideCards.some((g) => g.slug === "sk-hynix-ps-forecast-2027")).toBe(true);
    const { isReleaseHeldBack } = await import("@/lib/guideReleaseHoldback");
    expect(isReleaseHeldBack("sk-hynix-ps-forecast-2027")).toBe(false);
  });
});

describe("새 항목 공통", () => {
  const added = ["/calc/s-oil-bonus", "/calc/samsung-biologics-bonus"];
  it.each(added)("%s: 공개 출처 표현, 회사 공식 발표가 아님을 밝히고, 링크는 실제 회사 연봉 페이지", (route) => {
    const item = CALC_NEWS_NOTES[route];
    expect(text(route)).not.toMatch(INTERNAL);
    expect(item.source).toMatch(/^출처: .+ 2026년 11월 \d{1,2}일 보도\. 회사 공식 발표 자료가 아닙니다\.$/);
    expect(item.points.join(" ")).toContain("보도에 따르면");
    const id = /^\/salary-db\/([a-z0-9-]+)$/.exec(item.href)?.[1];
    expect(id, item.href).toBeTruthy();
    expect(companyRepository.getById(id!), id).toBeDefined();
  });

  it("맵에 없는 계산기 경로는 여전히 null — 다른 /calc 페이지의 DOM 은 그대로", () => {
    expect(calcNewsNoteFor("/calc/kia-bonus")).toBeNull();
    expect(calcNewsNoteFor("/calc")).toBeNull();
    expect(calcNewsNoteFor(null)).toBeNull();
  });
});
