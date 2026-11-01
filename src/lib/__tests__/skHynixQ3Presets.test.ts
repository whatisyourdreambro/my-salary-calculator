// SK하이닉스 3분기 실적(2026-10-28 SK하이닉스 뉴스룸) 반영 회귀 가드 — B27 DATA-03
// (운영자 승인 2026-11-01, 승인 목록 5번 권장안: 숫자 변경 예, 기본값 250조 유지).
// ① psData: 1~3분기 누적 181.5조 = 세 분기 발표치 합의 반올림, 보수 = 그 값(4분기 0 가정), 누적 연환산 = ×4/3 반올림 242.
// ② CalcResultAd 위(칩·1단계 문단)와 허브 '최근 성과급 소식'(CalcResultAd 위)은 옛 문구보다 짧은 문구만 — 정확한 문자열을 고정한다.
//    폭은 사이트 글꼴 추정(320~1440px 줄 수 증가 없음)으로 골랐고 실측은 단계 스윕이 한다.
// ③ 긴 설명·출처는 접힌 FAQ(<details>, 기본 높이 0)와 HowTo(JSON-LD)에만. 맨 아래 '데이터 출처' 문단은
//    calc/layout 하단 광고(InArticleAd·쿠팡·HomeTopAd) 위라 행을 더하지 않는다. 상반기 PI 문맥의 98.2조는 그대로다.
// 출처: https://news.skhynix.co.kr/q3-2026-business-results/ (3분기 83조3,338억·2분기 60조5,426억·자사주 20조 중 약 10조 임직원 보상용),
//       https://news.skhynix.co.kr/q1-2026-business-results/ (1분기 37조6,103억).
import { createElement, type ReactNode } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

const { stub } = vi.hoisted(() => ({ stub: () => null }));
vi.mock("@/components/AdPlacement", () => ({
  HomeTopAd: stub,
  CalcResultAd: stub,
  GuideMidAd: stub,
  SidebarAd: stub,
  InArticleAd: stub,
  MultiplexAd: stub,
  Display2Ad: stub,
  ResultAd: stub,
}));
vi.mock("@/components/CoupangBanner", () => ({ default: stub }));
vi.mock("@/components/AppLink", () => ({
  default: ({ children, ...props }: { children: ReactNode }) => createElement("a", props, children),
}));
vi.mock("next/dynamic", () => ({ default: () => stub }));
vi.mock("next/navigation", () => ({
  usePathname: () => "/calc/sk-hynix-bonus",
  useRouter: () => ({ push() {}, replace() {}, prefetch() {} }),
  useSearchParams: () => new URLSearchParams(),
  notFound: () => {
    throw new Error("notFound");
  },
}));

import {
  DEFAULT_PROFIT_TRILLION,
  H1_2026_PROFIT_TRIL,
  LAST_UPDATED,
  PROFIT_SCENARIOS,
  Q1_Q3_2026_PROFIT_TRIL,
  SOURCES,
} from "@/app/calc/sk-hynix-bonus/psData";
import { BONUS_NEWS_2026 } from "@/data/bonusCalcHub";

const html = async (load: () => Promise<{ default: unknown }>) =>
  renderToStaticMarkup(createElement((await load()).default as () => ReactNode)).replaceAll("<!-- -->", "");
const ldItems = (page: string) =>
  [...page.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)].map((m) => JSON.parse(m[1]));

describe("① psData 3분기 실적 시나리오", () => {
  it("1~3분기 누적은 세 분기 발표치(37조6,103억·60조5,426억·83조3,338억) 합을 소수 첫째 자리 반올림한 181.5조", () => {
    const sumEok = 376_103 + 605_426 + 833_338;
    expect(sumEok).toBe(1_814_867);
    expect(Math.round(sumEok / 1_000) / 10).toBe(Q1_Q3_2026_PROFIT_TRIL);
    expect(Q1_Q3_2026_PROFIT_TRIL).toBe(181.5);
    expect(H1_2026_PROFIT_TRIL).toBe(98.2);
  });

  it("보수 = 누적(4분기 0 가정), 누적 연환산 = ×4/3 반올림 242, 2025 실적·컨센서스·기본값 250조 유지", () => {
    expect(PROFIT_SCENARIOS.map((s) => s.id)).toEqual(["actual2025", "conservative", "runrate", "consensus"]);
    const [actual, conservative, runrate, consensus] = PROFIT_SCENARIOS;
    expect(actual).toEqual({ id: "actual2025", label: "2025 실적", trillion: 47.2, hint: "PS 2,964% 근거" });
    expect(conservative).toEqual({ id: "conservative", label: "보수", trillion: Q1_Q3_2026_PROFIT_TRIL, hint: "4분기 0 가정" });
    expect(runrate).toEqual({
      id: "runrate",
      label: "누적 연환산",
      trillion: Math.round((Q1_Q3_2026_PROFIT_TRIL * 4) / 3),
      hint: `${Q1_Q3_2026_PROFIT_TRIL}조×4/3`,
    });
    expect(runrate.trillion).toBe(242);
    expect(consensus).toEqual({ id: "consensus", label: "컨센서스", trillion: 250, hint: "증권가 2026 전망" });
    expect(DEFAULT_PROFIT_TRILLION).toBe(250);
    expect(LAST_UPDATED).toBe("2026-11-01");
  });
});

