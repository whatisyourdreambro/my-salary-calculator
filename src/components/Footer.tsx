// src/components/Footer.tsx

import Link from "next/link";

export default function Footer() {
  const currentYear = new Date().getFullYear();
  const links = [
    { name: "연봉 계산기", href: "/" },
    { name: "연봉 테이블", href: "/table/annual" },
    { name: "금융 가이드", href: "/guides" },
    { name: "용어 사전", href: "/glossary" },
  ];
  const legalLinks = [
    { name: "개인정보처리방침", href: "/privacy" },
    { name: "이용약관", href: "/terms" },
  ];

  return (
    <footer className="w-full mt-24 border-t border-border bg-card text-card-foreground">
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="flex items-center">
              <h1 className="text-2xl font-bold text-primary">Moneysalary</h1>
            </Link>
            <p className="mt-2 text-sm text-muted-foreground">
              당신의 경제적 여정을 돕습니다.
            </p>
          </div>
          <div>
            <h3 className="text-sm font-bold tracking-wider uppercase text-foreground">
              핵심 기능
            </h3>
            <ul className="mt-4 space-y-2">
              {links.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground hover:text-primary transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-bold tracking-wider uppercase text-foreground">기타</h3>
            <ul className="mt-4 space-y-2">
              {legalLinks.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground hover:text-primary transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
        <div className="mt-12 pt-8 border-t border-border text-center text-xs text-muted-foreground">
          <p>© {currentYear} Moneysalary. All Rights Reserved.</p>
          <p className="mt-1">
            본 사이트에서 제공하는 정보는 법적 효력이 없으며, 참고용으로만
            사용하시기 바랍니다.
          </p>
          {/* 환율 데이터 출처 명시 (추가된 부분) */}
          <p className="mt-2">
            실시간 환율 정보는{" "}
            <a
              href="https://www.frankfurter.app"
              target="_blank"
              rel="noopener noreferrer"
              className="underline hover:text-primary"
            >
              Frankfurter API
            </a>
            를 통해 제공됩니다.
          </p>
        </div>
      </div>
    </footer>
  );
}