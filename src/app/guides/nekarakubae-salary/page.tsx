import type { Metadata } from "next";
import NekarakubaeSalaryClientPage from "./NekarakubaeSalaryClientPage";

export const metadata: Metadata = {
  title: "네카라쿠배 개발자 초봉 1억, 그 진실은? (2025년 최종판)",
  description:
    "꿈의 직장 '네카라쿠배' 신입 개발자, 정말 1억을 받을까? 계약 연봉 6500, 사이닝 보너스, 스톡옵션을 포함한 '영끌 초봉'의 실체와 세후 실수령액을 완벽하게 분석합니다.",
  openGraph: {
    title: "네카라쿠배 개발자 초봉 1억, 그 진실은?",
    description:
      "계약 연봉, 사이닝 보너스, 스톡옵션을 모두 포함한 '영끌 초봉'의 실체를 파헤칩니다.",
    images: [
      "/api/og?title=네카라쿠배 신입 초봉 1억의 진실&description=2025년 기준 계약연봉, 보너스, 스톡옵션 총정리",
    ],
  },
};

export default function NekarakubaeSalaryPage() {
  return <NekarakubaeSalaryClientPage />;
}