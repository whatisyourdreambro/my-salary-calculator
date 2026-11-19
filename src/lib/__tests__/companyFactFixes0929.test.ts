// 회사 페이지 사실 정정 고정 (2026-09-29 SEO 새로고침 — company 묶음)
//
// 모든 정정은 광고 위 제자리 교체다. 폭 규칙:
//  - 표 안(직급별 연봉표 설명 칸)은 table 의 tabular-nums 상속이라 숫자끼리 바꾸면 폭이 같다.
//  - 표 밖 문단·목록은 비례 숫자라 숫자를 바꾸지 않고, 한글 음절은 한글 음절로만 바꾼다
//    (사이트 글꼴 한글 음절 폭은 모두 같다). 띄어쓰기 위치·글자 수·문장부호는 그대로 둔다.
// 문구를 다시 고칠 때는 폭 맞춤(글꼴 단위 합·글자 수)과 1,123폭 광고 위치 스윕을 다시 할 것.
import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { companyRepository } from "@/lib/salary-data/CompanyRepository";

/** 사이트 글꼴 서브셋 6종(Latin·Korean·KoreanExtra1~4)의 unicode-range 합집합 */
function siteFontCodepoints(): Set<number> {
  const source = readFileSync("src/app/fonts/siteFonts.generated.ts", "utf8");
  const ranges = [...source.matchAll(/prop: "unicode-range", value: "([^"]+)"/g)];
  const set = new Set<number>();
  for (const range of ranges) {
    for (const part of range[1].split(",")) {
      const [first, last = first] = part.trim().slice(2).split("-").map((v) => parseInt(v, 16));
      for (let code = first; code <= last; code++) set.add(code);
    }
  }
  return set;
}
const FONT = siteFontCodepoints();
function outsideFont(text: string): string[] {
  return [...new Set([...text].filter((ch) => ch.codePointAt(0)! > 127 && !FONT.has(ch.codePointAt(0)!)))];
}

/** 폭 서명 — 띄어쓰기로 나눈 단어마다 [한글 수, 숫자 수, 그 밖의 글자] */
function widthSignature(text: string): string {
  return text
    .split(" ")
    .map((word) => {
      const hangul = [...word].filter((ch) => /[가-힣]/.test(ch)).length;
      const digits = [...word].filter((ch) => /[0-9]/.test(ch)).length;
      const other = [...word].filter((ch) => !/[가-힣0-9]/.test(ch)).join("");
      return `${hangul}/${digits}/${other}`;
    })
    .join(" ");
}

function company(id: string) {
  const c = companyRepository.getById(id);
  if (!c) throw new Error(`missing company ${id}`);
  return c;
}

function careerStep(id: string, label: string) {
  const step = company(id).careerLevels?.flatMap((g) => g.steps).find((s) => s.label === label);
  if (!step) throw new Error(`missing step ${id} ${label}`);
  return step;
}

describe("CM-03 직급별 연봉표 평균 근속 — 2025 사업보고서 값", () => {
  it("카카오 크루 평균 근속은 DART 2025 '6년 3개월'(공시 카드 6.25년과 일치)", () => {
    const step = careerStep("kakao", "크루 (전사 평균)");
    expect(step.description.startsWith("평균 근속 6년3개월. 2025년 사업보고서 기준")).toBe(true);
    expect(step.description).not.toContain("5년6개월");
    expect(company("kakao").disclosed?.avgTenureYears).toBe(6.25);
  });

  it("네이버 팀원 평균 근속은 DART 2025 7.7년(7년8개월)", () => {
    const step = careerStep("naver", "팀원 (전사 평균)");
    expect(step.description.startsWith("평균 근속 7년8개월. 2025년 사업보고서(2026-03 공시)")).toBe(true);
    expect(step.description).not.toContain("7년4개월");
    expect(company("naver").disclosed?.avgTenureYears).toBe(7.7);
  });

  it("숫자만 숫자로 바꿨다 — 표 안 tabular-nums 라 폭 불변", () => {
    expect(widthSignature("평균 근속 6년3개월.")).toBe(widthSignature("평균 근속 5년6개월."));
    expect(widthSignature("평균 근속 7년8개월.")).toBe(widthSignature("평균 근속 7년4개월."));
  });
});

