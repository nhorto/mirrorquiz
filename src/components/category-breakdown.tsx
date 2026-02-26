"use client";

import type { CategoryComparison } from "@/lib/analysis";
import { getCategoryInsightDetailed } from "@/lib/insights";

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
      {categories.map((cat) => {
        const detail = getCategoryInsightDetailed(cat);
        return (
          <div
            key={cat.category}
            className={`rounded-2xl border p-5 ${detail.colorClass}`}
          >
            <h4 className="text-lg font-bold">{formatCategory(cat.category)}</h4>
            <div className="mt-3 flex items-center gap-6">
              <ScoreBar label="You" score={cat.selfAvg} color="bg-violet" />
              <ScoreBar label="Friends" score={cat.friendsAvg} color="bg-fuchsia" />
            </div>
            <p className="mt-4 text-sm text-foreground/80 leading-relaxed">
              {detail.insight}
            </p>
            <div className="mt-3 rounded-xl bg-background/50 p-3">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">
                Reflect
              </p>
              <p className="text-sm text-muted-foreground italic">
                {detail.reflection}
              </p>
            </div>
          </div>
        );
      })}
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
        <span className="font-bold">{score.toFixed(1)}</span>
      </div>
      <div className="mt-1 h-2.5 overflow-hidden rounded-full bg-muted">
        <div
          className={`h-full rounded-full ${color} transition-all`}
          style={{ width: `${widthPercent}%` }}
        />
      </div>
    </div>
  );
}
