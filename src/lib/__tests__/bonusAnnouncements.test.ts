// 성과급 지급률 확정 공지 키트 (src/data/bonusAnnouncements.ts, 2026-09-27 R8 · 운영자 9/27 승인 6)
//
//  1) 휴면: 세 항목 모두 공지 전 상태 → 세 페이지 description 이 4ef59a4b 프리렌더 문자열과 같다.
//  2) 꼬리 구절 규칙: 네 칸이 모두 맞고, 빌드 KST 날짜가 [공지일, 2027-03-31] 안일 때만 한 번 붙는다.
//  3) 점검 규칙이 잘못 채운 값(%·시즌 밖 날짜·가짜 날짜·http·반쯤 채움)을 잡는다.
//  4) 채운 상태를 모킹하면 세 페이지의 meta·og·twitter description 끝에 구절이 정확히 한 번 붙는다.
//  5) PAGE_DESC 는 description 자리(메타·JSON-LD·공유)에만 쓰인다 — 화면 문장에 나오지 않는다(광고 위 높이 불변).
import { readFileSync } from "node:fs";
import type { Metadata } from "next";
import { createElement, type ReactNode } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import {
  BONUS_ANNOUNCEMENTS,
  BONUS_ANNOUNCEMENT_KEYS,
  BONUS_ANNOUNCEMENT_SHOW_UNTIL,
  bonusAnnouncementProblems,
  bonusAnnouncementSuffix,
  kstDate,
  withBonusAnnouncement,
  type BonusAnnouncement,
  type BonusAnnouncementKey,
} from "@/data/bonusAnnouncements";

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
  usePathname: () => "/",
  useRouter: () => ({ push() {}, replace() {}, prefetch() {} }),
  useSearchParams: () => new URLSearchParams(),
  notFound: () => {
    throw new Error("notFound");
  },
}));

/** 4ef59a4b 빌드 프리렌더 HTML 의 meta description (2026-09-27 origin/main) */
const BASE_DESC: Record<BonusAnnouncementKey, string> = {
  "samsung-bonus":
    "삼성전자 OPI(초과이익성과금)·TAI(목표달성장려금) 계산기. 2026 상반기 TAI 메모리 100% 반영, 사업부별 1인당·세후 실수령·RSU 매도까지 무료 시뮬레이션.",
  "sk-hynix-bonus":
    "SK하이닉스 PS·PI 성과급 계산기. 2026 임단협 9/16 가결(현금 50%+자사주 50%) 반영 — 영업이익·연봉만 입력하면 주식 지급분·하방 보전·세후 실수령까지 무료 시뮬레이션. 2026 상반기 PI 150% 확정.",
  "hyundai-bonus":
    "현대차 성과급 계산기. 월 기준금액과 주가를 입력해 2026·2025 보도 시나리오의 현금 성과금, 주식·포인트 평가액, 예상 공제액을 비교합니다. 개인별 지급 확정액이 아닌 가정에 따른 계산입니다.",
};

const PAGE_IMPORT: Record<BonusAnnouncementKey, () => Promise<{ metadata: Metadata }>> = {
  "samsung-bonus": () => import("@/app/calc/samsung-bonus/page"),
  "sk-hynix-bonus": () => import("@/app/calc/sk-hynix-bonus/page"),
  "hyundai-bonus": () => import("@/app/calc/hyundai-bonus/page"),
};

const PAGE_SRC: Record<BonusAnnouncementKey, string> = {
  "samsung-bonus": "src/app/calc/samsung-bonus/page.tsx",
  "sk-hynix-bonus": "src/app/calc/sk-hynix-bonus/page.tsx",
  "hyundai-bonus": "src/app/calc/hyundai-bonus/page.tsx",
};

/** 연습용 채운 값 — 실제 데이터 아님(테스트 안에서만 쓴다) */
const FILLED: Record<BonusAnnouncementKey, BonusAnnouncement> = {
  "samsung-bonus": { confirmed: true, rateLabel: "2026년 OPI", date: "2027-01-27", source: "https://example.com/samsung-notice" },
  "sk-hynix-bonus": { confirmed: true, rateLabel: "2026년 PS", date: "2027-02-03", source: "https://example.com/skhynix-notice" },
  "hyundai-bonus": { confirmed: true, rateLabel: "2026년 성과급", date: "2027-02-10", source: "https://example.com/hyundai-notice" },
};
const SUFFIX: Record<BonusAnnouncementKey, string> = {
  "samsung-bonus": " 2026년 OPI 지급률 확정(1/27, 회사 공지).",
  "sk-hynix-bonus": " 2026년 PS 지급률 확정(2/3, 회사 공지).",
  "hyundai-bonus": " 2026년 성과급 지급률 확정(2/10, 회사 공지).",
};

const kst = (iso: string) => new Date(`${iso}+09:00`);
const count = (s: string, sub: string) => s.split(sub).length - 1;

