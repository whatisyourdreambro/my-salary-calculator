// 2차 키퍼 — 회사 성과급 묶음 5편(2026-09-26 G2B) 수치 회귀 방지.
// 본문 수치는 계산기와 같은 데이터 모듈(opiData·taiData·psData·bonusData)·DART 공시·성과급 엔진(2026 요율)에서
// 끼워 넣는다. 이 테스트는 (1) 본문이 그 값과 같은지, (2) 회사 페이지 헤드라인 평균 급여와 같은지,
// (3) 재작성 전 틀린 문구가 돌아오지 않는지를 본다. 데이터 모듈이 바뀌면 여기서 실패하니 본문 문맥도 함께 볼 것.
import { describe, expect, it } from "vitest";
import { koGuides } from "@/lib/guidesContent";
import { formatManwonKorean } from "@/lib/manwonFormat";
import { companyRepository } from "@/lib/salary-data/CompanyRepository";
import { dartDisclosed } from "@/data/dart/dartDisclosed";
import {
  AGREEMENT_2026,
  BASIC_RATIO,
  OPI_ACTUAL_2025,
  PS_HISTORY,
  TAI_RATES_2026_H1,
  basePct,
  bonusNet2026,
  fixedManwon,
  manKo,
  opi2025,
  pct,
} from "@/lib/guides/bonusKeeperFigures";

const content = (slug: string) => {
  const g = koGuides.find((x) => x.slug === slug);
  if (!g) throw new Error(`missing guide ${slug}`);
  return g.content;
};
const text = (slug: string) => {
  const g = koGuides.find((x) => x.slug === slug)!;
  return `${g.title}\n${g.description}\n${g.metaDescription ?? ""}\n${g.content}`;
};
/** 회사 페이지 헤드라인(수기 공시 우선, 없으면 DART 주입) — /salary-db/{id} 와 같은 값 */
const headline = (id: string) => {
  const d = companyRepository.getById(id)?.disclosed;
  if (!d) throw new Error(`no disclosed for ${id}`);
  return { text: formatManwonKorean(d.avgSalaryManwon), fiscalYear: d.fiscalYear };
};

describe("삼성전자 OPI·TAI 키퍼", () => {
  const slug = "samsung-opi-tai-complete-2026";

  it("OPI·TAI 지급률은 계산기 데이터와 같다", () => {
    const c = content(slug);
    expect(c).toContain(OPI_ACTUAL_2025.payDateLabel);
    for (const r of OPI_ACTUAL_2025.rates) expect(c, r.id).toContain(`<td>${r.division}</td><td>${r.rate}%</td>`);
    for (const r of TAI_RATES_2026_H1) expect(c, r.id).toContain(`<td>${r.division}</td><td>${r.group}</td><td>${r.rate}%</td>`);
  });

  it("세후 표는 성과급 엔진(2026 요율) 출력과 같다", () => {
    const c = content(slug);
    const ds = opi2025("ds-common").rate;
    for (const salary of [60_000_000, 80_000_000, 100_000_000]) {
      const gross = (salary * ds) / 100;
      expect(c).toContain(`${manKo(gross)} → ${manKo(bonusNet2026(salary, gross).net)}`);
    }
    expect(c).toContain(`세후는 약 ${manKo(bonusNet2026(80_000_000, 4_000_000).net)}`);
    expect(c).toContain(`2025년 사업보고서 ${headline("samsung-electronics").text}`);
  });

  it("옛 과장·오류 문구가 없다", () => {
    const t = text(slug);
    for (const bad of ["1억 3,750만", "영끌", "250% 가능", "6월·12월", "150만 절감"]) expect(t, bad).not.toContain(bad);
  });
});

describe("SK하이닉스 PS 키퍼", () => {
  const slug = "sk-hynix-ps-history-2026-prospect";

  it("PS 이력·가결 조건은 psData 와 같다", () => {
    const c = content(slug);
    for (const r of PS_HISTORY) {
      const ps = r.psRatePct == null ? "—" : `${pct(r.psRatePct)}%`;
      expect(c, String(r.year)).toContain(`<tr><td>${r.year}</td><td>${ps}</td>`);
    }
    const n = AGREEMENT_2026.newSplit;
    expect(c).toContain(`현금 ${n.cashNowPct}% + 자사주 ${n.stockNowPct}%`);
    expect(AGREEMENT_2026.status).toBe("ratified");
    expect(c).toContain(`2025년 사업보고서 기준 ${headline("sk-hynix").text}`);
  });

  it("세후 표는 성과급 엔진(2026 요율) 출력과 같다", () => {
    const c = content(slug);
    const ps2025 = PS_HISTORY.find((r) => r.year === 2025)!.psRatePct as number;
    for (const salary of [60_000_000, 80_000_000, 100_000_000, 120_000_000]) {
      const total = (salary / BASIC_RATIO) * (ps2025 / 100);
      const now = (total * AGREEMENT_2026.oldSplit.cashNowPct) / 100;
      const r = bonusNet2026(salary, now);
      expect(c).toContain(`<tr><td>${manKo(salary)}</td><td>${manKo(total)}</td><td>${manKo(now)}</td><td>${manKo(r.net)}</td><td>${r.effectiveRate}%</td></tr>`);
    }
  });

  it("전망을 사실처럼 쓰지 않는다", () => {
    const t = text(slug);
    for (const bad of ["2,000% 가능", "컨센서스", "7억", "9,200만원", "1,500%+"]) expect(t, bad).not.toContain(bad);
  });
});

