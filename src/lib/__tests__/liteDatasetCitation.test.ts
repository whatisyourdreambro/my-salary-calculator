// lite(/salary-db/listed/[stockCode]) Dataset JSON-LD 의 DART 원문 citation·isBasedOn 고정 (2026-09-29 CL-07)
// 화면 '데이터 출처·산정 기준'의 'DART 원문 공시 보기' 링크와 같은 dartUrl 변수여야 한다(보이는 내용과 일치).
import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { datasetLd } from "@/lib/structuredData";

const src = readFileSync("src/app/salary-db/listed/[stockCode]/page.tsx", "utf8");
const datasetBlock = src.slice(src.indexOf("datasetLd({"), src.indexOf("}),", src.indexOf("datasetLd({")));

describe("CL-07 lite Dataset citation", () => {
  it("datasetLd 인자에 citation(출처명·dartUrl)과 isBasedOn: dartUrl 이 있다", () => {
    expect(datasetBlock).toContain('citation: { name: "금융감독원 DART 사업보고서", url: dartUrl }');
    expect(datasetBlock).toContain("isBasedOn: dartUrl");
  });

  it("같은 dartUrl 이 화면의 DART 원문 공시 보기 링크 href 다", () => {
    expect(src).toMatch(/const dartUrl = `https:\/\/dart\.fss\.or\.kr\/dsaf001\/main\.do\?rcpNo=\$\{c\.rceptNo\}`;/);
    expect(src).toMatch(/href=\{dartUrl\}[\s\S]{0,400}DART 원문 공시 보기/);
  });

  it("license 와 temporalCoverage 는 넣지 않는다(DART 원자료 파생·결산월 방출 전)", () => {
    expect(datasetBlock).not.toMatch(/license:/);
    expect(datasetBlock).not.toMatch(/temporalCoverage:/);
  });

  it("datasetLd 가 citation 을 CreativeWork 로, isBasedOn 을 URL 로 싣는다", () => {
    const url = "https://dart.fss.or.kr/dsaf001/main.do?rcpNo=20260318001024";
    const ld = datasetLd({
      name: "t",
      description: "d",
      url: "/salary-db/listed/000000",
      citation: { name: "금융감독원 DART 사업보고서", url },
      isBasedOn: url,
    }) as Record<string, unknown>;
    expect(ld.citation).toEqual({ "@type": "CreativeWork", name: "금융감독원 DART 사업보고서", url });
    expect(ld.isBasedOn).toBe(url);
  });
});
