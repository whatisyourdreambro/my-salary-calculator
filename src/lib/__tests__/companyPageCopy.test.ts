// /salary-db/[id] 회사 페이지 문구 회귀 가드 (2026-09-25 B12 — PROD-03·A22·COMP-05/06/07/09/10/12)
//
// 430여 쪽을 실제로 렌더(react-dom/server)해 본문·FAQ·JSON-LD 문구를 고정한다.
//  - PROD-03: '삼성전자은(는)' 같은 조사 병기 자리표시 0건, 회사명 바로 뒤 조사가 받침과 일치
//  - A22: 상위 50% 밖 회사는 전국 순위 숫자 대신 구간 라벨(중위권·중하위권)
//  - COMP-06/09/10/12/07/05: '최신' 단정·근무시간 단정·'공개 후기'·지주회사 평균 오해·잠정합의서·공시 라벨
// 광고·쿠팡·추적·차트 컴포넌트는 빈 요소로 대체(문구 검사 대상 아님, 광고 코드는 건드리지 않는다).
import { createElement, type ReactNode } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

const { stub } = vi.hoisted(() => ({ stub: () => null }));
vi.mock("@/components/AdPlacement", () => ({
  HomeTopAd: stub,
  CalcResultAd: stub,
  GuideMidAd: stub,
  SidebarAd: stub,
  InArticleAd: stub,
  MultiplexAd: stub,
  Display2Ad: stub,
  ResultAd: stub,
}));
vi.mock("@/components/CoupangBanner", () => ({ default: stub }));
vi.mock("@/components/AppLink", () => ({
  default: ({ children, ...props }: { children: ReactNode }) => createElement("a", props, children),
}));
vi.mock("next/dynamic", () => ({ default: () => stub }));
vi.mock("next/navigation", () => ({
  usePathname: () => "/salary-db",
  useRouter: () => ({ push() {}, replace() {}, prefetch() {} }),
  useSearchParams: () => new URLSearchParams(),
  permanentRedirect: () => {
    throw new Error("redirect");
  },
}));
vi.mock("@/components/ShareButtons", () => ({ default: stub }));
vi.mock("@/components/FavoritesButton", () => ({ default: stub }));
vi.mock("@/components/SalaryLookupTracker", () => ({ default: stub }));
vi.mock("@/components/PrivateFeedback", () => ({ default: stub }));
vi.mock("@/components/RelatedCalculators", () => ({ default: stub }));

import CompanyDetailPage from "@/app/salary-db/[id]/page";
import { companyRepository } from "@/lib/salary-data/CompanyRepository";
import { getOverallRank } from "@/lib/companyContentBuilder";
import { josaParticle } from "@/lib/josa";

const companies = companyRepository.getAll();
const render = (id: string) =>
  renderToStaticMarkup(
    createElement(CompanyDetailPage as unknown as (p: { params: { id: string } }) => ReactNode, { params: { id } }),
  );
const pages = new Map(companies.map((c) => [c.id, render(c.id)]));

