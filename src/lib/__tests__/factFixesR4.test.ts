// YMYL 사실 정정 회귀 가드 (2026-09-26 R4 ymyl-fact-fixes)
//
// 1) /qna 출산휴가·육아휴직 답변 (src/data/qnaData.ts)
//    - 출산전후휴가 급여 상한 2026년 월 220만원: korea.kr newsId=148957375(2025-12-31),
//      고용노동부 고시 제2025-124호(2025-12-30, moel.go.kr bbs_seq=20251201736).
//    - 배우자 출산(전후)휴가 20일 유급, 출산예정일 50일 전~출산 후 120일, 3회 분할:
//      남녀고용평등법 제18조의2(2026-09-18 시행, law.go.kr), korea.kr newsId=148970585,
//      moel.go.kr 보도자료 news_seq=19964(2026-09-17).
//    - 육아휴직 1년, 부모 모두 각 3개월 이상 사용 시 6개월 추가: 같은 법 제19조 제2항.
//    - 육아휴직 대상 만 8세 이하 또는 초등학교 2학년 이하, 임신 중 여성 사용 가능: 제19조 제1항.
//    - 육아휴직 미허용은 500만원 이하 벌금(과태료 아님): 같은 법 제37조 제4항 제4호.
//    - 우선지원 대상기업이 아닌 기업은 출산전후휴가 최초 60일을 사업주가 유급 처리:
//      근로기준법 제74조 제4항, 고용보험법 제76조 제1항 제1호.
//    - 육아휴직 신청 조건은 휴직과 급여를 나눈다. 휴직: 같은 회사(해당 사업) 계속근로 6개월
//      미만이면 사업주가 허용하지 않을 수 있다 — 남녀고용평등법 제19조 제1항 단서·같은 법
//      시행령 제10조(law.go.kr, 2026-09-18 시행본). 급여: 피보험 단위기간 합산 180일 이상 —
//      고용보험법 제70조 제1항. 고용보험 180일을 휴직 신청 요건으로 쓰면 180일은 채웠지만
//      지금 회사 근무가 6개월 미만인 사람에게 틀린 안내가 된다(parental-leave/faq.ts 4번과 일치).
// 2) /earned-income-credit 반기 신청 지급 시기·금액
//    - 상반기분(9월) 반기 신청은 연간 예상산정액의 35%를 12월에 지급, 나머지는 다음 해
//      6월 정산: 국세상담센터 call.nts.go.kr 반기신청 Q&A(mi=13042), korea.kr newsId=148971348.
//
// 광고 위치 보호: 모든 문구는 바꾼 문자열보다 길지 않게(글자 수) 정정했고, 320/375/414/1280px 에서
// 줄 수가 base 와 같도록 어휘를 골랐다(실측: 같은 CSS·폰트에서 블록 높이 동일). 예외는 두 개다.
// 타일 캡션 반기 지급 → 12월 지급(5 → 6자)은 한글 한 자(반)가 반각 숫자 두 자(12)로 바뀐 것이라
// 반각 가중 폭이 같다(4.5 = 4.5). 신청 절차 04 는 R4 최종 점검(320~1440px 1px 간격 전수)에서
// 35%·6월 이 377~379px 폭에서 줄을 바꿔 광고를 밀었기에 35%, 6월(33 → 34자)로 바꿔 렌더 폭을
// 옛 문구와 같게 맞췄다(245.66px vs 245.67px, 1,123폭 광고 위치 차이 0).
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { qnaData } from "@/data/qnaData";

const readSrc = (rel: string) => readFileSync(resolve(process.cwd(), rel), "utf8");
const qnaSrc = readSrc("src/data/qnaData.ts");
const eicSrc = readSrc("src/app/earned-income-credit/EarnedIncomeCreditContent.tsx");

const len = (s: string) => [...s].length;
// 반각 가중 폭: ASCII(숫자·영문·공백·기호)는 0.5, 그 밖(한글 등)은 1
const halfWidth = (s: string) => [...s].reduce((t, c) => t + (c.charCodeAt(0) < 128 ? 0.5 : 1), 0);

const findQna = (q: string) => qnaData.find((item) => item.question.includes(q));

type Pair = { name: string; before: string; beforeLen: number; after: string; afterLen: number };

