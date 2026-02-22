import type { HiddenStrength } from "@/lib/insights";

function formatCategory(cat: string): string {
  return cat
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

interface HiddenStrengthCardProps {
  insight: HiddenStrength;
}

export function HiddenStrengthCard({ insight }: HiddenStrengthCardProps) {
  return (
    <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-5 dark:border-emerald-800 dark:bg-emerald-950/30">
      <div className="flex items-center gap-2">
        <span className="text-lg">💎</span>
        <span className="text-xs font-medium text-emerald-700 dark:text-emerald-300">
          Hidden Strength &middot; {formatCategory(insight.category)}
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
        Your friends see this quality in you more than you recognize it yourself.
        Own it — this is a genuine strength!
      </p>
    </div>
  );
}
