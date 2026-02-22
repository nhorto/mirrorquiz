"use client";

import { LikertScale, LikertLabels } from "./likert-scale";

interface QuestionCardProps {
  index: number;
  category: string;
  text: string;
  value: number | null;
  onChange: (value: number) => void;
}

const categoryColors: Record<string, string> = {
  openness: "bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-300",
  conscientiousness: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300",
  extraversion: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300",
  agreeableness: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300",
  "emotional-stability": "bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300",
  empathy: "bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-300",
};

function formatCategory(cat: string): string {
  return cat
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

export function QuestionCard({
  index,
  category,
  text,
  value,
  onChange,
}: QuestionCardProps) {
  return (
    <div className="rounded-xl border border-border bg-card p-6">
      <div className="flex items-center gap-3">
        <span className="text-sm font-medium text-muted-foreground">
          {index + 1}/12
        </span>
        <span
          className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
            categoryColors[category] ?? "bg-muted text-muted-foreground"
          }`}
        >
          {formatCategory(category)}
        </span>
      </div>
      <p className="mt-3 text-lg font-medium">{text}</p>
      <div className="mt-5 space-y-2">
        <LikertScale value={value} onChange={onChange} />
        <LikertLabels />
      </div>
    </div>
  );
}
