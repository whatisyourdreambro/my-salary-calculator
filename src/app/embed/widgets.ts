// src/app/embed/widgets.ts
//
// 임베드 위젯 목록 단일 소스 (2026-08-23 다중 위젯화 — 위젯 2호 연말정산 추가).
// 스니펫의 크레딧 <a> 링크가 백링크 본체 — 크레딧 앵커를 제거하지 말 것.
// 위젯 실물(/widget/*)은 noindex, 이 페이지(/embed)가 색인 대상.

export interface EmbedWidgetDef {
  id: string;
  /** 섹션 앵커 (#) 겸 GA 이벤트 파라미터 */
  anchor: string;
  title: string;
  /** 미리보기 iframe */
  src: string;
  height: number;
  /** 블로거가 복사해 가는 HTML (크레딧 포함) */
  snippet: string;
  /** 이 위젯 전용 기준·가정 설명 */
  basis: string;
}

export const EMBED_WIDGETS: EmbedWidgetDef[] = [
  {
    id: "salary",
    anchor: "salary",
    title: "연봉 실수령액 계산기",
    src: "/widget/salary",
    height: 380,
    snippet: `<iframe src="https://www.moneysalary.com/widget/salary" width="100%" height="380"
  style="border:1px solid #e2e8f0;border-radius:12px;max-width:480px;"
  title="2026 연봉 실수령액 계산기" loading="lazy"></iframe>
<p style="margin:8px 0 0;font-size:13px;">
  <a href="https://www.moneysalary.com/?utm_source=embed&utm_medium=widget"
     target="_blank" rel="noopener noreferrer">2026 연봉 실수령액 계산기 by 머니샐러리</a>
</p>`,
    basis:
      "2026년 세법(4대보험 요율·간이세액) 기준, 부양가족 1인·비과세 식대 월 20만원 가정 추정치입니다.",
  },
  {
    id: "year-end-tax",
    anchor: "year-end-tax",
    title: "연말정산 환급 계산기",
    src: "/widget/year-end-tax",
    height: 430,
    snippet: `<iframe src="https://www.moneysalary.com/widget/year-end-tax" width="100%" height="430"
  style="border:1px solid #e2e8f0;border-radius:12px;max-width:480px;"
  title="2026 연말정산 환급 계산기" loading="lazy"></iframe>
<p style="margin:8px 0 0;font-size:13px;">
  <a href="https://www.moneysalary.com/year-end-tax?utm_source=embed&utm_medium=widget"
     target="_blank" rel="noopener noreferrer">2026 연말정산 환급 계산기 by 머니샐러리</a>
</p>`,
    basis:
      "2026년 귀속 기준, 본인 1인 공제·4대보험만 반영한 보수적 추정입니다. 카드·연금저축 등 공제를 넣은 정확한 계산은 본편 계산기에서 할 수 있습니다.",
  },
  {
    id: "bonus",
    anchor: "bonus",
    title: "성과급 세후 실수령 계산기",
    src: "/widget/bonus",
    height: 430,
    snippet: `<iframe src="https://www.moneysalary.com/widget/bonus" width="100%" height="430"
  style="border:1px solid #e2e8f0;border-radius:12px;max-width:480px;"
  title="2026 성과급 실수령액 계산기" loading="lazy"></iframe>
<p style="margin:8px 0 0;font-size:13px;">
  <a href="https://www.moneysalary.com/calc/bonus-calculators?utm_source=embed&utm_medium=widget"
     target="_blank" rel="noopener noreferrer">2026 성과급 계산기 by 머니샐러리</a>
</p>`,
    basis:
      "2026년 세법 한계세율 기준 — 성과급이 연봉에 합산되며 늘어나는 소득세·4대보험 증가분을 공제로 반영한 추정치입니다. 회사별 지급률(OPI·PS 등) 계산은 본편 회사별 계산기가 담당합니다.",
  },
  {
    id: "severance",
    anchor: "severance",
    title: "퇴직금 계산기",
    src: "/widget/severance",
    height: 460,
    snippet: `<iframe src="https://www.moneysalary.com/widget/severance" width="100%" height="460"
  style="border:1px solid #e2e8f0;border-radius:12px;max-width:480px;"
  title="2026 퇴직금 계산기" loading="lazy"></iframe>
<p style="margin:8px 0 0;font-size:13px;">
  <a href="https://www.moneysalary.com/?tab=severance&utm_source=embed&utm_medium=widget"
     target="_blank" rel="noopener noreferrer">2026 퇴직금 계산기 by 머니샐러리</a>
</p>`,
    basis:
      "퇴직 전 3개월 평균임금 30일분 × 근속연수로 세전 퇴직금을 추정하고, 퇴직소득세(근속연수공제·환산급여)를 공제한 값입니다. 입사·퇴사일 기준 일할 계산은 본편에서 지원합니다.",
  },
  {
    id: "dsr",
    anchor: "dsr",
    title: "DSR 대출 한도 계산기",
    src: "/widget/dsr",
    height: 460,
    snippet: `<iframe src="https://www.moneysalary.com/widget/dsr" width="100%" height="460"
  style="border:1px solid #e2e8f0;border-radius:12px;max-width:480px;"
  title="2026 DSR 대출 한도 계산기" loading="lazy"></iframe>
<p style="margin:8px 0 0;font-size:13px;">
  <a href="https://www.moneysalary.com/home-loan?utm_source=embed&utm_medium=widget"
     target="_blank" rel="noopener noreferrer">2026 DSR 대출 한도 계산기 by 머니샐러리</a>
</p>`,
    basis:
      "DSR 40%·원리금균등 상환 기준 최대 대출 원금 추정치입니다. 기존 대출 보유 시 한도가 줄어들며, 은행·규제지역별 적용 기준이 다를 수 있습니다.",
  },
  {
    id: "minimum-wage",
    anchor: "minimum-wage",
    title: "최저임금 시급·월급 카드",
    src: "/widget/minimum-wage",
    height: 500,
    snippet: `<iframe src="https://www.moneysalary.com/widget/minimum-wage" width="100%" height="500"
  style="border:1px solid #e2e8f0;border-radius:12px;max-width:480px;"
  title="최저임금 시급·월급 위젯" loading="lazy"></iframe>
<p style="margin:8px 0 0;font-size:13px;">
  <a href="https://www.moneysalary.com/minimum-wage-2027?utm_source=embed&utm_medium=widget"
     target="_blank" rel="noopener noreferrer">2027 최저임금 총정리 by 머니샐러리</a>
</p>`,
    basis:
      "고용노동부 확정 고시 수치를 그대로 보여줍니다 — 차기 연도 확정 시급·월급(주휴 포함 209시간)과 현행 시급 병기. 시급을 입력하면 월급·연봉으로 환산됩니다. 연도 없는 에버그린 주소라 한 번 붙이면 매년 최신 확정값으로 자동 갱신됩니다.",
  },
  {
    id: "military-pay",
    anchor: "military-pay",
    title: "군인 월급 표 카드",
    src: "/widget/military-pay",
    height: 480,
    snippet: `<iframe src="https://www.moneysalary.com/widget/military-pay" width="100%" height="480"
  style="border:1px solid #e2e8f0;border-radius:12px;max-width:480px;"
  title="2026 군인 월급 표 위젯" loading="lazy"></iframe>
<p style="margin:8px 0 0;font-size:13px;">
  <a href="https://www.moneysalary.com/military-pay-2026?utm_source=embed&utm_medium=widget"
     target="_blank" rel="noopener noreferrer">2026 군인 월급 총정리 by 머니샐러리</a>
</p>`,
    basis:
      "공무원보수규정 별표 13 원문 수치 — 2026년 병사(이병~병장) 월 봉급표와 장병내일준비적금 정부 매칭(월 납입 한도·전역 시 일괄 수령) 구조, 하사·소위 초임을 요약합니다.",
  },
  {
    id: "company",
    anchor: "company",
    title: "회사 공시연봉 카드",
    src: "/widget/company?id=samsung-electronics",
    height: 420,
    snippet: `<iframe src="https://www.moneysalary.com/widget/company?id=samsung-electronics" width="100%" height="420"
  style="border:1px solid #e2e8f0;border-radius:12px;max-width:480px;"
  title="삼성전자 평균연봉 위젯" loading="lazy"></iframe>
<p style="margin:8px 0 0;font-size:13px;">
  <a href="https://www.moneysalary.com/salary-db/samsung-electronics?utm_source=embed&utm_medium=widget"
     target="_blank" rel="noopener noreferrer">삼성전자 연봉 정보 by 머니샐러리</a>
</p>`,
    basis:
      "금융감독원 DART 사업보고서 '직원 등의 현황' 공시값(임원 제외 전 직원 평균연봉·직원수·평균 근속) 기준입니다. 예시는 삼성전자 — 페이지 하단의 회사 선택기에서 원하는 회사의 임베드 코드를 바로 만들 수 있습니다.",
  },
];
