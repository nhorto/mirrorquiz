"use client";

import { cn } from "@/lib/utils";

const labels = [
  "Strongly Disagree",
  "Disagree",
  "Neutral",
  "Agree",
  "Strongly Agree",
];

interface LikertScaleProps {
  value: number | null;
  onChange: (value: number) => void;
  disabled?: boolean;
}

export function LikertScale({ value, onChange, disabled }: LikertScaleProps) {
  return (
    <div className="flex items-center justify-between gap-2">
      {[1, 2, 3, 4, 5].map((score) => (
        <button
          key={score}
          type="button"
          disabled={disabled}
          onClick={() => onChange(score)}
          className={cn(
            "flex h-12 w-12 items-center justify-center rounded-full border-2 text-sm font-semibold transition-all duration-150 active:scale-95",
            value === score
              ? "gradient-brand animate-pop border-transparent text-white shadow-md shadow-violet/30"
              : "border-border bg-card text-muted-foreground hover:-translate-y-0.5 hover:border-violet/50 hover:text-foreground hover:shadow-sm",
            disabled && "cursor-not-allowed opacity-50"
          )}
          title={labels[score - 1]}
          aria-label={labels[score - 1]}
          aria-pressed={value === score}
        >
          {score}
        </button>
      ))}
    </div>
  );
}

export function LikertLabels() {
  return (
    <div className="flex justify-between text-xs text-muted-foreground">
      <span>Strongly Disagree</span>
      <span>Strongly Agree</span>
    </div>
  );
}
