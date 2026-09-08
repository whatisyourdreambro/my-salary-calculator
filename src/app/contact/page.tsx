import type { Metadata } from "next";
import { Suspense } from "react";
import Link from "@/components/AppLink";
import { buildPageMetadata } from "@/lib/seo";
import ContactForm from "./ContactForm";

export const metadata: Metadata = {
  ...buildPageMetadata({
    title: "비공개 문의·오류 신고 — 머니샐러리",
    description: "계산 오류, 정보 정정, 개인정보 요청과 서비스 제안을 운영자에게 비공개로 보내세요. 회원가입 없이 접수할 수 있습니다.",
    path: "/contact",
  }),
  robots: { index: false, follow: true },
};

export default function ContactPage() {
  return (
    <main className="min-h-screen bg-canvas pb-20 pt-28">
      <div className="mx-auto max-w-2xl px-4 sm:px-6">
        <p className="mb-3 text-sm font-bold text-electric">운영자에게 보내는 비공개 문의</p>
        <h1 className="text-3xl font-black tracking-tight text-navy sm:text-4xl">어떤 점을 고치면 좋을까요?</h1>
        <p className="mt-4 text-sm leading-7 text-muted-blue">
          계산 오류, 설명이 어려운 부분, 정보 정정과 서비스 제안을 보내주세요.
          접수 내용은 운영자가 확인하며 사이트에 공개되지 않습니다.
        </p>
        <div className="mt-5 rounded-xl border border-canvas-200 bg-white p-4 text-sm leading-6 text-muted-blue">
          간단한 이용 방법은 <Link href="/qna" className="font-bold text-electric underline underline-offset-4">자주 묻는 질문</Link>에서 먼저 확인할 수 있습니다.
          개인별 세무 상담이나 실제 급여 명세서 검토는 제공하지 않습니다.
        </div>
        <Suspense fallback={<p className="mt-8" role="status">문의 양식을 준비하고 있습니다.</p>}>
          <ContactForm />
        </Suspense>
      </div>
    </main>
  );
}
