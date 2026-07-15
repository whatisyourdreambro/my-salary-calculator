// src/app/calc/samsung-bonus/page.tsx
//
// 삼성전자 성과급 계산기.
// title.absolute로 사이트명 한 번만 적용 (layout template과 중복 방지).

import type { Metadata } from "next";
import Link from "next/link";
import {
  softwareApplicationLd,
  autoBreadcrumbLd,
  faqLd,
  howToLd,
} from "@/lib/structuredData";
import JsonLd from "@/components/JsonLd";
import RelatedCalculators from "@/components/RelatedCalculators";
import { InArticleAd, CalcResultAd } from "@/components/AdPlacement";
import CoupangBanner from "@/components/CoupangBanner";
import {
  Sparkles,
  Info,
  AlertTriangle,
  ArrowRight,
  Coins,
  ShieldCheck,
} from "lucide-react";
import SamsungBonusClient from "./Client";
import TaiCalculator from "./TaiCalculator";
import {
  TAI_RATES_2026_H1,
  TAI_ANNOUNCED_DATE,
  TAI_PAY_DATE,
} from "./taiData";
import ShareButtons from "@/components/ShareButtons";

const SITE_URL = "https://www.moneysalary.com";
const SITE_NAME = "머니샐러리";
const PAGE_PATH = "/calc/samsung-bonus";
const PAGE_TITLE = "삼성전자 성과급 계산기 2026 — OPI·TAI";
const PAGE_TITLE_FULL = `${PAGE_TITLE} | ${SITE_NAME}`;
// SERP 표시 한도(한글 80~90자) 안에 핵심 키워드 전진 배치
const PAGE_DESC =
  "삼성전자 OPI(초과이익성과금)·TAI(목표달성장려금) 계산기. 2026 상반기 TAI 메모리 100% 반영, 사업부별 1인당·세후 실수령·RSU 매도까지 무료 시뮬레이션.";

// ─────────────────────────────────────────────────────────────
// FAQ
// ─────────────────────────────────────────────────────────────

