import { ImageResponse } from "next/og";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { drizzle } from "drizzle-orm/d1";
import { eq, and } from "drizzle-orm";
import * as schema from "@/db/schema";
import { getSession } from "@/lib/session";
import { getQuizAnalysis } from "@/lib/analysis";
import {
  findBlindSpots,
  findHiddenStrengths,
  formatCategory,
} from "@/lib/insights";

const W = 1080;
const H = 1350;

const VIOLET = "#8b5cf6";
const FUCHSIA = "#d946ef";

interface RadarSeries {
  values: number[]; // 0..5, one per category
  color: string;
}

/** Points for a polygon of `values` around (cx, cy) with max radius r. */
function polygonPoints(
  values: number[],
  cx: number,
  cy: number,
  r: number
): string {
  const n = values.length;
  return values
    .map((v, i) => {
      const angle = (2 * Math.PI * i) / n - Math.PI / 2;
      const radius = (v / 5) * r;
      const x = cx + radius * Math.cos(angle);
      const y = cy + radius * Math.sin(angle);
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");
}

function radarSvg(categories: string[], series: RadarSeries[]): {
  svg: React.ReactElement;
  labels: Array<{ text: string; x: number; y: number }>;
} {
  const size = 560;
  const cx = size / 2;
  const cy = size / 2;
  const r = 200;
  const n = categories.length;

  const rings = [1, 2, 3, 4, 5].map((level) =>
    polygonPoints(new Array(n).fill(level), cx, cy, r)
  );

  const axes = categories.map((_, i) => {
    const angle = (2 * Math.PI * i) / n - Math.PI / 2;
    return {
      x2: cx + r * Math.cos(angle),
      y2: cy + r * Math.sin(angle),
    };
  });

  const labels = categories.map((cat, i) => {
    const angle = (2 * Math.PI * i) / n - Math.PI / 2;
    const radius = r + 46;
    return {
      text: cat,
      x: cx + radius * Math.cos(angle),
      y: cy + radius * Math.sin(angle),
    };
  });

  const svg = (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      {rings.map((points, i) => (
        <polygon
          key={`ring-${i}`}
          points={points}
          fill="none"
          stroke="rgba(255,255,255,0.14)"
          strokeWidth={1.5}
        />
      ))}
      {axes.map((a, i) => (
        <line
          key={`axis-${i}`}
          x1={cx}
          y1={cy}
          x2={a.x2}
          y2={a.y2}
          stroke="rgba(255,255,255,0.14)"
          strokeWidth={1.5}
        />
      ))}
      {series.map((s, i) => (
        <polygon
          key={`series-${i}`}
          points={polygonPoints(s.values, cx, cy, r)}
          fill={s.color}
          fillOpacity={0.3}
          stroke={s.color}
          strokeWidth={4}
        />
      ))}
    </svg>
  );

  return { svg, labels };
}

export async function GET(request: Request) {
  const session = await getSession();
  if (!session) {
    return new Response("Unauthorized", { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const quizId = searchParams.get("quizId");
  if (!quizId) {
    return new Response("Missing quizId", { status: 400 });
  }

  const { env } = await getCloudflareContext({ async: true });
  const db = drizzle(env.DB, { schema });

  // Only the quiz owner can render their share card
  const quizRows = await db
    .select({ slug: schema.quizzes.slug, responseCount: schema.quizzes.responseCount })
    .from(schema.quizzes)
    .where(
      and(eq(schema.quizzes.id, quizId), eq(schema.quizzes.userId, session.user.id))
    )
    .limit(1);
  const quiz = quizRows[0];
  if (!quiz) {
    return new Response("Not found", { status: 404 });
  }

  // Cache per quiz + response count so the card refreshes as answers arrive
  const cacheKey = `share:${quizId}:${quiz.responseCount}`;
  try {
    const cached = await env.OG_CACHE.get(cacheKey, "arrayBuffer");
    if (cached) {
      return new Response(cached, {
        headers: { "Content-Type": "image/png", "Cache-Control": "private, max-age=3600" },
      });
    }
  } catch {
    // KV unavailable — generate fresh
  }

  const analysis = await getQuizAnalysis(quizId);
  if (!analysis || analysis.responseCount === 0) {
    return new Response("No responses yet", { status: 400 });
  }

  const name = session.user.name?.trim().split(/\s+/)[0] ?? "me";
  const categories = analysis.categories.map((c) => formatCategory(c.category));
  const { svg, labels } = radarSvg(categories, [
    { values: analysis.categories.map((c) => c.selfAvg), color: VIOLET },
    { values: analysis.categories.map((c) => c.friendsAvg), color: FUCHSIA },
  ]);

  // One teaser insight — the single biggest self-vs-friends gap
  const hiddenStrengths = findHiddenStrengths(analysis.questions);
  const blindSpots = findBlindSpots(analysis.questions);
  let teaser = "My friends see me differently than I see myself.";
  if (
    hiddenStrengths.length > 0 &&
    (blindSpots.length === 0 || hiddenStrengths[0]!.gap >= blindSpots[0]!.gap)
  ) {
    teaser = `My friends rate my ${formatCategory(hiddenStrengths[0]!.category)} way higher than I do 👀`;
  } else if (blindSpots.length > 0) {
    teaser = `Turns out my ${formatCategory(blindSpots[0]!.category)} isn't landing the way I thought…`;
  }

  const quizUrl = `mirrorquiz.com/quiz/${quiz.slug}`;

  const image = new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          background: "linear-gradient(160deg, #1a1025 0%, #0d0d0d 55%, #150d1e 100%)",
          fontFamily: "sans-serif",
          padding: "56px 48px",
          position: "relative",
        }}
      >
        {/* Glow blobs */}
        <div
          style={{
            position: "absolute",
            top: "-120px",
            left: "-120px",
            width: "480px",
            height: "480px",
            borderRadius: "50%",
            background: "rgba(139, 92, 246, 0.22)",
            filter: "blur(90px)",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: "-120px",
            right: "-120px",
            width: "480px",
            height: "480px",
            borderRadius: "50%",
            background: "rgba(217, 70, 239, 0.22)",
            filter: "blur(90px)",
          }}
        />

        {/* Logo */}
        <div style={{ display: "flex", fontSize: "34px", fontWeight: 700, color: "#e4e4e7" }}>
          Mirror
          <span
            style={{
              background: `linear-gradient(135deg, ${VIOLET}, ${FUCHSIA})`,
              backgroundClip: "text",
              color: "transparent",
            }}
          >
            Quiz
          </span>
        </div>

        {/* Headline */}
        <div
          style={{
            marginTop: "26px",
            fontSize: "52px",
            fontWeight: 800,
            color: "#fafafa",
            textAlign: "center",
            lineHeight: 1.15,
            letterSpacing: "-0.02em",
            display: "flex",
          }}
        >
          How {analysis.responseCount} friend{analysis.responseCount !== 1 ? "s" : ""} really see {name}
        </div>

        {/* Match badge */}
        <div
          style={{
            marginTop: "22px",
            display: "flex",
            alignItems: "center",
            gap: "14px",
            background: "rgba(139, 92, 246, 0.14)",
            border: "2px solid rgba(139, 92, 246, 0.45)",
            borderRadius: "9999px",
            padding: "12px 32px",
          }}
        >
          <span
            style={{
              fontSize: "44px",
              fontWeight: 800,
              background: `linear-gradient(135deg, ${VIOLET}, ${FUCHSIA})`,
              backgroundClip: "text",
              color: "transparent",
            }}
          >
            {Math.round(analysis.matchPercentage)}%
          </span>
          <span style={{ fontSize: "26px", color: "#d4d4d8" }}>
            self-image match
          </span>
        </div>

        {/* Radar with labels */}
        <div style={{ position: "relative", display: "flex", marginTop: "10px" }}>
          {svg}
          {labels.map((l, i) => (
            <div
              key={i}
              style={{
                position: "absolute",
                left: `${l.x}px`,
                top: `${l.y}px`,
                transform: "translate(-50%, -50%)",
                fontSize: "22px",
                fontWeight: 700,
                color: "#e4e4e7",
                whiteSpace: "nowrap",
                display: "flex",
              }}
            >
              {l.text}
            </div>
          ))}
        </div>

        {/* Legend */}
        <div style={{ display: "flex", gap: "36px", marginTop: "6px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div style={{ width: "18px", height: "18px", borderRadius: "50%", background: VIOLET, display: "flex" }} />
            <span style={{ fontSize: "24px", color: "#d4d4d8" }}>How I see me</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div style={{ width: "18px", height: "18px", borderRadius: "50%", background: FUCHSIA, display: "flex" }} />
            <span style={{ fontSize: "24px", color: "#d4d4d8" }}>How they see me</span>
          </div>
        </div>

        {/* Teaser insight */}
        <div
          style={{
            marginTop: "34px",
            fontSize: "32px",
            fontWeight: 600,
            fontStyle: "italic",
            color: "#fafafa",
            textAlign: "center",
            maxWidth: "860px",
            lineHeight: 1.35,
            display: "flex",
          }}
        >
          “{teaser}”
        </div>

        {/* Footer CTA */}
        <div
          style={{
            marginTop: "auto",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "10px",
          }}
        >
          <div style={{ fontSize: "26px", color: "#a1a1aa", display: "flex" }}>
            How well do YOU know me? Rate me anonymously:
          </div>
          <div
            style={{
              fontSize: "34px",
              fontWeight: 800,
              background: `linear-gradient(135deg, ${VIOLET}, ${FUCHSIA})`,
              backgroundClip: "text",
              color: "transparent",
              display: "flex",
            }}
          >
            {quizUrl}
          </div>
        </div>
      </div>
    ),
    { width: W, height: H }
  );

  // Buffer once (avoids Response.clone() tee stalls in workerd), cache
  // best-effort, and serve the buffer directly.
  const buffer = await image.arrayBuffer();
  try {
    await env.OG_CACHE.put(cacheKey, buffer, { expirationTtl: 86400 });
  } catch {
    // fine — regenerate next time
  }

  return new Response(buffer, {
    headers: { "Content-Type": "image/png", "Cache-Control": "private, max-age=3600" },
  });
}