describe("히어로 소개문 사실 정정 — 한글 음절끼리 제자리 교체 (광고 위 폭 불변)", () => {
  it("CM-06 넷마블 최대주주는 방준혁(DART 2025 사업보고서, 24.12%) — 방시혁(하이브) 아님", () => {
    const d = company("netmarble").description;
    expect(d).toContain("방준혁(창업자) 최대주주, 글로벌 M&A 공격적 추진.");
    expect(d).not.toContain("방시혁");
    expect(widthSignature("방준혁(창업자) 최대주주,")).toBe(widthSignature("방시혁(하이브) 최대주주,"));
  });

  it("CM-08 오스템임플란트는 재상장이 아니라 2023년 공개매수 인수 후 상장폐지", () => {
    const c = company("osstem-implant");
    expect(c.description).toContain("2022년 회계 횡령 사건 후 인수돼, 중국·미국 등");
    expect(c.culture.pros).toContain("상폐된 후 거버넌스 개선 노력");
    expect(JSON.stringify(c)).not.toContain("재상장");
    expect(widthSignature("사건 후 인수돼,")).toBe(widthSignature("사건 후 재상장,"));
    expect(widthSignature("상폐된 후 거버넌스 개선 노력")).toBe(widthSignature("재상장 후 거버넌스 개선 노력"));
  });

  it("CM-14 카카오브레인 LLM·칼로 사업은 2024-06 카카오로 영업양수 — '선도' 현재형 제거", () => {
    const d = company("kakao-brain").description;
    expect(d).toContain("KoGPT·Karlo 개발사, 본사로 LLM·생성 AI 이관.");
    expect(d).not.toContain("일체");
    expect(widthSignature("본사로 LLM·생성 AI 이관.")).toBe(widthSignature("한국어 LLM·생성 AI 선도."));
    // R4 수리(2026-11-20, 사실 확인 bonus-1): 남은 법인은 2024-10-01 디케이테크인에 흡수합병돼 소멸(뉴시스 2024-08-25) —
    // 첫 마디의 현재형 '핵심 연구 조직' 도 같은 꼴(두 음절 한글 낱말 세 개)로 바꿨다.
    expect(d).toContain("카카오그룹 AI 연구 법인 소멸.");
    expect(d).not.toContain("핵심 연구 조직");
    expect(widthSignature("카카오그룹 AI 연구 법인 소멸.")).toBe(widthSignature("카카오그룹 AI 핵심 연구 조직."));
  });
});

describe("CM-21 서브셋 밖 한자 글리프 교체 (全·比 → 전·비)", () => {
  it("한컴 복지 설명·상장사 인상률 표 머리글·사이트 검색 설명", () => {
    const hancom = company("hancom");
    expect(hancom.benefits.map((b) => b.description)).toContain("임직원 한컴오피스 전제품 무상 제공");
    expect(outsideFont(hancom.benefits.map((b) => b.description).join(""))).toEqual([]);
    const topRaise = readFileSync("src/app/salary-db/listed/top-raise/page.tsx", "utf8");
    expect(topRaise).not.toContain("比");
    expect(topRaise.split("인상률(전년비)").length - 1).toBe(2);
    const search = readFileSync("src/lib/searchIndex.ts", "utf8");
    expect(search).toContain("공시 기준 전년비 인상률 순위");
  });
});

describe("CM-04 지주회사 본사 공시 4곳 — 공시 카드 note 를 같은 폭 지주회사 문구로", () => {
  it("포스코홀딩스·에코프로·쿠쿠홀딩스·HD한국조선해양(A8)은 본사 N명·계열사·자회사 제외를 밝힌다", () => {
    for (const [id, n] of [["posco", "524"], ["ecopro", "185"], ["cuckoo", "82"], ["hd-ksoe", "1,543"]] as const) {
      const note = company(id).disclosed?.note ?? "";
      expect(note, id).toBe(
        `본사 ${n}명 기준. 계열사·자회사를 제외한 1인평균급여액을 인원 가중 평균한 값(등기임원 제외).`
      );
      expect(widthSignature(note)).toBe(
        widthSignature(`직원 ${n}명 기준. 사업부문·성별로 공시된 1인평균급여액을 인원 가중 평균한 값(등기임원 제외).`)
      );
      expect(outsideFont(note)).toEqual([]);
    }
  });

  it("다른 DART 주입 회사·기존 지주회사 목록 문구는 그대로", () => {
    expect(company("hmm").disclosed?.note).toBe(
      "직원 1,933명 기준. 사업부문·성별로 공시된 1인평균급여액을 인원 가중 평균한 값(등기임원 제외)."
    );
    expect(company("kb-financial").disclosed?.note?.startsWith("지주회사 본사 직원 144명 기준(계열사 미포함).")).toBe(true);
  });
});

describe("정정 문구는 사이트 글꼴 서브셋 안의 글자만 쓴다", () => {
  it("CM-03", () => {
    expect(outsideFont(careerStep("kakao", "크루 (전사 평균)").description)).toEqual([]);
    expect(outsideFont(careerStep("naver", "팀원 (전사 평균)").description)).toEqual([]);
  });
  it("CM-06·08·14", () => {
    for (const id of ["netmarble", "osstem-implant", "kakao-brain"]) {
      const c = company(id);
      expect(outsideFont(c.description + c.culture.pros.join("") + c.culture.cons.join(""))).toEqual([]);
    }
  });
});
