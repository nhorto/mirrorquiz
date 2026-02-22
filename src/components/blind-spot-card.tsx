import type { BlindSpot } from "@/lib/insights";

function formatCategory(cat: string): string {
  return cat
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

interface BlindSpotCardProps {
  insight: BlindSpot;
}

export function BlindSpotCard({ insight }: BlindSpotCardProps) {
  return (
    <div className="rounded-xl border border-amber-200 bg-amber-50 p-5 dark:border-amber-800 dark:bg-amber-950/30">
      <div className="flex items-center gap-2">
        <span className="text-lg">🔍</span>
        <span className="text-xs font-medium text-amber-700 dark:text-amber-300">
          Blind Spot &middot; {formatCategory(insight.category)}
        </span>
      </div>
      <p className="mt-2 font-medium">&ldquo;{insight.textSelf}&rdquo;</p>
      <div className="mt-3 flex gap-4 text-sm">
        <div>
          <span className="text-muted-foreground">You rated: </span>
          <span className="font-semibold">{insight.selfScore}/5</span>
        </div>
        <div>
          <span className="text-muted-foreground">Friends avg: </span>
          <span className="font-semibold">{insight.friendsAvg.toFixed(1)}/5</span>
        </div>
      </div>
      <p className="mt-2 text-sm text-muted-foreground">
        You see yourself as stronger here than your friends do. This is a
        potential blind spot worth reflecting on.
      </p>
    </div>
  );
}
