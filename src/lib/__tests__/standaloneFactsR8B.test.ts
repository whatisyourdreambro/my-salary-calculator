// 독립 페이지 YMYL 사실 정정 회귀 가드 (2026-09-27 R8 B-standalone-facts)
//
// 1) /savings-interest-2026 — 청년도약계좌 신규 가입 종료(2025-12-31, 조세특례제한법 제91조의22·금융위원회
//    2026-06-15 보도자료), 후속 청년미래적금(2026-06-22 출시, 금융위원회·서민금융진흥원: 만 19~34세·월 최대 50만원·
//    3년·정부기여금 6%/12%·이자소득 비과세 — 조특법 제91조의25). 월 최대 기여금 6만원 = 50만원 × 12%.
// 2) /health-checkup-2026 — 암검진 실시기준(보건복지부고시 제2025-220호) 제10·11조: 대장암·자궁경부암 공단 전액,
//    그 외 공단 90%+본인 10%, 의료급여·보험료 하위 50%는 본인 0원. 수검 기한은 해당 연도(건강검진 실시기준
//    제8조①, 암검진 실시기준 제6조). 5대/6대 표기 통일(폐암 포함 6대).
// 3) /samsung-negotiation-2026 — 5/20 잠정합의·5/22~27 투표(투표율 95.5%·찬성 73.7%)·5/27 조인식(삼성전자 뉴스룸),
//    평균 6.2%(기본 4.1%+성과 2.1%)·3월 급여부터 소급(보도 기준). src/data/seedCompanies.ts 와 같은 값.
// 4) /chuseok-bonus-2026 — 연휴(9/24~26) 뒤 히어로 '추석 앞두고'→'추석 전후로'(날짜 불변).
//
// 광고 위 문구는 줄 수 불변 폭 맞춤이다. 320~1440px 1px 간격 + 1536·1920px 에서 요소 높이와 광고 top 이
// 4ef59a4b 빌드와 같음을 확인했다. 아래 문자열을 다시 바꿀 때는 같은 방식으로 폭을 맞추고 전 폭을 다시 잴 것:
//   - 음절 구조가 같은 교체(청년도약계좌→청년미래적금, 추석 앞두고→추석 전후로, 5대→6대)는 syllables 가드.
//   - 문단 끝 구절 교체(건강검진 히어로 끝, 삼성 쟁점 1 카드 끝)는 끝 구절 전체 폭만 맞으면 된다(끝 구절이 한 줄에
//     들어가느냐만 줄 수를 정한다) — 측정 폭 차 +0.22px / −0.30px.
//   - 1줄↔2줄 전환만 있는 목록·표 셀(적금 목록 기여금 줄 +0.03px, 비용 표 셀 −0.08px)은 옛 문구와 같은 1px 폭 구간.
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { seedCompanies } from "@/data/seedCompanies";
import { FIXED_RERATE, getThreshold } from "@/app/calc/samsung-bonus/model";
import { PS_HISTORY } from "@/app/calc/sk-hynix-bonus/psData";

const readSrc = (rel: string) => readFileSync(resolve(process.cwd(), rel), "utf8");
const flat = (s: string) => s.replace(/\s+/g, " ");
/** 한글 음절 수 목록(띄어쓰기 단위) — 단어별 폭 고정 확인용 */
const syllables = (s: string) => s.split(" ").map((w) => [...w].length);

