// src/lib/guidesContent.ts
//
// 가이드 "본문 포함 정본" — 30여 개 본문 모듈을 모두 import 해 guides(본문 포함)
// 배열을 만든다 (2026-08-26 Phase 4: 구 guidesData.ts 에서 물리 분리).
// ★이 모듈을 import 하면 본문 전체(~1.5MB)가 해당 청크에 실린다 —
//   본문이 필요한 서버 소비처(상세 페이지·rss.xml·sitemap·relatedGuides·
//   gen-* 빌드 스크립트)에서만 import 할 것.
// 목록·홈·검색 등 카드 메타만 필요한 곳은 guidesData.ts(koGuideCards 등)를 사용.
// 카드 메타 산출물(guidesMeta.generated.ts)은 scripts/gen-guides-meta.ts 가
// 이 모듈에서 추출한다 — 가이드 추가·수정은 여기(정본)에만 하면 된다.
import type { Guide, GuideLang } from "./guidesData";

import { taxDeepdiveGuides } from "@/lib/guides/tax-deepdive";
import { negotiationGuides } from "@/lib/guides/negotiation-deepdive";
import { financeGuides } from "@/lib/guides/finance-deepdive";
import { companyRealEstateGuides } from "@/lib/guides/company-realestate-deepdive";
import { lifecycleGuides } from "@/lib/guides/lifecycle-deepdive";
import { insuranceInvestmentGuides } from "@/lib/guides/insurance-investment-deepdive";
import { stockDeepdiveGuides } from "@/lib/guides/stock-deepdive";
import { stockDeepdiveGuidesEn } from "@/lib/guides/stock-deepdive-en";
import { semiconductorDeepdiveGuides } from "@/lib/guides/semiconductor-deepdive";
import { season2026Guides } from "@/lib/guides/2026-season-deepdive";
import { bonusDeepdiveGuides } from "@/lib/guides/bonus-deepdive";
import { hotKeywordsGuides } from "@/lib/guides/hot-keywords-deepdive";
import { hotKeywordsGuidesEn } from "@/lib/guides/hot-keywords-deepdive-en";
import { hotNewsMay2026 } from "@/lib/guides/hot-news-2026-may";
import { hotNewsExtended } from "@/lib/guides/hot-news-2026-extended";
import { hotNewsDeepDive } from "@/lib/guides/hot-news-2026-deep-dive";
import { hotBonusTaxComplete } from "@/lib/guides/hot-bonus-tax-complete";
import { autumn2026Guides } from "@/lib/guides/autumn-2026-season";
import { companySalaryDeepdive2026 } from "@/lib/guides/company-salary-deepdive-2026";
import { jobSalaryDeepdive2026 } from "@/lib/guides/job-salary-deepdive-2026";
import { financeRpm2026Guides } from "@/lib/guides/finance-rpm-2026";
import { semiconductorBonusNews202609Guides } from "@/lib/guides/semiconductor-bonus-news-2026-09";
import { legacyRewrite1 } from "@/lib/guides/legacy-rewrite-1";
import { legacyRewrite2 } from "@/lib/guides/legacy-rewrite-2";
import { legacyRewrite3 } from "@/lib/guides/legacy-rewrite-3";
import { legacyRewrite4 } from "@/lib/guides/legacy-rewrite-4";
import { legacyRewrite5 } from "@/lib/guides/legacy-rewrite-5";
import { legacyRewrite6 } from "@/lib/guides/legacy-rewrite-6";
import { legacyRewrite7 } from "@/lib/guides/legacy-rewrite-7";
import { legacyRewrite8 } from "@/lib/guides/legacy-rewrite-8";
import { legacyRewrite9 } from "@/lib/guides/legacy-rewrite-9";
import { legacyRewrite10 } from "@/lib/guides/legacy-rewrite-10";

// 레거시 rawGuides 50편의 고유 본문 (2026-08-15 재작성 — 전편 출처 검증).
// (구 generateExpertContent 템플릿 본문을 대체 — 템플릿은 2026-08 점검에서 제거됨)
const legacyRewriteContent: Record<string, string> = {
  ...legacyRewrite1,
  ...legacyRewrite2,
  ...legacyRewrite3,
  ...legacyRewrite4,
  ...legacyRewrite5,
  ...legacyRewrite6,
  ...legacyRewrite7,
  ...legacyRewrite8,
  ...legacyRewrite9,
  ...legacyRewrite10,
};