afterEach(() => {
  vi.useRealTimers();
  vi.doUnmock("@/data/bonusAnnouncements");
  vi.resetModules();
});

describe("휴면 — 지금 출력은 종전과 같다", () => {
  it("세 항목 모두 공지 전 상태(false + null 세 칸)이고 점검 통과", () => {
    expect(Object.keys(BONUS_ANNOUNCEMENTS).sort()).toEqual([...BONUS_ANNOUNCEMENT_KEYS].sort());
    for (const key of BONUS_ANNOUNCEMENT_KEYS) {
      expect(BONUS_ANNOUNCEMENTS[key], key).toEqual({ confirmed: false, rateLabel: null, date: null, source: null });
      expect(bonusAnnouncementProblems(BONUS_ANNOUNCEMENTS[key]), key).toEqual([]);
    }
  });

  it("실제 표는 어느 날짜에 빌드해도 꼬리 구절이 없다", () => {
    for (const key of BONUS_ANNOUNCEMENT_KEYS) {
      for (const day of ["2026-09-27", "2027-01-27", "2027-02-28", "2027-03-31"]) {
        expect(bonusAnnouncementSuffix(key, kst(`${day}T12:00:00`)), `${key} ${day}`).toBe("");
        expect(withBonusAnnouncement(key, BASE_DESC[key], kst(`${day}T12:00:00`))).toBe(BASE_DESC[key]);
      }
    }
  });

  it.each([...BONUS_ANNOUNCEMENT_KEYS])("%s: metadata·og·twitter description 이 4ef59a4b 문자열과 같다", async (key) => {
    const { metadata } = await PAGE_IMPORT[key]();
    const og = metadata.openGraph as { description?: string };
    const tw = metadata.twitter as { description?: string };
    expect(metadata.description).toBe(BASE_DESC[key]);
    expect(og.description).toBe(BASE_DESC[key]);
    expect(tw.description).toBe(BASE_DESC[key]);
  });
});

describe("꼬리 구절 규칙", () => {
  const table = FILLED;

  it("공지일 KST 0시부터 SHOW_UNTIL 까지만 붙는다", () => {
    const k: BonusAnnouncementKey = "samsung-bonus";
    // KST 1/26 23:59 = 공지 전날
    expect(bonusAnnouncementSuffix(k, kst("2027-01-26T23:59:59"), table)).toBe("");
    // UTC 1/26 15:00 = KST 1/27 00:00
    expect(bonusAnnouncementSuffix(k, new Date("2027-01-26T15:00:00Z"), table)).toBe(SUFFIX[k]);
    expect(bonusAnnouncementSuffix(k, kst("2027-03-31T23:59:59"), table)).toBe(SUFFIX[k]);
    expect(bonusAnnouncementSuffix(k, kst("2027-04-01T00:00:00"), table)).toBe("");
    expect(BONUS_ANNOUNCEMENT_SHOW_UNTIL).toBe("2027-03-31");
    expect(kstDate(new Date("2027-01-26T15:00:00Z"))).toBe("2027-01-27");
  });

  it("세 회사 구절 모양: ' {이름} 지급률 확정(M/D, 회사 공지).'", () => {
    for (const key of BONUS_ANNOUNCEMENT_KEYS) {
      expect(bonusAnnouncementSuffix(key, kst("2027-02-20T09:00:00"), table), key).toBe(SUFFIX[key]);
    }
  });

  it("한 번만 붙는다 (두 번 감싸도 같은 결과)", () => {
    for (const key of BONUS_ANNOUNCEMENT_KEYS) {
      const now = kst("2027-02-20T09:00:00");
      const once = withBonusAnnouncement(key, BASE_DESC[key], now, table);
      const twice = withBonusAnnouncement(key, once, now, table);
      expect(once).toBe(`${BASE_DESC[key]}${SUFFIX[key]}`);
      expect(twice).toBe(once);
      expect(count(twice, "지급률 확정("), key).toBe(1);
    }
  });

  it("한 회사를 켜도 다른 회사는 그대로다", () => {
    const only = { ...BONUS_ANNOUNCEMENTS, "sk-hynix-bonus": FILLED["sk-hynix-bonus"] };
    const now = kst("2027-02-20T09:00:00");
    expect(withBonusAnnouncement("samsung-bonus", BASE_DESC["samsung-bonus"], now, only)).toBe(BASE_DESC["samsung-bonus"]);
    expect(withBonusAnnouncement("hyundai-bonus", BASE_DESC["hyundai-bonus"], now, only)).toBe(BASE_DESC["hyundai-bonus"]);
    expect(withBonusAnnouncement("sk-hynix-bonus", BASE_DESC["sk-hynix-bonus"], now, only)).toBe(
      `${BASE_DESC["sk-hynix-bonus"]}${SUFFIX["sk-hynix-bonus"]}`
    );
  });
});

