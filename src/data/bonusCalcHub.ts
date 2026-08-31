// src/data/bonusCalcHub.ts
//
// 성과급 계산기 허브(/calc/bonus-calculators)와 BonusClusterLinks 공용
// 레지스트리 — 회사별 성과급 계산기 카드 데이터 단일 소스 (수 = BONUS_CALCS.length).
//
// hook(최신 지급률 한줄)의 초기값은 CompanyBonusCalculatorLink 의
// COMPANY_BONUS_MAP desc 를 전사한 것 — 두 파일은 참조 결합 없이 각자
// 관리한다(그쪽은 salary-db 렌더 경로라 결합 회피). 지급률 보도가 갱신되면
// 두 곳을 함께 손본다.
// docs/serp-strategy-2026.md 의 리포트 2호용 bonusData.ts(지급률 ETL)와는
// 역할이 다름 — 여기는 허브 카드·링크용 표시 데이터다.

export type BonusCalcSector =
  | "반도체·디스플레이"
  | "배터리·화학·정유"
  | "자동차·중공업·철강"
  | "IT·바이오·공기업";

export interface BonusCalcEntry {
  /** /calc/ 이하 slug */
  slug: string;
  company: string;
  /** salary-db 회사 id (연봉 DB 연결) */
  companyId: string;
  sector: BonusCalcSector;
  /** 최신 지급률·제도 한줄 훅 (보도 기반) */
  hook: string;
  /** 카드에 표기할 지급 시즌 라벨 */
  seasonLabel: string;
  badge?: "HOT" | "NEW";
}