const FAQ_ITEMS = [
  {
    question: "삼성전자 성과급은 어떻게 계산되나요?",
    answer:
      "2026년 5월 최종 타결된 노사 합의 보도에 따르면 삼성전자 DS부문 특별경영성과급은 연간 영업이익의 10.5%를 재원으로 부문(전체 인원 균등 분배 40%)과 사업부(인원×사업부 가중치 분배 60%) 두 갈래로 분배됩니다. 본 계산기는 영업이익(조원)·사업부별 인원·가중치만 입력하면 메모리·공통·파운드리·시스템LSI 사업부별 1인당 평균을 즉시 산출합니다. 여기에 기존 OPI(연봉의 최대 50%)는 OPI1로 별도 합산되며, 합의 임계값(2026~28년 영업이익 200조·2029~35년 100조) 미달 연도에는 특별경영성과급(OPI2)이 0으로 산정됩니다. 정확한 분배 정책은 회사 공식 발표를 참고하세요.",
  },
  {
    question: "삼성전자 TAI(목표달성장려금)는 얼마인가요?",
    answer:
      "TAI는 월 기본급 대비 %로 상·하반기 연 2회 지급됩니다. 2026년 상반기 TAI(7월 6일 사내 공지, 7월 8일 지급 — 복수 언론 보도 기준)는 메모리·반도체연구소·SAIT·DS공통·CSS(화합물반도체솔루션) 100%, 시스템LSI·파운드리 75%, MX·VD·네트워크·경영지원 50%, 의료기기·한국총괄 75%, 생활가전(DA) 25%입니다. 본 페이지의 TAI 미니 계산기에 월 기본급을 입력하면 사업부별 지급률이 바로 적용됩니다. 하반기 지급률은 통상 12월 말 별도 발표되며, 메모리는 하반기에도 견조한 실적으로 최대 수준 지급 가능성이 크다는 전망 보도가 있습니다.",
  },
  {
    question: "DX부문 자사주 성과급은 무엇인가요?",
    answer:
      "2026년 임금·단체협약 합의에 따라 DX부문·CSS사업팀 직원들에게는 7월 8일 자사주 성과급이 지급됐습니다. 공시 기반 보도에 따르면 삼성전자는 보통주 108만 3,434주(약 3,445억원, 7월 6일 종가 기준)를 처분해 대상 직원 4만 9,345명에게 지급했으며, DX부문 직원 1인당 약 600만원 상당입니다. 이는 DS부문 특별경영성과급(2027년 1월 첫 지급 예정)과는 별개의 임협 합의 이행분입니다.",
  },
  {
    question: "삼성전자 성과급 지급일은 언제인가요?",
    answer:
      "보도 기준으로 OPI(초과이익성과금)는 연 1회 1월 말~2월 초(설 연휴 전)에 지급되며, 2025년 실적분은 2026년 1월 30일에 지급됐습니다. TAI(목표달성장려금)는 반기별 연 2회로 통상 7월 초와 12월 말에 지급되며, 2026년 상반기분은 7월 8일 지급으로 공지됐습니다. 2026년 신설된 DS부문 특별경영성과급은 2027년 1월 지급분부터 적용됩니다.",
  },
  {
    question: "2026년 1월 OPI는 실제로 얼마나 지급됐나요?",
    answer:
      "노조 공지 기반 보도에 따르면 2025년 실적분 OPI(2026-01-30 지급)는 연봉 대비 MX 50%, DS부문 공통 47%, 한국총괄·SR·CDO 37%, 생산기술연구소 36%, EHS 34%, 경영지원·하만 등 39%, VD·생활가전·네트워크·의료기기 12%, CSS사업팀 11%였습니다. OPI는 연봉의 최대 50%가 상한이며, 본 계산기의 OPI1 지급률에서 본인 사업부에 맞게 조정할 수 있습니다.",
  },
  {
    question: "2026년 임금협상에서 무엇이 바뀌었나요?",
    answer:
      "2026년 5월 27일 조합원 투표(찬성 73.7%)로 최종 타결됐습니다. 핵심: (1) 임금 기본인상률 4.1% + 성과인상률 평균 2.1%, (2) DS부문 특별경영성과급 신설 — 영업이익의 10.5% 재원(상한 없음), 부문 공통 40% + 사업부 60% 분배, 세후 전액 자사주 지급(3분의 1 즉시, 나머지는 1·2년 잠금), 향후 10년 적용, 2027년부터 적자 사업부 최소 보장, (3) 기존 OPI 유지 — 합산 시 영업이익의 약 12%가 성과급 재원이 됩니다. 본 계산기의 10.5%·4:6 모델은 이 타결 내용을 반영한 것입니다.",
  },
  {
    question: "본인 연봉이 다르면 성과급도 다른가요?",
    answer:
      "본 계산기 상단의 1인당 평균은 평균 직원 연봉 8,000만원 기준입니다. '내 연봉으로 계산' 섹션에 본인 연봉을 입력하면 비례 모델로 본인 케이스의 세전 성과급과 세후 실수령액이 산출됩니다. 실제 회사 정책은 기본급 비례·평가 등급·호봉 등 복합 요인이 작용하므로 본 결과는 추정치이며, 정확한 금액은 회사 명세서를 확인하세요.",
  },
  {
    question: "세금 계산 가정을 직접 조정할 수 있나요?",
    answer:
      "네, '내 연봉으로 계산' 섹션 안의 '계산 가정 조정 — OPI1·세금'에서 (1) 세액공제율을 0~50%까지 슬라이더로 조정 (디폴트 20%, 자녀·연금·의료비·기부 등 공제 반영 비율), (2) 4대보험 추가 부과 적용 여부를 체크박스로 ON/OFF, (3) OPI1 지급률을 0~50%로 조정할 수 있습니다. 성과급은 보수에 합산되어 4대보험 정산되지만, 국민연금은 기준소득월액 상한(2026년 7월부터 월 659만원, 연 환산 7,908만원)이 있어 고소득자는 추가 부과액이 적습니다.",
  },
  {
    question: "사업부 가중치는 무엇인가요?",
    answer:
      "사업부 가중치는 사업부의 영업이익 기여도·전략적 중요도를 반영한 상대값입니다. 1.0이 표준이고, 0.55면 55% 가중, 0.05면 거의 사업부 분배 제외(부문 균등 분배만 수령)됩니다. 본 계산기 디폴트는 메모리 1.0 / 공통 0.55 / 파운드리·시스템LSI 0.05로, 보도된 791%/553%/252% 결과에 매칭되도록 역산 보정한 값입니다. 회의록 원본 가중치는 1.0/0.7/0.0이지만 영업이익 350조 가정에서는 보도값과 정합되지 않아 보도값 매칭을 우선했습니다. 사용자가 회의록 원본 값으로 자유롭게 조정 가능합니다.",
  },
  {
    question: "다년도 RSU 시뮬레이션은 무엇을 보여주나요?",
    answer:
      "매년 다르게 풀리는 주식(RSU) 매도 제한을 반영해, 여러 해 누적한 RSU를 한 번에 매도할 때의 총 가치를 추정합니다. 각 연도 행마다 1인당 성과급·RSU 비중·풀린 비율(누적)·그 해 주가를 입력하면 누적 매도 가능 주식 수가 자동 합산되고, 하단의 '기준 매도가' 시나리오로 매도 시 총 가치를 비교할 수 있습니다. 우측 그래프는 연도별 누적 가치를 '그 해 주가 기준'과 '기준 매도가 기준' 2색 막대로 비교 시각화합니다.",
  },
  {
    question: "성과급 세금은 어떻게 빠지나요?",
    answer:
      "성과급은 별도 분리과세가 아니라 연간 근로소득에 합산되어 누진세율(6~45%)이 적용됩니다. 여기에 지방소득세(소득세의 10%), 그리고 4대보험은 보수에 합산되어 정산되지만 국민연금은 기준소득월액 상한(2026년 7월부터 연 환산 7,908만원) 적용, 건강·고용보험은 상한 없음으로 처리됩니다. 일반적으로 성과급 실효세율은 20~38% 수준이며, 세액공제 활용도와 적용되는 4대보험 부과 방식에 따라 차이가 큽니다.",
  },
  {
    question: "주식 매도 제한이 매년 다른 이유는?",
    answer:
      "삼성전자가 임직원에게 지급하는 RSU(Restricted Stock Unit, 양도제한조건부주식)는 받은 단위마다 별도 베스팅(vesting) 일정이 있습니다. 일반적으로 받은 해 0%, 1~4년차에 25%씩 누적 풀리는 구조이며, 회사 정책에 따라 cliff 형태(1년차까지 0%)나 5년 균등 등 변형이 가능합니다. 본 계산기는 매년 풀리는 비율을 사용자가 직접 입력할 수 있어 다양한 vesting 시나리오를 검토할 수 있습니다.",
  },
  {
    question: "SK하이닉스 성과급과 어떻게 다른가요?",
    answer:
      "SK하이닉스는 PS(Profit Sharing)를 기준급(연봉의 20분의 1) 대비 %로 지급하고, 삼성전자는 영업이익 풀을 부문·사업부로 분배하는 방식입니다. 2025년 실적 기준 SK하이닉스 PS는 2964%(2026년 2월 5일 지급, 상한 1000% 폐지 후 첫 적용)로, 연간 PI 300%(반기 150%×2회)까지 합치면 총 3264% — 연봉 1억 기준 PS만 세전 약 1억 4,820만원입니다. 80%는 즉시, 20%는 2년에 걸쳐 이연 지급됩니다. 정밀 계산은 SK하이닉스 성과급 계산기(/calc/sk-hynix-bonus)를 이용하세요.",
  },
  {
    question: "가고과·나고과를 받으면 성과급이 얼마나 달라지나요?",
    answer:
      "보도 기준으로 CL4(부장·수석)의 평가 등급별 배수는 가고과 1.4배, 나고과 1.2배, 일반 1.0배가 사업부 분배분에 적용되는 것으로 알려져 있습니다. 본 페이지의 '다년도 누적 성과급 시뮬레이터'에서 본인 CL(CL1~CL4 직급)과 연도별 평가 등급을 설정하면 가/나고과 반영 세전·세후 누적액을 시뮬레이션할 수 있습니다. 부문 균등 분배분(40%)은 평가와 무관하게 동일합니다.",
  },
  {
    question: "이 계산기 결과를 어디까지 신뢰할 수 있나요?",
    answer:
      "본 계산기는 공개된 노사 합의 보도, 사업보고서, 일반적인 영업이익 분배 모델을 기반으로 한 추정 시뮬레이터이며 회사 공식 자료가 아닙니다. 실제 지급은 본인 사업부의 정확한 영업이익, 평가 등급, 호봉, 기본급 비율 등에 따라 ±20~30% 차이가 날 수 있습니다. 결과는 의사결정 참고용으로만 사용하시고, 정확한 본인 케이스는 사내 HR 시스템 명세서를 확인하세요.",
  },
  {
    question: "성과급 받으면 어떻게 절세할 수 있나요?",
    answer:
      "성과급 자체의 세율은 낮출 수 없지만 환급액을 키우는 방법은 있습니다. (1) IRP·연금저축 추가 납입 (연 900만원 한도, 연봉 5,500만 이하 16.5% / 초과 13.2% 세액공제), (2) 우리사주조합 출연 (연 400만원 한도 비과세), (3) 의료비·교육비·기부금 세액공제 극대화, (4) 고향사랑기부 (10만원까지 100% 세액공제). 성과급 입금 직후 IRP 한도를 채우는 게 가장 효과 큽니다.",
  },
  {
    question: "삼성전자 성과급은 언제, 몇 번 지급되나요?",
    answer:
      "공개 보도 기준 삼성전자는 통상 (1) 연초(1월 전후)에 전년도 실적에 따른 OPI(초과이익성과금, 옛 PS)를 한 번에 지급하고, (2) 상·하반기에 목표달성장려금(TAI, 옛 PI)을 기본급의 일정 비율로 나눠 지급하는 구조로 알려져 있습니다. 본 계산기는 연 단위 OPI 재원 분배를 중심으로 추정하므로, 반기 TAI까지 합산하려면 그만큼 더해 보세요. 정확한 지급 시기·횟수는 매년 노사 협의와 회사 공지에 따라 달라집니다.",
  },
  {
    question: "삼성전자 평균 성과급은 얼마인가요?",
    answer:
      "사업부·연도별 영업이익에 따라 편차가 매우 큽니다. 본 계산기 디폴트(영업이익 350조 가정, 평균 연봉 8,000만원)에서는 메모리 사업부가 연봉의 수백 % 수준으로 가장 높고, 적자 사업부는 부문 균등분만 받아 크게 낮아지는 식으로 추정됩니다. '평균'이라는 단일 숫자보다, 위 계산기에 본인 사업부·연봉·그 해 영업이익을 넣어 본인 케이스를 직접 확인하는 것이 정확합니다. 본 결과는 공개 보도 기반 추정치입니다.",
  },
];

