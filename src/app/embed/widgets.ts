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
     target="_blank">2026 연봉 실수령액 계산기 by 머니샐러리</a>
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
     target="_blank">2026 연말정산 환급 계산기 by 머니샐러리</a>
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
     target="_blank">2026 성과급 계산기 by 머니샐러리</a>
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
     target="_blank">2026 퇴직금 계산기 by 머니샐러리</a>
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
     target="_blank">2026 DSR 대출 한도 계산기 by 머니샐러리</a>
</p>`,
    basis:
      "DSR 40%·원리금균등 상환 기준 최대 대출 원금 추정치입니다. 기존 대출 보유 시 한도가 줄어들며, 은행·규제지역별 적용 기준이 다를 수 있습니다.",
  },
];
