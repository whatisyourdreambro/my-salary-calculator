// src/components/Footer.tsx
"use client";

import Link from "@/components/AppLink";
import { usePathname } from "next/navigation";
import { CheckCircle2, Shield, Lock } from "lucide-react";
import Logo from "./Logo";
import { footerSeasonLinks } from "@/config/seasonLinks";
import { popularCompanies } from "@/config/popularCompanies";
import { EN_SECTIONS } from "@/lib/englishSite";

export default function Footer() {
  const currentYear = new Date().getFullYear();
  const pathname = usePathname();
  const isEnglish = pathname === "/en" || pathname?.startsWith("/en/") === true;

  const calculatorLinks = isEnglish
    ? [
        { name: "Korea Take-home Salary", href: "/en#calculator" },
        { name: "Gross Salary Converter", href: "/en/salary-converter" },
        { name: "Income Tax Comparison", href: "/en/flat-tax" },
        { name: "All Calculators", href: "/en/calculators" },
        { name: "Bonus Planner", href: "/en/tools/bonus" },
        { name: "Offer Comparison", href: "/en/tools/offer-compare" },
        { name: "FIRE Calculator", href: "/en/tools/fire" },
      ]
    : [
        { name: "연봉 계산기", href: "/" },
        { name: "연봉 테이블", href: "/table/2026/annual" },
        // 월급 축 신설(2026-08-15) — /monthly/* 트리의 전역 SSR 크롤 진입로
        { name: "월급 300만원 실수령액", href: "/monthly/3000000" },
        { name: "계산기 전체", href: "/calc" },
        { name: "FIRE 계산기", href: "/fire-calculator" },
        { name: "주택담보대출", href: "/home-loan" },
        { name: "기초연금 계산기", href: "/basic-pension-2026" },
        // 고수익 시즌 진입로 — 연말정산(10~2월)·성과급 세금(12~1월) 전역 크롤 경로 (전면 최적화, 운영자 지시 2026-09-02)
        { name: "연말정산 계산기", href: "/year-end-tax" },
        { name: "성과급 세금 계산기", href: "/tools/finance/bonus" },
      ];

  // KR 시즌 링크는 src/config/seasonLinks 단일 소스에서 파생 — 헤더 시즌 드롭다운과 공유
  const seasonLinks = isEnglish
    ? [
        { name: "Seasonal Checklist", href: "/en/season" },
        { name: "Bonus Planning", href: "/en/bonus" },
        { name: "Year-end Tax Deductions", href: "/en/guides/year-end-tax-deductions-guide" },
        { name: "Health Insurance in 2026", href: "/en/guides/health-insurance-2026-guide" },
      ]
    : footerSeasonLinks;

  const contentLinks = isEnglish
    ? [
        ...EN_SECTIONS.map(section => ({ name: section.title, href: section.href })),
        { name: "Methods, Sources & Help", href: "/en/help" },
      ]
    : [
        { name: "내 돈 체크 · 상황별 금융 체크리스트", href: "/money-check" },
        { name: "주제별 가이드", href: "/hub" },
        { name: "금융 가이드", href: "/guides" },
        { name: "용어 사전", href: "/glossary" },
        { name: "회사 연봉 DB", href: "/salary-db" },
        // 직업·업종·지역 허브 인덱스 — 헤더 메가메뉴가 조건부 렌더라 SSR HTML에 없어
        // 푸터가 유일한 전역 크롤 진입로 (준고아 해소, 2026-08-07)
        { name: "직업별 연봉", href: "/job" },
        { name: "업종별 연봉", href: "/industry" },
        { name: "지역별 연봉", href: "/region" },
        { name: "대기업 연봉 순위 TOP 30", href: "/salary-db/ranking" },
        // 데이터 리포트 섹션 전역 진입로 — 내부링크 준고아 해소 (2026-08-17 감사)
        { name: "데이터 리포트", href: "/insights" },
        // 임베드 위젯 전역 진입로 — 인바운드 0건이던 백링크 생산 페이지 (G1, 2026-08-23)
        { name: "내 블로그에 연봉 계산기 달기", href: "/embed" },
        { name: "Q&A", href: "/qna" },
        { name: "절세 팁", href: "/tips" },
        // RSS 가시화 — 피드 리더 재방문·자연 백링크 (XML 라우트라 prefetch 금지 → external)
        { name: "RSS · 새 가이드 구독", href: "/rss.xml", external: true },
        { name: "RSS · 회사 연봉 소식", href: "/rss-companies.xml", external: true },
      ];

  const legalLinks = isEnglish
    ? [
        { name: "About Moneysalary", href: "/en/about" },
        { name: "Private Contact", href: "/en/contact" },
        { name: "Privacy Policy", href: "/en/privacy" },
        { name: "Terms of Use", href: "/en/terms" },
        { name: "Saved Results & Pages", href: "/en/dashboard" },
        { name: "Switch to Korean →", href: "/" },
      ]
    : [
        { name: "사이트 소개", href: "/about" },
        { name: "비공개 문의·오류 신고", href: "/contact" },
        { name: "개인정보처리방침", href: "/privacy" },
        { name: "이용약관", href: "/terms" },
        // /en 트리 SSR 크롤 경로 — 한국어 페이지에서 영문 트리로 가는 유일한 전역 링크
        { name: "English (Expats) →", href: "/en" },
      ];

  // 인기 회사 링크는 src/config/popularCompanies 단일 소스에서 파생
  const popularCompanyLinks = isEnglish ? [
    { name: "Company Pay Research", href: "/en/salary-db" },
    { name: "Samsung Employee Pay", href: "/en/guides/samsung-employee-rsu-stock" },
    { name: "SK Hynix Employee Pay", href: "/en/guides/sk-hynix-employee-bonus-stock" },
    { name: "Samsung vs SK Hynix", href: "/en/guides/samsung-vs-hynix-employee-comparison" },
  ] : popularCompanies;

  const trustBadges = isEnglish
    ? [
        { Icon: CheckCircle2, label: "Methods explained" },
        { Icon: Shield, label: "Sources and limitations" },
        { Icon: Lock, label: "No sign-up required" },
      ]
    : [
        { Icon: CheckCircle2, label: "계산 기준 안내" },
        { Icon: Shield, label: "출처와 한계 확인" },
        { Icon: Lock, label: "회원가입 없이 계산" },
      ];

  const sections: { title: string; items: typeof calculatorLinks }[] = isEnglish
    ? [
        { title: "Calculators", items: calculatorLinks },
        { title: "Seasonal", items: seasonLinks },
        { title: "Explore", items: contentLinks },
        { title: "Company Pay", items: popularCompanyLinks },
        { title: "Information", items: legalLinks },
      ]
    : [
        { title: "계산기", items: calculatorLinks },
        { title: "시즌 페이지", items: seasonLinks },
        { title: "콘텐츠", items: contentLinks },
        { title: "인기 회사 연봉", items: popularCompanyLinks },
        { title: "정보", items: legalLinks },
      ];

  const brandTagline = isEnglish
    ? (
        <>
          Understand your pay. Plan your next step.
          <br />
          Financial tools and guides with stated assumptions.
        </>
      )
    : (
        <>
          급여를 이해하고, 다음 선택을 준비하세요.
          <br />
          계산 조건과 출처를 함께 읽는 금융 도구와 가이드.
        </>
      );

  const brandAriaLabel = isEnglish ? "Money Salary home" : "Money Salary — 머니샐러리 홈";
  const brandHomeHref = isEnglish ? "/en" : "/";
  const disclaimer = isEnglish
    ? "Calculations are for reference only and may differ from actual figures."
    : "본 사이트의 계산 결과는 참고용이며, 실제 세액과 차이가 있을 수 있습니다.";

  const renderLinks = (items: typeof calculatorLinks) => <ul className="m-0 flex list-none flex-col gap-0.5 p-0 pt-2 sm:pt-0">
    {items.map(link => <li key={link.name}>
      {"external" in link && link.external ? <a href={link.href} title={isEnglish ? "Add this address to an RSS reader" : "RSS 리더에 이 주소를 등록하세요"} className="footer-link ms-interactive hover:!translate-y-0 hover:!shadow-none inline-flex min-h-11 items-center rounded-md py-2 text-sm leading-6 text-muted-foreground hover:text-link">{link.name}</a>
        : <Link href={link.href} className="footer-link ms-interactive hover:!translate-y-0 hover:!shadow-none inline-flex min-h-11 items-center rounded-md py-2 text-sm leading-6 text-muted-foreground hover:text-link">{link.name}</Link>}
    </li>)}
  </ul>;

  return (
    <footer lang={isEnglish ? "en" : "ko"} className="mt-16 w-full border-t border-border bg-card text-foreground">
      <div className="page-width pb-8 pt-10 sm:pt-14">
        <div className="flex flex-col items-start justify-between gap-6 border-b border-border pb-8 lg:flex-row lg:gap-12">
          <div className="max-w-md">
            <Link href={brandHomeHref} className="ms-interactive hover:!translate-y-0 hover:!shadow-none inline-flex min-h-11 items-center rounded-lg" aria-label={brandAriaLabel}><Logo className="h-8 w-auto" showText={true} /></Link>
            <p className="mt-3 text-sm leading-6 text-muted-foreground">{brandTagline}</p>
          </div>
          <div className="flex max-w-xl flex-wrap gap-x-6 gap-y-3 lg:pt-3">
            {trustBadges.map(({ Icon, label }) => <span key={label} className="inline-flex items-center gap-2 text-xs font-medium text-muted-foreground"><Icon size={15} className="text-link" aria-hidden="true" />{label}</span>)}
          </div>
        </div>
        <nav aria-label={isEnglish ? "Footer" : "하단 메뉴"} className="grid grid-cols-1 gap-2 pt-6 sm:grid-cols-2 sm:gap-8 lg:grid-cols-5">
          {sections.map((section, idx) => <div key={section.title} className="min-w-0">
            {/* Native closed details cannot reliably be expanded with a descendant display rule. */}
            <details className="group footer-accordion sm:hidden" open={idx < 2}>
              <summary className="ms-interactive hover:!translate-y-0 hover:!shadow-none flex min-h-11 cursor-pointer list-none items-center justify-between border-b border-border py-3 text-sm font-semibold text-foreground">
                {section.title}<span className="text-muted-foreground transition-transform group-open:rotate-180 motion-reduce:transition-none" aria-hidden="true">⌄</span>
              </summary>
              {renderLinks(section.items)}
            </details>
            <section className="hidden sm:block" aria-labelledby={`footer-section-${idx}`}>
              <h2 id={`footer-section-${idx}`} className="mb-3 flex min-h-11 items-center text-sm font-semibold text-foreground">{section.title}</h2>
              {renderLinks(section.items)}
            </section>
          </div>)}
        </nav>
        <div className="mt-10 flex flex-col gap-3 border-t border-border pt-6 text-xs leading-6 text-muted-foreground sm:flex-row sm:items-start sm:justify-between">
          <p>© {currentYear} Moneysalary.</p><p className="max-w-xl">{disclaimer}</p>
        </div>
      </div>
    </footer>
  );
}
