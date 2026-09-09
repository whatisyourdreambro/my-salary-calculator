"use client";

import { useEffect, useRef, useState } from "react";
import ShareButtons, { type ShareButtonsProps } from "./ShareButtons";
import { useSharePageContext } from "@/hooks/useSharePageContext";
import { resolveShareLocale } from "@/lib/sharePolicy";

export interface ResultSharePanelProps extends Omit<ShareButtonsProps, "shareMode" | "imageBlob" | "variant" | "resultKey"> {
  /** Include every input represented by the result/image. Memory-only; not an event field. */
  resultKey: string;
  pageUrl?: string;
  pageTitle?: string;
  pageDescription?: string;
  previewDescription?: string;
  /** False while the displayed calculation belongs to earlier inputs. */
  resultIsCurrent?: boolean;
  /** Auxiliary image cards can share the page's existing link controls. */
  showPageShare?: boolean;
}

type Preview = { key: string; approved: boolean; preparing: boolean; blob?: Blob; objectUrl?: string; error?: boolean };

/** A result is optional; clicking ordinary page channels never uses result props. */
export default function ResultSharePanel({
  resultKey, pageUrl, pageTitle, pageDescription, previewDescription, resultIsCurrent = true, showPageShare = true,
  url, title, description, imageUrl, getShareImage, contentType = "result",
  className = "", locale: explicitLocale, register,
}: ResultSharePanelProps) {
  const { pathname, context } = useSharePageContext();
  const locale = resolveShareLocale(pathname, explicitLocale);
  const en = locale === "en";
  const key = JSON.stringify([pathname, resultKey, resultIsCurrent, url, title, description, imageUrl]);
  const latestKey = useRef(key);
  const request = useRef(0);
  if (latestKey.current !== key) request.current += 1;
  latestKey.current = key;
  const [preview, setPreview] = useState<Preview | null>(null);
  const active = resultIsCurrent && preview?.key === key ? preview : null;

  useEffect(() => {
    request.current += 1;
    setPreview(null);
    return () => { request.current += 1; };
  }, [key]);
  useEffect(() => () => { if (preview?.objectUrl) URL.revokeObjectURL(preview.objectUrl); }, [preview?.objectUrl]);

  async function openPreview() {
    const currentRequest = ++request.current;
    const isCurrent = () => currentRequest === request.current && latestKey.current === key;
    setPreview({ key, approved: false, preparing: !!getShareImage });
    if (!getShareImage) return;
    try {
      const blob = await getShareImage();
      if (!isCurrent()) return;
      if (!blob || !/^image\/(?:png|jpeg|webp)$/.test(blob.type) || blob.size === 0 || blob.size > 10 * 1024 * 1024) {
        setPreview({ key, approved: false, preparing: false, error: true });
        return;
      }
      const objectUrl = URL.createObjectURL(blob);
      setPreview({ key, approved: false, preparing: false, blob, objectUrl });
    } catch {
      if (isCurrent()) setPreview({ key, approved: false, preparing: false, error: true });
    }
  }

  if (!context) return null;
  return <section className={`rounded-2xl border border-slate-200 bg-white p-4 text-slate-900 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 ${className}`} data-result-share-panel>
    {showPageShare && <>
      <p className="mb-2 text-sm font-bold">{en ? "Share the page link" : "페이지 링크 공유"}</p>
      <p className="mb-3 text-xs text-slate-600 dark:text-slate-300">{en ? "Your inputs and results are not included." : "입력값과 결과는 포함하지 않습니다."}</p>
      <ShareButtons url={pageUrl} title={pageTitle} description={pageDescription} locale={locale} contentType={contentType} register={register} />
    </>}
    {!active && resultIsCurrent && <button type="button" className="mt-4 min-h-11 rounded-xl border border-blue-600 px-4 py-2 text-sm font-semibold text-blue-700 dark:text-blue-300" onClick={() => void openPreview()}>{en ? (getShareImage ? "Preview result and image" : "Preview this result") : (getShareImage ? "결과·이미지 미리보기" : "현재 결과 미리보기")}</button>}
    {!resultIsCurrent && <p className="mt-3 text-sm text-slate-600 dark:text-slate-300">{en ? "Recalculate with your current inputs before sharing a result." : "현재 입력으로 다시 계산하면 결과를 공유할 수 있습니다."}</p>}
    {active && <div className="mt-4 border-t border-slate-200 pt-4 dark:border-slate-700">
      <p className="font-semibold">{en ? "Review what you will share" : "공유할 내용 확인"}</p>
      <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">{previewDescription ?? (en ? "Only continue if you want to send the result shown below. People receiving it may copy or forward it." : "아래 결과를 다른 사람에게 보내려는 경우에만 진행하세요. 받은 사람이 내용을 복사하거나 다시 전달할 수 있습니다.")}</p>
      <div className="mt-3 rounded-xl bg-slate-50 p-3 dark:bg-slate-800">
        {title && <p className="font-semibold break-words">{title}</p>}
        {description && <p className="mt-2 text-sm break-words">{description}</p>}
        {active.preparing && <p role="status" className="mt-2 text-sm">{en ? "Preparing an image on this device…" : "이 기기에서 이미지를 준비하고 있어요…"}</p>}
        {active.error && <p role="alert" className="mt-2 text-sm text-red-600 dark:text-red-300">{en ? "The image could not be prepared. Reopen the preview to retry." : "이미지를 준비하지 못했습니다. 미리보기를 닫고 다시 시도해 주세요."}</p>}
        {/* A local object URL only. A private dynamic OG URL is never fetched for preview. */}
        {/* eslint-disable-next-line @next/next/no-img-element -- local Blob preview; no remote image optimizer or upload */}
        {active.objectUrl && <img src={active.objectUrl} alt={en ? "Result image preview" : "공유할 결과 이미지 미리보기"} className="mt-3 max-h-[28rem] w-full object-contain" />}
      </div>
      {!active.approved && <button type="button" disabled={active.preparing || active.error} className="mt-3 min-h-11 rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50" onClick={() => setPreview((current) => current?.key === key ? { ...current, approved: true } : current)}>{en ? "Use this content for sharing" : "이 내용으로 공유"}</button>}
      {active.approved && <div className="mt-4">
        <p className="mb-3 text-xs text-slate-600 dark:text-slate-300">{en ? "Images are included only in image sharing or saving. A plain page link does not recreate this result." : "이미지는 이미지 공유·저장에서만 포함됩니다. 일반 페이지 링크만으로는 이 결과가 재현되지 않습니다."}</p>
        <ShareButtons key={key} shareMode="result" resultKey={resultKey} url={url} title={title} description={description} imageUrl={imageUrl} imageBlob={active.blob} contentType={contentType} locale={locale} register={false} />
        {active.objectUrl && <a href={active.objectUrl} download="moneysalary-result.png" className="mt-3 inline-flex min-h-11 items-center rounded-xl border border-blue-600 px-4 py-2 text-sm font-semibold">{en ? "Save result image" : "결과 이미지 저장"}</a>}
      </div>}
      <button type="button" className="ml-2 mt-3 min-h-11 px-3 py-2 text-sm underline" onClick={() => { request.current += 1; setPreview(null); }}>{en ? "Close result preview" : "결과 미리보기 닫기"}</button>
    </div>}
  </section>;
}
