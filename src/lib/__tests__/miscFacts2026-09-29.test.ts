// 기타 페이지 사실·정합성 정정 고정 (SEO 신선도 정비 2026-09-29, MI 계열)
//
//  - MI-21 /en/help 방법 검토일은 11/2 문자열 푸시까지 원문(9 September) 유지 — 25 September 는 한 줄이 넘쳐 광고 2개가 내려간다
//  - MI-22 /qna 상세 BreadcrumbList 잎 이름 = 화면 빵부스러기(질문 전체, 30자 절단 금지)
//  - MI-23 /tools·/tools/life 근무일수 계산기 설명 = 공휴일 제외 기능 반영(같은 2음절 교체)
import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const read = (p: string) => readFileSync(p, "utf8");

describe("MI-21·MI-22·MI-23", () => {
  it("MI-21 /en/help 방법 검토일은 원문 유지 — 25 September 는 644~651px 에서 한 줄이 늘어 EnglishPageExtras 광고 2개가 20px 내려감(11/2 문자열 푸시 몫)", () => {
    const src = read("src/app/en/help/page.tsx");
    expect(src).toContain("Method review: 9 September 2026. Check the applicable tax year in the official source before filing.");
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
    // 신생아 특례 카드: 9/29 후보 문구는 카드 폭 406px·766px 부근에서 줄 수가 바뀌어(Chrome 하네스 실측) 보류했다.
    // 2026-11-15 N2-app-pages-10(app-pages-b07-F01): 옛 문구보다 글자 수·폭이 작은 새 문구로 정정 — 마이홈 공식 안내
    // (대출접수일 기준 2년 내 출산·입양, 연 1.8~4.5%, 최대 4억원 — 2025-06-27 이전 계약 5억, 부부합산 1.3억·맞벌이 2억).
    // GuideMidAd 바로 위라 통합 단계 1px 스윕(수화 전·후, 320~1440·1536·1920)에서 광고가 한 폭이라도 내려가면
    // 이 정정과 modifiedTime 을 함께 되돌리고 운영자 질문 1 목록으로 넘긴다.
  });

  it("N2-app-pages-10 /tips 신생아 특례대출 카드 — 접수일 기준 2년 내 출산·연 1.8~4.5%·최대 4억", () => {
    const src = read("src/app/tips/page.tsx");
    expect(src).toContain('desc: "접수일 기준 2년 내 출산 가구는 연 1.8~4.5% 특례금리로 최대 4억원까지 대출 가능합니다. 소득은 부부합산 1.3억(맞벌이 2억) 이하입니다."');
    for (const old of ["2023년 이후 출생아", "최저 1.6% 특례금리", "최대 5억원까지 대출"]) expect(src).not.toContain(old);
    // 광고 위 카드: 새 문구가 옛 문구보다 길면 안 된다(글자 수 기준 하한 가드 — 실측은 스윕)
    const before = "2023년 이후 출생아를 둔 가구는 최저 1.6% 특례금리(5년)로 최대 5억원까지 대출 가능합니다. 소득 기준 1억 3천만원 이하 확인이 필요합니다.";
    const after = "접수일 기준 2년 내 출산 가구는 연 1.8~4.5% 특례금리로 최대 4억원까지 대출 가능합니다. 소득은 부부합산 1.3억(맞벌이 2억) 이하입니다.";
    expect([...after].length).toBeLessThan([...before].length);
    // OG modifiedTime 은 실제 정정일 — sitemap '/tips' 행·원장 항목은 통합 단계(N2-app-pages-19)가 같은 날로 넣는다
    expect(src).toContain('modifiedTime: "2026-11-15T00:00:00+09:00"');
  });

  it("근무일수 계산기 설명은 휴일 제외", () => {
    for (const p of ["src/app/tools/page.tsx", "src/app/tools/life/page.tsx"]) {
      const src = read(p);
      expect(src, p).toContain('desc: "휴일 제외 영업일 계산"');
      expect(src, p).not.toContain("주말 제외 영업일 계산");
    }
  });
});