export const BONUS_CALCS: BonusCalcEntry[] = [
  // ── 반도체·디스플레이 ──
  {
    slug: "samsung-bonus",
    company: "삼성전자",
    companyId: "samsung-electronics",
    sector: "반도체·디스플레이",
    hook: "OPI + TAI 사업부별 분배 + 다년도 RSU 매도 시뮬",
    seasonLabel: "1월 OPI · 7/12월 TAI",
    badge: "HOT",
  },
  {
    slug: "sk-hynix-bonus",
    company: "SK하이닉스",
    companyId: "sk-hynix",
    sector: "반도체·디스플레이",
    hook: "잠정합의안 8/25 총투표 부결·재협상 중 — 신구 체계 비교 시뮬",
    seasonLabel: "2월 PS · 반기 PI",
    badge: "HOT",
  },
  {
    slug: "samsung-display-bonus",
    company: "삼성디스플레이",
    companyId: "samsung-display",
    sector: "반도체·디스플레이",
    hook: "OPI 연봉 36% + TAI 반기 최대 100% (2026-01 지급 기준)",
    seasonLabel: "1월 OPI · 7/12월 TAI",
  },
  {
    slug: "lg-display-bonus",
    company: "LG디스플레이",
    companyId: "lg-display",
    sector: "반도체·디스플레이",
    hook: "경영성과급 기본급 150% — 4년 만의 지급 재개 (2026-02)",
    seasonLabel: "2월 지급",
  },
  // ── 배터리·화학·정유 ──
  {
    slug: "lg-energy-bonus",
    company: "LG에너지솔루션",
    companyId: "lgensol",
    sector: "배터리·화학·정유",
    hook: "배터리 사이클 50~900% 5단계 시나리오",
    seasonLabel: "연초 지급",
  },
  {
    slug: "samsung-sdi-bonus",
    company: "삼성SDI",
    companyId: "samsung-sdi",
    sector: "배터리·화학·정유",
    hook: "OPI(0~48%) + TAI 사업부별 (배터리 캐즘 반영)",
    seasonLabel: "1월 OPI · 7/12월 TAI",
  },
  {
    slug: "lg-chem-bonus",
    company: "LG화학",
    companyId: "lg-chem",
    sector: "배터리·화학·정유",
    hook: "PS(0~850%) + PI(고정 200%) 사업부별",
    seasonLabel: "연초 지급",
  },
  {
    slug: "sk-innovation-bonus",
    company: "SK이노베이션",
    companyId: "sk-innovation",
    sector: "배터리·화학·정유",
    hook: "PS+LTI+STI 합산 660% — 계열사 차등 0~800%",
    seasonLabel: "연초 지급",
  },
  {
    slug: "s-oil-bonus",
    company: "S-Oil",
    companyId: "s-oil",
    sector: "배터리·화학·정유",
    hook: "경영성과급 기본급 250% (최대 1,500% 이력)",
    seasonLabel: "연초 지급",
  },
  {
    slug: "gs-caltex-bonus",
    company: "GS칼텍스",
    companyId: "gs-caltex",
    sector: "배터리·화학·정유",
    hook: "기본연봉의 25% (2026) — 호황기 50% 이력",
    seasonLabel: "연초 지급",
  },
  // ── 자동차·중공업·철강 ──
  {
    slug: "hyundai-bonus",
    company: "현대자동차",
    companyId: "hyundai",
    sector: "자동차·중공업·철강",
    hook: "임단협 450% + 1,580만 + 무상주 30주",
    seasonLabel: "12월 임단협 시즌",
  },
  {
    slug: "kia-bonus",
    company: "기아",
    companyId: "kia",
    sector: "자동차·중공업·철강",
    hook: "임단협 450% + 1,600만 + 무상주 53주",
    seasonLabel: "12월 임단협 시즌",
  },
  {
    slug: "hyundai-mobis-bonus",
    company: "현대모비스",
    companyId: "hyundai-mobis",
    sector: "자동차·중공업·철강",
    hook: "임단협 450% + 1,420만 + 우리사주 17주 (2025 타결)",
    seasonLabel: "12월 임단협 시즌",
  },
  {
    slug: "hyundai-rotem-bonus",
    company: "현대로템",
    companyId: "hyundai-rotem",
    sector: "자동차·중공업·철강",
    hook: "임단협 타결안 기본급 450% + 1,620만원",
    seasonLabel: "12월 임단협 시즌",
  },
  {
    slug: "hd-hyundai-bonus",
    company: "HD현대중공업",
    companyId: "hd-hyundai-heavy",
    sector: "자동차·중공업·철강",
    hook: "조선 슈퍼사이클 600% + 노조 영업이익 30%",
    seasonLabel: "연초 지급",
  },
  {
    slug: "doosan-enerbility-bonus",
    company: "두산에너빌리티",
    companyId: "doosan-enerbility",
    sector: "자동차·중공업·철강",
    hook: "연봉 27% 재원 평가 차등 — 상한 기본급 530%",
    seasonLabel: "연초 지급",
  },
  {
    slug: "hanwha-aerospace-bonus",
    company: "한화에어로스페이스",
    companyId: "hanwha-aerospace",
    sector: "자동차·중공업·철강",
    hook: "사업부별 최대 725% (2026-02 지급) — 방산 슈퍼사이클",
    seasonLabel: "2월 지급",
  },
  {
    slug: "posco-bonus",
    company: "포스코",
    companyId: "posco",
    sector: "자동차·중공업·철강",
    hook: "철강 사이클 PI + PS 100~1,000% 시나리오",
    seasonLabel: "연초 지급",
  },
  // ── IT·바이오·공기업 ──
  {
    slug: "naver-bonus",
    company: "네이버",
    companyId: "naver",
    sector: "IT·바이오·공기업",
    hook: "PI 10~40% + 자사주 RSU 합산",
    seasonLabel: "연초 지급",
  },
  {
    slug: "kakao-bonus",
    company: "카카오",
    companyId: "kakao",
    sector: "IT·바이오·공기업",
    hook: "PI + RSU 47만주 + 격려금 100만",
    seasonLabel: "연초 지급",
  },
  {
    slug: "celltrion-bonus",
    company: "셀트리온",
    companyId: "celltrion",
    sector: "IT·바이오·공기업",
    hook: "연봉의 최대 50~53% 등급별 — 1월 선지급 + 3월 잔여",
    seasonLabel: "1월 선지급 · 3월 잔여",
  },
  {
    slug: "samsung-biologics-bonus",
    company: "삼성바이오로직스",
    companyId: "samsung-biologics",
    sector: "IT·바이오·공기업",
    hook: "OPI 연봉 50% 상한 연속 도달 + TAI 100%",
    seasonLabel: "1월 OPI · 7/12월 TAI",
  },
  {
    slug: "kepco-bonus",
    company: "한국전력",
    companyId: "kepco",
    sector: "IT·바이오·공기업",
    hook: "공기업 경영평가 A등급 — 월 기본급 200% 상당",
    seasonLabel: "하반기 경영평가급",
  },
];

