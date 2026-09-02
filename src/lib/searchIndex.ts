// src/lib/searchIndex.ts
//
// 헤더 통합 검색용 정적 인덱스.
// 계산기·가이드·글로서리·Q&A·회사·시즌페이지를 단일 배열로 합쳐 빠른 클라이언트 검색 지원.

import { allCalculators } from "@/lib/simpleCalculators";
// 카드 메타만 사용 — 본문 포함 guidesContent 를 import 하면 헤더 검색 청크에
// 가이드 본문 전체가 실린다 (2026-08-26 Phase 4 물리 분리)
import { koGuideCards } from "@/lib/guidesData";
import { glossaryData, toGlossarySlug } from "@/data/glossaryData";
import { qnaData, toQnaSlug } from "@/data/qnaData";
import { companyRepository } from "@/lib/salary-data/CompanyRepository";
import { bonusCalcCountKo, companyCountKo } from "@/config/site";
// 회사별 성과급 계산기 레지스트리(순수 데이터 10KB, import 0) — 허브 카드와 동일 소스로 검색 등재 (전면 최적화, 운영자 지시 2026-09-02)
import { BONUS_CALCS } from "@/data/bonusCalcHub";

export type SearchCategory =
 | "계산기"
 | "가이드"
 | "용어"
 | "Q&A"
 | "회사"
 | "시즌"
 | "도구";

export interface SearchEntry {
 title: string;
 href: string;
 category: SearchCategory;
 description?: string;
 /** 검색 매칭 우선순위 (1이 가장 높음) */
 priority?: number;
}

