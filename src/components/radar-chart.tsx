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
}

export function PerceptionRadarChart({ categories }: RadarChartProps) {
  const data = categories.map((c) => ({
    category: formatCategory(c.category),
    self: c.selfAvg,
    friends: c.friendsAvg,
  }));

  return (
    <div className="h-[400px] w-full">
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
            tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
            tickCount={6}
          />
          <Radar
            name="You"
            dataKey="self"
            stroke="hsl(var(--primary))"
            fill="hsl(var(--primary))"
            fillOpacity={0.15}
            strokeWidth={2}
          />
          <Radar
            name="Friends"
            dataKey="friends"
            stroke="hsl(220 70% 55%)"
            fill="hsl(220 70% 55%)"
            fillOpacity={0.15}
            strokeWidth={2}
          />
          <Legend />
          <Tooltip />
        </RechartsRadar>
      </ResponsiveContainer>
    </div>
  );
}
