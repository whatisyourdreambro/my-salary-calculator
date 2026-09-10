import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { navConfig } from "@/components/header/navConfig";
import { navConfigEn } from "@/components/header/navConfigEn";
import { EN_SECTIONS, LANGUAGE_ROUTE_PAIRS } from "./englishSite";
import { EN_ALL_PAGE_PATHS, EN_INDEXABLE_STATIC_PATHS } from "./englishRoutes";
import { languagePaths } from "./englishNavigation";
import { buildEnglishMetadata } from "./englishSeo";
import { publicShareUrl, isShareExcludedPath } from "./sharePolicy";
import { softwareApplicationLd } from "./structuredData";

describe("English navigation and publication contracts", () => {
  it("uses the same ordered seven categories and only real English menu destinations", () => {
    expect(navConfig.filter(item => item.type === "dropdown").map(item => item.name)).toEqual(EN_SECTIONS.map(section => section.koTitle));
    expect(navConfigEn.map(item => item.name)).toEqual(EN_SECTIONS.map(section => section.title));
    for (const category of navConfigEn) {
      expect(category.type).toBe("dropdown");
      const links = category.type === "dropdown" ? category.items : [category];
      for (const item of links) {
        expect(EN_ALL_PAGE_PATHS).toContain(item.href.split(/[?#]/)[0]);
        expect(item.name).not.toMatch(/[가-힣]/);
      }
    }
    expect(new Set(EN_ALL_PAGE_PATHS).size).toBe(EN_ALL_PAGE_PATHS.length);
  });
  it("keeps translated navigation pairs round-trip without declaring different tax models equivalent", () => {
    for (const [ko, en] of LANGUAGE_ROUTE_PAIRS) {
      expect(languagePaths(ko).en).toBe(en);
      expect(languagePaths(en).ko).toBe(ko);
    }
    const loan = buildEnglishMetadata({ title: "Loan calculator", description: "A currency-neutral fixed-payment estimate.", path: "/en/tools/loan" });
    expect(loan.alternates?.languages).not.toHaveProperty("ko-KR");
    const privacy = buildEnglishMetadata({ title: "Privacy", description: "Privacy policy", path: "/en/privacy" });
    expect(privacy.alternates?.languages).toHaveProperty("ko-KR", "https://www.moneysalary.com/privacy");
  });
  it("excludes private English workflows from sharing and indexing even if a caller forgets noindex", () => {
    for (const path of ["/en/contact", "/en/dashboard", "/en/report", "/en/favorites", "/en/contact/receipt"]) {
      expect(isShareExcludedPath(path)).toBe(true);
      expect(publicShareUrl(path)).toBeNull();
      expect(EN_INDEXABLE_STATIC_PATHS).not.toContain(path);
      expect(buildEnglishMetadata({ title: "Private", description: "Private", path }).robots).toMatchObject({ index: false });
    }
    expect(publicShareUrl("/en/tools/bonus?salary=90000#result")).toBe("https://www.moneysalary.com/en/tools/bonus");
  });
  it("gives English pages their own English share cards and keeps the Korean schema default", () => {
    const metadata = buildEnglishMetadata({ title: "Savings target", description: "Choose your own currency and assumptions.", path: "/en/tools/savings-goal" });
    expect(metadata.alternates?.canonical).toBe("https://www.moneysalary.com/en/tools/savings-goal");
    expect(metadata.openGraph).toMatchObject({ locale: "en_US" });
    expect(JSON.stringify(metadata.twitter)).toContain("lang=en");
    expect(softwareApplicationLd({ name: "Tool", description: "Tool", url: "/en", inLanguage: "en" }).inLanguage).toBe("en");
    expect(softwareApplicationLd({ name: "도구", description: "도구", url: "/" }).inLanguage).toBe("ko");
  });
  it("starts the English installed app and every shortcut on an existing English page", () => {
    const manifest = JSON.parse(readFileSync("public/manifest.en.webmanifest", "utf8"));
    expect(manifest.lang).toBe("en");
    expect(manifest.id).toBe("/en");
    expect(new URL(manifest.start_url, "https://www.moneysalary.com").pathname).toBe("/en");
    for (const shortcut of manifest.shortcuts) expect(EN_ALL_PAGE_PATHS).toContain(shortcut.url.split(/[?#]/)[0]);
  });
});
