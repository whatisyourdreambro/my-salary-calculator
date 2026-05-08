// src/app/embed/layout.tsx
// 임베드 위젯 전용 레이아웃 — 헤더·푸터·광고 제거.
// iframe 친화적 미니 UI.

import "../globals.css";

export default function EmbedLayout({ children }: { children: React.ReactNode }) {
 return (
 <div className="min-h-screen bg-white">
 <main className="p-4">{children}</main>
 <div className="fixed bottom-2 right-2 text-[10px] text-gray-400">
 Powered by{" "}
 <a
 href="https://www.moneysalary.com"
 target="_blank"
 rel="noopener"
 className="text-electric font-bold hover:underline"
 >
 moneysalary.com
 </a>
 </div>
 </div>
 );
}
