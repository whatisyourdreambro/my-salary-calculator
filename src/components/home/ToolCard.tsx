// src/components/home/ToolCard.tsx
//
// 메인 페이지 Premium Tools 그리드의 카드 컴포넌트.
// page.tsx에서 분리. 인라인 style은 hover handler와 결합되어 유지.

"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ChevronRight } from "lucide-react";

interface ToolCardProps {
 icon: React.ElementType;
 title: string;
 description: string;
 href: string;
 iconBg?: string;
 delay?: number;
 wide?: boolean;
}

export default function ToolCard({
 icon: Icon,
 title,
 description,
 href,
 delay = 0,
 wide = false,
}: ToolCardProps) {
 return (
 <motion.div
 initial={{ opacity: 0, y: 16 }}
 whileInView={{ opacity: 1, y: 0 }}
 viewport={{ once: true }}
 transition={{ duration: 0.4, delay }}
 style={wide ? { gridColumn: "span 2" } : undefined}
 className={wide ? "md:col-span-2" : ""}
 >
 <Link
 href={href}
 style={{
 display: "flex",
 alignItems: "center",
 gap: "16px",
 padding: "18px 20px",
 backgroundColor: "#FFFFFF",
 borderRadius: "16px",
 border: "1.5px solid #DDE4EC",
 textDecoration: "none",
 transition: "border-color 0.2s ease, box-shadow 0.2s ease, transform 0.15s ease",
 }}
 onMouseEnter={(e) => {
 const el = e.currentTarget as HTMLElement;
 el.style.borderColor = "#0145F244";
 el.style.boxShadow = "0 4px 24px -4px #0145F222";
 el.style.transform = "translateY(-2px)";
 }}
 onMouseLeave={(e) => {
 const el = e.currentTarget as HTMLElement;
 el.style.borderColor = "#DDE4EC";
 el.style.boxShadow = "none";
 el.style.transform = "none";
 }}
 >
 {/* Icon */}
 <div
 className="flex items-center justify-center flex-shrink-0"
 style={{
 width: "46px",
 height: "46px",
 borderRadius: "12px",
 backgroundColor: "#0145F20D",
 color: "#0145F2",
 border: "1.5px solid #0145F221",
 }}
 >
 <Icon style={{ width: "22px", height: "22px" }} />
 </div>

 {/* Text */}
 <div className="flex-1 min-w-0">
 <p
 className="font-bold text-navy"
 style={{
 fontSize: "15px",
 marginBottom: "2px",
 letterSpacing: "-0.02em",
 }}
 >
 {title}
 </p>
 <p
 className="text-faint-blue truncate"
 style={{ fontSize: "13.5px" }}
 >
 {description}
 </p>
 </div>

 <ChevronRight
 className="text-canvas-300 flex-shrink-0"
 style={{ width: "16px", height: "16px" }}
 />
 </Link>
 </motion.div>
 );
}