describe("LG에너지솔루션 키퍼 (엔티티 형식)", () => {
  const slug = "lgensol-wage-negotiation-2026";

  it("첫 표는 DART 급여총액÷인원 이력과 같다", () => {
    const c = content(slug);
    const entry = dartDisclosed.find((e) => e.corpCode === "01515323")!;
    const rows = [
      { fiscalYear: entry.fiscalYear, avgSalaryManwonRaw: entry.avgSalaryManwonRaw, employeeCount: entry.employeeCount },
      ...(entry.history ?? []),
    ];
    expect(rows.length).toBeGreaterThanOrEqual(3);
    for (const h of rows.slice(0, 3)) {
      expect(c, h.fiscalYear).toContain(`<tr><td>${h.fiscalYear}</td><td>${formatManwonKorean(h.avgSalaryManwonRaw)}</td><td>${h.employeeCount.toLocaleString("en-US")}명</td>`);
    }
    // 첫 표의 첫 행(가장 최근 사업연도)이 본문 첫 표 안에 있다
    const firstTable = c.slice(c.indexOf("<table"), c.indexOf("</table>"));
    expect(firstTable).toContain(`<td>${entry.fiscalYear}</td>`);
  });

  it("성과급·평균 급여는 계산기 데이터·회사 페이지 헤드라인과 같다", () => {
    const t = text(slug);
    expect(t).toContain(`기본급의 ${basePct("lgensol", 2025)}%`);
    expect(t).toContain(`${basePct("lgensol", 2024)}%`);
    const h = headline("lgensol");
    expect(h.fiscalYear).toBe("2025");
    expect(t).toContain(`약 ${h.text}`);
    for (const id of ["lgensol", "lg-chem", "samsung-sdi", "lgelectronics"]) {
      expect(headline(id).fiscalYear, id).toBe("2025");
      expect(t, id).toContain(`<td>${headline(id).text}</td>`);
    }
  });

  it("추정 연봉 구간·전망 인상률이 없다", () => {
    const t = text(slug);
    for (const bad of ["영끌", "5%+", "9,500만~1.2억", "캐즘 종료", "5만명"]) expect(t, bad).not.toContain(bad);
  });
});

describe("LG·현대차·기아·포스코 키퍼", () => {
  const slug = "lg-hyundai-posco-bonus-2026";

  it("회사별 성과급은 bonusData, 평균 급여는 회사 페이지 헤드라인과 같다", () => {
    const c = content(slug);
    expect(c).toContain(`2026 임금협상: ${basePct("hyundai", 2026)}% + ${pct(fixedManwon("hyundai", 2026))}만원`);
    expect(c).toContain(`2026 임단협: ${basePct("kia", 2026)}% + ${pct(fixedManwon("kia", 2026))}만원`);
    expect(c).toContain(`${basePct("hyundai", 2025)}% + ${pct(fixedManwon("hyundai", 2025))}만원 + 30주`);
    expect(c).toContain(`${basePct("kia", 2025)}% + ${pct(fixedManwon("kia", 2025))}만원 + 53주`);
    expect(c).toContain(`2025년 실적분 ${basePct("lg-display", 2026)}%`);
    for (const id of ["hyundai", "kia", "lgensol", "lg-display", "lgelectronics", "posco"]) {
      const h = headline(id);
      expect(h.fiscalYear, id).toBe("2025");
      expect(c, id).toContain(h.text);
    }
  });

  it("세후 표는 성과급 엔진(2026 요율) 출력과 같다", () => {
    const c = content(slug);
    for (const bonus of [10_000_000, 20_000_000, 30_000_000, 50_000_000]) {
      const r = bonusNet2026(80_000_000, bonus);
      expect(c).toContain(`<tr><td>${manKo(bonus)}</td><td>${manKo(r.totalDeductions)}</td><td>${manKo(r.net)}</td><td>${r.effectiveRate}%</td></tr>`);
    }
  });

  it("근거 없는 사업부 격차·주기 문구가 없고 포스코 기준 시점은 2026년 4월이다", () => {
    const t = text(slug);
    for (const bad of ["±50%", "600~1,200%", "분기 + 연말", "7,300만원"]) expect(t, bad).not.toContain(bad);
    expect(t).toContain("2026년 4월");
  });
});

describe("성과급·인센티브·격려금 키퍼", () => {
  const slug = "bonus-vs-incentive-vs-allowance-2026";

  it("격려금 예시는 엔진 값이고 '35% 점프' 오류를 바로잡는다", () => {
    const c = content(slug);
    const enc = bonusNet2026(60_000_000, 10_000_000);
    expect(c).toContain(`약 ${manKo(enc.totalDeductions)}, 세후는 약 ${manKo(enc.net)}`);
    expect(c).toContain("한계세율은 15%");
  });

  it("판례·법령 근거가 붙고 근거 없는 '평생 1억' 문구가 없다", () => {
    const c = text(slug);
    for (const need of ["2020다247190", "2021다248299", "2021다219994", "3/12"]) expect(c, need).toContain(need);
    for (const bad of ["평생 1억", "평생 임금", "25% 증가"]) expect(c, bad).not.toContain(bad);
  });
});
