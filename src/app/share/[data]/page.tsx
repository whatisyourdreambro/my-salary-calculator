// src/app/share/[data]/page.tsx

import ShareableResult from "@/components/ShareableResult";
import { Suspense } from "react";

// [수정] Cloudflare Pages 배포를 위해 Edge 런타임 설정을 추가합니다.


export const runtime = 'edge';

type Props = {
  params: { data: string };
};

export default function SharePage({ params }: Props) {
  return (
    <main className="w-full max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-20 flex items-center justify-center min-h-[70vh]">
      <Suspense fallback={<div>결과를 불러오는 중...</div>}>
        <ShareableResult data={params.data} />
      </Suspense>
    </main>
  );
}
