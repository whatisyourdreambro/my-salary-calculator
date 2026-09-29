// 기타 페이지 사실·정합성 정정 고정 (SEO 신선도 정비 2026-09-29, MI 계열)
//
//  - MI-21 /en/help 방법 검토일 = 실제 방법 정정일(a465c0a, 2026-09-25)
//  - MI-22 /qna 상세 BreadcrumbList 잎 이름 = 화면 빵부스러기(질문 전체, 30자 절단 금지)
//  - MI-23 /tools·/tools/life 근무일수 계산기 설명 = 공휴일 제외 기능 반영(같은 2음절 교체)
import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const read = (p: string) => readFileSync(p, "utf8");

describe("MI-21·MI-22·MI-23", () => {
  it("/en/help 방법 검토일은 25 September 2026", () => {
    const src = read("src/app/en/help/page.tsx");
    expect(src).toContain("Method review: 25 September 2026.");
    expect(src).not.toContain("Method review: 9 September");
  });

  it("/qna 상세 BreadcrumbList 잎 이름은 질문 전체", () => {
    const src = read("src/app/qna/[slug]/page.tsx");
    expect(src).toContain("autoBreadcrumbLd(`/qna/${slug}`, { leafName: item.question })");
    expect(src).not.toContain("item.question.slice(0, 30)");
  });

  it("MI-07 /tips 공식 수치: 디딤돌 최저 2.85%·부업 사업소득은 소액도 신고 대상(글자 구성 동일 교체)", () => {
    const src = read("src/app/tips/page.tsx");
    expect(src).toContain("디딤돌 대출(최저 2.85% 금리)");
    // 광고 위 카드라 같은 폭으로만 고친다: '이상→이하'·'부업 수익은→사업 소득도' 는 한글 음절·공백 위치가 같다
    expect(src).toContain('desc: "연간 500만원 이하 사업 소득도 종합소득세 신고 대상입니다.');
    for (const old of ["2.35% 금리", "연간 500만원 이상 부업"]) expect(src).not.toContain(old);
    // 신생아 특례 카드(4억·1.8%·신청 2년 내 출산)는 숫자 폭이 원문과 달라 카드 폭 406px·766px 부근에서
    // 줄 수가 바뀐다(Chrome 하네스 실측) — 광고 위라 이번에는 고치지 않고 보류한다(리뷰 반영 2026-09-29).
  });

  it("근무일수 계산기 설명은 휴일 제외", () => {
    for (const p of ["src/app/tools/page.tsx", "src/app/tools/life/page.tsx"]) {
      const src = read(p);
      expect(src, p).toContain('desc: "휴일 제외 영업일 계산"');
      expect(src, p).not.toContain("주말 제외 영업일 계산");
    }
  });
});
