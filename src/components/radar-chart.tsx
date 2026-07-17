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

const VIOLET = "oklch(0.553 0.215 280)";
const FUCHSIA = "oklch(0.592 0.249 328)";

export function PerceptionRadarChart({ categories }: RadarChartProps) {
  const data = categories.map((c) => ({
    category: formatCategory(c.category),
    self: c.selfAvg,
    friends: c.friendsAvg,
  }));

  return (
    <div className="h-[420px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <RechartsRadar cx="50%" cy="50%" outerRadius="62%" data={data}>
          <PolarGrid stroke="var(--border)" strokeWidth={1} />
          <PolarAngleAxis
            dataKey="category"
            tick={{ fontSize: 11, fill: "var(--foreground)", fontWeight: 600 }}
          />
          <PolarRadiusAxis
            angle={90}
            domain={[0, 5]}
            tick={{ fontSize: 10, fill: "var(--muted-foreground)" }}
            tickCount={6}
            stroke="var(--border)"
          />
          <Radar
            name="You"
            dataKey="self"
            stroke={VIOLET}
            fill={VIOLET}
            fillOpacity={0.25}
            strokeWidth={2.5}
            dot={{ r: 3, fill: VIOLET, strokeWidth: 0 }}
            isAnimationActive
            animationDuration={900}
            animationEasing="ease-out"
          />
          <Radar
            name="Friends"
            dataKey="friends"
            stroke={FUCHSIA}
            fill={FUCHSIA}
            fillOpacity={0.25}
            strokeWidth={2.5}
            dot={{ r: 3, fill: FUCHSIA, strokeWidth: 0 }}
            isAnimationActive
            animationDuration={900}
            animationBegin={250}
            animationEasing="ease-out"
          />
          <Legend
            iconType="circle"
            wrapperStyle={{ fontSize: 14, fontWeight: 600, paddingTop: 8 }}
          />
          <Tooltip
            formatter={(value) => [Number(value).toFixed(1), undefined]}
            contentStyle={{
              borderRadius: 12,
              border: "1px solid var(--border)",
              background: "var(--card)",
              color: "var(--foreground)",
              fontSize: 13,
            }}
          />
        </RechartsRadar>
      </ResponsiveContainer>
    </div>
  );
}
