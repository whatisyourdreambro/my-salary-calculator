// src/components/tool/ToolDisclaimer.tsx
// 도구 페이지 유의사항 카드. 서버 컴포넌트.

import { Info } from "lucide-react";

export default function ToolDisclaimer({ text }: { text: string }) {
  return (
    <div className="p-5 bg-electric-5 border border-electric-20 rounded-2xl flex gap-3">
      <Info className="w-5 h-5 text-electric flex-shrink-0 mt-0.5" />
      <p className="text-sm text-muted-blue dark:text-canvas-300 leading-relaxed">
        {text}
      </p>
    </div>
  );
}
