"use client";

import React, { useEffect, useRef } from 'react';

interface KakaoAdFitProps {
  unit: string;
  width: string;
  height: string;
  disabled?: boolean;
}

const KakaoAdFit: React.FC<KakaoAdFitProps> = ({ unit, width, height, disabled }) => {
  const adContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (disabled) return;

    const container = adContainerRef.current;
    if (!container) return;

    // 기존에 추가된 광고 관련 요소를 모두 제거합니다.
    while (container.firstChild) {
      container.removeChild(container.firstChild);
    }

    const ins = document.createElement('ins');
    ins.className = 'kakao_ad_area';
    ins.style.display = 'none';
    ins.setAttribute('data-ad-unit', unit);
    ins.setAttribute('data-ad-width', width);
    ins.setAttribute('data-ad-height', height);
    
    container.appendChild(ins);

    const script = document.createElement('script');
    script.type = 'text/javascript';
    script.src = '//t1.daumcdn.net/kas/static/ba.min.js';
    script.async = true;

    container.appendChild(script);

    return () => {
      // 클린업 함수: 컴포넌트가 언마운트될 때 컨테이너의 모든 자식 노드를 제거합니다.
      while (container.firstChild) {
        container.removeChild(container.firstChild);
      }
    };
  }, [unit, width, height, disabled]);

  if (disabled) {
    return null;
  }

  return <div ref={adContainerRef} style={{ width: `${width}px`, height: `${height}px`, margin: '0 auto' }} />;
};

export default KakaoAdFit;
