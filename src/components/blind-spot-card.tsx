import type { BlindSpot } from "@/lib/insights";
import { getBlindSpotDetail, formatCategory } from "@/lib/insights";

interface BlindSpotCardProps {
  insight: BlindSpot;
}

export function BlindSpotCard({ insight }: BlindSpotCardProps) {
  const detail = getBlindSpotDetail(insight);

  return (
    <div className="rounded-2xl border border-rose/20 bg-rose/5 p-5">
      <div className="flex items-center gap-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-rose/10">
          <span className="text-base">🔍</span>
        </div>
        <span className="text-xs font-semibold text-rose uppercase tracking-wider">
          Blind Spot &middot; {formatCategory(insight.category)}
        </span>
      </div>
      <p className="mt-3 text-base font-semibold">&ldquo;{insight.textSelf}&rdquo;</p>
      <div className="mt-3 flex gap-4 text-sm">
        <div className="flex items-center gap-1.5">
          <div className="h-2.5 w-2.5 rounded-full bg-violet" />
          <span className="text-muted-foreground">You: </span>
          <span className="font-bold">{insight.selfScore}/5</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="h-2.5 w-2.5 rounded-full bg-fuchsia" />
          <span className="text-muted-foreground">Friends: </span>
          <span className="font-bold">{insight.friendsAvg.toFixed(1)}/5</span>
        </div>
      </div>

      <p className="mt-4 text-sm text-foreground/80 leading-relaxed">
        {detail.explanation}
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
}
