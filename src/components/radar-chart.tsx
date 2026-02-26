"use client";

import {
  RadarChart as RechartsRadar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  Legend,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import type { CategoryComparison } from "@/lib/analysis";

function formatCategory(cat: string): string {
  return cat
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

interface RadarChartProps {
  categories: CategoryComparison[];
  blurred?: boolean;
}

export function PerceptionRadarChart({ categories, blurred = false }: RadarChartProps) {
  const data = categories.map((c) => ({
    category: formatCategory(c.category),
    self: c.selfAvg,
    friends: c.friendsAvg,
  }));

  return (
    <div className="relative">
      <div className={`h-[400px] w-full ${blurred ? "blur-md select-none pointer-events-none" : ""}`}>
        <ResponsiveContainer width="100%" height="100%">
          <RechartsRadar cx="50%" cy="50%" outerRadius="80%" data={data}>
            <PolarGrid stroke="hsl(var(--border))" />
            <PolarAngleAxis
              dataKey="category"
              tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }}
            />
            <PolarRadiusAxis
              angle={90}
              domain={[0, 5]}
              tick={blurred ? false : { fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
              tickCount={6}
            />
            <Radar
              name="You"
              dataKey="self"
              stroke="oklch(0.553 0.215 280)"
              fill="oklch(0.553 0.215 280)"
              fillOpacity={0.2}
              strokeWidth={2}
            />
            <Radar
              name="Friends"
              dataKey="friends"
              stroke="oklch(0.592 0.249 328)"
              fill="oklch(0.592 0.249 328)"
              fillOpacity={0.2}
              strokeWidth={2}
            />
            {!blurred && <Legend />}
            {!blurred && <Tooltip />}
          </RechartsRadar>
        </ResponsiveContainer>
      </div>

      {blurred && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="rounded-2xl bg-background/80 backdrop-blur-sm px-6 py-4 text-center shadow-lg border border-border">
            <svg className="mx-auto h-8 w-8 text-violet" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
            </svg>
            <p className="mt-2 text-sm font-semibold">Unlock to see details</p>
          </div>
        </div>
      )}
    </div>
  );
}
