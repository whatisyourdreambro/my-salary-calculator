'use client';

import { useMemo, useState } from 'react';
import ResultSharePanel from '@/components/ResultSharePanel';
import { useCalculatorMeasurement } from '@/hooks/useCalculatorMeasurement';
import { ENGLISH_CURRENCIES, englishCurrencyDigits, formatEnglishMoney, getEnglishTool, isEnglishCurrency, type EnglishCurrency, type EnglishToolSlug } from '@/lib/englishTools';
import { ENGLISH_TOOL_DETAILS, calculateEnglishTool, englishToolFieldError, parseEnglishToolInputs, type EnglishToolMetric } from '@/lib/englishToolModels';

function displayMetric(metric: EnglishToolMetric, currency: EnglishCurrency) {
  if (typeof metric.value === 'string') return metric.value;
  if (metric.kind === 'money') return formatEnglishMoney(metric.value, currency);
  return `${metric.value.toLocaleString('en-US', { maximumFractionDigits: 3 })}${metric.kind === 'percent' ? '%' : ''}`;
}

function Calculator({ slug }: { slug: EnglishToolSlug }) {
  const tool = getEnglishTool(slug)!;
  const details = ENGLISH_TOOL_DETAILS[slug];
  const [currency, setCurrency] = useState<EnglishCurrency>('USD');
  const [currencyChanged, setCurrencyChanged] = useState(false);
  const [raw, setRaw] = useState<Record<string, string>>(() => Object.fromEntries(details.fields.map(field => [field.key, field.defaultValue])));
  const values = useMemo(() => parseEnglishToolInputs(slug, raw, currency), [slug, raw, currency]);
  const result = useMemo(() => values ? calculateEnglishTool(slug, values, currency) : null, [slug, values, currency]);
  const resultKey = useMemo(() => JSON.stringify([slug, currency, raw]), [slug, currency, raw]);
  const { inputProps, resultRef } = useCalculatorMeasurement({ calcType: `en-tool-${slug}`, valid: result !== null, resultKey, allowNegativeInput: true });
  const path = `/en/tools/${slug}`;
  const inputSummary = values ? details.fields.map(field => `${field.label}: ${field.kind === 'money' ? formatEnglishMoney(values[field.key], currency) : values[field.key].toLocaleString('en-US')}`).join('; ') : '';
  const resultSummary = result?.metrics.map(item => `${item.label}: ${displayMetric(item, currency)}`).join('; ') ?? '';

  return <div className="min-w-0 space-y-7" data-english-tool={slug}>
    <section aria-labelledby="tool-input-heading" className="rounded-2xl border border-border bg-background p-4 sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div><h2 id="tool-input-heading" className="text-xl font-bold">Your inputs</h2><p className="mt-2 text-sm text-muted-foreground">Starting values are examples. Edit them to explore your own scenario.</p></div>
        <div className="w-full sm:w-52">
          <label htmlFor="tool-currency" className="mb-2 block text-sm font-semibold">Display currency</label>
          <select id="tool-currency" value={currency} onChange={event => { if (isEnglishCurrency(event.target.value)) { setCurrency(event.target.value); setCurrencyChanged(true); } }} aria-describedby="tool-currency-help" className="min-h-11 w-full rounded-xl border border-border bg-background px-3 py-2 text-foreground">
            {ENGLISH_CURRENCIES.map(code => <option key={code} value={code}>{code}</option>)}
          </select>
        </div>
      </div>
      <p id="tool-currency-help" className="mt-3 text-sm text-muted-foreground">Use one currency for all amounts. Changing this label does not convert numbers or apply any country’s tax rules. {englishCurrencyDigits(currency) === 0 ? 'Enter whole amounts for KRW or JPY.' : 'Amounts may include up to two decimal places.'}</p>
      {currencyChanged && <p role="status" className="mt-2 text-sm font-medium">Currency changed to {currency}. Your numbers have not been converted; check each amount.</p>}
      <div {...inputProps} className="mt-6 grid grid-cols-1 gap-5 md:grid-cols-2">
        {details.fields.map(field => {
          const id = `english-tool-${field.key}`;
          const error = englishToolFieldError(field, raw[field.key], currency);
          return <div key={field.key} className="min-w-0">
            <label htmlFor={id} className="mb-2 block font-semibold">{field.label}{field.kind === 'money' ? ` (${currency})` : ''}</label>
            <input id={id} type="text" inputMode={field.precision === 0 || (field.kind === 'money' && englishCurrencyDigits(currency) === 0) ? 'numeric' : 'decimal'} autoComplete="off" maxLength={24} value={raw[field.key]} onChange={event => setRaw(previous => ({ ...previous, [field.key]: event.target.value }))} aria-invalid={!!error} aria-describedby={`${id}-help${error ? ` ${id}-error` : ''}`} className="min-h-12 w-full min-w-0 rounded-xl border border-border bg-background px-3 py-3 text-lg text-foreground tabular-nums focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary" />
            <p id={`${id}-help`} className="mt-2 text-sm text-muted-foreground">{field.help}</p>
            {error && <p id={`${id}-error`} className="mt-1 text-sm text-destructive">{error}</p>}
          </div>;
        })}
      </div>
    </section>

    {!result && <p role="status" className="rounded-xl border border-border bg-background p-4 text-sm">No current result. Check the highlighted fields. If all inputs are within range, reduce amounts, rates or time horizons to keep the result within the supported numeric range. Earlier results cannot be shared.</p>}
    {result && <section ref={resultRef} aria-labelledby="tool-result-heading" className="space-y-5 rounded-2xl border border-primary/30 bg-background p-4 sm:p-6" data-english-tool-result>
      <div><h2 id="tool-result-heading" className="text-xl font-bold">Your current scenario</h2><p className="mt-2 text-sm text-muted-foreground">Recalculated from the inputs above. Rounded display amounts may not reconcile exactly except where a rounding split is explicitly shown.</p></div>
      <dl className="grid min-w-0 grid-cols-1 gap-3 sm:grid-cols-2">
        {result.metrics.map(item => <div key={item.key} className="min-w-0 rounded-xl bg-canvas p-4 dark:bg-canvas-900">
          <dt className="text-sm text-muted-foreground">{item.label}</dt>
          <dd className="mt-2 break-words text-xl font-bold leading-snug tabular-nums sm:text-2xl" data-metric={item.key}>{displayMetric(item, currency)}</dd>
        </div>)}
      </dl>
      {result.explanations.length > 0 && <ul className="list-disc space-y-2 pl-5 text-sm text-muted-foreground">{result.explanations.map(text => <li key={text}>{text}</li>)}</ul>}
      <ResultSharePanel locale="en" resultKey={resultKey} pageUrl={`https://www.moneysalary.com${path}`} pageTitle={tool.title} pageDescription={tool.description} url={`https://www.moneysalary.com${path}`} title={`${tool.title} — my ${currency} scenario`} description={`${inputSummary}. ${resultSummary}. User-entered arithmetic assumptions; no automatic currency conversion or local tax calculation.`} previewDescription="This result text includes every entered amount and assumption shown below. Only approve it if you want other people to receive those details. The page link alone opens the calculator defaults; it does not recreate your scenario." contentType="calculator" />
    </section>}
  </div>;
}

/** A route change starts a fresh form and destroys any previous sharing approval. */
export default function EnglishToolCalculator({ slug }: { slug: EnglishToolSlug }) { return <Calculator key={slug} slug={slug} />; }
