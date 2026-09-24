// /share/[data] 착지·/salary/[amount] 의 og 메타 (OG-11·OG-03·OG-09, 2026-09-25)
//
// - /share 의 openGraph 객체는 루트 openGraph 를 통째로 대체한다 → type·locale·siteName·url·image alt 를 직접 채운다.
// - 잘못된 토큰 제목은 layout 템플릿이 브랜드를 한 번만 붙이도록 '공유된 연봉 결과'.
// - 연봉 카드 주소는 1만원 단위 + &v= 버전 — 네이버·카카오가 쥔 옛 ASCII 썸네일 교체.
// jsdom 없음 — generateMetadata 만 부른다. 광고·쿠팡 JSX 는 이 테스트 대상이 아니다(모킹).
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it, vi } from "vitest";

vi.mock("@/components/ShareableResult", () => ({ default: () => null }));
vi.mock("@/components/AdPlacement", () => ({ CalcResultAd: () => null }));
vi.mock("@/components/CoupangBanner", () => ({ default: () => null }));
vi.mock("@/components/NextActions", () => ({ default: () => null }));
vi.mock("@/components/RelatedCalculators", () => ({ default: () => null }));
vi.mock("@/components/ResultSharePanel", () => ({ default: () => null }));

import { generateMetadata } from "@/app/share/[data]/page";
import { buildSalaryAmountMetadata } from "@/lib/seo";
import { decodeSharedSalary, encodeSalarySharePayload } from "@/lib/salarySharePayload";
import { OG_URL_VERSION } from "@/lib/ogUrlVersion";

const SITE = "https://www.moneysalary.com";
const token = encodeSalarySharePayload({ v: 1, taxYear: 2026, incomeType: "regular", annualSalary: 50_000_000, nonTaxableAmount: 200_000, dependents: 1, children: 0 })!;

type OgImage = { url: string; width: number; height: number; alt?: string };
const ogOf = (meta: ReturnType<typeof generateMetadata>) => meta.openGraph as unknown as { type: string; locale: string; siteName: string; url: string; title: string; images: OgImage[] };

describe("/share/[data] generateMetadata", () => {
  it("유효 토큰: og type·locale·siteName·자기 url·image alt 를 채우고 noindex 유지", () => {
    const meta = generateMetadata({ params: { data: token } });
    const og = ogOf(meta);
    expect(og.type).toBe("website");
    expect(og.locale).toBe("ko_KR");
    expect(og.siteName).toBe("머니샐러리");
    expect(og.url).toBe(`${SITE}/share/${token}`);
    expect(og.title).toBe(meta.title);
    expect(og.images).toHaveLength(1);
    expect(og.images[0]).toMatchObject({ width: 1200, height: 630, alt: meta.title });
    expect(meta.robots).toEqual({ index: false, follow: false });
  });

  it("og:image 는 1만원 단위 + v 버전, twitter 이미지와 같은 주소", () => {
    const decoded = decodeSharedSalary(token)!;
    const meta = generateMetadata({ params: { data: token } });
    const url = ogOf(meta).images[0].url;
    expect(url).toBe(`/api/og?type=salary&amount=50000000&net=${Math.round(decoded.monthlyNet / 10000) * 10000}&v=${OG_URL_VERSION}`);
    expect((meta.twitter as { images: string[] }).images).toEqual([url]);
    // 제목의 만원 숫자와 카드 주소의 숫자가 같은 단위로 맞는다
    expect(meta.title).toContain(`${Math.round(decoded.monthlyNet / 10000).toLocaleString("ko-KR")}만원`);
  });

  it("잘못된 토큰: 브랜드는 템플릿이 한 번만 — 제목에 '머니샐러리' 없음", () => {
    const meta = generateMetadata({ params: { data: "not-a-token!!" } });
    expect(meta.title).toBe("공유된 연봉 결과");
    expect(meta.robots).toEqual({ index: false, follow: false });
    expect(meta.openGraph).toBeUndefined();
  });

  it("광고·쿠팡 JSX 는 그대로 — 결과 카드 직하 CalcResultAd, 그 아래 쿠팡", () => {
    const src = readFileSync(resolve(process.cwd(), "src/app/share/[data]/page.tsx"), "utf8").replace(/\r\n/g, "\n");
    expect(src).toContain(" {decoded && (\n <div className=\"w-full mt-8\">\n <CalcResultAd />\n </div>\n )}");
    expect(src).toContain("<CoupangBanner\n responsive={{ mobile: \"mobile-banner\", desktop: \"leaderboard\" }}\n category=\"salary\"\n />");
    expect(src.indexOf("<ShareableResult")).toBeLessThan(src.indexOf("<CalcResultAd />"));
    expect(src.indexOf("<CalcResultAd />")).toBeLessThan(src.indexOf("<CoupangBanner"));
    expect(src.indexOf("<CoupangBanner")).toBeLessThan(src.indexOf("<ResultSharePanel"));
  });
});

describe("/salary/[amount] og:image (buildSalaryAmountMetadata)", () => {
  it("net 을 1만원 단위로 모으고 v 버전을 붙인다 — 제목·설명은 무변경", () => {
    const meta = buildSalaryAmountMetadata(75_500_000, 5_069_686);
    const images = (meta.openGraph as { images: OgImage[] }).images;
    expect(images[0].url).toBe(`${SITE}/api/og?type=salary&amount=75500000&net=5070000&v=${OG_URL_VERSION}`);
    expect((meta.twitter as { images: string[] }).images).toEqual([images[0].url]);
    expect(meta.title).toEqual({ absolute: "연봉 7,550만원 실수령액 월 507만원 (2026 세후 월급) | 머니샐러리" });
  });

  it("net 이 없으면 종전처럼 net 생략", () => {
    const images = (buildSalaryAmountMetadata(50_000_000).openGraph as { images: OgImage[] }).images;
    expect(images[0].url).toBe(`${SITE}/api/og?type=salary&amount=50000000&v=${OG_URL_VERSION}`);
  });
});