// 레거시 50편 가이드 메타 (본문은 legacyRewriteContent 에서 주입)
const rawGuides = [
 // --- 연봉 (Salary) : 10 items ---
 {
 slug: "salary-guide-2026",
 title: "2026년 연봉 실수령액표: 내 월급의 진실 💸",
 description: "연봉 1억이면 월 얼마? 2026년 최신 세율과 4대보험 요율을 완벽 반영한 구간별 실수령액 총정리!",
 category: "연봉",
 tags: ["연봉", "실수령액", "2026년", "월급"],
 level: "초급",
 // 2026-11-01은 미래 날짜 오기(誤記)였음 — JSON-LD·sitemap·화면 표시일이 전부
 // 미래로 나가 신뢰 신호를 깎아 실제 갱신일로 정정 (2026-07-06 감사)
 publishedDate: "2026-07-06",
 // 실수령액표를 간이세액표 기준 엔진으로 재산출 (2026-09-25 A17)
 modifiedDate: "2026-09-25",
 views: 150234,
 },
 {
 slug: "salary-negotiation-secret",
 title: "연봉협상 필승 전략: '얼마 원하세요?'에 대한 모범 답안 🗣️",
 description: "협상 테이블에서 절대 쫄지 않는 법! 내 몸값을 20% 이상 점프시키는 구체적인 대화 스크립트와 타이밍.",
 category: "연봉",
 tags: ["연봉협상", "커리어", "처우협의"],
 level: "중급",
 publishedDate: "2025-10-28",
 views: 98500,
 },
 {
 slug: "nekarakubae-salary-truth",
 title: "네카라쿠배 개발자 초봉 1억의 진실 💻",
 description: "소문난 IT 대기업 연봉, 과연 진짜일까? 계약 연봉부터 사이닝 보너스, 스톡옵션(RSU)까지 낱낱이 파헤칩니다.",
 category: "연봉",
 tags: ["개발자", "IT", "네카라쿠배", "스톡옵션"],
 level: "중급",
 publishedDate: "2025-10-15",
 views: 120000,
 },
 {
 slug: "minimum-wage-2026",
 title: "2026년 최저임금 확정! 내 월급은 얼마나 오를까? 📈",
 description: "최저임금 인상이 내 연봉에 미치는 영향 분석. 주휴수당 포함 시급과 월급 환산액까지 한눈에 확인하세요.",
 category: "연봉",
 tags: ["최저임금", "2026년", "급여인상"],
 level: "초급",
 publishedDate: "2025-11-10",
 views: 85000,
 },
 {
 slug: "severance-pay-guide",
 title: "퇴직금, 퇴직연금(DC/DB) 완벽 가이드: 나갈 때 챙겨야 할 돈 💰",
 description: "퇴직금 계산법부터 IRP 계좌 이전, 세금 절약 팁까지. 회사를 떠날 때 1원도 손해 보지 않는 방법.",
 category: "연봉",
 tags: ["퇴직금", "퇴직연금", "IRP"],
 level: "중급",
 publishedDate: "2025-09-20",
 views: 76000,
 },
 {
 slug: "overtime-pay-calculation",
 title: "야근수당, 주말수당 계산법: '포괄임금제'의 함정 탈출하기 🌙",
 description: "내 야근비가 0원? 포괄임금제의 진실과 통상임금 계산법, 그리고 정당한 수당을 요구하는 법.",
 category: "연봉",
 tags: ["수당", "포괄임금제", "야근"],
 level: "중급",
 publishedDate: "2025-08-15",
 views: 64000,
 },
 {
 slug: "annual-leave-allowance",
 title: "연차수당 계산기: 안 쓴 연차, 돈으로 받으면 얼마? 🏖️",
 description: "연차 사용 촉진 제도와 미사용 연차 수당 계산법. 휴가 대신 돈으로 받는 게 이득일까?",
 category: "연봉",
 tags: ["연차", "수당", "휴가"],
 level: "초급",
 publishedDate: "2025-11-05",
 views: 55000,
 },
 {
 slug: "bonus-tax-rate",
 title: "상여금 세금 폭탄? 보너스 실수령액 미리 계산하기 🎁",
 description: "기분 좋은 성과급, 세금 떼고 나면 허무하다? 상여금에 적용되는 세율과 절세 전략.",
 category: "연봉",
 tags: ["상여금", "보너스", "세금"],
 level: "중급",
 publishedDate: "2025-01-10",
 // 예시의 계산 기준(비과세 식대 월 20만원)을 명시 — 수치는 간이세액표 엔진으로 재확인 (2026-09-25 A17)
 modifiedDate: "2026-09-25",
 views: 92000,
 },
 {
 slug: "nurse-salary",
 title: "간호사 연봉 2026: 신규·5년차·수간호사 월급 실수령액 표 💉",
 description: "간호사 평균 연봉과 신규 초봉, 5년차·10년차·수간호사 월급을 한눈에. 대학병원 3교대 나이트·오프 수당을 포함한 '진짜' 실수령액을 2026년 기준으로 정리했습니다.",
 category: "연봉",
 tags: ["간호사 연봉", "수간호사", "간호사 5년차", "간호사 월급", "3교대", "대학병원"],
 level: "중급",
 publishedDate: "2025-11-15",
 // 실수령액 표·명세서 예시·보강 섹션을 간이세액표 기준 엔진으로 재산출 (2026-09-25 A17)
 modifiedDate: "2026-09-25",
 views: 185000,
 },
 {
 slug: "salary-peak-system",
 title: "임금피크제란? 정년 연장과 월급 삭감의 딜레마 📉",
 description: "임금피크제 적용 대상과 감액률, 그리고 이에 대응하는 직장인의 생존 전략.",
 category: "연봉",
 tags: ["임금피크제", "정년", "노후"],
 level: "고급",
 publishedDate: "2025-06-30",
 // 감액률 시나리오 표를 간이세액표 기준 엔진으로 재산출 (2026-09-25 A17)
 modifiedDate: "2026-09-25",
 views: 32000,
 },

 // --- 세금 (Tax) : 10 items ---
 {
 slug: "year-end-tax-2026",
 // W3-A 메타만 개명 (본문·H2·발행일 불변). 옛 제목은 '2025 연말정산'으로 귀속연도가 어긋났다.
 title: "2026년 귀속 연말정산(2027년 1월) 공제 총정리 — 한도표·달라진 점",
 description: "바뀐 세법 완벽 반영! 남들은 모르는 소득공제, 세액공제 꿀팁으로 환급액 200만원 더 받는 법.",
 category: "세금",
 tags: ["연말정산", "환급", "절세"],
 level: "초급",
 publishedDate: "2025-12-01",
 views: 200000,
 },
 {
 slug: "comprehensive-income-tax",
 title: "N잡러 필수! 5월 종합소득세 신고 A to Z 🚨",
 description: "유튜버, 배달, 스마트스토어... 부수입이 있다면 필수! 가산세 피하고 절세하는 신고 노하우.",
 category: "세금",
 tags: ["종합소득세", "N잡", "프리랜서"],
 level: "중급",
 publishedDate: "2025-04-20",
 views: 110000,
 },
 {
 slug: "gift-tax-exemption",
 title: "자녀에게 1억 증여해도 세금 0원? 증여세 면제 한도 총정리 🎁",
 description: "10년 주기 증여 플랜으로 상속세까지 아끼는 부자들의 절세 시크릿.",
 category: "세금",
 tags: ["증여세", "상속세", "절세"],
 level: "고급",
 publishedDate: "2025-03-15",
 views: 89000,
 },
 {
 slug: "capital-gains-tax-stock",
 title: "해외주식 양도소득세: 250만원 공제와 절세 매도 타이밍 🇺🇸",
 description: "서학개미 필독! 테슬라, 엔비디아 수익 실현 전 꼭 알아야 할 세금 계산법.",
 category: "세금",
 tags: ["해외주식", "양도세", "주식"],
 level: "중급",
 publishedDate: "2025-11-20",
 views: 75000,
 },
 { slug: "monthly-rent-tax-credit", title: "월세 세액공제: 집주인 동의 없이 신청하기 🏠", description: "낸 월세의 최대 17%를 돌려받는 효자 공제 항목. 신청 방법과 필수 서류.", category: "세금", tags: ["월세", "세액공제", "연말정산"], level: "초급", publishedDate: "2025-11-15", views: 60000 },
 { slug: "cash-receipt-guide", title: "현금영수증: 연말정산의 숨은 1인치 🧾", description: "소득공제율 30%, 신용카드보다 2배 높은 혜택 챙기기. 발급 거부 시 대처법까지.", category: "세금", tags: ["현금영수증", "소득공제", "절세"], level: "초급", publishedDate: "2025-10-05", views: 45000 },
 { slug: "car-tax-annual-payment", title: "자동차세 연납 신청: 1월에 5% 공제 🚗", description: "1월에 미리 내면 세금이 줄어든다? 위택스 신청 방법과 카드 무이자 할부 팁.", category: "세금", tags: ["자동차세", "연납", "절세"], level: "초급", publishedDate: "2025-01-05", views: 52000 },
 { slug: "real-estate-tax-comprehensive", title: "종합부동산세: 1주택자 공제 한도 상향 🏘️", description: "부자세? 이제는 중산층도 알아야 할 종부세 계산 구조와 절세 전략.", category: "세금", tags: ["종부세", "부동산", "세금"], level: "고급", publishedDate: "2025-11-25", views: 38000 },
 { slug: "financial-income-tax", title: "금융소득 종합과세: 이자만 2천만원? 💰", description: "예금 이자와 배당금 합계 2천만원 초과 시 세금 폭탄 피하기.", category: "세금", tags: ["금융소득", "이자", "배당"], level: "고급", publishedDate: "2025-05-10", views: 29000 },
 { slug: "donation-tax-credit", title: "기부금 세액공제: 기부하고 세금 환급 ❤️", description: "정치자금, 종교단체, 고향사랑기부제... 100% 환급 꿀팁.", category: "세금", tags: ["기부금", "세액공제", "환급"], level: "초급", publishedDate: "2025-12-10", views: 41000 },

 // --- 투자 (Investment) : 10 items ---
 {
 slug: "isa-account-guide",
 title: "만능통장 ISA: 3년 만기 1억 만들기 로드맵 💎",
 description: "비과세 혜택 끝판왕 ISA 계좌 활용법. 중개형 vs 신탁형 비교부터 추천 포트폴리오까지.",
 category: "투자",
 tags: ["ISA", "비과세", "목돈마련"],
 level: "초급",
 publishedDate: "2025-02-10",
 views: 130000,
 },
 {
 slug: "etf-investment-starter",
 title: "주식 초보를 위한 ETF 투자 가이드: 워렌 버핏도 추천했다 📊",
 description: "개별 종목 분석 없이 시장 전체에 투자하는 법. S&P500, 나스닥100 적립식 투자의 기적.",
 category: "투자",
 tags: ["ETF", "주식초보", "적립식투자"],
 level: "초급",
 publishedDate: "2025-01-05",
 views: 95000,
 },
 { slug: "bitcoin-halving-strategy", title: "비트코인 반감기 투자 전략: 4년의 사이클 🪙", description: "4년마다 오는 기회, 반감기 사이클 분석과 매수 적기.", category: "투자", tags: ["비트코인", "가상화폐", "반감기"], level: "고급", publishedDate: "2025-03-20", views: 110000 },
 { slug: "us-treasury-bond", title: "미국 국채 투자: 안전자산의 매력 🇺🇸", description: "금리 인하 시기, 채권으로 시세차익과 이자 두 마리 토끼 잡기.", category: "투자", tags: ["채권", "미국국채", "안전자산"], level: "중급", publishedDate: "2025-06-15", views: 67000 },
 { slug: "gold-investment-methods", title: "금 투자 방법: 골드바 vs KRX 금시장 🥇", description: "전쟁과 인플레를 이기는 불변의 자산, 금 싸게 사는 법.", category: "투자", tags: ["금", "원자재", "안전자산"], level: "초급", publishedDate: "2025-08-20", views: 54000 },
 { slug: "dollar-investment", title: "달러 환테크: 환율 변동성 활용하기 💵", description: "엔저, 강달러 시대의 똑똑한 외화 투자 전략.", category: "투자", tags: ["달러", "환테크", "환율"], level: "중급", publishedDate: "2025-09-05", views: 49000 },
 { slug: "reits-investment", title: "리츠(REITs): 커피 한 잔 값으로 건물주 되기 🏢", description: "소액으로 강남 빌딩에 투자하고 매달 월세 배당 받는 법.", category: "투자", tags: ["리츠", "부동산", "배당주"], level: "중급", publishedDate: "2025-04-10", views: 62000 },
 { slug: "ipo-strategy", title: "공모주 청약: 따상 노리는 실전 팁 📈", description: "균등배정 vs 비례배정, 마이너스 통장 써도 이득일까?", category: "투자", tags: ["공모주", "청약", "주식"], level: "초급", publishedDate: "2025-02-25", views: 88000 },
 { slug: "robo-advisor", title: "로보어드바이저: AI에게 내 돈 맡겨도 될까? 🤖", description: "핀트, 파운트 등 AI 투자 서비스 수익률 비교 분석.", category: "투자", tags: ["AI투자", "로보어드바이저", "핀테크"], level: "초급", publishedDate: "2025-07-15", views: 43000 },
 { slug: "pension-savings-fund", title: "연금저축펀드 vs IRP: 나에게 맞는 계좌는? 👴", description: "세액공제 한도와 운용 가능 상품 차이점 완벽 정리.", category: "투자", tags: ["연금저축", "IRP", "노후준비"], level: "중급", publishedDate: "2025-11-30", views: 71000 },

 // --- 부동산 (Real Estate) : 8 items ---
 {
 slug: "jeonse-scam-prevention",
 title: "전세사기 예방 가이드: 내 보증금 지키는 7가지 체크리스트 🏠",
 description: "등기부등본 보는 법부터 전세보증보험 가입까지. 깡통전세 피하는 안전 장치 완벽 분석.",
 category: "부동산",
 tags: ["전세", "부동산", "사기예방"],
 level: "초급",
 publishedDate: "2025-08-01",
 views: 160000,
 },
 {
 slug: "first-home-buyer-loan",
 title: "생애최초 주택구입 대출 2026 — 디딤돌·보금자리론 조건과 한도",
 description: "생애최초 주택구입 대출의 소득·주택 조건과 디딤돌·보금자리론 한도를 비교합니다. 지역별 LTV, 신청 시점의 금리 확인 방법과 월 상환액 계산을 안내합니다.",
 category: "부동산",
 tags: ["대출", "내집마련", "청약"],
 level: "중급",
 publishedDate: "2025-09-10",
 modifiedDate: "2026-09-19",
 views: 145000,
 },
 { slug: "subscription-account-tips", title: "청약 통장: 1순위 조건 만들기 🏗️", description: "납입 인정 금액 상향! 당첨 확률 높이는 청약 통장 관리법.", category: "부동산", tags: ["청약", "아파트", "분양"], level: "초급", publishedDate: "2025-04-05", views: 98000 },
 { slug: "reconstruction-redevelopment", title: "재건축 vs 재개발: 투자의 차이점 🚧", description: "헌 집 줄게 새 집 다오, 정비사업 단계별 투자 포인트.", category: "부동산", tags: ["재건축", "재개발", "투자"], level: "고급", publishedDate: "2025-10-20", views: 56000 },
 { slug: "officetel-investment", title: "오피스텔 투자: 주택수 포함 여부 확인 🏢", description: "취득세 중과 피하고 월세 수익 내는 오피스텔 투자법.", category: "부동산", tags: ["오피스텔", "월세", "투자"], level: "중급", publishedDate: "2025-06-25", views: 42000 },
 { slug: "happy-housing-qualifications", title: "행복주택 입주 자격: 대학생, 사회초년생 🏘️", description: "시세의 60% 수준! 청년들을 위한 공공임대주택 활용법.", category: "부동산", tags: ["행복주택", "임대주택", "청년"], level: "초급", publishedDate: "2025-03-01", views: 81000 },
 { slug: "youth-housing-station", title: "역세권 청년주택: 서울 역세권에 내 집? 🚇", description: "교통 편리한 곳에 저렴하게 사는 법, 입주 자격 총정리.", category: "부동산", tags: ["청년주택", "서울", "역세권"], level: "초급", publishedDate: "2025-05-15", views: 77000 },
 { slug: "gap-investment-risk", title: "갭투자: 전세 끼고 아파트 사기 📉", description: "소액으로 아파트 매수? 깡통전세 리스크 관리와 갭투자 원칙.", category: "부동산", tags: ["갭투자", "아파트", "투자"], level: "고급", publishedDate: "2025-11-10", views: 65000 },

 // --- 커리어 (Career) : 7 items ---
 {
 slug: "resume-writing-tips",
 title: "광탈을 부르는 이력서 vs 합격을 부르는 이력서 📝",
 description: "인사담당자가 3초 만에 뽑고 싶게 만드는 경력기술서 작성법. 성과를 숫자로 증명하라!",
 category: "커리어",
 tags: ["이력서", "취업", "이직"],
 level: "초급",
 publishedDate: "2025-06-15",
 views: 88000,
 },
 {
 slug: "linkedin-networking",
 title: "링크드인으로 해외 취업 제안 받는 프로필 세팅법 🌏",
 description: "글로벌 헤드헌터들이 검색하는 키워드는 따로 있다? 영문 이력서 없이 기회를 잡는 퍼스널 브랜딩.",
 category: "커리어",
 tags: ["링크드인", "해외취업", "네트워킹"],
 level: "고급",
 publishedDate: "2025-07-01",
 views: 72000,
 },
 { slug: "burnout-syndrome", title: "번아웃 증후군: 직장인 마음 챙김 🤯", description: "일이 재미없고 무기력하다면? 번아웃 자가진단과 극복법.", category: "커리어", tags: ["번아웃", "멘탈관리", "직장생활"], level: "초급", publishedDate: "2025-09-30", views: 46000 },
 { slug: "side-project-income", title: "사이드 프로젝트: 월급 외 수익 파이프라인 🚀", description: "퇴근 후 2시간, 내 재능으로 부수입 만드는 현실적 방법.", category: "커리어", tags: ["부업", "사이드프로젝트", "N잡"], level: "중급", publishedDate: "2025-08-10", views: 59000 },
 { slug: "remote-work-tools", title: "재택근무 효율 높이는 툴 추천 💻", description: "노션, 슬랙, 줌... 프로 일잘러들의 생산성 도구 모음.", category: "커리어", tags: ["재택근무", "생산성", "툴"], level: "초급", publishedDate: "2025-04-25", views: 35000 },
 { slug: "interview-questions-100", title: "면접 예상 질문 리스트 100 🎤", description: "자기소개부터 마지막 할 말까지, 면접관을 사로잡는 답변.", category: "커리어", tags: ["면접", "취업", "이직"], level: "중급", publishedDate: "2025-02-15", views: 91000 },
 { slug: "mbti-work-style", title: "MBTI별 업무 스타일과 추천 직무 🧠", description: "나는 계획형 J일까 즉흥형 P일까? 성향에 맞는 일 찾기.", category: "커리어", tags: ["MBTI", "적성", "직무"], level: "초급", publishedDate: "2025-01-20", views: 105000 },

 // --- 기초 (Basics) : 5 items ---
 {
 slug: "credit-score-management",
 title: "신용점수 900점 넘기기: 대출 금리가 달라지는 신용 관리법 💳",
 description: "신용카드 사용법부터 연체 관리까지. 떨어지긴 쉬워도 올리긴 어려운 신용점수 심폐소생술.",
 category: "기초",
 tags: ["신용점수", "대출", "금융상식"],
 level: "초급",
 publishedDate: "2025-05-05",
 views: 60000,
 },
 { slug: "economic-freedom-fire", title: "경제적 자유(FIRE): 4%의 법칙 🔥", description: "얼마가 있어야 은퇴할까? 파이어족의 자산 인출 전략.", category: "기초", tags: ["파이어족", "은퇴", "재무설계"], level: "고급", publishedDate: "2025-12-20", views: 78000 },
 { slug: "rule-of-72", title: "72의 법칙: 자산이 2배 되는 시간 ⏳", description: "복리의 마법을 암산하는 공식. 수익률 10%면 7.2년 걸린다.", category: "기초", tags: ["복리", "투자상식", "수학"], level: "초급", publishedDate: "2025-03-10", views: 41000 },
 { slug: "split-accounts", title: "통장 쪼개기: 월급 관리의 기본 🏦", description: "급여, 소비, 비상금, 투자. 4개의 통장으로 돈의 흐름 잡기.", category: "기초", tags: ["재테크", "월급관리", "저축"], level: "초급", publishedDate: "2025-01-15", views: 85000 },
 { slug: "household-ledger-tips", title: "가계부 작성 팁: 뱅크샐러드 vs 엑셀 📒", description: "작심삼일 가계부는 그만! 자동으로 기록하고 소비 분석하기.", category: "기초", tags: ["가계부", "절약", "앱추천"], level: "초급", publishedDate: "2025-02-01", views: 53000 },
];