const HOW_TO_STEPS = [
  {
    name: "영업이익 입력",
    text:
      "회사 연간 영업이익(조원)을 입력합니다. 분기 영업이익이면 4배 환산. 30·100·350·1000조 등 다양한 시나리오를 빠른선택 칩으로 비교 가능합니다.",
  },
  {
    name: "사업부 인원·가중치 확인",
    text:
      "메모리·공통·파운드리·시스템LSI의 인원과 사업부 가중치를 확인. 회사 정책에 따라 조정 가능. 적자 사업부는 가중치 0으로 두면 사업부 분배에서 제외.",
  },
  {
    name: "사업부별 1인당 평균 확인",
    text:
      "부문(40%) + 사업부(60%) 분배 결과로 사업부별 1인당 평균이 자동 산출됩니다.",
  },
  {
    name: "내 연봉으로 본인 케이스 계산",
    text:
      "본인 연봉과 소속 사업부를 선택하면 본인 케이스의 세전·세후 성과급이 산출됩니다. 세액공제율·4대보험 부과 적용도 직접 조정 가능.",
  },
  {
    name: "다년도 RSU 매도 시뮬",
    text:
      "연도별 1인당 성과급·RSU 비중·풀린 비율·주가를 입력. 누적 매도 가능 주식이 합산되고, 기준 매도가 입력 시 통합 매도 시 가치와 누적 그래프가 산출됩니다.",
  },
  {
    name: "TAI 미니 계산기",
    text:
      "월 기본급을 입력하고 사업부를 선택하면 2026년 상반기 실제 발표 지급률(메모리 100% 등)로 이번 TAI가 즉시 계산됩니다.",
  },
];

// ─────────────────────────────────────────────────────────────
// SEO Metadata — title.absolute로 layout template 중복 차단
// ─────────────────────────────────────────────────────────────

