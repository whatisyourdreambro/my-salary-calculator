import Link from "next/link";
import { Facebook, Twitter, Instagram, Github } from "lucide-react";
import Logo from "./Logo";

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
    { icon: <Facebook size={18} />, href: "#" },
    { icon: <Twitter size={18} />, href: "#" },
    { icon: <Instagram size={18} />, href: "#" },
    { icon: <Github size={18} />, href: "#" },
  ];

  return (
    <footer className="w-full mt-32 bg-[#1C1917] text-stone-400 relative overflow-hidden border-t border-stone-800">
      {/* Decorative Top Border */}
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-accent/30 to-transparent" />

      <div className="max-w-7xl mx-auto py-20 px-6 sm:px-8 relative z-10">
        <div className="flex flex-col md:flex-row justify-between items-start gap-16">

          {/* Brand Section */}
          <div className="md:w-1/3 space-y-6">
            <Link href="/" className="inline-block group">
              <Logo className="h-8 w-auto text-stone-200" showText={true} />
            </Link>
            <p className="text-base text-stone-500 leading-relaxed font-sans max-w-sm">
              우아한 금융 생활의 시작, 머니샐러리.<br />
              <span className="text-stone-400">당신의 가치를 높이는 가장 정확한 기준을 제시합니다.</span>
            </p>
            <div className="flex space-x-3 pt-2">
              {socialLinks.map((link, index) => (
                <a
                  key={index}
                  href={link.href}
                  className="w-10 h-10 flex items-center justify-center rounded-full bg-stone-800/50 border border-stone-700 hover:bg-accent hover:text-white hover:border-accent transition-all duration-300"
                >
                  {link.icon}
                </a>
              ))}
            </div>
          </div>

          {/* Links Section */}
          <div className="grid grid-cols-2 gap-12 md:w-2/3 md:pl-12">
            <div>
              <h3 className="text-sm font-serif font-bold tracking-widest uppercase text-accent mb-8">
                Services
              </h3>
              <ul className="space-y-4">
                {links.map((link) => (
                  <li key={link.name}>
                    <Link
                      href={link.href}
                      className="text-base text-stone-400 hover:text-stone-100 hover:translate-x-1 transition-all duration-300 inline-block font-sans"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="text-sm font-serif font-bold tracking-widest uppercase text-accent mb-8">
                Legal & Support
              </h3>
              <ul className="space-y-4">
                {legalLinks.map((link) => (
                  <li key={link.name}>
                    <Link
                      href={link.href}
                      className="text-base text-stone-400 hover:text-stone-100 hover:translate-x-1 transition-all duration-300 inline-block font-sans"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-20 pt-8 border-t border-stone-800 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-stone-600 font-sans">
          <p>© {currentYear} Moneysalary. All Rights Reserved.</p>
          <div className="flex items-center gap-6">
            <p className="hidden md:block">
              Exchange rates via FKF API
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