const seasonPages: SearchEntry[] = [
 // 2026-07-16 — 7월 시즌: 2027 최저임금 의결·세법개정안 선점 + 기존 미등록 갭(최저임금 2026) 해소
 { title: "2027 최저임금 10,700원 확정", href: "/minimum-wage-2027", category: "시즌", description: "+3.7% 인상, 월 2,236,300원 환산", priority: 1 },
 { title: "2026 최저임금 (현행)", href: "/minimum-wage-2026", category: "시즌", description: "시급 10,320원·월 2,156,880원", priority: 2 },
 { title: "2026 세법개정안 확정 발표", href: "/tax-reform-2026", category: "시즌", description: "8월 3일 발표·과표 유지, 공제 확대", priority: 2 },
 { title: "2026 종합소득세 신고 가이드", href: "/year-end-tax-2026", category: "시즌", description: "5월 프리랜서·N잡러" },
 { title: "2026 건강보험료 정산", href: "/health-insurance-2026", category: "시즌", description: "4월 정산·분납·환급" },
 { title: "2026 연말정산 + 성과급", href: "/year-end-tax-settlement-2026", category: "시즌", description: "12월 근로자 절세" },
 { title: "2026 신입 연봉 협상", href: "/new-employee-2026", category: "시즌", description: "3월 첫 협상" },
 { title: "연말정산 체크리스트", href: "/year-end-tax-checklist", category: "시즌", description: "12월 31일 마감" },
 { title: "2026 세율표", href: "/tax-rates-2026", category: "시즌", description: "소득세 구간" },
 { title: "2026 4대보험 요율", href: "/social-insurance-rates-2026", category: "시즌" },
 { title: "2026 세법 변경사항", href: "/tax-changes-2026", category: "시즌" },
 { title: "퇴직연금 DB·DC·IRP", href: "/retirement-pension-2026", category: "시즌" },
 { title: "삼성 신입 연봉 협상", href: "/samsung-negotiation-2026", category: "시즌" },
 { title: "삼성전자 성과급 계산기", href: "/calc/samsung-bonus", category: "계산기", description: "OPI·TAI 세후 실수령", priority: 1 },
 // 2026-08-07 — 기업 성과급 계산기 검색 인덱스 갭 해소 (기존 10종 미등록) + 신규 2종
 { title: "SK하이닉스 성과급 계산기", href: "/calc/sk-hynix-bonus", category: "계산기", description: "PS·PI 세전·세후 즉시 계산", priority: 1 },
 { title: "현대차 성과급 계산기", href: "/calc/hyundai-bonus", category: "계산기", description: "2026 임협 타결 400% + 1,270만 + 주식 15주 세후", priority: 1 },
 { title: "기아 성과급 계산기", href: "/calc/kia-bonus", category: "계산기", description: "2026 타결 400% + 1,270만 + 자사주 47주 세후", priority: 2 },
 { title: "LG에너지솔루션 성과급 계산기", href: "/calc/lg-energy-bonus", category: "계산기", description: "배터리 사이클 50~900% 시나리오", priority: 2 },
 { title: "HD현대중공업 성과급 계산기", href: "/calc/hd-hyundai-bonus", category: "계산기", description: "조선 슈퍼사이클 600%+", priority: 2 },
 { title: "네이버 성과급·RSU 계산기", href: "/calc/naver-bonus", category: "계산기", description: "PI 10~40% + 자사주 RSU", priority: 2 },
 { title: "카카오 성과급·RSU 계산기", href: "/calc/kakao-bonus", category: "계산기", description: "PI + RSU + 격려금", priority: 2 },
 { title: "포스코 성과급 계산기", href: "/calc/posco-bonus", category: "계산기", description: "철강 사이클 PI + PS 시나리오", priority: 2 },
 { title: "삼성SDI 성과급 계산기", href: "/calc/samsung-sdi-bonus", category: "계산기", description: "OPI 0~48% + TAI", priority: 2 },
 { title: "LG화학 성과급 계산기", href: "/calc/lg-chem-bonus", category: "계산기", description: "PS(0~850%) + PI(고정 200%)", priority: 2 },
 { title: "셀트리온 성과급 계산기", href: "/calc/celltrion-bonus", category: "계산기", description: "연봉의 최대 50~53% 등급별 — 1월 선지급+3월 잔여 반영", priority: 1 },
 { title: "현대로템 성과급 계산기", href: "/calc/hyundai-rotem-bonus", category: "계산기", description: "2025 타결안 450%+1,620만·2024년 500%+1,800만 시나리오", priority: 1 },
 { title: "직장인 단계별 자산", href: "/career-stages-2026", category: "시즌", description: "20~50대" },
 { title: "연봉 인상 협상 시뮬레이터", href: "/salary-raise-2026", category: "계산기", description: "인상률·5년 누적 효과", priority: 1 },
 // 7차 신설 7개 정적 계산기 (8차 점검에서 추가) — 사이트 내부 검색 노출
 { title: "2026 자동차세 계산기", href: "/auto-tax-2026", category: "계산기", description: "배기량·차령·연납 5% 공제", priority: 2 },
 { title: "2026 주휴수당 계산기", href: "/weekly-holiday-allowance-2026", category: "계산기", description: "최저시급 10,320원 주 40h 82,560원", priority: 2 },
 { title: "2026 종합소득세 계산기", href: "/income-tax-2026", category: "계산기", description: "8단계 누진세율 + 지방소득세 10%", priority: 1 },
 { title: "2026 부동산 보유세 계산기", href: "/property-holding-tax-2026", category: "계산기", description: "재산세 7·9월 + 종부세 12월", priority: 2 },
 { title: "2026 건강보험료 계산기", href: "/health-insurance-fee-2026", category: "계산기", description: "본인부담 3.595% + 장기요양 합산 약 4.07%", priority: 1 },
 { title: "2026 국민연금 예상수령액", href: "/national-pension-estimate-2026", category: "계산기", description: "가입기간 비례 소득대체율 43%", priority: 2 },
 { title: "2026 적금·예금 이자 계산기", href: "/savings-interest-2026", category: "계산기", description: "정기적금/예금, 단리/복리, 세후 이자", priority: 2 },
 // 2026-08-08 — 연말정산 롱테일 계산기 3종 (12~2월 시즌 선점)
 { title: "신용카드 소득공제 계산기", href: "/credit-card-deduction-2026", category: "계산기", description: "총급여 25% 문턱·결제수단별 공제율·한도 자동 계산", priority: 1 },
 { title: "월세 세액공제 계산기", href: "/rent-tax-credit-2026", category: "계산기", description: "총급여별 15~17%·연 1,000만 한도 — 최대 170만원 환급", priority: 1 },
 { title: "의료비 세액공제 계산기", href: "/medical-tax-credit-2026", category: "계산기", description: "총급여 3% 문턱·난임 30%·실손 차감 반영", priority: 1 },
 // 2026-08-31 — 8/30 성장 배포 6건 검색 인덱스 등재 (배포 점검 후속: 헤더 검색 0건 결함 수리)
 { title: "통상임금 계산기", href: "/calc/ordinary-wage", category: "계산기", description: "2024 전합 판결 반영 — 시간급·수당 파급액", priority: 1 },
 { title: "연차 개수 계산기", href: "/calc/annual-leave-days", category: "계산기", description: "입사일 기준 연도별 연차 발생 — 회계연도 비교", priority: 1 },
 { title: "국민연금 인상 계산기 (2027)", href: "/calc/pension-hike-2027", category: "계산기", description: "요율 9.5→10% — 매달 더 내는 보험료 즉시 계산", priority: 1 },
 { title: "2026 군인 월급 (병사·간부 봉급표)", href: "/military-pay-2026", category: "시즌", description: "병장 150만원·장병내일준비적금 매칭 55만", priority: 1 },
 { title: "2026 교사 호봉표", href: "/teacher-pay-2026", category: "시즌", description: "9호봉 249만원~40호봉 620만원·담임수당", priority: 1 },
 { title: "2026 경찰 봉급표", href: "/police-pay-2026", category: "시즌", description: "순경 1호봉 213만원부터 계급별 호봉표", priority: 2 },
 { title: "2026 소방관 봉급표", href: "/firefighter-pay-2026", category: "시즌", description: "소방사 1호봉 213만원부터 계급별 호봉표", priority: 2 },
 { title: "2026 공무원 봉급표", href: "/civil-servant-pay-2026", category: "시즌", description: "9급 1호봉 213만원·직급별 봉급표", priority: 1 },
 { title: "2027 공무원 봉급표 — 3.9% 인상 확정(예산안)", href: "/civil-servant-pay-2027", category: "시즌", description: "16년 만 최대 인상·9급~5급 예상 월급·확정 일정", priority: 1 },
 // 2026-08-31 — R2 신규 8건 (연말정산 시즌 패키지·뉴스 트리거·이직)
 { title: "맞벌이 연말정산 몰아주기 계산기", href: "/calc/dual-income-year-end", category: "계산기", description: "자녀공제·의료비 귀속 시나리오별 부부 합산 세액 비교", priority: 1 },
 { title: "기부금 세액공제 계산기", href: "/donation-tax-credit-2026", category: "계산기", description: "정치자금·고향사랑 전액공제·종교 10% 한도·10년 이월", priority: 1 },
 { title: "부양가족 인적공제 판정기", href: "/calc/dependent-check", category: "계산기", description: "부모님·형제 기본공제 150만원 가능 여부 즉시 판정", priority: 1 },
 { title: "건강보험 피부양자 자격 판정기", href: "/health-insurance-dependent", category: "계산기", description: "소득 2,000만·재산 5.4억 기준 유지/탈락 판정", priority: 1 },
 { title: "희망퇴직 위로금 실수령 계산기", href: "/calc/voluntary-retirement", category: "계산기", description: "위로금+퇴직금 합산 퇴직소득세·실수령 즉시 계산", priority: 1 },
 { title: "중소기업 취업자 소득세 감면 계산기", href: "/calc/smb-income-tax-break", category: "계산기", description: "청년 90%·5년 절감액 — 경정청구 소급까지", priority: 2 },
 { title: "이직 오퍼 실수령 비교", href: "/calc/offer-compare", category: "계산기", description: "오퍼 최대 10개 세후 월 실수령 순위 비교", priority: 2 },
 { title: "2027 4대보험 요율표", href: "/social-insurance-rates-2027", category: "시즌", description: "국민연금 10% 확정 — 내 월급 공제 변화", priority: 2 },
 // 2026-09-02 전면 최적화 (운영자 지시) — 헤더 검색 미등재 갭: 9월 시즌·연말정산 허브·전용 계산기 페이지 (제목·설명은 각 페이지 메타 기준)
 { title: "추석 상여금 2026 — 평균 지급액·세금 총정리", href: "/chuseok-bonus-2026", category: "시즌", description: "기업 규모별 평균·지급 의무·떡값 과세·연휴 근무수당", priority: 1 },
 { title: "명절 상여금 세금 계산기", href: "/calc/holiday-bonus", category: "계산기", description: "추석·설 상여금 세후 실수령 즉시 계산", priority: 1 },
 { title: "연말정산 2027 총정리 허브", href: "/year-end-tax-2027", category: "시즌", description: "2026년 귀속 — 일정·계산기·단계별 로드맵", priority: 1 },
 { title: "홈택스 연말정산 미리보기 이용법", href: "/year-end-tax-preview", category: "시즌", description: "오픈 시점·절차·확인 포인트", priority: 2 },
 { title: "중도퇴사자 연말정산", href: "/year-end-tax-mid-resign", category: "시즌", description: "퇴사 후 환급 방법·이직 합산·경정청구", priority: 2 },
 { title: "신입 초봉 2026 TOP 50", href: "/new-employee-salary-2026", category: "시즌", description: `회사 ${companyCountKo} 영끌 연봉 인덱스`, priority: 2 },
 { title: "2026 국민건강검진 안내", href: "/health-checkup-2026", category: "시즌", description: "직장인 무료 검진 + 5대 암검진 본인부담 10%", priority: 2 },
 { title: "기초연금 계산기 2026", href: "/basic-pension-2026", category: "계산기", description: "월 349,700원 기준·감액 3종 간이 계산", priority: 2 },
 { title: "실업급여 계산기 2026", href: "/unemployment-benefit", category: "계산기", description: "수령액·기간·신청 조건 즉시 계산", priority: 1 },
 { title: "근로장려금 계산기 2026", href: "/earned-income-credit", category: "계산기", description: "단독·홑벌이·맞벌이 수령액 즉시 계산", priority: 1 },
 { title: "육아휴직 급여 계산기 2026", href: "/parental-leave", category: "계산기", description: "6+6 부모 육아휴직 수령액 즉시 계산", priority: 2 },
 { title: "2026 연봉 계산기 PRO", href: "/calc/2026-year", category: "계산기", description: "최신 세법·티어 카드·자산 시뮬", priority: 2 },
 { title: "성과급 세금 계산기", href: "/calc/year-end-bonus", category: "계산기", description: "연말 성과급 세후 실수령", priority: 2 },
 { title: "연말 보너스 세금 계산기", href: "/calc/year-end-bonus-tax", category: "계산기" },
 { title: "13월의 월급 시뮬레이터", href: "/calc/january-bonus", category: "계산기", priority: 2 },
 { title: "인센티브 분리과세 계산기", href: "/calc/incentive-tax", category: "계산기" },
 { title: "자녀공제 계산기", href: "/calc/child-deduction", category: "계산기" },
 { title: "청약저축 소득공제 계산기", href: "/calc/housing-subscription", category: "계산기" },
 { title: "전세대출 계산기", href: "/calc/jeonse-loan", category: "계산기" },
 { title: "퇴직금 vs 퇴직연금 비교", href: "/calc/severance-vs-pension", category: "계산기" },
 { title: "연차수당 계산기", href: "/calc/vacation-pay", category: "계산기" },
];