describe("/savings-interest-2026 청년미래적금(청년도약계좌 신규 가입 종료 반영)", () => {
  const src = flat(readSrc("src/app/savings-interest-2026/page.tsx"));
  const client = flat(readSrc("src/app/savings-interest-2026/SavingsInterestClient.tsx"));

  it("광고 위 목록은 청년미래적금이고 옛 청년도약계좌 조건(5년·144만원)이 없다", () => {
    expect(src).toContain(
      "<li><strong>청년미래적금</strong> (만 19~34세): 월 50만원·3년, 기여금 월 최대 6만원, 비과세</li>",
    );
    expect(src).not.toContain("정부기여금 최대 144만원");
    expect(src).not.toContain("<strong>청년도약계좌</strong>");
    expect(src).toContain("정기예금 + 청년미래적금(자격 시) + 채권 ETF");
    expect(src).not.toContain("청년도약계좌(자격 시)");
    expect(client).toContain("비과세 상품 (ISA·청년미래적금·조합예탁금 등)");
    expect(client).not.toContain("청년도약계좌");
  });

  it("같은 음절 교체 — 상품명 6음절, 자격 문구 단어 구조 동일", () => {
    expect([..."청년미래적금"].length).toBe([..."청년도약계좌"].length);
    expect(syllables("청년미래적금(자격 시)")).toEqual(syllables("청년도약계좌(자격 시)"));
    expect(syllables("ISA·청년미래적금·조합예탁금")).toEqual(syllables("ISA·청년도약계좌·조합예탁금"));
  });

  it("기여금 월 최대 6만원 = 월 납입 한도 50만원 × 우대형 12%", () => {
    expect(500_000 * 0.12).toBe(60_000);
  });

  it("접힌 FAQ: 청년미래적금 조건·도약계좌 종료·ISA·청년형 장기펀드·조합 예탁금(조특법) 정정", () => {
    expect(src).toContain(
      "② 청년미래적금(만 19~34세, 2026년 6월 출시): 월 최대 50만원·3년 만기, 납입액의 6%(일반형) 또는 12%(우대형) 정부기여금 + 이자소득 비과세.",
    );
    expect(src).toContain("청년도약계좌는 2025년 12월 31일로 신규 가입이 끝나 기존 가입자만 유지됩니다");
    expect(src).toContain("계좌 순이익 200만원(서민형 400만원)까지 비과세·초과분 9.9% 분리과세");
    expect(src).toContain("③ 청년형 장기집합투자증권저축(비과세가 아닌 납입액 40% 소득공제, 2025년 12월 31일로 신규 가입 종료)");
    expect(src).toContain("2026년 가입분 5%·2027년 이후 가입분 9% 분리과세(조세특례제한법 제89조의3)");
    expect(src).not.toContain("② 청년도약계좌(만 19~34세): 5년 만기");
    expect(src).not.toContain("연 2천만원 한도 비과세, 200만원 초과분");
  });

  it("modifiedTime 은 이번 정정일(2026-09-27)", () => {
    expect(src).toContain('modifiedTime: "2026-09-27"');
  });
});

describe("/health-checkup-2026 암검진 본인부담·수검 기한·6대 암 표기", () => {
  const src = flat(readSrc("src/app/health-checkup-2026/page.tsx"));

  it("제목·설명이 6대 암·본인부담 0~10%·12월 31일 기한이고 옛 '5대 암검진 본인부담 10%'가 없다", () => {
    expect(src).toContain('title: "2026 국민건강검진 — 직장인 무료 검진 + 6대 암검진 본인부담 0~10%"');
    expect(src).not.toContain("5대 암검진 본인부담 10%");
    expect(src).toContain("수검 기한 12월 31일");
    expect(src).toContain("대장·자궁경부 0원, 위·간·유방·폐 10%(보험료 하위 50%·의료급여 0원)");
  });

  it("광고 위 대상자 카드 제목은 6대 암(본문·설명의 폐암 포함 목록과 일치)", () => {
    expect(src).toContain('type: "암검진 (6대 암)"');
    expect(src).not.toContain('type: "암검진 (5대 암)"');
    expect(src).toContain("폐암은 만 54~74세 고위험군 2년 1회");
    expect(syllables("암검진 (6대 암)")).toEqual(syllables("암검진 (5대 암)"));
  });

  it("비용 표: 대장·자궁경부 0원, 보험료 하위 50% 0원 — '차상위계층 무료'는 기준이 아니다", () => {
    expect(src).toContain('cost: "위·간·유방: 10%, 대장·자궁경부는 0원, 보험료 하위 50%는 0원"');
    // 표 셀·FAQ 문자열에 옛 기준(차상위계층 무료)이 남지 않는다(파일 머리 주석의 정정 설명은 제외)
    expect(src).not.toContain("의료급여수급권자·차상위계층");
    expect(src).not.toContain("차상위계층 무료)");
    expect(src).not.toContain("차상위계층은 전액 무료");
  });

  it("히어로: 5월 시즌 문구 대신 12/31 마감(해당 연도 수검)", () => {
    expect(src).toContain("과태료(최대 1,000만원)가 부과될 수 있음. 12/31 마감 전 수검 권장.");
    expect(src).not.toContain("6~7월 시즌 내 완료 권장");
    expect(src).toContain("2026 검진 마감 12월 31일");
    expect(src).not.toContain("5~7월 검진 시즌");
  });

  it("접힌 FAQ 도 같은 기준(대장·자궁경부 공단 전액, 하위 50%·의료급여 0원)", () => {
    expect(src).toContain("대장암(분변잠혈검사)·자궁경부암 검진은 공단이 전액 부담해 본인부담이 없습니다");
    expect(src).toContain("암검진 본인부담 0~10%(대장·자궁경부 0원, 보험료 하위 50%는 전 암종 0원)");
    expect(src).not.toContain("본인 부담 약 8,000~15,000원");
  });

  it("수정일 3곳(메타·Article·표시)이 2026-09-27 로 같다", () => {
    expect(src).toContain('modifiedTime: "2026-09-27"');
    expect(src).toContain('modifiedDate: "2026-09-27"');
    expect(src).toContain('<PublishedMeta publishedDate="2026-05-22" updatedDate="2026-09-27"');
  });
});

