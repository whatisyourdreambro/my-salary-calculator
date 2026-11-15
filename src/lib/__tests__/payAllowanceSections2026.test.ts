// 봉급표 3쪽 마지막 광고 아래 수당 표 고정 (RL-12 T14b 재착지 2026-11-15 — 10월 b2cdf929d·9277c4d4e, PT-07·PT-08·PT-13·MISSED-pay-3)
//
//  - 교사: '2026 교원 수당 한눈에' (교직수당 25만원·담임 20만·보직 15만·정근수당 10~50% 등, 정본 상수)
//  - 경찰·소방: 계급별 직급보조비(별표 15 — 순경~치안정감 전 계급)·위험근무(갑종+가산금)·출동 상한 4만원·
//    특수업무수당 월 8만원 이하 신설 — 두 페이지는 순서·문장을 달리한다(유사 문서 회피)
//  - 세 표 모두 본문 칼럼 안, 칼럼 마지막 광고(쿠팡 리더보드) 아래·역링크 뒤·사이드바 앞. 광고 목록 불변
//  - 교사 인용 문구는 '9호봉부터'가 아니라 신규 교사 통상 시작 9호봉·최고 40호봉, 법령 표기는 봉급·담임수당을 나눈다(Codex 664b0041a)
// 원문 대조 2026-11-15: 법제처 현행 공무원수당 등에 관한 규정(대통령령 제36728호, 2026-10-02 시행) 별표 2·5·8·9·11·15,
//   인사혁신처 2025-12-30 보도자료(korea.kr newsId=148957301).
import { createElement, type ReactNode } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

vi.mock("next/navigation", () => ({
  usePathname: () => "/teacher-pay-2026",
  useRouter: () => ({ push: vi.fn() }),
}));
vi.mock("@/components/AppLink", () => ({ default: ({ children, ...props }: { children: ReactNode }) => createElement("a", props, children) }));
vi.mock("@/components/AdPlacement", () => {
  const ad = (name: string) => {
    const MockAd = () => createElement("div", { "data-test-ad": name });
    MockAd.displayName = `MockAd(${name})`; // react/display-name
    return MockAd;
  };
  return {
    HomeTopAd: ad("home-top"),
    CalcResultAd: ad("calc-result"),
    InArticleAd: ad("in-article"),
    GuideMidAd: ad("guide-mid"),
    MultiplexAd: ad("multiplex"),
    SidebarAd: ad("sidebar"),
  };
});
vi.mock("@/components/CoupangBanner", () => ({ default: () => createElement("div", { "data-test-ad": "coupang" }) }));
vi.mock("@/components/ShareButtons", () => ({ default: ({ description }: { description: string }) => createElement("div", { "data-test-share": description }) }));
vi.mock("@/components/RelatedCalculators", () => ({ default: () => null }));
vi.mock("@/components/CitationCopyButton", () => ({ default: ({ quote }: { quote: string }) => createElement("blockquote", null, quote) }));

import TeacherPage from "@/app/teacher-pay-2026/page";
import PolicePage from "@/app/police-pay-2026/page";
import FirePage from "@/app/firefighter-pay-2026/page";
import {
  CIVIL_DISPATCH_DAILY_CAP_2026,
  CIVIL_DISPATCH_PER_CASE_2026,
  CIVIL_POSITION_ALLOWANCE_2026,
  CIVIL_POSITION_ALLOWANCE_POLICE_FIRE_UPPER_2026,
  CIVIL_SPECIAL_DUTY_CROWD_DISASTER_2026,
  CIVIL_TEACHER_ALLOWANCE_2026,
  PAY_PAGE_ALLOWANCE_SOURCE_2026,
} from "@/lib/civilServantAllowances2026";