// 모든 raw 가이드 통합 (legacy + 신규 unique 본문)
const allRawGuides = [
 ...rawGuides,
 ...taxDeepdiveGuides,
 ...negotiationGuides,
 ...financeGuides,
 ...companyRealEstateGuides,
 ...lifecycleGuides,
 ...insuranceInvestmentGuides,
 ...stockDeepdiveGuides,
 ...stockDeepdiveGuidesEn,
 ...semiconductorDeepdiveGuides,
 ...season2026Guides,
 ...hotKeywordsGuides,
 // GSC 404 복구(7차): /en/guides/* 5개 영문 가이드 (loan-types/health-insurance/four-major-insurance/year-end-tax/earned-income-credit)
 ...hotKeywordsGuidesEn,
 // 10차 점검 — 삼성 임금협상 현황 + 금융 핫이슈 30개 (SEO 폭발 노림)
 ...hotNewsMay2026,
 // 11차 — 청년·신혼/부동산 심화/직장인 세부 절세/투자 재테크/직업 이직 5개 카테고리 50편
 ...hotNewsExtended,
 // 12차 — 세금 심화/건강 의료/자산 노후/법률 실용/2026 정책 5개 카테고리 50편 (누적 131편)
 ...hotNewsDeepDive,
 // 13차 — 성과급 종류·소득세·4대보험·절세 심화·시점 실전 5개 영역 50편 (누적 181편)
 ...hotBonusTaxComplete,
 // 14차 — 성과급 시의성 종합(2026 실제 지급액 + 통상임금 대법 판결 + 세금/4대보험 + 계산기 연결)
 ...bonusDeepdiveGuides,
 // 15차 (2026-08-09) — 게시글 17편: 가을 시즌 4(추석 상여·미리보기·OPI/PS 전망) +
 // GSC 30~60위 확인 키워드 저격 10(회사 5·직업 5) + 고RPM 금융 3. 전부 출처 검증 콘텐츠.
 ...autumn2026Guides,
 ...companySalaryDeepdive2026,
 ...jobSalaryDeepdive2026,
 ...financeRpm2026Guides,
 // 16차 (2026-09-03) — 삼성전자·SK하이닉스 성과급 뉴스 5편.
 // SK하이닉스 8/25 총투표 부결 이후 재협상 국면(9/2 소통행사까지)과
 // 삼성전자 8/21 이사회 임직원 보상용 자사주 15조 매입 의결이 축.
 // 확정/보도/전망을 본문에서 구분 표기 — 전망은 "확정 아님" 명시.
 ...semiconductorBonusNews202609Guides,
];

