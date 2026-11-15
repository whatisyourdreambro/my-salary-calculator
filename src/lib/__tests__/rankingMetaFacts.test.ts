// /salary-db/ranking 검색 설명(meta description)이 표에 실제로 있는 회사만 든다 — 2026-11-15 app-data-pages-b04-F01.
// 종전 설명은 '삼성전자, SK하이닉스, 네이버, 카카오 등'이었지만 이 페이지의 정렬로 삼성전자 264위·네이버 53위·카카오 163위라
// TOP 30 표에 없었다. 설명은 표와 같은 모듈 스코프 순위에서 만든다. 제목·H1·히어로·표는 그대로다.
import { createElement, type ReactNode } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

const { stub } = vi.hoisted(() => ({ stub: () => null }));
vi.mock("@/components/AdPlacement", () => ({
  HomeTopAd: stub,
  CalcResultAd: stub,
  GuideMidAd: stub,
  InArticleAd: stub,
}));
vi.mock("@/components/AppLink", () => ({
  default: ({ children, ...props }: { children: ReactNode }) => createElement("a", props, children),
}));

import RankingPage, { metadata } from "@/app/salary-db/ranking/page";

const TOP_N = 30;
const html = renderToStaticMarkup(createElement(RankingPage));
const tbody = html.slice(html.indexOf("<tbody>"), html.indexOf("</tbody>"));
const tableIds = [...tbody.matchAll(/href="\/salary-db\/([^"]+)"/g)].map((m) => m[1]);
const itemList = [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)]
  .map((m) => JSON.parse(m[1]))
  .find((ld) => ld["@type"] === "ItemList") as { itemListElement: Array<{ name: string; url: string }> };
const listNames = itemList.itemListElement.map((e) => e.name);
const description = String(metadata.description);

describe("/salary-db/ranking 메타 설명 — 표의 실제 순위", () => {
  it("표는 30행이고 ItemList 와 같은 순서다", () => {
    expect(tableIds).toHaveLength(TOP_N);
    expect(listNames).toHaveLength(TOP_N);
    expect(itemList.itemListElement.map((e) => e.url.replace(/^.*\/salary-db\//, ""))).toEqual(tableIds);
  });

  it("설명이 드는 회사는 모두 TOP 30 안에 있고, 1~3위 그대로다", () => {
    const head = description.split(" 등 국내 주요 기업 ")[0];
    const named = head.split("·");
    expect(named).toHaveLength(3);
    for (const name of named) expect(listNames).toContain(name);
    expect(named).toEqual(listNames.slice(0, 3));
    expect(description).toContain(`국내 주요 기업 ${TOP_N}곳의 시니어 직급 총보상(기본급+평균 인센티브)을 2026년 기준으로 비교한 연봉 순위표.`);
  });

  it("표 밖 회사(종전 설명의 삼성전자·네이버·카카오)를 설명·키워드에 들지 않는다", () => {
    for (const name of ["삼성전자", "네이버", "카카오"]) {
      if (!listNames.includes(name)) expect(description).not.toContain(name);
    }
    expect(metadata.keywords).not.toContain("삼성전자 연봉");
    expect(metadata.keywords).toContain("SK하이닉스 연봉");
    expect(listNames).toContain("SK하이닉스");
  });

  it("제목은 그대로다", () => {
    const title = metadata.title as string | { absolute: string };
    expect(typeof title === "string" ? title : title.absolute).toContain("2026 대기업 연봉 순위 TOP 30 — 시니어 기준 총보상 랭킹");
  });
});
