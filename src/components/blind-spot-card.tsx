import type { BlindSpot } from "@/lib/insights";
import { getBlindSpotDetail, formatCategory } from "@/lib/insights";

interface BlindSpotCardProps {
  insight: BlindSpot;
  /** LLM-written "what to do with this" advice; falls back to the rule-based reflection. */
  advice?: string;
}

export function BlindSpotCard({ insight, advice }: BlindSpotCardProps) {
  const detail = getBlindSpotDetail(insight);

  return (
    <div className="overflow-hidden rounded-2xl border border-rose-200 bg-card shadow-sm dark:border-rose-900">
      <div className="border-l-4 border-rose-500 p-5">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-rose-100 dark:bg-rose-900/40">
            <span className="text-base">🔍</span>
          </div>
          <span className="text-xs font-bold uppercase tracking-wider text-rose-700 dark:text-rose-300">
            Blind Spot &middot; {formatCategory(insight.category)}
          </span>
        </div>
        <p className="mt-3 text-base font-semibold text-foreground">
          &ldquo;{insight.textSelf}&rdquo;
        </p>
        <div className="mt-3 flex gap-4 text-sm">
          <div className="flex items-center gap-1.5">
            <div className="h-2.5 w-2.5 rounded-full bg-violet" />
            <span className="text-muted-foreground">You: </span>
            <span className="font-bold text-foreground">{insight.selfScore}/5</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="h-2.5 w-2.5 rounded-full bg-fuchsia" />
            <span className="text-muted-foreground">Friends: </span>
            <span className="font-bold text-foreground">{insight.friendsAvg.toFixed(1)}/5</span>
          </div>
        </div>

        <p className="mt-4 text-sm leading-relaxed text-foreground">
          {detail.explanation}
        </p>

        <div className="mt-4 rounded-xl bg-rose-50 p-4 dark:bg-rose-950/40">
          <p className="mb-1.5 text-xs font-bold uppercase tracking-wider text-rose-700 dark:text-rose-300">
            {advice ? "What to do with this" : "Reflect"}
          </p>
          <p className="text-sm leading-relaxed text-foreground/90">
            {advice ?? detail.reflection}
          </p>
        </div>
      </div>
    </div>
  );
}
