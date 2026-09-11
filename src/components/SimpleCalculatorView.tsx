// src/components/SimpleCalculatorView.tsx
//
// 간이 계산기(202종) 공통 UI.
//
// 번들 분리 (2026-09-11): 종전에는 이 클라이언트 컴포넌트가 `@/lib/simpleCalculators` 를 직접
// import 해 202종 정의 전체(설명·FAQ·공식 텍스트 포함, 청크 507KB·gzip 151KB)가 /calc/[slug]
// 202쪽 모두의 첫 로드 JS 에 포함됐다(라우트 JS 170KB — 다른 라우트 6~18KB 대비 유일한 이상치).
// 이제 텍스트·필드는 서버 페이지가 props(calc)로 넘기고, compute 함수만 자기 배치 파일 하나를
// 동적 import 해 얻는다(computeLoader). 프리렌더/하이드레이션은 서버가 계산한 initialResult 를
// 쓰므로 첫 화면은 종전과 동일하고, compute 가 도착하면(대개 하이드레이션 직후) 입력이 살아난다.
// ★ 이 파일에서 `@/lib/simpleCalculators`(index) 를 import 하지 말 것 — 테스트가 막는다.

"use client";

import { useState, useMemo, useRef, useEffect, useId, useCallback, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "@/components/AppLink";
import { Calculator, ArrowRight, AlertTriangle, HelpCircle, Sigma } from "lucide-react";
import type { CalculatorDef, CalculatorField, CalculatorResult, ClientCalculatorDef } from "@/lib/simpleCalculators/types";
import { loadCalculatorCompute, type CalculatorBatch } from "@/lib/simpleCalculators/computeLoader";
import { CalcResultAd, GuideMidAd, InArticleAd } from "./AdPlacement";
import JsonLd from "./JsonLd";
import ResultSharePanel from "./ResultSharePanel";
import FavoritesButton from "./FavoritesButton";
import Breadcrumbs from "./Breadcrumbs";
import { faqLd } from "@/lib/structuredData";
import { SITE_CONFIG } from "@/lib/seo";
import { useCalculatorMeasurement } from "@/hooks/useCalculatorMeasurement";
import { isValidCalculationNumber } from "@/lib/calculationMeasurement";
import { decodeSimpleCalculatorInputs, encodeSimpleCalculatorInputs, validateSimpleCalculatorInputs } from "@/lib/simpleCalculatorShare";
import NumberInput from "@/components/NumberInput";

interface Props {
 slug: string;
 /** compute 를 제외한 직렬화 정의 (서버 page.tsx 가 toClientCalculator 로 생성) */
 calc: ClientCalculatorDef;
 /** compute 가 들어 있는 배치 파일 키 (서버 getCalculatorBatch) */
 batch: CalculatorBatch;
 /** 기본값 입력의 서버 계산 결과 — compute 로드 전 첫 화면·하이드레이션에 사용 */
 initialResult: CalculatorResult;
}

type ComputeFn = CalculatorDef["compute"];

const formatNumber = (v: number, suffix?: string): string => {
 if (!Number.isFinite(v)) return "—"; // NaN/Infinity 공통 가드 (0 나눗셈·로그 등)
 if (suffix === "%") return `${v.toFixed(2)}%`;
 // 금액(원)은 반드시 원 단위 정확값으로 — 이 사이트의 계산기는 "정확한 금액"이
 // 존재 이유다. 종전 구현은 1만~1억 구간을 `(v/10000).toFixed(0)만` 으로 압축해
 // 환산 시급 23,974원을 "2만원"(-16.6%), 주휴수당 82,560원을 "8만원"으로 표시했다
 // (2026-09-06 전수검사 실브라우저 실측). 1억 이상도 억 단위 2자리라 ±50만원까지
 // 어긋났다. 압축 표기는 아래 compact 로 옮겨 보조 표기로만 쓴다.
 if (suffix === "원") return `${Math.round(v).toLocaleString("ko-KR")}원`;
 if (suffix) return `${v.toLocaleString("ko-KR", { maximumFractionDigits: 2 })}${suffix}`;
 return v.toLocaleString("ko-KR", { maximumFractionDigits: 2 });
};

/** 큰 금액의 보조 표기 — "3억 85만" 처럼 감을 잡아 주되 정확값을 대체하지 않는다. */
const compactKo = (v: number): string | null => {
 if (!Number.isFinite(v)) return null;
 const abs = Math.abs(Math.round(v));
 if (abs < 10000) return null;
 const sign = v < 0 ? "-" : "";
 const eok = Math.floor(abs / 100000000);
 const man = Math.floor((abs % 100000000) / 10000);
 if (eok > 0) return `${sign}${eok}억${man > 0 ? ` ${man.toLocaleString("ko-KR")}만` : ""}`;
 return `${sign}${man.toLocaleString("ko-KR")}만`;
};

/**
 * 필드 하한 — 명시 min 이 없으면 금액·수량은 0 이상으로 본다. 비율(%·%p)과 음수 기본값 필드만 음수를 허용한다.
 * 2026-09-11 전수 프로브: batch1/2 의 100종이 음수 재산세(-300,000원)·음수 등록면허세 같은 무의미한 결과를
 * 경고 없이 냈다. 하한이 0 이면 NumberInput 이 '-' 입력을 막고 범위 안내가 바로 뜬다.
 */
const effectiveMin = (f: CalculatorField): number | undefined =>
 f.min ?? (f.defaultValue < 0 || /%/.test(f.suffix ?? "") ? undefined : 0);

const rangeMessage = (f: CalculatorField): string => {
 const min = effectiveMin(f);
 const unit = f.suffix ?? "";
 if (min !== undefined && f.max !== undefined) return `${min.toLocaleString("ko-KR")}~${f.max.toLocaleString("ko-KR")}${unit} 범위의 숫자를 입력해 주세요.`;
 if (min !== undefined) return `${min.toLocaleString("ko-KR")}${unit} 이상의 숫자를 입력해 주세요.`;
 if (f.max !== undefined) return `${f.max.toLocaleString("ko-KR")}${unit} 이하의 숫자를 입력해 주세요.`;
 return "허용 범위의 숫자를 입력해 주세요.";
};

export default function SimpleCalculatorView({ slug, calc, batch, initialResult }: Props) {
 const [shareToken, setShareToken] = useState<string | null>(null);
 return <>
 <Suspense fallback={null}><SimpleShareQuery onChange={setShareToken} /></Suspense>
 <SimpleCalculatorInstance key={`${slug}:${shareToken ?? ""}`} slug={slug} calc={calc} batch={batch} initialResult={initialResult} shareToken={shareToken} />
 </>;
}

// Keep the static calculator HTML outside the search-parameter Suspense boundary.
function SimpleShareQuery({ onChange }: { onChange: (token: string | null) => void }) {
 const params = useSearchParams();
 const token = params.get("v");
 useEffect(() => { onChange(token); }, [token, onChange]);
 return null;
}

function SimpleCalculatorInstance({ slug, calc, batch, initialResult, shareToken }: Props & { shareToken: string | null }) {
 // label htmlFor ↔ input id 연결용 인스턴스 고유 접두사 (간이 계산기 ~200종 일괄)
 const fieldIdPrefix = useId();
 const resultCardRef = useRef<HTMLElement | null>(null);

 // compute 지연 로드 — 배치 청크 하나만 받는다. 실패 시 서버 초기 결과는 그대로 두고 안내만 붙인다.
 const [compute, setCompute] = useState<ComputeFn | null>(null);
 const [computeFailed, setComputeFailed] = useState(false);
 useEffect(() => {
 let alive = true;
 loadCalculatorCompute(batch, slug)
 .then((fn) => { if (!alive) return; if (fn) setCompute(() => fn); else setComputeFailed(true); })
 .catch(() => { if (alive) setComputeFailed(true); });
 return () => { alive = false; };
 }, [batch, slug]);
 // 공유 인코딩·검증은 compute 가 필요하므로 로드 뒤에만 완전한 정의를 만든다.
 const fullCalc = useMemo<CalculatorDef | null>(() => (compute ? { ...calc, compute } : null), [calc, compute]);

 const [inputs, setInputs] = useState<Record<string, number>>(() => {
 const init: Record<string, number> = {};
 calc.fields.forEach((f) => { init[f.name] = f.defaultValue; });
 return init;
 });

 // 입력창에 실제로 찍힌 문자열. 숫자 state 와 분리해야 소수점을 입력할 수 있다.
 // 종전에는 value 를 inputs[name].toLocaleString() 으로 되돌렸기 때문에,
 // "3." 을 치는 순간 Number("3.")=3 → 리렌더로 DOM 이 "3" 으로 복구되어
 // 소수점이 사라졌다. 금리 3.5% 를 입력하면 35% 가 확정돼 월 상환액이 6배로
 // 계산됐다(2026-09-06 전수검사 실브라우저 실측: 143만원 → 875만원).
 const [rawInputs, setRawInputs] = useState<Record<string, string>>(() => {
 const init: Record<string, string> = {};
 calc.fields.forEach((f) => { init[f.name] = String(f.defaultValue); });
 return init;
 });

 // 공유 링크(?v=) 복원 — 검증에 compute 가 필요하므로 로드 뒤 1회 적용. 인스턴스는 token 별 key 로 재마운트된다.
 const [restoreState, setRestoreState] = useState<"none" | "pending" | "ok" | "failed">(shareToken ? "pending" : "none");
 useEffect(() => {
 if (!shareToken || !fullCalc) return;
 const restored = decodeSimpleCalculatorInputs(shareToken, fullCalc);
 if (restored) {
 setInputs(restored);
 const raw: Record<string, string> = {};
 for (const f of fullCalc.fields) raw[f.name] = String(restored[f.name]);
 setRawInputs(raw);
 setRestoreState("ok");
 } else {
 setRestoreState("failed");
 }
 }, [shareToken, fullCalc]);

 const inputsAreDefault = calc.fields.every((f) => inputs[f.name] === f.defaultValue);

 // compute 로드 전: 기본값이면 서버 결과를 그대로, 값을 바꿨으면 잠시 대기(null).
 const result = useMemo<CalculatorResult | null>(() => {
 if (compute) {
 try { return compute(inputs); } catch { return { primary: { label: "계산 결과", value: NaN }, note: "입력값과 허용 범위를 확인해 주세요." }; }
 }
 return inputsAreDefault ? initialResult : null;
 }, [compute, inputs, inputsAreDefault, initialResult]);

 const rawValid = calc.fields.every((field) => isValidCalculationNumber(rawInputs[field.name] ?? "", effectiveMin(field), field.max));
 // 범위는 통과했는데 계산이 무한대/NaN 인 경우(0 나눗셈 등) — 어느 항목이 0 인지 짚어 준다.
 // 종전에는 '입력값 확인'만 떠서 사용자가 무엇을 고쳐야 하는지 알 수 없었다(29종 41케이스, 2026-09-11 프로브).
 const zeroFieldLabels = calc.fields.filter((f) => inputs[f.name] === 0).map((f) => f.label);
 const resultValid = Boolean(
 result && result.status !== "invalid" && rawValid &&
 (fullCalc ? validateSimpleCalculatorInputs(inputs, fullCalc) : inputsAreDefault && Number.isFinite(result.primary.value))
 );
 const resultSnapshot = JSON.stringify([slug, rawInputs, inputs]);
 const captureSnapshot = useRef<string | null>(null);
 captureSnapshot.current = resultValid ? resultSnapshot : null;
 useEffect(() => () => { captureSnapshot.current = null; }, []);

 const measurement = useCalculatorMeasurement({
 calcType: slug,
 allowNegativeInput: true,
 valid: resultValid,
 resultKey: result,
 });
 const measurementResultRef = measurement.resultRef;
 const setResultRef = useCallback((element: HTMLElement | null) => {
 resultCardRef.current = element;
 measurementResultRef(element);
 }, [measurementResultRef]);

 // 입력이 기본값 그대로면 깔끔한 canonical, 바꿨으면 결과 재현 링크로 공유
 // 채널 귀속 utm 은 ShareSection→ShareButtons 가 채널별 withUtm 으로 부여(`?v=` 뒤에 `&utm_…` 결합).
 const shareUrl = useMemo(() => {
 const base = `${SITE_CONFIG.url}/calc/${slug}`;
 if (inputsAreDefault || !fullCalc) return base;
 const encoded = encodeSimpleCalculatorInputs(inputs, fullCalc);
 return encoded ? `${base}?v=${encoded}` : base;
 }, [fullCalc, slug, inputs, inputsAreDefault]);

 // 결과 카드 캡처 → 인스타·시스템 공유에서 이미지 파일로 전송
 const getShareImage = async (): Promise<Blob | null> => {
 const element = resultCardRef.current;
 const snapshot = captureSnapshot.current;
 if (!element || !snapshot) return null;
 try {
 const { default: html2canvas } = await import("html2canvas");
 if (captureSnapshot.current !== snapshot || resultCardRef.current !== element) return null;
 const canvas = await html2canvas(element, {
 backgroundColor: "#0145F2",
 scale: 2,
 });
 const blob = await new Promise<Blob | null>((resolve) =>
 canvas.toBlob((blob) => resolve(blob), "image/png")
 );
 return captureSnapshot.current === snapshot && resultCardRef.current === element ? blob : null;
 } catch {
 return null;
 }
 };

 // 표시용 문자열은 사용자가 친 그대로 두고(소수점 입력 중 상태 포함),
 // 계산에는 파싱된 숫자만 쓴다. 숫자·소수점·선행 부호 외 입력은 무시한다.
 const handleChange = (name: string, value: string) => {
 const cleaned = value.replace(/,/g, "");
 if (cleaned !== "" && !/^-?\d*\.?\d*$/.test(cleaned)) return;
 setRawInputs((prev) => ({ ...prev, [name]: cleaned }));
 const num =
 cleaned === "" || cleaned === "-" || cleaned === "." || cleaned === "-."
 ? 0
 : Number(cleaned);
 if (Number.isFinite(num)) {
 setInputs((prev) => ({ ...prev, [name]: num }));
 }
 };

 const primary = result?.primary ?? initialResult.primary;
 const computeLoading = !compute && !computeFailed;

 return (
 <div className="min-h-screen bg-background pb-16 pt-24 text-foreground sm:pt-28">
 <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
 <Breadcrumbs path={`/calc/${slug}`} leafName={calc.title} className="mb-6" />
 <header className="mb-8 border-b border-border pb-7">
 <p className="ms-eyebrow mb-3">
 {calc.categoryLabel}
 </p>
 <h1 className="ms-title mb-4">
 {calc.title}
 </h1>
 <p className="ms-description max-w-2xl">
 {calc.description}
 </p>
 <div className="mt-4 flex">
 <FavoritesButton path={`/calc/${slug}`} title={calc.title} />
 </div>
 </header>

 <section {...measurement.inputProps} className="ms-surface ms-panel mb-6" aria-labelledby={`${fieldIdPrefix}input-heading`}>
 {restoreState === "failed" && <p role="status" className="ms-status-warning mb-4 rounded-xl p-3 text-sm">공유 링크의 입력값을 확인할 수 없어 기본값을 표시합니다. 입력값과 범위를 확인해 주세요.</p>}
 {computeFailed && <p role="alert" className="ms-status-warning mb-4 rounded-xl p-3 text-sm">계산 모듈을 불러오지 못했습니다. 네트워크를 확인하고 페이지를 새로고침해 주세요.</p>}
 <h2 id={`${fieldIdPrefix}input-heading`} className="mb-2 flex items-center gap-2 text-xl font-bold text-foreground">
 <Calculator className="w-4 h-4 text-electric" />
 내 조건 입력
 </h2>
 <p className="mb-6 text-sm leading-6 text-muted-foreground">처음 보이는 값은 예시입니다. 단위를 확인하고 내 조건으로 바꾸면 결과가 갱신됩니다.</p>
 <div className="space-y-5">
 {calc.fields.map((field) => (
 <div key={field.name}>
 <label
 htmlFor={`${fieldIdPrefix}${field.name}`}
 className="mb-2 block text-base font-semibold text-foreground"
 >
 {field.label}
 {field.suffix && (
 <span className="ml-1 text-sm font-normal text-muted-foreground">
 ({field.suffix})
 </span>
 )}
 </label>
 <NumberInput
 id={`${fieldIdPrefix}${field.name}`}
 type="text"
 // decimal: 모바일 키패드에 소수점 키가 나온다(numeric 은 정수 전용이라
 // 금리 3.5 를 입력할 방법이 아예 없었다).
 inputMode="decimal"
 value={rawInputs[field.name] ?? ""}
 min={effectiveMin(field)}
 max={field.max}
 // 하한이 0 이상인 필드는 '-' 자체를 받지 않는다 (음수 금액·수량 차단)
 allowNegative={effectiveMin(field) === undefined || (effectiveMin(field) as number) < 0}
 aria-invalid={!isValidCalculationNumber(rawInputs[field.name] ?? "", effectiveMin(field), field.max)}
 aria-describedby={`${fieldIdPrefix}${field.name}-help`}
 onChange={(e) => handleChange(field.name, e.target.value)}
 className="ms-field w-full text-lg font-semibold tabular-nums"
 placeholder={`예: ${field.defaultValue.toLocaleString("ko-KR")}`}
 />
 <p id={`${fieldIdPrefix}${field.name}-help`} className="mt-2 text-sm leading-6 text-muted-foreground">
 {field.hint}
 {!isValidCalculationNumber(rawInputs[field.name] ?? "", effectiveMin(field), field.max) && <span className="block text-destructive">{rangeMessage(field)}</span>}
 </p>
 </div>
 ))}
 </div>
 </section>

 <section ref={setResultRef} className="mb-6 rounded-2xl bg-primary p-5 text-primary-foreground sm:p-8" aria-label="현재 조건의 계산 결과" aria-busy={computeLoading && !result}>
 <p className="mb-2 text-sm font-medium text-primary-foreground">{primary.label}</p>
 <p className="break-words text-[clamp(1.75rem,6vw,2.75rem)] font-bold leading-tight tracking-tight text-primary-foreground tabular-nums">
 {resultValid ? formatNumber(primary.value, primary.suffix) : result ? "입력값 확인" : "계산 준비 중…"}
 </p>
 {!resultValid && result && rawValid && result.status !== "invalid" && (
 <p role="status" className="mt-2 text-sm leading-6 text-primary-foreground/90">
 {zeroFieldLabels.length > 0
 ? `0으로 입력된 항목(${zeroFieldLabels.join(", ")})이 있어 계산할 수 없습니다. 0보다 큰 값을 입력해 주세요.`
 : "이 입력 조합으로는 결과를 계산할 수 없습니다. 값을 확인해 주세요."}
 </p>
 )}
 {/* 정확값 아래에 억/만 감각 표기 — 정확값을 대체하지 않는 보조 표기 */}
 {resultValid && primary.suffix === "원" &&
 typeof primary.value === "number" &&
 compactKo(primary.value) && (
 <p className="mt-2 text-sm text-primary-foreground">
 ≈ {compactKo(primary.value)}원
 </p>
 )}
 <div className="mb-6" />
 {resultValid && result?.secondary && result.secondary.length > 0 && (
 <div className="border-t border-white/20 pt-5 space-y-2">
 {result.secondary.map((item, idx) => (
 <div key={idx} className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
 <span className="text-sm text-white/80">{item.label}</span>
 <span className="font-bold tabular-nums text-white">
 {formatNumber(item.value, item.suffix)}
 </span>
 </div>
 ))}
 </div>
 )}
 {result?.note && (
 <p className="mt-5 pt-5 border-t border-white/20 text-xs text-white/85 leading-relaxed">
 {result.note}
 </p>
 )}
 </section>

 {/* ★수익 우선: CalcResultAd는 "결과 직하 viewability 최상위" 슬롯 —
     반드시 결과 바로 아래 유지. 공유 섹션은 광고 아래 배치 (2026-08-16
     광고 수익 급락 대응 — 공유 섹션이 광고를 밀어내면 RPM 하락) */}
 <CalcResultAd />

 {resultValid ? <ResultSharePanel
 resultKey={resultSnapshot}
 pageUrl={`${SITE_CONFIG.url}/calc/${slug}`}
 pageTitle={`${calc.title} | 머니샐러리`}
 pageDescription={calc.description}
 previewDescription={`결과 링크에 포함되는 입력: ${calc.fields.map((field) => `${field.label} ${inputs[field.name].toLocaleString("ko-KR")}${field.suffix ?? ""}`).join(" · ")}. 받은 사람은 이를 복원할 수 있습니다. 이미지는 아래 미리보기 그대로 공유됩니다. 기본값도 현재 결과로 공유됩니다.`}
 contentType="calc_result"
 title={`${calc.title} — ${primary.label} ${formatNumber(primary.value, primary.suffix)}`}
 description={calc.description}
 url={shareUrl}
 getShareImage={getShareImage}
 className="mb-6"
 /> : result === null ? <p role="status" className="mb-6 rounded-xl p-4 text-sm text-muted-foreground">계산 모듈을 불러오는 중입니다. 잠시 후 결과와 공유 링크가 표시됩니다.</p> : <p role="status" className="ms-status-warning mb-6 rounded-xl p-4 text-sm">입력값과 허용 범위를 확인하면 현재 결과를 공유할 수 있습니다.</p>}

 {/* 결과 직후 다음 단계 한 줄 — 광고(CalcResultAd)·공유 패널 아래. 종전에는 첫 내부 링크가 광고 3개·섹션 9개
     아래(관련 계산기)라 결과만 보고 떠나는 방문이 다음 페이지로 이어지지 않았다 (2026-09-11 NAV-01/SI-03).
     정밀 계산기(같은 의도의 /tools·전용 페이지)가 있으면 첫 핀으로 둔다. 광고 위로 올리지 말 것. */}
 {(calc.precisionTwin || (calc.relatedCards && calc.relatedCards.length > 0)) && (
 <nav aria-label="다음 계산기" data-msy-module="calc-next-pins" className="mb-6 flex flex-wrap gap-2">
 {calc.precisionTwin && (
 <Link href={calc.precisionTwin.href} className="inline-flex min-h-11 items-center gap-1 rounded-full bg-electric px-4 text-sm font-bold text-white hover:bg-electric/90">
 {calc.precisionTwin.title}
 <ArrowRight className="h-4 w-4" aria-hidden="true" />
 </Link>
 )}
 {(calc.relatedCards ?? []).slice(0, calc.precisionTwin ? 2 : 3).map((rel) => (
 <Link key={rel.slug} href={`/calc/${rel.slug}`} className="inline-flex min-h-11 items-center gap-1 rounded-full border border-border bg-background px-4 text-sm font-semibold text-foreground hover:border-electric hover:text-electric">
 {rel.title}
 <ArrowRight className="h-4 w-4" aria-hidden="true" />
 </Link>
 ))}
 </nav>
 )}

 {calc.explanation && (
 <section className="ms-surface ms-panel mb-6">
 <h2 className="mb-4 text-xl font-bold text-foreground">계산 방식</h2>
 {/* calc-explanation: page.tsx speakable 셀렉터가 가리키는 클래스 (DOM 에 없던 문제, 2026-09-11) */}
 <p className="calc-explanation whitespace-pre-line text-base leading-7 text-muted-foreground">
 {calc.explanation}
 </p>
 </section>
 )}

 {/* 계산 방식 ↔ 공식 사이 — 이 페이지에서 유일하게 GUIDE_MID 슬롯 미사용이었음 (Phase 1) */}
 {calc.explanation && <GuideMidAd />}

 {calc.formula && (
 <section className="ms-surface ms-panel mb-6">
 <h2 className="mb-4 flex items-center gap-2 text-xl font-bold text-foreground">
 <Sigma className="w-4 h-4 text-electric" />
 계산 공식
 </h2>
 {/* whitespace-pre-line: 42종의 공식 문자열에 줄바꿈이 있는데 한 줄로 뭉개지던 문제 (2026-09-11) */}
 <code className="block overflow-x-auto whitespace-pre-line rounded-xl border border-border bg-secondary p-4 text-sm leading-7 text-foreground">
 {calc.formula}
 </code>
 </section>
 )}

 {calc.faqs && calc.faqs.length > 0 && (
 <>
 <JsonLd
 data={faqLd(
 calc.faqs.map((f) => ({ question: f.q, answer: f.a }))
 )}
 />
 {/* FAQ 직전 추가 광고 — 결과~FAQ 사이 viewability 최상위 */}
 <InArticleAd />
 <section className="ms-surface ms-panel mb-6">
 <h2 className="mb-5 flex items-center gap-2 text-xl font-bold text-foreground">
 <HelpCircle className="w-4 h-4 text-electric" />
 자주 묻는 질문
 </h2>
 <div className="space-y-3">
 {calc.faqs.map((item) => (
 <details
 key={item.q}
 className="group rounded-xl border border-border bg-background px-4"
 >
 <summary className="flex min-h-12 cursor-pointer items-center justify-between gap-3 py-4 text-base font-semibold text-foreground">
 <span>{item.q}</span>
 <ArrowRight className="w-4 h-4 text-electric flex-shrink-0 mt-0.5 transition-transform group-open:rotate-90" />
 </summary>
 <p className="faq-answer whitespace-pre-line border-t border-border py-4 text-base leading-7 text-muted-foreground">
 {item.a}
 </p>
 </details>
 ))}
 </div>
 </section>
 </>
 )}

 {calc.caveats && calc.caveats.length > 0 && (
 <section className="ms-status-warning mb-6 rounded-2xl p-5 sm:p-6">
 <h2 className="mb-3 flex items-center gap-2 text-xl font-bold">
 <AlertTriangle className="w-4 h-4" />
 유의사항
 </h2>
 <ul className="space-y-2 text-base leading-7">
 {calc.caveats.map((item, idx) => (
 <li key={idx} className="flex gap-2">
 <span className="font-bold" aria-hidden="true">·</span>
 <span>{item}</span>
 </li>
 ))}
 </ul>
 </section>
 )}

 {calc.relatedCards && calc.relatedCards.length > 0 && (
 <section className="ms-surface ms-panel mb-6">
 <h2 className="mb-4 text-xl font-bold text-foreground">관련 계산기</h2>
 <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
 {calc.relatedCards.map((rel) => (
 <Link
 key={rel.slug}
 href={`/calc/${rel.slug}`}
 className="ms-surface ms-interactive group flex items-start gap-3 p-4"
 >
 <ArrowRight className="w-4 h-4 text-electric flex-shrink-0 mt-1 group-hover:translate-x-0.5 transition-transform" />
 <div>
 <p className="text-base font-semibold text-foreground">
 {rel.title}
 </p>
 <p className="mt-1 text-sm leading-6 text-muted-foreground">
 {rel.description}
 </p>
 </div>
 </Link>
 ))}
 </div>
 </section>
 )}
 {calc.sources && calc.sources.length > 0 && (
 <section className="ms-surface ms-panel mb-6" aria-labelledby={`${fieldIdPrefix}sources-heading`}>
 <h2 id={`${fieldIdPrefix}sources-heading`} className="mb-3 text-xl font-bold text-foreground">공식 계산방법 참고</h2>
 <p className="mb-4 text-sm leading-6 text-muted-foreground">계산에 사용한 개념과 기준을 원문에서 확인할 수 있습니다.</p>
 <ul className="space-y-3">
 {calc.sources.map((source) => (
 <li key={source.url}>
 <a href={source.url} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-11 items-center gap-2 text-sm font-medium text-link underline underline-offset-4">
 {source.title}<span className="sr-only"> (새 창)</span><ArrowRight className="h-4 w-4 shrink-0" aria-hidden="true" />
 </a>
 </li>
 ))}
 </ul>
 </section>
 )}
 </div>
 </div>
 );
}
