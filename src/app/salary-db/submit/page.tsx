// src/app/salary-db/submit/page.tsx
//
// 연봉 제보 — 정식 수집 기능은 아직 준비 중.
// 과거에는 입력 폼이 있었지만 제출값이 실제로 저장되지 않으면서
// "검수 후 DB 반영" 안내를 노출하는 문제가 있어, 수집 시스템이 갖춰질
// 때까지 정직한 안내 카드로 대체한다. (메타데이터·noindex 는 layout.tsx 담당)

import Link from "next/link";
import { Construction, Database } from "lucide-react";

export default function SubmitSalaryPage() {
 return (
 <main className="w-full min-h-screen bg-background pb-20">
 <div className="bg-electric text-white py-12 px-4">
 <div className="max-w-3xl mx-auto text-center">
 <h1 className="text-3xl font-black mb-4">내 연봉 제보하기 📣</h1>
 <p className="text-faint-blue">
 더 정확한 연봉 데이터베이스를 만들기 위한 제보 기능을 준비하고 있습니다.
 </p>
 </div>
 </div>

 <div className="max-w-2xl mx-auto px-4 -mt-8">
 <div className="bg-card border border-border rounded-3xl p-6 sm:p-8 shadow-xl text-center">
 <div className="w-20 h-20 bg-primary/5 text-primary rounded-full flex items-center justify-center mx-auto mb-6">
 <Construction className="w-10 h-10" />
 </div>
 <h2 className="text-2xl font-bold mb-3">제보 기능은 준비 중입니다</h2>
 <p className="text-muted-foreground leading-relaxed mb-8">
 지금은 연봉 제보를 접수받고 있지 않습니다.<br />
 익명 제보를 안전하게 수집·검수할 수 있는 시스템을 갖춘 뒤 다시 열겠습니다.<br />
 그동안은 공개 자료 기반으로 정리된 회사별 연봉 데이터를 이용해주세요.
 </p>
 <Link
 href="/salary-db"
 className="inline-flex w-full items-center justify-center gap-2 py-4 rounded-xl bg-primary text-primary-foreground font-bold hover:opacity-90 transition-opacity"
 >
 <Database className="w-5 h-5" />
 회사별 연봉 DB 보러가기
 </Link>
 </div>
 </div>
 </main>
 );
}