const html = (Page: () => unknown) => renderToStaticMarkup(createElement(Page as never));
const ads = (h: string) => [...h.matchAll(/data-test-ad="([^"]+)"/g)].map((m) => m[1]);
const EXPECTED_ADS = ["home-top", "calc-result", "in-article", "guide-mid", "coupang", "sidebar", "coupang"];
const section = (h: string, id: string) => {
  const at = h.indexOf(`id="${id}"`);
  return h.slice(at, h.indexOf("</section>", at));
};

/** 섹션이 칼럼 마지막 광고(사이드바 앞 마지막 광고 = 쿠팡 리더보드)와 세후 계산기 역링크 뒤, 사이드바 앞인지 */
function assertBelowLastColumnAd(h: string, sectionId: string, backLink: string) {
  const at = h.indexOf(`id="${sectionId}"`);
  const sidebar = h.indexOf('data-test-ad="sidebar"');
  const columnAds = [...h.slice(0, sidebar).matchAll(/data-test-ad="/g)].map((m) => m.index!);
  expect(at).toBeGreaterThan(Math.max(...columnAds));
  expect(at).toBeGreaterThan(h.lastIndexOf(`href="${backLink}"`, sidebar));
  expect(at).toBeLessThan(sidebar);
  expect(h.slice(at, sidebar)).not.toContain("data-test-ad=");
}

describe("정본 상수 (PT-08) — 별표 11·15, 인사혁신처 2025-12-30", () => {
  it("출동 1일 상한 4만원·건당 4천원, 특수업무수당 월 8만원 이하, 경찰·소방 상위 계급 직급보조비", () => {
    expect(CIVIL_DISPATCH_DAILY_CAP_2026).toBe(40_000);
    expect(CIVIL_DISPATCH_PER_CASE_2026).toBe(4_000);
    expect(CIVIL_SPECIAL_DUTY_CROWD_DISASTER_2026).toBe(80_000);
    expect([...CIVIL_POSITION_ALLOWANCE_POLICE_FIRE_UPPER_2026]).toEqual([250_000, 400_000, 500_000, 650_000, 750_000]);
  });
  it("표 출처 줄은 현행 본문(대통령령 제36728호, 2026-10-02 시행) 재대조 기록", () => {
    expect(PAY_PAGE_ALLOWANCE_SOURCE_2026).toEqual({
      regulation: "공무원수당 등에 관한 규정",
      decree: "대통령령 제36728호",
      amendedOn: "2026-09-29",
      effectiveOn: "2026-10-02",
      checkedOn: "2026-11-15",
    });
  });
});

describe("교사 호봉표 (PT-07·PT-13·MISSED-pay-3)", () => {
  const h = html(TeacherPage);
  it("교원 수당 표는 마지막 광고·역링크 아래, 사이드바 앞, 광고 목록 불변", () => {
    expect(ads(h)).toEqual(EXPECTED_ADS);
    assertBelowLastColumnAd(h, "teacher-allowances", "/calc/civil-servant-net-pay#teacher");
  });
  it("교직수당·담임·보직(겸임 가능)·정근수당·가산금·직급보조비 해당 없음", () => {
    const sec = section(h, "teacher-allowances");
    expect(sec).toContain(`월 ${CIVIL_TEACHER_ALLOWANCE_2026.teaching.toLocaleString("ko-KR")}원`);
    expect(sec).toContain("월 200,000원");
    expect(sec).toContain("월 150,000원");
    // 별표 11 다목: '그 사유가 둘 이상에 해당할 때에는 각각의 해당 가산금을 함께 지급할 수 있다' (2026-11-15 원문 확인)
    expect(sec).toContain("부장 등 보직교사, 담임과 함께 받을 수 있음");
    expect(sec).toContain("월봉급액의 10~50%");
    expect(sec).toContain("월 30,000~100,000원");
    expect(sec).toContain("20년 이상은 월 1만~3만원 추가 가산");
    expect(sec).toContain("배우자 월 40,000원");
    expect(sec).toContain("해당 없음");
    expect(sec).toContain("공무원수당 등에 관한 규정(대통령령 제36728호,");
  });
  it("인용 문구는 신규 교사 통상 시작 9호봉·최고 40호봉, 법령 표기는 봉급·담임수당을 나눈다", () => {
    expect(h).toContain("신규 교사 통상 시작인 9호봉 2,495,600원, 최고 40호봉 6,205,700원이며");
    expect(h).not.toContain("원부터 40호봉");
    expect(h).toContain("— 봉급: 공무원보수규정 별표 11, 담임수당: 공무원수당 등에 관한 규정 별표 11 기준.");
  });
  it("공유 설명은 시작 호봉임이 드러난다", () => {
    expect(h).toContain('data-test-share="신규 9호봉 249만원·30호봉 482만원, 담임·보직수당 구조 총정리"');
  });
});

describe("경찰·소방 봉급표 (PT-08)", () => {
  const police = html(PolicePage);
  const fire = html(FirePage);
  it("두 표 모두 마지막 광고·역링크 아래, 사이드바 앞, 광고 목록 불변", () => {
    expect(ads(police)).toEqual(EXPECTED_ADS);
    expect(ads(fire)).toEqual(EXPECTED_ADS);
    assertBelowLastColumnAd(police, "police-allowances", "/calc/civil-servant-net-pay#police");
    assertBelowLastColumnAd(fire, "fire-allowances", "/calc/civil-servant-net-pay#fire");
  });
  it("경찰: 계급별 직급보조비 순경~치안정감(경사 180,000·경정 250,000·치안정감 750,000)과 112 출동·특수업무수당", () => {
    const sec = section(police, "police-allowances");
    const rows = [...sec.matchAll(/<td class="py-2.5 px-2 font-bold text-navy">([^<]+)<\/td><td[^>]*>월 ([\d,]+)원<\/td><\/tr>/g)].map((m) => [m[1], m[2]]);
    expect(rows).toEqual([
      ["순경·경장", "175,000"],
      ["경사", "180,000"],
      ["경위·경감", "185,000"],
      ["경정", "250,000"],
      ["총경", "400,000"],
      ["경무관", "500,000"],
      ["치안감", "650,000"],
      ["치안정감", "750,000"],
    ]);
    expect(CIVIL_POSITION_ALLOWANCE_2026.policeFire[2]).toBe(180_000);
    expect(sec).toContain("1일 상한 40,000원");
    expect(sec).toContain("긴급 출동 1건당 4,000원");
    expect(sec).toContain("월 80,000원 이하");
    expect(sec).toContain("인파 사고 등 재난·안전관리 업무를 상시 맡는 경찰청 경비부서 경찰");
    expect(sec).toContain("갑종 월 60,000원 + 현장 가산금 20,000원(별표 9 비고 해당 직무)");
  });
  it("소방: 출동가산금 먼저, 긴급구조통제단 특수업무수당, 소방령~소방정감 직급보조비", () => {
    const sec = section(fire, "fire-allowances");
    expect(sec.indexOf("화재진화·구조구급 출동가산금")).toBeLessThan(sec.indexOf(">계급별 직급보조비</h3>"));
    expect(sec).toContain("긴급구조통제단 운영을 상시 맡는 소방청 소속 공무원");
    for (const [rank, amount] of [["소방령", "250,000"], ["소방정", "400,000"], ["소방준감", "500,000"], ["소방감", "650,000"], ["소방정감", "750,000"]]) {
      expect(sec, rank).toContain(`${rank}</td><td class="py-2.5 px-2 text-right text-muted-blue tabular-nums">월 ${amount}원`);
    }
  });
  it("두 페이지 소개 문장은 서로 다르다", () => {
    const intro = (h: string, id: string) => /<p class="text-sm leading-7 text-muted-blue mb-5">([\s\S]*?)<\/p>/.exec(section(h, id))![1];
    expect(intro(police, "police-allowances")).not.toBe(intro(fire, "fire-allowances"));
  });
});