const QNA_PAIRS: Pair[] = [
  {
    name: "출산전후휴가 상한",
    before: "상한 월 210만원",
    beforeLen: 10,
    after: "상한 월 220만원",
    afterLen: 10,
  },
  {
    name: "배우자 출산휴가 기간",
    before: "배우자(남성 근로자)는 20일(유급)로 확대되어, 출산일로부터 120일 이내에 나눠서 사용할 수 있습니다.",
    beforeLen: 59,
    after: "배우자(남성 근로자)는 20일(유급)이며, 출산예정일 50일 전부터 출산 후 120일 이내에 나눠 씁니다.",
    afterLen: 59,
  },
  {
    name: "출산휴가·육아휴직 결론",
    before: "출산휴가(90일, 유급)와 육아휴직(최대 1년)은 별개 제도입니다. 둘 다 사용 가능하며 순차적으로 이어서 쓰는 것이 일반적입니다.",
    beforeLen: 73,
    after: "출산휴가(90일, 유급)와 육아휴직(최대 1년 6개월)은 별개 제도입니다. 둘 다 사용 가능하며 이어서 쓰는 경우가 일반적입니다.",
    afterLen: 72,
  },
  {
    name: "급여 출처",
    before: "<strong>급여 출처:</strong> 출산전후휴가 급여는 고용보험에서, 육아휴직 급여도 고용보험에서 지급됩니다. 회사가 아닌 국가 재원입니다.",
    beforeLen: 82,
    after: "<strong>급여 출처:</strong> 두 급여 모두 고용보험에서 지급합니다. 다만 대규모기업은 출산전후휴가 최초 60일분을 회사가 지급합니다.",
    afterLen: 82,
  },
  {
    name: "육아휴직 사용 기간",
    before: "<strong>사용 기간:</strong> 자녀 1명당 최대 1년(부모 각각 1년씩, 총 2년). 한 번에 몰아 쓰거나 3회까지 분할 사용 가능.",
    beforeLen: 81,
    after: "<strong>사용 기간:</strong> 부모 각 1년(둘 다 3개월 이상 쓰면 각 1년 6개월). 한 번에 몰아 쓰거나 3회까지 분할 가능.",
    afterLen: 80,
  },
  {
    name: "육아휴직 사용 시점",
    before: "<strong>사용 시점:</strong> 출산 전후 자유롭게 사용 가능. 만 8세 생일 이전까지만 사용해야 합니다.",
    beforeLen: 65,
    after: "<strong>사용 시점:</strong> 임신 중 여성은 출산 전에도 가능. 만 8세 이하·초2 이하 자녀까지.",
    afterLen: 63,
  },
  {
    name: "육아휴직 거부 제재",
    before: "30인 미만 소기업 근로자도 육아휴직이 보장됩니다. 회사가 거부할 경우 500만원 이하 과태료 부과 대상입니다.",
    beforeLen: 62,
    after: "30인 미만 소기업 근로자도 육아휴직이 보장됩니다. 회사가 거부할 경우 500만원 이하의 벌금에 처해집니다.",
    afterLen: 60,
  },
  {
    name: "육아휴직 신청 조건 결론",
    before: "만 8세 이하(또는 초등학교 2학년 이하) 자녀가 있는 근로자라면 고용보험 가입 180일 이상이면 신청할 수 있습니다. 계약직도 가능합니다.",
    beforeLen: 78,
    after: "만 8세 이하(또는 초등학교 2학년 이하) 자녀가 있고 같은 회사 6개월 이상 근무했다면 회사가 거부할 수 없습니다. 계약직도 가능합니다.",
    afterLen: 77,
  },
  {
    name: "육아휴직 기본 요건 2",
    before: "<strong>기본 요건:</strong> ①만 8세 이하 또는 초등학교 2학년 이하 자녀 ②육아휴직 시작일 전 고용보험 피보험기간 180일 이상.",
    beforeLen: 82,
    after: "<strong>기본 요건:</strong> ①만 8세 이하 또는 초등학교 2학년 이하 자녀 ②회사 계속근로 6개월(급여는 피보험 단위기간 180일)",
    afterLen: 82,
  },
  {
    name: "계약직·기간제 요건",
    before: "<strong>계약직·기간제 근로자:</strong> 고용보험 가입 기간을 충족하면 동일하게 적용됩니다. 단, 육아휴직 중 계약 만료 시 연장은 법적 의무가 아닙니다.",
    beforeLen: 93,
    after: "<strong>계약직·기간제 근로자:</strong> 같은 회사 6개월 이상이면 똑같이 쓸 수 있습니다. 단, 육아휴직 중 계약 만료 시 연장은 법적 의무가 아닙니다.",
    afterLen: 93,
  },
];

const EIC_PAIRS: Pair[] = [
  {
    name: "신청 절차 04",
    before: "정기 신청 시 9월 말 지급. 반기는 신청 다음 달 말 지급",
    beforeLen: 33,
    after: "정기 신청은 9월 말 지급. 반기는 12월 35%, 6월 정산",
    afterLen: 34,
  },
  // 반기 신청 35%(띄어쓰기)는 320px 에서 두 줄로 접혀 국세청 용어 반기신청으로 붙여 쓴다.
  { name: "타일 라벨", before: "이번 달 신청 시", beforeLen: 9, after: "반기신청 35%", afterLen: 8 },
  // 예외: 5 → 6자(한글 1자 → 반각 숫자 2자). 반각 가중 폭은 같다.
  { name: "타일 캡션", before: "반기 지급", beforeLen: 5, after: "12월 지급", afterLen: 6 },
];

