// src/components/Footer.tsx
"use client";

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
    { Icon: Facebook, href: "#", label: "Facebook" },
    { Icon: Twitter, href: "#", label: "Twitter" },
    { Icon: Instagram, href: "#", label: "Instagram" },
    { Icon: Github, href: "#", label: "Github" },
  ];

  return (
    <footer
      style={{
        width: "100%",
        marginTop: "6rem",
        backgroundColor: "#FFFFFF",
        color: "#3D5E78",
        borderTop: "1.5px solid #DDE4EC",
      }}
    >
      <div
        style={{
          maxWidth: "80rem",
          margin: "0 auto",
          padding: "5rem 1.5rem 3.5rem",
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "row",
            flexWrap: "wrap",
            justifyContent: "space-between",
            alignItems: "flex-start",
            gap: "3rem",
          }}
        >
          {/* Brand */}
          <div style={{ minWidth: "220px", maxWidth: "280px" }}>
            <Link href="/" style={{ display: "inline-block", marginBottom: "20px" }}>
              <Logo className="h-8 w-auto" showText={true} />
            </Link>
            <p
              style={{
                fontSize: "14.5px",
                color: "#3D5E78",
                lineHeight: 1.7,
                fontWeight: 500,
              }}
            >
              우아한 금융 생활의 시작, 머니샐러리.
              <br />
              당신의 가치를 높이는 가장 정확한 기준을 제시합니다.
            </p>

            {/* Social Icons */}
            <div style={{ display: "flex", gap: "8px", marginTop: "20px" }}>
              {socialLinks.map(({ Icon, href, label }) => (
                <a
                  key={label}
                  href={href}
                  aria-label={label}
                  className="footer-social-icon"
                  style={{
                    width: "38px",
                    height: "38px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    borderRadius: "999px",
                    border: "1.5px solid #DDE4EC",
                    color: "#7A9AB5",
                    backgroundColor: "#EDF1F5",
                    textDecoration: "none",
                    transition: "all 0.15s ease",
                  }}
                >
                  <Icon size={17} />
                </a>
              ))}
            </div>
          </div>

          {/* Links */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(2, minmax(120px, 1fr))",
              gap: "2.5rem",
              flex: 1,
              maxWidth: "480px",
            }}
          >
            <div>
              <h3
                style={{
                  fontSize: "11px",
                  fontWeight: 800,
                  color: "#0145F2",
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                  marginBottom: "20px",
                }}
              >
                서비스
              </h3>
              <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "12px" }}>
                {links.map((link) => (
                  <li key={link.name}>
                    <Link
                      href={link.href}
                      className="footer-link"
                      style={{
                        fontSize: "14.5px",
                        fontWeight: 500,
                        color: "#3D5E78",
                        textDecoration: "none",
                        transition: "color 0.15s ease",
                      }}
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h3
                style={{
                  fontSize: "11px",
                  fontWeight: 800,
                  color: "#0145F2",
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                  marginBottom: "20px",
                }}
              >
                고객 지원
              </h3>
              <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "12px" }}>
                {legalLinks.map((link) => (
                  <li key={link.name}>
                    <Link
                      href={link.href}
                      className="footer-link"
                      style={{
                        fontSize: "14.5px",
                        fontWeight: 500,
                        color: "#3D5E78",
                        textDecoration: "none",
                        transition: "color 0.15s ease",
                      }}
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
        <div
          style={{
            marginTop: "4rem",
            paddingTop: "1.5rem",
            borderTop: "1px solid #DDE4EC",
            display: "flex",
            flexWrap: "wrap",
            justifyContent: "space-between",
            alignItems: "center",
            gap: "1rem",
            fontSize: "13px",
            fontWeight: 500,
            color: "#7A9AB5",
          }}
        >
          <p>© {currentYear} Moneysalary. All Rights Reserved.</p>
          <p>환율 데이터 제공: FKF API</p>
        </div>
      </div>
    </footer>
  );
}