describe("/samsung-negotiation-2026 2026 임금협약 타결 결과(5/27 가결)", () => {
  const raw = readSrc("src/app/samsung-negotiation-2026/page.tsx");
  const src = flat(raw);
  const samsung = seedCompanies.find((c) => c.id === "samsung-electronics")!;

  it("회사 데이터(seedCompanies)와 같은 가결일·찬성률·인상률 구성", () => {
    expect(samsung.description).toContain("2026-05-27 조합원 투표 가결, 찬성 73.7%");
    expect(samsung.description).toContain("Base-up 4.1% + 성과인상률 평균 2.1%");
    expect(src).toContain("평균 6.2%(기본인상률 4.1% + 성과인상률 평균 2.1%)");
    expect(src).toContain("투표율 95.5%, 찬성 73.7%로 가결");
    expect(4.1 + 2.1).toBeCloseTo(6.2, 10);
  });

  it("메타·히어로 배지·쟁점 카드가 협상 전 시점 문구가 아니다", () => {
    expect(src).toContain('title: "삼성전자 2026 임금협상 타결 - 평균 6.2% 인상, 5/27 가결·특별성과급"');
    expect(src).not.toContain("5월 12일 본격 시작, 인상률·OPI·복지 핵심 쟁점");
    expect(src).toContain('<time dateTime="2026-05-27">2026년 5월 27일 임금협약 가결</time>');
    expect(src).not.toContain("본격 협상 시작</time>");
    expect(src).toContain("노조 요구안 상향 가능성. 타결 인상률: 평균 6.2%.");
    expect(src).not.toContain("합의선 추정: 5.0~6.5%");
    expect(src).toContain('modifiedTime: "2026-09-27"');
    expect(src).toContain('<PublishedMeta publishedDate="2026-05-12" updatedDate="2026-09-27"');
  });

  it("접힌 FAQ: 소급은 3월 급여부터(1월 1일자 아님), 결과 날짜 명시", () => {
    expect(src).toContain("2026년 3월 급여부터 소급 적용됩니다(보도 기준)");
    expect(src).toContain("5월 20일 고용노동부 장관 중재 교섭에서 잠정합의안이 나왔습니다");
    expect(src).not.toContain("소급 적용은 1월 1일자입니다");
    expect(src).not.toContain("잠정합의가 6~8월에 이뤄지면");
  });

  // 2026-09-30 후속 정정(R8-B 후속, dedupe 12 — 번들 S09 에서 옮긴 사실): 협상 시작은 5월 12일이 아니라 2025-12-11 상견례·12-16
  // 1차 본교섭(파이낸셜뉴스 2026-05-27 일지 보도), 특별경영성과급 재원은 노사가 합의한 사업성과의 10.5%·지급 조건 200조/100조
  // (파이낸셜뉴스 2026-09-27 보도), SK하이닉스 PS 는 psData 정본 값.
  it("접힌 FAQ·요약: 협상 시작은 2025년 12월 11일 상견례·12월 16일 1차 본교섭이고 '5월 12일 본격 본교섭'이 없다", () => {
    expect(src).toContain("2026년 임금교섭은 2025년 12월 11일 상견례와 12월 16일 1차 본교섭으로 시작됐습니다");
    expect(src).toContain("2025년 12월 11일 상견례");
    expect(src).not.toContain("5월 12일 본격 본교섭이 개시");
    expect(src).not.toContain("5월 12일 본격 시작");
    expect(src).toContain("5월 11~12일 1차 사후조정(13일 새벽 결렬)과 5월 18~20일 2차 사후조정이 결렬됐고");
    expect(src).toContain(
      "2025년 12월 11일 상견례·12월 16일 1차 본교섭 → 2월 19일 결렬·3월 3일 중노위 조정 중지 → 5월 11~12일·18~20일 사후조정 결렬 → 5월 20일 밤 고용노동부 장관 중재로 잠정합의",
    );
  });

  it("요약의 특별경영성과급: 노사가 합의한 사업성과의 10.5%·지급 조건이 정본(FIXED_RERATE·getThreshold)과 같다", () => {
    expect(src).toContain(`재원은 노사가 합의한 DS부문 사업성과의 ${FIXED_RERATE}%(상한 없음)이고`);
    expect(src).toContain(
      `2026~2028년 DS부문 연간 영업이익 ${getThreshold(2026)}조원·2029~2035년 ${getThreshold(2029)}조원 이상일 때만 지급됩니다`,
    );
    expect(src).toContain("사업성과의 10.5%");
    expect(src).toContain("200조원");
    expect(src).not.toContain("재원은 영업이익의 10.5%");
    expect([getThreshold(2028), getThreshold(2035)]).toEqual([getThreshold(2026), getThreshold(2029)]);
  });

  it("FAQ 인상률: 합계 6.2%는 추정 범위 안이지만 기본인상률 4.1%는 추정보다 낮았다", () => {
    expect(src).toContain("합계 6.2%는 그 범위 안이지만 기본인상률만 보면 4.1%로 추정보다 낮았습니다");
    expect(src).not.toContain("실제 타결은 그 범위 안이었습니다");
  });

  it("FAQ SK하이닉스 PS: psData PS_HISTORY 의 2024·2025 실적분 지급률과 같다", () => {
    const ps = (y: number) => PS_HISTORY.find((r) => r.year === y)?.psRatePct;
    expect(ps(2024)).toBe(1500);
    expect(ps(2025)).toBe(2964);
    expect(src).toContain(
      `2024년 실적분은 기본급의 ${ps(2024)!.toLocaleString("en-US")}%, 2025년 실적분은 ${ps(2025)!.toLocaleString("en-US")}%(2026년 2월 5일 지급)였습니다(보도 기준)`,
    );
    expect(src).not.toContain("2024~2025년 호황기에는 기본급 기준 1,500% 수준");
  });

  it("요약 시나리오 li 가 광고 위 표 주석의 1월 1일자 소급이 협상 전 가정임을 밝힌다(주석 자체는 11/2 결정 12)", () => {
    expect(src).toContain("표 아래 주석의 1월 1일자 소급도 협상 전 가정이며, 실제 소급은 3월 급여부터입니다.");
    // 광고 위 표 주석은 이번 푸시에서 그대로다(폭 맞춤 실패 — 11/2 결정 12 에서 1회 교정)
    expect(src).toContain("※ 기본 연봉만 반영. OPI/TAI 성과급은 별도. 합의 후 1월 1일자 소급 적용 시 일시 입금.");
  });

  it("타결 결과 요약은 마지막 광고(HomeTopAd) 아래에만 있다", () => {
    const lastAd = raw.lastIndexOf("<HomeTopAd />");
    const summary = raw.indexOf("2026 임금협약 타결 결과 (5월 27일 가결)");
    expect(lastAd).toBeGreaterThan(0);
    expect(summary).toBeGreaterThan(lastAd);
    // 요약 뒤에는 광고가 없다
    expect(raw.slice(summary)).not.toMatch(/<(HomeTopAd|InArticleAd|GuideMidAd|CalcResultAd|MultiplexAd)\b/);
  });
});

describe("/chuseok-bonus-2026 연휴 이후 히어로 문구", () => {
  const src = flat(readSrc("src/app/chuseok-bonus-2026/page.tsx"));

  it("'추석 전후로'(같은 음절 구조)이고 날짜·수정일은 그대로", () => {
    expect(src).toContain("추석 전후로 궁금한 돈 문제를");
    expect(src).not.toContain("추석 앞두고 궁금한");
    expect(syllables("추석 전후로")).toEqual(syllables("추석 앞두고"));
    expect(src).toContain('modifiedTime: "2026-08-16"');
    expect(src).toContain("2026 추석 9/25(금) · 연휴 9/24~26 · 대체공휴일 없음");
  });
});
