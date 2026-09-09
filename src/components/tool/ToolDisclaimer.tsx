// src/components/tool/ToolDisclaimer.tsx
// 도구 페이지 유의사항 카드. 서버 컴포넌트.

import { Info } from "lucide-react";

export default function ToolDisclaimer({ text }: { text: string }) {
  return (
    <div className="flex gap-3 rounded-xl border border-border bg-secondary p-5 text-foreground">
      <Info className="mt-0.5 h-5 w-5 shrink-0 text-link" aria-hidden="true" />
      <p className="text-sm leading-6 text-muted-foreground">
        {text}
      </p>
    </div>
  );
}