export const BONUS_SECTORS: BonusCalcSector[] = [
  "반도체·디스플레이",
  "배터리·화학·정유",
  "자동차·중공업·철강",
  "IT·바이오·공기업",
];

/** 2026 성과급 시즌 캘린더 — 각 행은 보도·타결 이력이 확인된 항목만 */
export const BONUS_CALENDAR_2026: Array<{
  month: string;
  events: Array<{ label: string; href: string }>;
}> = [
  {
    month: "1월",
    events: [
      { label: "삼성전자 OPI 발표·지급", href: "/calc/samsung-bonus" },
      { label: "셀트리온 성과급 선지급", href: "/calc/celltrion-bonus" },
      { label: "SK하이닉스 하반기 PI", href: "/calc/sk-hynix-bonus" },
    ],
  },
  {
    month: "2월",
    events: [
      { label: "SK하이닉스 연간 PS", href: "/calc/sk-hynix-bonus" },
      { label: "LG디스플레이 경영성과급", href: "/calc/lg-display-bonus" },
      { label: "한화에어로 성과급", href: "/calc/hanwha-aerospace-bonus" },
    ],
  },
  {
    month: "7월",
    events: [
      { label: "삼성전자 상반기 TAI", href: "/calc/samsung-bonus" },
      { label: "SK하이닉스 상반기 PI", href: "/calc/sk-hynix-bonus" },
    ],
  },
  {
    month: "9월",
    events: [{ label: "추석 상여금 시즌", href: "/chuseok-bonus-2026" }],
  },
  {
    month: "12월",
    events: [
      { label: "삼성전자 하반기 TAI", href: "/calc/samsung-bonus" },
      { label: "현대차·기아 등 임단협 타결 성과급", href: "/calc/hyundai-bonus" },
    ],
  },
];

/** 최근 성과급 뉴스 타임라인 — 보도 사실만, 갱신 시 여기만 수정 */
export const BONUS_NEWS_2026: Array<{
  date: string;
  text: string;
  href: string;
}> = [
  {
    date: "2026-08",
    text: "초기업노조(SELU) 공지 — 2026 DS 영업이익 360~370조 전망, 연봉 8,000만 기준 OPI 포함 메모리 약 7.5억",
    href: "/calc/samsung-bonus",
  },
  {
    date: "2026-08-25",
    text: "SK하이닉스 잠정합의안 총투표 부결 — 전임직 반대 50.08%(25표 차), 노사 재협상 돌입",
    href: "/calc/sk-hynix-bonus",
  },
  {
    date: "2026-08-20",
    text: "SK하이닉스 임단협 잠정합의 — PS 현금 40%+자사주 60% 개편, 임금 6.3% 인상",
    href: "/calc/sk-hynix-bonus",
  },
  {
    date: "2026-07-28",
    text: "SK하이닉스 2026 상반기 PI 최대치 150% 확정 지급",
    href: "/calc/sk-hynix-bonus",
  },
  {
    date: "2026-07",
    text: "삼성전자 2026 상반기 TAI 지급 — 메모리 100% 등 사업부별 지급률 발표",
    href: "/calc/samsung-bonus",
  },
  {
    date: "2026-05-27",
    text: "삼성전자 임금협상 조합원 투표 가결 — DS부문 특별경영성과급(자사주) 신설",
    href: "/calc/samsung-bonus",
  },
  {
    date: "2026-02-05",
    text: "SK하이닉스 2025년 PS 기본급 2,964% 지급 — 상한 폐지 후 첫 적용",
    href: "/calc/sk-hynix-bonus",
  },
];
