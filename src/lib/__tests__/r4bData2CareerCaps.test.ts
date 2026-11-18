// 직급표 셀러리캡·CAP 표시 — 출처 없는 숫자와 상한에 못 미친 칸의 CAP 배지 삭제 (N2-data-07 2번, data-b06-F05,
// 운영자 승인 2026-11-18 C-4 — 광고가 내려가지 않을 때만 유지, 이 커밋 하나로 되돌릴 수 있다)
//
// - 삼성전자 CL1 '셀러리캡 base 5,000만원': 출처 박스가 가리키는 아주경제 2026-05-21 보도에는 CL2(0.80억)·CL3(1.10억)·
//   CL4(1.30억)만 있고 CL1 은 없다(2026-11-18 다시 읽음). CL1 알약과 CL1-2(base 4,200만) CAP 배지를 지운다.
//   CL2~CL4 의 상한과 배지(base = 보도 상한)는 그대로.
// - SK하이닉스 셀러리캡 4개(8,000·9,000·11,000·14,000만원)는 출처가 없다(데이터 주석 '공개 자료 추정', 공개 보도 검색 0건).
//   알약 4개와, 상한보다 2,500만~4,200만원 낮은 칸에 붙은 CAP 배지 3개를 지우고, 출처·주의사항의 SK 항목에서
//   '셀러리캡(직급 상한) 표시는 보도·추정 기준 참고용.' 문장을 뺀다(삼성 OPI 줄은 다른 묶음 몫이라 손대지 않는다).
// 직급표는 GuideMidAd 아래·Display2Ad 위(회사 페이지만, 비교 페이지는 직급표를 그리지 않는다) — 지우기만 해서 짧아진다.
// 알약은 sm 이상에서 헤더 오른쪽, sm 미만에서 제목·안내 아래 줄에 놓인다(flex-col) — 어느 폭에서도 높이가 늘지 않는다.
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import CompanyCareerLevels from "@/components/CompanyCareerLevels";
import { companyRepository } from "@/lib/salary-data/CompanyRepository";

const get = (id: string) => {
  const c = companyRepository.getById(id);
  if (!c) throw new Error(`${id} 없음`);
  return c;
};
const html = (id: string) => renderToStaticMarkup(createElement(CompanyCareerLevels, { company: get(id) }));
const count = (s: string, sub: string) => s.split(sub).length - 1;

describe("N2-data-07 2번 — 셀러리캡 숫자·CAP 배지", () => {
  it("삼성전자: CL1 상한 없음·CL1 칸 배지 없음, CL2~CL4 보도 상한과 배지(base = 상한)는 그대로", () => {
    const groups = get("samsung-electronics").careerLevels!;
    const cl1 = groups.find((g) => g.group.startsWith("CL1"))!;
    expect(cl1.salaryCapManwon).toBeUndefined();
    expect(cl1.steps.some((s) => s.isCapReached)).toBe(false);
    const caps = Object.fromEntries(groups.filter((g) => g.salaryCapManwon).map((g) => [g.group.slice(0, 3), g.salaryCapManwon]));
    expect(caps).toEqual({ CL2: 8000, CL3: 11000, CL4: 13000 });
    for (const g of groups.filter((x) => x.salaryCapManwon)) {
      const capped = g.steps.filter((s) => s.isCapReached);
      expect(capped, g.group).toHaveLength(1);
      expect(capped[0].baseManwon, g.group).toBe(g.salaryCapManwon);
    }
  });

  it("SK하이닉스: 어느 직급에도 셀러리캡 숫자·CAP 배지가 없다", () => {
    for (const g of get("sk-hynix").careerLevels!) {
      expect(g.salaryCapManwon, g.group).toBeUndefined();
      expect(g.steps.some((s) => s.isCapReached), g.group).toBe(false);
    }
  });

  it("전 회사: CAP 배지는 상한이 있는 직급에서 base 가 그 상한 이상인 칸에만 붙는다", () => {
    const bad: string[] = [];
    for (const c of companyRepository.getAll()) {
      for (const g of c.careerLevels ?? []) {
        for (const s of g.steps) {
          if (!s.isCapReached) continue;
          if (typeof g.salaryCapManwon !== "number" || typeof s.baseManwon !== "number" || s.baseManwon < g.salaryCapManwon) {
            bad.push(`${c.id} ${g.group} ${s.label}`);
          }
        }
      }
    }
    expect(bad).toEqual([]);
  });

  it("렌더: SK하이닉스 직급표에 '셀러리캡'·CAP 배지가 없고 SK 주의 항목은 짧은 문장 하나", () => {
    const sk = html("sk-hynix");
    expect(sk).not.toContain("셀러리캡");
    expect(sk).not.toContain(">CAP<");
    expect(sk).toContain("<li>실제 연봉은 직무·고과·성과·연차별 호봉에 따라 ±15% 차이 가능.</li>");
    expect(sk).not.toContain("보도·추정 기준 참고용");
  });

  it("렌더: 삼성전자 직급표는 셀러리캡 알약 3개(CL2~CL4)·CAP 배지 3개, 출처 박스 문장은 그대로", () => {
    const sam = html("samsung-electronics");
    expect(count(sam, ">CAP<")).toBe(3);
    expect(count(sam, ">셀러리캡</span>")).toBe(3);
    expect(sam).not.toContain("base 5,000만원");
    expect(sam).toContain("셀러리캡 수치</strong>는 아주경제 2026-05-21 보도 기준.");
  });

  it("SK 주의 항목 정정은 출처 박스의 SK 분기 한 곳뿐 — 삼성 분기(OPI 줄 포함)는 그대로", () => {
    const src = readFileSync("src/components/CompanyCareerLevels.tsx", "utf8");
    expect(src).not.toContain("셀러리캡(직급 상한) 표시는 보도·추정 기준 참고용");
    expect(src).toContain("시 OPI 0% 지급 사례 있음(DS 사업부 2023년분).");
  });
});
