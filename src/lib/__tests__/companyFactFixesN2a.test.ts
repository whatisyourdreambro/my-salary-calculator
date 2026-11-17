// 회사 쪽 사실 정정 고정 — N2-data-03 (R4, 2026-11-18)
//
// 사업·주주·소속·역사가 틀렸거나 자기 공시 카드와 어긋나던 회사 기록을 제자리에서 고쳤다.
// 모든 정정은 광고(CalcResultAd·CompanyTopAd·GuideMidAd·InArticleAd) 위 글자라 종전보다 넓어지면 안 된다.
// 폭 검사: 바뀐 부분(공통 앞·뒤를 뺀 가운데)의 글꼴 단위 합이 종전 이하. 글꼴 단위는 사이트 글꼴
// MoneySalaryText 기본 인스턴스의 advance(unitsPerEm 2048)를 fontTools 로 잰 값이다 — 한글 음절은 모두 1770,
// 숫자는 비례(1 이 가장 좁고 4 가 가장 넓다). 표에 없는 글자를 새로 쓰면 테스트가 실패한다(먼저 재고 표에 넣을 것).
// 공통 앞부분이 같고 가운데가 좁아지기만 하면 그 뒤 글자의 줄바꿈 위치는 같거나 앞당겨질 뿐 줄 수가 늘지 않는다.
// 회사 기록의 id·name·industry·tier·salary·lastUpdated 는 바꾸지 않는다(RL-19/34/35 선례).
import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { companyRepository } from "@/lib/salary-data/CompanyRepository";
import { allCompanies } from "@/data/companies";

/** 사이트 글꼴 서브셋 6종의 unicode-range 합집합 — 새 문구에 서브셋 밖 글자가 없어야 한다 */
function siteFontCodepoints(): Set<number> {
  const source = readFileSync("src/app/fonts/siteFonts.generated.ts", "utf8");
  const set = new Set<number>();
  for (const range of source.matchAll(/prop: "unicode-range", value: "([^"]+)"/g)) {
    for (const part of range[1].split(",")) {
      const [first, last = first] = part.trim().slice(2).split("-").map((v) => parseInt(v, 16));
      for (let code = first; code <= last; code++) set.add(code);
    }
  }
  return set;
}
const FONT = siteFontCodepoints();
const outsideFont = (text: string) =>
  [...new Set([...text].filter((ch) => ch.codePointAt(0)! > 127 && !FONT.has(ch.codePointAt(0)!)))];

/** MoneySalaryText 기본 인스턴스 advance (2026-11-18 fontTools 측정, unitsPerEm 2048) */
const ADVANCE: Record<string, number> = {
  "0": 1220, "1": 898, "2": 1202, "3": 1264, "4": 1278, "5": 1222, "6": 1256, "7": 1130, "8": 1242, "9": 1256,
  " ": 514, "·": 520, ",": 528, ".": 520, "(": 698, ")": 698, K: 1272,
};
const HANGUL = 1770;
function advance(ch: string, side: "after" | "before"): number {
  if (/[가-힣]/.test(ch)) return HANGUL;
  if (ch in ADVANCE) return ADVANCE[ch];
  // 종전 쪽 글자는 0 으로 쳐도(아래 한계) 비교가 엄격해질 뿐이다. 새 쪽 글자는 반드시 잰 값이 있어야 한다.
  if (side === "before") return 0;
  throw new Error(`advance 표에 없는 새 글자: ${JSON.stringify(ch)}`);
}

/** 공통 앞·뒤를 뺀 가운데 부분 */
function changedMiddle(after: string, before: string): { a: string; b: string } {
  const A = [...after];
  const B = [...before];
  let p = 0;
  while (p < A.length && p < B.length && A[p] === B[p]) p++;
  let s = 0;
  while (s < A.length - p && s < B.length - p && A[A.length - 1 - s] === B[B.length - 1 - s]) s++;
  return { a: A.slice(p, A.length - s).join(""), b: B.slice(p, B.length - s).join("") };
}

/** after 가 before 보다 넓지 않다 — 바뀐 가운데의 글꼴 단위 합 비교 */
function notWider(after: string, before: string): boolean {
  const { a, b } = changedMiddle(after, before);
  const width = (text: string, side: "after" | "before") =>
    [...text].reduce((sum, ch) => sum + advance(ch, side), 0);
  return width(a, "after") <= width(b, "before");
}

function company(id: string) {
  const c = companyRepository.getById(id);
  if (!c) throw new Error(`missing company ${id}`);
  return c;
}

/** 원본 데이터 기록(파생 전) — lastUpdated 불변 확인용 */
function rawRecord(id: string) {
  const rows = allCompanies.filter((c) => c.id === id);
  if (rows.length !== 1) throw new Error(`raw record ${id}: ${rows.length}`);
  return rows[0];
}

