// src/data/bonusData.ts
//
// 회사별 성과급 계산기 지급률 데이터 단일 소스 — 각 계산기 원본 파일에서
// "수기 전사"한 ETL 결과물 (docs/serp-strategy-2026.md 리포트 2호용).
//
// ── 전사 원칙 ────────────────────────────────────────────────
// 1. 원본 파일(sourceFile)에 실제 존재하는 값만 전사 — 수치 창작 금지.
// 2. 기준 구분: percentOfBase(월 기본급 대비 %) / percentOfSalary(연봉 대비 %) /
//    fixedAmountManwon(정액, 만원) 셋 중 정확히 하나만. 원본 계산식으로 판정했다.
// 3. "시뮬레이션 가정값"(UI 프리셋·사이클 가정 시나리오·노조 요구안 등 실지급이
//    아닌 것)은 제외. 실지급·타결·공기관 평가 확정치만 담는다.
//    제외 예: 현대차·기아 2026 노조 요구안 800%(협상 중), HD현대 노조 요구 1,400%,
//    포스코 평년 400%/슈퍼사이클 1,000%(사이클 가정), LG엔솔 200~900% 가정 구간,
//    LG화학 100%/400% 가정, 삼성SDI 48%(가정)·TAI 100%(모델 가정),
//    삼성디스플레이 상한 50%·TAI 상반기 전망(50/75%), 삼성바이오 TAI 하반기 가정,
//    두산 상한 530%/하한 100%(제도 상·하한), 한전 등급표 S250/C100(제도 표),
//    네이버·카카오 PI 10~40%(평가등급 구조), 삼성 DIVISIONS 가중치(시뮬 파라미터).
// 4. year 는 지급 연도. 실적 귀속 연도가 다르면 note 에 명시.
//    (SK하이닉스 PS 는 통상 실적 이듬해 2월 지급 — psData.ts 캘린더 기준)
// 5. 삼성전자는 제도가 둘(TAI·OPI)이고 원본 파일이 달라 프로필 2개로 분리했다
//    (같은 calcSlug "samsung-bonus"). 회사 수 집계는 calcSlug 기준 unique 로.
//
// ── 검증 ────────────────────────────────────────────────────
// node scripts/verify-bonus-data.mjs 가 각 payout 숫자값이 sourceFile 텍스트에
// 실제 등장하는지 검사한다(전사 오타 검출·Client.tsx 갱신 시 동기화 게이트).
// 주의: 검증 스크립트는 라인 스캔 방식이라 각 프로필에서 sourceFile 필드가
// payouts 배열보다 먼저 와야 한다. 필드 순서를 바꾸지 말 것.

export interface BonusPayout {
  /** 지급 연도 (실적 연도와 다르면 note 로 구분) */
  year: number;
  /** "OPI" | "TAI" | "PS" | "경영성과급" 등 원본 명칭 */
  scheme: string;
  /** 사업부 (DS, MX 등 — 있을 때만) */
  division?: string;
  /** 월 기본급 대비 % (셋 중 정확히 하나만) */
  percentOfBase?: number;
  /** 연봉(기준연봉) 대비 % */
  percentOfSalary?: number;
  /** 정액 (만원) */
  fixedAmountManwon?: number;
  /** 특이사항 (잠정합의·현금/주식 분할 등) */
  note?: string;
  /** 출처 (보도매체·공시 등 — 원본 파일의 출처 문구) */
  source: string;
}

export interface CompanyBonusProfile {
  companyId?: string;
  calcSlug: string;
  nameKo: string;
  /** 대표 제도명 */
  scheme: string;
  /** 전사 원본 파일 경로 */
  sourceFile: string;
  payouts: BonusPayout[];
}

