// src/components/header/navConfigEn.ts
//
// English-language header navigation. Mirrors navConfig.ts structure,
// but only links to pages that exist in English (i.e. /en/*).

import type { NavItem } from "./navConfig";

export const navConfigEn: NavItem[] = [
 {
  name: "English Tools",
  href: "/en",
  type: "link",
 },
 {
  name: "Guides",
  type: "dropdown",
  items: [
   { name: "Korea Take-home Salary", href: "/en#calculator" },
   { name: "📚 All English Guides", href: "/en/guides" },
   { name: "Methods, Sources & Help", href: "/en/help" },
   { name: "Income Tax Comparison", href: "/en/flat-tax" },
   { name: "Gross Salary Converter", href: "/en/salary-converter" },
  ],
 },
 {
  name: "Stocks",
  type: "dropdown",
  items: [
   { name: "📊 All Stock Guides", href: "/en/guides" },
   { name: "🔥 Samsung Electronics 2026 Outlook", href: "/en/guides/samsung-electronics-stock-2026" },
   { name: "🚀 SK Hynix Stock Analysis", href: "/en/guides/sk-hynix-stock-2026" },
   { name: "🔄 Semiconductor Cycle 2026", href: "/en/guides/semiconductor-cycle-2026" },
   { name: "💼 Samsung Employee Stock Plans", href: "/en/guides/samsung-employee-rsu-stock" },
   { name: "💰 SK Hynix PS / PI & ESOP", href: "/en/guides/sk-hynix-employee-bonus-stock" },
   { name: "⚖️ Samsung vs SK Hynix Comparison", href: "/en/guides/samsung-vs-hynix-employee-comparison" },
   { name: "🧾 Chip Stock Tax Guide", href: "/en/guides/chip-stock-tax-guide" },
   { name: "📈 DCA vs Lump-Sum Strategy", href: "/en/guides/kospi-leader-stock-strategy" },
  ],
 },
];
