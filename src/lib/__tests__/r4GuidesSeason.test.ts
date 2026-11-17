// R4 GUIDES 단위(2026-11-18) — 광고 아래 보강·검색 설명(N2-guides-content-02), RL-18 가이드 몫, N2-lib-12 자진 수정신고 표 핀.
// 커밋을 되돌리면 같은 해시를 적은 describe 블록도 함께 지운다. 공식·공개 출처는 각 커밋 메시지(2026-11-18 확인).
// 사이트맵 전용 행·SUPPLEMENT_PINS 는 통합 단계 원장 몫이라 여기서 날짜를 고정하지 않는다(guideSitemapDates.test.ts 가 맡는다).
import { describe, expect, it } from "vitest";
import { koGuides } from "@/lib/guidesContent";
import { guideSupplements } from "@/lib/guides/supplements";
import { guideSupplementsSamsungDs202610 } from "@/lib/guides/supplements-samsung-ds-2026-10";
import { Q1_Q3_2026_PROFIT_TRIL } from "@/app/calc/sk-hynix-bonus/psData";
import { getGuideContentDate } from "@/lib/guideContentRevisions";

const guide = (slug: string) => {
  const g = koGuides.find((x) => x.slug === slug);
  if (!g) throw new Error(`가이드 없음: ${slug}`);
  return g;
};

describe("RL-18 (2579f9c55) 성과급 가이드 — 우리사주조합 출연 400만원은 공제(조특법 제88조의4)", () => {
  it("비과세라고 적지 않고, 같은 글자 배열 문구다", () => {
    const c = guide("performance-pay-complete-2026").content;
    expect(c).toContain("<li><strong>우리사주조합 출연</strong> — 연 400만원 한도 내 출연금 공제액(요건 충족 시).</li>");
    expect(c).not.toContain("출연금 비과세");
  });
});

describe("N2-lib-12 (4b4c729fd) 자진 수정신고 감면 표 — 국세기본법 제48조 제2항 제1호 마·바목", () => {
  const g = guide("tax-amnesty-self-report-2026");
  it("1년 6개월 이내 20%, 2년 이내 10% — 2년 이내 20% 없음", () => {
    expect(g.content).toContain("<li>· <strong>1년 6개월 이내</strong>: 20% 감면</li>");
    expect(g.content).toContain("<li>· <strong>2년 이내</strong>: 10% 감면</li>");
    expect(g.content).not.toContain("<strong>2년 이내</strong>: 20% 감면");
  });
  it("본문 1,000자 이하 — 히어로 '1분 분량'(광고 위 날짜 줄) 그대로, 수정 칩 2026.10.03 그대로", () => {
    expect(g.content.length).toBeLessThanOrEqual(1000);
    expect(Math.ceil(g.content.length / 1000)).toBe(1);
    expect(getGuideContentDate(g)).toBe("2026-10-03");
  });
});

describe("N2-lib-12 (f234b8e2a) 자진 수정신고 화면 설명 — 1.5년 20%·2년 10%", () => {
  it("설명이 표와 같은 단계를 말한다", () => {
    const d = guide("tax-amnesty-self-report-2026").description;
    expect(d).toContain("1년 30%·1.5년 20%·2년 10% 감면");
    expect(d).not.toContain("2년 20%");
    expect(d.length).toBeLessThanOrEqual(80);
  });
});

