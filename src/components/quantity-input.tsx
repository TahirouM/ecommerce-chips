"use client";

export function QuantityInput({
  value,
  max,
  onChange,
}: {
  value: number;
  max: number;
  onChange: (value: number) => void;
}) {
  const btn = "h-full w-10 text-xl font-bold hover:bg-primary disabled:opacity-30 disabled:hover:bg-transparent";
  return (
    <div className="flex h-12 items-center overflow-hidden rounded-full border-2 border-foreground bg-surface">
      <button className={btn} onClick={() => onChange(value - 1)} disabled={value <= 1} aria-label="Diminuer">
        −
      </button>
      <span className="w-7 text-center font-bold tabular-nums" aria-live="polite">
        {value}
      </span>
      <button className={btn} onClick={() => onChange(value + 1)} disabled={value >= max} aria-label="Augmenter">
        +
      </button>
    </div>
  );
}
