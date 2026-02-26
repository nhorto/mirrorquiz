import { NextResponse } from "next/server";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { drizzle } from "drizzle-orm/d1";
import { getSession } from "@/lib/session";
import { generateSlug, generateId } from "@/lib/slug";
import { checkRateLimit, isRateLimitConfigured } from "@/lib/rate-limit";
import * as schema from "@/db/schema";

export async function POST(request: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Rate limit quiz creation (5 per hour per user) — fail-secure in prod, skip in dev
  const { env: rlEnv } = await getCloudflareContext({ async: true });
  const isProduction = rlEnv.ENVIRONMENT === "production";
  if (isRateLimitConfigured(rlEnv)) {
    const result = await checkRateLimit(
      "quizCreation",
      session.user.id,
      rlEnv.UPSTASH_REDIS_REST_URL!,
      rlEnv.UPSTASH_REDIS_REST_TOKEN!
    );
    if (!result.success) {
      return NextResponse.json(
        { error: "Too many quizzes created. Try again later." },
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
  const { responses, questionSetId } = body as {
    responses: Array<{ questionId: string; score: number }>;
    questionSetId: string;
  };

  // Validate
  if (!questionSetId) {
    return NextResponse.json(
      { error: "Missing questionSetId" },
      { status: 400 }
    );
  }

  if (!responses || !Array.isArray(responses) || responses.length !== 12) {
    return NextResponse.json(
      { error: "Must answer all 12 questions" },
      { status: 400 }
    );
  }

  for (const r of responses) {
    if (!r.questionId || typeof r.score !== "number" || r.score < 1 || r.score > 5) {
      return NextResponse.json(
        { error: "Invalid response: scores must be integers 1-5" },
        { status: 400 }
      );
    }
  }

  const { env } = await getCloudflareContext({ async: true });
  const db = drizzle(env.DB, { schema });

  const quizId = generateId();
  const slug = generateSlug(session.user.name);

  // Insert quiz
  const userName = session.user.name ?? session.user.email?.split("@")[0] ?? "My";
  await db.insert(schema.quizzes).values({
    id: quizId,
    userId: session.user.id,
    questionSetId,
    slug,
    title: `${userName}'s Quiz`,
  });

  // Insert self-responses
  await db.insert(schema.selfResponses).values(
    responses.map((r) => ({
      id: generateId(),
      quizId,
      questionId: r.questionId,
      score: r.score,
    }))
  );

  return NextResponse.json({ quizId, slug });
}
