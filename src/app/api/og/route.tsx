import { ImageResponse } from "next/og";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { drizzle } from "drizzle-orm/d1";
import { eq } from "drizzle-orm";
import * as schema from "@/db/schema";

export const runtime = "edge";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const slug = searchParams.get("slug");

  if (!slug) {
    return new Response("Missing slug", { status: 400 });
  }

  // Check KV cache first
  const { env } = await getCloudflareContext({ async: true });
  const cacheKey = `og:${slug}`;

  try {
    const cached = await env.OG_CACHE.get(cacheKey, "arrayBuffer");
    if (cached) {
      return new Response(cached, {
        headers: {
          "Content-Type": "image/png",
          "Cache-Control": "public, max-age=86400, s-maxage=86400",
        },
      });
    }
  } catch {
    // KV not available — skip cache
  }

  // Look up quiz creator name
  const db = drizzle(env.DB, { schema });
  const results = await db
    .select({ creatorName: schema.users.name })
    .from(schema.quizzes)
    .innerJoin(schema.users, eq(schema.quizzes.userId, schema.users.id))
    .where(eq(schema.quizzes.slug, slug))
    .limit(1);

  const name = results[0]?.creatorName ?? "someone";

  const image = new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #1a1025 0%, #0d0d0d 50%, #0d1117 100%)",
          fontFamily: "sans-serif",
        }}
      >
        {/* Decorative gradient circles */}
        <div
          style={{
            position: "absolute",
            top: "-80px",
            left: "-80px",
            width: "400px",
            height: "400px",
            borderRadius: "50%",
            background: "rgba(139, 92, 246, 0.15)",
            filter: "blur(80px)",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: "-80px",
            right: "-80px",
            width: "400px",
            height: "400px",
            borderRadius: "50%",
            background: "rgba(217, 70, 239, 0.15)",
            filter: "blur(80px)",
          }}
        />

        {/* Logo */}
        <div
          style={{
            display: "flex",
            fontSize: "28px",
            fontWeight: 700,
            color: "#e4e4e7",
            marginBottom: "40px",
            letterSpacing: "-0.02em",
          }}
        >
          Mirror
          <span
            style={{
              background: "linear-gradient(135deg, #8b5cf6, #d946ef)",
              backgroundClip: "text",
              color: "transparent",
            }}
          >
            Quiz
          </span>
        </div>

        {/* Main text */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            maxWidth: "800px",
            textAlign: "center",
          }}
        >
          <div
            style={{
              fontSize: "56px",
              fontWeight: 800,
              color: "#fafafa",
              lineHeight: 1.15,
              letterSpacing: "-0.03em",
            }}
          >
            How well do you know
          </div>
          <div
            style={{
              fontSize: "56px",
              fontWeight: 800,
              lineHeight: 1.15,
              letterSpacing: "-0.03em",
              background: "linear-gradient(135deg, #8b5cf6, #d946ef)",
              backgroundClip: "text",
              color: "transparent",
              marginTop: "4px",
            }}
          >
            {name}?
          </div>
        </div>

        {/* Subtitle */}
        <div
          style={{
            fontSize: "22px",
            color: "#a1a1aa",
            marginTop: "32px",
            maxWidth: "600px",
            textAlign: "center",
            lineHeight: 1.5,
          }}
        >
          2 minutes. 12 traits. 100% anonymous.
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  );

  // Cache the generated image in KV (best-effort)
  try {
    const buffer = await image.clone().arrayBuffer();
    await env.OG_CACHE.put(cacheKey, buffer, { expirationTtl: 86400 });
  } catch {
    // KV write failed — that's fine, we'll generate next time
  }

  return new Response(image.body, {
    headers: {
      "Content-Type": "image/png",
      "Cache-Control": "public, max-age=86400, s-maxage=86400",
    },
  });
}
