import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { drizzle } from "drizzle-orm/d1";
import { eq } from "drizzle-orm";
import { nanoid } from "nanoid";
import { getSession } from "@/lib/session";
import { initAuth } from "@/lib/auth";
import { checkRateLimit, isRateLimitConfigured } from "@/lib/rate-limit";
import * as schema from "@/db/schema";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Deferred-signup claim: called after an anonymous visitor finishes the quiz
 * and enters their email. Records a claim (email → anonymous user) and sends
 * the magic link. The quiz stays usable in the current session either way —
 * the magic link is only needed to get back in later or on another device.
 */
export async function POST(request: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await request.json()) as { email?: string; name?: string };
  const email = body.email?.trim().toLowerCase();
  const name = body.name?.trim().slice(0, 50);

  if (!email || !EMAIL_RE.test(email) || email.length > 254) {
    return NextResponse.json({ error: "Enter a valid email address" }, { status: 400 });
  }

  // Rate limit magic-link sends (3 per 15 min per user) — fail-secure in prod
  const { env } = await getCloudflareContext({ async: true });
  const isProduction = env.ENVIRONMENT === "production";
  if (isRateLimitConfigured(env)) {
    const result = await checkRateLimit(
      "magicLink",
      session.user.id,
      env.UPSTASH_REDIS_REST_URL!,
      env.UPSTASH_REDIS_REST_TOKEN!
    );
    if (!result.success) {
      return NextResponse.json(
        { error: "Too many attempts. Try again in a few minutes." },
        { status: 429 }
      );
    }
  } else if (isProduction) {
    return NextResponse.json(
      { error: "Service temporarily unavailable" },
      { status: 503 }
    );
  }

  const db = drizzle(env.DB, { schema });

  // Only anonymous sessions need a claim; signed-in users already own their quizzes.
  const isAnonymous =
    (session.user as { isAnonymous?: boolean | null }).isAnonymous === true;

  if (isAnonymous) {
    // One claim per anonymous user — resubmitting replaces the previous email.
    await db
      .delete(schema.quizClaims)
      .where(eq(schema.quizClaims.anonymousUserId, session.user.id));
    await db.insert(schema.quizClaims).values({
      id: nanoid(21),
      email,
      anonymousUserId: session.user.id,
    });
  }

  const auth = await initAuth();
  await auth.api.signInMagicLink({
    body: { email, name, callbackURL: "/dashboard" },
    headers: await headers(),
  });

  return NextResponse.json({ success: true });
}
