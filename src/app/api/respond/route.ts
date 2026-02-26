import { NextResponse } from "next/server";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { drizzle } from "drizzle-orm/d1";
import { eq, and, sql } from "drizzle-orm";
import { nanoid } from "nanoid";
import * as schema from "@/db/schema";
import { getOrCreateRespondentToken } from "@/lib/respondent-token";
import { notifyNewResponse } from "@/lib/notifications";
import { checkRateLimit, isRateLimitConfigured } from "@/lib/rate-limit";

async function hashIp(ip: string, ua: string): Promise<string> {
  const data = new TextEncoder().encode(`${ip}:${ua}`);
  const hash = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(hash))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export async function POST(request: Request) {
  // Rate limit friend responses (10 per hour per IP) — fail-secure in prod, skip in dev
  const { env: rlEnv } = await getCloudflareContext({ async: true });
  const isProduction = rlEnv.ENVIRONMENT === "production";
  if (isRateLimitConfigured(rlEnv)) {
    const ip =
      request.headers.get("cf-connecting-ip") ??
      request.headers.get("x-forwarded-for") ??
      "unknown";
    const result = await checkRateLimit(
      "friendResponse",
      ip,
      rlEnv.UPSTASH_REDIS_REST_URL!,
      rlEnv.UPSTASH_REDIS_REST_TOKEN!
    );
    if (!result.success) {
      return NextResponse.json(
        { error: "Too many responses. Try again later." },
        { status: 429 }
      );
    }
  } else if (isProduction) {
    return NextResponse.json(
      { error: "Service temporarily unavailable" },
      { status: 503 }
    );
  }

  const body = await request.json();
  const { quizId, displayName, responses } = body as {
    quizId: string;
    displayName?: string;
    responses: Array<{ questionId: string; score: number }>;
  };

  // Validate input
  if (!quizId) {
    return NextResponse.json({ error: "Missing quizId" }, { status: 400 });
  }

  if (!responses || !Array.isArray(responses) || responses.length !== 12) {
    return NextResponse.json(
      { error: "Must answer all 12 questions" },
      { status: 400 }
    );
  }

  for (const r of responses) {
    if (
      !r.questionId ||
      typeof r.score !== "number" ||
      !Number.isInteger(r.score) ||
      r.score < 1 ||
      r.score > 5
    ) {
      return NextResponse.json(
        { error: "Invalid response: scores must be integers 1-5" },
        { status: 400 }
      );
    }
  }

  const browserToken = await getOrCreateRespondentToken();

  // Compute IP+UA hash for dedup across browsers/devices
  const ip =
    request.headers.get("cf-connecting-ip") ??
    request.headers.get("x-forwarded-for") ??
    "unknown";
  const ua = request.headers.get("user-agent") ?? "unknown";
  const rawHash = await hashIp(ip, ua);

  const { env } = await getCloudflareContext({ async: true });
  const db = drizzle(env.DB, { schema });

  // In dev, randomize the IP hash so multiple submissions work from one machine
  const ipUaHash = env.ENVIRONMENT === "production" ? rawHash : `${rawHash}-${nanoid(8)}`;

  // Verify quiz exists
  const quizResults = await db
    .select({ id: schema.quizzes.id, slug: schema.quizzes.slug })
    .from(schema.quizzes)
    .where(eq(schema.quizzes.id, quizId))
    .limit(1);

  if (quizResults.length === 0) {
    return NextResponse.json({ error: "Quiz not found" }, { status: 404 });
  }

  // Check for duplicate submission (same browser token OR same IP+UA hash)
  const existingByToken = await db
    .select({ id: schema.respondents.id })
    .from(schema.respondents)
    .where(
      and(
        eq(schema.respondents.quizId, quizId),
        eq(schema.respondents.browserToken, browserToken)
      )
    )
    .limit(1);

  if (existingByToken.length > 0) {
    return NextResponse.json(
      { error: "You've already responded to this quiz" },
      { status: 409 }
    );
  }

  // In dev, skip IP hash check so you can submit multiple responses from one machine
  if (isProduction) {
    const existingByIp = await db
      .select({ id: schema.respondents.id })
      .from(schema.respondents)
      .where(
        and(
          eq(schema.respondents.quizId, quizId),
          eq(schema.respondents.ipHash, ipUaHash)
        )
      )
      .limit(1);

    if (existingByIp.length > 0) {
      return NextResponse.json(
        { error: "A response from this device has already been submitted" },
        { status: 409 }
      );
    }
  }

  // Insert respondent
  const respondentId = nanoid(21);
  await db.insert(schema.respondents).values({
    id: respondentId,
    quizId,
    displayName: displayName?.trim().slice(0, 50) || null,
    browserToken,
    ipHash: ipUaHash,
  });

  // Insert friend responses
  await db.insert(schema.friendResponses).values(
    responses.map((r) => ({
      id: nanoid(21),
      quizId,
      respondentId,
      questionId: r.questionId,
      score: r.score,
    }))
  );

  // Increment response count
  await db
    .update(schema.quizzes)
    .set({
      responseCount: sql`${schema.quizzes.responseCount} + 1`,
    })
    .where(eq(schema.quizzes.id, quizId));

  // Get new count for notification
  const updated = await db
    .select({ responseCount: schema.quizzes.responseCount })
    .from(schema.quizzes)
    .where(eq(schema.quizzes.id, quizId))
    .limit(1);

  const newCount = updated[0]?.responseCount ?? 0;

  // Send notification (fire-and-forget, don't block the response)
  notifyNewResponse(
    {
      db: db as any,
      resendApiKey: env.RESEND_API_KEY,
      appUrl: env.APP_URL ?? "http://localhost:3000",
    },
    quizId,
    newCount
  ).catch((err) => console.error("Notification error:", err));

  return NextResponse.json({
    success: true,
    slug: quizResults[0]!.slug,
  });
}
