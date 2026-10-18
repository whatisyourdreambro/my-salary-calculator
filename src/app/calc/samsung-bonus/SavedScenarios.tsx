"use client";

import { useEffect, useMemo, useState } from "react";
import {
  calculateScenario, MAX_SAVED_SCENARIOS, readSavedScenarios, sameScenario,
  SCENARIO_STORAGE_KEY, serializeScenarios, validateScenarioInputs,
  type SavedScenario, type ScenarioInputs,
} from "./scenarioStorage";
import type { SamsungShareState } from "./shareState";

const won = (value: number) => `${Math.round(value).toLocaleString("ko-KR")}원`;
const button = "rounded-lg border border-canvas-300 dark:border-canvas-600 px-3 py-2 text-xs font-bold text-navy dark:text-canvas-100 hover:bg-canvas-100 dark:hover:bg-canvas-800 disabled:opacity-50 disabled:cursor-not-allowed";

export default function SavedScenarios({ inputs, valid, onRestore }: {
  inputs: SamsungShareState;
  valid: boolean;
  onRestore: (inputs: ScenarioInputs) => void;
}) {
  const [cases, setCases] = useState<SavedScenario[]>([]);
  const [ready, setReady] = useState(false);
  const [message, setMessage] = useState("");
  const current = useMemo(() => valid ? validateScenarioInputs(inputs) : null, [inputs, valid]);
  const currentResult = useMemo(() => current ? calculateScenario(current) : null, [current]);
  const saved = useMemo(() => cases.map(c => ({ ...c, result: calculateScenario(c.inputs) })), [cases]);

  useEffect(() => {
    const read = () => {
      try {
        const stored = readSavedScenarios(localStorage.getItem(SCENARIO_STORAGE_KEY));
        setCases(stored.cases);
        if (stored.rejected) setMessage("손상되었거나 계산 기준이 다른 저장값은 불러오지 않았습니다. 새 조건을 저장하거나 전체 삭제할 수 있습니다.");
      } catch { setMessage("이 브라우저에서는 저장 공간을 읽을 수 없습니다. 현재 계산은 계속 이용할 수 있습니다."); }
      setReady(true);
    };
    read();
    const sync = (event: StorageEvent) => { if (event.key === SCENARIO_STORAGE_KEY || event.key === null) read(); };
    window.addEventListener("storage", sync);
    return () => window.removeEventListener("storage", sync);
  }, []);

  function save() {
    if (!current) return;
    try {
      // Read again so an explicit save cannot overwrite a newer case from another tab.
      const latest = readSavedScenarios(localStorage.getItem(SCENARIO_STORAGE_KEY)).cases;
      setCases(latest);
      if (latest.some(c => sameScenario(c.inputs, current))) { setMessage("같은 조건이 이미 저장되어 있습니다."); return; }
      if (latest.length >= MAX_SAVED_SCENARIOS) { setMessage("최대 3개까지 저장할 수 있습니다. 비교가 끝난 조건을 삭제해 주세요."); return; }
      const next = [...latest, { savedAt: Date.now(), inputs: current }];
      localStorage.setItem(SCENARIO_STORAGE_KEY, serializeScenarios(next));
      setCases(next);
      setMessage(`조건 ${next.length}을 이 브라우저에 저장했습니다.`);
    } catch { setMessage("저장하지 못했습니다. 브라우저 저장 공간 설정을 확인해 주세요. 현재 계산값은 유지됩니다."); }
  }

  function remove(target?: SavedScenario) {
    try {
      const latest = readSavedScenarios(localStorage.getItem(SCENARIO_STORAGE_KEY)).cases;
      const next = target ? latest.filter(c => !(c.savedAt === target.savedAt && sameScenario(c.inputs, target.inputs))) : [];
      if (next.length) localStorage.setItem(SCENARIO_STORAGE_KEY, serializeScenarios(next));
      else localStorage.removeItem(SCENARIO_STORAGE_KEY);
      setCases(next);
      setMessage(target ? "선택한 저장 조건을 삭제했습니다." : "저장 조건을 모두 삭제했습니다.");
    } catch { setMessage("삭제하지 못했습니다. 브라우저 저장 공간 설정을 확인해 주세요."); }
  }

  return (
    <details className="rounded-2xl border border-canvas-200 dark:border-canvas-700 bg-canvas-50 dark:bg-canvas-950 p-4" data-saved-scenarios>
      <summary className="cursor-pointer text-sm font-black text-navy dark:text-canvas-50">내 조건 저장·비교</summary>
      <div className="mt-4 space-y-4">
        <p className="text-xs leading-relaxed text-muted-blue dark:text-canvas-300">
          영업이익·연봉·사업부·세금 가정을 최대 3개 저장해 비교하세요. 저장 버튼을 눌러야 이 브라우저에 보관되며, 다른 기기로 동기화되지 않습니다. 공용 기기에서는 사용 후 삭제해 주세요.
        </p>
        <p className="text-xs leading-relaxed text-muted-blue dark:text-canvas-300">모든 금액은 OPI1+OPI2 합산 추정입니다. 적용 연도를 바꿔도 세금·보험료는 현재 계산기의 2026년 기준을 사용합니다. TAI·RSU는 비교에 포함하지 않습니다.</p>
        <div className="flex flex-wrap gap-2">
          <button type="button" className={button} disabled={!ready || !current} onClick={save}>현재 조건 저장</button>
          <button type="button" className={button} disabled={!ready} onClick={() => remove()}>저장 조건 전체 삭제</button>
        </div>
        {!current && <p className="text-xs text-muted-blue">유효한 영업이익·연봉·사업부 인원과 가중치를 입력하면 저장할 수 있습니다.</p>}
        <p role="status" aria-live="polite" className="min-h-5 text-xs text-muted-blue dark:text-canvas-300">{message}</p>
        {saved.length === 0 ? <p className="text-xs text-muted-blue">아직 저장한 조건이 없습니다. 현재 조건을 저장한 뒤 입력을 바꾸면 차이를 비교할 수 있습니다.</p> : (
          <div className="grid gap-3 md:grid-cols-3">
            {saved.map((item, index) => {
              const difference = currentResult ? currentResult.netWon - item.result.netWon : null;
              return <article key={`${item.savedAt}-${index}`} className="min-w-0 rounded-xl border border-canvas-200 dark:border-canvas-700 bg-white dark:bg-canvas-900 p-3">
                <h3 className="text-sm font-black text-navy dark:text-canvas-50">조건 {index + 1} · {item.result.division}</h3>
                <p className="mt-1 text-xs text-muted-blue">{new Date(item.savedAt).toLocaleDateString("ko-KR")} 저장</p>
                <dl className="mt-3 space-y-2 text-xs text-muted-blue dark:text-canvas-300">
                  <div><dt>적용 연도 / 영업이익</dt><dd className="font-bold">{item.inputs.y}년 / {item.inputs.p.toLocaleString("ko-KR")}조원</dd></div>
                  <div><dt>연봉 / OPI1</dt><dd className="font-bold">{won(item.inputs.s)} / {item.inputs.o1}%</dd></div>
                  <div><dt>추가 공제 / 보험료</dt><dd>{item.inputs.ac}% / {item.inputs.ins ? "적용" : "미적용"}</dd></div>
                  <div><dt>합산 세전</dt><dd className="font-bold break-words">{won(item.result.totalGrossWon)}</dd></div>
                  <div><dt>합산 세후 추정</dt><dd className="text-base font-black text-navy dark:text-canvas-50 break-words">{won(item.result.netWon)}</dd></div>
                </dl>
                <p className="mt-3 text-xs leading-relaxed text-muted-blue dark:text-canvas-300">{difference === null ? "현재 입력을 확인하면 차이를 비교할 수 있습니다." : Math.abs(difference) < 0.5 ? "현재 조건과 세후 추정액이 같습니다." : `현재 조건의 세후는 이 조건보다 ${won(Math.abs(difference))} ${difference > 0 ? "많습니다." : "적습니다."}`}</p>
                <details className="mt-3 text-xs text-muted-blue dark:text-canvas-300"><summary className="cursor-pointer">저장한 인원·가중치</summary><ul className="mt-2 space-y-1">{Object.keys(item.inputs.counts).map(id => <li key={id}>{id === "memory" ? "메모리" : id === "common" ? "공통" : "파운드리·시스템LSI"}: {item.inputs.counts[id].toLocaleString("ko-KR")}명 / {item.inputs.ratios[id]}</li>)}</ul></details>
                <div className="mt-3 flex flex-wrap gap-2">
                  <button type="button" className={button} aria-label={`조건 ${index + 1} 불러오기`} onClick={() => { onRestore(item.inputs); setMessage(`조건 ${index + 1}을 불러왔습니다. 위의 계산 결과에 반영했습니다.`); }}>불러오기</button>
                  <button type="button" className={button} aria-label={`조건 ${index + 1} 삭제`} onClick={() => remove(item)}>삭제</button>
                </div>
              </article>;
            })}
          </div>
        )}
      </div>
    </details>
  );
}