describe("② /calc/sk-hynix-bonus 화면", () => {
  it("칩·1단계 문단은 새 값과 짧은 문구, 옛 상반기 연환산 문구는 화면·구조화 데이터 어디에도 없다", async () => {
    const page = await html(() => import("@/app/calc/sk-hynix-bonus/page"));
    for (const s of ["181.5조", "4분기 0 가정", "누적 연환산", "242조", "181.5조×4/3", "250조"]) expect(page).toContain(s);
    expect(page).toContain("2026년 1~3분기 실적만 181.5조원(10/28 발표)입니다.");
    for (const old of ["하반기 급락 가정", "상반기 연환산", "상반기 98.2조 × 2", "196.4조", "150조", "2026 상반기 실적만 98.2조원"]) {
      expect(page, old).not.toContain(old);
    }
    // 상반기 PI 문맥(광고 위 안내 상자)의 상반기 영업이익은 그대로 둔다.
    expect(page).toContain("상반기 영업이익 98.2조원");
  });

  it("FAQ(접힌 details)·HowTo(JSON-LD)는 1~3분기 누적·두 시나리오의 뜻·10/28 뉴스룸 출처를 적는다", async () => {
    const page = await html(() => import("@/app/calc/sk-hynix-bonus/page"));
    const items = ldItems(page);
    const faq = items.find((i) => i["@type"] === "FAQPage");
    const howTo = items.find((i) => i["@type"] === "HowTo");
    const ps = faq.mainEntity.find((q: { name: string }) => q.name === "2026년 SK하이닉스 PS는 1인당 얼마나 될까요?");
    const answer: string = ps.acceptedAnswer.text;
    expect(answer).toContain("회사가 2026년 10월 28일 발표한 1~3분기 누적 영업이익은 181.5조원(3분기 83조 3,338억원, SK하이닉스 뉴스룸)입니다.");
    expect(answer).toContain("계산기의 '보수' 시나리오(181.5조원)는 4분기 영업이익을 0으로 둔 값이고, '누적 연환산'(242조원)은 1~3분기 흐름이 4분기에도 이어진다고 가정한 값입니다.");
    expect(answer).toContain("자사주 20조원 매입을 결의했고, 그중 약 10조원은 임직원 보상용이라고 밝혔습니다.");
    expect(answer).toContain("컨센서스 250조원");
    const step = howTo.step.find((s: { name: string }) => s.name === "영업이익 시나리오 선택");
    expect(step.text).toBe(
      "2025 실적(47.2조) / 보수(181.5조) / 누적 연환산(242조) / 컨센서스(250조) 중 선택하거나 직접 입력합니다. 2026년 1~3분기 누적 영업이익은 181.5조원(10/28 회사 발표)입니다."
    );
    // 화면의 FAQ 답은 <details> 안(기본 닫힘)에만 있다.
    const details = [...page.matchAll(/<details(?![^>]*\sopen="")[^>]*>([\s\S]*?)<\/details>/g)].map((m) => m[1]);
    expect(details.some((d) => d.includes("임직원 보상용이라고 밝혔습니다."))).toBe(true);
  });

  it("맨 아래 '데이터 출처' 문단(하단 광고 위)에는 행을 더하지 않고 갱신일만 바뀐다", async () => {
    const sourceDates: string[] = SOURCES.map((s) => s.date);
    expect(sourceDates).not.toContain("2026-10-28");
    const page = await html(() => import("@/app/calc/sk-hynix-bonus/page"));
    expect(page).toContain("마지막 갱신 2026-11-01.");
  });
});

describe("③ 허브 /calc/bonus-calculators 최근 성과급 소식 (CalcResultAd 위)", () => {
  it("항목 수는 그대로 9개 — 10/28 항목을 맨 위에 넣고 가장 오래된 2026-05-27 항목을 뺐다", () => {
    expect(BONUS_NEWS_2026).toHaveLength(9);
    expect(BONUS_NEWS_2026[0]).toEqual({
      date: "2026-10-28",
      text: "SK하이닉스 3분기 영업이익 83.3조원 — 1~3분기 누적 181.5조원",
      href: "/calc/sk-hynix-bonus",
    });
    expect(BONUS_NEWS_2026.some((n) => n.date === "2026-05-27")).toBe(false);
    expect(BONUS_NEWS_2026.map((n) => n.date)).toEqual([...BONUS_NEWS_2026.map((n) => n.date)].sort().reverse());
  });

  it("허브 화면에 새 항목이 맨 위로 그려진다", async () => {
    const page = await html(() => import("@/app/calc/bonus-calculators/page"));
    const news = page.slice(page.indexOf('data-msy-module="bonus-hub-news"'));
    const first = news.indexOf("2026-10-28");
    expect(first).toBeGreaterThan(-1);
    expect(first).toBeLessThan(news.indexOf("2026-10-07"));
    expect(news).toContain("SK하이닉스 3분기 영업이익 83.3조원 — 1~3분기 누적 181.5조원 →");
    expect(news).not.toContain("삼성전자 임금협상 조합원 투표 가결");
  });
});
