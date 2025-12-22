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
    <footer className="w-full mt-32 border-t border-white/10 bg-zinc-950 relative overflow-hidden">
      {/* Background Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-px bg-gradient-to-r from-transparent via-emerald-500/50 to-transparent" />
      <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[600px] h-[200px] bg-emerald-500/10 blur-[100px] rounded-full pointer-events-none" />

      <div className="max-w-7xl mx-auto py-16 px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="flex flex-col md:flex-row justify-between items-start gap-12">
          <div className="md:w-1/3">
            <Link href="/" className="flex items-center gap-2 group">
              <div className="w-8 h-8 bg-emerald-500/10 rounded-lg flex items-center justify-center group-hover:rotate-12 transition-transform border border-emerald-500/20">
                <span className="text-xl font-bold text-emerald-500">M</span>
              </div>
              <h1 className="text-2xl font-bold text-white group-hover:text-emerald-400 transition-colors">Moneysalary</h1>
            </Link>
            <p className="mt-4 text-base text-zinc-400 leading-relaxed">
              당신의 경제적 여정을 돕는 든든한 파트너.
              <br />
              정확한 계산과 스마트한 인사이트를 제공합니다.
            </p>
            <div className="flex space-x-4 mt-6">
              {socialLinks.map((link, index) => (
                <a
                  key={index}
                  href={link.href}
                  className="w-10 h-10 flex items-center justify-center rounded-full bg-white/5 border border-white/10 hover:bg-emerald-500 hover:text-white hover:border-emerald-500 transition-all duration-300 hover:scale-110"
                >
                  {link.icon}
                </a>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-8 md:w-2/3">
            <div>
              <h3 className="text-sm font-bold tracking-wider uppercase text-emerald-500 mb-6">
                핵심 기능
              </h3>
              <ul className="space-y-4">
                {links.map((link) => (
                  <li key={link.name}>
                    <Link
                      href={link.href}
                      className="text-base text-zinc-400 hover:text-white hover:translate-x-1 transition-all inline-block"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="text-sm font-bold tracking-wider uppercase text-emerald-500 mb-6">
                기타
              </h3>
              <ul className="space-y-4">
                {legalLinks.map((link) => (
                  <li key={link.name}>
                    <Link
                      href={link.href}
                      className="text-base text-zinc-400 hover:text-white hover:translate-x-1 transition-all inline-block"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
        <div className="mt-16 pt-8 border-t border-white/10 text-center text-sm text-zinc-500">
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
              className="underline hover:text-emerald-400 decoration-emerald-500/30 underline-offset-4"
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
