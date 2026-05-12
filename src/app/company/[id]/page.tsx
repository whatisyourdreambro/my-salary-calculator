// src/app/company/[id]/page.tsx
//
// 카니발 해결 — 동일 회사 정보가 /salary-db/[id]에서 더 풍부하게 노출됨
// (CompanyInsights·CompanySalaryTable·RelatedCompanies·FAQ 포함).
// 이 URL은 308 Permanent Redirect로 SEO 권위를 /salary-db/[id]로 단일화.
//
// 기존 내부 링크(/company/{id})는 자동 이동되므로 일괄 정리할 필요 없음.

import { redirect } from "next/navigation";

export const runtime = "edge";

interface PageProps {
 params: { id: string };
}

export default function CompanyIdRedirect({ params }: PageProps) {
 redirect(`/salary-db/${params.id}`);
}