describe("점검 규칙 — 잘못 채운 값은 붙지 않고 테스트가 잡는다", () => {
  const ok = FILLED["samsung-bonus"];
  const bad: Array<[string, BonusAnnouncement]> = [
    ["% 수치", { ...ok, rateLabel: "OPI 50%" }],
    ["빈 이름", { ...ok, rateLabel: " " }],
    ["괄호", { ...ok, rateLabel: "OPI(DS)" }],
    ["'지급률' 중복", { ...ok, rateLabel: "OPI 지급률" }],
    ["너무 긴 이름", { ...ok, rateLabel: "2026년 초과이익성과급 OPI" }],
    ["시즌 밖(12월)", { ...ok, date: "2026-12-30" }],
    ["시즌 밖(3월)", { ...ok, date: "2027-03-02" }],
    ["가짜 날짜", { ...ok, date: "2027-02-30" }],
    ["날짜 형식", { ...ok, date: "2027-1-27" }],
    ["http 출처", { ...ok, source: "http://example.com" }],
    ["출처 없음", { ...ok, source: null }],
    ["반쯤 채움(공지 전)", { confirmed: false, rateLabel: "2026년 OPI", date: null, source: null }],
  ];
  it.each(bad)("%s", (_name, entry) => {
    expect(bonusAnnouncementProblems(entry).length).toBeGreaterThan(0);
    const table = { ...BONUS_ANNOUNCEMENTS, "samsung-bonus": entry };
    expect(bonusAnnouncementSuffix("samsung-bonus", kst("2027-02-20T09:00:00"), table)).toBe("");
  });

  it("연습용 채운 값 세 개는 점검 통과", () => {
    for (const key of BONUS_ANNOUNCEMENT_KEYS) expect(bonusAnnouncementProblems(FILLED[key]), key).toEqual([]);
  });
});

describe("채운 상태 모킹 — 세 페이지 description 끝에 정확히 한 번", () => {
  async function loadWith(key: BonusAnnouncementKey, now: string) {
    vi.resetModules();
    vi.useFakeTimers({ now: kst(now), toFake: ["Date"] });
    vi.doMock("@/data/bonusAnnouncements", async () => {
      const actual = await vi.importActual<typeof import("@/data/bonusAnnouncements")>("@/data/bonusAnnouncements");
      const table = { ...actual.BONUS_ANNOUNCEMENTS, ...FILLED };
      return {
        ...actual,
        BONUS_ANNOUNCEMENTS: table,
        withBonusAnnouncement: (k: BonusAnnouncementKey, d: string) => actual.withBonusAnnouncement(k, d, new Date(), table),
      };
    });
    return (await PAGE_IMPORT[key]()).metadata;
  }

  it.each([...BONUS_ANNOUNCEMENT_KEYS])("%s: 공지 뒤 빌드 → meta·og·twitter 에 구절 1회", async (key) => {
    const metadata = await loadWith(key, "2027-02-20T09:00:00");
    const want = `${BASE_DESC[key]}${SUFFIX[key]}`;
    const og = metadata.openGraph as { description?: string };
    const tw = metadata.twitter as { description?: string };
    expect(metadata.description).toBe(want);
    expect(og.description).toBe(want);
    expect(tw.description).toBe(want);
    expect(count(String(metadata.description), "지급률 확정("), key).toBe(1);
    // 설명문 길이 기록(검색 결과 잘림 확인용) — 종전 + 구절 길이
    expect(String(metadata.description).length).toBe(BASE_DESC[key].length + SUFFIX[key].length);
  });

  it.each([...BONUS_ANNOUNCEMENT_KEYS])("%s: 공지 전 빌드 → 종전 그대로", async (key) => {
    const metadata = await loadWith(key, "2027-01-20T09:00:00");
    expect(metadata.description).toBe(BASE_DESC[key]);
  });
});

describe("PAGE_DESC 는 description 자리에만 쓰인다 (화면 문장·광고 위 높이 불변)", () => {
  it.each([...BONUS_ANNOUNCEMENT_KEYS])("%s", (key) => {
    const src = readFileSync(PAGE_SRC[key], "utf8");
    expect(count(src, "withBonusAnnouncement("), key).toBe(1);
    const uses = [...src.matchAll(/PAGE_DESC/g)].map((m) => src.slice(Math.max(0, m.index! - 20), m.index!));
    // 선언 1곳 + description: PAGE_DESC / description={PAGE_DESC} 만 허용
    const decl = uses.filter((before) => /const $/.test(before));
    const allowed = uses.filter((before) => /description(: |=\{)$/.test(before));
    expect(decl.length, key).toBe(1);
    expect(decl.length + allowed.length, `${key}: ${uses.join(" | ")}`).toBe(uses.length);
  });
});
