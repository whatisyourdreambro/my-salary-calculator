// SK하이닉스 인센티브 범위 — 폐지된 PS 옛 상한 '최대 50%'를 '최대 150%'로 (N2-data-07 1번, data-b06-M01,
// 운영자 승인 2026-11-18 C-4 — 광고가 내려가지 않을 때만 유지, 이 커밋 하나로 되돌릴 수 있다)
//
// 종전 incentive.max 50 은 PS 옛 상한(월 기본급의 1,000% = 연봉의 최대 50% 가량, 이투데이 2023-02-01)이다. 노사가 2025년
// 하반기 이 상한을 폐지했고, 2025년분 PS 는 2,964%로 책정돼 연봉 1억원 직원이 1억4,820만원(연봉의 약 148%)을 받았다
// (뉴시스 2026-02-04). DB 의 평균 성과급 비율(avgAmount/base 51.0~57.7%)도 이미 옛 max 50 을 넘어 있었다.
// 화면: /salary-db/sk-hynix Quick Stats 4번째 칸 '인센티브 범위 최대 N%'(CalcResultAd 바로 위),
//       비교 3쪽(nvidia-vs-sk-hynix, samsung-display-vs-sk-hynix, sk-hynix-vs-semes) 본문 '타깃 50%·최대 N%'(InArticleAd 위)와
//       '인센티브 타깃·최대' 행 'N% / N%'(CalcResultAd 위, grid-cols-3 같은 폭 칸). 모두 entry 값만 찍힌다.
// 숫자가 한 자리 늘어(+898 글꼴 단위) 광고 위가 넓어지는 정정이다 — 통합 스윕이 광고 위치를 판정한다.
import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { companyRepository } from "@/lib/salary-data/CompanyRepository";

const hynix = () => {
  const c = companyRepository.getById("sk-hynix");
  if (!c) throw new Error("sk-hynix 없음");
  return c;
};

describe("N2-data-07 1번 SK하이닉스 incentive.max", () => {
  it("신입·주니어·시니어·리드 max 는 150, 임원은 종전 50 그대로, target 은 종전 50 그대로", () => {
    const s = hynix().salary;
    for (const lv of ["entry", "junior", "senior", "lead"] as const) {
      expect(s[lv].incentive.max, lv).toBe(150);
      expect(s[lv].incentive.target, lv).toBe(50);
    }
    expect(s.executive.incentive.max).toBe(50);
  });

  it("평균 성과급 비율(avgAmount/base)이 새 max 아래에 있다 — 종전 max 50 은 이 비율보다 작았다", () => {
    const s = hynix().salary;
    for (const lv of ["entry", "junior", "senior", "lead"] as const) {
      const ratio = ((s[lv].incentive.avgAmount ?? 0) / s[lv].base) * 100;
      expect(ratio, lv).toBeGreaterThan(50);
      expect(ratio, lv).toBeLessThan(s[lv].incentive.max);
    }
  });

  it("데이터 옆 주석에 두 보도 출처가 있다", () => {
    const src = readFileSync("src/data/seedCompanies.ts", "utf8");
    const at = src.indexOf('id: "sk-hynix"');
    const block = src.slice(at, src.indexOf("careerLevels:", at));
    expect(block).toContain("https://www.etoday.co.kr/news/view/2217429");
    expect(block).toContain("https://www.newsis.com/view/NISX20260204_0003502924");
    expect(block).toContain("2,964%");
    expect(block.match(/max: 150,/g)).toHaveLength(4);
  });

  it("화면 문구는 entry 값으로 만든다 — 회사 Quick Stats '최대 150%', 비교 페이지 '최대 150%'·'50% / 150%'", () => {
    const client = readFileSync("src/app/salary-db/[id]/CompanyDetailClient.tsx", "utf8");
    expect(client).toContain("`최대 ${company.salary.entry.incentive.max}%`");
    const compare = readFileSync("src/app/salary-db/compare/[slug]/page.tsx", "utf8");
    expect(compare).toContain("{a.salary.entry.incentive.target}% / {a.salary.entry.incentive.max}%");
    const e = hynix().salary.entry.incentive;
    expect(`최대 ${e.max}%`).toBe("최대 150%");
    expect(`${e.target}% / ${e.max}%`).toBe("50% / 150%");
  });
});
