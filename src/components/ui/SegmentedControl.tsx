"use client";

import { useId } from "react";

interface SegmentedControlProps<T extends string> {
  label: string;
  value: T;
  onChange: (value: T) => void;
  options: { value: T; label: string }[];
  description?: string;
}

export default function SegmentedControl<T extends string>({ label, value, onChange, options, description }: SegmentedControlProps<T>) {
  const id = useId();
  return <fieldset className="min-w-0" aria-describedby={description ? `${id}-description` : undefined}>
    <legend className="mb-2 text-sm font-semibold text-foreground">{label}</legend>
    <div className={`grid grid-cols-1 gap-2 ${options.length === 2 ? "sm:grid-cols-2" : "sm:grid-cols-3"}`}>
      {options.map(option => <label key={option.value} data-state={value === option.value ? "active" : "inactive"} className="ms-tab flex min-h-11 min-w-0 cursor-pointer items-center justify-start gap-2 rounded-lg px-3 py-3 text-sm sm:justify-center focus-within:outline focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-primary">
        <input type="radio" name={id} value={option.value} checked={value === option.value} onChange={() => onChange(option.value)} className="h-4 w-4 shrink-0 accent-primary" />
        <span>{option.label}</span>
      </label>)}
    </div>
    {description && <p id={`${id}-description`} className="mt-3 text-sm leading-6 text-muted-foreground">{description}</p>}
  </fieldset>;
}