describe("폭 검사 도구 자체", () => {
  it("숫자는 비례 폭 — 7→8 과 130→140 은 넓어지고, 같은 음절 수 한글 교체는 같다", () => {
    expect(notWider("8개", "7개")).toBe(false);
    expect(notWider("140년", "130년")).toBe(false);
    expect(notWider("K2소총", "K2전차")).toBe(true);
    expect(notWider("가나다", "가나")).toBe(false);
  });
});

describe("data-b03-M01 SNT모티브 — 방산 부문은 K2 소총 등 소화기(K2 전차 변속기는 SNT다이내믹스)", () => {
  it("히어로·키워드·장점에서 K2전차를 K2소총으로, 모두 종전 이하 폭", () => {
    const c = company("snt-motiv");
    expect(c.description).toBe("K2소총·방산 부품 및 자동차 모터를 생산하는 방산·자동차 복합 부품사. SNT그룹 핵심 계열사.");
    expect(c.culture.keywords).toEqual(["방산", "K2소총", "자동차모터"]);
    expect(c.culture.pros[0]).toBe("K2소총 등 총기류로 방산 수요 안정적");
    expect(JSON.stringify(c)).not.toContain("K2전차");
    expect(notWider(c.description, "K2전차 변속기·방산 부품 및 자동차 모터를 생산하는 방산·자동차 복합 부품사. SNT그룹 핵심 계열사.")).toBe(true);
    expect(notWider("K2소총", "K2전차")).toBe(true);
    expect(notWider(c.culture.pros[0], "K2전차 핵심 부품으로 방산 수요 안정적")).toBe(true);
    expect(outsideFont(c.description + c.culture.keywords.join("") + c.culture.pros.join(""))).toEqual([]);
    expect(rawRecord("snt-motiv").lastUpdated).toBe("2026-05-15");
  });
});

describe("data-b03-F07 동아에스티 — 박카스는 동아제약 브랜드, 동아에스티는 전문의약품 회사", () => {
  it("장점의 박카스 브랜드 영업력을 전문의약품·병의원 영업력으로 — 종전보다 좁다", () => {
    const c = company("dong-a-st");
    expect(c.culture.pros[1]).toBe("전문의약품 중심의 탄탄한 병의원 영업력");
    expect(JSON.stringify(c.culture)).not.toContain("박카스 브랜드 기반");
    expect(notWider(c.culture.pros[1], "박카스 브랜드 기반의 강력한 의약품 영업력")).toBe(true);
    // 히어로의 박카스 형제사(동아제약 분리) 설명은 사실이라 그대로
    expect(c.description).toContain("박카스");
    expect(outsideFont(c.culture.pros[1])).toEqual([]);
    expect(rawRecord("dong-a-st").lastUpdated).toBe("2026-05-15");
  });
});

describe("data-b03-M04 일동제약 — 1941년 창립(2026년 85년째), 70년 역사 아님", () => {
  it("장점 첫 줄 80년 역사, 안정적인 -> 안정된 으로 숫자 폭 증가를 상쇄해 종전보다 좁다", () => {
    const c = company("il-dong-pharma");
    expect(c.culture.pros[0]).toBe("80년 역사의 안정된 브랜드와 매출 기반");
    expect(JSON.stringify(c.culture)).not.toContain("70년 역사");
    expect(notWider(c.culture.pros[0], "70년 역사의 안정적인 브랜드와 매출 기반")).toBe(true);
    expect(outsideFont(c.culture.pros[0])).toEqual([]);
    expect(rawRecord("il-dong-pharma").lastUpdated).toBe("2026-05-15");
  });
});

describe("data-b03-F02 보령제약(중복 기록) — 삼진제약 계열 아님, 현재 사명은 보령", () => {
  it("히어로 꼬리를 현재 사명 안내로 — 종전보다 좁다, canonical·별칭·redirect 는 그대로(2월 308 병합 몫)", () => {
    const c = company("boryung-pharmaceutical");
    expect(c.description).toBe("카나브(고혈압치료제) 글로벌 기술수출 성공 제약사. 현재 사명은 보령.");
    expect(JSON.stringify(c)).not.toContain("삼진제약");
    expect(notWider(c.description, "카나브(고혈압치료제) 글로벌 기술수출 성공 제약사. 삼진제약·보령바이오파마 계열.")).toBe(true);
    expect(c.name.ko).toBe("보령제약");
    expect(outsideFont(c.description)).toEqual([]);
    expect(rawRecord("boryung-pharmaceutical").lastUpdated).toBe("2026-05-15");
  });
});
