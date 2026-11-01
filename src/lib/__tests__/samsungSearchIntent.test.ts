import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

// Pure SSR: calculator interactions and all advertising widgets stay inert.
vi.mock("@/app/calc/samsung-bonus/Client", () => ({ default: () => null }));
vi.mock("@/app/calc/samsung-bonus/TaiCalculator", () => ({ default: () => null }));
vi.mock("@/components/AdPlacement", () => ({ InArticleAd: () => null, Display2Ad: () => null, GuideMidAd: () => null }));
vi.mock("@/components/CoupangBanner", () => ({ default: () => null }));
vi.mock("@/components/ShareButtons", () => ({ default: () => null }));
vi.mock("@/components/FavoritesButton", () => ({ default: () => null }));
vi.mock("@/components/RelatedCalculators", () => ({ default: () => null }));
vi.mock("@/components/Breadcrumbs", () => ({ default: () => null }));

import SamsungPage, { metadata } from "@/app/calc/samsung-bonus/page";

describe("삼성 성과급 검색 진입 설명", () => {
  it("기존 검색어와 실제 OPI2·세후 추정 기능을 제목·메타에 함께 표시한다", () => {
    expect(metadata.title).toMatchObject({ absolute: expect.stringContaining("삼성전자 성과급 계산기 2026") });
    expect(metadata.title).toMatchObject({ absolute: expect.stringContaining("OPI·OPI2 세후, TAI") });
    // 2026-11-01 운영자 승인 8번(B37): 10/19 에 빠진 앞머리 검색어를 되살리고 OPI1·OPI2 합산 세후 범위는 유지
    expect(String(metadata.description).startsWith("삼성전자 OPI(초과이익성과금)·TAI(목표달성장려금) 계산기.")).toBe(true);
    expect(metadata.description).toContain("기존 OPI1·DS 특별경영성과급(OPI2) 합산 세후 실수령액");
    expect(metadata.description).toContain("개인 지급 확정액은 아닙니다");
    expect(metadata.alternates?.canonical).toBe("https://www.moneysalary.com/calc/samsung-bonus");
    expect(metadata.openGraph?.description).toBe(metadata.description);
    expect(metadata.twitter?.description).toBe(metadata.description);
  });

  it("실제 H1과 안내 문구도 합산 추정임을 설명하며 기존 이동 목적지를 보존한다", () => {
    const html = renderToStaticMarkup(createElement(SamsungPage));
    const h1 = html.match(/<h1\b[^>]*>([\s\S]*?)<\/h1>/)?.[1];
    expect(h1).toContain("삼성전자 성과급 계산기");
    expect(h1).toContain("2026 OPI·OPI2 세후 / TAI 예상");
    expect(html).toContain("기존 OPI1과 DS 특별경영성과급(OPI2)은 합산 세후 금액을");
    expect(html).toContain("회사의 개인별 지급 확정액은 아닙니다");
    // 페이지 안 바로가기 줄은 히어로(모든 광고 위)에서 첫 광고(Client 의 평균 결과 HomeTopAd) 아래로 옮겼다
    // (2026-10-05 운영자 승인 #6, 11/1 재승인 B05). 이동 목적지와 그리로 가는 링크는 그대로 있다 — 링크는 Client 에서 렌더하고,
    // 그 위치(광고 아래)는 samsungBonusJumpNav.test.ts 가 고정한다. 여기서는 Client 를 모킹하므로 소스로 확인한다.
    for (const anchor of ["tai-title", "opi-actual-title"]) expect(html).toContain(`id="${anchor}"`);
    const client = readFileSync(resolve(process.cwd(), "src/app/calc/samsung-bonus/Client.tsx"), "utf8");
    expect(client).toContain('id="my-calc-title"');
    for (const anchor of ["my-calc-title", "tai-title", "opi-actual-title"]) expect(client).toContain(`"#${anchor}"`);
  });
});
