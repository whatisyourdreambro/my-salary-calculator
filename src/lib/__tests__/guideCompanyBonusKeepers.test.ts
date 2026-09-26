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
  PS_HISTORY_CORRECTIONS,
  PS_HISTORY_GUIDE,
  SK_2026_H1_MARGIN_PCT,
  TAI_RATES_2026_H1,
  basePct,
  bonusNet2026,
  fixedManwon,
  manKo,
  opTrilKo,
  opi2025,
  pct,
  piRateForMargin,
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
    for (const bad of ["1억 3,750만", "영끌", "250% 가능", "6월·12월", "150만 절감", "초과이익성과금", "2027년 1월 지급분부터"]) expect(t, bad).not.toContain(bad);
  });

  it("특별경영성과급은 연도별 DS 영업이익 조건(2026~2028년 200조원, 2029~2035년 100조원)과 함께 쓴다", () => {
    const c = content(slug);
    expect(c).toContain("2026~2028년에는 200조원, 2029~2035년에는 100조원 이상이어야 지급");
    expect(c).toContain("2026년 DS부문 영업이익이 200조원 이상이어야 지급");
    expect(c).toContain("초과이익성과급");
  });
});

describe("SK하이닉스 PS 키퍼", () => {
  const slug = "sk-hynix-ps-history-2026-prospect";

  it("PS 이력은 psData 에 공식 실적·회사 인용 보도 보정(2022 820%·7.0조, 2024 23.5조)을 덮은 값이다", () => {
    const c = content(slug);
    expect(PS_HISTORY_GUIDE.map((r) => r.year)).toEqual(PS_HISTORY.map((r) => r.year));
    for (const r of PS_HISTORY_GUIDE) {
      const ps = r.psRatePct == null ? "—" : `${pct(r.psRatePct)}%`;
      expect(c, String(r.year)).toContain(`<tr><td>${r.year}</td><td>${ps}</td>`);
      expect(c, `${r.year} 영업이익`).toContain(`<td>${opTrilKo(r.opTril)}</td>`);
    }
    // 이투데이 2023-02-01 회사 인용 · SK하이닉스 뉴스룸 2023-02-01(7조 66억원) · 회사 2025-01-23(23조 4,673억원)
    expect(c).toContain("<tr><td>2022</td><td>820%</td>");
    expect(c).toContain("<td>7.0조원</td>");
    expect(c).toContain("<td>23.5조원</td>");
    for (const bad of ["<td>600%</td>", "<td>6.8조원</td>", "<td>23.4조원</td>"]) expect(c, bad).not.toContain(bad);
    const n = AGREEMENT_2026.newSplit;
    expect(c).toContain(`현금 ${n.cashNowPct}% + 자사주 ${n.stockNowPct}%`);
    expect(AGREEMENT_2026.status).toBe("ratified");
    expect(c).toContain(`2025년 사업보고서 기준 ${headline("sk-hynix").text}`);
  });

  it("보정표는 psData 와 다른 값만 둔다 — psData 가 고쳐지면 보정 항목을 지울 것", () => {
    for (const [year, fix] of Object.entries(PS_HISTORY_CORRECTIONS)) {
      const src = PS_HISTORY.find((r) => r.year === Number(year));
      expect(src, year).toBeDefined();
      const stale = Object.entries(fix).filter(([k, v]) => (src as Record<string, unknown>)[k] === v).map(([k]) => k);
      expect(stale, `${year} 보정 항목이 이미 psData 와 같다`).toEqual([]);
    }
  });

  it("2025년 실적분 이연 20% 선지급(2026-09-16 가결)을 반영하고 세후 표는 PS 전액 기준 엔진 출력과 같다", () => {
    const c = content(slug);
    const ps2025 = PS_HISTORY_GUIDE.find((r) => r.year === 2025)!.psRatePct as number;
    for (const salary of [60_000_000, 80_000_000, 100_000_000, 120_000_000]) {
      const total = (salary / BASIC_RATIO) * (ps2025 / 100);
      const r = bonusNet2026(salary, total);
      expect(c).toContain(`<tr><td>${manKo(salary)}</td><td>${manKo(total)}</td><td>${manKo(r.totalDeductions)}</td><td>${manKo(r.net)}</td><td>${r.effectiveRate}%</td></tr>`);
    }
    expect(c).toContain("2026년 안에 앞당겨");
    for (const bad of ["나머지는 2027년과 2028년에", "이연분은 실제로 받는 해의 급여와 함께", "2026년 지급분</th>"]) expect(c, bad).not.toContain(bad);
  });

  it("상반기 PI 는 회사 분기 실적의 영업이익률을 구간표에 넣은 값이고, 근거 없는 7/28 지급일을 쓰지 않는다", () => {
    const c = content(slug);
    expect(SK_2026_H1_MARGIN_PCT).toBe(74);
    expect(piRateForMargin(SK_2026_H1_MARGIN_PCT)).toBe(150);
    expect(c).toContain(`구간 기준을 적용하면 상반기 PI는 최대치인 ${piRateForMargin(SK_2026_H1_MARGIN_PCT)}%`);
    expect(c).toContain("7월 30일 지급 예정으로 보도");
    for (const bad of ["7월 28일", "2026-07-28"]) expect(c, bad).not.toContain(bad);
  });

  it("2021다219994 는 2015년 무렵 노사합의 방식 성과급 판결이라는 시점 한정이 붙는다", () => {
    const c = content(slug);
    expect(c).toContain("2016년 2월에 퇴직한 직원들이 2015년에 받은 성과급");
    expect(c).not.toContain("결론이 확정됐습니다");
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
    // 뉴스웨이 2026-02-04 "최대 75%" — 정률로 단정하지 않는다
    expect(t).toContain(`기본급의 최대 ${basePct("lgensol", 2025)}%`);
    expect(t).not.toMatch(new RegExp(`기본급(의)? ${basePct("lgensol", 2025)}%`));
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
    expect(c).toContain(`2025년 실적분 최대 ${basePct("lgensol", 2025)}%`);
    expect(text(slug)).not.toMatch(new RegExp(`(LG엔솔|LG에너지솔루션|기본급의) ${basePct("lgensol", 2025)}%`));
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
    // 2020다247190: 근무일수 조건은 소정근로일수 이내일 때만 통상임금성을 부정하지 않는다
    expect(c).toContain("소정근로일수 이내");
    expect(c).toContain("소정근로일수를 넘는 근무일수");
    expect(c).not.toContain("재직·근무일수 조건이 붙어도");
    for (const bad of ["평생 1억", "평생 임금", "25% 증가"]) expect(c, bad).not.toContain(bad);
  });
});
