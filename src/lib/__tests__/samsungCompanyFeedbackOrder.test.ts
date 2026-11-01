// /salary-db/samsung-electronics 비공개 의견 폼 위치 가드 (2026-10-05 운영자 승인 #6, A06 '삼성전자 피드백', 감사 code25-F1)
//
// 폼은 Display2Ad 바로 아래·InArticleAd 위(사이에 CompanyNarrative 하나)에 있었다. 운영자 승인대로 InArticleAd 바로 아래로 내렸다.
// 광고 컴포넌트 순서·개수는 그대로. 다른 회사는 이 블록이 렌더되지 않는다(삼성전자 조건).

import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const src = readFileSync(resolve(process.cwd(), "src/app/salary-db/[id]/page.tsx"), "utf8")
  .replace(/\r\n/g, "\n")
  .replace(/\{\/\*[\s\S]*?\*\/\}/g, "");
const body = src.slice(src.indexOf("export default"));

describe("삼성전자 회사 페이지 의견 폼은 InArticleAd 바로 아래", () => {
  it("광고 컴포넌트 순서는 그대로", () => {
    const ads = [...body.matchAll(/<(CompanyTopAd|GuideMidAd|Display2Ad|InArticleAd|HomeTopAd|SidebarAd)\b/g)].map((m) => m[1]);
    expect(ads).toEqual(["CompanyTopAd", "GuideMidAd", "Display2Ad", "InArticleAd", "HomeTopAd", "SidebarAd"]);
  });

  it("폼은 정확히 1회, InArticleAd 래퍼 바로 다음이고 다음 광고보다 앞", () => {
    const form = body.indexOf('<PrivateFeedback target="samsung_company" />');
    expect(form).toBeGreaterThan(-1);
    expect(body.indexOf("<PrivateFeedback", form + 1)).toBe(-1);
    const inArticle = body.indexOf("<InArticleAd />");
    expect(form).toBeGreaterThan(inArticle);
    expect(body.slice(inArticle, form)).toMatch(
      /^<InArticleAd \/>\s*<\/div>\s*\{company\.id === "samsung-electronics" && \(\s*<div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">\s*$/,
    );
    // Display2Ad 와 InArticleAd 사이에는 폼이 없다
    expect(body.slice(body.indexOf("<Display2Ad />"), inArticle)).not.toContain("PrivateFeedback");
  });
});