const toolPages: SearchEntry[] = [
 { title: "주택담보대출 계산", href: "/home-loan", category: "도구", description: "DSR·LTV·월 상환" },
 { title: "자동차 구매·할부", href: "/car-loan", category: "도구" },
 { title: "FIRE 은퇴 계산기", href: "/fire-calculator", category: "도구" },
 { title: "연말정산 환급금 계산", href: "/year-end-tax", category: "도구" },
 { title: "MBTI 연봉 분석", href: "/mbti-salary", category: "도구" },
 { title: "해외 연봉 비교", href: "/global", category: "도구" },
 { title: "커리어 플래너", href: "/pro/career-planner", category: "도구" },
 { title: "기업별 연봉 DB", href: "/salary-db", category: "도구", description: `${companyCountKo} 기업`, priority: 1 },
 { title: "100가지 계산기 인덱스", href: "/calc", category: "도구", priority: 1 },
 { title: "전체 가이드", href: "/guides", category: "도구" },
 { title: "용어 사전", href: "/glossary", category: "도구" },
 { title: "Q&A 인덱스", href: "/qna", category: "도구" },
 { title: "Fun 콘텐츠", href: "/fun", category: "도구", description: "게임·테스트" },
 { title: "2026 연봉 실수령액 표", href: "/table/2026/annual", category: "도구" },
 { title: "2026 월급 실수령액 표", href: "/table/2026/monthly", category: "도구" },
 // 2026-08-31 — 8/30 신설 2027 표·상장사 랭킹 등재
 { title: "2027 연봉 실수령액 표", href: "/table/2027/annual", category: "도구", description: "최저임금 223.6만·연금 5% 선반영" },
 { title: "2027 월급 실수령액 표", href: "/table/2027/monthly", category: "도구" },
 { title: "상장사 공시 연봉 DB", href: "/salary-db/listed", category: "도구", description: "DART 사업보고서 기준 — 추정 0" },
 { title: "연봉 인상률 TOP 100 (상장사)", href: "/salary-db/listed/top-raise", category: "도구", description: "공시 기준 전년比 인상률 순위" },
 // 2026-09-02 전면 최적화 (운영자 지시) — /tools 트리(리프 29종)·허브·전역 진입로가 헤더 검색 0건이던 갭 해소 (제목은 각 페이지 메타 기준)
 { title: `성과급 계산기 ${bonusCalcCountKo} 허브`, href: "/calc/bonus-calculators", category: "도구", description: "회사별 최신 지급률·시즌 캘린더", priority: 1 },
 { title: "금융 계산기 모음", href: "/tools/finance", category: "도구", description: "세금·투자·대출 계산기 허브", priority: 2 },
 { title: "부동산 계산기 모음", href: "/tools/real-estate", category: "도구", description: "취득세·증여세·DSR·LTV·전세", priority: 2 },
 { title: "생활 계산기 모음", href: "/tools/life", category: "도구", description: "N빵·유류비·구독료·나이·D-Day", priority: 2 },
 { title: "전체 도구 인덱스", href: "/tools", category: "도구", description: "세금·재테크 계산기 모음" },
 { title: "배당소득세 계산기 2026", href: "/tools/finance/dividend-tax", category: "계산기", description: "금융소득종합과세 2천만원 기준 비교과세", priority: 1 },
 { title: "성과급·인센티브 세금 계산기", href: "/tools/finance/bonus", category: "계산기", description: "연봉합산 세율 — 보너스 세후 실수령", priority: 1 },
 { title: "IRP·연금저축 계산기", href: "/tools/finance/irp", category: "계산기", description: "세액공제 환급액", priority: 1 },
 { title: "DSR 계산기", href: "/tools/real-estate/dsr", category: "계산기", description: "총부채원리금상환비율 대출 한도", priority: 1 },
 { title: "LTV 계산기", href: "/tools/real-estate/ltv", category: "계산기", description: "주택담보대출 한도" },
 { title: "취득세 계산기 2026", href: "/tools/real-estate/acquisition-tax", category: "계산기", description: "주택·토지·교육세·농특세", priority: 2 },
 { title: "증여세 계산기 2026", href: "/tools/real-estate/gift-tax", category: "계산기", description: "가족 간 공제한도·세율", priority: 2 },
 { title: "대출 이자 계산기 2026", href: "/tools/loan", category: "계산기", description: "원리금균등·원금균등·만기일시 월 상환액", priority: 2 },
 { title: "예적금 계산기 (이자·세금)", href: "/tools/deposit", category: "계산기", description: "만기 세후 수령액" },
 { title: "복리 계산기", href: "/tools/finance/compound", category: "계산기", description: "적립식 투자 자산 시뮬레이션" },
 { title: "주식 양도소득세 계산기", href: "/tools/finance/stock-tax", category: "계산기", description: "해외주식·대주주 (2026)" },
 { title: "프리랜서 종합소득세 계산기", href: "/tools/finance/freelance-tax", category: "계산기", description: "사업소득·필요경비 (2026)" },
 { title: "퇴직금 세금 계산기", href: "/tools/finance/severance", category: "계산기", description: "환산급여 방식 퇴직소득세" },
 { title: "할부 이자 계산기", href: "/tools/finance/installment", category: "계산기", description: "신용카드·캐피탈·카드론" },
 { title: "부가세(VAT) 계산기", href: "/tools/finance/vat", category: "계산기" },
 { title: "CAGR(연평균 성장률) 계산기", href: "/tools/finance/cagr", category: "계산기" },
 { title: "퍼센트 계산기 & 단위 변환기", href: "/tools/math", category: "도구", description: "할인율·증감율·기본 환산" },
 { title: "N빵 계산기 (Dutch Pay)", href: "/tools/life/dutch-pay", category: "도구" },
 { title: "유류비 계산기", href: "/tools/life/fuel-cost", category: "도구" },
 { title: "구독 서비스 비용 계산기", href: "/tools/life/subscription", category: "도구", description: "월 구독료 총합 분석" },
 { title: "단위 변환기", href: "/tools/life/unit-converter", category: "도구" },
 { title: "2026 대기업 연봉 순위 TOP 30", href: "/salary-db/ranking", category: "도구", description: "시니어 기준 총보상 랭킹", priority: 2 },
 { title: "머니샐러리 데이터 리포트", href: "/insights", category: "도구", description: "연봉·성과급 데이터 분석" },
 { title: "내 블로그에 계산기 위젯 달기", href: "/embed", category: "도구", description: "무료 임베드 위젯" },
 { title: "주제별 종합 가이드", href: "/hub", category: "도구", description: "FIRE·투자·부동산·절세·커리어" },
 { title: "2026 직장인 꿀팁 15선", href: "/tips", category: "도구", description: "연봉 협상·절세·재테크·내집마련" },
];