describe("R4 YMYL — /qna 출산휴가·육아휴직 답변", () => {
  it("틀린 옛 문구가 남아 있지 않다", () => {
    expect(qnaSrc).not.toContain("상한 월 210만원");
    expect(qnaSrc).not.toContain("출산일로부터 120일 이내");
    for (const p of QNA_PAIRS) expect(qnaSrc, p.name).not.toContain(p.before);
  });

  it("정정 문구가 해당 답변에 들어 있다", () => {
    const leave = findQna("출산휴가와 육아휴직은 다른 건가요");
    expect(leave).toBeDefined();
    const leaveText = JSON.stringify(leave);
    expect(leaveText).toContain("상한 월 220만원");
    expect(leaveText).toContain("출산예정일 50일 전부터 출산 후 120일 이내");
    expect(leave!.answer.conclusion).toContain("최대 1년 6개월");
    expect(leaveText).toContain("대규모기업은 출산전후휴가 최초 60일분을 회사가 지급");

    const cond = findQna("육아휴직 신청 조건이 뭔가요");
    expect(cond).toBeDefined();
    const condText = JSON.stringify(cond);
    expect(condText).toContain("둘 다 3개월 이상 쓰면 각 1년 6개월");
    expect(condText).toContain("만 8세 이하·초2 이하");
    expect(cond!.answer.tip).toContain("500만원 이하의 벌금");
    expect(cond!.answer.tip).not.toContain("과태료");

    for (const p of QNA_PAIRS) expect(qnaSrc, p.name).toContain(p.after);
  });

  it("육아휴직 신청 조건 답변이 고용보험 180일을 휴직 신청 요건으로 안내하지 않는다", () => {
    const cond = findQna("육아휴직 신청 조건이 뭔가요");
    expect(cond).toBeDefined();
    const { conclusion, details, tip } = cond!.answer;
    const texts = [conclusion, ...details, tip ?? ""].map((t) => t.replace(/<[^>]+>/g, ""));
    // 옛 오안내: 180일이면 신청 가능, 가입 기간만 채우면 계약직도 동일
    for (const t of texts) {
      expect(t).not.toMatch(/180일 이상이면 신청/);
      expect(t).not.toContain("고용보험 가입 기간을 충족하면");
      expect(t).not.toContain("육아휴직 시작일 전 고용보험 피보험기간 180일");
    }
    // 180일은 급여 요건으로만 나온다: 같은 문구 안에서 180일 앞 20자 안에 급여가 있어야 한다
    for (const t of texts) {
      for (const m of t.matchAll(/180일/g)) {
        expect(t.slice(Math.max(0, m.index! - 20), m.index!), t).toContain("급여");
      }
    }
    // 휴직 요건은 같은 회사 계속근로 6개월
    expect(conclusion).not.toContain("180일");
    expect(conclusion).toContain("같은 회사 6개월 이상 근무했다면 회사가 거부할 수 없습니다");
    const req = details.find((d) => d.includes("기본 요건"));
    expect(req).toContain("②회사 계속근로 6개월(급여는 피보험 단위기간 180일)");
    const contract = details.find((d) => d.includes("계약직·기간제"));
    expect(contract).toContain("같은 회사 6개월 이상이면");
  });

  it("정정 문구는 바꾼 문구보다 길지 않다 (광고 위 높이 불변)", () => {
    for (const p of QNA_PAIRS) {
      expect(len(p.before), p.name).toBe(p.beforeLen);
      expect(len(p.after), p.name).toBe(p.afterLen);
      expect(p.afterLen, p.name).toBeLessThanOrEqual(p.beforeLen);
      expect(halfWidth(p.after), p.name).toBeLessThanOrEqual(halfWidth(p.before));
    }
  });
});

describe("R4 YMYL — /earned-income-credit 반기 신청", () => {
  it("반기 지급 시기 오기(신청 다음 달 말)와 50% 타일이 사라졌다", () => {
    expect(eicSrc).not.toContain("반기는 신청 다음 달 말");
    expect(eicSrc).not.toContain("이번 달 신청 시");
    expect(eicSrc).not.toContain("finalBenefit / 2");
  });

  it("12월 35% 선지급·6월 정산 문구와 0.35 타일", () => {
    for (const p of EIC_PAIRS) expect(eicSrc, p.name).toContain(p.after);
    expect(eicSrc).toContain("formatWon(finalBenefit * 0.35)");
    expect(eicSrc).toContain('<div className="text-xs text-muted-blue">반기신청 35%</div>');
    expect(eicSrc).toContain('<div className="text-xs text-muted-blue">12월 지급</div>');
  });

  it("정정 문구 길이 — 캡션·신청 절차 04 만 1자 예외, 반각 가중 폭은 모두 같거나 짧다", () => {
    for (const p of EIC_PAIRS) {
      expect(len(p.before), p.name).toBe(p.beforeLen);
      expect(len(p.after), p.name).toBe(p.afterLen);
      expect(halfWidth(p.after), p.name).toBeLessThanOrEqual(halfWidth(p.before));
      if (p.name === "타일 캡션" || p.name === "신청 절차 04") expect(p.afterLen - p.beforeLen).toBe(1);
      else expect(p.afterLen, p.name).toBeLessThanOrEqual(p.beforeLen);
    }
  });
});
