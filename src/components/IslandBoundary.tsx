// src/components/IslandBoundary.tsx
//
// 동적 섬(next/dynamic) 하나만 감싸는 오류 경계 (2026-09-25 감사 B3 · CLIENT-01).
//
// 배경: next/dynamic 은 lazy + Suspense 뿐이라 청크 로드 실패(배포로 옛 해시가 404)가 가장 가까운
// 경계인 src/app/error.tsx 까지 올라가 페이지 본문 전체 — 본문 광고 포함 — 를 오류 화면으로 바꿨다.
// 이 경계는 실패한 섬 자리에서만 대체 화면을 그린다.
//  - DOM 을 추가하지 않는다: 정상일 때는 children 을 그대로 돌려준다.
//  - 대체 화면은 섬의 원래 자리·같은 min-height 로 그려 아래 광고 오프셋이 바뀌지 않게 한다.
//  - 자동 새로고침은 하지 않는다 — 정상 동작 중인 페이지를 다시 불러오면 광고를 재요청한다.
//    (React.lazy 는 거부된 import 를 캐시하므로 재렌더로는 회복되지 않는다 → 단독 경로 링크를
//    일반 <a> 로 둬 새 HTML·새 청크를 받는 전체 로드로 이동시킨다.)
//  - ★ 광고 컴포넌트(CalcResultAd·InArticleAd 등)나 광고를 품은 트리(CalculatorTabs)는 감싸지 않는다.
"use client";

import { Component, type CSSProperties, type ReactNode } from "react";

type Props = {
  /** 콘솔 진단용 섬 이름 */
  name: string;
  fallback: ReactNode;
  children?: ReactNode;
};

type State = { failed: boolean };

export default class IslandBoundary extends Component<Props, State> {
  state: State = { failed: false };

  static getDerivedStateFromError(): State {
    return { failed: true };
  }

  componentDidCatch(error: unknown) {
    const e = error instanceof Error ? error : null;
    console.error(`[IslandBoundary:${this.props.name}]`, e?.name ?? "Error", e?.message ?? String(error));
  }

  render() {
    return this.state.failed ? this.props.fallback : this.props.children;
  }
}

/** 섬 자리의 짧은 안내 + (선택) 단독 경로 링크. className·minHeight 로 원래 자리 크기를 유지한다. */
export function IslandFallback({ message, href, linkLabel, className = "", style }: {
  message: string;
  href?: string;
  linkLabel?: string;
  className?: string;
  style?: CSSProperties;
}) {
  return (
    <div role="status" data-island-fallback="" className={className} style={style}>
      <p>
        {message}
        {href && linkLabel && (
          <>
            {" "}
            {/* 전체 로드로 이동해야 새 청크를 받는다 — 클라이언트 전환(AppLink) 대신 일반 링크. */}
            <a href={href} className="font-semibold text-link underline underline-offset-4">{linkLabel}</a>
          </>
        )}
      </p>
    </div>
  );
}
