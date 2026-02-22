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
            "flex h-12 w-12 items-center justify-center rounded-full border-2 text-sm font-semibold transition-all",
            value === score
              ? "border-primary bg-primary text-primary-foreground scale-110"
              : "border-border bg-card text-muted-foreground hover:border-primary/50 hover:text-foreground",
            disabled && "cursor-not-allowed opacity-50"
          )}
          title={labels[score - 1]}
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
