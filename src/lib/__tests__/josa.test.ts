// src/lib/josa.ts 회귀 가드 — 회사·용어 이름 뒤 조사 자동 선택 (2026-09-25 B12 PROD-03)
import { describe, expect, it } from "vitest";
import { josa, josaParticle } from "@/lib/josa";
import { companyRepository } from "@/lib/salary-data/CompanyRepository";
import { getSalaryGroupPeers, industryLabelKo } from "@/lib/companyContentBuilder";
import { glossaryData } from "@/data/glossaryData";

describe("josa — 받침 판정 표본", () => {
  it.each([
    ["삼성전자", "삼성전자는"],
    ["네이버", "네이버는"],
    ["LG전자", "LG전자는"],
    ["SK하이닉스", "SK하이닉스는"],
    ["S-OIL", "S-OIL은"],
    ["KT", "KT는"],
    ["11번가", "11번가는"],
    ["구글 (Google)", "구글 (Google)은"],
    ["토스(비바리퍼블리카)", "토스(비바리퍼블리카)는"],
    ["현대자동차", "현대자동차는"],
    ["카카오뱅크", "카카오뱅크는"],
    ["서울아산병원", "서울아산병원은"],
    ["아모레퍼시픽", "아모레퍼시픽은"],
    ["클래스101", "클래스101은"],
    ["29CM", "29CM은"],
    ["NHN", "NHN은"],
    ["HMM", "HMM은"],
    ["LS ELECTRIC", "LS ELECTRIC은"],
    ["KT AI Lab", "KT AI Lab은"],
    ["JYP Ent.", "JYP Ent.는"],
    ["삼성E&A (삼성엔지니어링)", "삼성E&A (삼성엔지니어링)는"],
    ["아프리카TV (SOOP)", "아프리카TV (SOOP)는"],
    ["KT&G", "KT&G는"],
    ["원천징수", "원천징수는"],
    ["ETF (상장지수펀드)", "ETF (상장지수펀드)는"],
    ["DSR (총부채원리금상환비율)", "DSR (총부채원리금상환비율)은"],
    ["감급(감봉)", "감급(감봉)은"],
  ])("%s → %s", (word, expected) => {
    expect(josa(word, "은/는")).toBe(expected);
  });

  it("이/가 · 과/와 · 을/를 · 이란/란 모두 같은 받침 규칙을 따른다", () => {
    expect(josa("삼성전자", "이/가")).toBe("삼성전자가");
    expect(josa("서울아산병원", "이/가")).toBe("서울아산병원이");
    expect(josa("SK하이닉스", "과/와")).toBe("SK하이닉스와");
    expect(josa("아마존 (Amazon)", "과/와")).toBe("아마존 (Amazon)과");
    expect(josa("11번가", "과/와")).toBe("11번가와");
    expect(josa("원천징수", "을/를")).toBe("원천징수를");
    expect(josa("국민연금", "을/를")).toBe("국민연금을");
    expect(josa("국민연금", "이란/란")).toBe("국민연금이란");
    expect(josa("원천징수", "이란/란")).toBe("원천징수란");
  });

  it("으로/로 — ㄹ 받침은 '로', 그 외 받침은 '으로'", () => {
    expect(josa("전면 재택", "으로/로")).toBe("전면 재택으로");
    expect(josa("하이브리드", "으로/로")).toBe("하이브리드로");
    expect(josa("서울", "으로/로")).toBe("서울로");
    expect(josa("S-OIL", "으로/로")).toBe("S-OIL로");
    expect(josa("5,600만원", "으로/로")).toBe("5,600만원으로");
  });

  it("닫는 따옴표·괄호는 떼고 그 앞 글자로 판정한다", () => {
    expect(josaParticle("“강력한 노조와 고용 안정성”", "이/가")).toBe("이");
    expect(josaParticle("'안정, 워라밸'", "을/를")).toBe("을");
    expect(josaParticle("[차량 할인]", "이/가")).toBe("이");
  });

  it("판정할 수 없으면 기존 병기 형식을 유지한다", () => {
    expect(josa("Google", "은/는")).toBe("Google은(는)");
    expect(josa("", "이/가")).toBe("이(가)");
    expect(josa("★", "과/와")).toBe("★과(와)");
    expect(josa("unknown", "으로/로")).toBe("unknown(으)로");
  });
});

describe("josa — 실데이터 전수 판정 가능", () => {
  const companies = companyRepository.getAll();

  it("회사명 430여 곳 전부 병기 없이 조사가 결정된다", () => {
    expect(companies.length).toBeGreaterThanOrEqual(400);
    const undecided = companies.map((c) => c.name.ko).filter((n) => josaParticle(n, "은/는").includes("("));
    expect(undecided).toEqual([]);
  });

  it("업종명·용어명 전부 병기 없이 조사가 결정된다", () => {
    const words = [
      ...new Set(companies.map((c) => industryLabelKo(c.industry))),
      ...glossaryData.map((g) => g.title),
    ];
    const undecided = words.filter((w) => josaParticle(w, "이/가").includes("("));
    expect(undecided).toEqual([]);
  });

  it("동일 급여 그룹 안내에 쓰이는 장점 첫 항목·대표 복지명도 판정된다", () => {
    // CompanySalaryGroupNotice 와 같은 선택 — 그룹 피어가 있는 회사의 pros[0]·금액 최대 복지
    const undecided: string[] = [];
    let checked = 0;
    for (const c of companies) {
      if (getSalaryGroupPeers(c).length === 0) continue;
      checked++;
      const firstPro = c.culture.pros[0];
      const topBenefit = [...c.benefits].sort((a, b) => (b.value ?? 0) - (a.value ?? 0))[0];
      if (firstPro && josaParticle(firstPro, "이/가").includes("(")) undecided.push(`${c.id}: ${firstPro}`);
      if (topBenefit && josaParticle(topBenefit.title, "이/가").includes("(")) {
        undecided.push(`${c.id}: ${topBenefit.title}`);
      }
    }
    expect(checked).toBeGreaterThan(0);
    expect(undecided).toEqual([]);
  });

  it("비교 페이지 문화 키워드 목록('…, K-pop'을)도 판정된다", () => {
    expect(josaParticle("소속사, 일본시장강자, K-pop", "을/를")).toBe("을");
    const undecided = companies
      .map((c) => c.culture.keywords.join(", "))
      .filter((k) => josaParticle(k, "을/를").includes("("));
    expect(undecided).toEqual([]);
  });
});