export const BONUS_PROFILES: CompanyBonusProfile[] = [
  // ── 반도체·디스플레이 ──────────────────────────────────────
  {
    companyId: "samsung-electronics",
    calcSlug: "samsung-bonus",
    nameKo: "삼성전자",
    scheme: "TAI(목표달성장려금)",
    sourceFile: "src/app/calc/samsung-bonus/taiData.ts",
    payouts: [
      {
        year: 2026,
        scheme: "TAI",
        division: "메모리",
        percentOfBase: 100,
        note: "2026년 상반기 TAI — 발표 2026-07-06 · 지급 2026-07-08",
        source: "2026-07-06 사내 공지 · 뉴스핌·파이낸셜뉴스·헤럴드경제·ZDNet 교차 확인",
      },
      {
        year: 2026,
        scheme: "TAI",
        division: "반도체연구소·SAIT·DS공통",
        percentOfBase: 100,
        note: "2026년 상반기 TAI",
        source: "2026-07-06 사내 공지 · 복수 언론 교차 확인",
      },
      {
        year: 2026,
        scheme: "TAI",
        division: "CSS (화합물반도체솔루션)",
        percentOfBase: 100,
        note: "2026년 상반기 TAI — 지급일 전후 보도로 추가 확인",
        source: "뉴시스·파이낸셜뉴스 2026-07-06",
      },
      {
        year: 2026,
        scheme: "TAI",
        division: "시스템LSI",
        percentOfBase: 75,
        note: "2026년 상반기 TAI",
        source: "2026-07-06 사내 공지 · 복수 언론 교차 확인",
      },
      {
        year: 2026,
        scheme: "TAI",
        division: "파운드리",
        percentOfBase: 75,
        note: "2026년 상반기 TAI",
        source: "2026-07-06 사내 공지 · 복수 언론 교차 확인",
      },
      {
        year: 2026,
        scheme: "TAI",
        division: "MX (스마트폰)",
        percentOfBase: 50,
        note: "2026년 상반기 TAI",
        source: "2026-07-06 사내 공지 · 복수 언론 교차 확인",
      },
      {
        year: 2026,
        scheme: "TAI",
        division: "VD (영상디스플레이)",
        percentOfBase: 50,
        note: "2026년 상반기 TAI",
        source: "2026-07-06 사내 공지 · 복수 언론 교차 확인",
      },
      {
        year: 2026,
        scheme: "TAI",
        division: "네트워크",
        percentOfBase: 50,
        note: "2026년 상반기 TAI",
        source: "2026-07-06 사내 공지 · 복수 언론 교차 확인",
      },
      {
        year: 2026,
        scheme: "TAI",
        division: "SR·경영지원·기타",
        percentOfBase: 50,
        note: "2026년 상반기 TAI — 보도 원문 표기 'SR·경영지원·기타'",
        source: "2026-07-06 사내 공지 · 복수 언론 교차 확인",
      },
      {
        year: 2026,
        scheme: "TAI",
        division: "의료기기·한국총괄",
        percentOfBase: 75,
        note: "2026년 상반기 TAI",
        source: "2026-07-06 사내 공지 · 복수 언론 교차 확인",
      },
      {
        year: 2026,
        scheme: "TAI",
        division: "생활가전 (DA)",
        percentOfBase: 25,
        note: "2026년 상반기 TAI",
        source: "2026-07-06 사내 공지 · 복수 언론 교차 확인",
      },
    ],
  },
  {
    companyId: "samsung-electronics",
    calcSlug: "samsung-bonus",
    nameKo: "삼성전자",
    scheme: "OPI(초과이익성과금)",
    sourceFile: "src/app/calc/samsung-bonus/Client.tsx",
    payouts: [
      {
        year: 2026,
        scheme: "OPI",
        division: "MX",
        percentOfSalary: 50,
        note: "2025년 실적분 실지급 (OPI 통상 1월 지급) — 제도 상한 50% 도달",
        source: "Client.tsx 주석 전사 — 2025년 실적분 실지급 보도 기반",
      },
      {
        year: 2026,
        scheme: "OPI",
        division: "DS",
        percentOfSalary: 47,
        note: "2025년 실적분 실지급",
        source: "Client.tsx 주석 전사 — 2025년 실적분 실지급 보도 기반",
      },
      {
        year: 2026,
        scheme: "OPI",
        division: "VD",
        percentOfSalary: 12,
        note: "2025년 실적분 실지급",
        source: "Client.tsx 주석 전사 — 2025년 실적분 실지급 보도 기반",
      },
    ],
  },
  {
    companyId: "sk-hynix",
    calcSlug: "sk-hynix-bonus",
    nameKo: "SK하이닉스",
    scheme: "PS·PI",
    sourceFile: "src/app/calc/sk-hynix-bonus/psData.ts",
    payouts: [
      {
        year: 2022,
        scheme: "PS",
        percentOfBase: 1000,
        note: "2021년 실적분 — 상한(1,000%) 도달. 연간 PS는 통상 이듬해 2월 지급",
        source: "공개 보도 수치 (psData.ts PS_HISTORY)",
      },
      {
        year: 2023,
        scheme: "PS",
        percentOfBase: 600,
        note: "2022년 실적분 — 다운사이클",
        source: "공개 보도 수치 (psData.ts PS_HISTORY)",
      },
      {
        year: 2024,
        scheme: "PS",
        percentOfBase: 0,
        note: "2023년 실적분 — 적자(영업이익 -7.7조)로 PS 미지급",
        source: "공개 보도 수치 (psData.ts PS_HISTORY)",
      },
      {
        year: 2025,
        scheme: "PS",
        percentOfBase: 1500,
        note: "2024년 실적분 — HBM 호황 (영업이익 23.4조)",
        source: "공개 보도 수치 (psData.ts PS_HISTORY)",
      },
      {
        year: 2026,
        scheme: "PS",
        percentOfBase: 2964,
        note:
          "2025년 실적분 — 상한 폐지 첫 적용, 2026-02-05 지급. PS+PI 합계 3,264%. " +
          "2026년분(2027년 초 지급)부터 현금 40%+자사주 60%(당해 40%p+이연 10%p×2) " +
          "신 체계 잠정합의 — AGREEMENT_2026.status='tentative', 2026-08 말 총투표 예정",
        source: "SK하이닉스 사업보고서(2026-03)·한국경제 2026-08-20 등 (psData.ts SOURCES)",
      },
      {
        year: 2024,
        scheme: "PI",
        percentOfBase: 300,
        note: "2024년 실적분 연간 PI 합계(반기 합산) — 실적연도 기준 표기",
        source: "공개 보도 수치 (psData.ts PS_HISTORY)",
      },
      {
        year: 2025,
        scheme: "PI",
        percentOfBase: 300,
        note: "2025년 실적분 연간 PI 합계(반기 합산) — 실적연도 기준 표기",
        source: "공개 보도 수치 (psData.ts PS_HISTORY)",
      },
      {
        year: 2026,
        scheme: "PI",
        percentOfBase: 150,
        note: "2026년 상반기 PI 최대치 확정 — 2026-07-28 지급",
        source: "복수 언론 2026-07 (psData.ts PI_2026·SOURCES)",
      },
    ],
  },
  {
    companyId: "samsung-display",
    calcSlug: "samsung-display-bonus",
    nameKo: "삼성디스플레이",
    scheme: "OPI + TAI",
    sourceFile: "src/app/calc/samsung-display-bonus/Client.tsx",
    payouts: [
      {
        year: 2026,
        scheme: "OPI",
        percentOfSalary: 36,
        note: "2025년 실적분 — 2026-01-30 지급, 전 사업부 공통",
        source: "연합뉴스·디지털타임스 2026-01-28",
      },
      {
        year: 2025,
        scheme: "OPI",
        percentOfSalary: 40,
        note: "2024년 실적분 — 2025년 1월 지급",
        source: "연합뉴스 2026-01-28 기사 내 전년 수치 인용",
      },
      {
        year: 2025,
        scheme: "TAI",
        percentOfBase: 50,
        note: "2025년 하반기 TAI — 대형·중소형 모두 50%, 2025-12-24 지급",
        source: "뉴시스 2025-12-22",
      },
    ],
  },
  {
    companyId: "lg-display",
    calcSlug: "lg-display-bonus",
    nameKo: "LG디스플레이",
    scheme: "경영성과급",
    sourceFile: "src/app/calc/lg-display-bonus/Client.tsx",
    payouts: [
      {
        year: 2026,
        scheme: "경영성과급",
        percentOfBase: 150,
        note: "FY2025 실적분 — 2026년 2월 지급, 전 사업부 일괄, 4년 만의 지급 재개",
        source: "EBN·한국경제·아주경제·서울경제TV 2026-01-29",
      },
      {
        year: 2025,
        scheme: "경영성과급",
        percentOfBase: 0,
        note: "FY2022~FY2024 3년 연속 영업적자로 미지급 (지급연도 2023~2025 모두 0%)",
        source: "EBN·한국경제 2026-01-29",
      },
      {
        year: 2015,
        scheme: "경영성과급",
        percentOfBase: 300,
        note: "2015년 1월 지급 — 과거 호황 이력 (참고용)",
        source: "MTN 2015-01-30",
      },
    ],
  },
  // ── 배터리·화학·정유 ──────────────────────────────────────
  {
    companyId: "lgensol",
    calcSlug: "lg-energy-bonus",
    nameKo: "LG에너지솔루션",
    scheme: "성과급",
    sourceFile: "src/app/calc/lg-energy-bonus/Client.tsx",
    payouts: [
      {
        year: 2024,
        scheme: "성과급",
        percentOfBase: 50,
        note: "2024년 실지급 — 적자기",
        source: "LG에너지솔루션 분기 실적발표·뉴스웨이 2026-02 보도 (page.tsx 출처)",
      },
      {
        year: 2025,
        scheme: "성과급",
        percentOfBase: 75,
        note: "2025년 실지급",
        source: "LG에너지솔루션 분기 실적발표·뉴스웨이 2026-02 보도 (page.tsx 출처)",
      },
    ],
  },
  {
    companyId: "samsung-sdi",
    calcSlug: "samsung-sdi-bonus",
    nameKo: "삼성SDI",
    scheme: "OPI",
    sourceFile: "src/app/calc/samsung-sdi-bonus/Client.tsx",
    payouts: [
      {
        year: 2026,
        scheme: "OPI",
        division: "배터리·본사",
        percentOfSalary: 0,
        note: "2025년 실적분 — 배터리 캐즘으로 0%",
        source: "CEOSCOREDAILY·파이낸셜포스트·전자신문 보도 (page.tsx 출처)",
      },
      {
        year: 2026,
        scheme: "OPI",
        division: "전자재료",
        percentOfSalary: 5,
        note: "2025년 실적분 — 폴더블 OLED 수혜 사업부 (보도상 3~5% 중 상단값)",
        source: "CEOSCOREDAILY·파이낸셜포스트·전자신문 보도 (page.tsx 출처)",
      },
      {
        year: 2024,
        scheme: "OPI",
        division: "전자재료",
        percentOfSalary: 18,
        note: "2024년 초 지급 (전기차 호황기)",
        source: "CEOSCOREDAILY·파이낸셜포스트·전자신문 보도 (page.tsx 출처)",
      },
      {
        year: 2024,
        scheme: "OPI",
        division: "본사",
        percentOfSalary: 28,
        note: "2024년 초 지급 (전기차 호황기)",
        source: "CEOSCOREDAILY·파이낸셜포스트·전자신문 보도 (page.tsx 출처)",
      },
    ],
  },
  {
    companyId: "lg-chem",
    calcSlug: "lg-chem-bonus",
    nameKo: "LG화학",
    scheme: "PS·PI",
    sourceFile: "src/app/calc/lg-chem-bonus/Client.tsx",
    payouts: [
      {
        year: 2024,
        scheme: "PS",
        percentOfBase: 0,
        note: "다운사이클 2024 — PS 미지급. PI(월 기본급 200% 연간 고정)는 별도",
        source: "LG화학 노조 자료·공개 보도 (page.tsx 출처)",
      },
      {
        year: 2022,
        scheme: "PS",
        division: "첨단소재",
        percentOfBase: 600,
        note: "2022 호황기 평균",
        source: "서울경제 2022 보도·핀포인트뉴스 (page.tsx 출처)",
      },
      {
        year: 2022,
        scheme: "PS",
        division: "석유화학",
        percentOfBase: 850,
        note: "2022 슈퍼사이클 최대",
        source: "서울경제 2022 LG화학 850% 보도 (page.tsx 출처)",
      },
    ],
  },
  {
    companyId: "sk-innovation",
    calcSlug: "sk-innovation-bonus",
    nameKo: "SK이노베이션",
    scheme: "PS·LTI·STI",
    sourceFile: "src/app/calc/sk-innovation-bonus/Client.tsx",
    payouts: [
      {
        year: 2025,
        scheme: "PS+LTI+STI 합산",
        division: "SK이노베이션(울산CLX)",
        percentOfBase: 660,
        note: "FY2024 실적분 — PS 280% + LTI 70% + STI 190%(7월) + 하반기 120%",
        source: "디지털타임스 단독·EBN 2025-02-06 / SBS Biz",
      },
      {
        year: 2025,
        scheme: "성과급 합산",
        division: "SK엔무브",
        percentOfBase: 800,
        note: "FY2024 실적분 — 계열사 중 최대 지급률",
        source: "EBN 2025-02-06",
      },
      {
        year: 2025,
        scheme: "성과급 합산",
        division: "SK어스온",
        percentOfBase: 400,
        note: "FY2024 실적분 — 자원개발 계열",
        source: "EBN 2025-02-06",
      },
      {
        year: 2025,
        scheme: "성과급 합산",
        division: "SK온",
        percentOfBase: 0,
        note: "FY2024 실적분 — 2024년 1조 1,270억원 적자로 미지급",
        source: "EBN 2025-02-06",
      },
      {
        year: 2024,
        scheme: "PS",
        division: "울산CLX",
        percentOfBase: 612,
        note: "FY2023 실적분 — PS만 확인된 수치 (LTI·STI 등 타 구성 미포함)",
        source: "뉴스핌 2024-02-16·이데일리 단독",
      },
    ],
  },
  {
    companyId: "s-oil",
    calcSlug: "s-oil-bonus",
    nameKo: "S-Oil",
    scheme: "경영성과급",
    sourceFile: "src/app/calc/s-oil-bonus/Client.tsx",
    payouts: [
      {
        year: 2025,
        scheme: "경영성과급",
        percentOfBase: 250,
        note: "2024년 실적분 — 2025-02 지급 확정. 영업이익 4,606억원(전년비 -66%)",
        source: "데일리한국·네이트뉴스 2025-02-20",
      },
      {
        year: 2024,
        scheme: "경영성과급",
        percentOfBase: 800,
        note: "2023년 실적분 — 2024년 초 지급",
        source: "데일리한국 2025-02-20 기사 내 전년 비교 인용",
      },
      {
        year: 2023,
        scheme: "경영성과급",
        percentOfBase: 1500,
        note: "2022년 실적분 — 2023년 초 지급. 시사오늘은 1,470%로 보도(매체 간 차이)",
        source: "파이낸셜뉴스 2024-02-05",
      },
    ],
  },
  {
    companyId: "gs-caltex",
    calcSlug: "gs-caltex-bonus",
    nameKo: "GS칼텍스",
    scheme: "경영성과급",
    sourceFile: "src/app/calc/gs-caltex-bonus/Client.tsx",
    payouts: [
      {
        year: 2026,
        scheme: "경영성과급",
        percentOfSalary: 25,
        note: "2025 실적분 — 2026년 초 지급. 직전 12.5%의 2배 (기본급 500% 환산)",
        source: "SBS Biz 2026-02-22",
      },
      {
        year: 2025,
        scheme: "경영성과급",
        percentOfSalary: 12.5,
        note: "2024 실적분 — 2025-01-24 지급. 기본급 250% 환산 + 온누리상품권 15만원",
        source: "디지털타임스 단독 2025-01-21",
      },
      {
        year: 2024,
        scheme: "경영성과급",
        percentOfSalary: 40,
        note: "2023 실적분 — 2024-01-31 지급. 기본급 800% 환산",
        source: "파이낸셜뉴스 2024-02-05",
      },
      {
        year: 2023,
        scheme: "경영성과급",
        percentOfSalary: 50,
        note:
          "2022 실적분 — 2023-01 지급, 평균 5천만원 수준. " +
          "기본급 1,000%+격려금 200% 보도(뉴스저널리즘)도 있어 매체 간 차이 존재",
        source: "남도일보 2023-01",
      },
    ],
  },
  // ── 자동차·중공업·철강 ────────────────────────────────────
  {
    companyId: "hyundai",
    calcSlug: "hyundai-bonus",
    nameKo: "현대자동차",
    scheme: "임단협 성과금·격려금",
    sourceFile: "src/app/calc/hyundai-bonus/Client.tsx",
    payouts: [
      {
        year: 2025,
        scheme: "임단협 성과금(정률)",
        percentOfBase: 450,
        note: "2025 잠정합의 (실제 지급) — 성과금 350%+격려금 100% 합산",
        source: "2025년 9월 현대차 임단협 잠정합의안 (현대차그룹 공식 발표·녹색경제·전자신문)",
      },
      {
        year: 2025,
        scheme: "임단협 격려금(정액)",
        fixedAmountManwon: 1580,
        note:
          "2025 잠정합의 — 정액 700만+380만+추가 500만 합산 1,580만원. " +
          "별도 무상주 30주·전통시장 상품권 20만원",
        source: "2025년 9월 현대차 임단협 잠정합의안 (현대차그룹 공식 발표·녹색경제·전자신문)",
      },
    ],
  },
  {
    companyId: "kia",
    calcSlug: "kia-bonus",
    nameKo: "기아",
    scheme: "임단협 성과금·격려금",
    sourceFile: "src/app/calc/kia-bonus/Client.tsx",
    payouts: [
      {
        year: 2025,
        scheme: "임단협 성과금(정률)",
        percentOfBase: 450,
        note: "2025 잠정합의 (실제 지급) — 성과금 350%+격려금 100% 합산",
        source: "2025년 9월 기아 임단협 잠정합의안 (녹색경제·전자신문·지피코리아·삼프로TV)",
      },
      {
        year: 2025,
        scheme: "임단협 격려금(정액)",
        fixedAmountManwon: 1600,
        note:
          "2025 잠정합의 — 정액 700만+400만+World Car 500만 합산 1,600만원. " +
          "별도 무상주 53주·전통시장 상품권 20만원",
        source: "2025년 9월 기아 임단협 잠정합의안 (녹색경제·전자신문·지피코리아·삼프로TV)",
      },
    ],
  },
  {
    companyId: "hyundai-mobis",
    calcSlug: "hyundai-mobis-bonus",
    nameKo: "현대모비스",
    scheme: "임단협 성과금·격려금",
    sourceFile: "src/app/calc/hyundai-mobis-bonus/Client.tsx",
    payouts: [
      {
        year: 2025,
        scheme: "임단협 성과금(정률)",
        percentOfBase: 450,
        note: "2025 임단협 타결 (2025-10-17) — 기본급 10만원 인상 별도",
        source: "전자신문·서울경제·아주경제 2025-10-17",
      },
      {
        year: 2025,
        scheme: "임단협 격려금(정액)",
        fixedAmountManwon: 1420,
        note: "2025 임단협 타결 — 별도 우리사주 17주·재래시장상품권 20만원",
        source: "전자신문·서울경제·아주경제 2025-10-17",
      },
      {
        year: 2024,
        scheme: "임단협 성과금(정률)",
        percentOfBase: 500,
        note: "2024 임협 합의 — 성과금·격려금 총 500%",
        source: "머니S 단독 2024-07-09",
      },
      {
        year: 2024,
        scheme: "임단협 격려금(정액)",
        fixedAmountManwon: 1520,
        note:
          "2024 임협 합의 — 별도 주식 총 36주(11+20+5). " +
          "우리사주출연 리워드 100~150만원은 출연 조건부라 합산 제외",
        source: "머니S 단독 2024-07-09",
      },
    ],
  },
  {
    companyId: "hyundai-rotem",
    calcSlug: "hyundai-rotem-bonus",
    nameKo: "현대로템",
    scheme: "임단협 경영성과금",
    sourceFile: "src/app/calc/hyundai-rotem-bonus/Client.tsx",
    payouts: [
      {
        year: 2025,
        scheme: "임단협 성과금(정률)",
        percentOfBase: 450,
        note: "2025년 임단협 타결안 (2025-12-24 가결, 찬성률 59.38%) — 조합원 평균 3,380만원",
        source: "데일리안·아시아경제 2025-12-24 (page.tsx 출처)",
      },
      {
        year: 2025,
        scheme: "임단협 정액금",
        fixedAmountManwon: 1620,
        note: "2025년 임단협 타결안 — 별도 온누리상품권 20만원",
        source: "데일리안·아시아경제 2025-12-24 (page.tsx 출처)",
      },
      {
        year: 2024,
        scheme: "임단협 성과금(정률)",
        percentOfBase: 500,
        note: "2024년 임단협 — 조합원 평균 3,508만원",
        source: "공개 보도 (Client.tsx 시나리오 전사)",
      },
      {
        year: 2024,
        scheme: "임단협 정액금",
        fixedAmountManwon: 1800,
        note: "2024년 임단협",
        source: "공개 보도 (Client.tsx 시나리오 전사)",
      },
    ],
  },
  {
    companyId: "hd-hyundai-heavy",
    calcSlug: "hd-hyundai-bonus",
    nameKo: "HD현대중공업",
    scheme: "연말 성과급",
    sourceFile: "src/app/calc/hd-hyundai-bonus/Client.tsx",
    payouts: [
      {
        year: 2025,
        scheme: "연말 성과급",
        percentOfBase: 600,
        note: "2025 연말 — 통합 HD현대중공업",
        source: "2025년 12월 연말 성과급 보도 (아주경제·ZDNet — page.tsx 출처)",
      },
      {
        year: 2025,
        scheme: "연말 성과급",
        division: "HD현대삼호",
        percentOfBase: 837,
        note: "2025 연말 — 사업부(계열)별 차등",
        source: "2025년 12월 연말 성과급 보도 (아주경제·ZDNet — page.tsx 출처)",
      },
    ],
  },
  {
    companyId: "doosan-enerbility",
    calcSlug: "doosan-enerbility-bonus",
    nameKo: "두산에너빌리티",
    scheme: "경영성과급",
    sourceFile: "src/app/calc/doosan-enerbility-bonus/Client.tsx",
    payouts: [
      {
        year: 2025,
        scheme: "경영성과급",
        percentOfSalary: 27,
        note:
          "2025 지급 실적 — 전 직원 연봉의 약 27%를 재원으로 평가 차등 지급. " +
          "제도상 상한 기본급 530%·하한 100% (개인별 일괄 % 공표 없음)",
        source: "조선일보 2026-05-12 (상한·하한은 서울경제 2026-05-21)",
      },
    ],
  },
  {
    companyId: "hanwha-aerospace",
    calcSlug: "hanwha-aerospace-bonus",
    nameKo: "한화에어로스페이스",
    scheme: "경영성과급(BPI+VEI)",
    sourceFile: "src/app/calc/hanwha-aerospace-bonus/Client.tsx",
    payouts: [
      {
        year: 2026,
        scheme: "BPI+VEI",
        division: "지상방산 (LS)",
        percentOfBase: 725,
        note: "FY2025 실적분 — 2026년 2월 지급, 사업부 최고 지급률",
        source: "한국경제TV 단독·알파경제 2026-02-13",
      },
      {
        year: 2026,
        scheme: "BPI+VEI",
        division: "유도무기 (PGM)",
        percentOfBase: 702.8,
        note: "FY2025 실적분 — 2026년 2월 지급",
        source: "한국경제TV 단독·알파경제 2026-02-13",
      },
      {
        year: 2026,
        scheme: "BPI+VEI",
        division: "MRO",
        percentOfBase: 510.6,
        note: "FY2025 실적분 — 2026년 2월 지급",
        source: "한국경제TV 단독·알파경제 2026-02-13",
      },
      {
        year: 2026,
        scheme: "BPI+VEI",
        division: "항공",
        percentOfBase: 494.8,
        note: "FY2025 실적분 — 2026년 2월 지급",
        source: "한국경제TV 단독·알파경제 2026-02-13",
      },
      {
        year: 2026,
        scheme: "BPI+VEI",
        division: "그 외 사업부",
        percentOfBase: 497,
        note: "FY2025 실적분 — 보도 기준 497~507%대, 보수적으로 하한 497% 적용",
        source: "한국경제TV 단독·알파경제 2026-02-13",
      },
      {
        year: 2026,
        scheme: "정액 인센티브",
        fixedAmountManwon: 400,
        note: "FY2025 실적분 — 목표 영업이익 초과 달성 정액, 전 임직원",
        source: "한국경제TV 단독·알파경제 2026-02-13",
      },
      {
        year: 2025,
        scheme: "BPI+VEI",
        percentOfBase: 710,
        note: "FY2024 실적분 — 2025년 2월 지급",
        source: "뉴스1·파이낸셜뉴스 2025-02-19",
      },
      {
        year: 2025,
        scheme: "일시금(정액)",
        fixedAmountManwon: 500,
        note: "FY2024 실적분 — 일시금",
        source: "뉴스1·파이낸셜뉴스 2025-02-19",
      },
    ],
  },
  {
    companyId: "posco",
    calcSlug: "posco-bonus",
    nameKo: "포스코",
    scheme: "PI·PS",
    sourceFile: "src/app/calc/posco-bonus/Client.tsx",
    payouts: [
      {
        year: 2025,
        scheme: "성과급",
        percentOfBase: 800,
        note: "2025-04 직고용 발표 사례 — 호황 구간 지급률",
        source: "2025-04 포스코 직고용 발표 (국민일보·부산일보 — page.tsx 출처)",
      },
    ],
  },
  // ── IT·바이오·공기업 ──────────────────────────────────────
  {
    companyId: "naver",
    calcSlug: "naver-bonus",
    nameKo: "네이버",
    scheme: "PI + RSU",
    sourceFile: "src/app/calc/naver-bonus/Client.tsx",
    payouts: [
      {
        year: 2025,
        scheme: "RSU",
        fixedAmountManwon: 2765,
        note:
          "2025년 자사주 465억원(약 22만주)을 1,683명에게 지급한 단순 평균 — " +
          "임원·핵심 인재 집중이라 일반 직원은 더 적음. PI는 연봉 대비 10~40% 평가 차등 구조(연도별 실지급률 미공개)",
        source: "2025 네이버 자사주 처분 공시 + 디지털투데이·뉴스1·아시아경제 보도, 더벨 RSU 분석",
      },
    ],
  },
  {
    companyId: "kakao",
    calcSlug: "kakao-bonus",
    nameKo: "카카오",
    scheme: "PI + RSU + 격려금",
    sourceFile: "src/app/calc/kakao-bonus/Client.tsx",
    payouts: [
      {
        year: 2026,
        scheme: "격려금",
        fixedAmountManwon: 100,
        note: "2026 격려금 100만원. PI는 연봉 대비 10~40% 평가 차등 구조(연도별 실지급률 미공개)",
        source: "2026-05 임금협상 보도 (뉴스웨이 — page.tsx 출처)",
      },
      {
        year: 2026,
        scheme: "RSU",
        fixedAmountManwon: 670,
        note: "1인 평균 RSU 가치 약 670만원 (자사주 처분 공시 기반 평균)",
        source: "2026 카카오 자사주 처분 공시 (데이터투자·DealSite경제TV·인베스팅닷컴 — page.tsx 출처)",
      },
    ],
  },
  {
    companyId: "celltrion",
    calcSlug: "celltrion-bonus",
    nameKo: "셀트리온",
    scheme: "경영성과급",
    sourceFile: "src/app/calc/celltrion-bonus/Client.tsx",
    payouts: [
      {
        year: 2026,
        scheme: "경영성과급",
        percentOfSalary: 50,
        note:
          "2025년 실적분 — 최대 50% 수준(최고 등급 상한, 기본급 연봉 대비). " +
          "1월 약 43% 선지급 + 3월 평가 확정 후 잔여 지급",
        source: "데일리메디 2026-02-02",
      },
      {
        year: 2025,
        scheme: "경영성과급",
        percentOfSalary: 53,
        note: "2024년 실적분 — 2025-01-08 지급, 최고 등급 최대 53% (역대 최대)",
        source: "파이낸셜뉴스 2025-01-05 · 알티케이뉴스 2025-01-08",
      },
      {
        year: 2024,
        scheme: "경영성과급",
        percentOfSalary: 42,
        note: "2023년 실적분 — 2024년 초 지급",
        source: "파이낸셜뉴스 2025-01-05 · 알티케이뉴스 2025-01-08",
      },
    ],
  },
  {
    companyId: "samsung-biologics",
    calcSlug: "samsung-biologics-bonus",
    nameKo: "삼성바이오로직스",
    scheme: "OPI + TAI",
    sourceFile: "src/app/calc/samsung-biologics-bonus/Client.tsx",
    payouts: [
      {
        year: 2026,
        scheme: "OPI",
        percentOfSalary: 50,
        note: "2025년 실적분 — 연봉의 50% 상한, 2026-01 지급 예상 보도",
        source: "아시아경제 2025-12-27 · 산경투데이·컨슈머타임스 2025-12-26",
      },
      {
        year: 2025,
        scheme: "OPI",
        percentOfSalary: 50,
        note: "2024년 실적분 — 연봉의 50% 상한, 2025-01 지급",
        source: "한국경제 2025-07-08",
      },
      {
        year: 2025,
        scheme: "TAI",
        percentOfBase: 100,
        note: "2025년 상반기 TAI 100% 확정 (하반기 확정치는 보도 미확보)",
        source: "한국경제 등 2025-07-08",
      },
    ],
  },
  {
    companyId: "kepco",
    calcSlug: "kepco-bonus",
    nameKo: "한국전력",
    scheme: "공공기관 경영평가 성과급",
    sourceFile: "src/app/calc/kepco-bonus/Client.tsx",
    payouts: [
      {
        year: 2026,
        scheme: "경영평가 성과급",
        percentOfBase: 200,
        note: "2025년도 평가 A등급(2년 연속) — 공기업 A등급 직원 성과급 = 월 기본급의 200% 상당",
        source: "이투데이 2026-06-19",
      },
      {
        year: 2025,
        scheme: "경영평가 성과급",
        percentOfBase: 200,
        note: "2024년도 평가 A등급(우수) 복귀",
        source: "아시아경제 2026-06-20 회고",
      },
      {
        year: 2024,
        scheme: "경영평가 성과급",
        percentOfBase: 150,
        note: "2023년도 평가 B등급(양호)",
        source: "지급률 표 — 비즈니스포스트 2024-06-17",
      },
      {
        year: 2023,
        scheme: "경영평가 성과급",
        percentOfBase: 0,
        note: "2022년도 평가 D등급(미흡) — 성과급 미지급",
        source: "아시아경제 2026-06-20 회고",
      },
    ],
  },
];
