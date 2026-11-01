// 지역가입자 재산보험료부과점수 등급표 — 국민건강보험법 시행령 [별표 4] <개정 2024. 5. 7.>
// 재산보험료부과점수의 산정방법(제42조제1항 관련) 제3호 재산등급별 점수.
// 출처: https://www.law.go.kr/LSW/flDownload.do?flSeq=156177245 (법제처 국가법령정보센터 원문 PDF)
// - 2026-10-05 원문 대조, 2026-11-01 재대조: PDF 에서 추출한 60행(등급·상한·점수)이 아래 표와 전부 일치.
// - 2026-11-01 law.go.kr 시행령 제·개정이유 목록 확인: 2024. 5. 7. 이후 개정(2026. 10. 1. 시행분까지) 어디에도 별표 4 개정
//   언급이 없다. 2025. 12. 23. 대통령령 제35931호는 보험료율과 재산보험료부과점수당 금액을 올린 개정으로 등급표와 무관.
// 재산금액(별표 4 제1호) = 재산세 과세표준금액(토지·건축물·주택·선박·항공기)과 임차주택 보증금·월세 평가액을
// 합산한 금액에서 1억원 및 제42조의2제3항 각 호의 구분에 따른 금액을 뺀 금액.
// 1등급 450만원 이하 22점 ~ 60등급 77억 8,124만원 초과 2,341점. 공제 후 0원이면 재산보험료부과점수 없음.
//
// 2026-10-05 감사 code12-02 정정: /health-insurance-fee-2026 지역가입자 모드는 점수 슬라이더가 100~5,000점,
// 기본값 1,500점이고 '평균 자영업자 약 1,500~2,500점' 이라 적어, 법정 최고점(2,341점)을 넘는 값과
// 21.8~27억원대(1,500점 = 47~48등급) 재산을 평균처럼 보여줬다. 이제 슬라이더는 이 표의 등급(0~60)을 고른다.

/** [등급 상한(만원, 마지막 등급은 Infinity), 점수] — 1등급부터 60등급까지 */
export const PROPERTY_SCORE_GRADES: ReadonlyArray<readonly [number, number]> = [
  [450, 22], [900, 44], [1_350, 66], [1_800, 97], [2_250, 122],
  [2_700, 146], [3_150, 171], [3_600, 195], [4_050, 219], [4_500, 244],
  [5_020, 268], [5_590, 294], [6_220, 320], [6_930, 344], [7_710, 365],
  [8_590, 386], [9_570, 412], [10_700, 439], [11_900, 465], [13_300, 490],
  [14_800, 516], [16_400, 535], [18_300, 559], [20_400, 586], [22_700, 611],
  [25_300, 637], [28_100, 659], [31_300, 681], [34_900, 706], [38_800, 731],
  [43_200, 757], [48_100, 785], [53_600, 812], [59_700, 841], [66_500, 881],
  [74_000, 921], [82_400, 961], [91_800, 1_001], [103_000, 1_041], [114_000, 1_091],
  [127_000, 1_141], [142_000, 1_191], [158_000, 1_241], [176_000, 1_291], [196_000, 1_341],
  [218_000, 1_391], [242_000, 1_451], [270_000, 1_511], [300_000, 1_571], [330_000, 1_641],
  [363_000, 1_711], [399_300, 1_781], [439_230, 1_851], [483_153, 1_921], [531_468, 1_991],
  [584_615, 2_061], [643_077, 2_131], [707_385, 2_201], [778_124, 2_271], [Infinity, 2_341],
];

export const MAX_PROPERTY_GRADE = PROPERTY_SCORE_GRADES.length; // 60

/** 등급(0~60) → 점수. 0등급 = 공제 후 재산 0원(재산분 없음) */
export function propertyScoreOfGrade(grade: number): number {
  const g = Math.min(MAX_PROPERTY_GRADE, Math.max(0, Math.round(grade)));
  return g === 0 ? 0 : PROPERTY_SCORE_GRADES[g - 1][1];
}

/** 공제 후 재산금액(원) → 등급(0~60) */
export function propertyGradeOfAmount(won: number): number {
  if (!(won > 0)) return 0;
  const manwon = won / 10_000;
  const idx = PROPERTY_SCORE_GRADES.findIndex(([upper]) => manwon <= upper);
  return idx + 1;
}

function fmtManwon(manwon: number): string {
  const eok = Math.floor(manwon / 10_000);
  const man = Math.round(manwon % 10_000);
  if (eok === 0) return `${man.toLocaleString("ko-KR")}만`;
  return man > 0 ? `${eok}억 ${man.toLocaleString("ko-KR")}만` : `${eok}억`;
}

/** 등급의 공제 후 재산금액 구간 문구 — 예: 23등급 '1억 6,400만~1억 8,300만원' */
export function propertyGradeRangeText(grade: number): string {
  const g = Math.min(MAX_PROPERTY_GRADE, Math.max(0, Math.round(grade)));
  if (g === 0) return "0원(재산분 없음)";
  const upper = PROPERTY_SCORE_GRADES[g - 1][0];
  const lower = g === 1 ? 0 : PROPERTY_SCORE_GRADES[g - 2][0];
  if (upper === Infinity) return `${fmtManwon(lower)}원 초과`;
  if (g === 1) return `${fmtManwon(upper)}원 이하`;
  return `${fmtManwon(lower)}~${fmtManwon(upper)}원`;
}
