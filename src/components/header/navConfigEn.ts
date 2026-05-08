// src/components/header/navConfigEn.ts
//
// English-language header navigation. Mirrors navConfig.ts structure.

import type { NavItem } from "./navConfig";

export const navConfigEn: NavItem[] = [
 {
 name: "Calculator",
 href: "/en",
 type: "link",
 },
 {
 name: "Tools",
 type: "dropdown",
 items: [
 { name: "💸 Flat Tax 19% (Expats)", href: "/en/flat-tax" },
 { name: "💱 Salary Converter", href: "/en/salary-converter" },
 { name: "🆕 Hourly → Salary", href: "/en/tools/hourly-to-salary" },
 { name: "🆕 Cost of Living Calculator", href: "/en/tools/cost-of-living" },
 { name: "🆕 Tax Bracket Calculator", href: "/en/tools/tax-bracket" },
 { name: "🆕 Retirement Projection", href: "/en/tools/retirement" },
 { name: "🆕 Negotiation Simulator", href: "/en/tools/negotiation" },
 ],
 },
 {
 name: "Guides",
 type: "dropdown",
 items: [
 { name: "📚 All English Guides", href: "/en/guides" },
 { name: "🔥 Working in Korea (Expat Guide)", href: "/en/guides/working-in-korea-expat" },
 { name: "💼 Korean Tax System for Foreigners", href: "/en/guides/korean-tax-system-foreigners" },
 { name: "🏠 Renting in Korea (Jeonse vs Monthly)", href: "/en/guides/renting-in-korea" },
 { name: "🇰🇷 4 Insurances Explained", href: "/en/guides/four-insurances-korea" },
 { name: "💸 Year-End Tax Adjustment", href: "/en/guides/year-end-tax-adjustment" },
 { name: "📊 Korean Salary Statistics", href: "/en/guides/korean-salary-statistics" },
 ],
 },
 {
 name: "Stocks",
 type: "dropdown",
 items: [
 { name: "📊 All Stock Guides", href: "/en/guides?category=Stocks" },
 { name: "🔥 Samsung Electronics 2026", href: "/en/guides/samsung-electronics-stock-2026" },
 { name: "🚀 SK Hynix Analysis", href: "/en/guides/sk-hynix-stock-2026" },
 { name: "🔄 Semiconductor Cycle 2026", href: "/en/guides/semiconductor-cycle-2026" },
 { name: "💼 Samsung Employee Stock", href: "/en/guides/samsung-employee-rsu-stock" },
 { name: "💰 SK Hynix PS · PI · ESOP", href: "/en/guides/sk-hynix-employee-bonus-stock" },
 { name: "⚖️ Samsung vs SK Hynix", href: "/en/guides/samsung-vs-hynix-employee-comparison" },
 { name: "🧾 Chip Stock Tax Guide", href: "/en/guides/chip-stock-tax-guide" },
 { name: "📈 DCA vs Lump-Sum", href: "/en/guides/kospi-leader-stock-strategy" },
 ],
 },
 {
 name: "Stats",
 type: "dropdown",
 items: [
 { name: "📊 All Stats", href: "/en/stats" },
 { name: "🆕 Korean Salary Distribution", href: "/en/stats/korean-salary-distribution" },
 { name: "🆕 Minimum Wage History", href: "/en/stats/minimum-wage-history" },
 { name: "🆕 Tax Bracket History", href: "/en/stats/tax-bracket-history" },
 ],
 },
];