// 회사별 성과급 계산기 — 위 seasonPages 에 수기 등재된 slug 는 제외하고 나머지를 허브 레지스트리(BONUS_CALCS)에서 파생.
// 두산에너빌리티·한화에어로·삼성바이오·한전 등 10종이 검색 0건이던 갭 해소 (전면 최적화, 운영자 지시 2026-09-02)
const explicitBonusHrefs = new Set(seasonPages.map((e) => e.href));
const bonusCalcEntries: SearchEntry[] = BONUS_CALCS.filter((c) => !explicitBonusHrefs.has(`/calc/${c.slug}`)).map((c) => ({
 title: `${c.company} 성과급 계산기`,
 href: `/calc/${c.slug}`,
 category: "계산기" as const,
 description: c.hook,
 priority: 2,
}));

const calculatorEntries: SearchEntry[] = allCalculators.map((c) => ({
 title: c.title,
 href: `/calc/${c.slug}`,
 category: "계산기" as const,
 description: c.description,
}));

const guideEntries: SearchEntry[] = koGuideCards.map((g) => ({
 title: g.title,
 href: `/guides/${g.slug}`,
 category: "가이드" as const,
 description: g.description,
}));

const glossaryEntries: SearchEntry[] = glossaryData.map((g) => ({
 title: g.title,
 href: `/glossary/${toGlossarySlug(g.title)}`,
 category: "용어" as const,
 description: g.summary,
}));

