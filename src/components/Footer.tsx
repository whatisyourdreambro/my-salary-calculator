import Link from "next/link";
import { Facebook, Twitter, Instagram, Github } from "lucide-react";

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
  const socialLinks = [
    { icon: <Facebook size={20} />, href: "#" },
    { icon: <Twitter size={20} />, href: "#" },
    { icon: <Instagram size={20} />, href: "#" },
    { icon: <Github size={20} />, href: "#" },
  ];

  return (
    <footer className="w-full mt-32 border-t border-border bg-background">
      <div className="max-w-7xl mx-auto py-16 px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-start gap-12">
          <div className="md:w-1/3">
            <Link href="/" className="flex items-center">
              <h1 className="text-2xl font-bold text-primary">Moneysalary</h1>
            </Link>
            <p className="mt-4 text-base text-foreground/60">
              당신의 경제적 여정을 돕는 든든한 파트너.
            </p>
            <div className="flex space-x-4 mt-6">
              {socialLinks.map((link, index) => (
                <a
                  key={index}
                  href={link.href}
                  className="text-foreground/60 hover:text-primary transition-colors"
                >
                  {link.icon}
                </a>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-8 md:w-2/3">
            <div>
              <h3 className="text-base font-semibold tracking-wider uppercase text-foreground/80">
                핵심 기능
              </h3>
              <ul className="mt-4 space-y-3">
                {links.map((link) => (
                  <li key={link.name}>
                    <Link
                      href={link.href}
                      className="text-base text-foreground/60 hover:text-primary transition-colors"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="text-base font-semibold tracking-wider uppercase text-foreground/80">
                기타
              </h3>
              <ul className="mt-4 space-y-3">
                {legalLinks.map((link) => (
                  <li key={link.name}>
                    <Link
                      href={link.href}
                      className="text-base text-foreground/60 hover:text-primary transition-colors"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
        <div className="mt-16 pt-8 border-t border-border text-center text-sm text-foreground/50">
          <p>© {currentYear} Moneysalary. All Rights Reserved.</p>
          <p className="mt-2">
            본 사이트에서 제공하는 정보는 법적 효력이 없으며, 참고용으로만
            사용하시기 바랍니다.
          </p>
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
