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
  const answered = value !== null;

  return (
    <div
      className={`animate-fade-in-up rounded-2xl border bg-card p-6 transition-all duration-300 ${
        answered
          ? "border-violet/30 shadow-sm"
          : "border-border hover:border-violet/20 hover:shadow-md"
      }`}
    >
      <div className="flex items-center gap-3">
        <span
          className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold transition-colors duration-300 ${
            answered ? "gradient-brand text-white" : "bg-muted text-muted-foreground"
          }`}
        >
          {answered ? (
            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          ) : (
            index + 1
          )}
        </span>
        <span
          className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
            categoryColors[category] ?? "bg-muted text-muted-foreground"
          }`}
        >
          {formatCategory(category)}
        </span>
      </div>
      <p className="mt-3 text-lg font-medium leading-snug">{text}</p>
      <div className="mt-5 space-y-2">
        <LikertScale value={value} onChange={onChange} />
        <LikertLabels />
      </div>
    </div>
  );
}