const qnaEntries: SearchEntry[] = qnaData.map((q) => ({
 title: q.question,
 href: `/qna/${toQnaSlug(q.question)}`,
 category: "Q&A" as const,
 description: q.answer.conclusion.slice(0, 60),
}));

const companyEntries: SearchEntry[] = companyRepository.getAll().map((c) => ({
 title: c.name.ko,
 href: `/salary-db/${c.id}`,
 category: "회사" as const,
 description: c.industry,
}));

export const searchIndex: SearchEntry[] = [
 ...toolPages,
 ...seasonPages,
 ...calculatorEntries,
 ...guideEntries,
 ...glossaryEntries,
 ...qnaEntries,
 ...companyEntries,
 ...bonusCalcEntries,
];

/**
 * 쿼리로 검색. 제목 prefix > 제목 includes > description includes 순위.
 * 최대 limit 개 반환.
 */
export function searchEntries(query: string, limit = 8): SearchEntry[] {
 const q = query.trim().toLowerCase();
 if (!q) return [];

 const matched = searchIndex
 .map((entry) => {
 const title = entry.title.toLowerCase();
 const desc = entry.description?.toLowerCase() ?? "";
 let score = 0;
 if (title.startsWith(q)) score = 100;
 else if (title.includes(q)) score = 60;
 else if (desc.includes(q)) score = 20;
 return { entry, score };
 })
 .filter((m) => m.score > 0)
 .sort((a, b) => {
 // 점수 내림차순 + priority 내림차순 + 제목 길이 (짧은 게 우선)
 if (b.score !== a.score) return b.score - a.score;
 const pa = a.entry.priority ?? 99;
 const pb = b.entry.priority ?? 99;
 if (pa !== pb) return pa - pb;
 return a.entry.title.length - b.entry.title.length;
 })
 .slice(0, limit);

 return matched.map((m) => m.entry);
}
