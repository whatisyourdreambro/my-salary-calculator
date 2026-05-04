import { Metadata } from "next";
import { companyRepository } from "@/lib/salary-data/CompanyRepository";
import { notFound } from "next/navigation";
import CompanyDetailClient from "./CompanyDetailClient";
import JsonLd from "@/components/JsonLd";
import { buildCompanyMetadata } from "@/lib/seo";
import {
 breadcrumbLd,
 companyOrganizationLd,
 faqLd,
} from "@/lib/structuredData";

export const dynamic = "force-static";

export async function generateStaticParams() {
 const companies = companyRepository.getAll();
 return companies.map((company) => ({
 id: company.id,
 }));
}

export async function generateMetadata({
 params,
}: {
 params: { id: string };
}): Promise<Metadata> {
 const company = companyRepository.getById(params.id);
 if (!company) return { title: "Company Not Found" };

 const entryTotal =
 company.salary.entry.base + (company.salary.entry.incentive.avgAmount || 0);

 return buildCompanyMetadata({
 id: company.id,
 name: company.name.ko,
 industry: company.industry,
 averageSalary: entryTotal,
 });
}

function buildCompanyFaq(company: ReturnType<typeof companyRepository.getById>) {
 if (!company) return [];
 const koName = company.name.ko;
 const entryTotal =
 company.salary.entry.base + (company.salary.entry.incentive.avgAmount || 0);
 const entryManwon = Math.round(entryTotal / 10000).toLocaleString("ko-KR");

 return [
 {
 question: `${koName} 평균 연봉은 얼마인가요?`,
 answer: `${koName}의 신입 영끌 평균 연봉은 약 ${entryManwon}만원입니다 (기본급 + 평균 인센티브 포함). 직급·연차에 따라 변동되며, 동일 업종 평균 대비 위치는 회사 페이지에서 확인 가능합니다.`,
 },
 {
 question: `${koName} 워라밸은 어떤가요?`,
 answer: `${koName}의 평균 주당 근무시간은 약 ${company.workLife.weeklyHours.real}시간입니다. 표준 주 40시간 대비 차이를 보고 워라밸 수준을 판단할 수 있습니다.`,
 },
 {
 question: `${koName} 신입 초봉으로 받을 수 있는 대출 한도는?`,
 answer: `신입 영끌 ${entryManwon}만원 기준 DSR 40% 적용 시 연 약 ${Math.round(entryTotal * 0.4 / 10000).toLocaleString("ko-KR")}만원의 원리금 상환 여력이 있습니다. 대출 한도는 머니샐러리 주택담보대출 계산기에서 시뮬레이션 가능합니다.`,
 },
 ];
}

export default function CompanyDetailPage({
 params,
}: {
 params: { id: string };
}) {
 const company = companyRepository.getById(params.id);
 if (!company) notFound();

 const faqItems = buildCompanyFaq(company);

 return (
 <>
 <JsonLd
 data={[
 breadcrumbLd([
 { name: "홈", path: "/" },
 { name: "회사별 연봉", path: "/salary-db" },
 { name: company.name.ko, path: `/salary-db/${company.id}` },
 ]),
 companyOrganizationLd({
 name: company.name.ko,
 industry: company.industry,
 description: `${company.name.ko} 평균 연봉, 워라밸, 복지 정보`,
 }),
 faqLd(faqItems),
 ]}
 />
 <CompanyDetailClient company={company} />
 </>
 );
}