function toText(html: string): string {
  return html
    // strong·a 는 붙이고(이름<strong>…</strong>조사 인접 유지), span 은 배지(예: '이 회사')라 띄운다
    .replace(/<\/?(strong|a|b|em)\b[^>]*>/g, "")
    .replace(/<[^>]+>/g, " ")
    .replace(/&apos;|&#x27;|&#39;/g, "'")
    .replace(/&quot;|&ldquo;|&rdquo;/g, '"')
    .replace(/&amp;/g, "&");
}

const escapeRe = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const PAIR_OF: Record<string, "은/는" | "이/가" | "과/와" | "을/를"> = {
  은: "은/는",
  는: "은/는",
  이: "이/가",
  가: "이/가",
  과: "과/와",
  와: "과/와",
  을: "을/를",
  를: "을/를",
};
const PLACEHOLDER = /은\(는\)|이\(가\)|과\(와\)|와\(과\)|을\(를\)|\(으\)로/;

describe("회사 페이지 전수 — 조사 (PROD-03)", () => {
  it("렌더 HTML(본문·FAQ·JSON-LD)에 조사 병기 자리표시가 0건", () => {
    expect(companies.length).toBeGreaterThanOrEqual(400);
    const hits: string[] = [];
    for (const [id, html] of pages) {
      const m = toText(html).match(new RegExp(`.{0,20}(${PLACEHOLDER.source}).{0,10}`));
      if (m) hits.push(`${id}: ${m[0]}`);
    }
    expect(hits.slice(0, 20)).toEqual([]);
  });

  it("회사명 바로 뒤 은/는·이/가·과/와·을/를이 받침과 일치", () => {
    const bad: string[] = [];
    let checked = 0;
    for (const c of companies) {
      const text = toText(pages.get(c.id)!);
      const name = c.name.ko;
      const re = new RegExp(`${escapeRe(name)}([은는이가과와을를])(?=[\\s.,?!'"·)]|$)`, "g");
      for (const m of text.matchAll(re)) {
        checked++;
        const expected = josaParticle(name, PAIR_OF[m[1]]);
        if (m[1] !== expected) bad.push(`${c.id}: ${name}${m[1]} (기대 ${expected})`);
      }
    }
    expect(checked).toBeGreaterThan(companies.length * 3);
    expect(bad.slice(0, 20)).toEqual([]);
  });

  it("라이브에서 확인된 오류 문장이 삼성전자 페이지에서 사라지고 올바른 조사로 바뀐다", () => {
    const text = toText(pages.get("samsung-electronics")!);
    expect(text).not.toContain("삼성전자은");
    expect(text).not.toContain("삼성전자이(가)");
    expect(text).toContain("삼성전자는 국내 반도체·디스플레이 업종");
    expect(text).toContain("삼성전자가 본인 커리어에 맞는");
  });
});

describe("전국 순위 표기 — 상위 50% 밖은 구간 라벨 (A22)", () => {
  it("상위 50% 밖 회사는 '개사 중 N위' 숫자 없이 중위권·중하위권, 상위 50% 이내는 숫자 순위 유지", () => {
    let labeled = 0;
    let ranked = 0;
    for (const c of companies) {
      const rank = getOverallRank(c);
      if (!rank) continue;
      const text = toText(pages.get(c.id)!);
      if (rank.topPercent > 50) {
        labeled++;
        expect(text, c.id).not.toMatch(new RegExp(`국내 ${rank.total}개사 중 ${rank.rank}위`));
        expect(text, c.id).not.toMatch(new RegExp(`${rank.rank}위에 위치합니다`));
        expect(text, c.id).toMatch(/개사 중 (중위권|중하위권)/);
        expect(text, c.id).toMatch(/(중위권|중하위권)에 위치합니다/);
      } else {
        ranked++;
        expect(text, c.id).toContain(`국내 ${rank.total}개사 중 ${rank.rank}위`);
        expect(text, c.id).toContain(`상위 ${rank.topPercent}% 구간에 위치합니다`);
      }
    }
    expect(labeled).toBeGreaterThan(100);
    expect(ranked).toBeGreaterThan(100);
  });

  it("삼성전자(국내 252위 → 상위 60%)는 '중위권'", () => {
    const rank = getOverallRank(companyRepository.getById("samsung-electronics")!)!;
    expect(rank.topPercent).toBeGreaterThan(50);
    expect(toText(pages.get("samsung-electronics")!)).toContain(`국내 ${rank.total}개사 중 중위권`);
  });
});

describe("추정치 정직성 문구 (COMP-05·06·07·09·10·12)", () => {
  it("COMP-06: FAQ가 '네'로 최신이라 단정하지 않고, 세법 기준·추정치·공시 사업연도를 구분한다", () => {
    for (const c of companies) {
      const text = toText(pages.get(c.id)!);
      expect(text, c.id).not.toContain("네. 본 페이지의");
      expect(text, c.id).toContain("실수령액은 2026년 세법·4대보험 요율(2026-07 반영)로 자동 계산합니다.");
      expect(text, c.id).not.toContain("연봉 데이터 최종 업데이트");
    }
    const withDisclosed = companies.find((c) => c.disclosed)!;
    expect(toText(pages.get(withDisclosed.id)!)).toContain("공시 평균연봉은 표시된 사업연도 기준입니다.");
  });

  it("COMP-09: 주당 근무시간 FAQ는 DB 입력 참고값임을 밝힌다(52시간 초과 입력 회사 포함)", () => {
    for (const c of companies) {
      const text = toText(pages.get(c.id)!);
      expect(text, c.id).toContain(`머니샐러리 DB 입력 참고값 기준 약 ${c.workLife.weeklyHours.real}시간(공식 통계·회사 공시 아님)`);
      expect(text, c.id).not.toContain("평균 주당 근무시간은 약");
      expect(text, c.id).not.toContain("위치를 실제 수치로");
    }
  });

  it("COMP-10: Dataset JSON-LD 설명에서 저장된 출처가 없는 '공개 후기' 삭제", () => {
    for (const [id, html] of pages) expect(html, id).not.toContain("공개 후기");
  });

  it("COMP-12: 지주회사 본사 공시 6곳은 계열사 평균이 아님을 노트에 명시(덧붙이지 않고 교체)", () => {
    for (const id of ["kb-financial", "hd-hyundai", "sk-square", "nice-holdings", "bnk-financial", "jb-financial"]) {
      const c = companyRepository.getById(id)!;
      // 통합(2026-09-25): B13 A19 산정 기준 반영 — 공시 1인평균 기준(reported)은 괄호를 줄인 문구(종전 길이 이하)
      expect(c.disclosed?.note, id).toMatch(
        c.disclosed?.basis === "reported"
          ? /^지주회사 본사 직원 [\d,]+명 기준\(계열사 미포함\)\. 1인평균급여액을 인원 가중 평균\(등기임원 제외\)\.$/
          : /^지주회사 본사 직원 [\d,]+명 기준\(계열사 직원 평균 아님\)\. 연간급여총액÷인원 가중\(등기임원 제외\)\.$/
      );
      expect(c.name.ko, id).not.toContain("지주회사 본사"); // 회사명(동결 title 원천) 불변
    }
    // 그 외 DART 주입사는 기존 노트 형식 그대로 — 통합(2026-09-25): B13 A19 로 기준별 문구
    // ('사업부문·성별로 공시된 1인평균급여액…' / '사업부문·성별 구분 공시를 연간급여총액÷인원…')
    const other = companies.find((c) => c.disclosed?.note?.startsWith("직원 ") && c.disclosed.note.includes("사업부문·성별"));
    expect(other).toBeDefined();
  });

  it("COMP-07: '(2026)'은 삼성전자·SK하이닉스 CL 표에만, 삼성 박스는 타결 합의서", () => {
    for (const c of companies) {
      if (!c.careerLevels?.length) continue;
      const text = toText(pages.get(c.id)!);
      if (c.id === "samsung-electronics" || c.id === "sk-hynix") {
        expect(text, c.id).toContain(`${c.name.ko} CL 직급별 연봉 (2026)`);
      } else {
        // 연도 대신 같은 폭의 '(공개 자료)' — 제목 줄 수·Display2Ad 위치 불변
        expect(text, c.id).toContain(`${c.name.ko} 직급별 세부 연봉 (공개 자료)`);
        expect(text, c.id).not.toContain("직급별 세부 연봉 (2026)");
      }
    }
    const samsung = toText(pages.get("samsung-electronics")!);
    expect(samsung).not.toContain("잠정합의서");
    expect(samsung).toContain("2026년 임금협약 타결 합의서 — 핵심 변경사항");
  });

  it("COMP-05: SK하이닉스 공시 노트는 DART 추이표와 충돌하는 전년 값(1억1,700만원)을 쓰지 않는다", () => {
    const sk = companyRepository.getById("sk-hynix")!;
    expect(sk.disclosed?.note).not.toContain("1억1,700만원");
    expect(sk.disclosed?.note).not.toContain("58.1%");
    // 추이표 머리글·상장 순위 배지는 급여총액÷인원 산정 기준임을 표기 (헤드라인 수기값과 구분)
    const html = pages.get("sk-hynix")!;
    // 통합(2026-09-25): 표 머리글은 B13 A19 배지 '(급여총액÷인원)' 과 같은 이름
    expect(html).toContain(">급여총액÷인원</th>");
    expect(html).not.toContain(">공시 평균연봉</th>");
    expect(html).not.toContain("DART 공시 기준</span>");
  });
});
