import { NextResponse } from "next/server";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { drizzle } from "drizzle-orm/d1";
import { eq, and } from "drizzle-orm";
import { nanoid } from "nanoid";
import { getSession } from "@/lib/session";
import { getStripe, REPORT_PRICE_CENTS } from "@/lib/stripe";
import * as schema from "@/db/schema";

export async function GET(request: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const url = new URL(request.url);
  const quizId = url.searchParams.get("quizId");

  if (!quizId) {
    return NextResponse.json({ error: "Missing quizId" }, { status: 400 });
  }

  const { env } = await getCloudflareContext({ async: true });
  const db = drizzle(env.DB, { schema });

  // Verify quiz ownership
  const quiz = await db
    .select()
    .from(schema.quizzes)
    .where(
      and(
        eq(schema.quizzes.id, quizId),
        eq(schema.quizzes.userId, session.user.id)
      )
    )
    .limit(1);

  if (quiz.length === 0) {
    return NextResponse.json({ error: "Quiz not found" }, { status: 404 });
  }

  // Require at least 3 friend responses before allowing purchase
  if (quiz[0]!.responseCount < 3) {
    return NextResponse.json(
      { error: "Need at least 3 friend responses before purchasing a report" },
      { status: 403 }
    );
  }

  // Check if already purchased
  const existing = await db
    .select()
    .from(schema.purchases)
    .where(
      and(
        eq(schema.purchases.quizId, quizId),
        eq(schema.purchases.userId, session.user.id),
        eq(schema.purchases.status, "completed")
      )
    )
    .limit(1);

  if (existing.length > 0) {
    // Already purchased, redirect to report
    return NextResponse.redirect(
      new URL(`/dashboard/${quizId}/report`, request.url)
    );
  }

  const appUrl = env.APP_URL ?? "http://localhost:8787";
  const isProduction = env.ENVIRONMENT === "production";

  // In dev: skip Stripe entirely, mark purchase as completed immediately
  if (!isProduction) {
    const purchaseId = nanoid(21);
    await db.insert(schema.purchases).values({
      id: purchaseId,
      userId: session.user.id,
      quizId,
      amountCents: REPORT_PRICE_CENTS,
      status: "completed",
    });
    return NextResponse.redirect(
      new URL(`/purchase/success?quizId=${quizId}`, request.url),
      303
    );
  }

  const stripeKey = env.STRIPE_SECRET_KEY;
  if (!stripeKey) {
    return NextResponse.json(
      { error: "Stripe not configured" },
      { status: 500 }
    );
  }

  const stripe = getStripe(stripeKey);

  // Create a pending purchase record
  const purchaseId = nanoid(21);
  await db.insert(schema.purchases).values({
    id: purchaseId,
    userId: session.user.id,
    quizId,
    amountCents: REPORT_PRICE_CENTS,
    status: "pending",
  });

  // Create Stripe Checkout session
  const checkoutSession = await stripe.checkout.sessions.create({
    mode: "payment",
    payment_method_types: ["card"],
    line_items: [
      {
        price_data: {
          currency: "usd",
          product_data: {
            name: "MirrorQuiz Detailed Report",
            description:
              "Trait-by-trait breakdown, blind spots, and hidden strengths",
          },
          unit_amount: REPORT_PRICE_CENTS,
        },
        quantity: 1,
      },
    ],
    metadata: {
      purchaseId,
      quizId,
      userId: session.user.id,
    },
    success_url: `${appUrl}/purchase/success?quizId=${quizId}`,
    cancel_url: `${appUrl}/dashboard/${quizId}/report`,
    customer_email: session.user.email,
  });

  // Store the Stripe session ID on our purchase record
  await db
    .update(schema.purchases)
    .set({ stripeSessionId: checkoutSession.id })
    .where(eq(schema.purchases.id, purchaseId));

  return NextResponse.redirect(checkoutSession.url!, 303);
}