// 검색 결과(meta description) 전용 설명 — META-07 (2026-09-25 감사).
// 설명이 50자 미만이던 39편만 80~120자로 보강한다: 검색 구절로 시작, 구체 수치 1개, 이모지 없음.
// ★화면의 TL;DR·카드·RSS 는 기존 description 을 그대로 쓴다 — 본문 광고(GuideMidAd) 위 높이를
//   바꾸지 않기 위해 이 값은 guides/[slug] generateMetadata 에서만 쓰인다.
// 수치는 각 글 본문(2026-08-15 재작성·출처 검증분)과 공식 출처로 재확인한 것만 사용.
const guideMetaDescriptions: Record<string, string> = {
 "dollar-investment": "달러 환테크 방법 4가지 비교 — 외화예금·증권사 달러 RP는 환차익 비과세, 국내상장 달러 ETF는 매매차익 15.4% 과세입니다. 환전 스프레드·우대율과 초보 실수를 정리했습니다.",
 "pension-savings-fund": "연금저축펀드 vs IRP 차이 — 세액공제 한도는 연금저축 600만원, IRP 합산 900만원이고 최대 148만5천원이 환급됩니다. 중도 인출 규칙과 담을 수 있는 상품까지 표로 비교합니다.",
 "officetel-investment": "오피스텔 투자 세금 — 취득세는 용도와 관계없이 4.6%지만, 주거용으로 쓰면 다른 주택을 살 때 주택 수에 포함될 수 있습니다. 소형 신축 특례와 월세 수익률 계산법을 정리했습니다.",
 "economic-freedom-fire": "경제적 자유(FIRE) 목표 자산은 연간 생활비의 25배(4% 법칙)입니다. 월 250만원이면 7억 5천만원. 4% 법칙의 출처와 한국에 적용할 때의 보정, 보수적 3% 기준까지 계산합니다.",
 "bitcoin-halving-strategy": "비트코인 반감기는 21만 블록(약 4년)마다 채굴 보상이 절반이 되는 이벤트로, 현재 블록 보상은 3.125BTC입니다. 네 차례 사이클 기록과 과거 패턴의 한계를 정리했습니다.",
 "ipo-strategy": "공모주 청약 전략 — 2023년 6월부터 상장 첫날 가격 범위가 공모가의 60~400%로 바뀌었습니다. 균등·비례배정 구조와 청약 전 지표 3가지, 마이너스통장 증거금 손익 계산법을 정리했습니다.",
 "robo-advisor": "로보어드바이저 수익률은 광고가 아니라 코스콤 RA 테스트베드 공시로 같은 위험등급끼리 비교해야 합니다. 핀트·파운트 등 서비스의 작동 원리와 맡기기 전 체크리스트를 정리했습니다.",
 "burnout-syndrome": "번아웃 증후군 자가진단 — WHO가 2019년 ICD-11에 직업적 현상으로 등재한 번아웃은 탈진·냉소·효능감 저하 3가지 축으로 봅니다. 축별 신호와 단계별 회복 전략을 정리했습니다.",
 "gold-investment-methods": "금 투자 방법 5가지를 비용으로 비교합니다. 골드바는 부가세 10%를 얹고 사지만 KRX 금시장은 증권 계좌에서 1g 단위로 거래됩니다. 금통장·금 ETF·해외 금 ETF 세금 차이도 정리했습니다.",
 "reits-investment": "리츠(REITs) 투자 가이드 — 위탁관리 리츠는 이익의 90% 이상을 배당해야 해 소액으로 임대료 배당을 받습니다. 배당소득세 15.4% 구조와 배당수익률에 속지 않는 종목 선택법을 정리했습니다.",
 "reconstruction-redevelopment": "재건축 vs 재개발 차이 — 대상 주택, 재건축진단, 조합원 자격, 지위 양도 제한이 다릅니다. 정비구역 지정부터 입주까지 7단계별 투자 포인트와 최근 바뀐 규제를 정리했습니다.",
 "happy-housing-qualifications": "행복주택 입주 자격 — 임대료는 주변 시세의 60~80% 수준이고 대학생·청년·신혼부부 등 계층별로 소득·자산 기준이 다릅니다. 2026년 기준 계층별 요건과 신청 전 확인할 점을 정리했습니다.",
 "youth-housing-station": "역세권 청년주택(청년안심주택) 입주 자격 — 만 19~39세 무주택 청년이 대상이고 민간임대 일반공급 임대료는 시세의 약 85%입니다. 공공·민간임대 차이와 2026년 소득 기준을 정리했습니다.",
 "interview-questions-100": "면접 예상 질문 100개를 10개 유형으로 묶어 유형별 답변 뼈대를 정리했습니다. 두괄식·STAR 답변 프레임과 면접관이 평가하는 3가지(능력·동기·적합성)까지 한 번에 준비하세요.",
 "side-project-income": "사이드 프로젝트로 월급 외 수입 만들기 — 퇴근 후 2시간 안에서 시간형·콘텐츠형·자산형·판매형 4가지 파이프라인을 비교하고, 겸업 규정과 부업 소득 세금 신고까지 정리했습니다.",
 "remote-work-tools": "재택근무 툴 추천 — 메신저·화상회의·문서·작업 관리·집중 5개 카테고리별 대표 툴(슬랙·줌·노션 등)과 일 잘하는 팀의 사용 규칙, 툴 선택 3원칙을 정리했습니다.",
 "mbti-work-style": "MBTI별 업무 스타일 — E/I·S/N·T/F·J/P 4가지 지표를 업무 언어로 풀고 16유형별 일하는 방식과 어울리는 직무 방향을 정리했습니다. MBTI의 한계와 하지 말아야 할 사용법도 다룹니다.",
 "household-ledger-tips": "가계부 작성법 — 2022년 마이데이터 전면 시행 이후 기록은 앱이 자동으로 하고, 사람은 월말 30분 분석만 하면 됩니다. 자동 가계부 앱과 엑셀의 차이, 작심삼일을 막는 5단계를 정리했습니다.",
 "subscription-account-tips": "청약통장 1순위 조건과 납입 전략 — 2024년 11월 월 납입 인정액이 25만원으로 올랐고, 무주택 세대주는 연 최대 120만원 소득공제를 받습니다. 지역별 1순위 요건과 예치금을 정리했습니다.",
 "gap-investment-risk": "갭투자 구조와 위험 — 매매 6억·전세 4억8천 아파트는 1억2천으로 살 수 있지만 집값이 10% 내리면 투입금의 약 50%를 잃습니다. 깡통전세 기준과 2025~2026년 규제 환경을 정리했습니다.",
 "financial-income-tax": "금융소득 종합과세 기준은 이자·배당 합계 1인당 연 2,000만원입니다. 넘으면 초과분이 근로소득과 합산돼 6~45% 누진세율로 다시 계산되고 건강보험료도 오를 수 있습니다. 절세법을 정리했습니다.",
 "donation-tax-credit": "기부금 세액공제율 — 정치자금·고향사랑기부 10만원은 사실상 전액 환급되고, 일반기부금은 1천만원까지 15%·초과분 30%가 공제됩니다. 종교단체 10% 한도와 놓치기 쉬운 함정을 정리했습니다.",
 "us-treasury-bond": "미국 국채 투자 전 알아야 할 금리·가격 원리 — 듀레이션 17년 안팎의 30년물은 금리 1%p 변동에 가격이 약 17% 움직입니다. 2026년 금리 국면과 세금 구조, 만기별 전략을 정리했습니다.",
 "rule-of-72": "72의 법칙은 72를 연 수익률로 나눠 원금이 2배 되는 기간을 구하는 공식입니다. 수익률 10%면 7.2년, 3%면 24년. 실제 복리와의 오차와 인플레이션·114의 법칙 응용까지 정리했습니다.",
 "split-accounts": "통장 쪼개기 방법 — 급여·소비·비상금·투자 4개 통장을 자동이체로 연결해 선저축 후지출 구조를 만듭니다. 비상금은 생활비 3~6개월분이 권장선이며, 통장별 추천 상품과 운영 원칙을 정리했습니다.",
 "gift-tax-exemption": "증여세 면제 한도 — 성년 자녀는 10년간 5,000만원, 혼인·출산 시 1억원이 추가로 공제됩니다. 관계별 공제표와 10~50% 세율, 10년 주기 증여 플랜과 상속세 절감 효과를 정리했습니다.",
 "real-estate-tax-comprehensive": "종합부동산세 계산법 — 1세대 1주택자는 공시가격 12억원, 그 외는 인별 9억원을 공제한 뒤 공정시장가액비율 60%를 곱합니다. 5단계 계산 구조와 고령자·장기보유 세액공제를 정리했습니다.",
 "salary-peak-system": "임금피크제 감액 시 세후 영향 — 연봉 8,000만원이 30% 감액되면 월 실수령액은 약 27% 줄어듭니다. 정년연장형·정년보장형 차이, 2022년 대법원 무효 기준, 대응 전략을 정리했습니다.",
 "capital-gains-tax-stock": "해외주식 양도소득세는 연간 순이익에서 250만원을 공제한 뒤 22%(지방세 포함)가 부과되고 다음 해 5월 직접 신고합니다. 손익통산과 연도 분할 매도 등 절세 매도 타이밍을 정리했습니다.",
 "monthly-rent-tax-credit": "월세 세액공제는 집주인 동의 없이 신청할 수 있고, 총급여 5,500만원 이하면 월세의 17%(연 1,000만원 한도)를 돌려받습니다. 자격 요건 5가지와 필요 서류, 신청 방법을 정리했습니다.",
 "car-tax-annual-payment": "자동차세 연납은 1월에 신청하면 2~12월분 세액의 5%가 공제돼 연세액 기준 약 4.6% 할인됩니다. 배기량별 세액 계산, 위택스 신청 방법, 차를 팔 때의 환급까지 정리했습니다.",
 "bonus-tax-rate": "상여금 세금은 별도 세율 없이 근로소득으로 합산돼 6~45% 누진세율이 적용됩니다. 과세표준 8,800만원 초과분은 35% 구간. 상여 달 원천징수가 많아 보이는 이유와 연말정산 구조를 정리했습니다.",
 "cash-receipt-guide": "현금영수증 소득공제율은 30%로 신용카드(15%)의 2배입니다. 총급여 25% 초과 사용분부터 공제되며, 홈택스 번호 등록법과 발급 거부 시 신고 방법까지 2026년 기준으로 정리했습니다.",
 "jeonse-scam-prevention": "전세사기 예방 체크리스트 7가지 — 등기부등본 두 번 열람, 전세가율 확인, 체납 조회, 안전 특약, 전입신고·확정일자, 전세보증보험까지 계약 전후 순서대로 정리했습니다.",
 "resume-writing-tips": "이력서 작성법 — 리크루터가 이력서를 처음 훑는 시간은 평균 7.4초(The Ladders, 2018)입니다. 상단 요약 3줄 구조, 성과를 숫자로 쓰는 문장 변환 예시, 광탈 패턴을 정리했습니다.",
 "annual-leave-allowance": "연차수당 계산법 — 1년 80% 이상 출근하면 15일, 3년차부터 2년마다 1일씩 늘어 최대 25일입니다. 미사용 연차 1일 수당 계산식과 사용 촉진으로 수당이 0원이 되는 경우를 정리했습니다.",
 "credit-score-management": "신용점수 올리는 법 — 2021년부터 1~1,000점 점수제로 바뀌어 점수 몇십 점이 대출 금리를 가릅니다. NICE·KCB 평가 영역, 연체 등록 기준, 조회해도 점수가 안 깎이는 이유를 정리했습니다.",
 "semiconductor-cycle-2026": "반도체 사이클 2026 — 메모리 업황은 약 3~4년 주기로 회복·확장·정점·조정을 반복합니다. 정점 구간의 자사주 비중·PS 활용·고정비 관리 원칙과 조정기 대응법을 정리했습니다.",
 "kospi-leader-stock-strategy": "삼성전자·SK하이닉스 적립식 vs 일시매수 — 월급의 5~10%를 자동이체로 적립하고 두 종목 합산 비중이 금융자산의 30%를 넘으면 추가 매수를 멈추는 원칙을 정리했습니다.",
 // W3-A 연말정산 기둥 글 메타 개명(2026-09-26 배포분) — 수치는 legacy-rewrite-3 본문과 같은 값만 사용
 "year-end-tax-2026": "2026년 귀속 연말정산(2027년 1~2월) 공제 총정리. 연금계좌 900만원·월세 1,000만원·카드 300만원(자녀 수별 상향) 등 항목별 한도와 환급 우선순위, 경정청구 5년까지 정리했습니다.",
};

