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
    expect(metadata.description).toContain("기존 OPI1·DS 특별경영성과급(OPI2) 합산 세후 실수령액 추정");
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
    for (const anchor of ["my-calc-title", "tai-title", "opi-actual-title"]) expect(html).toContain(`href="#${anchor}"`);
  });
});
