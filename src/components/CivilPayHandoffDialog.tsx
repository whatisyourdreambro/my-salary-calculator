"use client";

import { useEffect, useId, useRef, type MouseEvent } from "react";

/** Modal confirmation does not move the calculator's result or advertising blocks. */
export default function CivilPayHandoffDialog({ open, selectionLabel, assumptions, onConfirm, onEdit }: {
  open: boolean;
  selectionLabel: string;
  assumptions: readonly string[];
  onConfirm: (event: MouseEvent<HTMLButtonElement>) => void;
  onEdit: () => void;
}) {
  const dialog = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  const descriptionId = useId();
  useEffect(() => {
    if (open && !dialog.current?.open) dialog.current?.showModal();
    else if (!open && dialog.current?.open) dialog.current.close();
  }, [open]);
  return <dialog ref={dialog} aria-labelledby={titleId} aria-describedby={descriptionId}
    onCancel={event => { event.preventDefault(); dialog.current?.close(); onEdit(); }}
    className="m-auto max-h-[85dvh] w-[calc(100%_-_2rem)] max-w-lg overflow-y-auto rounded-2xl border border-canvas-200 bg-white p-5 text-navy shadow-xl backdrop:bg-black/50 dark:border-canvas-700 dark:bg-canvas-900 dark:text-canvas-50 sm:p-6">
    <h2 id={titleId} className="text-lg font-black">{selectionLabel}</h2>
    <p id={descriptionId} className="mt-2 text-sm leading-relaxed">봉급표에서 계급과 호봉만 가져왔습니다. 아래 급여 가정을 확인해 주세요. 재직연수는 호봉으로 추정하지 않습니다.</p>
    <ul className="my-4 list-disc space-y-2 pl-5 text-sm">
      {assumptions.map(assumption => <li key={assumption}>{assumption}</li>)}
    </ul>
    <p className="mb-4 text-xs leading-relaxed text-muted-blue dark:text-canvas-300">2026년 봉급·수당·보험요율로 계산한 일반 달의 예상액입니다. 2027년 정부안 미리보기와 다르며, 실제 급여는 수당과 공단 통보 기준소득월액에 따라 달라집니다.</p>
    <div className="flex flex-col gap-2 sm:flex-row">
      <button type="button" onClick={event => { dialog.current?.close(); onConfirm(event); }} className="min-h-11 rounded-xl bg-electric px-4 py-3 text-sm font-bold text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-electric">이 가정으로 결과 확인</button>
      <button type="button" onClick={() => { dialog.current?.close(); onEdit(); }} className="min-h-11 rounded-xl border border-canvas-200 px-4 py-3 text-sm font-bold dark:border-canvas-700">조건 수정</button>
    </div>
  </dialog>;
}
