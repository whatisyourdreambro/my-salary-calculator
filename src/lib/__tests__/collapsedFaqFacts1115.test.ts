// N2-app-pages-02 (2026-11-15 감사 app-pages-b04-F01, b06-F04, b06-F06) — 접힌 FAQ 답(FAQPage JSON-LD 같은 배열) 사실 정정.
//
// 1) /medical-tax-credit-2026: 의료비 세액공제 근거는 소득세법 제59조의4 제2항(제1항은 보장성보험료). 출처 상자(:403)는
//    11/1 에 제2항으로 고쳤고 FAQ 답과 머리 주석만 제1항으로 남아 있었다.
// 2) /salary-raise-2026: 반도체 2사 2026 임금협상은 삼성전자 평균 6.2%(기본 4.1%+성과 2.1%, 5/27 가결)·SK하이닉스 6.3%
//    (9/9 수정안도 6.3% 유지, 9/16 가결) — 보도 기준. '평균 6.5% 안팎'은 근거 없는 값.
// 3) /tax-rates-2026: 대주주 상장주식 양도세는 과세표준 3억원까지 20%, 초과분 25%(지방소득세 포함 22%·27.5%,
//    소득세법 제104조 제1항 제11호 가목). 화면 목록 줄(:231, CalcResultAd 와 GuideMidAd 사이)은 질문 1 대상이라 그대로.
// 세 답 모두 open 속성 없는 <details> 안이라 닫힌 높이와 광고 위치가 바뀌지 않는다.
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const readSrc = (rel: string) => readFileSync(resolve(process.cwd(), rel), "utf8");
const flat = (s: string) => s.replace(/\s+/g, " ");

describe("/medical-tax-credit-2026 FAQ 근거 조문", () => {
  const src = flat(readSrc("src/app/medical-tax-credit-2026/page.tsx"));

  it("의료비 세액공제는 제59조의4 제2항으로 적는다", () => {
    expect(src).toContain("제59조의4 제2항(의료비 세액공제)");
    expect(src).not.toContain("제59조의4 제1항");
  });

  it("FAQ 는 open 없는 details 로 그린다", () => {
    expect(src).toMatch(/\{FAQS\.map\(\(faq, i\) => \( <details key=\{i\} className="group p-5/);
  });
});

describe("/salary-raise-2026 FAQ 반도체 임금협상", () => {
  const src = flat(readSrc("src/app/salary-raise-2026/page.tsx"));

  it("보도 기준 타결값(삼성 6.2%·SK하이닉스 6.3%)을 쓴다", () => {
    expect(src).toContain(
      "2026년 임금협상은 삼성전자 평균 6.2%(기본 4.1%+성과 2.1%), SK하이닉스 6.3%로 타결됐습니다(보도 기준).",
    );
    expect(src).not.toContain("6.5% 안팎");
  });

  it("FAQ 는 open 없는 details 로 그린다", () => {
    expect(src).toMatch(/\{FAQ_ITEMS\.map\(\(item, idx\) => \( <details key=\{idx\} className="rounded-2xl/);
  });
});

describe("/tax-rates-2026 누진세율 FAQ", () => {
  const src = flat(readSrc("src/app/tax-rates-2026/page.tsx"));

  it("대주주 주식 양도세의 3억원 초과 25% 구간을 적는다", () => {
    expect(src).toContain("과세표준 3억원까지 20%, 3억원 초과분 25%로 나눠 적용합니다(지방소득세 포함 22%·27.5%).");
  });

  it("광고 사이 화면 목록 줄은 질문 1 전까지 그대로다", () => {
    expect(src).toContain("국내 일반인 비과세, 대주주·해외주식 22% (250만 공제)");
  });

  it("FAQ 는 open 없는 details 로 그린다", () => {
    expect(src).toMatch(/\{FAQ_ITEMS\.map\(\(item\) => \( <details key=\{item\.question\} className="group p-5/);
  });
});