// Generate the final guides array with content
// — guide.content가 명시되어 있으면 그걸 우선 사용 (unique 콘텐츠)
// — 없으면 legacyRewriteContent(2026-08-15 재작성 본문) 사용
// — 2026-08 점검: generateExpertContent 템플릿 fallback 제거. 342편 전편이 고유
//   본문 보유 실측(템플릿 사용 0건) — 본문 없는 가이드는 thin content로 배포되기
//   전에 빌드 타임에 실패시킨다.
// — 재작성 본문 사용 시 publishedDate 를 실제 갱신일로 정정 (repo 관행:
//   발행일 = 실제 갱신일. salary-guide-2026 의 2026-07-06 정정 선례)
// — lang 미지정 가이드는 'ko'로 정규화 (기존 50개 호환)
// allRawGuides 원소 타입: content(레거시 50편)·lang(ko 기본) 이 아직 없을 수 있는 Guide
type RawGuide = Omit<Guide, 'content' | 'lang'> & { content?: string; lang?: GuideLang };
export const guides: Guide[] = (allRawGuides as RawGuide[]).map(guide => {
 const rewritten = !guide.content && legacyRewriteContent[guide.slug];
 const content = guide.content || legacyRewriteContent[guide.slug];
 if (!content) {
 throw new Error(
 `[guidesData] 본문 없는 가이드: ${guide.slug} — content 또는 legacy-rewrite 본문을 추가해야 빌드됩니다`
 );
 }
 return {
 ...guide,
 lang: (guide.lang as GuideLang | undefined) ?? 'ko',
 content,
 ...(rewritten ? { publishedDate: "2026-08-15" } : {}),
 // 한국어 글만 — 같은 슬러그의 영문판(/en/guides)에 한국어 메타가 섞이지 않게
 ...((guide.lang ?? 'ko') === 'ko' && guideMetaDescriptions[guide.slug]
 ? { metaDescription: guideMetaDescriptions[guide.slug] }
 : {}),
 };
});

/** 한국어 가이드만 (기존 /guides 라우트용) */
export const koGuides: Guide[] = guides.filter(g => g.lang === 'ko');
/** 영어 가이드만 (/en/guides 라우트용) */
export const enGuides: Guide[] = guides.filter(g => g.lang === 'en');

// 카드 메타(본문 제외)는 이 모듈에서 직접 export 하지 않는다 —
// scripts/gen-guides-meta.ts 가 추출해 guidesMeta.generated.ts 로 생성하고,
// guidesData.ts 가 그것을 koGuideCards/enGuideCards 로 노출한다.
