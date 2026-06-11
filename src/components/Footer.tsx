// src/components/Footer.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { CheckCircle2, Shield, Lock } from "lucide-react";
import Logo from "./Logo";

export default function Footer() {
  const currentYear = new Date().getFullYear();
  const pathname = usePathname();
  const isEnglish = pathname?.startsWith("/en") ?? false;

  const calculatorLinks = isEnglish
    ? [
        { name: "Salary Converter", href: "/en/salary-converter" },
        { name: "Flat Tax 19% (Expats)", href: "/en/flat-tax" },
        { name: "All Calculators (KR)", href: "/calc" },
        { name: "FIRE Calculator (KR)", href: "/fire-calculator" },
      ]
    : [
        { name: "연봉 계산기", href: "/" },
        { name: "연봉 테이블", href: "/table/2026/annual" },
        { name: "100가지 계산기", href: "/calc" },
        { name: "FIRE 계산기", href: "/fire-calculator" },
        { name: "주택담보대출", href: "/home-loan" },
      ];

  const seasonLinks = isEnglish
    ? [
        { name: "Samsung 2026 Outlook", href: "/en/guides/samsung-electronics-stock-2026" },
        { name: "SK Hynix Stock Analysis", href: "/en/guides/sk-hynix-stock-2026" },
        { name: "Semiconductor Cycle 2026", href: "/en/guides/semiconductor-cycle-2026" },
        { name: "Samsung vs SK Hynix", href: "/en/guides/samsung-vs-hynix-employee-comparison" },
        { name: "Chip Stock Tax Guide", href: "/en/guides/chip-stock-tax-guide" },
      ]
    : [
        { name: "연말정산 2026", href: "/year-end-tax-2026" },
        { name: "신입 초봉 TOP 50", href: "/new-employee-salary-2026" },
        { name: "13월의 월급", href: "/calc/january-bonus" },
        { name: "성과급 세금", href: "/calc/year-end-bonus" },
        { name: "건강보험 2026", href: "/health-insurance-2026" },
      ];

  const contentLinks = isEnglish
    ? [
        { name: "All English Guides", href: "/en/guides" },
        { name: "Samsung Employee ESOP", href: "/en/guides/samsung-employee-rsu-stock" },
        { name: "SK Hynix PS / PI", href: "/en/guides/sk-hynix-employee-bonus-stock" },
        { name: "DCA vs Lump-Sum", href: "/en/guides/kospi-leader-stock-strategy" },
        { name: "Korean Site →", href: "/" },
      ]
    : [
        { name: "주제별 가이드", href: "/hub" },
        { name: "금융 가이드", href: "/guides" },
        { name: "용어 사전", href: "/glossary" },
        { name: "회사 연봉 DB", href: "/salary-db" },
        { name: "Q&A", href: "/qna" },
        { name: "절세 팁", href: "/tips" },
      ];

  const legalLinks = isEnglish
    ? [
        { name: "About", href: "/about" },
        { name: "Privacy Policy", href: "/privacy" },
        { name: "Terms of Service", href: "/terms" },
      ]
    : [
        { name: "사이트 소개", href: "/about" },
        { name: "개인정보처리방침", href: "/privacy" },
        { name: "이용약관", href: "/terms" },
      ];

  // GSC TOP 검색 키워드 보유 회사 — 검색 권위 전역 분산, Sitelinks 노출 유도
  const popularCompanyLinks = [
    { name: "삼성전자 연봉", href: "/salary-db/samsung-electronics" },
    { name: "SK하이닉스 연봉", href: "/salary-db/sk-hynix" },
    { name: "HMM 연봉", href: "/salary-db/hmm" },
    { name: "SK AX 연봉", href: "/salary-db/sk-cc" },
    { name: "HD현대중공업 연봉", href: "/salary-db/hd-hyundai-heavy" },
    { name: "LG에너지솔루션 연봉", href: "/salary-db/lgensol" },
    { name: "DL이앤씨 연봉", href: "/salary-db/dl-enc" },
    { name: "전체 회사 480곳 →", href: "/salary-db" },
  ];

  const trustBadges = isEnglish
    ? [
        { Icon: CheckCircle2, label: "Official Tax Rates" },
        { Icon: Shield, label: "Trusted Ad Standards" },
        { Icon: Lock, label: "Zero Data Collection" },
      ]
    : [
        { Icon: CheckCircle2, label: "국세청 공식 세율" },
        { Icon: Shield, label: "신뢰할 수 있는 광고 게재 기준 준수" },
        { Icon: Lock, label: "개인정보 0건 수집" },
      ];

  const sections: { title: string; items: typeof calculatorLinks }[] = isEnglish
    ? [
        { title: "Calculators", items: calculatorLinks },
        { title: "Stocks", items: seasonLinks },
        { title: "Guides", items: contentLinks },
        { title: "Legal", items: legalLinks },
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
          Salary intelligence for working in Korea.
          <br />
          Net pay, stocks, taxes — all in one place.
        </>
      )
    : (
        <>
          우아한 금융 생활의 시작, 머니샐러리.
          <br />
          당신의 가치를 높이는 가장 정확한 기준을 제시합니다.
        </>
      );

  const brandAriaLabel = isEnglish ? "Moneysalary home" : "머니샐러리 홈";
  const brandHomeHref = isEnglish ? "/en" : "/";
  const disclaimer = isEnglish
    ? "Calculations are for reference only and may differ from actual figures."
    : "본 사이트의 계산 결과는 참고용이며, 실제 세액과 차이가 있을 수 있습니다.";

  return (
    <footer className="w-full mt-24 bg-white dark:bg-canvas-950 text-muted-blue dark:text-canvas-300 border-t-[1.5px] border-canvas-200 dark:border-canvas-800">
      <div className="page-width pt-20 pb-14">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12">
          {/* Brand */}
          <div className="lg:col-span-4">
            <Link href={brandHomeHref} className="inline-block mb-5" aria-label={brandAriaLabel}>
              <Logo className="h-8 w-auto" showText={true} />
            </Link>
            <p className="text-[14.5px] leading-[1.7] font-medium">
              {brandTagline}
            </p>

            {/* Trust badges — 실제 인증 항목만 표시 */}
            <div className="flex flex-wrap gap-2 mt-5">
              {trustBadges.map(({ Icon, label }) => (
                <span
                  key={label}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-full bg-electric-5 border border-electric/20 text-[11.5px] font-bold text-electric"
                >
                  <Icon size={12} />
                  {label}
                </span>
              ))}
            </div>
          </div>

          {/* Links — 모바일: 아코디언(<details>) / 데스크톱: 풀 그리드 */}
          <div
            className={`lg:col-span-8 grid grid-cols-1 sm:grid-cols-2 ${
              isEnglish ? "lg:grid-cols-4" : "lg:grid-cols-5"
            } gap-2 sm:gap-8`}
          >
            {sections.map((section, idx) => (
              <details
                key={section.title}
                className="group footer-accordion"
                open={idx < 2}
              >
                <summary className="cursor-pointer list-none flex items-center justify-between text-[11px] font-extrabold text-electric uppercase tracking-[0.1em] py-3 sm:py-0 sm:mb-5 sm:cursor-default border-b border-canvas-200 dark:border-canvas-800 sm:border-0">
                  {section.title}
                  <span className="sm:hidden text-base text-electric group-open:rotate-180 transition-transform" aria-hidden>
                    ▾
                  </span>
                </summary>
                <ul className="list-none p-0 m-0 flex flex-col gap-3 pt-3 sm:pt-0 pb-3 sm:pb-0">
                  {section.items.map((link) => (
                    <li key={link.name}>
                      <Link
                        href={link.href}
                        className="footer-link text-[14.5px] font-medium text-muted-blue dark:text-canvas-300 no-underline transition-colors hover:text-electric inline-block min-h-[24px]"
                      >
                        {link.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </details>
            ))}
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-16 pt-6 border-t border-canvas-200 dark:border-canvas-800 flex flex-wrap justify-between items-center gap-4 text-[13px] font-medium text-faint-blue">
          <p>© {currentYear} Moneysalary. All Rights Reserved.</p>
          <p>{disclaimer}</p>
        </div>
      </div>
    </footer>
  );
}
