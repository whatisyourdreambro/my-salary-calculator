'use client';

// 도구·재미 페이지 맨 아래 설명 글(lens-meta-F10, 2026-11-13). 항상 그 쪽의 마지막 광고 뒤에 둔다 —
// 페이지 파일에서는 PageFooterAds 다음, 레이아웃에서는 마지막 광고 블록 다음. 링크가 없으니 data-msy-module 은 붙이지 않는다.
// TopicNextSteps 와 같이 path 를 주지 않으면 현재 경로로 찾고, 등록되지 않은 경로에서는 아무것도 렌더하지 않는다.
import { usePathname } from 'next/navigation';
import { getToolExplainer } from '@/lib/toolExplainers';

export default function ToolExplainerSection({ path }: { path?: string }) {
  const pathname = usePathname();
  const explainer = getToolExplainer(path ?? pathname ?? '');
  if (!explainer) return null;
  return (
    <section className="mx-auto my-10 max-w-3xl px-4 sm:px-6" aria-label={explainer.heading}>
      <h2 className="text-lg font-bold text-foreground">{explainer.heading}</h2>
      {explainer.paragraphs.map((text) => (
        <p key={text} className="mt-3 text-sm leading-7 text-muted-foreground">{text}</p>
      ))}
    </section>
  );
}
