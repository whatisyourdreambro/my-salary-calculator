// src/components/Footer.tsx

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
    <footer className="w-full mt-24 bg-slate-50 text-slate-500 relative border-t border-slate-200/60">
      <div className="max-w-7xl mx-auto py-16 px-6 sm:px-8">
        <div className="flex flex-col md:flex-row justify-between items-start gap-12">

          {/* Brand Section */}
          <div className="md:w-1/3 space-y-5">
            <Link href="/" className="inline-block">
              <Logo className="h-8 w-auto text-slate-800" showText={true} />
            </Link>
            <p className="text-[15px] text-slate-500 leading-relaxed font-medium">
              우아한 금융 생활의 시작, 머니샐러리.<br />
              당신의 가치를 높이는 가장 정확한 기준을 제시합니다.
            </p>
            <div className="flex space-x-3 pt-2">
              {socialLinks.map((link, index) => (
                <a
                  key={index}
                  href={link.href}
                  className="w-10 h-10 flex items-center justify-center rounded-full bg-white border border-slate-200 text-slate-400 hover:text-blue-600 hover:border-blue-600 hover:shadow-sm transition-all duration-200"
                >
                  {link.icon}
                </a>
              ))}
            </div>
          </div>

          {/* Links Section */}
          <div className="grid grid-cols-2 gap-10 md:w-2/3 md:pl-12">
            <div>
              <h3 className="text-[14px] font-bold text-slate-800 mb-6">
                서비스
              </h3>
              <ul className="space-y-3.5">
                {links.map((link) => (
                  <li key={link.name}>
                    <Link
                      href={link.href}
                      className="text-[15px] font-medium text-slate-500 hover:text-blue-600 transition-colors inline-block"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="text-[14px] font-bold text-slate-800 mb-6">
                고객 지원
              </h3>
              <ul className="space-y-3.5">
                {legalLinks.map((link) => (
                  <li key={link.name}>
                    <Link
                      href={link.href}
                      className="text-[15px] font-medium text-slate-500 hover:text-blue-600 transition-colors inline-block"
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
        <div className="mt-16 pt-6 border-t border-slate-200/80 flex flex-col md:flex-row justify-between items-center gap-4 text-[14px] font-medium text-slate-400">
          <p>© {currentYear} Moneysalary. All Rights Reserved.</p>
          <div className="flex items-center gap-6">
            <p className="hidden md:block">
              환율 데이터 제공: FKF API
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}