"use client";

import { useEffect, useState } from "react";

interface MatchPercentageProps {
  percentage: number;
}

export function MatchPercentage({ percentage }: MatchPercentageProps) {
  const circumference = 2 * Math.PI * 70;

  // Animate the ring from 0 to the real value on mount
  const [progress, setProgress] = useState(0);
  useEffect(() => {
    const raf = requestAnimationFrame(() => setProgress(percentage));
    return () => cancelAnimationFrame(raf);
  }, [percentage]);

  const offset = circumference - (progress / 100) * circumference;

  let label: string;
  if (percentage >= 80) {
    label = "Strong alignment";
  } else if (percentage >= 60) {
    label = "Good alignment";
  } else if (percentage >= 40) {
    label = "Moderate gap";
  } else {
    label = "Significant gap";
  }

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="relative h-44 w-44">
        <svg className="h-full w-full -rotate-90" viewBox="0 0 160 160">
          <defs>
            <linearGradient id="matchGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="oklch(0.553 0.215 280)" />
              <stop offset="100%" stopColor="oklch(0.592 0.249 328)" />
            </linearGradient>
          </defs>
          <circle
            cx="80"
            cy="80"
            r="70"
            fill="none"
            stroke="var(--muted)"
            strokeWidth="10"
          />
          <circle
            cx="80"
            cy="80"
            r="70"
            fill="none"
            stroke="url(#matchGradient)"
            strokeWidth="10"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            style={{ transition: "stroke-dashoffset 1.2s ease-out" }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="gradient-brand-text text-4xl font-extrabold">
            {Math.round(percentage)}%
          </span>
          <span className="text-xs text-muted-foreground">match</span>
        </div>
      </div>
      <p className="text-sm font-medium text-muted-foreground">{label}</p>
    </div>
  );
}
