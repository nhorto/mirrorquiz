"use client";

import type { CategoryComparison } from "@/lib/analysis";
import { getCategoryInsight } from "@/lib/insights";

function formatCategory(cat: string): string {
  return cat
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

interface CategoryBreakdownProps {
  categories: CategoryComparison[];
}

export function CategoryBreakdown({ categories }: CategoryBreakdownProps) {
  return (
    <div className="space-y-4">
      {categories.map((cat) => (
        <div
          key={cat.category}
          className="rounded-xl border border-border bg-card p-5"
        >
          <h4 className="font-semibold">{formatCategory(cat.category)}</h4>
          <div className="mt-3 flex items-center gap-6">
            <ScoreBar label="You" score={cat.selfAvg} color="bg-primary" />
            <ScoreBar label="Friends" score={cat.friendsAvg} color="bg-blue-500" />
          </div>
          <p className="mt-3 text-sm text-muted-foreground">
            {getCategoryInsight(cat)}
          </p>
        </div>
      ))}
    </div>
  );
}

function ScoreBar({
  label,
  score,
  color,
}: {
  label: string;
  score: number;
  color: string;
}) {
  const widthPercent = (score / 5) * 100;

  return (
    <div className="flex-1">
      <div className="flex items-baseline justify-between text-sm">
        <span className="text-muted-foreground">{label}</span>
        <span className="font-medium">{score.toFixed(1)}</span>
      </div>
      <div className="mt-1 h-2 overflow-hidden rounded-full bg-muted">
        <div
          className={`h-full rounded-full ${color}`}
          style={{ width: `${widthPercent}%` }}
        />
      </div>
    </div>
  );
}
