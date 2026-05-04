// src/components/Footer.tsx
"use client";

import Link from "next/link";
import { Facebook, Twitter, Instagram, Github } from "lucide-react";
import Logo from "./Logo";

export default function Footer() {
 const currentYear = new Date().getFullYear();

 const links = [
 { name: "연봉 계산기", href: "/" },
 { name: "연봉 테이블", href: "/table/2026/annual" },
 { name: "금융 가이드", href: "/guides" },
 { name: "용어 사전", href: "/glossary" },
 { name: "사이트 소개", href: "/about" },
 ];
 const legalLinks = [
 { name: "개인정보처리방침", href: "/privacy" },
 { name: "이용약관", href: "/terms" },
 { name: "About", href: "/about" },
 ];
 const socialLinks = [
 { Icon: Facebook, href: "#", label: "Facebook" },
 { Icon: Twitter, href: "#", label: "Twitter" },
 { Icon: Instagram, href: "#", label: "Instagram" },
 { Icon: Github, href: "#", label: "Github" },
 ];

 return (
 <footer className="w-full mt-24 bg-white text-muted-blue border-t-[1.5px] border-canvas-200">
 <div className="max-w-7xl mx-auto px-6 pt-20 pb-14">
 <div className="flex flex-row flex-wrap justify-between items-start gap-12">
 {/* Brand */}
 <div className="min-w-[220px] max-w-[280px]">
 <Link href="/" className="inline-block mb-5">
 <Logo className="h-8 w-auto" showText={true} />
 </Link>
 <p className="text-[14.5px] text-muted-blue leading-[1.7] font-medium">
 우아한 금융 생활의 시작, 머니샐러리.
 <br />
 당신의 가치를 높이는 가장 정확한 기준을 제시합니다.
 </p>

 {/* Social Icons */}
 <div className="flex gap-2 mt-5">
 {socialLinks.map(({ Icon, href, label }) => (
 <a
 key={label}
 href={href}
 aria-label={label}
 className="footer-social-icon w-[38px] h-[38px] flex items-center justify-center rounded-full border-[1.5px] border-canvas-200 text-faint-blue bg-canvas no-underline transition-all"
 >
 <Icon size={17} />
 </a>
 ))}
 </div>
 </div>

 {/* Links */}
 <div
 className="flex-1 max-w-[480px]"
 style={{
 display: "grid",
 gridTemplateColumns: "repeat(2, minmax(120px, 1fr))",
 gap: "2.5rem",
 }}
 >
 <div>
 <h3 className="text-[11px] font-extrabold text-electric uppercase tracking-[0.1em] mb-5">
 서비스
 </h3>
 <ul className="list-none p-0 m-0 flex flex-col gap-3">
 {links.map((link) => (
 <li key={link.name}>
 <Link
 href={link.href}
 className="footer-link text-[14.5px] font-medium text-muted-blue no-underline transition-colors hover:text-electric"
 >
 {link.name}
 </Link>
 </li>
 ))}
 </ul>
 </div>

 <div>
 <h3 className="text-[11px] font-extrabold text-electric uppercase tracking-[0.1em] mb-5">
 고객 지원
 </h3>
 <ul className="list-none p-0 m-0 flex flex-col gap-3">
 {legalLinks.map((link) => (
 <li key={link.name}>
 <Link
 href={link.href}
 className="footer-link text-[14.5px] font-medium text-muted-blue no-underline transition-colors hover:text-electric"
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
 <div className="mt-16 pt-6 border-t border-canvas-200 flex flex-wrap justify-between items-center gap-4 text-[13px] font-medium text-faint-blue">
 <p>© {currentYear} Moneysalary. All Rights Reserved.</p>
 <p>환율 데이터 제공: FKF API</p>
 </div>
 </div>
 </footer>
 );
}