describe("b12-F02 (2d8db4469) 삼성 성과급 가이드 3편 광고 아래 보강 — 10월 29일 기준", () => {
  const SLUGS = ["samsung-special-bonus-q3-preview-2027", "samsung-bonus-treasury-stock-15-trillion-2026", "samsung-vs-sk-hynix-stock-bonus-2026"];
  it("세 편 모두 10월 29일 기준 제목, 현금배당 약 30조원 결정, 남은 주주환원 55조~75조원, 2027년 1월 말 이사회", () => {
    for (const slug of SLUGS) {
      const html = guideSupplementsSamsungDs202610[slug];
      expect(html, slug).toContain("<h2>2026년 10월 29일 기준");
      expect(html, slug).toContain("10월 29일 3분기 현금배당 약 30조원을 결정");
      expect(html, slug).toContain("55조~75조원");
      expect(html, slug).toContain("2027년 1월 말 이사회에서 정합니다(한국경제 10월 29일)");
      expect(html, slug).toContain("9월 3일 기준");
      // 보도는 '결정·공시'로 썼다 — 이사회 의결이라고 적지 않는다
      expect(html, slug).not.toContain("의결");
      expect(guideSupplements[slug], slug).toContain(html);
    }
  });
  it("q3-preview 실적 항목은 확정치(전사 107조 4,405억원·DS 106조 5,000억원)", () => {
    const html = guideSupplementsSamsungDs202610["samsung-special-bonus-q3-preview-2027"];
    expect(html).toContain("3분기 영업이익은 107조 4,405억원, 그중 DS부문은 106조 5,000억원입니다(10월 29일 발표)");
    expect(html).not.toContain("잠정 영업이익은 107조 4,000억원");
  });
});

describe("b01-F03 (ac3ef6c0a) SK하이닉스 PS 2027 전망 보강 — 3분기 실적", () => {
  const html = guideSupplements["sk-hynix-ps-forecast-2027"];
  it("10/28 3분기 실적과 정본 상수의 1~3분기 누적, 재원 약 18.1조원", () => {
    expect(html).toContain("<h2>2026년 3분기 실적 반영</h2>");
    expect(html).toContain("매출 104조 6,155억원, 영업이익 83조 3,338억원");
    expect(html).toContain(`1~3분기 누적 영업이익은 ${Q1_Q3_2026_PROFIT_TRIL}조원`);
    expect(html).toContain("약 18.1조원");
    expect(html).not.toMatch(/자주 묻는 질문/);
    // 37조6,103억 + 60조5,426억 + 83조3,338억 = 181조4,867억 → 정본 181.5, 10% = 18조1,487억 → 18.1조
    const exactEok = 376_103 + 605_426 + 833_338;
    expect(Math.round(exactEok / 1000) / 10).toBe(Q1_Q3_2026_PROFIT_TRIL);
    expect(Math.floor(exactEok / 10 / 1000) / 10).toBe(18.1);
  });
  it("삼성 쌍둥이 글 보강에는 SK 3분기 절이 붙지 않는다", () => {
    expect(guideSupplements["samsung-opi-forecast-2027"]).not.toContain("83조 3,338억원");
  });
});

describe("b13-F02 (fe489ba4b) SK하이닉스 임금협상 보강 — 2025년 6.0% 인상 타결", () => {
  it("본문 '약 5.5%'를 바로잡는 항목", () => {
    const html = guideSupplements["sk-hynix-wage-2026"];
    expect(html).toContain("2025년 9월 임금 6.0% 인상으로 타결됐습니다(파이낸셜뉴스 2025-09-01 보도 기준)");
  });
});

describe("b04-M01 (1607a2b56) 실업급여 보강 — 180일은 피보험 단위기간", () => {
  it("보수 지급의 기초가 된 날, FAQ 목록 밖 문단", () => {
    const html = guideSupplements["unemployment-benefits-complete"];
    expect(html).toContain("수급 요건의 180일은 가입 일수가 아니라 보수 지급의 기초가 된 날(유급휴일 포함)");
    expect(html).toContain("(고용보험법 제40조·제41조).</p>");
    expect(html.indexOf("보수 지급의 기초가 된 날")).toBeGreaterThan(html.indexOf("</ul>"));
  });
});

describe("b04-M03 (0b6804d8e) 금융소득 종합과세 가이드 — 검색 설명만", () => {
  it("검색 설명은 '한계세율 35%+' 주장 없이 제14조·제62조 (화면 TL;DR 은 R7 N2-guides-content-04 몫)", () => {
    const g = guide("comprehensive-financial-income-2000-2026");
    const meta = (g as { metaDescription?: string }).metaDescription ?? "";
    expect(meta).toContain("초과분만 근로소득 등과 합산해 6~45% 누진세율로 과세합니다(소득세법 제14조·제62조)");
    expect(meta).not.toContain("35%");
    expect(meta.length).toBeGreaterThanOrEqual(80);
    expect(meta.length).toBeLessThanOrEqual(120);
  });
});