export const metadata: Metadata = {
  title: {
    absolute: PAGE_TITLE_FULL, // "삼성전자 성과급 계산기 2026 | 머니샐러리"
  },
  description: PAGE_DESC,
  keywords: [
    // 핵심
    "삼성전자 성과급 계산기",
    "삼성 성과급 계산기",
    "삼전 성과급 계산기",
    "삼성 전자 성과급 계산기",
    "삼성전자 성과급 시뮬레이터",
    "삼성 성과급 계산",
    "삼성전자 성과급",
    "삼성 보너스",
    // OPI
    "삼성 OPI",
    "OPI 계산",
    "초과이익성과금",
    // TAI
    "삼성 TAI",
    "TAI 계산기",
    "목표달성장려금",
    "삼성전자 TAI 지급률",
    "삼성 TAI 상반기",
    "삼성 성과급 지급일",
    // 직급/평가
    "삼성 CL4 성과급",
    "가고과 성과급",
    "삼성 직급별 성과급",
    "삼성 특별경영성과급",
    // 영업이익/분배
    "삼성 영업이익 분배",
    "삼성 1인당 성과급",
    "삼성 부문 사업부 분배",
    // 사업부
    "삼성 메모리 성과급",
    "삼성 파운드리 성과급",
    "삼성 시스템LSI 성과급",
    "DS 부문 성과급",
    // RSU
    "삼성전자 RSU",
    "삼성 RSU 매도",
    "양도제한조건부주식",
    "RSU 베스팅",
    // 세금
    "성과급 세금",
    "성과급 세후",
    "성과급 실수령액",
    // 비교
    "SK하이닉스 성과급",
    "반도체 성과급",
    "삼성 임금협상 2026",
  ].join(", "),
  alternates: {
    canonical: `${SITE_URL}${PAGE_PATH}`,
    languages: {
      "ko-KR": `${SITE_URL}${PAGE_PATH}`,
      "x-default": `${SITE_URL}${PAGE_PATH}`,
    },
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    type: "website",
    locale: "ko_KR",
    url: `${SITE_URL}${PAGE_PATH}`,
    siteName: SITE_NAME,
    title: PAGE_TITLE_FULL,
    description: PAGE_DESC,
    images: [
      {
        url: `${SITE_URL}/api/og?type=tool&name=${encodeURIComponent(
          "삼성전자 성과급 계산기"
        )}`,
        width: 1200,
        height: 630,
        alt: PAGE_TITLE,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: PAGE_TITLE_FULL,
    description: PAGE_DESC,
    images: [
      `${SITE_URL}/api/og?type=tool&name=${encodeURIComponent(
        "삼성전자 성과급 계산기"
      )}`,
    ],
  },
};

// ─────────────────────────────────────────────────────────────
// 사업부 시나리오 (본문 보강)
// ─────────────────────────────────────────────────────────────

const DIVISION_SCENARIOS = [
  {
    name: "메모리",
    profitRange: "안정 5~10조 / 호황기 20~30조",
    perPersonRange: "3,000~8,000만원",
    color: "#0145F2",
    note:
      "HBM·D램·NAND. 호황 시 가중치 1.0 기준 사업부 풀 최대 수혜.",
  },
  {
    name: "공통 (스태프·연구소)",
    profitRange: "DS 평균에 준함",
    perPersonRange: "2,500~6,000만원",
    color: "#F59E0B",
    note: "특정 사업부에 속하지 않는 인력. 보도값 553% 매칭 디폴트 0.55 (회의록 원본 0.7).",
  },
  {
    name: "파운드리·시스템LSI",
    profitRange: "적자 ~ 1~3조",
    perPersonRange: "1,500~2,500만원",
    color: "#EF4444",
    note: "2026년 적자 → 보도값 매칭 디폴트 0.05 (회의록 원본 0.0). 2027년~ 성과 가변.",
  },
];

const RSU_SCHEDULE_EXAMPLES = [
  {
    title: "표준 4년 균등 vest",
    desc: "받은 해 0% → 1년 25% → 2년 50% → 3년 75% → 4년 100%",
  },
  {
    title: "Cliff 1년 + 3년 균등",
    desc: "1년차까지 0% (cliff) → 2년 33% → 3년 67% → 4년 100%",
  },
  {
    title: "5년 균등",
    desc: "매년 20%씩 풀려 5년차 100%",
  },
];

export default function SamsungBonusCalculatorPage() {
  return (
    <>
      <JsonLd
        data={[
          softwareApplicationLd({
            name: "삼성전자 성과급 계산기",
            description: PAGE_DESC,
            url: PAGE_PATH,
          }),
          autoBreadcrumbLd(PAGE_PATH, {
            leafName: "삼성전자 성과급 계산기",
          }),
          faqLd(FAQ_ITEMS),
          howToLd({
            name: "삼성전자 성과급 계산하는 방법",
            description:
              "영업이익 입력부터 본인 연봉별 세후 실수령, 다년도 RSU 매도 시뮬, TAI 계산까지 6단계.",
            steps: HOW_TO_STEPS,
            totalTime: "PT3M",
          }),
        ]}
      />

      <main className="min-h-screen pb-32 pt-24 px-4 font-sans bg-canvas dark:bg-canvas-950">
        <div className="max-w-2xl mx-auto">
          {/* Hero */}
          <header className="text-center mb-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-[0.2em] mb-5 bg-electric-10 text-electric border border-electric-30">
              <Sparkles size={12} aria-hidden /> Samsung 성과급 시뮬레이터
            </div>
            <h1
              className="text-4xl sm:text-5xl font-black tracking-tight mb-3 text-navy dark:text-canvas-50"
              style={{ letterSpacing: "-0.04em" }}
            >
              삼성전자 성과급 계산기
            </h1>
            <p className="text-base sm:text-lg font-medium text-muted-blue dark:text-canvas-300">
              영업이익 → 부문 40% + 사업부 60% 분배 →{" "}
              <strong className="text-electric">사업부별 1인당</strong>
            </p>
            <p className="text-sm text-faint-blue mt-3 max-w-md mx-auto leading-relaxed">
              영업이익{" "}
              <strong className="text-navy dark:text-canvas-50">10.5%</strong>{" "}
              재원·<strong className="text-navy dark:text-canvas-50">4:6</strong>{" "}
              분배 기준 (2026년 5월 노사 합의 타결 보도 기반). 사업부 1인당 평균
              + 본인 연봉별 세전·세후 + 다년도 RSU 매도 시뮬 +{" "}
              <strong className="text-navy dark:text-canvas-50">
                TAI(목표달성장려금)
              </strong>{" "}
              미니 계산기.
            </p>
            <p className="text-xs text-faint-blue mt-2 max-w-md mx-auto leading-relaxed">
              <strong>삼성 성과급 계산기</strong>(삼전 성과급 계산기)를
              찾으셨다면 바로 이 페이지입니다 — OPI(초과이익성과금) 재원부터
              본인 실수령액까지 한 번에 추정합니다.
            </p>
          </header>

          <SamsungBonusClient />

          <InArticleAd />

          {/* ═══ TAI (목표달성장려금) — 2026 상반기 실제 발표 지급률 ═══ */}
          <section className="mb-10" aria-labelledby="tai-title">
            <h2
              id="tai-title"
              className="text-2xl font-black text-navy dark:text-canvas-50 mb-2"
            >
              삼성전자 TAI(목표달성장려금) — 2026 상반기 지급률
            </h2>
            <p className="text-sm text-muted-blue dark:text-canvas-300 mb-5 leading-relaxed">
              TAI는 OPI와 별도로 <strong>월 기본급 대비 %</strong>로 상·하반기
              연 2회 지급되는 성과급입니다. 2026년 상반기 지급률은{" "}
              {TAI_ANNOUNCED_DATE} 사내 공지됐고(복수 언론 보도 기준),{" "}
              {TAI_PAY_DATE}에 지급됩니다.
            </p>

            <div className="overflow-x-auto rounded-2xl border border-canvas-200 dark:border-canvas-800 mb-5">
              <table className="w-full text-sm bg-white dark:bg-canvas-900">
                <caption className="sr-only">
                  삼성전자 2026년 상반기 TAI 사업부별 지급률 (월 기본급 대비)
                </caption>
                <thead>
                  <tr className="border-b border-canvas-200 dark:border-canvas-800 text-left">
                    <th className="px-4 py-3 text-[11px] font-black uppercase tracking-widest text-faint-blue">
                      부문
                    </th>
                    <th className="px-4 py-3 text-[11px] font-black uppercase tracking-widest text-faint-blue">
                      사업부
                    </th>
                    <th className="px-4 py-3 text-[11px] font-black uppercase tracking-widest text-faint-blue text-right">
                      지급률 (월 기본급 대비)
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {TAI_RATES_2026_H1.map((t) => (
                    <tr
                      key={t.id}
                      className="border-b border-canvas-100 dark:border-canvas-800/60 last:border-0"
                    >
                      <td className="px-4 py-2.5 text-xs font-bold text-faint-blue">
                        {t.group}
                      </td>
                      <td className="px-4 py-2.5 font-bold text-navy dark:text-canvas-50">
                        {t.division}
                      </td>
                      <td
                        className={`px-4 py-2.5 text-right font-black tabular-nums ${
                          t.rate >= 100
                            ? "text-electric dark:text-[#4D80F5]"
                            : t.rate >= 75
                            ? "text-emerald-600 dark:text-emerald-400"
                            : "text-muted-blue dark:text-canvas-300"
                        }`}
                      >
                        {t.rate}%
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <TaiCalculator />

            <p className="text-xs text-faint-blue mt-3 leading-relaxed">
              ※ 하반기 TAI는 통상 12월 말 발표되며 사업부 실적에 따라 상반기와
              다를 수 있습니다. 위 지급률은 사내 공지를 인용한 복수 언론 보도
              기준이며 회사 공식 발표 자료가 아닙니다.
            </p>
          </section>

          {/* ═══ OPI 실제 지급률 — 2025년 실적분 (2026-01-30 지급) ═══ */}
          <section className="mb-10" aria-labelledby="opi-actual-title">
            <h2
              id="opi-actual-title"
              className="text-2xl font-black text-navy dark:text-canvas-50 mb-2"
            >
              OPI(초과이익성과금) 실제 지급률 — 2025년 실적분
            </h2>
            <p className="text-sm text-muted-blue dark:text-canvas-300 mb-5 leading-relaxed">
              OPI는 <strong>연봉 대비 %</strong>(상한 50%)로 연 1회, 통상 1월
              말~2월 초에 지급됩니다. 2025년 실적분은 2026년 1월 30일
              지급됐으며, 노조 공지 기반 보도에 따른 실제 지급률은 다음과
              같습니다.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
              {[
                { label: "MX (스마트폰)", rate: "50%", top: true },
                { label: "DS부문 공통", rate: "47%", top: true },
                { label: "한국총괄·SR·CDO", rate: "37%", top: false },
                { label: "생산기술연구소", rate: "36%", top: false },
                { label: "EHS", rate: "34%", top: false },
                { label: "경영지원·하만·상생협력·글로벌CS", rate: "39%", top: false },
                { label: "VD·생활가전·네트워크·의료기기", rate: "12%", top: false },
                { label: "CSS사업팀", rate: "11%", top: false },
              ].map((r) => (
                <div
                  key={r.label}
                  className="flex items-center justify-between rounded-xl bg-white dark:bg-canvas-900 border border-canvas-200 dark:border-canvas-800 px-4 py-3"
                >
                  <span className="text-sm font-bold text-navy dark:text-canvas-50">
                    {r.label}
                  </span>
                  <span
                    className={`font-black tabular-nums ${
                      r.top ? "text-electric text-lg" : "text-muted-blue"
                    }`}
                  >
                    {r.rate}
                  </span>
                </div>
              ))}
            </div>
            <p className="text-xs text-faint-blue leading-relaxed">
              ※ 연봉 대비 기준. 본 계산기의 OPI1 지급률 슬라이더를 본인 사업부
              값으로 조정하면 실제에 가까운 시뮬레이션이 됩니다. 2027년 1월
              지급분부터는 신설 특별경영성과급(영업이익의 10.5% 재원)이
              합산되어 큰 폭으로 달라질 전망입니다.
            </p>
          </section>

          {/* 근거·한계·면책 — 별도 블록 */}
          <section
            className="mb-10 rounded-2xl bg-white dark:bg-canvas-900 border border-canvas-200 dark:border-canvas-800 p-6"
            aria-labelledby="basis-title"
          >
            <h2
              id="basis-title"
              className="text-xl font-black text-navy dark:text-canvas-50 mb-4 inline-flex items-center gap-2"
            >
              <ShieldCheck className="w-5 h-5 text-electric" aria-hidden />
              근거 · 한계 · 면책
            </h2>
            <div className="space-y-4 text-sm leading-relaxed">
              <div>
                <p className="font-bold text-navy dark:text-canvas-50 mb-1">
                  근거
                </p>
                <p className="text-muted-blue dark:text-canvas-300">
                  영업이익 10.5% 재원, 부문:사업부 4:6 분배 비율은 2026년 5월
                  27일 조합원 투표(찬성 73.7%)로 <strong>최종 타결된 노사
                  합의</strong>의 DS부문 특별경영성과급 내용(복수 언론 보도
                  기준)입니다. 합의 보도에 따르면 특별경영성과급은 세후 전액
                  자사주로 지급(3분의 1 즉시, 나머지는 1·2년 잠금)되며 향후
                  10년 적용, 기존 OPI(연봉의 최대 50%)는 별도 유지됩니다.
                  사업부 디폴트 인원은 사업보고서 공시 자료를 참고했습니다.
                </p>
              </div>
              <div>
                <p className="font-bold text-navy dark:text-canvas-50 mb-1">
                  한계
                </p>
                <ul className="text-muted-blue dark:text-canvas-300 space-y-1 list-disc pl-5">
                  <li>실제 분배 정책·가중치·평가 등급은 회사 비공개 영역.</li>
                  <li>
                    1인당 평균값이며 본인 호봉·평가·기본급 비율에 따라 ±20~30%
                    차이.
                  </li>
                  <li>
                    <strong>보도값 매칭 보정 적용</strong> — 보도된
                    791%/553%/252% 결과에 가장 근접하도록 가중치를{" "}
                    <strong>1.0 / 0.55 / 0.05</strong>로 역산 보정했습니다
                    (영업이익 350조 입력 시 약 858/579/269%). 회의록 원본
                    가중치 1.0/0.7/0.0은 보도값과 정합 불가(특히 공통 642% vs
                    553%)하므로 보도값 매칭을 우선했습니다. 참고로 이
                    791%/553%/252%는 1월 OPI 실지급률이 아니라, 임금협상 타결
                    보도의 <strong>연봉 1억 가정 시뮬레이션</strong>(OPI+특별
                    경영성과급 합산액)을 월 기본급 대비로 환산한 수치입니다.
                  </li>
                  <li>
                    <strong>2026년 한정</strong> — 회의록상 적자
                    사업부(파운드리·LSI) 가중치 0. 2027년 이후는 사업부 성과에
                    따라 조정 (흑자 전환 시 가중치 ↑). UI에서 직접 입력하세요.
                  </li>
                  <li>
                    세금은 누진세율 기준 추정. 4대보험은 회사 분담분·정산 시점
                    차이로 실제 본인 부담과 다름.
                  </li>
                  <li>
                    RSU 베스팅 일정은 회사·계약별 상이. 본인 RSU 약정서 확인 필요.
                  </li>
                </ul>
              </div>
              <div>
                <p className="font-bold text-navy dark:text-canvas-50 mb-1">
                  면책
                </p>
                <p className="text-muted-blue dark:text-canvas-300">
                  본 계산기는 의사결정 참고용 시뮬레이터이며 회사 공식 자료가
                  아닙니다. 결과를 근거로 한 재무·법무·세무 의사결정은 전문가
                  자문을 받으시고, 정확한 본인 케이스는 사내 HR 시스템 명세서를
                  확인하세요.
                </p>
              </div>
            </div>
          </section>

          {/* 사업부 시나리오 */}
          <section className="mb-10" aria-labelledby="scenario-title">
            <h2
              id="scenario-title"
              className="text-2xl font-black text-navy dark:text-canvas-50 mb-5"
            >
              사업부별 1인당 성과급 시나리오
            </h2>
            <p className="text-sm text-muted-blue dark:text-canvas-300 mb-5 leading-relaxed">
              삼성전자 DS(반도체) 부문은 메모리·공통·파운드리·시스템LSI 세
              갈래로 구성되며, 사업부별 영업이익 기여도에 따라 1인당 성과급이
              크게 달라집니다. 아래는 본 계산기 디폴트 가정에 기반한 일반적
              시나리오 레인지입니다.
            </p>
            <div className="space-y-3">
              {DIVISION_SCENARIOS.map((s) => (
                <div
                  key={s.name}
                  className="rounded-2xl bg-white dark:bg-canvas-900 p-5 transition-all hover:-translate-y-0.5 hover:shadow-md"
                  style={{ borderLeft: `4px solid ${s.color}` }}
                >
                  <p className="font-black text-navy dark:text-canvas-50 mb-2">
                    {s.name}
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs mb-2">
                    <div>
                      <p className="text-faint-blue mb-0.5">영업이익 범위</p>
                      <p className="text-muted-blue">{s.profitRange}</p>
                    </div>
                    <div>
                      <p className="text-faint-blue mb-0.5">1인당 성과급</p>
                      <p
                        className="font-black"
                        style={{ color: s.color }}
                      >
                        {s.perPersonRange}
                      </p>
                    </div>
                  </div>
                  <p className="text-xs text-muted-blue leading-relaxed">
                    {s.note}
                  </p>
                </div>
              ))}
            </div>
          </section>

          {/* 운영자 승인 광고 배치(2026-07-07): 550줄 무수익 콘텐츠 구간 중간 —
              시나리오 섹션과 RSU 섹션 사이. 타 회사 보너스 계산기와 동일 3유닛 구성. */}
          <CalcResultAd />

          {/* 다년도 RSU 모델 설명 */}
          <section className="mb-10" aria-labelledby="rsu-desc-title">
            <h2
              id="rsu-desc-title"
              className="text-2xl font-black text-navy dark:text-canvas-50 mb-5 flex items-center gap-2"
            >
              <Coins className="w-6 h-6 text-electric" aria-hidden />
              다년도 RSU 매도 시뮬 — 어떻게 작동하나
            </h2>
            <div className="rounded-2xl bg-white dark:bg-canvas-900 border border-canvas-200 dark:border-canvas-800 p-6 space-y-4">
              <p className="text-sm text-muted-blue dark:text-canvas-300 leading-relaxed">
                삼성전자가 임직원에게 지급하는 RSU(Restricted Stock Unit,
                양도제한조건부주식)는 받은 단위마다 별도 베스팅 일정을 따릅니다.
                매년 풀리는 비율이 회사 정책에 따라 다르게 적용되므로, 본 계산기는
                각 연도별 풀림 비율을 사용자가 자유롭게 입력하고 누적 매도 가능
                주식과 통합 매도가 기준 가치를 한 번에 비교할 수 있도록
                설계했습니다.
              </p>
              <div className="rounded-xl px-4 py-3 bg-electric-5 border border-electric-20 text-xs text-muted-blue dark:text-canvas-300 leading-relaxed">
                <p className="font-black text-navy dark:text-canvas-50 mb-1">
                  2026년 주식 보상 제도 변화 (보도 기준)
                </p>
                <ul className="list-disc pl-4 space-y-0.5">
                  <li>
                    1월부터 전 임직원 <strong>OPI 자사주 선택제</strong> 시행 —
                    OPI의 0~50%를 10% 단위로 자사주 수령 선택 가능, 1년 이상
                    보유 시 해당 금액의 <strong>15%를 주식으로 추가 지급</strong>
                    (예: 500만원 주식 선택 → 75만원 추가).
                  </li>
                  <li>
                    5월 타결 <strong>DS부문 특별경영성과급은 세후 전액
                    자사주</strong> — 3분의 1 즉시 매도 가능, 나머지는 1·2년
                    잠금 후 순차 해제 (2027년 1월 지급분부터).
                  </li>
                  <li>임원 자사주 의무수령 규정은 1년 만에 폐지 → 자율 선택제.</li>
                </ul>
              </div>
              <div className="space-y-3 text-sm">
                <Step
                  num="1"
                  title="그 해 1인당 성과급 (만원)"
                  desc='위 시뮬레이터 결과를 가져오거나 직접 입력. "메모리 1인당으로 채우기" 버튼으로 일괄 적용.'
                />
                <Step
                  num="2"
                  title="RSU 비중 (%)"
                  desc="성과급 중 주식 보상으로 받는 비중. 디폴트 30%."
                />
                <Step
                  num="3"
                  title="풀린 비율 (%, 누적)"
                  desc="그 해 받은 RSU 중 현재 시점에 매도 가능한 누적 비율. 가장 오래된 RSU는 100%, 작년 RSU는 25% 등 자유 입력."
                  highlight
                />
                <Step
                  num="4"
                  title="그 해 주가 (원/주)"
                  desc="RSU 받은 시점의 주가. RSU 주식 수 = 가치 ÷ 그 해 주가."
                />
                <Step
                  num="="
                  title="누적 매도 가능 × 기준 매도가"
                  desc="모든 연도 매도 가능 주식을 합산하고, 기준 매도가 입력 시 통합 매도 시 가치 산출. 우측 그래프로 추이 비교."
                />
              </div>
            </div>
          </section>

          {/* Vesting 예시 */}
          <section className="mb-10" aria-labelledby="vest-title">
            <h2
              id="vest-title"
              className="text-2xl font-black text-navy dark:text-canvas-50 mb-5"
            >
              자주 쓰이는 Vesting 일정 예시
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {RSU_SCHEDULE_EXAMPLES.map((ex, i) => (
                <div
                  key={ex.title}
                  className="rounded-2xl bg-white dark:bg-canvas-900 border border-canvas-200 dark:border-canvas-800 p-5 transition-all hover:-translate-y-0.5 hover:shadow-md"
                >
                  <p className="text-xs font-black uppercase tracking-widest text-electric mb-2">
                    예시 {i + 1}
                  </p>
                  <p className="font-bold text-navy dark:text-canvas-50 text-sm mb-2">
                    {ex.title}
                  </p>
                  <p className="text-xs text-muted-blue leading-relaxed">
                    {ex.desc}
                  </p>
                </div>
              ))}
            </div>
            <p className="text-xs text-faint-blue mt-3 leading-relaxed">
              ※ 실제 본인 RSU 일정은 약정서 별도 명시. 위 예시는 일반적 형태이며,
              본 계산기에서 매년 풀림 % 값을 직접 입력해 정확히 반영하세요.
            </p>
          </section>

          {/* 분배 모델 단계 */}
          <section className="mb-10" aria-labelledby="model-title">
            <h2
              id="model-title"
              className="text-2xl font-black text-navy dark:text-canvas-50 mb-5"
            >
              분배 모델 — OPI1 + OPI2 어떻게 계산되나
            </h2>
            <div className="rounded-2xl bg-white dark:bg-canvas-900 border border-canvas-200 dark:border-canvas-800 p-6 space-y-4">
              <Step
                num="A"
                title="OPI1 (기존 OPI·초과이익성과금) = 연봉 × 지급률"
                desc="상한 50%. 사업부별 실지급률 상이(2025년분: MX 50%·DS 47%·VD 12% 등) — 계산기에서 조정 가능. 임계값 미달 연도에도 지급."
                highlight
              />
              <Step
                num="1"
                title="OPI2 재원 산정 (영업이익 × 10.5%)"
                desc="예) 350조 × 10.5% = 36.75조원. 영업이익 임계값(26~28년 200조, 29~35년 100조) 미달 시 OPI2만 0."
              />
              <Step
                num="2"
                title="OPI2 → 부문 40% : 사업부 60% 분할"
                desc="총 재원의 40%는 부문 풀(전체 인원 균등), 60%는 사업부 풀(인원×가중치 분배)."
              />
              <Step
                num="3"
                title="부문 1인당 (균등 분배)"
                desc="부문 재원 ÷ 전체 인원. 어느 사업부 소속이든 동일 금액."
              />
              <Step
                num="4"
                title="사업부 1인당 (가중치 분배)"
                desc="사업부 재원 × (본인 가중치) ÷ Σ(인원×가중치). 2026 적자 사업부 가중치 0 → 사업부 분배 0."
                mono
              />
              <Step
                num="="
                title="최종 1인당 = OPI1 + OPI2(부문 + 사업부)"
                desc="세전 합산 평균. 세금은 OPI1+OPI2를 합쳐 누진세 적용."
              />
            </div>
          </section>

          {/* 본문 */}
          <article className="prose prose-sm sm:prose-base dark:prose-invert max-w-none mb-10">
            <h2 className="text-2xl font-black text-navy dark:text-canvas-50 mt-8 mb-4">
              영업이익 10.5% 재원 — 의미와 한계
            </h2>
            <p className="text-muted-blue dark:text-canvas-300 leading-relaxed">
              공개 보도에 따르면 삼성전자는 영업이익의 일정 비율을 성과급 풀로
              책정하는 방식으로 알려져 있고, 본 계산기는 그 비율을 10.5%로 고정해
              시뮬레이션합니다. 다만 이 비율은 회사 공식 발표가 아닌 보도 기반
              가정이므로 실제 분배 정책과 차이가 있을 수 있습니다. 사용자가
              영업이익만 다양하게 바꿔가며 사업부별 1인당 추정치 변화를 빠르게
              비교하는 도구로 활용하세요.
            </p>

            <h2 className="text-2xl font-black text-navy dark:text-canvas-50 mt-10 mb-4">
              부문 4 : 사업부 6 — 분배 균형
            </h2>
            <p className="text-muted-blue dark:text-canvas-300 leading-relaxed">
              부문 분배는 회사 전체 인원에 균등 지급하는 방식으로, 어느 사업부
              소속이든 동일 금액을 받습니다. 사업부 분배는 사업부별 가중치(영업이익
              기여도 반영)에 따라 차등 지급됩니다. 4:6 비율은 부문 안전망(균등)을
              유지하면서 사업부 성과 차이를 보상에 반영하는 균형점입니다.
            </p>

            <h2 className="text-2xl font-black text-navy dark:text-canvas-50 mt-10 mb-4">
              세후 실수령 — 가정 조정의 중요성
            </h2>
            <p className="text-muted-blue dark:text-canvas-300 leading-relaxed">
              성과급은 별도 분리과세가 아닌 근로소득 합산 누진세율(6~45%) 적용
              대상이며, 세후는 다음 변수에 크게 좌우됩니다:
            </p>
            <ul className="space-y-1 text-muted-blue dark:text-canvas-300 leading-relaxed">
              <li>
                • <strong>세액공제율</strong> (자녀·연금·의료비·기부 등) — 본
                계산기는 0~50% 슬라이더로 직접 조정 가능
              </li>
              <li>
                • <strong>4대보험 부과 방식</strong> — 보수정산 시 추가 부과 여부를
                토글로 ON/OFF 가능. 국민연금은 기준소득월액 상한(2026년 7월부터
                연 환산 7,908만원) 적용
              </li>
              <li>
                • <strong>한계세율 구간</strong> — 연봉 1억 이상은 35~38% 구간
                진입으로 세금 부담 증가
              </li>
            </ul>
            <p className="text-muted-blue dark:text-canvas-300 leading-relaxed">
              가정에 따라 실효세율 20~38% 범위로 달라지므로, 본 계산기의 가정
              조정 패널로 본인 상황에 맞게 시뮬레이션하세요. 세액공제 여력을
              늘리는 대표 수단은 IRP·연금저축(합산 연 900만원 한도 세액공제)
              입니다 —{" "}
              <Link
                href="/tools/finance/irp"
                className="font-bold text-electric underline underline-offset-2"
              >
                IRP 세액공제 계산기
              </Link>
              로 성과급 입금 직후 납입 시 환급 효과를 확인해 보세요.
            </p>

            <h2 className="text-2xl font-black text-navy dark:text-canvas-50 mt-10 mb-4">
              RSU 누적 매도 전략의 고려 사항
            </h2>
            <p className="text-muted-blue dark:text-canvas-300 leading-relaxed">
              성과급 일부는 현금이 아닌 RSU(양도제한조건부주식)로 지급되며, 매년
              풀리는 비율이 점진적으로 늘어나는 베스팅 구조가 일반적입니다.
              다년간 누적된 RSU를 한 번에 매도하면 매도 시점 주가에 매우
              민감해지므로, 본 계산기의 다년도 RSU 시뮬과 누적 그래프는 매도 시점
              결정에 참고가 됩니다. 단, 양도소득세·세금 신고 의무는 별도 검토
              필요합니다.
            </p>
          </article>

          {/* 경고 */}
          <div className="rounded-2xl p-5 mb-8 flex gap-3 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800">
            <AlertTriangle
              size={20}
              className="text-amber-600 dark:text-amber-400 flex-shrink-0 mt-1"
              aria-hidden
            />
            <div>
              <p className="font-black text-amber-900 dark:text-amber-200 mb-1">
                참고용 시뮬레이션입니다
              </p>
              <p className="text-xs text-amber-800 dark:text-amber-300 leading-relaxed">
                본 계산기는 공개된 노사 합의 보도와 일반적인 영업이익 분배 모델
                기반 추정 시뮬레이터이며 회사 공식 자료가 아닙니다. 결과는
                의사결정 참고용으로만 사용하세요.
              </p>
            </div>
          </div>

          {/* 관련 페이지 */}
          <section className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-10">
            <Link
              href="/samsung-negotiation-2026"
              className="block p-5 bg-white dark:bg-canvas-900 border border-canvas-200 dark:border-canvas-800 rounded-2xl hover:border-electric transition-colors group"
            >
              <p className="text-xs font-black uppercase tracking-widest text-electric mb-2">
                시즌 가이드
              </p>
              <p className="font-bold text-navy dark:text-canvas-50 text-sm mb-1">
                삼성전자 2026 임금협상 분석
              </p>
              <p className="text-xs text-muted-blue mb-3">
                5가지 핵심 쟁점, 직급별 예상 인상폭, SK하이닉스 비교
              </p>
              <span className="text-xs font-bold text-electric inline-flex items-center gap-1">
                자세히 보기{" "}
                <ArrowRight
                  className="w-3 h-3 group-hover:translate-x-0.5 transition-transform"
                  aria-hidden
                />
              </span>
            </Link>
            <Link
              href="/salary-db/samsung-electronics"
              className="block p-5 bg-white dark:bg-canvas-900 border border-canvas-200 dark:border-canvas-800 rounded-2xl hover:border-electric transition-colors group"
            >
              <p className="text-xs font-black uppercase tracking-widest text-electric mb-2">
                회사 프로필
              </p>
              <p className="font-bold text-navy dark:text-canvas-50 text-sm mb-1">
                삼성전자 평균 연봉·복지
              </p>
              <p className="text-xs text-muted-blue mb-3">
                직급별 성장표, 1.35억 평균 연봉, 복지 비교
              </p>
              <span className="text-xs font-bold text-electric inline-flex items-center gap-1">
                회사 보기{" "}
                <ArrowRight
                  className="w-3 h-3 group-hover:translate-x-0.5 transition-transform"
                  aria-hidden
                />
              </span>
            </Link>
            <Link
              href="/guides/chip-stock-tax-guide"
              className="block p-5 bg-white dark:bg-canvas-900 border border-canvas-200 dark:border-canvas-800 rounded-2xl hover:border-electric transition-colors group"
            >
              <p className="text-xs font-black uppercase tracking-widest text-electric mb-2">
                심화 가이드
              </p>
              <p className="font-bold text-navy dark:text-canvas-50 text-sm mb-1">
                반도체 RSU·자사주 절세 가이드
              </p>
              <p className="text-xs text-muted-blue mb-3">
                매도 시점·세금 구조·절세 4원칙
              </p>
              <span className="text-xs font-bold text-electric inline-flex items-center gap-1">
                가이드 읽기{" "}
                <ArrowRight
                  className="w-3 h-3 group-hover:translate-x-0.5 transition-transform"
                  aria-hidden
                />
              </span>
            </Link>
            <Link
              href="/tools/finance/bonus"
              className="block p-5 bg-white dark:bg-canvas-900 border border-canvas-200 dark:border-canvas-800 rounded-2xl hover:border-electric transition-colors group"
            >
              <p className="text-xs font-black uppercase tracking-widest text-electric mb-2">
                일반 계산기
              </p>
              <p className="font-bold text-navy dark:text-canvas-50 text-sm mb-1">
                성과급·보너스 세금 계산기
              </p>
              <p className="text-xs text-muted-blue mb-3">
                회사 무관 일반 성과급 실수령액
              </p>
              <span className="text-xs font-bold text-electric inline-flex items-center gap-1">
                계산하기{" "}
                <ArrowRight
                  className="w-3 h-3 group-hover:translate-x-0.5 transition-transform"
                  aria-hidden
                />
              </span>
            </Link>
          </section>

          <CoupangBanner
            responsive={{ mobile: "mobile-banner", desktop: "leaderboard" }}
          />

          {/* FAQ */}
          <section className="mb-10 mt-10" aria-labelledby="faq-title">
            <h2
              id="faq-title"
              className="text-2xl font-black text-navy dark:text-canvas-50 mb-5"
            >
              자주 묻는 질문
            </h2>
            <div className="space-y-3">
              {FAQ_ITEMS.map((item, idx) => (
                <details
                  key={idx}
                  className="rounded-2xl bg-white dark:bg-canvas-900 border border-canvas-200 dark:border-canvas-800 p-5 group transition-shadow hover:shadow-md"
                >
                  <summary className="cursor-pointer font-bold text-navy dark:text-canvas-50 flex items-center justify-between gap-3">
                    <span>{item.question}</span>
                    <span className="text-electric group-open:rotate-180 transition-transform flex-shrink-0">
                      ▾
                    </span>
                  </summary>
                  <p className="mt-3 text-muted-blue dark:text-canvas-300 leading-relaxed text-sm">
                    {item.answer}
                  </p>
                </details>
              ))}
            </div>
          </section>

          <div className="rounded-2xl p-5 mb-8 flex gap-3 bg-electric-5 border border-electric-20">
            <Info
              size={18}
              className="text-electric flex-shrink-0 mt-1"
              aria-hidden
            />
            <p className="text-xs text-muted-blue dark:text-canvas-300 leading-relaxed">
              본 계산기는 공개된 노사 합의 보도와 영업이익 분배 모델 추정치이며
              참고용입니다. 영업이익 10.5% 재원·부문 사업부 4:6 비율은 보도 기반
              고정값, 사업부 인원·가중치·세금 가정은 사용자 조정 가능. 정확한
              본인 케이스는 회사 명세서 확인.
            </p>
          </div>

          <div className="mt-8 mb-8">
            <ShareButtons
              url={`${SITE_URL}${PAGE_PATH}`}
              title={PAGE_TITLE}
              description="영업이익 → 사업부 1인당 분배 + 본인 연봉별 세전·세후 + 다년도 RSU 매도 시뮬"
              imageUrl={`${SITE_URL}/api/og?type=tool&name=${encodeURIComponent(
                "삼성전자 성과급 계산기"
              )}`}
              contentType="samsung_bonus"
            />
          </div>

          <RelatedCalculators currentPath={PAGE_PATH} />
        </div>
      </main>
    </>
  );
}

// ─────────────────────────────────────────────────────────────
// 보조 컴포넌트
// ─────────────────────────────────────────────────────────────

function Step({
  num,
  title,
  desc,
  highlight = false,
  mono = false,
}: {
  num: string;
  title: string;
  desc: string;
  highlight?: boolean;
  mono?: boolean;
}) {
  const isResult = num === "=";
  const bg = isResult
    ? "bg-electric"
    : highlight
    ? "bg-emerald-100 dark:bg-emerald-900/30"
    : "bg-electric-10";
  const color = isResult
    ? "text-white"
    : highlight
    ? "text-emerald-600"
    : "text-electric";

  return (
    <div className="flex items-start gap-3">
      <div
        className={`flex-shrink-0 w-7 h-7 rounded-lg ${bg} flex items-center justify-center font-black ${color} text-sm`}
      >
        {num}
      </div>
      <div>
        <p
          className={`font-bold text-sm mb-1 ${
            isResult ? "text-electric" : "text-navy dark:text-canvas-50"
          }`}
        >
          {title}
        </p>
        <p
          className={`text-xs text-muted-blue leading-relaxed ${
            mono ? "font-mono" : ""
          }`}
        >
          {desc}
        </p>
      </div>
    </div>
  );
}
