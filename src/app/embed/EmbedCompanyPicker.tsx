"use client";

// /embed — 회사 공시연봉 카드 위젯 회사 선택기 (2026-08-31, 위젯 B2).
// 데이터는 dartNameMap(~9KB, id→한글명 경량 맵)만 import — dartDisclosed(1.3MB)·
// dartInjection 을 클라이언트 번들에 끌고 오지 말 것. 선택 즉시 해당 회사의
// 미리보기 iframe + 임베드 스니펫(크레딧 앵커 포함)을 생성한다.
// 스니펫 구조는 EMBED_WIDGETS(company)와 동일 — 크레딧 <a>가 백링크 본체.

import { useMemo, useState } from "react";
import { dartNameMap } from "@/data/dart/dartNameMap";
import EmbedSnippetClient from "./EmbedSnippetClient";

const WIDGET_HEIGHT = 420;

function buildSnippet(id: string, name: string): string {
  return `<iframe src="https://www.moneysalary.com/widget/company?id=${id}" width="100%" height="${WIDGET_HEIGHT}"
  style="border:1px solid #e2e8f0;border-radius:12px;max-width:480px;"
  title="${name} 평균연봉 위젯" loading="lazy"></iframe>
<p style="margin:8px 0 0;font-size:13px;">
  <a href="https://www.moneysalary.com/salary-db/${id}?utm_source=embed&utm_medium=widget"
     target="_blank" rel="noopener noreferrer">${name} 연봉 정보 by 머니샐러리</a>
</p>`;
}

export default function EmbedCompanyPicker() {
  const [query, setQuery] = useState("");

  const companies = useMemo(
    () =>
      Object.entries(dartNameMap)
        .map(([id, name]) => ({ id, name }))
        .sort((a, b) => a.name.localeCompare(b.name, "ko")),
    [],
  );
  const idByName = useMemo(
    () => new Map(companies.map((c) => [c.name, c.id])),
    [companies],
  );

  const trimmed = query.trim();
  const selectedId = idByName.get(trimmed);

  return (
    <div>
      <label
        htmlFor="embed-company-input"
        className="block text-sm font-bold text-navy mb-2"
      >
        회사 이름으로 검색 ({companies.length}개 기업 지원)
      </label>
      <input
        id="embed-company-input"
        type="text"
        list="embed-company-list"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="예: 삼성전자, 카카오, 현대자동차…"
        autoComplete="off"
        className="w-full max-w-md px-4 py-3 rounded-xl border border-canvas-200 bg-white text-navy font-bold text-[15px] outline-none focus:border-electric"
      />
      <datalist id="embed-company-list">
        {companies.map((c) => (
          <option key={c.id} value={c.name} />
        ))}
      </datalist>

      {selectedId ? (
        <div className="mt-5">
          <div className="flex justify-center rounded-3xl border border-canvas-200 bg-white p-4 sm:p-8 mb-4">
            <iframe
              key={selectedId}
              src={`/widget/company?id=${selectedId}`}
              width="100%"
              height={WIDGET_HEIGHT}
              style={{ border: "1px solid #e2e8f0", borderRadius: 12, maxWidth: 480 }}
              title={`${trimmed} 평균연봉 위젯`}
              loading="lazy"
            />
          </div>
          <EmbedSnippetClient
            snippet={buildSnippet(selectedId, trimmed)}
            widgetId={`company:${selectedId}`}
          />
        </div>
      ) : (
        <p className="mt-3 text-[13px] leading-[1.7] text-faint-blue font-medium">
          {trimmed
            ? "목록에서 회사를 선택하면 해당 회사의 미리보기와 임베드 코드가 나타납니다. 지원 목록에 없는 회사는 아직 DART 공시 데이터가 준비되지 않은 곳입니다."
            : "회사를 선택하면 그 회사 전용 미리보기와 임베드 코드가 여기에 생성됩니다."}
        </p>
      )}
    </div>
  );
}
