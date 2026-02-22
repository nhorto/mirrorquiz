"use client";

interface MatchPercentageProps {
  percentage: number;
}

export function MatchPercentage({ percentage }: MatchPercentageProps) {
  const circumference = 2 * Math.PI * 70;
  const offset = circumference - (percentage / 100) * circumference;

  let color: string;
  let label: string;
  if (percentage >= 80) {
    color = "text-emerald-500";
    label = "Strong alignment";
  } else if (percentage >= 60) {
    color = "text-blue-500";
    label = "Good alignment";
  } else if (percentage >= 40) {
    color = "text-amber-500";
    label = "Moderate gap";
  } else {
    color = "text-rose-500";
    label = "Significant gap";
  }

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="relative h-44 w-44">
        <svg className="h-full w-full -rotate-90" viewBox="0 0 160 160">
          <circle
            cx="80"
            cy="80"
            r="70"
            fill="none"
            stroke="hsl(var(--border))"
            strokeWidth="10"
          />
          <circle
            cx="80"
            cy="80"
            r="70"
            fill="none"
            className={color.replace("text-", "stroke-")}
            strokeWidth="10"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className={`text-4xl font-bold ${color}`}>
            {Math.round(percentage)}%
          </span>
          <span className="text-xs text-muted-foreground">match</span>
        </div>
      </div>
      <p className="text-sm font-medium text-muted-foreground">{label}</p>
    </div>
  );
}
