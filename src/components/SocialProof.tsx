import Link from "@/components/AppLink";
import { BookOpen, SlidersHorizontal, FileCheck2 } from "lucide-react";
const PRINCIPLES = [
  { Icon: SlidersHorizontal, title: "조건을 먼저 확인합니다", description: "연봉에 포함된 수당과 비과세액, 부양가족 조건을 구분해 입력하세요." },
  { Icon: FileCheck2, title: "예상액과 실제 급여를 구분합니다", description: "보험료 산정과 회사의 원천징수 방식에 따라 급여명세서와 차이가 날 수 있습니다." },
  { Icon: BookOpen, title: "계산 기준을 함께 읽습니다", description: "공식 자료를 참고한 계산과 자체 추정 정보를 각 페이지에서 확인하세요." },
];
export default function SocialProof() {
  return <section className="border-y border-border bg-card" aria-labelledby="home-method-heading">
    <div className="page-width py-8 sm:py-10">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-2"><h2 id="home-method-heading" className="text-sm font-semibold text-foreground">결과를 읽는 세 가지 기준</h2><Link href="/about" className="inline-flex min-h-11 items-center text-sm font-semibold text-link underline underline-offset-4">계산·데이터 운영 원칙</Link></div>
      <div className="grid gap-6 md:grid-cols-3 md:gap-8">{PRINCIPLES.map(({ Icon, title, description }) => <div key={title} className="flex items-start gap-3"><Icon className="mt-0.5 h-5 w-5 shrink-0 text-link" aria-hidden="true" /><div><h3 className="text-sm font-semibold text-foreground">{title}</h3><p className="mt-2 text-sm leading-6 text-muted-foreground">{description}</p></div></div>)}</div>
    </div>
  </section>;
}
